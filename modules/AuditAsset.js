import React, { useEffect, useState, useCallback, useRef } from 'react';
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
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useCameraDevice, useCodeScanner } from 'react-native-vision-camera';
import { Camera } from 'react-native-vision-camera';
import Header from '../components/Header';
import Footer from '../components/Footer';
import ApiManager from '../api/ApiManager';
import { useNavigation } from '@react-navigation/native';
import {Picker} from '@react-native-picker/picker';
import Preloader from '../components/Preloader';
import Toast from 'react-native-toast-message';

const AuditAsset = () => {

    const navigation = useNavigation();
    const camera = useRef(null);
    const [scanned, setScanned] = useState(false);
    const [torch, setTorch] = useState(false)
    const device = useCameraDevice('back');
    const [status, setStatus] = useState('');
    const [remarks, setRemarks] = useState('');
    const [condition, setCondition] = useState('');
    const [action, setAction] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [assetDetails, setAssetDetails] = useState([]);

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
            const value = codes[0]?.value;

            if (value) {
                Vibration.vibrate(50);
                setScanned(true);
                getAssetDetails(value);

            }
        }
    }, []);


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
        switch (name) {
            case 'status':
                setStatus(value);
                break;
            case 'remarks':
                setRemarks(value);
                break;
            case 'condition':
                setCondition(value);
                break;
            case 'action':
                setAction(value);
                break;
            default:
                break;
        }
    };

    const getAssetDetails = async (code) => {

        try {
          //set loading to true
          setIsLoading(true);
          // Get token from async storage
            const token = await AsyncStorage.getItem('token');
            const response = await ApiManager.get(`/assets/${code}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            setAssetDetails(response.data.data);
            //set loading to false
            setIsLoading(false);
        } 
        catch (error) {

          if (error.response) {
              // The request was made and the server responded with a status code
              // that falls out of the range of 2xx
              console.log(error.response.data);
              console.log(error.response.status);
              console.log(error.response.headers);
          } else if (error.request) {
              // The request was made but no response was received
              // `error.request` is an instance of XMLHttpRequest in the browser and an instance of
              // http.ClientRequest in node.js
              console.log(error.request);
          } else {
              // Something happened in setting up the request that triggered an Error
              console.log('Error', error.message);
          }
          //set loading to false
          setIsLoading(false);

          //show error message
          Toast.show({
            type: 'error',
            text1: 'Error',
            text2: 'Asset not found',
            visibilityTime: 3000,
            autoHide: true,
          });
          //navigate to dashboard
          navigation.navigate('Dashboard');
      }
    };
    const handleSubmit = async () => {

        try {
          //set loading to true
          setIsLoading(true);
            const token = await AsyncStorage.getItem('token');
            const response = await ApiManager.post('/audits', {
                asset_id: assetDetails.id,
                status,
                remarks,
                condition,
                action,
            }, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            //set loading to false
            setIsLoading(false);
            console.log(response.data);
            
                
            navigation.navigate('Dashboard');

            Toast.show({
              type: 'success',
              text1: 'Success',
              text2: 'Asset audit has been submitted successfully',
              visibilityTime: 3000,
              autoHide: true,
          });
        }
        catch (error) {
          if (error.response) {
              // The request was made and the server responded with a status code
              // that falls out of the range of 2xx
              console.log(error.response.data);
              console.log(error.response.status);
              console.log(error.response.headers);
          } else if (error.request) {
              // The request was made but no response was received
              // `error.request` is an instance of XMLHttpRequest in the browser and an instance of
              // http.ClientRequest in node.js
              console.log(error.request);
          } else {
              // Something happened in setting up the request that triggered an Error
              console.log('Error', error.message);
          }
          console.log(error.config);

          //show error message
          Toast.show({
            type: 'error',
            text1: 'Error',
            text2: 'Failed to submit audit',
            visibilityTime: 3000,
            autoHide: true,
          });
      }
    };

    if (isLoading) {
        return (
            <View style={styles.container}>
                <Preloader />
            </View>
        );
    }




    if (!scanned && device) {
        return (
            <View style={styles.container}>

                <Camera
                    ref={camera}
                    style={StyleSheet.absoluteFill}
                    device={device}
                    isActive={true}
                    codeScanner={codeScanner}
                    torch={torch ? 'on' : 'off'}
                    enableZoomGesture={true}
                />
                <View style={styles.focusFrame}>
                    <Text style={styles.instructions}>
                        Align the barcode within the frame to scan
                    </Text>
                </View>
                <TouchableOpacity style={styles.toggleButton} onPress={() => setTorch(!torch)}>
                    <Text style={styles.buttonText}>Toggle Torch</Text>
                </TouchableOpacity>
            </View>
        );
    }
    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <Header />
            </View>
            {/* Title */}
            <Text style={styles.title}>Audit Asset</Text>
            <View
                style={[styles.formContainer, { flex: 1 }]}>
                <ScrollView
                    style={styles.formContainer}
                    contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', paddingBottom: 20 }}>
                    <TextInput
                        placeholder="Asset Name"
                        style={styles.input}
                        value={assetDetails.name}
                        editable={false}
                        placeholderTextColor={'gray'}
                    />
  <View
            style={{
              borderWidth: 1,
              borderColor: 'gray',
              borderRadius: 2,
              marginBottom: 10,
              width: '90%',
              alignSelf: 'center',
            }}>

                    <Picker
                        style={styles.picker}
                        selectedValue={status}
                        onValueChange={value => handleInputChange('status', value)}>
                        <Picker.Item label="Select Status" value="" color='gray' />
                        <Picker.Item label="Done" value="1" color='gray' />
                        <Picker.Item label="Pending" value="0" color='gray' />
                    </Picker>
                    </View>
                    <TextInput
                        placeholder="Remarks"
                        style={styles.input}
                        onChangeText={text => handleInputChange('remarks', text)}
                        placeholderTextColor={'gray'}
                    />
                    <TextInput
                        placeholder="Condition"
                        style={styles.input}
                        onChangeText={text => handleInputChange('condition', text)}
                        placeholderTextColor={'gray'}
                    />
                    <TextInput
                        placeholder="Action"
                        style={styles.input}
                        onChangeText={text => handleInputChange('action', text)}
                        placeholderTextColor={'gray'}
                    />
                    <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
                        <Text style={styles.buttonText}>Submit Changes</Text>
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
      position: 'absolute',
      bottom: 100,
      padding: 10,
      backgroundColor: '#4CAF50',
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
        marginTop: 20,
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
    }, datePickerContainer: {
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
    toggleButton: {
      position: 'absolute',
      bottom: 100,
      padding: 10,
      backgroundColor: '#4CAF50',
      borderRadius: 5,
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
});


export default AuditAsset;
