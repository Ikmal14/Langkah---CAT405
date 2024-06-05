import React, { useState, useMemo, useRef, useCallback, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, FlatList } from 'react-native';
import CheckBox from '@react-native-community/checkbox';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import BottomSheet, { BottomSheetView, BottomSheetScrollView } from '@gorhom/bottom-sheet';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { fetchLocations, fetchOutputStations, fetchCrowdData } from '../../services/locationSlice';
import { ScrollView } from 'react-native-gesture-handler';

const SearchScreen = ({ onSearch, onReset, filter }) => {
  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');
  const [originStation, setOriginStation] = useState(null);
  const [destinationStation, setDestinationStation] = useState(null);
  const [filteredStations, setFilteredStations] = useState([]);
  const [searchType, setSearchType] = useState(null);
  const { stations, outputStations = [] } = useSelector((state) => state.location);
  const bottomSheetRef = useRef(null);
  const [selectedRoute, setSelectedRoute] = useState(null);
  const [stationIdToNameMap, setStationIdToNameMap] = useState({});
  const [avoidBusyStations, setAvoidBusyStations] = useState(false);
  const [intervalsData, setIntervalsData] = useState([]);
  const navigation = useNavigation();
  
  const lineColors = {
    'Putrajaya': '#ffdc49',
    'Kajang': '#007940',
    'Monorail': '#78b13e',
    'Kelana Jaya': '#db1e36',
    'Sri Petaling ': '#7a2631',
    'Ampang': '#e67425',
  };

  const handleStationPress = useCallback((station) => {
    navigation.navigate('StationScreen', { station });
  }, [navigation]);

  const uniqueStations = useMemo(() => {
    const stationMap = {};
    stations.forEach((station) => {
      if (!stationMap[station.station_name]) {
        stationMap[station.station_name] = station;
      }
    });
    return Object.values(stationMap);
  }, [stations]);

  useEffect(() => {
    if (searchType === 'origin' && origin) {
      setFilteredStations(stations.filter(station => station.station_name.toLowerCase().includes(origin.toLowerCase())));
    } else if (searchType === 'destination' && destination) {
      setFilteredStations(stations.filter(station => station.station_name.toLowerCase().includes(destination.toLowerCase())));
    } else {
      setFilteredStations([]);
    }
  }, [origin, destination, searchType, stations]);

  useEffect(() => {
    if (originStation && destinationStation) {
      bottomSheetRef.current?.snapToIndex(1);
    }
  }, [originStation, destinationStation]);

  const handleInputChange = (input, type) => {
    if (type === 'origin') {
      setOrigin(input);
      setSearchType('origin');
    } else if (type === 'destination') {
      setDestination(input);
      setSearchType('destination');
    }
  };

  const resetInputs = () => {
    setOrigin('');
    setDestination('');
    setOriginStation(null);
    setDestinationStation(null);
    setSearchType(null);
    filter.setFilteredStations([]);
    setSelectedRoute(null);
    onReset(); // Call the onReset prop
  };

  const handleStationSelect = (station, type) => {
    if (type === 'origin') {
      setOrigin(station.station_name);
      setOriginStation(station);
      setSearchType(null);
    } else if (type === 'destination') {
      setDestination(station.station_name);
      setDestinationStation(station);
      setSearchType(null);
    }
    setFilteredStations([]);
  };

  const handleSearch = async () => {
    if (originStation && destinationStation) {
      try {
        const response = await fetch('http://10.207.154.227:3000/calculate-path', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            origin: originStation.id,
            destination: destinationStation.id,
            avoidBusy: avoidBusyStations, // Include the checkbox state here
          }),
        });
        if (!response.ok) {
          throw new Error('Failed to calculate path');
        }
        console.log(avoidBusyStations);
        const intervalsId = await response.json();
        console.log(intervalsId.message); // Log success message
        console.log(intervalsId.interval);
        
        // intervalsId.interval.shift();
        intervalsId.interval.pop();
  
        const intervals = intervalsId.interval.map(station_id => {
          const stationName = stations.find(station => station.id === station_id)?.station_name || '';
          return stationName;
        });
  
        // Navigate to HomeScreen with intervals
        navigation.navigate('Langkah', { intervals: intervalsId.interval });
  
        setIntervalsData(intervalsId.interval);
        setSelectedRoute({ origin: originStation, destination: destinationStation, intervals: intervalsId.interval });
        onSearch([originStation, destinationStation]);
  
      } catch (error) {
        console.error('Error calculating path:', error);
      }
    }
  };
  

  const swapInputs = () => {
    const temp = origin;
    setOrigin(destination);
    setDestination(temp);
    const tempStation = originStation;
    setOriginStation(destinationStation);
    setDestinationStation(tempStation);
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity style={styles.stationItem} onPress={() => handleStationPress(item)}>
      <Text style={styles.stationName}>{item.station_name} ({item.line})</Text>
      <Text style={styles.stationDetails}>Line: {item.line}</Text>
    </TouchableOpacity>
  );

  const renderIntervals = () => {
  if (!selectedRoute) return null;

  const { origin, destination, intervals } = selectedRoute;

  // Convert interval IDs to station names
  const intervalNames = intervals.map(interval => {
    const station = stations.find(s => s.id === interval);
    return station ? station.station_name : null;
  });

  return (
    <View style={styles.intervalContainer}>
      <View style={{ alignItems: 'center' }}>
        <Text style={[styles.boldText, { textAlign: 'center' }]}>{origin.station_name}</Text>
        <Text style={[{ textAlign: 'center', color: lineColors[origin.line] || 'black' }]}>
          {origin.line}
        </Text>
      </View>
      {intervalNames.length > 0 && (
        <View style={{ alignItems: 'center' }}>
          <Icon name={origin.station_name === intervalNames[0] && origin.line !== stations.find(station => station.id === intervals[0])?.line ? "directions-walk" : "arrow-downward"} size={24} color="black" />
        </View>
      )}
      {intervals.map((interval, index) => {
        const currentStation = stations.find(station => station.id === interval);
        const nextStation = stations.find(station => station.id === intervals[index + 1]);

        // Determine if this is a transit based on different line names
        const isTransit = currentStation.line !== nextStation?.line;

        // Get the line name for the current station
        const lineName = currentStation?.line;

        // Set background color based on the line name
        const backgroundColor = lineColors[lineName] || 'transparent';

        return (
          <React.Fragment key={index}>
            <View style={[styles.stationContainer, { backgroundColor }]}>
              <View style={{ alignItems: 'center' }}>
                <Text style={styles.intervalName}>{currentStation.station_name}</Text>
                <Text style={styles.lineName}>{lineName}</Text>
              </View>
            </View>
            {nextStation && (
              <View style={{ alignItems: 'center' }}>
                <Icon name={isTransit ? "directions-walk" : "arrow-downward"} size={24} color="black" />
              </View>
            )}
          </React.Fragment>
        );
      })}
      {intervalNames.length > 0 && (
        <View style={{ alignItems: 'center' }}>
          <Icon name={destination.station_name === intervalNames[intervalNames.length - 1] && destination.line !== stations.find(station => station.id === intervals[intervals.length - 1])?.line ? "directions-walk" : "arrow-downward"} size={24} color="black" />
        </View>
      )}
      <View style={{ alignItems: 'center' }}>
        <Text style={[styles.boldText, { textAlign: 'center' }]}>{destination.station_name}</Text>
        <Text style={[{ textAlign: 'center', color: lineColors[destination.line] || 'black' }]}>
          {destination.line}
        </Text>
      </View>
    </View>
  );
};

  
  

  return (
<BottomSheet ref={bottomSheetRef} index={0} snapPoints={['25%', '50%', '85%']}>
      <BottomSheetView style={styles.contentContainer}>
        <View style={styles.searchContainer}>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="Origin"
              value={origin}
              onChangeText={(text) => handleInputChange(text, 'origin')}
            />
            {searchType === 'origin' && filteredStations.length > 0 && (
              <View style={styles.suggestionContainer}>
                {filteredStations.map(station => {
                  const similarStations = filteredStations.filter(s => s.station_name === station.station_name);

                  return (
                    <TouchableOpacity key={station.id} onPress={() => handleStationSelect(station, 'origin')}>
                      <Text style={styles.suggestionText}>
                        {station.station_name}
                        {similarStations.length > 1 && ` (${station.line})`}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            )}
          </View>
          <TouchableOpacity onPress={swapInputs} style={styles.swapButton}>
            <Icon name="swap-vert" size={24} color="black" />
          </TouchableOpacity>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="Destination"
              value={destination}
              onChangeText={(text) => handleInputChange(text, 'destination')}
            />
            {searchType === 'destination' && filteredStations.length > 0 && (
              <View style={styles.suggestionContainer}>
                {filteredStations.map(station => {
                  const similarStations = filteredStations.filter(s => s.station_name === station.station_name);

                  return (
                    <TouchableOpacity key={station.id} onPress={() => handleStationSelect(station, 'destination')}>
                      <Text style={styles.suggestionText}>
                        {station.station_name}
                        {similarStations.length > 1 && ` (${station.line})`}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            )}
          </View>
          <TouchableOpacity onPress={handleSearch} style={styles.searchButton}>
            <Icon name="search" size={24} color="white" />
          </TouchableOpacity>
          <TouchableOpacity onPress={resetInputs} style={styles.searchButton}>
            <Icon name="clear" size={24} color="white" />
          </TouchableOpacity>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <CheckBox
            value={avoidBusyStations}
            onValueChange={setAvoidBusyStations}
          />
          <Text>Avoid Busy Stations</Text>
        </View>
    <ScrollView>
          <Text style={styles.bottomSheetTitle}>Interval Stations</Text>
          {renderIntervals()}
    </ScrollView>
      </BottomSheetView>
    </BottomSheet>
  );
};

const styles = StyleSheet.create({
  contentContainer: {
    flex: 1,
    padding: 16,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  inputContainer: {
    flex: 1,
  },
  input: {
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 4,
    paddingHorizontal: 8,
    marginRight: 8,
  },
  suggestionContainer: {
    position: 'absolute',
    top: 40,
    width: '100%',
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#ccc',
    zIndex: 1,
  },
  suggestionText: {
    padding: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  swapButton: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  searchButton: {
    backgroundColor: 'blue',
    padding: 10,
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stationItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  stationName: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  stationDetails: {
    fontSize: 14,
  },
  intervalContainer: {
    marginTop: 10,
  },
  intervalStation: {
    padding: 10,
    borderBottomWidth: 0,
    borderBottomColor: '#ccc',
    width: '100%',
    textAlign: 'center',
  },
  boldText: {
    fontWeight: 'bold',
  },
  bottomSheetTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginVertical: 10,
  },
  resetInputs: {
    backgroundColor: 'red',
    padding: 10,
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  lineName: {
    marginLeft: 5,
    fontStyle: 'italic',
    color: 'white',
  },
  stationContainer: {
    backgroundColor: 'transparent', 
    borderRadius: 25, 
    padding: 5,
    alignItems: 'center'
  },
  stationInfo: {
    backgroundColor: 'white', 
    borderRadius: 25, 
    padding: 5,
    alignItems: 'center'
  },
  intervalName: {
    fontSize: 16,
    color: 'white',
  },
});

export default SearchScreen;
