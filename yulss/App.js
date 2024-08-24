import React, { useState } from 'react';
import { StyleSheet, Text, TextInput, Button, View, Alert } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { auth, db } from './credenciales';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { collection, query, where, getDocs, addDoc } from 'firebase/firestore';
import { Picker } from '@react-native-picker/picker'; // Instala @react-native-picker/picker si no lo tienes
import Registro from './vistas/registro';
import Cliente from './vistas/cliente';
import Carrito from './vistas/carrito';
import Acerca from './vistas/acerca';
import DetallesDelProducto from './vistas/DetallesDelProducto';
import FullScreenImage from './vistas/FullScreenImage';

const Stack = createNativeStackNavigator();

function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState(''); // Nuevo estado para el nombre
  const [role, setRole] = useState('cliente'); // Nuevo estado para el rol
  const [isLogin, setIsLogin] = useState(true);

  const handleLoginOrRegister = async () => {
    try {
      if (isLogin) {
        // Iniciar sesión
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // Obtener la información adicional del usuario desde Firestore
        const q = query(collection(db, 'usuarios'), where('uid', '==', user.uid));
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
          const userData = querySnapshot.docs[0].data(); // Obtener los datos del primer (y único) documento
          console.log("Datos del usuario:", userData);

          if (userData.role === 'cliente') {
            navigation.replace('Cliente'); // Redirige a la pantalla Cliente
          } else {
            navigation.replace('Registro'); // Redirige a la pantalla Registro
          }
        } else {
          Alert.alert('Error', 'No se encontraron datos del usuario en la base de datos.');
        }
      } else {
        // Registrar usuario
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        
        // Guardar información adicional en Firestore
        await addDoc(collection(db, 'usuarios'), {
          uid: user.uid,
          email: user.email,
          name: name, // Guardar el nombre
          role: role, // Guardar el rol (Registro o cliente)
          createdAt: new Date(),
        });
        
        Alert.alert('Registro exitoso');
        navigation.replace(role === 'cliente' ? 'Cliente' : 'Registro'); // Redirige según el rol
      }
    } catch (error) {
      Alert.alert('Error', error.message);
    }
  };

  return (
    <View style={styles.container}>
      <Text>{isLogin ? 'Iniciar sesión' : 'Registrar cuenta'}</Text>
      
      {!isLogin && (
        <>
          <TextInput
            style={styles.input}
            placeholder="Nombre"
            value={name}
            onChangeText={setName}
          />
          <Picker
            selectedValue={role}
            onValueChange={(itemValue) => setRole(itemValue)}
            style={styles.picker}
          >
            <Picker.Item label="Cliente" value="cliente" />
            <Picker.Item label="Registro" value="registro" />
          </Picker>
        </>
      )}

      <TextInput
        style={styles.input}
        placeholder="Correo electrónico"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      <TextInput
        style={styles.input}
        placeholder="Contraseña"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      
      <Button title={isLogin ? 'Iniciar sesión' : 'Registrar'} onPress={handleLoginOrRegister} />
      <Button
        title={isLogin ? '¿No tienes cuenta? Regístrate' : '¿Ya tienes cuenta? Inicia sesión'}
        onPress={() => setIsLogin(!isLogin)}
      />
      <StatusBar style="auto" />
    </View>
  );
}

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Login">
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Cliente" component={Cliente} />
        <Stack.Screen name="Registro" component={Registro} />
        <Stack.Screen name="Carrito" component={Carrito} />
        <Stack.Screen name="Acerca" component={Acerca} />
        <Stack.Screen name="DetallesDelProducto" component={DetallesDelProducto} />
        <Stack.Screen name="FullScreenImage" component={FullScreenImage} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  input: {
    width: '100%',
    padding: 8,
    marginVertical: 8,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 4,
  },
  picker: {
    width: '100%',
    marginVertical: 8,
  },
});
