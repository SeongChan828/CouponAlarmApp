import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Colors } from '../constants/colors';

interface EmptyStateProps {
  onAdd: () => void;
}

export default function EmptyState({ onAdd }: EmptyStateProps) {
  return (
    <View style={styles.container}>
      {/* CSS-style 일러스트 — 쿠폰 3장 겹친 모양 */}
      <View style={styles.illustration}>
        <View style={[styles.couponMini, styles.couponBack2]} />
        <View style={[styles.couponMini, styles.couponBack1]} />
        <View style={[styles.couponMini, styles.couponFront]}>
          <View style={styles.couponStripe} />
          <View style={styles.couponBarcode} />
        </View>
      </View>

      <Text style={styles.headline}>아직 쿠폰이 없어요</Text>
      <Text style={styles.sub}>
        받은 기프티콘이나 할인 쿠폰을{'\n'}지금 바로 등록해보세요.
      </Text>

      <TouchableOpacity style={styles.button} onPress={onAdd} activeOpacity={0.8}>
        <Text style={styles.buttonText}>+ 첫 쿠폰 등록하기</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    paddingVertical: 60,
  },
  illustration: {
    width: 120,
    height: 90,
    position: 'relative',
    marginBottom: 32,
  },
  couponMini: {
    position: 'absolute',
    width: 90,
    height: 56,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: Colors.line,
  },
  couponBack2: {
    backgroundColor: Colors.mustard,
    top: 0,
    left: 20,
    transform: [{ rotate: '8deg' }],
    opacity: 0.6,
  },
  couponBack1: {
    backgroundColor: Colors.coralSoft,
    top: 4,
    left: 10,
    transform: [{ rotate: '-4deg' }],
    opacity: 0.8,
  },
  couponFront: {
    backgroundColor: Colors.card,
    top: 12,
    left: 0,
    padding: 8,
    justifyContent: 'space-between',
  },
  couponStripe: {
    height: 6,
    width: '60%',
    backgroundColor: Colors.coral,
    borderRadius: 2,
  },
  couponBarcode: {
    height: 14,
    width: '100%',
    backgroundColor: Colors.ink,
    borderRadius: 2,
    opacity: 0.7,
  },
  headline: {
    fontSize: 20,
    fontWeight: '800',
    color: Colors.ink,
    marginBottom: 10,
    textAlign: 'center',
  },
  sub: {
    fontSize: 14,
    color: Colors.inkSoft,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 32,
  },
  button: {
    backgroundColor: Colors.ink,
    paddingHorizontal: 28,
    paddingVertical: 14,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: Colors.line,
    shadowColor: Colors.line,
    shadowOffset: { width: 3, height: 3 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 4,
  },
  buttonText: {
    color: Colors.background,
    fontSize: 14,
    fontWeight: '700',
  },
});
