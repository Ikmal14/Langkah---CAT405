import React, { useEffect, useState } from 'react';
import { NavigationContainer } from "@react-navigation/native";

import Tabs from "./navigation/tabs";
import enableLatestRenderer from 'react-native-maps';

const App =() => {
  const [data, setData] = useState([]);

  useEffect(() => {
    fetch('http://localhost:3000/api/data')
      .then(response => response.json())
      .then(data => setData(data))
      .catch(error => console.error(error));
  }, []);

  return (
    <NavigationContainer>
      <Tabs />
    </NavigationContainer>
  );
}

export default App;