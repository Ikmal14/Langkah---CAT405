import React, { useEffect, useState, useRef, useCallback } from 'react';
import { SafeAreaView, StyleSheet, View, Text, PermissionsAndroid } from 'react-native';
import MapView, { Marker, Callout } from 'react-native-maps';
import { Searchbar } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import Geolocation from 'react-native-geolocation-service';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import BottomSheet, { BottomSheetView } from '@gorhom/bottom-sheet';

const MapScreen = () => {
  const [location, setLocation] = useState(null);
  const navigation = useNavigation();
  const [searchQuery, setSearchQuery] = useState('');
  const onChangeSearch = query => setSearchQuery(query);
  const bottomSheetRef = useRef(null);
  const [selectedStation, setSelectedStation] = useState(null);

  const requestLocationPermission = async () => {
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
      );
      if (granted === PermissionsAndroid.RESULTS.GRANTED) {
        Geolocation.getCurrentPosition(
          position => {
            const { latitude, longitude } = position.coords;
            setLocation({ latitude, longitude });
          },
          error => {
            console.log(error.code, error.message);
          },
          { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
        );
      } else {
        console.log('Location permission denied');
      }
    } catch (err) {
      console.warn(err);
    }
  };

  useEffect(() => {
    requestLocationPermission();
  }, []);

  const handleCalloutPress = (station) => {
    navigation.navigate('StationScreen', { station });
  };

  const handleMarkerPress = (station) => {
    setSelectedStation(station);
    bottomSheetRef.current?.expand();
  };

  const handleSheetChanges = useCallback((index) => {
    if (index === -1) {
      setSelectedStation(null);
    }
  }, []);

  return (
    <GestureHandlerRootView style={styles.container}>
      <Searchbar
        placeholder="Search"
        onChangeText={onChangeSearch}
        value={searchQuery}
        onFocus={() => navigation.navigate('Search')}
      />
      <MapView
        style={styles.map}
        region={{
          latitude: location ? location.latitude : 0,
          longitude: location ? location.longitude : 0,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        }}
      >
        {location && (
          <Marker coordinate={location}>
            <Callout onPress={() => handleMarkerPress({
              name: 'Your Location',
              line: 'N/A',
              status: 'N/A',
              congestion: 'N/A',
            })}>
              <View>
                <Text>Your Location</Text>
              </View>
            </Callout>
          </Marker>
        )}
        <Marker coordinate={{ latitude: 5.4164, longitude: 100.3327 }}>
          <Callout onPress={() => handleMarkerPress({
            name: 'Station Name',
            line: 'Station Line',
            status: 'Operational',
            congestion: 'Moderate',
          })}>
            <View>
              <Text>Test</Text>
            </View>
          </Callout>
        </Marker>
      </MapView>
      <BottomSheet
        ref={bottomSheetRef}
        index={-1}
        snapPoints={['25%', '50%']}
        onChange={handleSheetChanges}
      >
        <BottomSheetView style={styles.contentContainer}>
          {selectedStation ? (
            <>
              <Text style={styles.stationName}>{selectedStation.name}</Text>
              <Text style={styles.stationDetails}>Line: {selectedStation.line}</Text>
              <Text style={styles.stationDetails}>Status: {selectedStation.status}</Text>
              <Text style={styles.stationDetails}>Congestion: {selectedStation.congestion}</Text>
            </>
          ) : (
            <Text style={styles.placeholderText}>No Station Selected</Text>
          )}
        </BottomSheetView>
      </BottomSheet>
    </GestureHandlerRootView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
  contentContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stationName: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  stationDetails: {
    fontSize: 16,
    marginVertical: 4,
  },
  placeholderText: {
    fontSize: 16,
    color: 'gray',
  },
});

export default MapScreen;
