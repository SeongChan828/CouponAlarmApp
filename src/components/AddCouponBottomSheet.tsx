import React from 'react';
import {
  Modal, View, Text, TouchableOpacity,
  StyleSheet, Pressable, Platform,
} from 'react-native';
import { Colors } from '../constants/colors';

interface Props {
  visible: boolean;
  onClose: () => void;
  onSelectCamera: () => void;
  onSelectGallery: () => void;
  onSelectManual: () => void;
}

export default function AddCouponBottomSheet({
  visible, onClose, onSelectCamera, onSelectGallery, onSelectManual,
}: Props) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      {/* 딤 배경 */}
      <Pressable style={styles.overlay} onPress={onClose}>
        {/* 바텀시트 — 터치 이벤트 막기 */}
        <Pressable style={styles.sheet} onPress={e => e.stopPropagation()}>

          {/* 핸들 바 */}
          <View style={styles.handle} />

          {/* 타이틀 */}
          <Text style={styles.title}>쿠폰 등록 방법 선택</Text>
          <Text style={styles.sub}>어떤 방법으로 쿠폰을 등록할까요?</Text>

          {/* 옵션 목록 */}
          <View style={styles.options}>

            {/* 사진으로 인식 */}
            <TouchableOpacity style={styles.optionRow} onPress={onSelectCamera} activeOpacity={0.75}>
              <View style={[styles.iconBox, { backgroundColor: '#FFE3DE' }]}>
                <CameraIcon />
              </View>
              <View style={styles.optionText}>
                <View style={styles.optionTitleRow}>
                  <Text style={styles.optionTitle}>사진으로 인식</Text>
                  <View style={styles.recommendBadge}>
                    <Text style={styles.recommendText}>RECOMMENDED</Text>
                  </View>
                </View>
                <Text style={styles.optionDesc}>카메라로 쿠폰을 찍으면 자동으로 정보를 읽어요</Text>
              </View>
              <Text style={styles.arrow}>›</Text>
            </TouchableOpacity>

            <View style={styles.divider} />

            {/* 갤러리에서 선택 */}
            <TouchableOpacity style={styles.optionRow} onPress={onSelectGallery} activeOpacity={0.75}>
              <View style={[styles.iconBox, { backgroundColor: '#EDE9FF' }]}>
                <GalleryIcon />
              </View>
              <View style={styles.optionText}>
                <Text style={styles.optionTitle}>갤러리에서 선택</Text>
                <Text style={styles.optionDesc}>저장된 쿠폰 이미지를 불러와 인식해요</Text>
              </View>
              <Text style={styles.arrow}>›</Text>
            </TouchableOpacity>

            <View style={styles.divider} />

            {/* 직접 입력 */}
            <TouchableOpacity style={styles.optionRow} onPress={onSelectManual} activeOpacity={0.75}>
              <View style={[styles.iconBox, { backgroundColor: '#E8F4E8' }]}>
                <EditIcon />
              </View>
              <View style={styles.optionText}>
                <Text style={styles.optionTitle}>직접 입력</Text>
                <Text style={styles.optionDesc}>쿠폰 정보를 직접 입력해서 등록해요</Text>
              </View>
              <Text style={styles.arrow}>›</Text>
            </TouchableOpacity>
          </View>

          {/* 취소 버튼 */}
          <TouchableOpacity style={styles.cancelBtn} onPress={onClose} activeOpacity={0.8}>
            <Text style={styles.cancelText}>취소</Text>
          </TouchableOpacity>

        </Pressable>
      </Pressable>
    </Modal>
  );
}

/* ── SVG 대신 View로 만든 아이콘들 ── */
function CameraIcon() {
  return (
    <View style={{ alignItems: 'center', justifyContent: 'center', width: 24, height: 24 }}>
      <View style={{ width: 18, height: 13, borderRadius: 3, borderWidth: 2, borderColor: Colors.coral, alignItems: 'center', justifyContent: 'center' }}>
        <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: Colors.coral }} />
      </View>
      <View style={{ position: 'absolute', top: 0, right: 4, width: 6, height: 4, borderRadius: 1, backgroundColor: Colors.coral }} />
    </View>
  );
}

function GalleryIcon() {
  return (
    <View style={{ width: 22, height: 22, borderRadius: 4, borderWidth: 2, borderColor: '#7C6FCD', overflow: 'hidden', alignItems: 'flex-end', justifyContent: 'flex-end' }}>
      <View style={{ position: 'absolute', bottom: 0, left: 0, width: 0, height: 0, borderRightWidth: 22, borderTopWidth: 10, borderRightColor: 'transparent', borderTopColor: '#BFB8F0' }} />
      <View style={{ position: 'absolute', top: 3, right: 3, width: 5, height: 5, borderRadius: 2.5, backgroundColor: '#E8B939' }} />
    </View>
  );
}

function EditIcon() {
  return (
    <View style={{ width: 22, height: 22, justifyContent: 'space-evenly' }}>
      <View style={{ height: 2.5, backgroundColor: '#4CAF50', borderRadius: 1 }} />
      <View style={{ height: 2.5, backgroundColor: '#4CAF50', borderRadius: 1, width: '75%' }} />
      <View style={{ height: 2.5, backgroundColor: '#4CAF50', borderRadius: 1, width: '55%' }} />
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: Colors.card,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderWidth: 1.5,
    borderColor: Colors.line,
    borderBottomWidth: 0,
    paddingTop: 12,
    paddingHorizontal: 20,
    paddingBottom: Platform.OS === 'ios' ? 40 : 28,
    shadowColor: Colors.line,
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 20,
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: 'rgba(26,26,26,0.2)',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.ink,
    marginBottom: 4,
  },
  sub: {
    fontSize: 13,
    color: Colors.inkSoft,
    marginBottom: 24,
  },
  options: {
    backgroundColor: Colors.background,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: Colors.line,
    overflow: 'hidden',
    marginBottom: 14,
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 14,
    backgroundColor: Colors.background,
  },
  iconBox: {
    width: 46,
    height: 46,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: Colors.line,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  optionText: {
    flex: 1,
    gap: 3,
  },
  optionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  optionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.ink,
  },
  recommendBadge: {
    backgroundColor: Colors.coral,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  recommendText: {
    fontSize: 8,
    fontWeight: '800',
    color: Colors.white,
    letterSpacing: 0.5,
  },
  optionDesc: {
    fontSize: 12,
    color: Colors.inkSoft,
    lineHeight: 17,
  },
  arrow: {
    fontSize: 20,
    color: Colors.inkSoft,
    fontWeight: '300',
    flexShrink: 0,
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(26,26,26,0.08)',
    marginHorizontal: 16,
  },
  cancelBtn: {
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: Colors.line,
    paddingVertical: 15,
    alignItems: 'center',
    backgroundColor: Colors.card,
  },
  cancelText: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.inkSoft,
  },
});
