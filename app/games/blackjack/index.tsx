import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, Dimensions } from 'react-native';
import { router } from 'expo-router';
import { useWalletStore } from '@/store/useWalletStore';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import ChipSelector from '@/components/ChipSelector';
import Card3D from '@/components/Card3D';
import Animated, { useAnimatedStyle, useSharedValue, withSpring, withSequence } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';

const { width } = Dimensions.get('window');

interface Card {
  suit: 'hearts' | 'diamonds' | 'clubs' | 'spades';
  rank: string;
  value: number;
}

interface GameState {
  playerHand: Card[];
  dealerHand: Card[];
  playerScore: number;
  dealerScore: number;
  gamePhase: 'betting' | 'playing' | 'dealer' | 'finished';
  result: 'win' | 'lose' | 'push' | null;
  canDouble: boolean;
  canSplit: boolean;
}

const createDeck = (): Card[] => {
  const suits: Card['suit'][] = ['hearts', 'diamonds', 'clubs', 'spades'];
  const ranks = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
  const deck: Card[] = [];

  for (const suit of suits) {
    for (const rank of ranks) {
      let value = parseInt(rank);
      if (rank === 'A') value = 11;
      else if (['J', 'Q', 'K'].includes(rank)) value = 10;

      deck.push({ suit, rank, value });
    }
  }

  return shuffleDeck(deck);
};

const shuffleDeck = (deck: Card[]): Card[] => {
  const shuffled = [...deck];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

const calculateScore = (hand: Card[]): number => {
  let score = 0;
  let aces = 0;

  for (const card of hand) {
    if (card.rank === 'A') {
      aces++;
      score += 11;
    } else {
      score += card.value;
    }
  }

  while (score > 21 && aces > 0) {
    score -= 10;
    aces--;
  }

  return score;
};

export default function BlackjackScreen() {
  const [deck, setDeck] = useState<Card[]>([]);
  const [bet, setBet] = useState(5);
  const [gameState, setGameState] = useState<GameState>({
    playerHand: [],
    dealerHand: [],
    playerScore: 0,
    dealerScore: 0,
    gamePhase: 'betting',
    result: null,
    canDouble: false,
    canSplit: false,
  });

  const { balance, updateBalance } = useWalletStore();
  const tableShake = useSharedValue(0);

  const tableStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: tableShake.value }],
  }));

  useEffect(() => {
    setDeck(createDeck());
  }, []);

  const triggerHaptic = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  const dealCard = (currentDeck: Card[]) => {
    if (currentDeck.length === 0) {
      setDeck(createDeck());
      return createDeck()[0];
    }
    return currentDeck[0];
  };

  const startGame = () => {
    if (bet > balance) {
      Alert.alert('Insufficient Funds', 'You don\'t have enough chips for this bet.');
      return;
    }

    triggerHaptic();
    let newDeck = [...deck];
    
    // Deal initial cards
    const playerCard1 = dealCard(newDeck);
    newDeck = newDeck.slice(1);
    const dealerCard1 = dealCard(newDeck);
    newDeck = newDeck.slice(1);
    const playerCard2 = dealCard(newDeck);
    newDeck = newDeck.slice(1);
    const dealerCard2 = dealCard(newDeck);
    newDeck = newDeck.slice(1);

    const playerHand = [playerCard1, playerCard2];
    const dealerHand = [dealerCard1, dealerCard2];
    const playerScore = calculateScore(playerHand);
    const dealerScore = calculateScore([dealerCard1]);

    setDeck(newDeck);
    setGameState({
      playerHand,
      dealerHand,
      playerScore,
      dealerScore,
      gamePhase: 'playing',
      result: null,
      canDouble: true,
      canSplit: playerCard1.rank === playerCard2.rank,
    });

    // Check for natural blackjack
    if (playerScore === 21) {
      finishGame(playerHand, dealerHand, 'player-blackjack');
    }
  };

  const hit = () => {
    triggerHaptic();
    let newDeck = [...deck];
    const newCard = dealCard(newDeck);
    newDeck = newDeck.slice(1);

    const newPlayerHand = [...gameState.playerHand, newCard];
    const newPlayerScore = calculateScore(newPlayerHand);

    setDeck(newDeck);
    setGameState(prev => ({
      ...prev,
      playerHand: newPlayerHand,
      playerScore: newPlayerScore,
      canDouble: false,
      canSplit: false,
    }));

    if (newPlayerScore > 21) {
      finishGame(newPlayerHand, gameState.dealerHand, 'player-bust');
    }
  };

  const stand = () => {
    triggerHaptic();
    dealerPlay();
  };

  const double = () => {
    if (bet * 2 > balance) {
      Alert.alert('Insufficient Funds', 'You don\'t have enough chips to double down.');
      return;
    }

    triggerHaptic();
    setBet(bet * 2);
    
    let newDeck = [...deck];
    const newCard = dealCard(newDeck);
    newDeck = newDeck.slice(1);

    const newPlayerHand = [...gameState.playerHand, newCard];
    const newPlayerScore = calculateScore(newPlayerHand);

    setDeck(newDeck);

    if (newPlayerScore > 21) {
      finishGame(newPlayerHand, gameState.dealerHand, 'player-bust');
    } else {
      // Dealer plays after double
      setTimeout(() => dealerPlay(newPlayerHand), 1000);
    }
  };

  const dealerPlay = (finalPlayerHand?: Card[]) => {
    const playerHand = finalPlayerHand || gameState.playerHand;
    let currentDealerHand = [...gameState.dealerHand];
    let currentDeck = [...deck];

    // Reveal dealer's second card
    const dealerScore = calculateScore(currentDealerHand);

    // Dealer must hit on 16 and stand on 17
    while (calculateScore(currentDealerHand) < 17) {
      const newCard = dealCard(currentDeck);
      currentDeck = currentDeck.slice(1);
      currentDealerHand.push(newCard);
    }

    setDeck(currentDeck);
    finishGame(playerHand, currentDealerHand);
  };

  const finishGame = (finalPlayerHand: Card[], finalDealerHand: Card[], override?: string) => {
    const playerScore = calculateScore(finalPlayerHand);
    const dealerScore = calculateScore(finalDealerHand);

    let result: 'win' | 'lose' | 'push';
    let payout = 0;

    if (override === 'player-bust') {
      result = 'lose';
      payout = -bet;
    } else if (override === 'player-blackjack') {
      if (calculateScore(finalDealerHand) === 21) {
        result = 'push';
        payout = 0;
      } else {
        result = 'win';
        payout = Math.floor(bet * 1.5); // 3:2 payout for blackjack
      }
    } else if (dealerScore > 21) {
      result = 'win';
      payout = bet;
    } else if (playerScore > dealerScore) {
      result = 'win';
      payout = bet;
    } else if (dealerScore > playerScore) {
      result = 'lose';
      payout = -bet;
    } else {
      result = 'push';
      payout = 0;
    }

    // Animate result
    if (result === 'win') {
      tableShake.value = withSequence(
        withSpring(5, { duration: 100 }),
        withSpring(-5, { duration: 100 }),
        withSpring(0, { duration: 100 })
      );
    }

    // Update wallet
    updateBalance(payout, {
      type: payout > 0 ? 'win' : payout < 0 ? 'loss' : 'bonus',
      amount: Math.abs(payout),
      game: 'Blackjack 21',
      description: `${result === 'win' ? 'Won' : result === 'lose' ? 'Lost' : 'Push'} - Blackjack`,
    });

    setGameState(prev => ({
      ...prev,
      dealerScore,
      gamePhase: 'finished',
      result,
    }));
  };

  const newGame = () => {
    setGameState({
      playerHand: [],
      dealerHand: [],
      playerScore: 0,
      dealerScore: 0,
      gamePhase: 'betting',
      result: null,
      canDouble: false,
      canSplit: false,
    });
    setBet(5);
    setDeck(createDeck());
  };

  const getResultMessage = () => {
    switch (gameState.result) {
      case 'win':
        return gameState.playerScore === 21 && gameState.playerHand.length === 2 
          ? 'BLACKJACK!' 
          : 'YOU WIN!';
      case 'lose':
        return gameState.playerScore > 21 ? 'BUST!' : 'DEALER WINS';
      case 'push':
        return 'PUSH';
      default:
        return '';
    }
  };

  const getResultColor = () => {
    switch (gameState.result) {
      case 'win': return '#4CAF50';
      case 'lose': return '#E84545';
      case 'push': return '#FFD54A';
      default: return '#FFFFFF';
    }
  };

  return (
    <LinearGradient colors={['#0F121A', '#1A1D29']} style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="chevron-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.title}>Blackjack 21</Text>
        <View style={styles.balanceDisplay}>
          <Ionicons name="diamond" size={16} color="#FFD54A" />
          <Text style={styles.balanceText}>{balance.toLocaleString()}</Text>
        </View>
      </View>

      {/* Game Table */}
      <Animated.View style={[styles.table, tableStyle]}>
        <LinearGradient
          colors={['#1B5E20', '#2E7D32']}
          style={styles.tableGradient}
        >
          {/* Dealer Area */}
          <View style={styles.dealerArea}>
            <Text style={styles.areaLabel}>Dealer: {gameState.dealerScore}</Text>
            <View style={styles.handContainer}>
              {gameState.dealerHand.map((card, index) => (
                <Card3D
                  key={`dealer-${index}`}
                  card={index === 1 && gameState.gamePhase === 'playing' ? null : card}
                  style={[styles.card, { marginLeft: index > 0 ? -20 : 0 }]}
                />
              ))}
            </View>
          </View>

          {/* Player Area */}
          <View style={styles.playerArea}>
            <Text style={styles.areaLabel}>Player: {gameState.playerScore}</Text>
            <View style={styles.handContainer}>
              {gameState.playerHand.map((card, index) => (
                <Card3D
                  key={`player-${index}`}
                  card={card}
                  style={[styles.card, { marginLeft: index > 0 ? -20 : 0 }]}
                />
              ))}
            </View>
          </View>

          {/* Result Message */}
          {gameState.result && (
            <View style={styles.resultContainer}>
              <Text style={[styles.resultText, { color: getResultColor() }]}>
                {getResultMessage()}
              </Text>
            </View>
          )}
        </LinearGradient>
      </Animated.View>

      {/* Betting Area */}
      {gameState.gamePhase === 'betting' && (
        <View style={styles.bettingArea}>
          <Text style={styles.betLabel}>Place Your Bet</Text>
          <ChipSelector selectedValue={bet} onSelect={setBet} />
          
          <TouchableOpacity
            style={styles.dealButton}
            onPress={startGame}
            disabled={bet > balance}
          >
            <LinearGradient
              colors={bet > balance ? ['#666', '#555'] : ['#00FFC6', '#00D4AA']}
              style={styles.dealGradient}
            >
              <Text style={styles.dealButtonText}>Deal Cards</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      )}

      {/* Game Actions */}
      {gameState.gamePhase === 'playing' && (
        <View style={styles.actionsArea}>
          <View style={styles.actionsRow}>
            <TouchableOpacity style={styles.actionButton} onPress={hit}>
              <LinearGradient colors={['#4A90E2', '#357ABD']} style={styles.actionGradient}>
                <Text style={styles.actionText}>HIT</Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionButton} onPress={stand}>
              <LinearGradient colors={['#E84545', '#C73E3A']} style={styles.actionGradient}>
                <Text style={styles.actionText}>STAND</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>

          {gameState.canDouble && (
            <TouchableOpacity
              style={styles.actionButton}
              onPress={double}
              disabled={bet * 2 > balance}
            >
              <LinearGradient
                colors={bet * 2 > balance ? ['#666', '#555'] : ['#9C27B0', '#7B1FA2']}
                style={styles.actionGradient}
              >
                <Text style={styles.actionText}>DOUBLE</Text>
              </LinearGradient>
            </TouchableOpacity>
          )}
        </View>
      )}

      {/* New Game */}
      {gameState.gamePhase === 'finished' && (
        <View style={styles.newGameArea}>
          <TouchableOpacity style={styles.newGameButton} onPress={newGame}>
            <LinearGradient
              colors={['#00FFC6', '#00D4AA']}
              style={styles.newGameGradient}
            >
              <Text style={styles.newGameText}>New Game</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      )}
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
  balanceDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1A1D29',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    gap: 6,
  },
  balanceText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  table: {
    flex: 1,
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 20,
    overflow: 'hidden',
  },
  tableGradient: {
    flex: 1,
    padding: 20,
    justifyContent: 'space-between',
  },
  dealerArea: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  playerArea: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  areaLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 12,
  },
  handContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    zIndex: 1,
  },
  resultContainer: {
    position: 'absolute',
    top: '50%',
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 10,
  },
  resultText: {
    fontSize: 32,
    fontWeight: 'bold',
    textShadowColor: '#000',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 4,
  },
  bettingArea: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  betLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 16,
  },
  dealButton: {
    borderRadius: 12,
    overflow: 'hidden',
    marginTop: 16,
  },
  dealGradient: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  dealButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0F121A',
  },
  actionsArea: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    gap: 12,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    borderRadius: 12,
    overflow: 'hidden',
  },
  actionGradient: {
    paddingVertical: 14,
    alignItems: 'center',
  },
  actionText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  newGameArea: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  newGameButton: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  newGameGradient: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  newGameText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0F121A',
  },
});