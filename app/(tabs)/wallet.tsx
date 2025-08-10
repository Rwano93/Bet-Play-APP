import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, FlatList } from 'react-native';
import { useWalletStore, Transaction } from '@/store/useWalletStore';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';

export default function WalletScreen() {
  const { 
    balance, 
    transactions, 
    dailyBonusCollected, 
    isLoading, 
    loadWalletData, 
    collectDailyBonus 
  } = useWalletStore();

  const balanceScale = useSharedValue(1);

  useEffect(() => {
    loadWalletData();
  }, []);

  const balanceStyle = useAnimatedStyle(() => ({
    transform: [{ scale: balanceScale.value }],
  }));

  const handleDailyBonus = async () => {
    const success = await collectDailyBonus();
    if (success) {
      balanceScale.value = withSpring(1.1, { duration: 200 }, () => {
        balanceScale.value = withSpring(1, { duration: 200 });
      });
    }
  };

  const formatCurrency = (amount: number) => {
    return amount.toLocaleString();
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const getTransactionIcon = (type: Transaction['type']) => {
    switch (type) {
      case 'win': return 'trending-up';
      case 'loss': return 'trending-down';
      case 'bonus': return 'gift';
      case 'deposit': return 'add-circle';
      default: return 'swap-horizontal';
    }
  };

  const getTransactionColor = (type: Transaction['type']) => {
    switch (type) {
      case 'win': return '#4CAF50';
      case 'loss': return '#E84545';
      case 'bonus': return '#FFD54A';
      case 'deposit': return '#00FFC6';
      default: return '#666';
    }
  };

  const renderTransaction = ({ item }: { item: Transaction }) => (
    <View style={styles.transactionItem}>
      <View style={styles.transactionHeader}>
        <View style={styles.transactionIcon}>
          <Ionicons 
            name={getTransactionIcon(item.type)} 
            size={24} 
            color={getTransactionColor(item.type)} 
          />
        </View>
        <View style={styles.transactionDetails}>
          <Text style={styles.transactionDescription}>{item.description}</Text>
          <Text style={styles.transactionDate}>{formatDate(item.timestamp)}</Text>
          {item.game && (
            <Text style={styles.transactionGame}>Game: {item.game}</Text>
          )}
        </View>
        <Text style={[
          styles.transactionAmount,
          { color: item.type === 'win' || item.type === 'bonus' || item.type === 'deposit' ? '#4CAF50' : '#E84545' }
        ]}>
          {item.type === 'win' || item.type === 'bonus' || item.type === 'deposit' ? '+' : '-'}
          {formatCurrency(item.amount)}
        </Text>
      </View>
    </View>
  );

  if (isLoading) {
    return (
      <LinearGradient colors={['#0F121A', '#1A1D29']} style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading wallet...</Text>
        </View>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient colors={['#0F121A', '#1A1D29']} style={styles.container}>
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>Wallet</Text>
        </View>

        {/* Balance Card */}
        <Animated.View style={[styles.balanceCard, balanceStyle]}>
          <LinearGradient
            colors={['#FFD54A', '#FFC107']}
            style={styles.balanceGradient}
          >
            <Ionicons name="diamond" size={32} color="#0F121A" />
            <Text style={styles.balanceLabel}>Current Balance</Text>
            <Text style={styles.balanceAmount}>{formatCurrency(balance)}</Text>
            <Text style={styles.balanceSubtitle}>Virtual Chips</Text>
          </LinearGradient>
        </Animated.View>

        {/* Daily Bonus */}
        {!dailyBonusCollected && (
          <TouchableOpacity style={styles.bonusCard} onPress={handleDailyBonus}>
            <LinearGradient
              colors={['#00FFC6', '#00D4AA']}
              style={styles.bonusGradient}
            >
              <Ionicons name="gift" size={24} color="#0F121A" />
              <View style={styles.bonusText}>
                <Text style={styles.bonusTitle}>Daily Bonus Available!</Text>
                <Text style={styles.bonusAmount}>+200 Chips</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#0F121A" />
            </LinearGradient>
          </TouchableOpacity>
        )}

        {/* Transaction History */}
        <View style={styles.historySection}>
          <Text style={styles.sectionTitle}>Transaction History</Text>
          {transactions.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="receipt-outline" size={48} color="#666" />
              <Text style={styles.emptyText}>No transactions yet</Text>
              <Text style={styles.emptySubtext}>Start playing to see your history</Text>
            </View>
          ) : (
            <FlatList
              data={transactions}
              renderItem={renderTransaction}
              keyExtractor={(item) => item.id}
              scrollEnabled={false}
              ItemSeparatorComponent={() => <View style={styles.separator} />}
            />
          )}
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#FFFFFF',
    fontSize: 16,
  },
  header: {
    padding: 20,
    paddingTop: 60,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  balanceCard: {
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 20,
    overflow: 'hidden',
  },
  balanceGradient: {
    padding: 24,
    alignItems: 'center',
  },
  balanceLabel: {
    fontSize: 16,
    color: '#0F121A',
    marginTop: 8,
    opacity: 0.8,
  },
  balanceAmount: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#0F121A',
    marginVertical: 8,
  },
  balanceSubtitle: {
    fontSize: 14,
    color: '#0F121A',
    opacity: 0.6,
  },
  bonusCard: {
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 16,
    overflow: 'hidden',
  },
  bonusGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 12,
  },
  bonusText: {
    flex: 1,
  },
  bonusTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#0F121A',
  },
  bonusAmount: {
    fontSize: 14,
    color: '#0F121A',
    opacity: 0.8,
  },
  historySection: {
    paddingHorizontal: 20,
    paddingBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 16,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 18,
    color: '#FFFFFF',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#FFFFFF',
    opacity: 0.6,
    marginTop: 4,
  },
  transactionItem: {
    backgroundColor: '#1A1D29',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#2A2D3A',
  },
  transactionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  transactionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#2A2D3A',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  transactionDetails: {
    flex: 1,
  },
  transactionDescription: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  transactionDate: {
    fontSize: 12,
    color: '#FFFFFF',
    opacity: 0.6,
  },
  transactionGame: {
    fontSize: 12,
    color: '#00FFC6',
    marginTop: 2,
  },
  transactionAmount: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  separator: {
    height: 12,
  },
});