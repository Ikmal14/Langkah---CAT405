import React from 'react';
import { View, StyleSheet } from 'react-native';

const CustomMarker = ({ lineColor, glowIntensity }) => (
  <View style={styles.markerContainer}>
    <View style={[styles.outerCircle, { borderColor: `rgba(255, 0, 0, ${glowIntensity})` }]} />
    <View style={[styles.middleCircle, { borderColor: 'rgba(255, 0, 0, 0.6)' }]} />
    <View style={[styles.innerCircle, { backgroundColor: lineColor }]} />
  </View>
);

const styles = StyleSheet.create({
  markerContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  outerCircle: {
    width: 30,
    height: 30,
    borderRadius: 15,
    borderWidth: 4,
    position: 'absolute',
  },
  middleCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    position: 'absolute',
  },
  innerCircle: {
    width: 10,
    height: 10,
    borderRadius: 5,
    position: 'absolute',
  },
});

export default CustomMarker;
