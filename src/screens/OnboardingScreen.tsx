import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Dimensions,
  FlatList,
  NativeScrollEvent,
  NativeSyntheticEvent,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { Colors } from '../constants/colors';

type Props = NativeStackScreenProps<RootStackParamList, 'Onboarding'>;

const { width: SCREEN_W } = Dimensions.get('window');

interface Slide {
  key: string;
  headline: string;
  sub: string;
  isCTA?: boolean;
}

const SLIDES: Slide[] = [
  {
    key: '1',
    headline: '카톡, 문자, 이메일…\n한 곳에 모아요',
    sub: '어디 갔는지 헷갈리는 쿠폰, 이제 그만.',
  },
  {
    key: '2',
    headline: '만료 7일 전,\n미리 알려드려요',
    sub: '7일 / 3일 / 1일 전 단계별로 챙겨드려요.',
  },
  {
    key: '3',
    headline: '잊을 만하면,\n다시 알려드릴게요',
    sub: '천천히, 그러나 확실하게. 절대 놓치지 않아요.',
  },
  {
    key: '4',
    headline: '지금 바로\n쿠폰을 모아보세요',
    sub: '사라지는 쿠폰 없이, 받은 만큼 다 쓰는 습관.',
    isCTA: true,
  },
];

export default function OnboardingScreen({ navigation }: Props) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);

  const goToMain = () => {
    navigation.replace('CouponList');
  };

  const handleNext = () => {
    if (currentIndex < SLIDES.length - 1) {
      const next = currentIndex + 1;
      flatListRef.current?.scrollToIndex({ index: next, animated: true });
      setCurrentIndex(next);
    } else {
      goToMain();
    }
  };

  const onScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const idx = Math.round(e.nativeEvent.contentOffset.x / SCREEN_W);
    setCurrentIndex(idx);
  };

  return (
    <SafeAreaView style={styles.safe}>
      {/* 건너뛰기 */}
      <TouchableOpacity style={styles.skipBtn} onPress={goToMain}>
        <Text style={styles.skipText}>건너뛰기</Text>
      </TouchableOpacity>

      {/* 슬라이드 */}
      <FlatList
        ref={flatListRef}
        data={SLIDES}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        keyExtractor={item => item.key}
        onMomentumScrollEnd={onScroll}
        renderItem={({ item, index }) => (
          <View style={[styles.slide, { width: SCREEN_W }]}>
            {/* 슬라이드별 일러스트 */}
            <View style={styles.illustrationArea}>
              <SlideIllustration index={index} />
            </View>

            <Text style={styles.headline}>{item.headline}</Text>
            <Text style={styles.sub}>{item.sub}</Text>
          </View>
        )}
      />

      {/* 하단: 도트 + 버튼 */}
      <View style={styles.bottom}>
        {/* 도트 인디케이터 */}
        <View style={styles.dots}>
          {SLIDES.map((_, i) => (
            <View
              key={i}
              style={[styles.dot, i === currentIndex && styles.dotActive]}
            />
          ))}
        </View>

        <TouchableOpacity style={styles.nextBtn} onPress={handleNext} activeOpacity={0.85}>
          <Text style={styles.nextBtnText}>
            {currentIndex === SLIDES.length - 1 ? '시작하기' : '다음'}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

/** 슬라이드 인덱스별 CSS 일러스트 */
function SlideIllustration({ index }: { index: number }) {
  if (index === 0) {
    // 쿠폰 3장 그리드
    return (
      <View style={illustStyles.collectGrid}>
        {[Colors.coral, Colors.navy, Colors.mustard, Colors.mustard, Colors.coral, Colors.navy].map(
          (color, i) => (
            <View key={i} style={illustStyles.miniCoupon}>
              <View style={[illustStyles.miniStripe, { backgroundColor: color }]} />
              <View style={illustStyles.miniBarcode} />
            </View>
          ),
        )}
      </View>
    );
  }
  if (index === 1) {
    // D-day 배지
    return (
      <View style={illustStyles.bellCenter}>
        <View style={illustStyles.ddayBadge}>
          <Text style={illustStyles.ddayNumber}>D-3</Text>
          <Text style={illustStyles.ddayLabel}>만료 임박</Text>
        </View>
        <View style={illustStyles.ringer}>
          <Text style={illustStyles.ringerText}>!</Text>
        </View>
      </View>
    );
  }
  if (index === 2) {
    // 알림 파형 아이콘
    return (
      <View style={illustStyles.bellCenter}>
        <View style={illustStyles.notifCard}>
          <View style={illustStyles.notifIcon} />
          <View>
            <View style={illustStyles.notifLine} />
            <View style={[illustStyles.notifLine, { width: 70 }]} />
          </View>
        </View>
      </View>
    );
  }
  // index === 3 : 체크마크
  return (
    <View style={illustStyles.bellCenter}>
      <View style={illustStyles.checkCircle}>
        <View style={illustStyles.checkMark} />
      </View>
    </View>
  );
}

const illustStyles = StyleSheet.create({
  collectGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    justifyContent: 'center',
    width: 200,
  },
  miniCoupon: {
    width: 84,
    height: 52,
    backgroundColor: Colors.card,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: Colors.line,
    padding: 8,
    justifyContent: 'space-between',
  },
  miniStripe: { height: 6, width: '55%', borderRadius: 2 },
  miniBarcode: { height: 12, backgroundColor: Colors.ink, borderRadius: 2, opacity: 0.7 },
  bellCenter: { alignItems: 'center', justifyContent: 'center', flex: 1 },
  ddayBadge: {
    backgroundColor: Colors.card,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: Colors.line,
    paddingHorizontal: 28,
    paddingVertical: 20,
    alignItems: 'center',
    shadowColor: Colors.line,
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 5,
    transform: [{ rotate: '-3deg' }],
  },
  ddayNumber: { fontSize: 40, fontWeight: '900', color: Colors.coral, lineHeight: 44 },
  ddayLabel:  { fontSize: 11, color: Colors.inkSoft, letterSpacing: 1 },
  ringer: {
    position: 'absolute',
    top: 20,
    right: 60,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.mustard,
    borderWidth: 2,
    borderColor: Colors.line,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ringerText: { fontSize: 13, fontWeight: '800', color: Colors.ink },
  notifCard: {
    backgroundColor: Colors.card,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: Colors.line,
    padding: 16,
    flexDirection: 'row',
    gap: 14,
    alignItems: 'center',
    width: 220,
    shadowColor: Colors.line,
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 4,
  },
  notifIcon: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: Colors.coralSoft,
    borderWidth: 1.5,
    borderColor: Colors.line,
  },
  notifLine: { height: 8, width: 120, backgroundColor: Colors.line, borderRadius: 2, opacity: 0.15, marginBottom: 6 },
  checkCircle: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: Colors.coral,
    borderWidth: 2.5,
    borderColor: Colors.line,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.line,
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 5,
  },
  checkMark: {
    width: 36,
    height: 20,
    borderLeftWidth: 4,
    borderBottomWidth: 4,
    borderColor: Colors.white,
    transform: [{ translateX: 3 }, { translateY: -4 }, { rotate: '-45deg' }],
  },
});

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  skipBtn: {
    alignSelf: 'flex-end',
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  skipText: { fontSize: 13, color: Colors.inkSoft, fontWeight: '500' },
  slide: {
    paddingHorizontal: 32,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 0,
  },
  illustrationArea: {
    width: '100%',
    height: 240,
    backgroundColor: Colors.coralSoft,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: Colors.line,
    marginBottom: 36,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  headline: {
    fontSize: 26,
    fontWeight: '800',
    color: Colors.ink,
    textAlign: 'center',
    lineHeight: 34,
    letterSpacing: -0.5,
    marginBottom: 14,
  },
  sub: {
    fontSize: 14,
    color: Colors.inkSoft,
    textAlign: 'center',
    lineHeight: 22,
  },
  bottom: {
    paddingHorizontal: 32,
    paddingBottom: 32,
    gap: 20,
  },
  dots: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(26,26,26,0.2)',
  },
  dotActive: {
    width: 24,
    borderRadius: 4,
    backgroundColor: Colors.coral,
  },
  nextBtn: {
    backgroundColor: Colors.ink,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: Colors.line,
    paddingVertical: 16,
    alignItems: 'center',
    shadowColor: Colors.line,
    shadowOffset: { width: 3, height: 3 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 4,
  },
  nextBtnText: {
    color: Colors.background,
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
});
