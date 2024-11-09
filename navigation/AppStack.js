import React, { useState, useRef } from "react";
import { createStackNavigator } from "@react-navigation/stack";
import { TouchableOpacity,
    DrawerLayoutAndroid,
    Text
} from "react-native";
import Login from "../modules/Login";
import Dashboard from "../modules/Dashboard";
import AddAsset from "../modules/AddAsset";
import EditAsset from "../modules/EditAsset";
import ViewAsset from "../modules/ViewAsset";

const Stack = createStackNavigator();

const AppStack = () => {
    const drawer = useRef(null);

    const openDrawer = () => {
        drawer.current.openDrawer();
    };

    return (
        <DrawerLayoutAndroid
            initialRouteName="Dashboard"
            ref={drawer}
            drawerWidth={300}
            drawerPosition="left"
            renderNavigationView={() => (
                <TouchableOpacity onPress={() => drawer.current.closeDrawer()}>
                    <Text>Close Drawer</Text>
                </TouchableOpacity>
            )}
        >
            <Stack.Navigator>
                <Stack.Screen name="Dashboard" component={Dashboard} options={{ headerShown: false }} />
                <Stack.Screen name="AddAsset" component={AddAsset} options={{ headerShown: false }} />
                <Stack.Screen name="EditAsset" component={EditAsset} options={{ headerShown: false }} />
                <Stack.Screen name="ViewAsset" component={ViewAsset} options={{ headerShown: false }} />
            </Stack.Navigator>
        </DrawerLayoutAndroid>
    );
}

export default AppStack;