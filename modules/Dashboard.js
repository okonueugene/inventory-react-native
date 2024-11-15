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
import Header from '../components/Header';
import Footer from '../components/Footer';
import { useNavigation } from '@react-navigation/native';

const data = [
  { id: '1', title: 'Add Asset', icon: 'add-circle-outline', link: 'AddAsset' },
    { id: '2', title: 'Audit Assets', icon: 'search-outline', link: 'AuditAsset' },
    { id: '3', title: 'Edit Assets', icon: 'create-outline', link: 'EditAsset' },
];

const Dashboard = () => {
  const drawerRef = useRef(null);
  const navigation = useNavigation();  // Use navigation for screen transitions


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
    renderNavigationView={() => (
        <TouchableOpacity onPress={() => drawerRef.current.closeDrawer()}>
            <Text>Close Drawer</Text>
        </TouchableOpacity>
        )
    }
      ref={drawerRef}
      drawerWidth={200}
      drawerPosition="left"
      >
      <View style={{ flex: 1 }}>
  {/* Header */}
  <View style={styles.header}>
      <Header />
      </View>
      {/* Title */}
      <Text style={styles.title}>Dashboard</Text>
        <FlatList
          data={data}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          numRows={3}
          contentContainerStyle={styles.gridContainer}
        />
        <View style={styles.footer}>
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
  header: {
    height: 60,
    backgroundColor: '#4A90E2',
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  title: {
    fontSize: 24,
    textAlign: 'center',
    fontWeight: 'bold',
    marginVertical: 4,
    color: '#4A90E2',
  },

});

export default Dashboard;
