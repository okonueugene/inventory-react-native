import React, { useEffect, useState, useCallback } from 'react';
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
import { launchCamera } from 'react-native-image-picker';
import Geolocation from '@react-native-community/geolocation';
import { Picker } from '@react-native-picker/picker';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useCameraDevice, useCodeScanner } from 'react-native-vision-camera';
import { Camera } from 'react-native-vision-camera';
import DateTimePicker from 'react-native-ui-datepicker';
import dayjs from 'dayjs';
import Header from '../components/Header';
import Footer from '../components/Footer';


const EditAsset = () => {
  const [scanned, setScanned] = useState(false);
  const [light, setLight] = useState(false);
  const device = useCameraDevice('back');
  const [purchaseDate, setPurchaseDate] = useState(null);
  const [warrantyDate, setWarrantyDate] = useState(null);
  const [decommissionDate, setDecommissionDate] = useState(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [photo, setPhoto] = useState([]);
  const [activeField, setActiveField] = useState('');
  const [assetDetails, setAssetDetails] = useState({
    name: '',
    category_id: '',
    employee_id: '',
    description: '',
    code: '',
    serial_number: '',
    status: '',
    purchase_date: '',
    warranty_date: '',
    decommission_date: '',
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
      const { latitude, longitude } = position.coords;
      console.log('Coordinates:', latitude, longitude);
      setAssetDetails(prev => ({
        ...prev,
        coordinates: `${latitude},${longitude}`,
      }));
    });
  };


  const takePhoto = async () => {
    let result = await launchCamera({
        mediaType: 'photo',
        quality: 0.5,
        });
    console.log(result);
    if (!result.didCancel) {
        setPhoto(result.assets[0].uri);
        }
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
      // Send data to your backend
      const formData = new FormData();

      console.log("formData before", formData);
      if (assetDetails.serial_number === '' || assetDetails.serial_number === null) {
        formData.append('serial_number', assetDetails.serial_number);
      }
      if (assetDetails.purchase_date === '' || assetDetails.purchase_date === null) {
        formData.append('purchase_date', purchaseDate);
      }
      if (assetDetails.warranty_date == '' || assetDetails.warranty_date === null) {
        formData.append('warranty_date', assetDetails.warranty_date);
        if (assetDetails.decommission_date === '' || assetDetails.decommission_date === null) {
          formData.append('decommission_date', assetDetails.decommission_date);
        }
      }
      if (assetDetails.name === '' || assetDetails.name === null) {
        formData.append('image', {
          uri: photo,
          type: 'image/jpeg',
          name: 'image.jpg',
        }
        );
      }

      //coordinates
        if (assetDetails.coordinates === '' || assetDetails.coordinates === null) {
            formData.append('coordinates', assetDetails.coordinates);
        }
        
      console.log("formData after", formData);
      const response = await axios.put(
        'https://test.tokenlessreport.optitech.co.ke/api/v1/assets/' + assetDetails.code,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            Authorization: `Bearer ${token}`,
          },
            formData,
        },
      );
      console.log('Asset updated:', response.data);
      Alert.alert('Asset updated successfully');
    } catch (error) {
      console.error(error);
      Alert.alert('An error occurred. Please try again');
    }
  };



  const handleDateChange = date => {
    if (activeField === 'purchase') {
      setPurchaseDate(dayjs(date).format('YYYY-MM-DD'));
    } else if (activeField === 'warranty') {
      setWarrantyDate(dayjs(date).format('YYYY-MM-DD'));
    } else if (activeField === 'decommission') {
      setDecommissionDate(dayjs(date).format('YYYY-MM-DD'));
    }
    setShowDatePicker(false); // Close DatePicker after selection
  };

  const openDatePicker = field => {
    setActiveField(field);
    setShowDatePicker(true); // Open DatePicker
  };


  if (!scanned && device) {
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
        style={[styles.formContainer, { flex: 1 }]}>
        <ScrollView
          style={styles.formContainer}
          contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', paddingBottom: 20 }}>
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
          <TouchableOpacity
            onPress={() => openDatePicker('purchase')}
            style={styles.dateInput}>
            <Text style={styles.datePickerText}
            disabled={assetDetails.purchase_date ? true : false}
            >
              {assetDetails.purchase_date ? `${assetDetails.purchase_date}` : 'Select Purchase Date'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => openDatePicker('warranty')}
            style={styles.dateInput}>
            <Text style={styles.datePickerText}
            disabled={assetDetails.warranty_date ? true : false}
            >
              {assetDetails.warranty_date ? `${assetDetails.warranty_date}` : 'Select Warranty Date'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => openDatePicker('decommission')}
            style={styles.dateInput}>
            <Text style={styles.datePickerText}
            disabled={assetDetails.decommission_date ? true : false}
            >
              {assetDetails.decommission_date ? `${assetDetails.decommission_date}` : 'Select Decommission Date'}
            </Text>
          </TouchableOpacity>

          {/* Show DateTimePicker */}
          {showDatePicker && (
            <View style={styles.datePickerContainer}>
              <DateTimePicker
                mode="single"
                date={
                  activeField === 'purchase'
                    ? purchaseDate
                    : activeField === 'warranty'
                      ? warrantyDate
                      : decommissionDate
                }
                onChange={params => handleDateChange(params.date)}
                calendarTextStyle={{ color: 'black' }}
                headerTextStyle={{ color: 'black' }}
                headerButtonSize={20}
                //   todayContainerStyle={{color: 'black'}}
                //   monthContainerStyle={{color: 'black'}}
                //   yearContainerStyle={{color: 'black'}}
                //   weekDaysContainerStyle={{color: 'black'}}
                weekDaysTextStyle={{ color: 'black' }}
              />
            </View>
          )}
          <TouchableOpacity onPress={takePhoto} style={styles.submitButton}>
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
  },  datePickerContainer: {
    position: 'absolute',
    top: '30%',
    left: '10%',
    width: '80%',
    flex: 1,
    backgroundColor: '#f9fcfc',
    borderRadius: 10,
    padding: 10,
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'gray',
    zIndex: 100,
  },
  dateInput: {
    height: 50,
    borderColor: 'gray',
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 10,
    marginBottom: 10,
    width: '90%',
    alignSelf: 'center',
    justifyContent: 'center',
  },
  datePickerText: {
    color: 'gray',
    fontSize: 15,
  },
});


export default EditAsset;
