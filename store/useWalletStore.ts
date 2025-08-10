import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface Transaction {
  id: string;
  type: 'win' | 'loss' | 'bonus' | 'deposit';
  amount: number;
  game?: string;
  timestamp: string;
  description: string;
}

interface WalletState {
  balance: number;
  transactions: Transaction[];
  dailyBonusCollected: boolean;
  lastBonusDate: string | null;
  isLoading: boolean;
  loadWalletData: () => Promise<void>;
  updateBalance: (amount: number, transaction?: Omit<Transaction, 'id' | 'timestamp'>) => Promise<void>;
  collectDailyBonus: () => Promise<boolean>;
  resetWallet: () => Promise<void>;
}

const STORAGE_KEYS = {
  BALANCE: 'wallet_balance',
  TRANSACTIONS: 'wallet_transactions',
  LAST_BONUS: 'last_bonus_date',
};

const INITIAL_BALANCE = 1000;
const DAILY_BONUS = 200;

export const useWalletStore = create<WalletState>((set, get) => ({
  balance: INITIAL_BALANCE,
  transactions: [],
  dailyBonusCollected: false,
  lastBonusDate: null,
  isLoading: true,

  loadWalletData: async () => {
    try {
      const [balanceStr, transactionsStr, lastBonusStr] = await Promise.all([
        AsyncStorage.getItem(STORAGE_KEYS.BALANCE),
        AsyncStorage.getItem(STORAGE_KEYS.TRANSACTIONS),
        AsyncStorage.getItem(STORAGE_KEYS.LAST_BONUS),
      ]);

      const balance = balanceStr ? parseInt(balanceStr, 10) : INITIAL_BALANCE;
      const transactions = transactionsStr ? JSON.parse(transactionsStr) : [];
      const lastBonusDate = lastBonusStr;

      // Check if daily bonus was collected today
      const today = new Date().toDateString();
      const dailyBonusCollected = lastBonusDate === today;

      set({
        balance,
        transactions,
        lastBonusDate,
        dailyBonusCollected,
        isLoading: false,
      });
    } catch (error) {
      console.error('Error loading wallet data:', error);
      set({ isLoading: false });
    }
  },

  updateBalance: async (amount: number, transactionData?: Omit<Transaction, 'id' | 'timestamp'>) => {
    try {
      const { balance, transactions } = get();
      const newBalance = Math.max(0, balance + amount);

      const newTransaction: Transaction = {
        id: Date.now().toString(),
        timestamp: new Date().toISOString(),
        type: amount > 0 ? 'win' : 'loss',
        amount: Math.abs(amount),
        description: `${amount > 0 ? 'Won' : 'Lost'} ${Math.abs(amount)} chips`,
        ...transactionData,
      };

      const newTransactions = [newTransaction, ...transactions].slice(0, 100); // Keep last 100 transactions

      await Promise.all([
        AsyncStorage.setItem(STORAGE_KEYS.BALANCE, newBalance.toString()),
        AsyncStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(newTransactions)),
      ]);

      set({
        balance: newBalance,
        transactions: newTransactions,
      });
    } catch (error) {
      console.error('Error updating balance:', error);
    }
  },

  collectDailyBonus: async () => {
    try {
      const { dailyBonusCollected } = get();
      
      if (dailyBonusCollected) {
        return false;
      }

      const today = new Date().toDateString();
      await get().updateBalance(DAILY_BONUS, {
        type: 'bonus',
        amount: DAILY_BONUS,
        description: 'Daily bonus collected',
      });

      await AsyncStorage.setItem(STORAGE_KEYS.LAST_BONUS, today);
      
      set({
        dailyBonusCollected: true,
        lastBonusDate: today,
      });

      return true;
    } catch (error) {
      console.error('Error collecting daily bonus:', error);
      return false;
    }
  },

  resetWallet: async () => {
    try {
      await Promise.all([
        AsyncStorage.removeItem(STORAGE_KEYS.BALANCE),
        AsyncStorage.removeItem(STORAGE_KEYS.TRANSACTIONS),
        AsyncStorage.removeItem(STORAGE_KEYS.LAST_BONUS),
      ]);

      set({
        balance: INITIAL_BALANCE,
        transactions: [],
        dailyBonusCollected: false,
        lastBonusDate: null,
      });
    } catch (error) {
      console.error('Error resetting wallet:', error);
    }
  },
}));