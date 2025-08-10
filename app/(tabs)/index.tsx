import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { router } from 'expo-router';
import { useAuthStore } from '@/store/useAuthStore';
import { useWalletStore } from '@/store/useWalletStore';
import { useSettingsStore } from '@/store/useSettingsStore';
import BalanceBar from '@/components/BalanceBar';
import GameCard3D from '@/components/GameCard3D';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

const games = [
  {
    id: 'blackjack',
    name: 'Blackjack 21',
    description: 'Classic card game',
    route: '/games/blackjack',
    rulesRoute: '/rules/blackjack',
    color: ['#E84545', '#C73E3A'],
    icon: 'card' as const,
    playable: true,
  },
  {
    id: 'roulette',
    name: 'Roulette',
    description: 'Spin the wheel',
    route: '/games/roulette',
    rulesRoute: '/rules/roulette',
    color: ['#4A90E2', '#357ABD'],
    icon: 'radio-button-on' as const,
    playable: false,
  },
  {
    id: 'baccarat',
    name: 'Baccarat',
    description: 'High stakes card game',
    route: '/games/baccarat',
    rulesRoute: '/rules/baccarat',
    color: ['#9C27B0', '#7B1FA2'],
    icon: 'diamond' as const,
    playable: false,
  },
];

export default function HomeScreen() {
  const { user, isAuthenticated, checkAuthState } = useAuthStore();
  const { loadWalletData, collectDailyBonus, dailyBonusCollected } = useWalletStore();
  const { loadSettings } = useSettingsStore();

  useEffect(() => {
    checkAuthState();
    loadSettings();
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      loadWalletData();
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace('/(auth)/login');
    }
  }, [isAuthenticated]);

  const handleDailyBonus = async () => {
    const success = await collectDailyBonus();
    if (success) {
      // Show success feedback
    }
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <LinearGradient colors={['#0F121A', '#1A1D29']} style={styles.container}>
      <BalanceBar />
      
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.welcomeText}>Welcome back,</Text>
          <Text style={styles.usernameText}>{user?.username}</Text>
          
          {!dailyBonusCollected && (
            <TouchableOpacity style={styles.bonusButton} onPress={handleDailyBonus}>
              <LinearGradient
                colors={['#00FFC6', '#00D4AA']}
                style={styles.bonusGradient}
              >
                <Ionicons name="gift" size={20} color="#0F121A" />
                <Text style={styles.bonusText}>Collect Daily Bonus (+200)</Text>
              </LinearGradient>
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.gamesSection}>
          <Text style={styles.sectionTitle}>Choose Your Game</Text>
          
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.gamesCarousel}
            snapToInterval={width * 0.8 + 16}
            decelerationRate="fast"
          >
            {games.map((game) => (
              <GameCard3D
                key={game.id}
                game={game}
                width={width * 0.8}
                onPlay={() => router.push(game.route as any)}
                onRules={() => router.push(game.rulesRoute as any)}
              />
            ))}
          </ScrollView>
        </View>

        <View style={styles.statsSection}>
          <Text style={styles.sectionTitle}>Quick Stats</Text>
          <View style={styles.statsGrid}>
            <StatCard title="Games Played" value="0" icon="game-controller" />
            <StatCard title="Total Winnings" value="0" icon="trophy" />
            <StatCard title="Win Rate" value="0%" icon="trending-up" />
            <StatCard title="Best Streak" value="0" icon="flame" />
          </View>
        </View>
      </ScrollView>
    </LinearGradient>
  );
}

interface StatCardProps {
  title: string;
  value: string;
  icon: keyof typeof Ionicons.glyphMap;
}

function StatCard({ title, value, icon }: StatCardProps) {
  return (
    <View style={styles.statCard}>
      <View style={styles.statHeader}>
        <Ionicons name={icon} size={24} color="#00FFC6" />
        <Text style={styles.statValue}>{value}</Text>
      </View>
      <Text style={styles.statTitle}>{title}</Text>
    </View>
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
  welcomeText: {
    fontSize: 18,
    color: '#FFFFFF',
    opacity: 0.8,
  },
  usernameText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#00FFC6',
    marginBottom: 20,
  },
  bonusButton: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  bonusGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    gap: 8,
  },
  bonusText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#0F121A',
  },
  gamesSection: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 16,
    paddingHorizontal: 20,
  },
  gamesCarousel: {
    paddingHorizontal: 20,
    gap: 16,
  },
  statsSection: {
    paddingHorizontal: 20,
    paddingBottom: 32,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  statCard: {
    backgroundColor: '#1A1D29',
    borderRadius: 12,
    padding: 16,
    flex: 1,
    minWidth: '45%',
    borderWidth: 1,
    borderColor: '#2A2D3A',
  },
  statHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  statTitle: {
    fontSize: 14,
    color: '#FFFFFF',
    opacity: 0.7,
  },
});