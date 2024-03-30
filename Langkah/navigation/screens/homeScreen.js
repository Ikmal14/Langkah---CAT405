import React, { useState } from "react";
import { View, Text, Button, TextInput, StyleSheet } from "react-native";

const HomeScreen = ({ navigation }) => {
    const [origin, setOrigin] = useState("");
    const [destination, setDestination] = useState("");

    const switchLocations = () => {
        const temp = origin;
        setOrigin(destination);
        setDestination(temp);
    };

    return (
        <View style={styles.container}>
            <View style={styles.inputContainer}>
                <TextInput
                    style={styles.input}
                    placeholder="Origin"
                    value={origin}
                    onChangeText={setOrigin}
                />
                <Button title="Switch" onPress={switchLocations} />
                <TextInput
                    style={styles.input}
                    placeholder="Destination"
                    value={destination}
                    onChangeText={setDestination}
                />
            </View>
        </View>
    );
};

export default HomeScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: "center",
        justifyContent: "top",
    },
    inputContainer: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 10,
        gap: 10,
        paddingHorizontal: 10,
    },
    input: {
        flex: 1,
        height: 40,
        borderColor: "gray",
        borderWidth: 1,
        paddingHorizontal: 10,
    },
});