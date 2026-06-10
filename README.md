# 쿠폰 알림 앱 — MVP v2

---

## ✅ 이번 업데이트에서 보완된 내용

| 항목 | 내용 |
|------|------|
| 실제 저장 연동 | AsyncStorage CRUD 전 화면 연동 완료 |
| 사용완료/삭제 동작 | 실제 저장소 반영 + 알림 취소 연동 |
| 알림 서비스 | Notifee → expo-notifications 교체 |
| 쿠폰 번호 입력 | 바텀시트 모달로 편리하게 입력 |
| 날짜 자동변환 | 숫자 입력 시 YYYY-MM-DD 자동 포맷 |
| 로딩 상태 | ActivityIndicator 추가 |
| 화면 새로고침 | useFocusEffect로 포커스 시마다 최신 데이터 로드 |

---

## ⚙️ 설치 및 실행

### 1. 기존 프로젝트에 파일 교체 후

```bash
npx expo install expo-notifications @react-native-async-storage/async-storage
```

### 2. 실행

```bash
npx expo start --android
```

---

## 📦 필요 패키지 목록

```bash
# 핵심 (이미 설치됨)
@react-navigation/native
@react-navigation/native-stack
react-native-screens
react-native-safe-area-context

# 추가 설치 필요
expo-notifications        # 알림 (Notifee 대체)
@react-native-async-storage/async-storage  # 로컬 저장
```

---

## 🔜 다음 단계 (추후 확장)

- [ ] 바코드 카메라 스캔 (expo-barcode-scanner)
- [ ] 온보딩 완료 상태 저장 (AsyncStorage)
- [ ] 알림 탭 시 해당 쿠폰 상세로 자동 이동
- [ ] 쿠폰 이미지 첨부 (expo-image-picker)
- [ ] OCR 자동 인식

