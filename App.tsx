import { useState } from 'react';
import './global.css';

import LocationScreen from './src/screens/passenger/LocationScreen';
import HomeScreen from './src/screens/passenger/HomeScreen';
import OnboardingScreen from './src/screens/passenger/OnboardingScreen';
import SplashScreen from './src/screens/passenger/SplashScreen';

export default function App() {
  const [screen, setScreen] = useState<
    'splash' | 'onboarding' | 'location' | 'home'
  >('splash');

  if (screen === 'home') {
    return <HomeScreen />;
  }

  if (screen === 'location') {
    return <LocationScreen onComplete={() => setScreen('home')} />;
  }

  if (screen === 'onboarding') {
    return <OnboardingScreen onContinue={() => setScreen('location')} />;
  }

  return <SplashScreen onGetStarted={() => setScreen('onboarding')} />;
}
