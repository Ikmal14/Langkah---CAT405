// FloatingWindow.js
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

const FloatingWindow = ({ currentStation, nextStation, onClose }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Current Station: {currentStation}</Text>
      <Text style={styles.text}>Next Station: {nextStation}</Text>
      <TouchableOpacity onPress={onClose}>
        <Text style={styles.closeButton}>Close</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 50,
    left: 0,
    right: 0,
    backgroundColor: 'white',
    padding: 10,
    borderRadius: 5,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 5,
  },
  text: {
    fontSize: 16,
    marginVertical: 5,
  },
  closeButton: {
    color: 'blue',
    marginTop: 10,
    textAlign: 'right',
  },
});

export default FloatingWindow;
