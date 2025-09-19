import React from 'react';
import { View, StyleSheet, Text } from 'react-native';

export default function RootLayout() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Root Layout Working</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
  },
  text: {
    fontSize: 18,
    color: '#333',
  },
});