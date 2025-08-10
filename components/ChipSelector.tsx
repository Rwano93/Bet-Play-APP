import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';

interface ChipSelectorProps {
  selectedValue: number;
  onSelect: (value: number) => void;
  availableChips?: number[];
}

const chipData = [
  { value: 1, color: ['#FFFFFF', '#F5F5F5'], textColor: '#000' },
  { value: 2, color: ['#808080', '#666666'], textColor: '#FFF' },
  { value: 5, color: ['#E84545', '#C73E3A'], textColor: '#FFF' },
  { value: 10, color: ['#4A90E2', '#357ABD'], textColor: '#FFF' },
  { value: 20, color: ['#4CAF50', '#43A047'], textColor: '#FFF' },
  { value: 50, color: ['#2C2C2C', '#1A1A1A'], textColor: '#FFF' },
  { value: 100, color: ['#9C27B0', '#7B1FA2'], textColor: '#FFF' },
  { value: 500, color: ['#FFD54A', '#FFC107'], textColor: '#000' },
];

export default function ChipSelector({ selectedValue, onSelect, availableChips }: ChipSelectorProps) {
  const chips = availableChips ? chipData.filter(chip => availableChips.includes(chip.value)) : chipData;

  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {chips.map((chip) => (
          <ChipButton
            key={chip.value}
            chip={chip}
            isSelected={selectedValue === chip.value}
            onPress={() => onSelect(chip.value)}
          />
        ))}
      </ScrollView>
    </View>
  );
}

interface ChipButtonProps {
  chip: typeof chipData[0];
  isSelected: boolean;
  onPress: () => void;
}

function ChipButton({ chip, isSelected, onPress }: ChipButtonProps) {
  const scale = useSharedValue(1);
  const borderWidth = useSharedValue(isSelected ? 3 : 0);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    borderWidth: borderWidth.value,
  }));

  React.useEffect(() => {
    borderWidth.value = withSpring(isSelected ? 3 : 0);
  }, [isSelected]);

  const handlePress = () => {
    scale.value = withSpring(0.9, { duration: 100 }, () => {
      scale.value = withSpring(1, { duration: 100 });
    });
    onPress();
  };

  return (
    <Animated.View style={[styles.chipContainer, animatedStyle]}>
      <TouchableOpacity onPress={handlePress} activeOpacity={0.8}>
        <LinearGradient
          colors={chip.color}
          style={styles.chip}
        >
          <Text style={[styles.chipText, { color: chip.textColor }]}>
            {chip.value}
          </Text>
        </LinearGradient>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 16,
  },
  scrollContent: {
    paddingHorizontal: 16,
    gap: 12,
  },
  chipContainer: {
    borderColor: '#00FFC6',
    borderRadius: 30,
  },
  chip: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  chipText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
});