import React, { useContext, useEffect } from 'react';
import Preloader from './components/Preloader';
import { NavigationContainer } from '@react-navigation/native';
import { View, StyleSheet, Platform, PermissionsAndroid, Alert } from 'react-native';
import AuthStack from './navigation/AuthStack';
import AppStack from './navigation/AppStack';
import { MainContext, MainProvider } from "./storage/MainContext";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Toast from 'react-native-toast-message';


const App = () => {
  return (
    <MainProvider>
      <AppContainer />
      <Toast />
    </MainProvider>
  );

};

const AppContainer = () => {

  const { state, dispatch } = useContext(MainContext);

  const requestPermissions = async () => {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.requestMultiple([
          PermissionsAndroid.PERMISSIONS.CAMERA,
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
        ]);
        if (
          granted['android.permission.CAMERA'] ===
            PermissionsAndroid.RESULTS.GRANTED &&
          granted['android.permission.ACCESS_FINE_LOCATION'] ===
            PermissionsAndroid.RESULTS.GRANTED &&
          granted['android.permission.READ_EXTERNAL_STORAGE'] ===
            PermissionsAndroid.RESULTS.GRANTED
        ) {
          console.log('Permissions granted');
        } else {
          Alert.alert('Permissions denied');
        }
      } catch (err) {
        console.warn(err);
      }
    }
  };

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
    requestPermissions();
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