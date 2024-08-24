import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Modal, Button, TouchableOpacity, TextInput, Image, Alert, FlatList } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import * as ImagePicker from 'expo-image-picker';
import { getFirestore, collection, addDoc, getDocs, deleteDoc, doc, updateDoc } from 'firebase/firestore';

const db = getFirestore();

export default function Registro() {
  const [modalVisible, setModalVisible] = useState(false);
  const [productModalVisible, setProductModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [productName, setProductName] = useState('');
  const [productDescription, setProductDescription] = useState('');
  const [productType, setProductType] = useState('');
  const [productPrice, setProductPrice] = useState('');
  const [productImage, setProductImage] = useState(null);
  const [products, setProducts] = useState([]);
  const [editingProduct, setEditingProduct] = useState(null); // Estado para el producto que se está editando

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

  const handleLogout = () => {
    setModalVisible(false);
    console.log('Cerrando sesión...');
    navigation.replace('Login');
  };

  const handleRegisterProduct = () => {
    setModalVisible(false);
    setProductModalVisible(true);
  };

  const handleImagePick = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setProductImage(result.assets[0].uri);
    }
  };

  const handleAddProduct = async () => {
    if (productName && productDescription && productType && productPrice && productImage) {
      try {
        const storage = getStorage();
        const response = await fetch(productImage);
        const blob = await response.blob();
        const storageRef = ref(storage, `images/${Date.now()}`);
        await uploadBytes(storageRef, blob);
        const imageUrl = await getDownloadURL(storageRef);

        await addDoc(collection(db, 'productos'), {
          name: productName,
          description: productDescription,
          type: productType,
          price: productPrice,
          imageUrl: imageUrl,
        });

        Alert.alert('Producto agregado exitosamente');
        setProductModalVisible(false);
        fetchProducts(); // Actualizar la lista de productos
      } catch (error) {
        console.error("Error al agregar producto:", error);
        Alert.alert('Error', 'Hubo un problema al registrar el producto');
      }
    } else {
      Alert.alert('Error', 'Todos los campos son obligatorios');
    }
  };

  const handleDeleteProduct = async (id) => {
    try {
      await deleteDoc(doc(db, 'productos', id));
      fetchProducts(); // Actualizar la lista de productos
    } catch (error) {
      console.error("Error al eliminar producto:", error);
      Alert.alert('Error', 'Hubo un problema al eliminar el producto');
    }
  };

  const handleEditProduct = async () => {
    if (productName && productDescription && productType && productPrice) {
      try {
        const updatedProduct = {
          name: productName,
          description: productDescription,
          type: productType,
          price: productPrice,
        };

        if (productImage) {
          const storage = getStorage();
          const response = await fetch(productImage);
          const blob = await response.blob();
          const storageRef = ref(storage, `images/${Date.now()}`);
          await uploadBytes(storageRef, blob);
          const imageUrl = await getDownloadURL(storageRef);
          updatedProduct.imageUrl = imageUrl;
        }

        await updateDoc(doc(db, 'productos', editingProduct.id), updatedProduct);

        Alert.alert('Producto actualizado exitosamente');
        setEditModalVisible(false);
        setEditingProduct(null);
        fetchProducts(); // Actualizar la lista de productos
      } catch (error) {
        console.error("Error al actualizar producto:", error);
        Alert.alert('Error', 'Hubo un problema al actualizar el producto');
      }
    } else {
      Alert.alert('Error', 'Todos los campos son obligatorios');
    }
  };

  const renderItem = ({ item }) => (
    <View style={styles.productItem}>
      <Image source={{ uri: item.imageUrl }} style={styles.productImage} />
      <View style={styles.productInfo}>
        <Text style={styles.productName}>{item.name}</Text>
        <Text style={styles.productDescription}>{item.description}</Text>
        <Text style={styles.productType}>Tipo: {item.type}</Text>
        <Text style={styles.productPrice}>Precio: ${item.price}</Text>
        <View style={styles.buttonContainer}>
          <Button title="Editar" onPress={() => {
            setEditingProduct(item); // Establece el producto que se está editando
            setProductName(item.name);
            setProductDescription(item.description);
            setProductType(item.type);
            setProductPrice(item.price.toString());
            setProductImage(item.imageUrl);
            setEditModalVisible(true); // Muestra el modal de edición
          }} />
          <Button title="Eliminar" onPress={() => handleDeleteProduct(item.id)} />
        </View>
      </View>
    </View>
  );  

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Image 
          source={require('../assets/icon.png')}
          style={styles.logo}
        />
        <TouchableOpacity onPress={() => setModalVisible(true)} style={styles.menuButton}>
          <Text style={styles.menuText}>☰</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.title}>Lista de productos:</Text>
      <FlatList
        data={products}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
      />

      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Button title="Cerrar sesión" onPress={handleLogout} color="#d9534f" />
            <Button title="Registrar productos" onPress={handleRegisterProduct} color="#5bc0de" />
            <Button title="Cancelar" onPress={() => setModalVisible(false)} color="#f0ad4e" />
          </View>
        </View>
      </Modal>

      <Modal
        visible={productModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setProductModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <TextInput
              style={styles.input}
              placeholder="Nombre del producto"
              value={productName}
              onChangeText={setProductName}
            />
            <TextInput
              style={styles.input}
              placeholder="Descripción"
              value={productDescription}
              onChangeText={setProductDescription}
            />
            <TextInput
              style={styles.input}
              placeholder="Tipo"
              value={productType}
              onChangeText={setProductType}
            />
            <TextInput
              style={styles.input}
              placeholder="Precio"
              value={productPrice}
              onChangeText={setProductPrice}
              keyboardType="numeric"
            />
            <Button title="Seleccionar imagen" onPress={handleImagePick} color="#5bc0de" />
            {productImage && <Image source={{ uri: productImage }} style={styles.productImage} />}
            <Button title="Agregar producto" onPress={handleAddProduct} color="#5bc0de" />
            <Button title="Cancelar" onPress={() => setProductModalVisible(false)} color="#f0ad4e" />
          </View>
        </View>
      </Modal>

      <Modal
        visible={editModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setEditModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <TextInput
              style={styles.input}
              placeholder="Nombre del producto"
              value={productName}
              onChangeText={setProductName}
            />
            <TextInput
              style={styles.input}
              placeholder="Descripción"
              value={productDescription}
              onChangeText={setProductDescription}
            />
            <TextInput
              style={styles.input}
              placeholder="Tipo"
              value={productType}
              onChangeText={setProductType}
            />
            <TextInput
              style={styles.input}
              placeholder="Precio"
              value={productPrice}
              onChangeText={setProductPrice}
              keyboardType="numeric"
            />
            <Button title="Seleccionar imagen" onPress={handleImagePick} color="#5bc0de" />
            {productImage && <Image source={{ uri: productImage }} style={styles.productImage} />}
            <Button title="Guardar cambios" onPress={handleEditProduct} color="#5bc0de" />
            <Button title="Cancelar" onPress={() => setEditModalVisible(false)} color="#f0ad4e" />
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 20,
  },
  header: {
    width: '100%',
    height: 70,
    backgroundColor: '#ffffff',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    borderBottomWidth: 2,
    borderBottomColor: '#ddd',
    elevation: 3,
  },
  logo: {
    width: 50,
    height: 50,
  },
  menuButton: {
    padding: 10,
  },
  menuText: {
    fontSize: 30,
    color: '#007bff',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginVertical: 20,
    color: '#333',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
  },
  modalContent: {
    width: '90%',
    maxWidth: 400,
    padding: 20,
    backgroundColor: 'white',
    borderRadius: 10,
    elevation: 5,
    alignItems: 'center',
  },
  input: {
    width: '100%',
    padding: 12,
    marginVertical: 8,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 6,
    backgroundColor: '#fff',
  },
  productImage: {
    width: 120,
    height: 120,
    marginVertical: 10,
    borderRadius: 8,
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
  buttonContainer: {
    flexDirection: 'row',
    marginTop: 10,
  },
});
