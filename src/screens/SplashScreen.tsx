import React, { useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { Colors } from '../constants/colors';

type Props = NativeStackScreenProps<RootStackParamList, 'Splash'>;

export default function SplashScreen({ navigation }: Props) {
  useEffect(() => {
    // TODO: 실제로는 AsyncStorage에서 onboarding 완료 여부 체크
    const timer = setTimeout(() => {
      navigation.replace('Onboarding');
    }, 2000);
    return () => clearTimeout(timer);
  }, [navigation]);

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        {/* 로고마크 */}
        <View style={styles.logoMark}>
          <Text style={styles.logoText}>쿠</Text>
        </View>

        <Text style={styles.appName}>쿠폰 알림</Text>
        <Text style={styles.tagline}>쿠폰, 이제 놓치지 마세요</Text>

        {/* 하단 로딩 도트 */}
        <View style={styles.dots}>
          <View style={[styles.dot, styles.dot1]} />
          <View style={[styles.dot, styles.dot2]} />
          <View style={[styles.dot, styles.dot3]} />
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: Colors.coral,
  },
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 0,
  },
  logoMark: {
    width: 80,
    height: 80,
    backgroundColor: Colors.white,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    transform: [{ rotate: '-6deg' }],
    shadowColor: 'rgba(0,0,0,0.2)',
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 6,
  },
  logoText: {
    fontSize: 44,
    fontWeight: '800',
    color: Colors.coral,
  },
  appName: {
    fontSize: 28,
    fontWeight: '800',
    color: Colors.white,
    letterSpacing: -0.5,
    marginBottom: 8,
  },
  tagline: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.85)',
    marginBottom: 60,
  },
  dots: {
    position: 'absolute',
    bottom: 60,
    flexDirection: 'row',
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.5)',
  },
  dot1: {},
  dot2: { opacity: 0.7 },
  dot3: { opacity: 0.4 },
});
