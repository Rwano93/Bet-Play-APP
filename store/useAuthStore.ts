import { create } from 'zustand';
import { z } from 'zod';
import * as SecureStore from 'expo-secure-store';

const UserSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  username: z.string().min(3),
  avatar: z.string().optional(),
  createdAt: z.string(),
});

export type User = z.infer<typeof UserSchema>;

interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  signup: (email: string, username: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  forgotPassword: (email: string) => Promise<boolean>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<boolean>;
  checkAuthState: () => Promise<void>;
}

// Mock users database (in real app, this would be on server)
const mockUsers = new Map<string, any>();

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isLoading: true,
  isAuthenticated: false,

  login: async (email: string, password: string) => {
    try {
      // Mock authentication
      const userKey = email.toLowerCase();
      const userData = mockUsers.get(userKey);
      
      if (!userData || userData.password !== password) {
        return false;
      }

      const user = UserSchema.parse({
        id: userData.id,
        email: userData.email,
        username: userData.username,
        avatar: userData.avatar,
        createdAt: userData.createdAt,
      });

      // Store auth token
      await SecureStore.setItemAsync('authToken', `mock_token_${user.id}`);
      
      set({ user, isAuthenticated: true });
      return true;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  },

  signup: async (email: string, username: string, password: string) => {
    try {
      const userKey = email.toLowerCase();
      
      if (mockUsers.has(userKey)) {
        return false; // User already exists
      }

      const newUser = {
        id: Date.now().toString(),
        email: email.toLowerCase(),
        username,
        password, // In real app, this would be hashed
        avatar: null,
        createdAt: new Date().toISOString(),
      };

      mockUsers.set(userKey, newUser);

      const user = UserSchema.parse({
        id: newUser.id,
        email: newUser.email,
        username: newUser.username,
        avatar: newUser.avatar,
        createdAt: newUser.createdAt,
      });

      await SecureStore.setItemAsync('authToken', `mock_token_${user.id}`);
      
      set({ user, isAuthenticated: true });
      return true;
    } catch (error) {
      console.error('Signup error:', error);
      return false;
    }
  },

  logout: async () => {
    try {
      await SecureStore.deleteItemAsync('authToken');
      set({ user: null, isAuthenticated: false });
    } catch (error) {
      console.error('Logout error:', error);
    }
  },

  forgotPassword: async (email: string) => {
    // Mock password reset - always returns true
    return new Promise((resolve) => {
      setTimeout(() => resolve(true), 1000);
    });
  },

  changePassword: async (currentPassword: string, newPassword: string) => {
    try {
      const { user } = get();
      if (!user) return false;

      const userKey = user.email.toLowerCase();
      const userData = mockUsers.get(userKey);
      
      if (!userData || userData.password !== currentPassword) {
        return false;
      }

      userData.password = newPassword;
      mockUsers.set(userKey, userData);
      return true;
    } catch (error) {
      console.error('Change password error:', error);
      return false;
    }
  },

  checkAuthState: async () => {
    try {
      const token = await SecureStore.getItemAsync('authToken');
      
      if (token) {
        // In a real app, you'd validate the token with your server
        const userId = token.replace('mock_token_', '');
        
        // Find user by ID
        for (const [email, userData] of mockUsers.entries()) {
          if (userData.id === userId) {
            const user = UserSchema.parse({
              id: userData.id,
              email: userData.email,
              username: userData.username,
              avatar: userData.avatar,
              createdAt: userData.createdAt,
            });
            
            set({ user, isAuthenticated: true, isLoading: false });
            return;
          }
        }
      }
      
      set({ isLoading: false });
    } catch (error) {
      console.error('Check auth state error:', error);
      set({ isLoading: false });
    }
  },
}));