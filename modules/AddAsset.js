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
import ApiManager from '../api/ApiManager';
import Toast from 'react-native-toast-message';
import { useNavigation } from '@react-navigation/native';
import Preloader from '../components/Preloader';


const AddAsset = () => {
    const [qrValue, setQrValue] = useState('');
    const [torch, setTorch] = useState(false);
    const device = useCameraDevice('back');
    const [showCamera, setShowCamera] = useState(false);
    const [purchaseDate, setPurchaseDate] = useState(null);
    const [warrantyDate, setWarrantyDate] = useState(null);
    const [decommissionDate, setDecommissionDate] = useState(null);
    const [photo, setPhoto] = useState([]);
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [activeField, setActiveField] = useState('');
    const [assetDetails, setAssetDetails] = useState({
        name: '',
        category_id: '',
        employee_id: '',
        description: '',
        code: '',
        serial_number: '',
        status: 1,
        coordinates: null,
    });
    const navigation = useNavigation();

    const [categories, setCategories] = useState([]);
    const [employees, setEmployees] = useState([]); 
    const[isLoading, setIsLoading] = useState(false);

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

        // Check if `codes` is an array and has at least one item
        if (Array.isArray(codes) && codes.length > 0) {
            const value = codes[0]?.value; // Access the `value` of the first code

            if (value) {
                Vibration.vibrate(50);
                setQrValue(value);
                setAssetDetails(prev => ({
                    ...prev,
                    code: value,
                }));
                getCoordinates();
                setShowCamera(false);
            }
        } else {
            console.warn('No valid codes scanned');
        }
    }, []);

    const getCoordinates = async () => {
        Geolocation.getCurrentPosition(position => {
            const { latitude, longitude } = position.coords;
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

    const handleSubmit = async () => {
        // Extract asset details

        const {
            name,
            category_id,
            employee_id,
            code,
            serial_number,
            description,
            status,
            coordinates,
        } = assetDetails;

        // Validate form fields
        if (!name )
            return Toast.show({
                type: 'error',
                text1: 'Error',
                text2: 'Name is required',
                visibilityTime: 2000,
                autoHide: true,
            });
        if (!category_id)
            return Toast.show({
                type: 'error',
                text1: 'Error',
                text2: 'Category is required',
                visibilityTime: 4000,
                autoHide: true,
            });

        if (!code)
            return Toast.show({
                type: 'error',
                text1: 'Error',
                text2: 'Code is required',
                visibilityTime: 4000,
                autoHide: true,
            });
            


        try {
            //set loading to true
            setIsLoading(true);
            // Get token from AsyncStorage
            const token = await AsyncStorage.getItem('token');
            // Send data to your backend
            const formData = new FormData();

            console.log("formData before", formData);
            formData.append('name', name);
            formData.append('category_id', category_id);
            formData.append('employee_id', employee_id);
            formData.append('code', code);
            formData.append('serial_number', serial_number);
            formData.append('description', description);
            formData.append('status', status);
            formData.append('coordinates', coordinates);

            if (photo && photo.length > 0) {
                formData.append('image', {
                    uri: photo,
                    type: 'image/jpeg',
                    name: 'photo.jpg',
                });
            }
            if (purchaseDate) {
                formData.append('purchase_date', purchaseDate);
            }
            if (warrantyDate) {
                formData.append('warranty_date', warrantyDate);
            }
            if (decommissionDate) {
                formData.append('decommission_date', decommissionDate);
            }
            console.log("formData after", formData);

            const response = await axios.post(
                'https://test.tokenlessreport.optitech.co.ke/api/v1/assets',
                formData,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'multipart/form-data',
                    },
                },
            );

            //set loading to false
            setIsLoading(false);

            console.log(response.data);
            // Clear form fields
            setAssetDetails({
                name: '',
                category_id: '',
                employee_id: '',
                description: '',
                code: '',
                serial_number: '',
                status: 'available',
                coordinates: null,
            });

            setPhoto([]);
            setPurchaseDate(null);
            setWarrantyDate(null);
            setDecommissionDate(null);
            setQrValue('');
            setShowCamera(false);           

            // Navigate to the dashboard
            navigation.navigate('Dashboard');

            // Show success message
            Toast.show({
                type: 'success',
                text1: 'Success',
                text2: 'Asset added successfully',

            });

        }
        catch (error) {
            console.log(error.response.status);
            if (error.response.status === 400) {
                // Show error message
                Toast.show({
                    type: 'error',
                    text1: 'Error',
                    text2: 'This Tag has already been used',
                });
            }

        }

        //set loading to false
        setIsLoading(false);
    };
    //Fetch categories
    const fetchCategories = async () => {
        const token = await AsyncStorage.getItem('token');
        const response = await ApiManager.get('/categories', {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        const data = response.data;
        setCategories(data);
    };

    //Fetch employees
    const fetchEmployees = async () => {
        const token = await AsyncStorage.getItem('token');
        const response = await ApiManager.get('/employees', {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        const data = response.data;
        setEmployees(data);
    }


    useEffect(() => {
        fetchCategories();
        fetchEmployees();
    }, []);

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
    if (showCamera && device) {
        return (
            <View style={styles.container}>

                <Camera
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
                <TouchableOpacity style={styles.toggleTorchButton} onPress={() => setTorch(!torch)}>
                    <Text style={styles.buttonText}>Toggle Torch</Text>
                </TouchableOpacity>
            </View>
        );
    }

    if(isLoading){
        return (
            <View style={styles.preloaderContainer}>
                <Preloader />
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
            <Text style={styles.title}>Add New Asset</Text>
            <View
                style={[styles.formContainer, showCamera && styles.dimmedBackground]}>
                <ScrollView
                    style={styles.formContainer}
                    contentContainerStyle={{
                        flexGrow: 1,
                        justifyContent: 'center',
                        paddingBottom: 20,
                    }}>
                    <TouchableOpacity
                        onPress={() => setShowCamera(!showCamera)}
                        style={styles.toggleButton}>
                        <Text style={({ color: 'white', textAlign: 'center' })}>
                            {showCamera ? 'Hide Scanner' : 'Scan Barcode/QR Code'}
                        </Text>
                    </TouchableOpacity>
                    <TextInput
                        placeholder="Name"
                        style={styles.input}
                        onChangeText={text => handleInputChange('name', text)}
                        placeholderTextColor={'gray'}
                    />
                    {/* Category Picker */}
                    <View
                        style={{
                            borderWidth: 1,
                            borderColor: 'gray',
                            borderRadius: 1,
                            marginBottom: 10,
                            width: '90%',
                            alignSelf: 'center',
                        }}>
                        <Picker
                            selectedValue={assetDetails.category_id}
                            onValueChange={itemValue =>
                                handleInputChange('category_id', itemValue)
                            }
                            style={styles.picker}>
                            <Picker.Item label="Select Category" value="" color="gray" />
                            {categories.map(category => (
                                <Picker.Item
                                    key={category.id}
                                    label={category.name}
                                    value={category.id}
                                    color={
                                        assetDetails.category_id === category.id ? 'black' : 'gray'
                                    }
                                />
                            ))}
                        </Picker>
                    </View>

                    {/* Employee Picker */}
                    <View
                        style={{
                            borderWidth: 1,
                            borderColor: 'gray',
                            borderRadius: 1,
                            marginBottom: 10,
                            width: '90%',
                            alignSelf: 'center',
                        }}>
                        <Picker
                            selectedValue={assetDetails.employee_id}
                            onValueChange={itemValue =>
                                handleInputChange('employee_id', itemValue)
                            }
                            style={styles.picker}>
                            <Picker.Item label="Select Employee" value="" color="gray" />
                            {employees.map(employee => (
                                <Picker.Item
                                    key={employee.id}
                                    label={employee.name}
                                    value={employee.id}
                                    color={
                                        assetDetails.employee_id === employee.id ? 'black' : 'gray'
                                    }
                                />
                            ))}
                        </Picker>
                    </View>

                    <TextInput
                        placeholder="Description"
                        style={styles.input}
                        onChangeText={text => handleInputChange('description', text)}
                        placeholderTextColor={'gray'}
                    />
                    <TextInput
                        placeholder="Code"
                        placeholderTextColor={'gray'}
                        style={styles.input}
                        value={qrValue}
                        editable={false}
                    />
                    <TextInput
                        placeholder="Serial Number"
                        style={styles.input}
                        onChangeText={text => handleInputChange('serial_number', text)}
                        placeholderTextColor={'gray'}
                    />
                    <TouchableOpacity
                        onPress={() => openDatePicker('purchase')}
                        style={styles.dateInput}>
                        <Text style={styles.datePickerText}>
                            {purchaseDate ? `${purchaseDate}` : 'Select Purchase Date'}
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        onPress={() => openDatePicker('warranty')}
                        style={styles.dateInput}>
                        <Text style={styles.datePickerText}>
                            {warrantyDate ? `${warrantyDate}` : 'Select Warranty Date'}
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        onPress={() => openDatePicker('decommission')}
                        style={styles.dateInput}>
                        <Text style={styles.datePickerText}>
                            {decommissionDate ? `${decommissionDate}` : 'Select Decommission Date'}
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
                                weekDaysTextStyle={{ color: 'black' }}
                            />
                        </View>
                    )}

                    <TouchableOpacity onPress={takePhoto} style={styles.submitButton}>
                        <Text style={styles.buttonText}>Pick Image</Text>
                    </TouchableOpacity>

                    <TouchableOpacity onPress={handleSubmit} style={styles.submitButton}>
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
        zIndex: 1000,
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
    toggleTorchButton: {
        position: 'absolute',
        bottom: 100,
        padding: 10,
        backgroundColor: '#4CAF50',
        borderRadius: 5,
    },
});

export default AddAsset;
