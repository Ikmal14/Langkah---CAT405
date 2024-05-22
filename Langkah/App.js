import React, { useMemo } from 'react';
import { Provider } from 'react-redux';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import HomeScreen from './navigation/screens/homeScreen';
import StationScreen from './navigation/screens/stationScreen';
import store from './services/store';

const Stack = createStackNavigator();

const MemoizedHomeScreen = React.memo(HomeScreen);
const MemoizedStationScreen = React.memo(StationScreen);

const App = () => {
  const screenOptions = useMemo(() => ({
    headerShown: false,
  }), []);

  return (
    <Provider store={store}>
      <NavigationContainer>
        <Stack.Navigator screenOptions={screenOptions}>
          <Stack.Screen name="Langkah" component={MemoizedHomeScreen} />
          <Stack.Screen name="StationScreen" component={MemoizedStationScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    </Provider>
  );
};

export default App;
