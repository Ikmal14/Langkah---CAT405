import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';

const Legend = () => {
  return (
    <View style={styles.legendContainer}>
      <Text style={{textAlign: 'center', fontWeight: 'bold', backgroundColor: 'white' }}>Legend</Text>
      <Text style={styles.label}>Busy</Text>
      <LinearGradient
        colors={['#701a5a', '#a32683', '#cf30a6', '#ffffff']}
        style={styles.gradient}
      />
      <Text style={styles.label}>Not Busy</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  legendContainer: {
    position: 'absolute',
    top: 120,
    right: 10,
    backgroundColor: 'transparent',
    padding: 10,
    borderRadius: 5,
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 5,
    elevation: 5,
    alignItems: 'center',
  },
  gradient: {
    width: 20,
    height: 150,
    borderRadius: 10,
    marginVertical: 10,
  },
label: {
  fontSize: 14,
  fontWeight: 'bold',
  color: 'black', // Change this to the color you want for the text
  textShadowColor: 'white', // Change this to the color you want for the outline
  textShadowOffset: { width: -1, height: 1 },
  textShadowRadius: 10,
},
});

export default Legend;
