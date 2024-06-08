import React, { useEffect, useState, useRef, useMemo, useCallback } from 'react';
import { View, ScrollView, Text, TouchableOpacity, Animated, StyleSheet } from 'react-native';
import MapView, { Marker, Callout } from 'react-native-maps';
import { useRoute } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import Geolocation from 'react-native-geolocation-service';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { fetchLocations, fetchOutputStations } from '../../services/locationSlice';
import SearchScreen from './searchScreen';
import Legend from './Legend';

const HomeScreen = () => {
  const [location, setLocation] = useState(null);
  const [selectedLine, setSelectedLine] = useState(null);
  const [filteredStations, setFilteredStations] = useState([]);
  const [region, setRegion] = useState(null);
  const [intervals, setIntervalsData] = useState([]);
  const [selectedMarkerId, setSelectedMarkerId] = useState(null);
  const breathingAnimation = useRef(new Animated.Value(1)).current;
  const dispatch = useDispatch();
  const { stations, outputStations = [] } = useSelector((state) => state.location);
  const route = useRoute();

  const lines = ['Kelana Jaya', 'Sri Petaling ', 'Ampang', 'Kajang', 'Putrajaya', 'Monorail'];

  useEffect(() => {
    dispatch(fetchLocations());
    dispatch(fetchOutputStations());

    Geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setLocation({ latitude, longitude });
        setRegion({
          latitude,
          longitude,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        });
      },
      (error) => console.error(error),
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
    );

    const interval = setInterval(() => {
      dispatch(fetchLocations());
    }, 600000);

    return () => clearInterval(interval);
  }, [dispatch]);

  useEffect(() => {
    if (route.params?.intervals) {
      setIntervalsData(route.params.intervals);
    }
  }, [route.params]);

  const handleLineFilter = useCallback((line) => {
    setSelectedLine((prevLine) => (prevLine === line ? null : line));
  }, []);

  const handleSearch = useCallback((selectedStations) => {
    setFilteredStations(selectedStations);
    setSelectedLine(null);

    if (selectedStations.length === 2) {
      const minLat = Math.min(selectedStations[0].latitude, selectedStations[1].latitude);
      const maxLat = Math.max(selectedStations[0].latitude, selectedStations[1].latitude);
      const minLon = Math.min(selectedStations[0].longitude, selectedStations[1].longitude);
      const maxLon = Math.max(selectedStations[0].longitude, selectedStations[1].longitude);

      setRegion({
        latitude: (minLat + maxLat) / 2,
        longitude: (minLon + maxLon) / 2,
        latitudeDelta: (maxLat - minLat) * 1.5,
        longitudeDelta: (maxLon - minLon) * 1.5,
      });
    }
  }, []);

  const resetInputs = useCallback(() => {
    setFilteredStations([]);
    setSelectedLine(null);
    setIntervalsData([]);
  }, []);

  const displayedStations = useMemo(() => {
    if (filteredStations.length > 0) {
      return filteredStations;
    }
    if (selectedLine) {
      return stations.filter((station) => station.line === selectedLine);
    }
    return stations;
  }, [stations, selectedLine, filteredStations]);

  const handleMarkerPress = (markerId) => {
    setSelectedMarkerId(markerId);
  };

  const lineColors = {
    'Putrajaya': '#ffdc49',
    'Kajang': '#007940',
    'Monorail': '#78b13e',
    'Kelana Jaya': '#db1e36',
    'Sri Petaling ': '#7a2631',
    'Ampang': '#e67425',
  };

  const crowdLevels = {
    'Busier than usual': { score: 10, color: '#701a5a', thickness: 10 },
    'As busy as it gets': { score: 5, color: '#a32683', thickness: 7.5 },
    'Not too busy': { score: 3, color: '#cf30a6', thickness: 5 },
    'A little busy': { score: 2, color: '#ff3dce', thickness: 5 },
  };

  return (
    <GestureHandlerRootView style={styles.container}>
      <View style={styles.filterContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {lines.map((line) => (
            <TouchableOpacity
              key={line}
              style={[
                styles.filterButton,
                line === selectedLine && styles.selectedFilterButton,
                { borderColor: '#000', borderWidth: 1 }
              ]}
              onPress={() => handleLineFilter(line)}
            >
              <Text
                style={[
                  styles.filterText,
                  { color: lineColors[line] },
                  line === selectedLine && styles.selectedFilterText,
                ]}
              >
                {line}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
      <MapView
        style={styles.map}
        region={region || {
          latitude: 3.139,
          longitude: 101.6869,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        }}
      >
        {location && (
          <Marker coordinate={location}>
            <Animated.View style={[styles.liveLocationMarker, { transform: [{ scale: breathingAnimation }] }]}>
              <View style={styles.innerCircle} />
            </Animated.View>
          </Marker>
        )}
        {displayedStations.map((station) => {
          const crowdInfo = crowdLevels[station.crowd_status] || {};
          const crowdColor = crowdInfo.color || '#ffffff';
          const crowdThickness = crowdInfo.thickness || 3;

          return (
            <Marker
              key={station.id}
              tracksViewChanges={false}
              coordinate={{ latitude: station.latitude, longitude: station.longitude }}
              onPress={() => handleMarkerPress(station.id)}
            >
              <View style={styles.stationMarkerContainer}>
                <View style={[styles.stationMarker, { borderColor: crowdColor, borderWidth: crowdThickness }]}>
                  <View style={[styles.stationMarkerInner, { backgroundColor: lineColors[station.line] }]} />
                </View>
              </View>
              <Callout>
                <View style={styles.calloutContainer}>
                  <Text style={styles.calloutText}>
                    Station: <Text style={[styles.stationNameText, { color: lineColors[station.line] }]}>
                      {station.station_name ? station.station_name : 'No Name'}
                    </Text>
                  </Text>
                  <Text style={[styles.calloutText, styles.crowdStatus]}>
                    Crowd: <Text style={styles.crowdStatusText}>{station.crowd_status || 'Unknown'}</Text>
                  </Text>
                </View>
              </Callout>
            </Marker>
          );
        })}
        {intervals && intervals.map((intervalId, index) => {
          const intervalStation = stations.find(station => station.id === intervalId);
          return intervalStation ? (
            <Marker
              key={`interval-${index}`}
              tracksViewChanges={false}
              coordinate={{
                latitude: intervalStation.latitude,
                longitude: intervalStation.longitude,
              }}
            >
              <View style={styles.intervalMarker} />
            </Marker>
          ) : null;
        })}
      </MapView>
      <Legend />
      <SearchScreen
        onSearch={handleSearch}
        onReset={resetInputs}
        filter={{ setFilteredStations, filteredStations }}
      />
    </GestureHandlerRootView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    flex: 1,
    zIndex: -1,
  },
  filterContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 10,
    backgroundColor: '#fff',
  },
  filterButton: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 15,
    marginHorizontal: 5,
  },
  selectedFilterButton: {
    backgroundColor: '#000',
  },
  filterText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  selectedFilterText: {
    color: '#fff',
  },
  liveLocationMarker: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: 'rgba(0, 128, 255, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  innerCircle: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: 'rgba(0, 128, 255, 1)',
  },
  stationMarkerContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  stationMarker: {
    width: 25,
    height: 25,
    borderRadius: 12.5,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  stationMarkerInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  intervalMarker: {
    width: 15,
    height: 15,
    borderRadius: 7.5,
    backgroundColor: 'grey',
  },
  calloutContainer: {
    width: 280,
    padding: 10,
    flexDirection: 'column',
    alignItems: 'flex-start',
  },
  calloutText: {
    fontSize: 16,
    fontWeight: 'bold',
    flexWrap: 'wrap',
    marginBottom: 5,
  },
  stationNameText: {},
  crowdStatus: {
    fontSize: 14,
    marginTop: 5,
    flexWrap: 'wrap',
  },
  crowdStatusText: {
    color: 'red',
    fontWeight: 'bold',
  },
});

export default HomeScreen;
