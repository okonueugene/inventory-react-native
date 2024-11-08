import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import LoginScreen from '../modules/Login';

const Stack = createStackNavigator();

const AuthStack = () => {
    return (
        <Stack.Navigator
            initialRouteName="Login"
            screenOptions={{
                headerStyle: { backgroundColor: "#fbf7fc" },
                headerTintColor: "#fff",
                headerTitleAlign: "center",
                headerTitle: "Asset Tagging",
                headerTitleStyle: { fontWeight: "bold", fontSize: 20, color: "#007bff" },
            }}
        >
            <Stack.Screen name="Login" component={LoginScreen} />
        </Stack.Navigator>
    );
};

export default AuthStack;