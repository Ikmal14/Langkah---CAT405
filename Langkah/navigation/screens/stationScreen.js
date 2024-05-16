import React from 'react';
import { SafeAreaView, Text, StyleSheet } from 'react-native';

const StationScreen = ({ route }) => {
  const { station } = route.params;

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.header}>Station Details</Text>
      <Text style={styles.detail}>Name: {station.name}</Text>
      <Text style={styles.detail}>Line: {station.line}</Text>
      <Text style={styles.detail}>Status: {station.status}</Text>
      <Text style={styles.detail}>Congestion: {station.congestion}</Text>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  detail: {
    fontSize: 18,
    marginVertical: 5,
  },
});

export default StationScreen;
