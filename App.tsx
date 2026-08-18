import './global.css';

import { StatusBar } from 'expo-status-bar';
import { Text, View } from 'react-native';

export default function App() {
  return (
    <View className="flex-1 items-center justify-center bg-[#0e0e0e]">
      
      <Text className="mt-5 absolute top-12 text-2xl font-semibold tracking-tight text-[#F5F5F0]">
        Ride To Go
      </Text>
      <StatusBar style="light" />
    </View>
  );
}
