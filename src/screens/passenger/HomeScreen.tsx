import { useEffect, useRef, useState } from 'react';
import { useImage } from 'expo-image';
import * as Location from 'expo-location';
import type { AppleMaps, CameraPosition, GoogleMaps } from 'expo-maps';
import { StatusBar } from 'expo-status-bar';
import {
  ChevronDown,
  ChevronRight,
  Crosshair,
  MapPin,
  Navigation,
  UserRound,
} from 'lucide-react-native';
import {
  ActivityIndicator,
  Image,
  PanResponder,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  useWindowDimensions,
  View,
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';

const AUTO_ICON_SOURCE = require('../../../assets/auto.png');

type MapCoordinates = {
  latitude: number;
  longitude: number;
};

const DEFAULT_COORDINATES: MapCoordinates = {
  latitude: 28.6139,
  longitude: 77.209,
};

const DEFAULT_CAMERA: CameraPosition = {
  coordinates: DEFAULT_COORDINATES,
  zoom: 12,
};

const DEFAULT_REGION = {
  latitude: 28.6139,
  longitude: 77.209,
  latitudeDelta: 0.08,
  longitudeDelta: 0.08,
};

const DUMMY_AUTO_OFFSETS = [
  { latitude: 0.0018, longitude: 0.0013 },
  { latitude: -0.0014, longitude: 0.0021 },
] as const;

const COLLAPSED_SHEET_HEIGHT = 360;
const EXPANDED_SHEET_HEIGHT = 390;

function loadExpoMaps() {
  try {
    return require('expo-maps') as typeof import('expo-maps');
  } catch {
    return null;
  }
}

function loadExpoGoMapsFallback() {
  try {
    return require('react-native-maps') as {
      default: any;
      Marker: any;
    };
  } catch {
    return null;
  }
}

function clamp(value: number, minimum: number, maximum: number) {
  return Math.min(Math.max(value, minimum), maximum);
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#E7E8E6',
  },
  map: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
  },
  webMapFallback: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#E8E9E6',
  },
  webMapFallbackTitle: {
    marginTop: 10,
    color: '#343434',
    fontSize: 16,
    fontWeight: '700',
  },
  webMapFallbackBody: {
    marginTop: 5,
    color: '#737373',
    fontSize: 13,
  },
  profileButton: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 58 : 26,
    left: 16,
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.96)',
    borderWidth: 1,
    borderColor: 'rgba(22,22,22,0.08)',
    shadowColor: '#171717',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 10,
    elevation: 7,
  },
  bottomDock: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    justifyContent: 'flex-end',
  },
  currentLocationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginHorizontal: 16,
    marginBottom: 12,
  },
  currentLocationField: {
    flex: 1,
    height: 52,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.96)',
    shadowColor: '#171717',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.16,
    shadowRadius: 10,
    elevation: 6,
  },
  currentLocationText: {
    marginLeft: 10,
    color: '#6E6E6E',
    fontSize: 15,
    fontWeight: '600',
  },
  targetButton: {
    width: 52,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 18,
    backgroundColor: '#FFF2C7',
    borderWidth: 1,
    borderColor: '#E5A900',
    shadowColor: '#171717',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.16,
    shadowRadius: 10,
    elevation: 7,
  },
  targetIconSurface: {
    width: 38,
    height: 38,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 19,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: 'rgba(22,22,22,0.08)',
  },
  targetButtonPressed: {
    transform: [{ scale: 0.95 }],
    opacity: 0.82,
  },
  bottomSheet: {
    paddingHorizontal: 18,
    paddingTop: 18,
    paddingBottom: Platform.OS === 'ios' ? 28 : 18,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    backgroundColor: '#FFFFFF',
    shadowColor: '#171717',
    shadowOffset: { width: 0, height: -5 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 12,
  },
  sheetHandleArea: {
    height: 32,
    alignItems: 'center',
    justifyContent: 'flex-start',
    marginBottom: 2,
  },
  sheetHandle: {
    alignSelf: 'center',
    width: 38,
    height: 4,
    borderRadius: 999,
    backgroundColor: '#D8D8D5',
  },
  destinationField: {
    height: 64,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 17,
    borderRadius: 20,
    backgroundColor: '#F7F7F4',
    borderWidth: 1,
    borderColor: '#E4E4E0',
  },
  destinationInput: {
    flex: 1,
    height: 64,
    marginLeft: 11,
    paddingVertical: 0,
    color: '#161616',
    fontSize: 16,
    fontWeight: '600',
  },
  findAutoButton: {
    height: 54,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 13,
    borderRadius: 18,
    backgroundColor: '#171717',
    shadowColor: '#171717',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.22,
    shadowRadius: 10,
    elevation: 7,
    zIndex: 2,
  },
  findAutoButtonDisabled: {
    backgroundColor: '#C9CAC8',
    shadowOpacity: 0.08,
    elevation: 2,
  },
  findAutoButtonPressed: {
    transform: [{ scale: 0.98 }],
    opacity: 0.9,
  },
  findAutoButtonText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '700',
  },
  findAutoButtonTextDisabled: {
    color: '#F7F7F4',
  },
  routeSelector: {
    marginTop: 16,
    padding: 14,
    borderRadius: 20,
    backgroundColor: '#F7F7F4',
    borderWidth: 1,
    borderColor: '#E4E4E0',
  },
  routeSelectorHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  routeSelectorEyebrow: {
    color: '#8A8A86',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.1,
  },
  routeSelectorTitle: {
    marginTop: 3,
    color: '#202020',
    fontSize: 16,
    fontWeight: '700',
  },
  routeSelectorToggle: {
    width: 34,
    height: 34,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 17,
    backgroundColor: '#FFFFFF',
  },
  routeOption: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E2E2DE',
  },
  routeIcon: {
    width: 34,
    height: 34,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 17,
    backgroundColor: '#FFE7A5',
  },
  routeIconImage: {
    width: 38,
    height: 20,
    backgroundColor: 'transparent',
    transform: [{ rotate: '90deg' }],
  },
  routeCopy: {
    flex: 1,
    marginLeft: 10,
  },
  routeName: {
    color: '#202020',
    fontSize: 15,
    fontWeight: '700',
  },
  routeMeta: {
    marginTop: 2,
    color: '#7A7A76',
    fontSize: 12,
  },
  routeCount: {
    color: '#5C5C58',
    fontSize: 12,
    fontWeight: '700',
  },
  autoMarkerImage: {
    width: 48,
    height: 24,
    backgroundColor: 'transparent',
    transform: [{ rotate: '90deg' }],
  },
});

export default function HomeScreen() {
  const { height: windowHeight } = useWindowDimensions();
  const mapsModule = loadExpoMaps();
  const expoGoMaps = loadExpoGoMapsFallback();
  const ExpoGoMapView = expoGoMaps?.default;
  const ExpoGoMarker = expoGoMaps?.Marker;
  const autoIcon = useImage(AUTO_ICON_SOURCE, {
    maxWidth: 48,
    maxHeight: 48,
  });
  const [destination, setDestination] = useState('');
  const [isDestinationExpanded, setIsDestinationExpanded] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const sheetHeight = useSharedValue(COLLAPSED_SHEET_HEIGHT);
  const sheetHeightPosition = useRef(COLLAPSED_SHEET_HEIGHT);
  const sheetHeightBase = useRef(COLLAPSED_SHEET_HEIGHT);
  const sheetHeightBounds = useRef({
    min: COLLAPSED_SHEET_HEIGHT,
    max: Math.min(windowHeight * 0.84, COLLAPSED_SHEET_HEIGHT + 420),
  });
  const [userCoordinates, setUserCoordinates] = useState<MapCoordinates>(
    DEFAULT_COORDINATES
  );
  const [permission, requestPermission] = Location.useForegroundPermissions();
  const appleMapRef = useRef<AppleMaps.MapView | null>(null);
  const googleMapRef = useRef<GoogleMaps.MapView | null>(null);
  const expoGoMapRef = useRef<{
    animateToRegion: (region: typeof DEFAULT_REGION, duration?: number) => void;
  } | null>(null);
  const AppleMapView = mapsModule?.AppleMaps.View;
  const GoogleMapView = mapsModule?.GoogleMaps.View;
  const isExpoMapsAvailable = Platform.OS !== 'web' && Boolean(mapsModule);
  const isExpoGoFallbackAvailable =
    Platform.OS !== 'web' && Boolean(ExpoGoMapView && ExpoGoMarker);
  const isMapAvailable = isExpoMapsAvailable || isExpoGoFallbackAvailable;
  const dummyAutoCoordinates = DUMMY_AUTO_OFFSETS.map((offset) => ({
    latitude: userCoordinates.latitude + offset.latitude,
    longitude: userCoordinates.longitude + offset.longitude,
  }));
  const googleAutoMarkers: GoogleMaps.Marker[] = dummyAutoCoordinates.map(
    (coordinates, index) => ({
      id: `home-auto-${index + 1}`,
      coordinates,
      icon: autoIcon ?? undefined,
      anchor: { x: 0.5, y: 0.5 },
      title: `Auto ${index + 1}`,
      snippet: 'Available now',
      zIndex: 1,
    })
  );
  const appleAutoAnnotations: AppleMaps.Annotation[] = dummyAutoCoordinates.map(
    (coordinates, index) => ({
      id: `home-auto-${index + 1}`,
      coordinates,
      icon: autoIcon ?? undefined,
      title: `Auto ${index + 1}`,
    })
  );
  const baseSheetHeight = isDestinationExpanded
    ? EXPANDED_SHEET_HEIGHT
    : COLLAPSED_SHEET_HEIGHT;
  sheetHeightBounds.current = {
    min: baseSheetHeight,
    max: Math.min(windowHeight * 0.84, baseSheetHeight + 420),
  };

  useEffect(() => {
    const heightDelta = baseSheetHeight - sheetHeightBase.current;
    sheetHeightBase.current = baseSheetHeight;

    if (heightDelta === 0) {
      return;
    }

    const { min, max } = sheetHeightBounds.current;
    const nextHeight = clamp(
      sheetHeightPosition.current + heightDelta,
      min,
      max
    );
    sheetHeightPosition.current = nextHeight;
    sheetHeight.value = withSpring(nextHeight, {
      damping: 22,
      mass: 0.8,
      stiffness: 180,
    });
  }, [baseSheetHeight, sheetHeight]);

  const sheetAnimatedStyle = useAnimatedStyle(() => ({
    height: sheetHeight.value,
  }));

  const settleSheetDrag = (dragAmount: number) => {
    const { min, max } = sheetHeightBounds.current;
    const nextPosition = clamp(
      sheetHeightPosition.current - dragAmount,
      min,
      max
    );
    sheetHeightPosition.current = nextPosition;
    sheetHeight.value = withSpring(nextPosition, {
      damping: 22,
      mass: 0.8,
      stiffness: 180,
    });
  };
  const sheetPanResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gestureState) =>
        Math.abs(gestureState.dy) > 4 &&
        Math.abs(gestureState.dy) > Math.abs(gestureState.dx),
      onPanResponderGrant: () => {
        sheetHeightPosition.current = sheetHeight.value;
      },
      onPanResponderMove: (_, gestureState) => {
        const { min, max } = sheetHeightBounds.current;
        sheetHeight.value = clamp(
          sheetHeightPosition.current - gestureState.dy,
          min,
          max
        );
      },
      onPanResponderRelease: (_, gestureState) => {
        settleSheetDrag(gestureState.dy);
      },
      onPanResponderTerminate: (_, gestureState) => {
        settleSheetDrag(gestureState.dy);
      },
    })
  ).current;

  const centerOnCurrentLocation = async () => {
    setIsLocating(true);

    try {
      let permissionResponse = permission;

      if (!permissionResponse?.granted) {
        permissionResponse = await requestPermission();
      }

      if (!permissionResponse.granted) {
        return;
      }

      const currentLocation = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      const coordinates = {
        latitude: currentLocation.coords.latitude,
        longitude: currentLocation.coords.longitude,
      };
      setUserCoordinates(coordinates);

      if (!isExpoMapsAvailable) {
        expoGoMapRef.current?.animateToRegion(
          {
            ...coordinates,
            latitudeDelta: 0.02,
            longitudeDelta: 0.02,
          },
          650
        );
        return;
      }

      if (Platform.OS === 'ios') {
        appleMapRef.current?.setCameraPosition({
          coordinates,
          zoom: 15,
        });
      } else if (Platform.OS === 'android') {
        googleMapRef.current?.setCameraPosition({
          coordinates,
          duration: 650,
          zoom: 15,
        });
      }
    } finally {
      setIsLocating(false);
    }
  };

  const handleDestinationChange = (value: string) => {
    setIsDestinationExpanded(true);
    setDestination(value);
  };

  const revealFindAuto = () => {
    setIsDestinationExpanded(true);
  };

  const mapProperties = {
    isMyLocationEnabled: permission?.granted === true,
  };

  return (
    <View style={styles.screen}>
      <StatusBar style="dark" />

      {Platform.OS === 'ios' && isExpoMapsAvailable && AppleMapView && (
        <AppleMapView
          ref={appleMapRef}
          cameraPosition={DEFAULT_CAMERA}
          annotations={appleAutoAnnotations}
          properties={mapProperties}
          style={styles.map}
          uiSettings={{
            compassEnabled: false,
            myLocationButtonEnabled: false,
            scaleBarEnabled: false,
          }}
        />
      )}

      {Platform.OS === 'android' && isExpoMapsAvailable && GoogleMapView && (
        <GoogleMapView
          ref={googleMapRef}
          cameraPosition={DEFAULT_CAMERA}
          markers={googleAutoMarkers}
          properties={mapProperties}
          style={styles.map}
          uiSettings={{
            compassEnabled: false,
            myLocationButtonEnabled: false,
            scaleBarEnabled: false,
          }}
        />
      )}

      {!isMapAvailable && (
        <View style={styles.webMapFallback}>
          <MapPin color="#E5A900" size={30} strokeWidth={2} />
          <Text style={styles.webMapFallbackTitle}>Map area</Text>
          <Text style={styles.webMapFallbackBody}>
            Use a development build to load the native map.
          </Text>
        </View>
      )}

      {!isExpoMapsAvailable && ExpoGoMapView && ExpoGoMarker && Platform.OS !== 'web' && (
        <ExpoGoMapView
          ref={expoGoMapRef}
          initialRegion={DEFAULT_REGION}
          showsCompass={false}
          showsMyLocationButton={false}
          showsUserLocation={permission?.granted === true}
          style={styles.map}
        >
          {dummyAutoCoordinates.map((coordinates, index) => (
            <ExpoGoMarker
              key={`home-auto-${index + 1}`}
              anchor={{ x: 0.5, y: 0.5 }}
              coordinate={coordinates}
              title={`Auto ${index + 1}`}
              tracksViewChanges={false}
            >
              <Image
                source={AUTO_ICON_SOURCE}
                style={styles.autoMarkerImage}
                resizeMode="contain"
              />
            </ExpoGoMarker>
          ))}
        </ExpoGoMapView>
      )}

      <View style={styles.profileButton}>
        <UserRound color="#171717" size={23} strokeWidth={2.1} />
      </View>

      <View pointerEvents="box-none" style={styles.bottomDock}>
        <View style={styles.currentLocationRow}>
          <View style={styles.currentLocationField}>
            <Navigation color="#E5A900" size={19} strokeWidth={2.2} />
            <Text style={styles.currentLocationText}>Current location</Text>
          </View>

          <Pressable
            accessibilityLabel="Use current location"
            accessibilityRole="button"
            disabled={isLocating || !isMapAvailable}
            onPress={centerOnCurrentLocation}
            style={({ pressed }) => [
              styles.targetButton,
              pressed && styles.targetButtonPressed,
            ]}
          >
            <View style={styles.targetIconSurface}>
              {isLocating ? (
                <ActivityIndicator color="#171717" />
              ) : (
                <Crosshair color="#171717" size={23} strokeWidth={2.1} />
              )}
            </View>
          </Pressable>
        </View>

        <Animated.View style={[styles.bottomSheet, sheetAnimatedStyle]}>
          <View {...sheetPanResponder.panHandlers} style={styles.sheetHandleArea}>
            <View style={styles.sheetHandle} />
          </View>

          <View style={styles.destinationField}>
            <MapPin color="#E5A900" size={21} strokeWidth={2.3} />
            <TextInput
              accessibilityLabel="Destination"
              autoCapitalize="words"
              placeholder="Where are you going?"
              placeholderTextColor="#8A8A8A"
              returnKeyType="done"
              selectionColor="#E5A900"
              style={styles.destinationInput}
              value={destination}
              onChangeText={handleDestinationChange}
              onFocus={revealFindAuto}
            />
          </View>

          <Pressable
            accessibilityLabel="Find my auto"
            accessibilityRole="button"
            accessibilityState={{ disabled: true }}
            disabled
            style={[styles.findAutoButton, styles.findAutoButtonDisabled]}
          >
            <Text
              style={[styles.findAutoButtonText, styles.findAutoButtonTextDisabled]}
            >
              Find My Auto
            </Text>
            <ChevronRight
              color="#F7F7F4"
              size={20}
              strokeWidth={2.3}
              style={{ marginLeft: 8 }}
            />
          </Pressable>

          <View style={styles.routeSelector}>
            <View style={styles.routeSelectorHeader}>
              <View>    
                <Text style={styles.routeSelectorTitle}>Choose your ride</Text>
              </View>
              <View style={styles.routeSelectorToggle}>
                <ChevronDown color="#171717" size={19} strokeWidth={2.2} />
              </View>
            </View>

            <View style={styles.routeOption}>
              <View >
                <Image
                  source={AUTO_ICON_SOURCE}
                  style={styles.routeIconImage}
                  resizeMode="contain"
                />
              </View>
              <View style={styles.routeCopy}>
                <Text style={styles.routeName}>Auto</Text>
                <Text style={styles.routeMeta}>Quick and comfortable</Text>
              </View>
              <Text style={styles.routeCount}>2 nearby</Text>
            </View>
          </View>
        </Animated.View>
      </View>
    </View>
  );
}
