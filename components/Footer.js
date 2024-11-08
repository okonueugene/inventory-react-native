import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';

const Footer = () => {
    return (
        <View style={styles.container}>
          <Text style={styles.footerText}>
            © 2021 All rights reserved.
            </Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        width: Dimensions.get('window').width,
        height: 50,
        justifyContent: 'center',
        alignItems: 'center',
    },
    footerText: {
        color: 'white',
        fontSize: 15,
        fontWeight: 'bold',
    }
});

export default Footer;
            