import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import Tabs from "./navigation/tabs";
import {enableLatestRenderer} from 'react-native-maps';




const App =() => {
  enableLatestRenderer();
  return (
    <NavigationContainer>
      <Tabs />
    </NavigationContainer>
  );
}

export default App;