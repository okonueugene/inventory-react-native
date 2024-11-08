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
import Footer from '../components/Footer';
import { useNavigation } from '@react-navigation/native';

const data = [
  { id: '1', title: 'Add Asset', icon: 'add-circle-outline', link: 'AddAsset' },
    { id: '2', title: 'View Assets', icon: 'eye-outline', link: 'ViewAsset' },
    { id: '3', title: 'Edit Assets', icon: 'create-outline', link: 'EditAsset' },
];

const Dashboard = () => {
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
            Dashboard   
        </Text>
        <FlatList
          data={data}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          numColumns={3}
          contentContainerStyle={styles.gridContainer}
        />
        <View>
          <Footer />
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

export default Dashboard;
