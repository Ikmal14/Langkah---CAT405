import React, { useEffect, useState, useRef, useCallback } from 'react';
import { SafeAreaView, StyleSheet, View, Text, FlatList } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { Searchbar } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import Geolocation from 'react-native-geolocation-service';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import BottomSheet, { BottomSheetView } from '@gorhom/bottom-sheet';
import { fetchLocations } from '../../services/locationSlice';

const HomeScreen = () => {
  const [location, setLocation] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const { stations } = useSelector((state) => state.location);
  const bottomSheetRef = useRef(null);

  const onChangeSearch = (query) => setSearchQuery(query);

  const requestLocationPermission = async () => {
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
      );
      if (granted === PermissionsAndroid.RESULTS.GRANTED) {
        Geolocation.getCurrentPosition(
          (position) => {
            const { latitude, longitude } = position.coords;
            setLocation({ latitude, longitude });
          },
          (error) => {
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
    dispatch(fetchLocations());

    const interval = setInterval(() => {
      dispatch(fetchLocations());
    }, 600000); // 10 minutes in milliseconds

    return () => clearInterval(interval); // Cleanup on unmount
  }, [dispatch]);

  const handleStationPress = (station) => {
    navigation.navigate('StationScreen', { station });
  };

  const renderItem = ({ item }) => (
    <View style={styles.stationItem} onPress={() => handleStationPress(item)}>
      <Text style={styles.stationName}>{item.station_name}</Text>
      <Text style={styles.stationDetails}>Line: {item.line}</Text>
      <Text style={styles.stationDetails}>Status: {item.crowd_status}</Text>
    </View>
  );

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
          latitude: location ? location.latitude : 3.139,
          longitude: location ? location.longitude : 101.6869,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        }}
      >
        {location && (
          <Marker coordinate={location}>
            <View>
              <Text>Your Location</Text>
            </View>
          </Marker>
        )}
        {stations.map((station) => (
          <Marker
            key={station.id}
            coordinate={{ latitude: station.latitude, longitude: station.longitude }}
          >
            <View>
              <Text>{station.station_name}</Text>
            </View>
          </Marker>
        ))}
      </MapView>
      <BottomSheet ref={bottomSheetRef} index={0} snapPoints={['25%', '50%', '100%']}>
        <BottomSheetView style={styles.contentContainer}>
          <FlatList
            data={stations}
            renderItem={renderItem}
            keyExtractor={(item) => item.id.toString()}
          />
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
    padding: 16,
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

export default HomeScreen;
