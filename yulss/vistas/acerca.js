import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function Acerca() {
  return (
    <View style={styles.container}>
      <Text>Acerca de Nosotros</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
