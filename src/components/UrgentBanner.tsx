import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Colors } from '../constants/colors';

interface UrgentBannerProps {
  count: number;
  onPress: () => void;
}

export default function UrgentBanner({ count, onPress }: UrgentBannerProps) {
  if (count === 0) return null;

  return (
    <TouchableOpacity style={styles.banner} onPress={onPress} activeOpacity={0.85}>
      <View>
        <Text style={styles.label}>URGENT</Text>
        <Text style={styles.message}>
          곧 만료될 쿠폰이{'\n'}
          <Text style={styles.count}>{count}개</Text> 있어요!
        </Text>
      </View>
      <Text style={styles.arrow}>→</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  banner: {
    backgroundColor: Colors.coral,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: Colors.line,
    padding: 16,
    marginBottom: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: Colors.line,
    shadowOffset: { width: 3, height: 3 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 4,
  },
  label: {
    fontSize: 9,
    letterSpacing: 2,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.8)',
    marginBottom: 4,
  },
  message: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.white,
    lineHeight: 22,
  },
  count: {
    fontSize: 20,
    fontWeight: '800',
  },
  arrow: {
    fontSize: 22,
    color: Colors.white,
    fontWeight: '300',
  },
});
