import React, { useContext, useEffect } from 'react';
import Preloader from './components/Preloader';
import { NavigationContainer } from '@react-navigation/native';
import { View, StyleSheet } from "react-native";
import AuthStack from './navigation/AuthStack';
import AppStack from './navigation/AppStack';
import { MainContext, MainProvider } from "./storage/MainContext";
import AsyncStorage from "@react-native-async-storage/async-storage";

const App = () => {
  return (
    <MainProvider>
      <AppContainer />
    </MainProvider>
  );

};

const AppContainer = () => {

  const { state, dispatch } = useContext(MainContext);

  const checkLogin = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      const user = JSON.parse(await AsyncStorage.getItem('user'));
      if (token && user) {
        dispatch({ type: 'LOGIN', payload: { token, user } });
      } else {
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    checkLogin();
  }, []);

  if (state.isLoading) {
    return (
      <View style={styles.preloaderContainer}>
        <Preloader />
      </View>
    );
  }

  return (
    <NavigationContainer>
      {state.isAuthenticated ? <AppStack /> : <AuthStack />}
    </NavigationContainer>
  );
};


const styles = StyleSheet.create({
  preloaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center"
  }
});


export default App;