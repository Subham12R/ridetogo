import { LinearGradient } from 'expo-linear-gradient';
import {
  StyleSheet,
  View,
  type DimensionValue,
} from 'react-native';
import {
  Defs,
  RadialGradient,
  Rect,
  Stop,
  Svg,
} from 'react-native-svg';

type GradientLayerProps = {
  height: DimensionValue;
  translateY?: number;
};

const noiseDots: Array<{
  left: DimensionValue;
  top: DimensionValue;
  size: number;
  color: string;
  opacity: number;
}> = [
  { left: '7%', top: '72%', size: 2, color: '#FFFFFF', opacity: 0.12 },
  { left: '15%', top: '84%', size: 1, color: '#23402D', opacity: 0.1 },
  { left: '24%', top: '62%', size: 2, color: '#FFFFFF', opacity: 0.1 },
  { left: '33%', top: '88%', size: 1, color: '#23402D', opacity: 0.08 },
  { left: '42%', top: '70%', size: 2, color: '#FFFFFF', opacity: 0.12 },
  { left: '51%', top: '92%', size: 1, color: '#23402D', opacity: 0.08 },
  { left: '60%', top: '66%', size: 2, color: '#FFFFFF', opacity: 0.1 },
  { left: '69%', top: '82%', size: 1, color: '#23402D', opacity: 0.1 },
  { left: '78%', top: '73%', size: 2, color: '#FFFFFF', opacity: 0.12 },
  { left: '88%', top: '90%', size: 1, color: '#23402D', opacity: 0.08 },
];

const styles = StyleSheet.create({
  layer: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    left: 0,
    overflow: 'hidden',
    zIndex: 0,
  },
  dot: {
    position: 'absolute',
    borderRadius: 999,
  },
});

export default function GradientLayer({ height, translateY = 0 }: GradientLayerProps) {
  return (
    <View
      pointerEvents="none"
      style={[styles.layer, { height, transform: [{ translateY }] }]}
    >
      <LinearGradient
        colors={[
          'rgba(255,255,255,0)',
          'rgba(250, 190, 0, 0.8)',
          'rgba(144, 245, 30, 1)',
        ]}
        end={{ x: 0.5, y: 1 }}
        locations={[0, 0.54, 1]}
        start={{ x: 0.5, y: 0 }}
        style={StyleSheet.absoluteFill}
      />

      {noiseDots.map((dot, index) => (
        <View
          key={`${dot.left}-${dot.top}-${index}`}
          style={[
            styles.dot,
            {
              backgroundColor: dot.color,
              height: dot.size,
              left: dot.left,
              opacity: dot.opacity,
              top: dot.top,
              width: dot.size,
            },
          ]}
        />
      ))}

      <Svg height="100%" style={StyleSheet.absoluteFill} width="100%">
        <Defs>
          <RadialGradient
            cx="50%"
            cy="0%"
            id="readyToGoRadialFade"
            rx="92%"
            ry="105%"
          >
            <Stop offset="0%" stopColor="#FFFFFF" stopOpacity={1} />
            <Stop offset="34%" stopColor="#FFFFFF" stopOpacity={0.9} />
            <Stop offset="72%" stopColor="#FFFFFF" stopOpacity={0.22} />
            <Stop offset="100%" stopColor="#FFFFFF" stopOpacity={0} />
          </RadialGradient>
        </Defs>
        <Rect
          fill="url(#readyToGoRadialFade)"
          height="100%"
          width="100%"
        />
      </Svg>
    </View>
  );
}
