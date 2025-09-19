import React from 'react';
import { View, StyleSheet, Text } from 'react-native';

export default function IndexScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Resume Tracker App</Text>
      <Text style={styles.subtext}>Working correctly!</Text>
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
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  subtext: {
    fontSize: 16,
    color: '#666',
  },
});