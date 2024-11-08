import React, { useRef, useEffect } from "react";
import { View, Text, StyleSheet, Dimensions, Animated, Easing } from "react-native";

const Preloader = () => {
    const spinValue = useRef(new Animated.Value(0)).current;
    
    useEffect(() => {
        Animated.loop(
        Animated.timing(spinValue, {
            toValue: 1,
            duration: 3000,
            easing: Easing.linear,
            useNativeDriver: true,
        })
        ).start();
    }, [spinValue]);
    
    const spin = spinValue.interpolate({
        inputRange: [0, 1],
        outputRange: ["0deg", "360deg"],
    });
    
    return (
        <View style={styles.container}>
        <Animated.Image
            style={{ transform: [{ rotate: spin }] }}
            source={require("../assets/loader.png")}
        />
        </View>
    );
    }

const styles = StyleSheet.create({
    container: {
        width: Dimensions.get("window").width,
        height: Dimensions.get("window").height,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#f0f0f0",
    },
});

export default Preloader;
