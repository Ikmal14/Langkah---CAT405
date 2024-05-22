import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useRoute } from '@react-navigation/native';

const StationScreen = () => {
  const route = useRoute();
  const { station } = route.params;

  return (
    <View style={styles.container}>
      <Text style={styles.stationName}>{station.station_name}</Text>
      <Text style={styles.lineName}>Line: {station.line}</Text>
      {/* Add more details about the station as needed */}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stationName: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  lineName: {
    fontSize: 18,
    marginTop: 10,
  },
});

export default StationScreen;
