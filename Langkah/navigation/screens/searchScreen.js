import React, { useState } from 'react';
import { SafeAreaView, TextInput, StyleSheet, View, Text, FlatList } from 'react-native';
import { FAB } from 'react-native-paper';

const SearchScreen = () => {
  const [search, setSearch] = useState('');
  const [results, setResults] = useState([]);

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#fff',
    },
    searchContainer: {
      flexDirection: 'row',
      borderColor: 'gray',
      borderWidth: 1,
      margin: 10,
      paddingHorizontal: 10,
      alignItems: 'center',
      borderRadius: 5,
      backgroundColor: '#f0f0f0',
    },
    search: {
      flex: 1,
      paddingVertical: 8,
      paddingHorizontal: 10,
      fontSize: 16,
    },
    fab: {
      margin: 0,
      backgroundColor: 'blue',
    },
    resultItem: {
      padding: 15,
      borderBottomWidth: 1,
      borderBottomColor: '#ccc',
    },
    resultText: {
      fontSize: 18,
    },
  });

  const handleSearch = () => {
    setResults(['Test 1', 'Test 2', 'Test 3', 'Test 4', 'Test 5']);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.search}
          placeholder="Search for a station"
          value={search}
          onChangeText={setSearch}
        />
        <FAB icon="magnify" style={styles.fab} onPress={handleSearch} small />
      </View>
      <FlatList
        data={results}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item }) => (
          <View style={styles.resultItem}>
            <Text style={styles.resultText}>{item}</Text>
          </View>
        )}
      />
    </SafeAreaView>
  );
};

export default SearchScreen;
