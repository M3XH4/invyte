import { Button, StyleSheet, Text, View } from 'react-native'
import React from 'react'
import { useRouter } from 'expo-router';

export default function GettingStartedScreen() {
 const router = useRouter();

  return (
    <View>
      <Text>Welcome! This is your getting started screen 🚀</Text>
      <Button title="Continue" onPress={() => router.replace('/tabs/index')} />
    </View>
  );
}

const styles = StyleSheet.create({})