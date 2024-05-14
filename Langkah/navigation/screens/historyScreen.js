import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from "react-native";

const HistoryScreen = ({ navigation }) => {
    const recentSearches = [
        { origin: "Origin 1", destination: "Destination 1" },
        { origin: "Origin 2", destination: "Destination 2" },
        { origin: "Origin 3", destination: "Destination 3" },
    ];

    return (
        <View style={styles.container}>
            <Text style={styles.header}>Search History</Text>
            <ScrollView contentContainerStyle={styles.scrollView}>
                {recentSearches.map((search, index) => (
                    <TouchableOpacity
                        key={index}
                        style={styles.searchBox}
                        onPress={() => navigation.navigate("Result", {
                            origin: search.origin,
                            destination: search.destination
                        })}
                    >
                        <Text style={styles.searchText}>{search.origin} ➔ {search.destination}</Text>
                    </TouchableOpacity>
                ))}
            </ScrollView>
        </View>
    );
};

export default HistoryScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: "#f9f9f9",
    },
    header: {
        fontSize: 24,
        fontWeight: "bold",
        marginBottom: 20,
        color: "#000",
    },
    scrollView: {
        alignItems: "center",
    },
    searchBox: {
        width: "100%",
        padding: 15,
        backgroundColor: "#fff",
        borderRadius: 10,
        marginBottom: 10,
        elevation: 3, // for shadow on Android
        shadowColor: "#000", // for shadow on iOS
        shadowOffset: { width: 0, height: 2 }, // for shadow on iOS
        shadowOpacity: 0.3, // for shadow on iOS
        shadowRadius: 5, // for shadow on iOS
    },
    searchText: {
        fontSize: 16,
        color: "#000",
    },
});
