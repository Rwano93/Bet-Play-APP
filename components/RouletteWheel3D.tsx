import React from 'react';
import { View, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Circle, Text as SvgText, G, Path } from 'react-native-svg';

interface RouletteWheel3DProps {
  size: number;
  spinning?: boolean;
}

export default function RouletteWheel3D({ size, spinning = false }: RouletteWheel3DProps) {
  const numbers = [
    0, 32, 15, 19, 4, 21, 2, 25, 17, 34, 6, 27, 13, 36, 11, 30, 8, 23, 10, 5, 24, 16, 33, 1, 20, 14, 31, 9, 22, 18, 29, 7, 28, 12, 35, 3, 26
  ];
  
  const redNumbers = [1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36];
  
  const getNumberColor = (num: number) => {
    if (num === 0) return '#4CAF50';
    return redNumbers.includes(num) ? '#E84545' : '#2C2C2C';
  };

  const renderNumbers = () => {
    return numbers.map((num, index) => {
      const angle = (index * 360) / numbers.length;
      const radius = size * 0.35;
      const x = size / 2 + Math.cos((angle * Math.PI) / 180) * radius;
      const y = size / 2 + Math.sin((angle * Math.PI) / 180) * radius;

      return (
        <G key={num}>
          <Circle
            cx={x}
            cy={y}
            r={12}
            fill={getNumberColor(num)}
            stroke="#FFFFFF"
            strokeWidth={1}
          />
          <SvgText
            x={x}
            y={y + 4}
            fontSize={10}
            fill="#FFFFFF"
            textAnchor="middle"
            fontWeight="bold"
          >
            {num}
          </SvgText>
        </G>
      );
    });
  };

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <LinearGradient
        colors={['#8D6E63', '#5D4037']}
        style={styles.wheelBase}
      >
        <View style={styles.wheel}>
          <Svg width={size} height={size}>
            {/* Outer ring */}
            <Circle
              cx={size / 2}
              cy={size / 2}
              r={size * 0.45}
              fill="#8D6E63"
              stroke="#FFD54A"
              strokeWidth={3}
            />
            
            {/* Inner wheel */}
            <Circle
              cx={size / 2}
              cy={size / 2}
              r={size * 0.4}
              fill="#2C2C2C"
              stroke="#FFFFFF"
              strokeWidth={2}
            />
            
            {/* Numbers */}
            {renderNumbers()}
            
            {/* Center */}
            <Circle
              cx={size / 2}
              cy={size / 2}
              r={20}
              fill="#FFD54A"
              stroke="#FFFFFF"
              strokeWidth={2}
            />
          </Svg>
        </View>
        
        {/* Ball */}
        <View style={styles.ball}>
          <LinearGradient
            colors={['#FFFFFF', '#E0E0E0']}
            style={styles.ballGradient}
          />
        </View>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  wheelBase: {
    width: '100%',
    height: '100%',
    borderRadius: 1000,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
  },
  wheel: {
    width: '100%',
    height: '100%',
    borderRadius: 1000,
    overflow: 'hidden',
  },
  ball: {
    position: 'absolute',
    width: 12,
    height: 12,
    borderRadius: 6,
    top: '20%',
    right: '30%',
  },
  ballGradient: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
});