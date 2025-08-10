# BET & PLAY - Virtual Casino App

A premium 3D virtual casino application built with Expo and React Native, featuring immersive casino games with virtual currency.

## 🎰 Features

- **Fully Functional Blackjack 21**: Complete game logic with hit, stand, double down, and split options
- **Demo Games**: Roulette and Baccarat with realistic 3D visuals
- **Virtual Economy**: Start with 1000 chips, daily bonuses, transaction history
- **3D Graphics**: Realistic casino tables, cards, and chips using Three.js and Expo GL
- **Premium UI**: Dark theme with neon accents and smooth animations
- **User Authentication**: Local account management with secure storage
- **Responsive Design**: Optimized for mobile with haptic feedback

## 🚀 Quick Start

### Prerequisites

- Node.js (version 18 or higher)
- Expo Go app on your mobile device
- Ensure your phone and computer are on the same WiFi network

### Installation

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npx expo start --lan
```

3. Scan the QR code with your Expo Go app:
   - **iOS**: Use your camera app to scan the QR code
   - **Android**: Use the Expo Go app to scan the QR code

### Troubleshooting

If the QR code doesn't work:

1. Clear cache and restart:
```bash
npx expo start -c --lan
```

2. If you're still having issues, try:
```bash
npm run clean
npx expo start --lan
```

3. Make sure both devices are on the same network and firewall isn't blocking the connection.

## 🎮 How to Play

### Blackjack 21
1. Place your bet by selecting chip value
2. Tap "Deal Cards" to start
3. Use "Hit" to take another card or "Stand" to keep your total
4. Try to get closer to 21 than the dealer without going over
5. Blackjack (21 with 2 cards) pays 3:2

### Roulette (Demo)
1. Select your chip value
2. Place bets on Red/Black or Even/Odd
3. Tap "Spin" to see where the ball lands
4. Even money bets pay 1:1

### Baccarat (Demo)
1. Choose your chip value
2. Bet on Player, Banker, or Tie
3. Cards are dealt automatically
4. Closest to 9 wins

## 💰 Virtual Economy

- **Starting Balance**: 1000 chips
- **Daily Bonus**: 200 chips every day
- **Chip Values**: 1, 2, 5, 10, 20, 50, 100, 500
- **No Real Money**: This is entertainment only

## 🛠 Technology Stack

- **Framework**: Expo 53 with React Native
- **Navigation**: Expo Router 5
- **3D Graphics**: Three.js with Expo GL
- **Animations**: React Native Reanimated 3
- **State Management**: Zustand
- **Validation**: Zod
- **Storage**: Expo Secure Store & AsyncStorage

## 📱 Platform Support

This app is optimized for mobile devices and can be run on:
- iOS (iPhone)
- Android
- Web (limited 3D features)

## 🎯 Game Rules

Detailed rules for each game are available in the app under the "Rules" section for each game.

## 🔧 Development

The app uses a clean, modular architecture:

```
/app
  /(auth)/          # Authentication screens
  /(tabs)/          # Main app tabs
  /games/           # Individual game screens
  /rules/           # Game rules pages
/components/        # Reusable UI components
/store/            # Zustand state management
/hooks/            # Custom React hooks
```

## 🚨 Important Notes

- This app is for **entertainment purposes only**
- No real money gambling is involved
- All currency is virtual and has no monetary value
- The app works entirely offline after initial load

## 📄 License

This project is for educational and entertainment purposes.

---

**Enjoy playing responsibly!** 🎲# Bet-Play-APP
