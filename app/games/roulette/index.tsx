import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, Dimensions } from 'react-native';
import { router } from 'expo-router';
import { useWalletStore } from '@/store/useWalletStore';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import ChipSelector from '@/components/ChipSelector';
import RouletteWheel3D from '@/components/RouletteWheel3D';
import Animated, { useSharedValue, withSpring, useAnimatedStyle } from 'react-native-reanimated';

const { width } = Dimensions.get('window');

interface Bet {
  type: 'red' | 'black' | 'even' | 'odd' | 'number';
  value: number | string;
  amount: number;
}

export default function RouletteScreen() {
  const [selectedChip, setSelectedChip] = useState(5);
  const [bets, setBets] = useState<Bet[]>([]);
  const [isSpinning, setIsSpinning] = useState(false);
  const [lastNumber, setLastNumber] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);

  const { balance, updateBalance } = useWalletStore();
  const wheelRotation = useSharedValue(0);

  const wheelStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${wheelRotation.value}deg` }],
  }));

  const redNumbers = [1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36];

  const placeBet = (type: Bet['type'], value: number | string) => {
    if (selectedChip > balance) {
      Alert.alert('Insufficient Funds', 'You don\'t have enough chips for this bet.');
      return;
    }

    const existingBetIndex = bets.findIndex(bet => bet.type === type && bet.value === value);
    
    if (existingBetIndex >= 0) {
      // Add to existing bet
      const newBets = [...bets];
      newBets[existingBetIndex].amount += selectedChip;
      setBets(newBets);
    } else {
      // New bet
      setBets([...bets, { type, value, amount: selectedChip }]);
    }
  };

  const clearBets = () => {
    setBets([]);
  };

  const spin = async () => {
    if (bets.length === 0) {
      Alert.alert('No Bets', 'Please place at least one bet before spinning.');
      return;
    }

    const totalBet = bets.reduce((sum, bet) => sum + bet.amount, 0);
    if (totalBet > balance) {
      Alert.alert('Insufficient Funds', 'Your total bets exceed your balance.');
      return;
    }

    setIsSpinning(true);
    setShowResult(false);

    // Animate wheel spin
    const randomRotation = Math.random() * 360 + 1440; // At least 4 full rotations
    wheelRotation.value = withSpring(wheelRotation.value + randomRotation, { duration: 3000 });

    // Simulate spin delay
    setTimeout(() => {
      const winningNumber = Math.floor(Math.random() * 37); // 0-36
      setLastNumber(winningNumber);
      calculateWinnings(winningNumber);
      setIsSpinning(false);
      setShowResult(true);
    }, 3000);
  };

  const calculateWinnings = (number: number) => {
    let totalWinnings = 0;
    let totalLoss = 0;

    for (const bet of bets) {
      let won = false;

      switch (bet.type) {
        case 'red':
          won = redNumbers.includes(number) && number !== 0;
          break;
        case 'black':
          won = !redNumbers.includes(number) && number !== 0;
          break;
        case 'even':
          won = number % 2 === 0 && number !== 0;
          break;
        case 'odd':
          won = number % 2 === 1;
          break;
        case 'number':
          won = number === bet.value;
          break;
      }

      if (won) {
        let payout = bet.amount;
        if (bet.type === 'number') {
          payout *= 35; // 35:1 for straight number
        } else {
          payout *= 1; // 1:1 for even money bets
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
      game: 'Roulette',
      description: `${netResult > 0 ? 'Won' : 'Lost'} - Number ${number}`,
    });

    setBets([]);
  };

  const getBetTotal = () => {
    return bets.reduce((sum, bet) => sum + bet.amount, 0);
  };

  const getNumberColor = (num: number) => {
    if (num === 0) return '#4CAF50';
    return redNumbers.includes(num) ? '#E84545' : '#000000';
  };

  return (
    <LinearGradient colors={['#0F121A', '#1A1D29']} style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="chevron-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.title}>Roulette (Demo)</Text>
        <View style={styles.balanceDisplay}>
          <Ionicons name="diamond" size={16} color="#FFD54A" />
          <Text style={styles.balanceText}>{balance.toLocaleString()}</Text>
        </View>
      </View>

      {/* Wheel */}
      <View style={styles.wheelContainer}>
        <Animated.View style={wheelStyle}>
          <RouletteWheel3D size={width * 0.6} spinning={isSpinning} />
        </Animated.View>
        
        {showResult && lastNumber !== null && (
          <View style={styles.resultOverlay}>
            <View style={[styles.resultBall, { backgroundColor: getNumberColor(lastNumber) }]}>
              <Text style={styles.resultNumber}>{lastNumber}</Text>
            </View>
          </View>
        )}
      </View>

      {/* Betting Board */}
      <View style={styles.bettingBoard}>
        <Text style={styles.boardTitle}>Place Your Bets</Text>
        
        <View style={styles.betsRow}>
          <TouchableOpacity
            style={[styles.betOption, styles.redBet]}
            onPress={() => placeBet('red', 'red')}
          >
            <Text style={styles.betText}>RED</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.betOption, styles.blackBet]}
            onPress={() => placeBet('black', 'black')}
          >
            <Text style={styles.betText}>BLACK</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.betsRow}>
          <TouchableOpacity
            style={[styles.betOption, styles.evenBet]}
            onPress={() => placeBet('even', 'even')}
          >
            <Text style={styles.betText}>EVEN</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.betOption, styles.oddBet]}
            onPress={() => placeBet('odd', 'odd')}
          >
            <Text style={styles.betText}>ODD</Text>
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
      </View>

      {/* Chip Selector */}
      <ChipSelector selectedValue={selectedChip} onSelect={setSelectedChip} />

      {/* Controls */}
      <View style={styles.controls}>
        <TouchableOpacity
          style={styles.spinButton}
          onPress={spin}
          disabled={isSpinning || bets.length === 0}
        >
          <LinearGradient
            colors={isSpinning || bets.length === 0 ? ['#666', '#555'] : ['#00FFC6', '#00D4AA']}
            style={styles.spinGradient}
          >
            <Text style={styles.spinButtonText}>
              {isSpinning ? 'Spinning...' : 'SPIN'}
            </Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
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
  wheelContainer: {
    alignItems: 'center',
    paddingVertical: 20,
    position: 'relative',
  },
  resultOverlay: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -20 }, { translateY: -20 }],
  },
  resultBall: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  resultNumber: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  bettingBoard: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  boardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 16,
  },
  betsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  betOption: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  redBet: {
    backgroundColor: '#E84545',
  },
  blackBet: {
    backgroundColor: '#2C2C2C',
  },
  evenBet: {
    backgroundColor: '#4A90E2',
  },
  oddBet: {
    backgroundColor: '#9C27B0',
  },
  betText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  betsSummary: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 16,
    paddingTop: 16,
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
  controls: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  spinButton: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  spinGradient: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  spinButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0F121A',
  },
});