import React, { useState, useMemo, useRef, useCallback, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, FlatList } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import BottomSheet, { BottomSheetView } from '@gorhom/bottom-sheet';
import Icon from 'react-native-vector-icons/MaterialIcons';

const SearchScreen = ({ onSearch }) => {
  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');
  const [originStation, setOriginStation] = useState(null);
  const [destinationStation, setDestinationStation] = useState(null);
  const [filteredStations, setFilteredStations] = useState([]);
  const [searchType, setSearchType] = useState(null);
  const { stations } = useSelector((state) => state.location);
  const navigation = useNavigation();
  const bottomSheetRef = useRef(null);

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
      setSearchType(null);
    } else if (type === 'destination') {
      setDestination(station.station_name);
      setDestinationStation(station);
      setSearchType(null);
    }
    setFilteredStations([]);
  };

  const handleSearch = () => {
    if (originStation && destinationStation) {
      onSearch([originStation, destinationStation]);
      setFilteredStations([originStation, destinationStation]);
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
      <Text style={styles.stationName}>{item.station_name}</Text>
      <Text style={styles.stationDetails}>Line: {item.line}</Text>
    </TouchableOpacity>
  );

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
                {filteredStations.map(station => (
                  <TouchableOpacity key={station.id} onPress={() => handleStationSelect(station, 'origin')}>
                    <Text style={styles.suggestionText}>{station.station_name}</Text>
                  </TouchableOpacity>
                ))}
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
                {filteredStations.map(station => (
                  <TouchableOpacity key={station.id} onPress={() => handleStationSelect(station, 'destination')}>
                    <Text style={styles.suggestionText}>{station.station_name}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
          <TouchableOpacity onPress={handleSearch} style={styles.searchButton}>
            <Icon name="search" size={24} color="white" />
          </TouchableOpacity>
        </View>
        <FlatList
          data={filteredStations}
          renderItem={renderItem}
          keyExtractor={(item) => item.id.toString()}
        />
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
});

export default SearchScreen;
