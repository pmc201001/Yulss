import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Image, FlatList, TouchableOpacity } from 'react-native';
import Modal from 'react-native-modal';
import { useNavigation } from '@react-navigation/native';
import { getFirestore, collection, getDocs } from 'firebase/firestore';
import { getAuth, signOut } from 'firebase/auth';

const db = getFirestore();
const auth = getAuth();

export default function Clientes() {
  const [products, setProducts] = useState([]);
  const [isModalVisible, setModalVisible] = useState(false);
  const navigation = useNavigation();

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'productos'));
      const productsList = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setProducts(productsList);
    } catch (error) {
      console.error("Error al obtener productos:", error);
    }
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.productItem}
      onPress={() => navigation.navigate('DetallesDelProducto', { product: item })} // Navega a ProductDetails con los datos del producto
    >
      <Image source={{ uri: item.imageUrl }} style={styles.productImage} />
      <View style={styles.productInfo}>
        <Text style={styles.productName}>{item.name}</Text>
        <Text style={styles.productDescription}>{item.description}</Text>
        <Text style={styles.productType}>Tipo: {item.type}</Text>
        <Text style={styles.productPrice}>Precio: ${item.price}</Text>
      </View>
    </TouchableOpacity>
  );

  const toggleModal = () => {
    setModalVisible(!isModalVisible);
  };

  const goToCart = () => {
    navigation.navigate('Carrito');
    toggleModal();
  };

  const goToAboutUs = () => {
    navigation.navigate('Acerca');
    toggleModal();
  };

  const logout = async () => {
    try {
      await signOut(auth);
      navigation.reset({
        index: 0,
        routes: [{ name: 'Login' }],
      });
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.menuButton} onPress={toggleModal}>
        <Text style={styles.menuText}>Menú</Text>
      </TouchableOpacity>
      <Modal isVisible={isModalVisible} onBackdropPress={toggleModal}>
        <View style={styles.modalContent}>
          <TouchableOpacity style={styles.modalButton} onPress={goToCart}>
            <Text style={styles.modalButtonText}>Ir al Carrito</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.modalButton} onPress={goToAboutUs}>
            <Text style={styles.modalButtonText}>Acerca de Nosotros</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.modalButton} onPress={logout}>
            <Text style={styles.modalButtonText}>Cerrar Sesión</Text>
          </TouchableOpacity>
        </View>
      </Modal>
      <Text style={styles.title}>Nuestros Productos:</Text>
      <FlatList
        data={products}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 20,
  },
  menuButton: {
    backgroundColor: '#007bff',
    padding: 10,
    borderRadius: 8,
    marginBottom: 20,
  },
  menuText: {
    color: '#fff',
    fontSize: 16,
    textAlign: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 8,
    alignItems: 'center',
  },
  modalButton: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    width: '100%',
    alignItems: 'center',
  },
  modalButtonText: {
    fontSize: 18,
    color: '#007bff',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginVertical: 20,
    color: '#333',
  },
  productItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 10,
    padding: 15,
    backgroundColor: '#ffffff',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  productImage: {
    width: 120,
    height: 120,
    borderRadius: 8,
  },
  productInfo: {
    marginLeft: 15,
    flex: 1,
  },
  productName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  productDescription: {
    fontSize: 14,
    color: '#666',
    marginVertical: 5,
  },
  productType: {
    fontSize: 14,
    color: '#007bff',
  },
  productPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#d9534f',
  },
});
