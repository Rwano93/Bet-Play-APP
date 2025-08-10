import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert } from 'react-native';
import { useAuthStore } from '@/store/useAuthStore';
import { useSettingsStore } from '@/store/useSettingsStore';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';

export default function ProfileScreen() {
  const { user, logout, changePassword } = useAuthStore();
  const { hapticEnabled, soundEnabled, animationsEnabled, updateSetting } = useSettingsStore();
  
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const avatarScale = useSharedValue(1);

  const avatarStyle = useAnimatedStyle(() => ({
    transform: [{ scale: avatarScale.value }],
  }));

  const handleAvatarPress = () => {
    avatarScale.value = withSpring(0.9, { duration: 100 }, () => {
      avatarScale.value = withSpring(1, { duration: 100 });
    });
  };

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      Alert.alert('Error', 'Please fill in all password fields');
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert('Error', 'New passwords do not match');
      return;
    }

    if (newPassword.length < 6) {
      Alert.alert('Error', 'New password must be at least 6 characters');
      return;
    }

    const success = await changePassword(currentPassword, newPassword);
    
    if (success) {
      Alert.alert('Success', 'Password changed successfully');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setIsChangingPassword(false);
    } else {
      Alert.alert('Error', 'Current password is incorrect');
    }
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Logout', style: 'destructive', onPress: logout },
      ]
    );
  };

  const getInitials = (username: string) => {
    return username.slice(0, 2).toUpperCase();
  };

  const renderSettingItem = (
    title: string,
    value: boolean,
    onToggle: () => void,
    icon: keyof typeof Ionicons.glyphMap
  ) => (
    <View style={styles.settingItem}>
      <View style={styles.settingLeft}>
        <Ionicons name={icon} size={24} color="#00FFC6" />
        <Text style={styles.settingTitle}>{title}</Text>
      </View>
      <TouchableOpacity onPress={onToggle}>
        <View style={[styles.toggle, value && styles.toggleActive]}>
          <View style={[styles.toggleThumb, value && styles.toggleThumbActive]} />
        </View>
      </TouchableOpacity>
    </View>
  );

  return (
    <LinearGradient colors={['#0F121A', '#1A1D29']} style={styles.container}>
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>Profile</Text>
        </View>

        {/* User Card */}
        <View style={styles.userCard}>
          <LinearGradient
            colors={['#1A1D29', '#2A2D3A']}
            style={styles.userGradient}
          >
            <TouchableOpacity onPress={handleAvatarPress}>
              <Animated.View style={[styles.avatar, avatarStyle]}>
                <LinearGradient
                  colors={['#00FFC6', '#00D4AA']}
                  style={styles.avatarGradient}
                >
                  <Text style={styles.avatarText}>
                    {user ? getInitials(user.username) : 'U'}
                  </Text>
                </LinearGradient>
              </Animated.View>
            </TouchableOpacity>
            
            <View style={styles.userInfo}>
              <Text style={styles.username}>{user?.username}</Text>
              <Text style={styles.email}>{user?.email}</Text>
              <Text style={styles.joinDate}>
                Joined {user ? new Date(user.createdAt).toLocaleDateString() : 'Recently'}
              </Text>
            </View>
          </LinearGradient>
        </View>

        {/* Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Settings</Text>
          <View style={styles.settingsCard}>
            {renderSettingItem(
              'Haptic Feedback',
              hapticEnabled,
              () => updateSetting('hapticEnabled', !hapticEnabled),
              'phone-portrait'
            )}
            {renderSettingItem(
              'Sound Effects',
              soundEnabled,
              () => updateSetting('soundEnabled', !soundEnabled),
              'volume-high'
            )}
            {renderSettingItem(
              'Animations',
              animationsEnabled,
              () => updateSetting('animationsEnabled', !animationsEnabled),
              'refresh'
            )}
          </View>
        </View>

        {/* Security */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Security</Text>
          <View style={styles.settingsCard}>
            <TouchableOpacity
              style={styles.settingItem}
              onPress={() => setIsChangingPassword(!isChangingPassword)}
            >
              <View style={styles.settingLeft}>
                <Ionicons name="lock-closed" size={24} color="#00FFC6" />
                <Text style={styles.settingTitle}>Change Password</Text>
              </View>
              <Ionicons 
                name={isChangingPassword ? "chevron-up" : "chevron-forward"} 
                size={20} 
                color="#666" 
              />
            </TouchableOpacity>

            {isChangingPassword && (
              <View style={styles.passwordForm}>
                <TextInput
                  style={styles.passwordInput}
                  placeholder="Current Password"
                  placeholderTextColor="#666"
                  secureTextEntry
                  value={currentPassword}
                  onChangeText={setCurrentPassword}
                />
                <TextInput
                  style={styles.passwordInput}
                  placeholder="New Password"
                  placeholderTextColor="#666"
                  secureTextEntry
                  value={newPassword}
                  onChangeText={setNewPassword}
                />
                <TextInput
                  style={styles.passwordInput}
                  placeholder="Confirm New Password"
                  placeholderTextColor="#666"
                  secureTextEntry
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                />
                
                <View style={styles.passwordActions}>
                  <TouchableOpacity
                    style={styles.cancelButton}
                    onPress={() => {
                      setIsChangingPassword(false);
                      setCurrentPassword('');
                      setNewPassword('');
                      setConfirmPassword('');
                    }}
                  >
                    <Text style={styles.cancelButtonText}>Cancel</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity style={styles.saveButton} onPress={handleChangePassword}>
                    <LinearGradient
                      colors={['#00FFC6', '#00D4AA']}
                      style={styles.saveGradient}
                    >
                      <Text style={styles.saveButtonText}>Save</Text>
                    </LinearGradient>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </View>
        </View>

        {/* Logout */}
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <View style={styles.logoutContent}>
            <Ionicons name="log-out" size={24} color="#E84545" />
            <Text style={styles.logoutText}>Logout</Text>
          </View>
        </TouchableOpacity>
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
    paddingTop: 60,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  userCard: {
    marginHorizontal: 20,
    marginBottom: 24,
    borderRadius: 16,
    overflow: 'hidden',
  },
  userGradient: {
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#2A2D3A',
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 16,
  },
  avatarGradient: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#0F121A',
  },
  userInfo: {
    alignItems: 'center',
  },
  username: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  email: {
    fontSize: 14,
    color: '#FFFFFF',
    opacity: 0.7,
    marginBottom: 4,
  },
  joinDate: {
    fontSize: 12,
    color: '#00FFC6',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 12,
    paddingHorizontal: 20,
  },
  settingsCard: {
    marginHorizontal: 20,
    backgroundColor: '#1A1D29',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#2A2D3A',
    overflow: 'hidden',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#2A2D3A',
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    color: '#FFFFFF',
    marginLeft: 12,
  },
  toggle: {
    width: 50,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#2A2D3A',
    justifyContent: 'center',
    paddingHorizontal: 2,
  },
  toggleActive: {
    backgroundColor: '#00FFC6',
  },
  toggleThumb: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
  },
  toggleThumbActive: {
    alignSelf: 'flex-end',
  },
  passwordForm: {
    padding: 16,
    paddingTop: 0,
    gap: 12,
  },
  passwordInput: {
    backgroundColor: '#2A2D3A',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    color: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#3A3D4A',
  },
  passwordActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#666',
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '600',
  },
  saveButton: {
    flex: 2,
    borderRadius: 8,
    overflow: 'hidden',
  },
  saveGradient: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#0F121A',
    fontSize: 16,
    fontWeight: 'bold',
  },
  logoutButton: {
    marginHorizontal: 20,
    marginBottom: 32,
    backgroundColor: '#1A1D29',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E84545',
  },
  logoutContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    gap: 8,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#E84545',
  },
});