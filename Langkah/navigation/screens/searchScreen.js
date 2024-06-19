// searchScreen.js
import React, { useState, useMemo, useRef, useCallback, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Keyboard } from 'react-native';
import CheckBox from '@react-native-community/checkbox';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import BottomSheet, { BottomSheetView } from '@gorhom/bottom-sheet';
import Icon from 'react-native-vector-icons/MaterialIcons';
import Geolocation from 'react-native-geolocation-service';
import { FlatList, ScrollView } from 'react-native-gesture-handler';
import FloatingWindow from './FloatingWindow'; // Import FloatingWindow component
import { startJourneyTracking } from './journeyTracker';  // Import the new journeyTracker module


const SearchScreen = ({ onSearch, onReset, filter }) => {
  // State Management
  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');
  const [originStation, setOriginStation] = useState(null);
  const [destinationStation, setDestinationStation] = useState(null);
  const [filteredStations, setFilteredStations] = useState([]);
  const [searchType, setSearchType] = useState(null);
  const [selectedRoute, setSelectedRoute] = useState(null);
  const [avoidBusyStations, setAvoidBusyStations] = useState(false);
  const [intervalsData, setIntervalsData] = useState([]);
  const [showStationInfo, setShowStationInfo] = useState(true);
  const [showFloatingWindow, setShowFloatingWindow] = useState(false);
  const [currentStation, setCurrentStation] = useState('');
  const [nextStation, setNextStation] = useState('');

  // Refs and Navigation
  const bottomSheetRef = useRef(null);
  const navigation = useNavigation();

  // Selectors
  const { stations = [] } = useSelector((state) => state.location);

  // Constants
  const lineColors = {
    'Putrajaya': '#ffdc49',
    'Kajang': '#007940',
    'Monorail': '#78b13e',
    'Kelana Jaya': '#db1e36',
    'Sri Petaling ': '#7a2631',
    'Ampang': '#e67425',
  };

  // Callbacks
  const handleStationPress = useCallback((station) => {
    navigation.navigate('StationScreen', { station });
  }, [navigation]);

  const startJourney = () => {
    if (selectedRoute && selectedRoute.intervals.length > 0) {
      setShowFloatingWindow(true);
      startJourneyTracking(selectedRoute.intervals, stations, setCurrentStation, setNextStation, () => {
        setShowFloatingWindow(false);
      });
    }
  };

  const uniqueStations = useMemo(() => {
    const stationMap = {};
    stations.forEach((station) => {
      if (!stationMap[station.station_name]) {
        stationMap[station.station_name] = station;
      }
    });
    return Object.values(stationMap);
  }, [stations]);

  // Effects
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

  // Handlers
  const handleInputChange = (input, type) => {
    if (type === 'origin') {
      setOrigin(input);
      setSearchType('origin');
    } else if (type === 'destination') {
      setDestination(input);
      setSearchType('destination');
    }
  };

  const handleStationSelect = (station, type) => {
    if (type === 'origin') {
      setOrigin(station.station_name);
      setOriginStation(station);
    } else if (type === 'destination') {
      setDestination(station.station_name);
      setDestinationStation(station);
    }
    setSearchType(null);
    setFilteredStations([]);
  };

  const swapInputs = () => {
    setOrigin(destination);
    setDestination(origin);
    setOriginStation(destinationStation);
    setDestinationStation(originStation);
  };

  const resetInputs = () => {
    setOrigin('');
    setDestination('');
    setOriginStation(null);
    setDestinationStation(null);
    setSearchType(null);
    filter.setFilteredStations([]);
    setSelectedRoute(null);
    onReset();
  };

  const handleSearch = async () => {
    Keyboard.dismiss();
  
    if (originStation && destinationStation) {
      try {
        const response = await fetch('localhost/calculate-path', { //edit your ip adress and port
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            origin: originStation.id,
            destination: destinationStation.id,
            avoidBusy: avoidBusyStations,
          }),
        });
  
        if (!response.ok) throw new Error('Failed to calculate path');
  
        const intervalsId = await response.json();
        intervalsId.interval.pop();
        const intervals = intervalsId.interval.map(station_id => {
          return stations.find(station => station.id === station_id)?.station_name || '';
        });
  
        navigation.navigate('Langkah', { intervals: intervalsId.interval });
        setIntervalsData(intervalsId.interval);
        setSelectedRoute({ origin: originStation, destination: destinationStation, intervals: intervalsId.interval });
        onSearch([originStation, destinationStation]);
        setShowStationInfo(false);  // Hide the FlatList and show renderIntervals
      } catch (error) {
        console.error('Error calculating path:', error);
      }
    }
  };

  const trackUserLocation = () => {
    Geolocation.watchPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        checkProximityToDestination(latitude, longitude);
      },
      (error) => {
        console.error(error);
      },
      {
        enableHighAccuracy: true,
        distanceFilter: 10,
        interval: 10000,
      }
    );
    return (console.log("You are near your destination"));
  };

  const checkProximityToDestination = (latitude, longitude) => {
    // const destination = selectedRoute.intervals[selectedRoute.intervals.length - 1];
    // const secondLastStation = selectedRoute.intervals[selectedRoute.intervals.length - 2];
    // const secondLastStationData = stations.find(station => station.id === secondLastStation);

    // const distanceToSecondLastStation = getDistanceFromLatLonInKm(latitude, longitude, secondLastStationData.latitude, secondLastStationData.longitude);

    // if (distanceToSecondLastStation < 0.5) {
    //   showNotification();
    // }
    return (console.log("You are near your destination"));
  };

  const showNotification = () => {
    const fireDate = ReactNativeAN.parseDate(new Date(Date.now()));
    const alarmNotifData = {
      title: "Langkah App",
      message: "You are near your destination",
      channel: "langkah-channel",
      small_icon: "ic_launcher",
      fire_date: fireDate,
    };

    ReactNativeAN.scheduleAlarm(alarmNotifData);
  };

  // Render Functions
  const renderStationInfo = ({ item }) => {
    return (
      <View style={styles.stationItem}>
        <Text style={styles.stationName}>{item.station_name}</Text>
        <Text style={styles.stationDetails}>Crowd Status: {item.crowd_status}</Text>
      </View>
    );
  };


  const renderIntervals = () => {
    if (!selectedRoute) return null;
    const { origin, destination, intervals } = selectedRoute;
    const intervalNames = intervals.map(interval => {
      const station = stations.find(s => s.id === interval);
      return station ? station.station_name : null;
    });

    return (
      <View style={styles.intervalContainer}>
        <Text style={styles.bottomSheetTitle}>Interval Stations</Text>
      {avoidBusyStations ? (<Text style={{color: 'red'}}>Avoiding Busy Station</Text>) : null}
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
          const isTransit = currentStation.line !== nextStation?.line;
          const lineName = currentStation?.line;
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
          <TouchableOpacity style={styles.startJourneyButton} onPress={startJourney}>
            <Text style={styles.startJourneyButtonText}>Start Journey</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  // JSX
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
        </View>
        <View style={styles.buttonContainer}>
          <TouchableOpacity onPress={handleSearch} style={styles.searchButton}>
            <Icon name="search" size={24} color="white" />
            <Text style={styles.searchButtonText}>Search</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={resetInputs} style={styles.resetButton}>
            <Icon name="clear" size={24} color="white" />
            <Text style={styles.resetButtonText}>Reset</Text>
          </TouchableOpacity>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginVertical: 10 }}>
          <CheckBox value={avoidBusyStations} onValueChange={setAvoidBusyStations} />
          <Text>Avoid Busy Stations</Text>
        </View>
        {showStationInfo ? (
          <FlatList
            data={stations}
            renderItem={renderStationInfo}
            keyExtractor={item => item.id.toString()}
            style={styles.stationList}
          />
        ) : (
          <ScrollView>
            {renderIntervals()}
          </ScrollView>
        )}
        {/* {showFloatingWindow && (
          <FloatingWindow
            currentStation={currentStation}
            nextStation={nextStation}
            onClose={() => setShowFloatingWindow(false)}
          />
        )} */}
      </BottomSheetView>
    </BottomSheet>
  );  
};

// Styles
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
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 10,
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
    backgroundColor: '#1E90FF', // DodgerBlue color
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: 150,
  },
  searchButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  resetButton: {
    backgroundColor: '#FF4500', // OrangeRed color
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: 150,
  },
  resetButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  stationList: {
    flex: 1 , // Adjust height as needed
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
  intervalName: {
    fontSize: 16,
    color: 'white',
  },
  boldText: {
    fontWeight: 'bold',
  },
  bottomSheetTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginVertical: 10,
  },
  lineName: {
    fontStyle: 'italic',
    color: 'white',
  },
  stationContainer: {
    backgroundColor: 'transparent',
    borderRadius: 25,
    padding: 5,
    alignItems: 'center'
  },
  startJourneyButton: {
    backgroundColor: 'green',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 20,
  },
  startJourneyButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default SearchScreen;
