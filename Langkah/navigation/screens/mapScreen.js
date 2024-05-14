import React, { useEffect, useState } from 'react';
import { SafeAreaView, StyleSheet, View, PermissionsAndroid } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { Button, Searchbar } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import Geolocation from 'react-native-geolocation-service';

const MapScreen = () => {
  const [location, setLocation] = useState(null);
  const navigation = useNavigation();
  const [searchQuery, setSearchQuery] = useState('');
  const onChangeSearch = query => setSearchQuery(query);


  const requestLocationPermission = async () => {
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
      );
      if (granted === PermissionsAndroid.RESULTS.GRANTED) {
        console.log('You can use the location');
        Geolocation.getCurrentPosition(
          position => {
            const { latitude, longitude } = position.coords;
            setLocation({ latitude, longitude });
            console.log(`Latitude: ${latitude}, Longitude: ${longitude}`);
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

  return (
    <SafeAreaView style={styles.container}>
      <Searchbar
          placeholder="Search"
          onChangeText={onChangeSearch}
          value={searchQuery}
          onFocus={() => navigation.navigate('Search')}
        />
      <MapView style={styles.map} region={{
        latitude: location ? location.latitude : 0,
        longitude: location ? location.longitude : 0,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
      }}>
        {location && <Marker coordinate={location} />}
      </MapView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
});

export default MapScreen;