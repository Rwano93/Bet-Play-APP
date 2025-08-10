import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import BalanceBar from '@/components/BalanceBar';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

const games = [
  {
    id: 'blackjack',
    name: 'Blackjack 21',
    description: 'Beat the dealer without going over 21',
    route: '/games/blackjack',
    icon: 'card' as const,
    color: ['#E84545', '#C73E3A'],
    playable: true,
    minBet: 1,
    maxBet: 100,
  },
  {
    id: 'roulette',
    name: 'Roulette',
    description: 'Place your bets and spin the wheel',
    route: '/games/roulette',
    icon: 'radio-button-on' as const,
    color: ['#4A90E2', '#357ABD'],
    playable: false,
    minBet: 5,
    maxBet: 500,
  },
  {
    id: 'baccarat',
    name: 'Baccarat',
    description: 'High stakes card game for VIPs',
    route: '/games/baccarat',
    icon: 'diamond' as const,
    color: ['#9C27B0', '#7B1FA2'],
    playable: false,
    minBet: 10,
    maxBet: 500,
  },
];

export default function GamesScreen() {
  return (
    <LinearGradient colors={['#0F121A', '#1A1D29']} style={styles.container}>
      <BalanceBar />
      
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>Game Library</Text>
          <Text style={styles.subtitle}>Choose your favorite casino game</Text>
        </View>

        <View style={styles.gamesList}>
          {games.map((game) => (
            <TouchableOpacity
              key={game.id}
              style={styles.gameCard}
              onPress={() => router.push(game.route as any)}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={['#1A1D29', '#2A2D3A']}
                style={styles.cardGradient}
              >
                <View style={styles.gameIcon}>
                  <LinearGradient
                    colors={game.color}
                    style={styles.iconContainer}
                  >
                    <Ionicons name={game.icon} size={32} color="#FFFFFF" />
                  </LinearGradient>
                </View>

                <View style={styles.gameDetails}>
                  <View style={styles.gameHeader}>
                    <Text style={styles.gameName}>{game.name}</Text>
                    {!game.playable && (
                      <View style={styles.demoBadge}>
                        <Text style={styles.demoText}>DEMO</Text>
                      </View>
                    )}
                  </View>
                  <Text style={styles.gameDescription}>{game.description}</Text>
                  <Text style={styles.betRange}>
                    Bet Range: {game.minBet} - {game.maxBet} chips
                  </Text>
                </View>

                <View style={styles.playIcon}>
                  <Ionicons 
                    name={game.playable ? "play-circle" : "eye-outline"} 
                    size={28} 
                    color="#00FFC6" 
                  />
                </View>
              </LinearGradient>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  header: {
    padding: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#FFFFFF',
    opacity: 0.7,
  },
  gamesList: {
    paddingHorizontal: 20,
    gap: 16,
  },
  gameCard: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  cardGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderWidth: 1,
    borderColor: '#2A2D3A',
  },
  gameIcon: {
    marginRight: 16,
  },
  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  gameDetails: {
    flex: 1,
  },
  gameHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  gameName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginRight: 12,
  },
  demoBadge: {
    backgroundColor: '#FFD54A',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  demoText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#0F121A',
  },
  gameDescription: {
    fontSize: 14,
    color: '#FFFFFF',
    opacity: 0.7,
    marginBottom: 4,
  },
  betRange: {
    fontSize: 12,
    color: '#00FFC6',
    fontWeight: '500',
  },
  playIcon: {
    marginLeft: 16,
  },
});