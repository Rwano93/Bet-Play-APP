import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

interface Card {
  suit: 'hearts' | 'diamonds' | 'clubs' | 'spades';
  rank: string;
  value: number;
}

interface Card3DProps {
  card: Card | null;
  style?: any;
}

export default function Card3D({ card, style }: Card3DProps) {
  if (!card) {
    // Card back
    return (
      <View style={[styles.container, style]}>
        <LinearGradient
          colors={['#1A1D29', '#2A2D3A']}
          style={styles.cardBack}
        >
          <View style={styles.pattern}>
            <Text style={styles.patternText}>B&P</Text>
          </View>
        </LinearGradient>
      </View>
    );
  }

  const getSuitIcon = (suit: string) => {
    switch (suit) {
      case 'hearts': return 'heart';
      case 'diamonds': return 'diamond';
      case 'clubs': return 'leaf';
      case 'spades': return 'shield';
      default: return 'card';
    }
  };

  const getSuitColor = (suit: string) => {
    return suit === 'hearts' || suit === 'diamonds' ? '#E84545' : '#000000';
  };

  return (
    <View style={[styles.container, style]}>
      <LinearGradient
        colors={['#FFFFFF', '#F5F5F5']}
        style={styles.cardFace}
      >
        <View style={styles.cardHeader}>
          <Text style={[styles.rank, { color: getSuitColor(card.suit) }]}>
            {card.rank}
          </Text>
          <Ionicons 
            name={getSuitIcon(card.suit) as any} 
            size={16} 
            color={getSuitColor(card.suit)} 
          />
        </View>
        
        <View style={styles.cardCenter}>
          <Ionicons 
            name={getSuitIcon(card.suit) as any} 
            size={32} 
            color={getSuitColor(card.suit)} 
          />
        </View>
        
        <View style={styles.cardFooter}>
          <Text style={[styles.rank, styles.rankRotated, { color: getSuitColor(card.suit) }]}>
            {card.rank}
          </Text>
          <Ionicons 
            name={getSuitIcon(card.suit) as any} 
            size={16} 
            color={getSuitColor(card.suit)}
            style={styles.suitRotated}
          />
        </View>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 60,
    height: 84,
    borderRadius: 8,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  cardBack: {
    flex: 1,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#00FFC6',
  },
  pattern: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  patternText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#00FFC6',
  },
  cardFace: {
    flex: 1,
    borderRadius: 8,
    padding: 4,
    borderWidth: 1,
    borderColor: '#DDD',
  },
  cardHeader: {
    alignItems: 'flex-start',
  },
  cardCenter: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardFooter: {
    alignItems: 'flex-end',
    transform: [{ rotate: '180deg' }],
  },
  rank: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  rankRotated: {
    transform: [{ rotate: '180deg' }],
  },
  suitRotated: {
    transform: [{ rotate: '180deg' }],
  },
});