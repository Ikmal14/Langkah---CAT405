import React, { useState } from "react";
import { View, Text, Button, TextInput, StyleSheet, TouchableOpacity } from "react-native";


const HomeScreen = ({ navigation }) => {
    // State variables for origin and destination
    const [origin, setOrigin] = useState("");
    const [destination, setDestination] = useState("");

    // Function to switch the values of origin and destination
    const switchLocations = () => {
        const temp = origin;
        setOrigin(destination);
        setDestination(temp);
    };

    // State variables for language and checkbox
    const [language, setLanguage] = useState("en");
    const [isChecked, setIsChecked] = useState(false);

    // Function to handle checkbox click
    const handleCheckboxClick = () => {
        setIsChecked(!isChecked);
    };

    return (
        <View style={styles.container}>
            {/* Input container */}
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

            {/* Less Crowded Option */}
            <View style={styles.textOption}>
                <TouchableOpacity style={styles.checkbox} onPress={handleCheckboxClick}>
                    {isChecked ? <Text style={styles.check}>✓</Text> : null}
                </TouchableOpacity>
                <Text>Less Crowded Option</Text>
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
    checkbox: {
        width: 20,
        height: 20,
        borderWidth: 1,
        borderColor: "black",
    },
    check: {
        alignSelf: "center",
    },
    textOption: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 10,
        gap: 10,
        paddingHorizontal: 10,
    },
});
