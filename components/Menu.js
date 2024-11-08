import React, { useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  DrawerLayoutAndroid,
  StyleSheet,
  FlatList,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import MenuScreen from './MenuScreen';
import QuickAccess from './QuickAcessFooter';
import { useNavigation } from '@react-navigation/native';

const data = [
  { id: '1', title: 'Add Supervisor', icon: 'person-add-outline', link: 'Supervisor' },
  { id: '2', title: 'Add Personnel', icon: 'people-outline', link: 'Personnel' },
  { id: '3', title: 'Add Task', icon: 'list-outline', link: 'Tasks' },
  { id: '4', title: 'Add Training', icon: 'school-outline', link: 'Add Training' },
  { id: '5', title: 'Add ICA', icon: 'document-text-outline', link: 'Add Ica' },
  { id: '6', title: 'Add Incident', icon: 'alert-circle-outline', link: 'Add Incident' },
  { id: '7', title: 'Add Permit', icon: 'shield-checkmark-outline', link: 'Permits Applicable' },
  { id: '8', title: 'Add EC', icon: 'leaf-outline', link: 'Add Environment Concern' },
  { id: '9', title: 'Add Responder', icon: 'medkit-outline', link: 'First Responder' },
];

const QuickAccessMenu = () => {
  const drawerRef = useRef(null);
  const navigation = useNavigation();  // Use navigation for screen transitions

  const closeDrawer = () => {
    drawerRef.current.closeDrawer();
  };

  const navigationView = () => <MenuScreen closeDrawer={closeDrawer} />;

  const handlePress = (item) => {
    // Navigate to the corresponding screen using navigation.navigate
    navigation.navigate(item.link);
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity style={styles.gridItem} onPress={() => handlePress(item)}>
      <Icon name={item.icon} size={30} color="white" />
      <Text style={styles.gridText}>{item.title}</Text>
    </TouchableOpacity>
  );

  return (
    <DrawerLayoutAndroid
      ref={drawerRef}
      drawerWidth={200}
      drawerPosition="left"
      renderNavigationView={navigationView}>
      <View style={{ flex: 1 }}>
        <Text
          style={{
            textAlign: 'center',
            fontSize: 20,
            margin: 10,
            color: '#007bff',
            fontWeight: 'bold',
          }}>
          Quick Access Menu
        </Text>
        <FlatList
          data={data}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          numColumns={3}
          contentContainerStyle={styles.gridContainer}
        />
        <View>
          <QuickAccess />
        </View>
      </View>
    </DrawerLayoutAndroid>
  );
};

const styles = StyleSheet.create({
  gridContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 10,
  },
  gridItem: {
    backgroundColor: '#007bff',
    borderRadius: 10,
    flex: 1,
    margin: 10,
    height: 100,
    justifyContent: 'center',
    alignItems: 'center',
    alignItems: 'center',
  },
  gridText: {
    color: 'white',
    marginTop: 10,
    fontSize: 16,
  },
});

export default QuickAccessMenu;
