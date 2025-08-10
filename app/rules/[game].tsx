import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

const gameRules = {
  blackjack: {
    title: 'Blackjack 21',
    objective: 'Get as close to 21 as possible without going over, while beating the dealer\'s hand.',
    rules: [
      'Cards 2-10 are worth their face value',
      'Face cards (J, Q, K) are worth 10 points',
      'Aces can be worth 1 or 11 points',
      'If your first two cards total 21, you have "Blackjack" and win 3:2',
      'If you go over 21, you "bust" and lose immediately',
      'Dealer must hit on 16 and stand on 17',
      'You can "Hit" to take another card or "Stand" to keep your current total',
      'You can "Double" your bet and take exactly one more card',
    ],
    strategy: [
      'Always hit if your total is 11 or less',
      'Always stand if your total is 17 or more',
      'Consider the dealer\'s up card when deciding',
      'Double down on 11 against dealer 2-10',
      'Double down on 10 against dealer 2-9',
    ],
  },
  roulette: {
    title: 'Roulette',
    objective: 'Predict where the ball will land on the spinning wheel.',
    rules: [
      'The wheel has numbers 0-36',
      'Numbers 1-36 are either red or black',
      'Zero (0) is green',
      'You can bet on individual numbers, colors, or groups',
      'Red/Black, Even/Odd pay 1:1',
      'Straight number bets pay 35:1',
      'All bets lose if the ball lands on 0 (except 0 bets)',
    ],
    strategy: [
      'Even money bets (red/black, even/odd) have the best odds',
      'Straight number bets have the highest payout but lowest probability',
      'The house edge comes from the green zero',
      'Manage your bankroll carefully',
    ],
  },
  baccarat: {
    title: 'Baccarat',
    objective: 'Bet on whether the Player or Banker hand will have a total closest to 9.',
    rules: [
      'Cards 2-9 are worth their face value',
      'Aces are worth 1 point',
      'Face cards and 10s are worth 0 points',
      'Hand values are calculated by adding cards and taking the last digit',
      'Both Player and Banker receive 2 cards initially',
      'Third card rules are automatic and complex',
      'Player bet pays 1:1',
      'Banker bet pays 1:1 minus 5% commission',
      'Tie bet pays 8:1',
    ],
    strategy: [
      'Banker bet has the lowest house edge (1.06%)',
      'Player bet has slightly higher house edge (1.24%)',
      'Tie bet has very high house edge (14.4%) - avoid it',
      'Baccarat is largely a game of chance',
    ],
  },
};

export default function GameRulesScreen() {
  const { game } = useLocalSearchParams<{ game: string }>();
  const rules = gameRules[game as keyof typeof gameRules];

  if (!rules) {
    return (
      <LinearGradient colors={['#0F121A', '#1A1D29']} style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Game rules not found</Text>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={styles.backText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient colors={['#0F121A', '#1A1D29']} style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="chevron-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.title}>{rules.title} Rules</Text>
        <View style={styles.headerSpace} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Objective */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="target" size={24} color="#00FFC6" />
            <Text style={styles.sectionTitle}>Objective</Text>
          </View>
          <Text style={styles.objectiveText}>{rules.objective}</Text>
        </View>

        {/* Rules */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="list" size={24} color="#FFD54A" />
            <Text style={styles.sectionTitle}>Rules</Text>
          </View>
          <View style={styles.rulesCard}>
            {rules.rules.map((rule, index) => (
              <View key={index} style={styles.ruleItem}>
                <View style={styles.ruleNumber}>
                  <Text style={styles.ruleNumberText}>{index + 1}</Text>
                </View>
                <Text style={styles.ruleText}>{rule}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Strategy */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="bulb" size={24} color="#E84545" />
            <Text style={styles.sectionTitle}>Strategy Tips</Text>
          </View>
          <View style={styles.strategyCard}>
            {rules.strategy.map((tip, index) => (
              <View key={index} style={styles.strategyItem}>
                <Ionicons name="checkmark-circle" size={16} color="#4CAF50" />
                <Text style={styles.strategyText}>{tip}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Play Button */}
        <View style={styles.playSection}>
          <TouchableOpacity
            style={styles.playButton}
            onPress={() => {
              router.back();
              router.push(`/games/${game}` as any);
            }}
          >
            <LinearGradient
              colors={['#00FFC6', '#00D4AA']}
              style={styles.playGradient}
            >
              <Ionicons name="play" size={20} color="#0F121A" />
              <Text style={styles.playButtonText}>Play {rules.title}</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#1A1D29',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  headerSpace: {
    width: 40,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  section: {
    marginBottom: 32,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 12,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  objectiveText: {
    fontSize: 16,
    color: '#FFFFFF',
    lineHeight: 24,
    backgroundColor: '#1A1D29',
    padding: 16,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#00FFC6',
  },
  rulesCard: {
    backgroundColor: '#1A1D29',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#2A2D3A',
  },
  ruleItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
    gap: 12,
  },
  ruleNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#FFD54A',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  ruleNumberText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#0F121A',
  },
  ruleText: {
    fontSize: 14,
    color: '#FFFFFF',
    lineHeight: 20,
    flex: 1,
  },
  strategyCard: {
    backgroundColor: '#1A1D29',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#2A2D3A',
  },
  strategyItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
    gap: 12,
  },
  strategyText: {
    fontSize: 14,
    color: '#FFFFFF',
    lineHeight: 20,
    flex: 1,
  },
  playSection: {
    paddingBottom: 32,
  },
  playButton: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  playGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 8,
  },
  playButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0F121A',
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorText: {
    fontSize: 18,
    color: '#FFFFFF',
    marginBottom: 16,
  },
  backText: {
    fontSize: 16,
    color: '#00FFC6',
    textDecorationLine: 'underline',
  },
});