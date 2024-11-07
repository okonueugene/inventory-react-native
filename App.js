import React, { useCallback, useRef, useState } from 'react';
import { Alert, StyleSheet, View, Button, StatusBar } from 'react-native';
import { useCameraDevice, useCodeScanner } from 'react-native-vision-camera';
import { Camera } from 'react-native-vision-camera';

export default function CodeScannerPage() {
  // 1. Use the default back camera
  const device = useCameraDevice('back');

  // 2. Activate the camera only when the screen is active
  const [torch, setTorch] = useState(false);
  const [isShowingAlert, setIsShowingAlert] = useState(false);

  // 3. Handle code scanning
  const onCodeScanned = useCallback((codes) => {
    console.log('Scanned codes:', codes);
    const value = codes[0]?.value;
    if (value == null || isShowingAlert) return;

    setIsShowingAlert(true);
    Alert.alert("Scanned Code", value, [{ text: "OK", onPress: () => setIsShowingAlert(false) }]);
  }, [isShowingAlert]);

  // 4. Initialize the code scanner for QR and barcode types
  const codeScanner = useCodeScanner({
    codeTypes: ['qr', 'ean-13', 'code-128','code-39','pdf-417','aztec','ean-8','data-matrix','code-93','codabar','upc-a','upc-e','itf'],
    onCodeScanned: onCodeScanned,
  });

  return (  
    <View style={styles.container}>
      {device && (
        <Camera
          style={StyleSheet.absoluteFill}
          device={device}
          isActive={true}
          codeScanner={codeScanner}
          torch={torch ? 'on' : 'off'}
          enableZoomGesture={true}
        />
      )}
      <StatusBar backgroundColor="black" barStyle="light-content" />
      
      {/* Torch Toggle Button */}
      <View style={styles.rightButtonRow}>
        <Button title={torch ? "Torch Off" : "Torch On"} onPress={() => setTorch(!torch)} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
  },
  rightButtonRow: {
    position: 'absolute',
    top: 10,
    right: 10,
  },
});