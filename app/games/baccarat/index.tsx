import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, Dimensions } from 'react-native';
import { router } from 'expo-router';
import { useWalletStore } from '@/store/useWalletStore';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import ChipSelector from '@/components/ChipSelector';
import Card3D from '@/components/Card3D';

const { width } = Dimensions.get('window');

interface Card {
  suit: 'hearts' | 'diamonds' | 'clubs' | 'spades';
  rank: string;
  value: number;
}

interface BaccaratBet {
  type: 'player' | 'banker' | 'tie';
  amount: number;
}

export default function BaccaratScreen() {
  const [selectedChip, setSelectedChip] = useState(10);
  const [bets, setBets] = useState<BaccaratBet[]>([]);
  const [playerHand, setPlayerHand] = useState<Card[]>([]);
  const [bankerHand, setBankerHand] = useState<Card[]>([]);
  const [playerScore, setPlayerScore] = useState(0);
  const [bankerScore, setBankerScore] = useState(0);
  const [gamePhase, setGamePhase] = useState<'betting' | 'dealing' | 'finished'>('betting');
  const [result, setResult] = useState<'player' | 'banker' | 'tie' | null>(null);

  const { balance, updateBalance } = useWalletStore();

  const createCard = (): Card => {
    const suits: Card['suit'][] = ['hearts', 'diamonds', 'clubs', 'spades'];
    const ranks = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
    
    const suit = suits[Math.floor(Math.random() * suits.length)];
    const rank = ranks[Math.floor(Math.random() * ranks.length)];
    
    let value = parseInt(rank);
    if (rank === 'A') value = 1;
    else if (['J', 'Q', 'K'].includes(rank)) value = 0;
    else if (rank === '10') value = 0;

    return { suit, rank, value };
  };

  const calculateBaccaratScore = (hand: Card[]): number => {
    const total = hand.reduce((sum, card) => sum + card.value, 0);
    return total % 10;
  };

  const placeBet = (type: BaccaratBet['type']) => {
    if (selectedChip > balance) {
      Alert.alert('Insufficient Funds', 'You don\'t have enough chips for this bet.');
      return;
    }

    const existingBetIndex = bets.findIndex(bet => bet.type === type);
    
    if (existingBetIndex >= 0) {
      const newBets = [...bets];
      newBets[existingBetIndex].amount += selectedChip;
      setBets(newBets);
    } else {
      setBets([...bets, { type, amount: selectedChip }]);
    }
  };

  const clearBets = () => {
    setBets([]);
  };

  const deal = async () => {
    if (bets.length === 0) {
      Alert.alert('No Bets', 'Please place at least one bet before dealing.');
      return;
    }

    const totalBet = bets.reduce((sum, bet) => sum + bet.amount, 0);
    if (totalBet > balance) {
      Alert.alert('Insufficient Funds', 'Your total bets exceed your balance.');
      return;
    }

    setGamePhase('dealing');

    // Deal initial cards
    const newPlayerHand = [createCard(), createCard()];
    const newBankerHand = [createCard(), createCard()];

    setPlayerHand(newPlayerHand);
    setBankerHand(newBankerHand);

    const pScore = calculateBaccaratScore(newPlayerHand);
    const bScore = calculateBaccaratScore(newBankerHand);

    setPlayerScore(pScore);
    setBankerScore(bScore);

    // Determine winner and calculate payouts
    setTimeout(() => {
      let winner: 'player' | 'banker' | 'tie';
      
      if (pScore > bScore) {
        winner = 'player';
      } else if (bScore > pScore) {
        winner = 'banker';
      } else {
        winner = 'tie';
      }

      setResult(winner);
      calculatePayouts(winner);
      setGamePhase('finished');
    }, 2000);
  };

  const calculatePayouts = (winner: 'player' | 'banker' | 'tie') => {
    let totalWinnings = 0;
    let totalLoss = 0;

    for (const bet of bets) {
      if (bet.type === winner) {
        let payout = bet.amount;
        if (winner === 'player') {
          payout *= 1; // 1:1
        } else if (winner === 'banker') {
          payout *= 0.95; // 1:1 minus 5% commission
        } else if (winner === 'tie') {
          payout *= 8; // 8:1
        }
        totalWinnings += payout;
      } else {
        totalLoss += bet.amount;
      }
    }

    const netResult = totalWinnings - totalLoss;
    
    updateBalance(netResult, {
      type: netResult > 0 ? 'win' : 'loss',
      amount: Math.abs(netResult),
      game: 'Baccarat',
      description: `${netResult > 0 ? 'Won' : 'Lost'} - ${winner.charAt(0).toUpperCase() + winner.slice(1)} wins`,
    });
  };

  const newGame = () => {
    setPlayerHand([]);
    setBankerHand([]);
    setPlayerScore(0);
    setBankerScore(0);
    setGamePhase('betting');
    setResult(null);
    setBets([]);
  };

  const getBetAmount = (type: BaccaratBet['type']) => {
    const bet = bets.find(b => b.type === type);
    return bet ? bet.amount : 0;
  };

  const getBetTotal = () => {
    return bets.reduce((sum, bet) => sum + bet.amount, 0);
  };

  return (
    <LinearGradient colors={['#0F121A', '#1A1D29']} style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="chevron-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.title}>Baccarat (Demo)</Text>
        <View style={styles.balanceDisplay}>
          <Ionicons name="diamond" size={16} color="#FFD54A" />
          <Text style={styles.balanceText}>{balance.toLocaleString()}</Text>
        </View>
      </View>

      {/* Game Table */}
      <View style={styles.table}>
        <LinearGradient
          colors={['#1B5E20', '#2E7D32']}
          style={styles.tableGradient}
        >
          {/* Banker Area */}
          <View style={styles.handArea}>
            <Text style={styles.areaLabel}>Banker: {bankerScore}</Text>
            <View style={styles.handContainer}>
              {bankerHand.map((card, index) => (
                <Card3D
                  key={`banker-${index}`}
                  card={card}
                  style={[styles.card, { marginLeft: index > 0 ? -15 : 0 }]}
                />
              ))}
            </View>
          </View>

          {/* Player Area */}
          <View style={styles.handArea}>
            <Text style={styles.areaLabel}>Player: {playerScore}</Text>
            <View style={styles.handContainer}>
              {playerHand.map((card, index) => (
                <Card3D
                  key={`player-${index}`}
                  card={card}
                  style={[styles.card, { marginLeft: index > 0 ? -15 : 0 }]}
                />
              ))}
            </View>
          </View>

          {/* Result */}
          {result && (
            <View style={styles.resultContainer}>
              <Text style={styles.resultText}>
                {result === 'tie' ? 'TIE' : `${result.toUpperCase()} WINS!`}
              </Text>
            </View>
          )}
        </LinearGradient>
      </View>

      {/* Betting Area */}
      {gamePhase === 'betting' && (
        <View style={styles.bettingArea}>
          <Text style={styles.betLabel}>Place Your Bets</Text>
          
          <View style={styles.betsGrid}>
            <TouchableOpacity
              style={[styles.betBox, styles.playerBet]}
              onPress={() => placeBet('player')}
            >
              <Text style={styles.betBoxTitle}>PLAYER</Text>
              <Text style={styles.betBoxPayout}>Pays 1:1</Text>
              {getBetAmount('player') > 0 && (
                <Text style={styles.betAmount}>{getBetAmount('player')}</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.betBox, styles.tieBet]}
              onPress={() => placeBet('tie')}
            >
              <Text style={styles.betBoxTitle}>TIE</Text>
              <Text style={styles.betBoxPayout}>Pays 8:1</Text>
              {getBetAmount('tie') > 0 && (
                <Text style={styles.betAmount}>{getBetAmount('tie')}</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.betBox, styles.bankerBet]}
              onPress={() => placeBet('banker')}
            >
              <Text style={styles.betBoxTitle}>BANKER</Text>
              <Text style={styles.betBoxPayout}>Pays 0.95:1</Text>
              {getBetAmount('banker') > 0 && (
                <Text style={styles.betAmount}>{getBetAmount('banker')}</Text>
              )}
            </TouchableOpacity>
          </View>

          {bets.length > 0 && (
            <View style={styles.betsSummary}>
              <Text style={styles.totalBetText}>
                Total Bet: {getBetTotal()} chips
              </Text>
              <TouchableOpacity onPress={clearBets}>
                <Text style={styles.clearBetsText}>Clear All</Text>
              </TouchableOpacity>
            </View>
          )}

          <ChipSelector selectedValue={selectedChip} onSelect={setSelectedChip} />

          <TouchableOpacity
            style={styles.dealButton}
            onPress={deal}
            disabled={bets.length === 0}
          >
            <LinearGradient
              colors={bets.length === 0 ? ['#666', '#555'] : ['#00FFC6', '#00D4AA']}
              style={styles.dealGradient}
            >
              <Text style={styles.dealButtonText}>Deal Cards</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      )}

      {/* New Game */}
      {gamePhase === 'finished' && (
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

      {gamePhase === 'dealing' && (
        <View style={styles.dealingOverlay}>
          <Text style={styles.dealingText}>Dealing Cards...</Text>
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
    height: 200,
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 20,
    overflow: 'hidden',
  },
  tableGradient: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: 20,
    position: 'relative',
  },
  handArea: {
    alignItems: 'center',
    flex: 1,
  },
  areaLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 12,
  },
  handContainer: {
    flexDirection: 'row',
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
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFD54A',
    textShadowColor: '#000',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 4,
  },
  bettingArea: {
    paddingHorizontal: 20,
  },
  betLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 16,
  },
  betsGrid: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  betBox: {
    flex: 1,
    paddingVertical: 20,
    paddingHorizontal: 8,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
    position: 'relative',
  },
  playerBet: {
    backgroundColor: '#4A90E2',
  },
  bankerBet: {
    backgroundColor: '#E84545',
  },
  tieBet: {
    backgroundColor: '#9C27B0',
  },
  betBoxTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  betBoxPayout: {
    fontSize: 10,
    color: '#FFFFFF',
    opacity: 0.8,
  },
  betAmount: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#FFD54A',
    color: '#0F121A',
    fontSize: 10,
    fontWeight: 'bold',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  betsSummary: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#2A2D3A',
  },
  totalBetText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  clearBetsText: {
    fontSize: 14,
    color: '#E84545',
    textDecorationLine: 'underline',
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
  dealingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dealingText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
});