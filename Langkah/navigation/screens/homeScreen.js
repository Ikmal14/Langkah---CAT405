import React, { useState } from "react";
import { View, Text, TextInput, StyleSheet, TouchableOpacity } from "react-native";

const HomeScreen = ({ navigation }) => {
    const [origin, setOrigin] = useState("");
    const [destination, setDestination] = useState("");
    const [isChecked, setIsChecked] = useState(false);

    const handleSearch = () => {
        // Navigate to ResultScreen
        navigation.navigate("Result", { origin, destination });

        // For now, just for display purposes, navigate to the History screen
        navigation.navigate("History");
    };

    const handleCheckboxClick = () => {
        setIsChecked(!isChecked);
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.city}>Penang</Text>
            </View>

            <View style={styles.searchContainer}>
                <View style={styles.inputContainer}>
                    <TextInput
                        style={styles.input}
                        placeholder="Origin"
                        value={origin}
                        onChangeText={setOrigin}
                    />
                    <TextInput
                        style={styles.input}
                        placeholder="Destination"
                        value={destination}
                        onChangeText={setDestination}
                    />
                </View>
                <TouchableOpacity style={styles.searchIcon} onPress={handleSearch}>
                    <Text style={styles.searchIconText}>🔍</Text>
                </TouchableOpacity>
            </View>

            <View style={styles.optionContainer}>
                <TouchableOpacity style={styles.checkbox} onPress={handleCheckboxClick}>
                    {isChecked ? <Text style={styles.check}>✓</Text> : null}
                </TouchableOpacity>
                <Text style={styles.optionText}>Less Crowded Option</Text>
            </View>
        </View>
    );
};

export default HomeScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: "#f9f9f9",
    },
    header: {
        marginBottom: 20,
    },
    city: {
        fontSize: 24,
        fontWeight: "bold",
        color: "#000",
    },
    searchContainer: {
        flexDirection: "row",
        alignItems: "center",
        borderColor: "#ccc",
        borderWidth: 1,
        borderRadius: 5,
        backgroundColor: "#fff",
        marginBottom: 20,
    },
    inputContainer: {
        flex: 1,
        flexDirection: "row",
    },
    input: {
        flex: 1,
        paddingVertical: 10,
        paddingHorizontal: 15,
        fontSize: 16,
        color: "#000",
        borderRightWidth: 1,
        borderColor: "#ccc",
    },
    searchIcon: {
        padding: 10,
        backgroundColor: "#007AFF",
        borderTopRightRadius: 5,
        borderBottomRightRadius: 5,
    },
    searchIconText: {
        fontSize: 16,
        color: "#fff",
    },
    optionContainer: {
        flexDirection: "row",
        alignItems: "center",
    },
    checkbox: {
        width: 20,
        height: 20,
        borderWidth: 1,
        borderColor: "black",
        justifyContent: "center",
        alignItems: "center",
    },
    check: {
        alignSelf: "center",
    },
    optionText: {
        marginLeft: 10,
        fontSize: 16,
        color: "#000",
    },
});
