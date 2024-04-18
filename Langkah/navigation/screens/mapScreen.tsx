import React from 'react';
import { SafeAreaView } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { FAB } from 'react-native-paper';
import { StyleSheet } from 'react-native';

const MapScreen = () => {

  const styles = StyleSheet.create({
    fab: {
      position: 'absolute',
      margin: 16,
      right: 0,
      bottom: 0,
    },
  });

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <MapView
        style={{ flex: 1 }}
        initialRegion={{
          latitude: 3.1579,
          longitude: 101.7120,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        }}>
          <Marker
            coordinate={{ latitude: 3.1579, longitude: 101.7120 }}
            title="Kuala Lumpur"
            description="Kuala Lumpur, Malaysia"
          />
        </MapView>
  
      
        
      <FAB icon="magnify" style={styles.fab} onPress={() => console.log("Pressed")} />

      
    </SafeAreaView>
  );
  
}

export default MapScreen;