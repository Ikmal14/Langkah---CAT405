import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Image } from 'react-native';
import MapScreen from './screens/mapScreen';
import HomeScreen from './screens/homeScreen';
import HistoryScreen from './screens/historyScreen';

const Tab = createBottomTabNavigator();

const Tabs = () => {
    return (
        <Tab.Navigator
             tabBarOptions={{
                 showLabel: false,
                 style: {
                    height: 60, // Increase the height of the tab bar
                 },
                 tabStyle: {
                    // Customize the style of each tab
                    // flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-evenly',
                 },
                 iconStyle: {
                    marginRight: 10,
                 },
            }}
        >
        
            <Tab.Screen 
                name="Map" 
                component={MapScreen} 
                options={{
                    tabBarIcon: ({ focused }) => (
                        // Customize the icon for the Map tab
                        <Image
                            source={require('../assets/icons/location.png')}
                            style={{
                                width: focused ? 40 : 30, // Increase the width of the icon when focused
                                height: focused ? 40 : 30, // Increase the height of the icon when focused
                                tintColor: focused ? '#FF0000' : '#000000',
                            }}
                        />
                    ),
                }}
            />
            <Tab.Screen 
                name="Home" 
                component={HomeScreen} 
                options={{
                    tabBarIcon: ({ focused }) => (
                        // Customize the icon for the Home tab
                        <Image
                            source={require('../assets/icons/home.png')}
                            style={{
                                width: focused ? 40 : 30, // Increase the width of the icon when focused
                                height: focused ? 40 : 30, // Increase the height of the icon when focused
                                tintColor: focused ? '#FF0000' : '#000000',
                            }}
                        />
                    ),
                }}
            />
            <Tab.Screen 
                name="History" 
                component={HistoryScreen} 
                options={{
                    tabBarIcon: ({ focused }) => (
                        // Customize the icon for the History tab
                        <Image
                            source={require('../assets/icons/history.png')}
                            style={{
                                width: focused ? 40 : 30, // Increase the width of the icon when focused
                                height: focused ? 40 : 30, // Increase the height of the icon when focused
                                tintColor: focused ? '#FF0000' : '#000000',
                            }}
                        />
                    ),
                }}
            />
        </Tab.Navigator>
    );
};

export default Tabs;
