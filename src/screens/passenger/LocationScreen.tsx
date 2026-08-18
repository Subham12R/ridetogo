import { useRef, useState } from 'react';
import { useImage } from 'expo-image';
import * as Location from 'expo-location';
import type { AppleMaps, CameraPosition, GoogleMaps } from 'expo-maps';
import { StatusBar } from 'expo-status-bar';
import { Crosshair, MapPin } from 'lucide-react-native';
import {
  ActivityIndicator,
  Image,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

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
  controls: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 58 : 26,
    right: 16,
    left: 16,
  },
  controlRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  destinationField: {
    flex: 1,
    height: 58,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 18,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.97)',
    shadowColor: '#171717',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.16,
    shadowRadius: 12,
    elevation: 7,
  },
  destinationIcon: {
    width: 22,
    height: 22,
    marginRight: 12,
  },
  destinationInput: {
    flex: 1,
    height: 58,
    paddingVertical: 0,
    color: '#161616',
    fontSize: 16,
    fontWeight: '500',
  },
  locationButton: {
    width: 58,
    height: 58,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: 'rgba(22,22,22,0.08)',
    shadowColor: '#171717',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.16,
    shadowRadius: 12,
    elevation: 7,
  },
  locationIconSurface: {
    width: 58,
    height: 58,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
  },
  locationButtonPressed: {
    transform: [{ scale: 0.94 }],
    opacity: 0.8,
  },
  webFallback: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    backgroundColor: '#F4F3EF',
  },
  webFallbackTitle: {
    color: '#161616',
    fontSize: 20,
    fontWeight: '700',
    textAlign: 'center',
  },
  webFallbackBody: {
    marginTop: 8,
    color: '#6E6E6E',
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
  },
  autoMarkerImage: {
    width: 48,
    height: 24,
    backgroundColor: 'transparent',
  },
  skipLabelContainer: {
    position: 'absolute',
    right: 0,
    bottom: Platform.OS === 'ios' ? 34 : 24,
    left: 0,
    alignItems: 'center',
  },
  skipLabel: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.82)',
    color: '#505050',
    fontSize: 14,
    fontWeight: '600',
    shadowColor: '#171717',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.16,
    shadowRadius: 10,
    elevation: 5,
  },
});

type LocationScreenProps = {
  onComplete?: () => void;
};

export default function LocationScreen({ onComplete }: LocationScreenProps) {
  const mapsModule = loadExpoMaps();
  const expoGoMaps = loadExpoGoMapsFallback();
  const ExpoGoMapView = expoGoMaps?.default;
  const ExpoGoMarker = expoGoMaps?.Marker;
  const autoIcon = useImage(AUTO_ICON_SOURCE, {
    maxWidth: 48,
    maxHeight: 48,
  });
  const [destination, setDestination] = useState('');
  const [isLocating, setIsLocating] = useState(false);
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
      id: `dummy-auto-${index + 1}`,
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
      id: `dummy-auto-${index + 1}`,
      coordinates,
      icon: autoIcon ?? undefined,
      title: `Auto ${index + 1}`,
    })
  );

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
        <View style={styles.webFallback}>
          <Text style={styles.webFallbackTitle}>
            Maps need a development build
          </Text>
          <Text style={styles.webFallbackBody}>
            Expo Go does not include Expo Maps. Run this app in an iOS or Android
            development build to load the native map.
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
              key={`dummy-auto-${index + 1}`}
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

      <View pointerEvents="box-none" style={styles.controls}>
        <View style={styles.controlRow}>
          <View style={styles.destinationField}>
            <MapPin
              color="#E5A900"
              size={21}
              strokeWidth={2.4}
              style={styles.destinationIcon}
            />
            <TextInput
              accessibilityLabel="Destination"
              autoCapitalize="words"
              placeholder="Where are you going?"
              placeholderTextColor="#8A8A8A"
              returnKeyType="search"
              selectionColor="#E5A900"
              style={styles.destinationInput}
              value={destination}
              onChangeText={setDestination}
              onSubmitEditing={() => {
                if (destination.trim()) {
                  onComplete?.();
                }
              }}
            />
          </View>

          <Pressable
            accessibilityLabel="Use current location"
            accessibilityRole="button"
            disabled={isLocating || !isMapAvailable}
            onPress={centerOnCurrentLocation}
            style={({ pressed }) => [
              styles.locationButton,
              pressed && styles.locationButtonPressed,
            ]}
          >
            <View style={styles.locationIconSurface}>
              {isLocating ? (
                <ActivityIndicator color="#161616" />
              ) : (
                <Crosshair color="#161616" size={24} strokeWidth={2.1} />
              )}
            </View>
          </Pressable>
        </View>
      </View>

      <View style={styles.skipLabelContainer}>
        <Pressable
          accessibilityLabel="Skip location setup for now"
          accessibilityRole="button"
          hitSlop={10}
          onPress={onComplete}
        >
          <Text style={styles.skipLabel}>Skip for now</Text>
        </Pressable>
      </View>
    </View>
  );
}
