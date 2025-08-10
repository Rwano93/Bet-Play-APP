import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Linking } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

const helpTopics = [
  {
    id: 'getting-started',
    title: 'Getting Started',
    description: 'Learn how to play and manage your account',
    icon: 'play-circle' as const,
  },
  {
    id: 'game-rules',
    title: 'Game Rules',
    description: 'Understand the rules for each casino game',
    icon: 'book' as const,
  },
  {
    id: 'wallet',
    title: 'Wallet & Chips',
    description: 'Managing your virtual currency and transactions',
    icon: 'wallet' as const,
  },
  {
    id: 'account',
    title: 'Account Settings',
    description: 'Profile management and security settings',
    icon: 'person-circle' as const,
  },
];

const faqs = [
  {
    question: 'Is this real money gambling?',
    answer: 'No, BET & PLAY uses only virtual chips for entertainment. No real money is involved.',
  },
  {
    question: 'How do I get more chips?',
    answer: 'Collect your daily bonus of 200 chips every day, or win them by playing games.',
  },
  {
    question: 'What games can I play?',
    answer: 'Currently, Blackjack 21 is fully playable. Roulette and Baccarat are available in demo mode.',
  },
  {
    question: 'How does the daily bonus work?',
    answer: 'Every day you can collect 200 free chips. The bonus resets at midnight.',
  },
  {
    question: 'Can I play offline?',
    answer: 'Yes, all games work offline. Your progress is saved locally on your device.',
  },
];

export default function HelpScreen() {
  const handleContactSupport = () => {
    Linking.openURL('mailto:support@betandplay.com?subject=BET & PLAY Support');
  };

  return (
    <LinearGradient colors={['#0F121A', '#1A1D29']} style={styles.container}>
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>Help & Support</Text>
          <Text style={styles.subtitle}>Get help with BET & PLAY</Text>
        </View>

        {/* Help Topics */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Help Topics</Text>
          <View style={styles.topicsGrid}>
            {helpTopics.map((topic) => (
              <TouchableOpacity key={topic.id} style={styles.topicCard}>
                <LinearGradient
                  colors={['#1A1D29', '#2A2D3A']}
                  style={styles.topicGradient}
                >
                  <Ionicons name={topic.icon} size={32} color="#00FFC6" />
                  <Text style={styles.topicTitle}>{topic.title}</Text>
                  <Text style={styles.topicDescription}>{topic.description}</Text>
                </LinearGradient>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* FAQ */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Frequently Asked Questions</Text>
          <View style={styles.faqList}>
            {faqs.map((faq, index) => (
              <FAQItem key={index} question={faq.question} answer={faq.answer} />
            ))}
          </View>
        </View>

        {/* Contact Support */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Contact Us</Text>
          <TouchableOpacity style={styles.contactCard} onPress={handleContactSupport}>
            <LinearGradient
              colors={['#00FFC6', '#00D4AA']}
              style={styles.contactGradient}
            >
              <Ionicons name="mail" size={24} color="#0F121A" />
              <View style={styles.contactText}>
                <Text style={styles.contactTitle}>Email Support</Text>
                <Text style={styles.contactSubtitle}>support@betandplay.com</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#0F121A" />
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* App Info */}
        <View style={styles.appInfo}>
          <Text style={styles.appVersion}>BET & PLAY v1.0.0</Text>
          <Text style={styles.appDescription}>
            Virtual casino gaming for entertainment purposes only
          </Text>
        </View>
      </ScrollView>
    </LinearGradient>
  );
}

interface FAQItemProps {
  question: string;
  answer: string;
}

function FAQItem({ question, answer }: FAQItemProps) {
  const [expanded, setExpanded] = React.useState(false);

  return (
    <View style={styles.faqItem}>
      <TouchableOpacity
        style={styles.faqQuestion}
        onPress={() => setExpanded(!expanded)}
      >
        <Text style={styles.faqQuestionText}>{question}</Text>
        <Ionicons 
          name={expanded ? "chevron-up" : "chevron-down"} 
          size={20} 
          color="#00FFC6" 
        />
      </TouchableOpacity>
      
      {expanded && (
        <View style={styles.faqAnswer}>
          <Text style={styles.faqAnswerText}>{answer}</Text>
        </View>
      )}
    </View>
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
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#FFFFFF',
    opacity: 0.7,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 16,
    paddingHorizontal: 20,
  },
  topicsGrid: {
    paddingHorizontal: 20,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  topicCard: {
    width: '48%',
    borderRadius: 12,
    overflow: 'hidden',
  },
  topicGradient: {
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#2A2D3A',
    minHeight: 120,
    justifyContent: 'center',
  },
  topicTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginTop: 8,
    textAlign: 'center',
  },
  topicDescription: {
    fontSize: 12,
    color: '#FFFFFF',
    opacity: 0.7,
    marginTop: 4,
    textAlign: 'center',
  },
  faqList: {
    paddingHorizontal: 20,
    gap: 8,
  },
  faqItem: {
    backgroundColor: '#1A1D29',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#2A2D3A',
    overflow: 'hidden',
  },
  faqQuestion: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  faqQuestionText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    flex: 1,
  },
  faqAnswer: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    borderTopWidth: 1,
    borderTopColor: '#2A2D3A',
  },
  faqAnswerText: {
    fontSize: 14,
    color: '#FFFFFF',
    opacity: 0.8,
    lineHeight: 20,
  },
  contactCard: {
    marginHorizontal: 20,
    borderRadius: 12,
    overflow: 'hidden',
  },
  contactGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 12,
  },
  contactText: {
    flex: 1,
  },
  contactTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#0F121A',
  },
  contactSubtitle: {
    fontSize: 14,
    color: '#0F121A',
    opacity: 0.8,
  },
  appInfo: {
    alignItems: 'center',
    paddingVertical: 32,
    paddingHorizontal: 20,
  },
  appVersion: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  appDescription: {
    fontSize: 14,
    color: '#FFFFFF',
    opacity: 0.6,
    textAlign: 'center',
  },
});