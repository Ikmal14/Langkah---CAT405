// App.js
import React, { useMemo, useEffect, useState } from 'react';
import { LogBox, Alert, PermissionsAndroid } from 'react-native';
import { Provider } from 'react-redux';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import HomeScreen from './navigation/screens/homeScreen';
import StationScreen from './navigation/screens/stationScreen';
import store from './services/store';
import messaging from '@react-native-firebase/messaging';
import notifee, { AndroidImportance } from '@notifee/react-native';
import { showNotification } from './navigation/screens/journeyTracker';  // Adjust the path accordingly

const Stack = createStackNavigator();

const MemoizedHomeScreen = React.memo(HomeScreen);
const MemoizedStationScreen = React.memo(StationScreen);

LogBox.ignoreLogs([
  '[Reanimated] Tried to modify key `reduceMotion` of an object which has been already passed to a worklet',
]);

const App = () => {
  const [notificationSent, setNotificationSent] = useState(false);

  const screenOptions = useMemo(() => ({
    headerShown: false,
  }), []);

  useEffect(() => {
    const requestUserPermission = async () => {
      PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS);
      const authStatus = await messaging().requestPermission();
      const enabled =
        authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
        authStatus === messaging.AuthorizationStatus.PROVISIONAL;
  
      if (enabled) {
        console.log('Authorization status:', authStatus);
        const token = await messaging().getToken();
        //store token in secure storage
        // await SecureStore.setItemAsync('DEVICE_TOKEN', token);
        // const tokenStored = await SecureStore.getItemAsync('DEVICE_TOKEN');
  
        console.log('FCM token:', token);
      }
    };
  
    requestUserPermission();
  }, []);

  async function onMessageReceived(message) {
    const channelId = await notifee.createChannel({
      id: 'default',
      name: 'Default Channel',
      importance: AndroidImportance.HIGH,
    });
    console.log('onMessageReceived', message);

    await notifee.displayNotification({
      title: message.notification.title,
      body: message.notification.body,
      android: {
        channelId,
        importance: AndroidImportance.HIGH,
      },
    });

    if (!notificationSent) {
      showNotification(message.notification.title, message.notification.body);  // Call showNotification here
      setNotificationSent(true);
    }
  }

  useEffect(() => {
    const unsubscribe = messaging().onMessage(onMessageReceived);
    return unsubscribe;
  }, [notificationSent]);

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
