import { StatusBar } from 'expo-status-bar';
import {
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import GradientLayer from '../../components/common/GradientLayer';

type SplashScreenProps = {
  onGetStarted?: () => void;
};

const styles = StyleSheet.create({
  buttonShadow: {
    borderRadius: 999,
    elevation: 8,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 7 },
    shadowOpacity: 0.34,
    shadowRadius: 8,
  },
  buttonHighlight: {
    position: 'absolute',
    top: 1,
    right: 1,
    bottom: 1,
    left: 1,
    borderRadius: 999,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.22)',
  },
  buttonShade: {
    position: 'absolute',
    top: 3,
    right: 3,
    bottom: 1,
    left: 3,
    borderRadius: 999,
    borderWidth: 5,
    borderColor: 'rgba(0,0,0,0.08)',
  },
  buttonLabel: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    textShadowColor: 'rgba(0,0,0,0.62)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 1,
  },
  logo: {
    position: 'absolute',
    top: '50%',
    right: 0,
    left: 0,
    zIndex: 10,
    alignItems: 'center',
  },
});

export default function SplashScreen({ onGetStarted }: SplashScreenProps) {
  return (
    <View className="flex-1 items-center text-center bg-white">
      <StatusBar style="dark" />

      <Text style={styles.logo} className="text-[32px] text-center font-bold tracking-tight text-[#161616]">
        ReadyToGo
      </Text>

      <GradientLayer height={330} />

      <View className="absolute inset-x-6 bottom-8 z-10" style={styles.buttonShadow}>
        <Pressable
          accessibilityLabel="Get started with ReadyToGo"
          accessibilityRole="button"
          className="relative h-14 items-center justify-center overflow-hidden rounded-full bg-[#1c1c1c]"
          onPress={onGetStarted}
          style={({ pressed }) => ({
            opacity: pressed ? 0.86 : 1,
            transform: [{ scale: pressed ? 0.98 : 1 }],
          })}
        >
          <View pointerEvents="none" style={styles.buttonHighlight} />
          <View pointerEvents="none" style={styles.buttonShade} />
          <Text style={styles.buttonLabel}>Get started</Text>
        </Pressable>
      </View>
    </View>
  );
}
