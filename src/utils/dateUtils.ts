/**
 * 날짜 유틸리티 함수 모음
 * dayjs 없이 순수 JS로 처리 (의존성 최소화)
 */

/**
 * 오늘 날짜를 'YYYY-MM-DD' 형식으로 반환
 */
export function getTodayString(): string {
  const today = new Date();
  return formatDateToString(today);
}

/**
 * Date 객체를 'YYYY-MM-DD' 형식으로 변환
 */
export function formatDateToString(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * 'YYYY-MM-DD' 문자열을 Date 객체로 변환
 * 시간을 00:00:00으로 고정해 타임존 이슈 방지
 */
export function parseDateString(dateStr: string): Date {
  const [year, month, day] = dateStr.split('-').map(Number);
  return new Date(year, month - 1, day, 0, 0, 0, 0);
}

/**
 * 유효기간까지 남은 일수 계산 (오늘 기준)
 * 반환값이 음수면 이미 만료됨
 */
export function getDaysUntilExpiry(expiryDateStr: string): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const expiryDate = parseDateString(expiryDateStr);
  const diffMs = expiryDate.getTime() - today.getTime();
  return Math.ceil(diffMs / (1000 * 60 * 60 * 24));
}

/**
 * 남은 일수를 사람이 읽기 좋은 형식으로 반환
 * 예: 'D-3', 'D-day', '만료됨', 'D-30'
 */
export function formatDDay(expiryDateStr: string): string {
  const days = getDaysUntilExpiry(expiryDateStr);
  if (days < 0) return '만료됨';
  if (days === 0) return 'D-day';
  return `D-${days}`;
}

/**
 * 'YYYY-MM-DD'를 'YYYY.MM.DD' 형식으로 표시용 변환
 */
export function formatDisplayDate(dateStr: string): string {
  return dateStr.replace(/-/g, '.');
}

/**
 * 'YYYY-MM-DD'를 'MM월 DD일' 형식으로 변환
 */
export function formatKoreanDate(dateStr: string): string {
  const [, month, day] = dateStr.split('-');
  return `${parseInt(month, 10)}월 ${parseInt(day, 10)}일`;
}

/**
 * ISO 타임스탬프를 'YYYY.MM.DD HH:mm' 형식으로 변환
 */
export function formatTimestamp(isoStr: string): string {
  const d = new Date(isoStr);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const hour = String(d.getHours()).padStart(2, '0');
  const min = String(d.getMinutes()).padStart(2, '0');
  return `${year}.${month}.${day} ${hour}:${min}`;
}

/**
 * 과거 날짜인지 확인 (유효기간 입력 검증용)
 */
export function isPastDate(dateStr: string): boolean {
  return getDaysUntilExpiry(dateStr) < 0;
}
