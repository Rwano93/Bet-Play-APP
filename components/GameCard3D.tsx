import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';

interface Game {
  id: string;
  name: string;
  description: string;
  route: string;
  rulesRoute: string;
  color: string[];
  icon: keyof typeof Ionicons.glyphMap;
  playable: boolean;
}

interface GameCard3DProps {
  game: Game;
  width: number;
  onPlay: () => void;
  onRules: () => void;
}

export default function GameCard3D({ game, width, onPlay, onRules }: GameCard3DProps) {
  const scale = useSharedValue(1);
  const rotation = useSharedValue(0);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: scale.value },
      { rotateY: `${rotation.value}deg` },
    ],
  }));

  const handlePress = () => {
    scale.value = withSpring(0.95, { duration: 150 }, () => {
      scale.value = withSpring(1, { duration: 150 });
    });
  };

  return (
    <Animated.View style={[styles.container, { width }, animatedStyle]}>
      <TouchableOpacity
        onPress={handlePress}
        activeOpacity={0.9}
        style={styles.touchable}
      >
        <LinearGradient
          colors={['#1A1D29', '#2A2D3A']}
          style={styles.card}
        >
          {/* Game Table Background */}
          <View style={styles.tableArea}>
            <LinearGradient
              colors={game.color}
              style={styles.tableGradient}
            >
              <Ionicons name={game.icon} size={48} color="#FFFFFF" />
            </LinearGradient>
          </View>

          {/* Game Info */}
          <View style={styles.gameInfo}>
            <Text style={styles.gameName}>{game.name}</Text>
            <Text style={styles.gameDescription}>{game.description}</Text>
            
            {!game.playable && (
              <View style={styles.demoBadge}>
                <Text style={styles.demoText}>DEMO</Text>
              </View>
            )}
          </View>

          {/* Action Buttons */}
          <View style={styles.actions}>
            <TouchableOpacity
              style={[styles.actionButton, styles.rulesButton]}
              onPress={(e) => {
                e.stopPropagation();
                onRules();
              }}
            >
              <Ionicons name="information-circle" size={20} color="#00FFC6" />
              <Text style={styles.rulesButtonText}>Rules</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionButton, styles.playButton]}
              onPress={(e) => {
                e.stopPropagation();
                onPlay();
              }}
            >
              <LinearGradient
                colors={game.playable ? ['#00FFC6', '#00D4AA'] : ['#666', '#555']}
                style={styles.playGradient}
              >
                <Ionicons 
                  name={game.playable ? "play" : "eye"} 
                  size={20} 
                  color="#0F121A" 
                />
                <Text style={styles.playButtonText}>
                  {game.playable ? 'Play' : 'Demo'}
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </LinearGradient>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 280,
  },
  touchable: {
    flex: 1,
  },
  card: {
    flex: 1,
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: '#2A2D3A',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  tableArea: {
    flex: 1,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 16,
  },
  tableGradient: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  gameInfo: {
    alignItems: 'center',
    marginBottom: 16,
  },
  gameName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  gameDescription: {
    fontSize: 14,
    color: '#FFFFFF',
    opacity: 0.7,
  },
  demoBadge: {
    backgroundColor: '#FFD54A',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    marginTop: 8,
  },
  demoText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#0F121A',
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    borderRadius: 10,
    overflow: 'hidden',
  },
  rulesButton: {
    borderWidth: 1,
    borderColor: '#00FFC6',
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 6,
  },
  rulesButtonText: {
    color: '#00FFC6',
    fontSize: 16,
    fontWeight: '600',
  },
  playButton: {
    flex: 2,
  },
  playGradient: {
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 6,
  },
  playButtonText: {
    color: '#0F121A',
    fontSize: 16,
    fontWeight: 'bold',
  },
});