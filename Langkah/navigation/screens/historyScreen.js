import React from "react";
import { View, Text, Button, StyleSheet } from "react-native";

const HistoryScreen = ({ navigation }) => {
  return (
    <View style={styles.container}>
      <Text>History Screen</Text>
      <Button
        title="Go to Details"
        onPress={() => navigation.navigate("Details")}
      />
    </View>
  );
};

export default HistoryScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
    },
    });