import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Button } from 'react-native';

const ResultScreen = ({ navigation, route }) => {
    const { origin, destination } = route.params;

    const handleBack = () => {
        navigation.navigate('Home', { origin, destination });
    };

    return (
        <View style={styles.container}>
            <Text style={styles.text}>Results for:</Text>
            <Text style={styles.text}>Origin: {origin}</Text>
            <Text style={styles.text}>Destination: {destination}</Text>
            <Button title="Back to Home" onPress={handleBack} />
        </View>
    );
};

export default ResultScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
    },
    text: {
        fontSize: 18,
        marginBottom: 10,
    },
});
