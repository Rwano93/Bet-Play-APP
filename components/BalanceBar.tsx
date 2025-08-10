import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { useWalletStore } from '@/store/useWalletStore';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';

export default function BalanceBar() {
  const balance = useWalletStore((state) => state.balance);
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePress = () => {
    scale.value = withSpring(0.95, { duration: 100 }, () => {
      scale.value = withSpring(1, { duration: 100 });
    });
    router.push('/(tabs)/wallet');
  };

  const formatBalance = (amount: number) => {
    return amount.toLocaleString();
  };

  return (
    <View style={styles.container}>
      <Animated.View style={animatedStyle}>
        <TouchableOpacity onPress={handlePress} activeOpacity={0.8}>
          <LinearGradient
            colors={['#FFD54A', '#FFC107']}
            style={styles.balanceContainer}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <View style={styles.content}>
              <Ionicons name="diamond" size={20} color="#0F121A" />
              <Text style={styles.balanceText}>{formatBalance(balance)}</Text>
              <Ionicons name="chevron-forward" size={16} color="#0F121A" />
            </View>
          </LinearGradient>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
    backgroundColor: '#0F121A',
  },
  balanceContainer: {
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    elevation: 4,
    shadowColor: '#FFD54A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  balanceText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0F121A',
    minWidth: 80,
    textAlign: 'center',
  },
});