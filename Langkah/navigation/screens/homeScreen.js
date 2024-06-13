import React, { useEffect, useState, useRef, useMemo, useCallback } from 'react';
import { View, ScrollView, Text, TouchableOpacity, Animated, StyleSheet } from 'react-native';
import MapView, { Marker, Callout, Polyline } from 'react-native-maps';
import { useRoute } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import Geolocation from 'react-native-geolocation-service';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { fetchLocations, fetchOutputStations } from '../../services/locationSlice';
import SearchScreen from './searchScreen';
import Legend from './Legend';
import messaging from '@react-native-firebase/messaging';


const HomeScreen = () => {
  const [userLocation, setUserLocation] = useState(null); // User location state
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
  const polylineCoordinates = (displayedStations || []).map((station) => ({
    latitude: station.latitude,
    longitude: station.longitude,
  }));


  useEffect(() => {
    dispatch(fetchLocations());
    dispatch(fetchOutputStations());

    Geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setUserLocation({ latitude, longitude });
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

    const watchId = Geolocation.watchPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setUserLocation({ latitude, longitude });
      },
      (error) => console.error(error),
      { enableHighAccuracy: true, distanceFilter: 10, interval: 500 }
    );

    const interval = setInterval(() => {
      dispatch(fetchLocations());
    }, 600000);

    return () => {
      clearInterval(interval);
      Geolocation.clearWatch(watchId); // Clear the watch when the component unmounts
    };
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

  const renderMarkers = () => (
    <>
      {userLocation && (
        <Marker coordinate={userLocation}>
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
                    {station.station_name || 'No Name'}
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
      {intervals.map((intervalId, index) => {
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
    </>
  );

  return (
    <GestureHandlerRootView style={styles.container}>
      <Text style={styles.headerText}>Langkah</Text>
      <View style={styles.filterContainer}>
        <Text style={styles.filterLabel}>Line:</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScroll}>
  {lines.map((line) => (
    <TouchableOpacity
      key={line}
      style={[
        styles.filterButton,
        line === selectedLine && {
          backgroundColor: lineColors[line],
          borderColor: lineColors[line],
        },
      ]}
      onPress={() => handleLineFilter(line)}
    >
      <Text
        style={[
          styles.filterText,
          line === selectedLine ? { color: 'white' } : { color: lineColors[line] },
        ]}
      >
        {line}
      </Text>
    </TouchableOpacity>
  ))}
</ScrollView>
      </View>
      <MapView
        style={styles.maps}
        region={region || {
          latitude: 3.139,
          longitude: 101.6869,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        }}
      >
        {renderMarkers()}
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
  headerText: {
    textAlign: 'center',
    fontSize: 22,
    fontWeight: 'bold',
    paddingVertical: 15,
    backgroundColor: '#f5f5f5',
    borderBottomWidth: 1,
    borderColor: '#e0e0e0',
  },
  filterContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderColor: '#e0e0e0',
  },
  filterLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    marginRight: 10,
    paddingLeft: 10,
  },
  filterScroll: {
    paddingHorizontal: 10,
  },
  filterButton: {
    marginHorizontal: 5,
    marginVertical: 5,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#ccc',
    backgroundColor: 'white',
  },
  selectedFilterButton: {
    backgroundColor: (lineColors, selectedLine) => (lineColors[selectedLine] || '#000'),
  },
  filterText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  selectedFilterText: {
    color: 'white',
  },
  maps: {
    flex: 1,
    zIndex: -1,
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
