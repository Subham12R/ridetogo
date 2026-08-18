import { useEffect, useRef, useState } from 'react';
import { Host, TextInput, type TextInputRef } from '@expo/ui';
import { StatusBar } from 'expo-status-bar';
import {
  Animated,
  Easing,
  KeyboardAvoidingView,
  Pressable,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
  type ViewStyle,
} from 'react-native';

import GradientLayer from '../../components/common/GradientLayer';

type OnboardingScreenProps = {
  onContinue?: () => void;
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
  readyToGoMark: {
    position: 'absolute',
    top: 72,
    right: 0,
    left: 0,
    zIndex: 30,
    alignItems: 'center',
  },
  inputHost: {
    width: '100%',
    height: 54,
  },
  inputFrame: {
    width: '100%',
    height: 58,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: 'rgba(0,0,0,0.2)',
    backgroundColor: 'rgba(255,255,255,0.82)',
    overflow: 'hidden',
  },
  inputFrameFocused: {
    borderColor: '#E5A900',
    backgroundColor: '#FFFDF4',
  },
  nativeInput: {
    width: '100%',
    height: 54,
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 0,
    borderWidth: 0,
    backgroundColor: 'transparent',
  },
  nativeInputText: {
    color: '#161616',
    fontSize: 16,
    fontWeight: '500',
    letterSpacing: 0,
    lineHeight: 20,
    textAlign: 'left',
  },
  onboardingPanel: {
    height: '80%',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    backgroundColor: '#FFFFFF',
    justifyContent: 'flex-start',
    paddingHorizontal: 24,
    paddingTop: 28,
    paddingBottom: 32,
    shadowColor: '#FACF61',
    shadowOffset: { width: 0, height: -8 },
    shadowOpacity: 0.18,
    shadowRadius: 20,
    elevation: 0,
  },
  onboardingContent: {
    flex: 1,
    minHeight: 0,
  },
  continueButton: {
    width: '100%',
  },
});

export default function OnboardingScreen({ onContinue }: OnboardingScreenProps) {
  const { height } = useWindowDimensions();
  const [focusedField, setFocusedField] = useState<'name' | 'phone' | null>(null);
  const nameInputRef = useRef<TextInputRef>(null);
  const mobileInputRef = useRef<TextInputRef>(null);
  const panelOpacity = useRef(new Animated.Value(0)).current;
  const panelOffset = useRef(new Animated.Value(44)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(panelOpacity, {
        toValue: 1,
        duration: 360,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
      Animated.timing(panelOffset, {
        toValue: 0,
        duration: 520,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();
  }, [panelOffset, panelOpacity]);

  return (
    <View className="flex-1 bg-white">
      <StatusBar style="dark" />

      <KeyboardAvoidingView
        behavior="height"
        className="flex-1"
        keyboardVerticalOffset={0}
      >
        <GradientLayer height="90%" translateY={-(height * 0.18)} />

        <View style={styles.readyToGoMark}>
          <Text className="text-[26px] font-bold tracking-[-1.2px] text-[#161616]">
            ReadyToGo
          </Text>
        </View>

        <Animated.View
          className="absolute inset-x-0 bottom-0 z-20"
          style={[
            styles.onboardingPanel,
            {
              opacity: panelOpacity,
              transform: [{ translateY: panelOffset }],
            } as ViewStyle,
          ]}
        >
          <View style={styles.onboardingContent}>
            <Text className="text-[26px] font-semibold tracking-[-0.8px] text-[#161616]">
              Let&apos;s get you moving
            </Text>
            <Text className="mt-2 text-sm leading-5 text-[#161616]/60">
              Tell us a little about yourself to get started.
            </Text>

            <View className="mt-5">
              <Text className="mb-2 text-[14px] font-semibold leading-6 tracking-tight text-[#777777]">
                Full name
              </Text>
              <View
                style={
                  focusedField === 'name'
                    ? StyleSheet.flatten([
                        styles.inputFrame,
                        styles.inputFrameFocused,
                      ])
                    : styles.inputFrame
                }
              >
                <Host colorScheme="light" style={styles.inputHost}>
                  <TextInput
                    ref={nameInputRef}
                    autoCapitalize="words"
                    autoComplete="name"
                    placeholder="Enter your name"
                    placeholderTextColor="#AAAAAA"
                    returnKeyType="next"
                    selectionColor="#E5A900"
                    cursorColor="#E5A900"
                    onFocus={() => setFocusedField('name')}
                    onBlur={() => setFocusedField(null)}
                    onSubmitEditing={() => mobileInputRef.current?.focus()}
                    style={styles.nativeInput}
                    textStyle={styles.nativeInputText}
                  />
                </Host>
              </View>
            </View>

            <View className="mt-4">
              <Text className="mb-2 text-[14px] font-semibold leading-6 tracking-tight text-[#777777]">
                Mobile number
              </Text>
              <View
                style={
                  focusedField === 'phone'
                    ? StyleSheet.flatten([
                        styles.inputFrame,
                        styles.inputFrameFocused,
                      ])
                    : styles.inputFrame
                }
              >
                <Host colorScheme="light" style={styles.inputHost}>
                  <TextInput
                    ref={mobileInputRef}
                    autoComplete="tel"
                    autoCorrect={false}
                    keyboardType="phone-pad"
                    placeholder="+91 00000 00000"
                    placeholderTextColor="#AAAAAA"
                    returnKeyType="done"
                    selectionColor="#E5A900"
                    cursorColor="#E5A900"
                    onFocus={() => setFocusedField('phone')}
                    onBlur={() => setFocusedField(null)}
                    style={styles.nativeInput}
                    textStyle={styles.nativeInputText}
                  />
                </Host>
              </View>
            </View>
          </View>

          <View className="mt-4" style={[styles.buttonShadow, styles.continueButton]}>
            <Pressable
              accessibilityLabel="Continue with ReadyToGo onboarding"
              accessibilityRole="button"
              className="relative h-14 items-center justify-center overflow-hidden rounded-full bg-[#1c1c1c]"
              onPress={onContinue}
              style={({ pressed }) => ({
                opacity: pressed ? 0.86 : 1,
                transform: [{ scale: pressed ? 0.98 : 1 }],
              })}
            >
              <View pointerEvents="none" style={styles.buttonHighlight} />
              <View pointerEvents="none" style={styles.buttonShade} />
              <Text style={styles.buttonLabel}>Continue</Text>
            </Pressable>
          </View>
        </Animated.View>
      </KeyboardAvoidingView>
    </View>
  );
}
