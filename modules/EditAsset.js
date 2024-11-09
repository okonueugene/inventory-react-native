import React, {useEffect, useState, useCallback} from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Platform,
  PermissionsAndroid,
  Alert,
  Vibration,
  TextInput,
  ScrollView,
} from 'react-native';
import {launchCamera, launchImageLibrary} from 'react-native-image-picker';
import Geolocation from '@react-native-community/geolocation';
import {Picker} from '@react-native-picker/picker';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {useCameraDevice, useCodeScanner} from 'react-native-vision-camera';
import {Camera} from 'react-native-vision-camera';
import Header from '../components/Header';
import Footer from '../components/Footer';


const EditAsset = () => {
  const [scanned, setScanned] = useState(false);
  const [light, setLight] = useState(false);
  const device = useCameraDevice('back');
  const [assetDetails, setAssetDetails] = useState({
    name: '',
    category_id: '',
    employee_id: '',
    description: '',
    code: '',
    serial_number: '',
    status: 'available',
    purchase_date: '',
    warranty_date: '',
    decommission_date: '',
    image: null,
    coordinates: null,
  });
  
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
  
  

  useEffect(() => {
    requestPermissions();
  }, []);

  const onCodeScanned = useCallback(codes => {
    console.log('Scanned codes:', codes);
   // Check if `codes` is an array and has at least one item
   if (Array.isArray(codes) && codes.length > 0) {
    const value = codes[0]?.value; // Access the `value` of the first code

    if (value) {
      Vibration.vibrate(50);
      setScanned(true);
      getCoordinates();
      getAssetDetails(value);

    }
  }
  }, []);
  
  const getCoordinates = async () => {
    Geolocation.getCurrentPosition(position => {
      const {latitude, longitude} = position.coords;
      console.log('Coordinates:', latitude, longitude);
      setAssetDetails(prev => ({
        ...prev,
        coordinates: `${latitude},${longitude}`,
      }));
    });
  };

  const pickImage = async () => {
    let result = await launchImageLibrary(
      {
        mediaType: 'photo',
        quality: 0.5,
      },
      response => {
        console.log('Response = ', response);

        if (response.didCancel) {
          console.log('User cancelled image picker');
        } else if (response.errorCode) {
          console.log('ImagePicker Error: ', response.errorMessage);
        } else {
          setAssetDetails(prev => ({
            ...prev,
            image: response.uri,
          }));
        }
      },
    );
  };
  // 4. Initialize the code scanner for QR and barcode types
  const codeScanner = useCodeScanner({
    codeTypes: [
      'qr',
      'ean-13',
      'code-128',
      'code-39',
      'pdf-417',
      'aztec',
      'ean-8',
      'data-matrix',
      'code-93',
      'codabar',
      'upc-a',
      'upc-e',
      'itf',
    ],
    onCodeScanned: onCodeScanned,
  });

  const handleInputChange = (name, value) => {
    setAssetDetails(prev => ({
      ...prev,
      [name]: value,
    }));
  };


  const getAssetDetails = async (code) => {
    try {
      const token = await AsyncStorage.getItem('token');
      const response = await axios.get(
        'https://test.tokenlessreport.optitech.co.ke/api/v1/assets/' + code,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );
      console.log('Asset details:', response.data);
      setAssetDetails(response.data);
    } catch (error) {
      console.error(error);
      console.log(response.data);
    }
  }

  const updateAsset = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      const response = await axios.put(
        'https://test.tokenlessreport.optitech.co.ke/api/v1/assets/' + assetDetails.code,
        assetDetails,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );
      console.log('Asset updated:', response.data);
    } catch (error) {
      console.error(error);
    }
  }

  if(!scanned && device) {
    return (
        <Camera
        style={StyleSheet.absoluteFill}
        device={device}
        isActive={true}
        codeScanner={codeScanner}
        light={light}
        enableZoomGesture={true}
      />
    );
  }
  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
      <Header />
      </View>
      {/* Title */}
      <Text style={styles.title}>Edit Asset</Text>
      <View
        style={[styles.formContainer , {flex: 1}]}>
        <ScrollView
          style={styles.formContainer}
          contentContainerStyle={{flexGrow: 1, justifyContent: 'center', paddingBottom: 20}}>
          <TextInput
            placeholder="Name"
            style={styles.input}
            value={assetDetails.name}
            editable={assetDetails.name ? false : true}
            onChangeText={text => handleInputChange('name', text)}
            placeholderTextColor={'gray'}
          />
  
          <TextInput
            placeholder="Description"
            value={assetDetails.description || ''}
            style={styles.input}
            onChangeText={text => handleInputChange('description', text)}
            placeholderTextColor={'gray'}
          />
          <TextInput
            placeholder="Code"
            value={assetDetails.code}
            placeholderTextColor={'gray'}
            style={styles.input}
            editable={false}
          />
          <TextInput
            placeholder="Serial Number"
            value={assetDetails.serial_number || ''}
            style={styles.input}
            onChangeText={text => handleInputChange('serial_number', text)}
            placeholderTextColor={'gray'}
            editable={assetDetails.serial_number ? false : true}
          />
          <TextInput
            placeholder="Purchase Date (YYYY-MM-DD)"
            value={assetDetails.purchase_date || ''}
            style={styles.input}
            onChangeText={text => handleInputChange('purchase_date', text)}
            placeholderTextColor={'gray'}
            editable={assetDetails.purchase_date ? false : true}
          />
          <TextInput
            placeholder="Warranty Date (YYYY-MM-DD)"
            value={assetDetails.warranty_date || ''}
            style={styles.input}
            onChangeText={text => handleInputChange('warranty_date', text)}
            placeholderTextColor={'gray'}
          />
          <TextInput
            placeholder="Decommission Date (YYYY-MM-DD)"
            value={assetDetails.decommission_date || ''}
            style={styles.input}
            onChangeText={text => handleInputChange('decommission_date', text)}
            placeholderTextColor={'gray'}
          />
          <TouchableOpacity onPress={pickImage} style={styles.submitButton}>
            <Text style={styles.buttonText}>Pick Image</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={updateAsset} style={styles.submitButton}>
            <Text style={styles.buttonText}>Submit Asset Details</Text>
          </TouchableOpacity>
        </ScrollView>
        {/* Footer */}
        <View style={styles.footer}>
          <Footer />
          </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  dimmedBackground: {
    opacity: 0,
  },
  toggleButton: {
    margin: 20,
    padding: 10,
    backgroundColor: '#4CAF50', // Vibrant green
    borderRadius: 5,
  },
  camera: {
    width: '100%',
    height: '100%',
  },
  focusFrame: {
    position: 'absolute',
    top: '30%',
    left: '10%',
    width: '80%',
    height: '40%',
    borderWidth: 2,
    borderColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
  },
  instructions: {
    color: 'white',
    fontSize: 16,
    textAlign: 'center',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginVertical: 20,
  },
  button: {
    padding: 10,
    backgroundColor: '#2196F3', // Blue
    borderRadius: 5,
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  formContainer: {
    flex: 1,
    width: '100%',
  },
  input: {
    height: 50,
    borderColor: 'gray',
    color: 'black',
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 10,
    marginBottom: 10,
    width: '90%',
    alignSelf: 'center',
  },
  pickerContainer: {
    width: '90%',
    alignSelf: 'center',
    marginBottom: 10,
  },
  picker: {
    height: 50,
    borderColor: 'gray',
    borderWidth: 1,
    borderRadius: 5,
  },
  submitButton: {
    padding: 10,
    backgroundColor: '#4CAF50',
    borderRadius: 5,
    alignItems: 'center',
    width: '90%',
    alignSelf: 'center',
    marginBottom: 10,
  },
  header: {
    height: 60,
    backgroundColor: '#4A90E2',
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    marginVertical: 6,
    color: '#4A90E2',
  },
  footer: {
    height: 60,
    backgroundColor: '#4A90E2',
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    position: 'relative',
    bottom: 0,
    alignItems: 'center',
  },
});

export default EditAsset;
