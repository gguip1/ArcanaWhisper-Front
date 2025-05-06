// 타로 카드 데이터

export interface TarotCard {
  id: number;      // 애플리케이션에서 사용하는 고유 ID
  number: number;  // 타로 카드 번호 (1-22)
  name: string;    // 타로 카드 이름
  image?: string;  // 이미지 경로
  description?: string; // 카드 설명
  reversed?: boolean;  // 카드가 역방향인지 여부
}

// 카드 뒷면 이미지 설정
export const cardBackImage: string | null = null; // 이미지 경로를 여기에 설정 (예: 'src/assets/images/tarot_back.jpg')

// 대 아르카나 카드 데이터 (22장)
export const majorArcana: TarotCard[] = [
  { id: 1, number: 1, name: 'The Fool', description: '새로운 시작, 순수함, 모험' },
  { id: 2, number: 2, name: 'The Magician', description: '창의력, 기술, 재주' },
  { id: 3, number: 3, name: 'The High Priestess', description: '직관, 지혜, 내면의 지식' },
  { id: 4, number: 4, name: 'The Empress', description: '풍요, 모성, 자연' },
  { id: 5, number: 5, name: 'The Emperor', description: '권위, 리더십, 구조' },
  { id: 6, number: 6, name: 'The Hierophant', description: '전통, 영성, 적합성' },
  { id: 7, number: 7, name: 'The Lovers', description: '사랑, 화합, 선택' },
  { id: 8, number: 8, name: 'The Chariot', description: '의지, 승리, 단언' },
  { id: 9, number: 9, name: 'Strength', description: '용기, 설득, 영향력' },
  { id: 10, number: 10, name: 'The Hermit', description: '성찰, 내적 탐색, 홀로됨' },
  { id: 11, number: 11, name: 'Wheel of Fortune', description: '변화, 순환, 운명' },
  { id: 12, number: 12, name: 'Justice', description: '균형, 진실, 법적 문제' },
  { id: 13, number: 13, name: 'The Hanged Man', description: '희생, 관점 전환, 기다림' },
  { id: 14, number: 14, name: 'Death', description: '종말, 변화, 변형' },
  { id: 15, number: 15, name: 'Temperance', description: '균형, 조화, 타협' },
  { id: 16, number: 16, name: 'The Devil', description: '속박, 중독, 물질주의' },
  { id: 17, number: 17, name: 'The Tower', description: '갑작스러운 변화, 혼란, 계시' },
  { id: 18, number: 18, name: 'The Star', description: '희망, 영감, 평온' },
  { id: 19, number: 19, name: 'The Moon', description: '환상, 직관, 미지' },
  { id: 20, number: 20, name: 'The Sun', description: '행복, 활력, 성공' },
  { id: 21, number: 21, name: 'Judgement', description: '부활, 갱신, 평가' },
  { id: 22, number: 22, name: 'The World', description: '완성, 성취, 통합' }
];

/**
 * Fisher-Yates 알고리즘을 사용하여 카드를 섞습니다.
 * @returns 섞인 타로 카드 배열
 */
export function shuffleCards(): TarotCard[] {
  // 원본 배열을 변경하지 않기 위해 복사
  const shuffled = [...majorArcana];
  
  // Fisher-Yates 셔플 알고리즘
  for (let i = shuffled.length - 1; i > 0; i--) {
    // 0부터 i까지의 랜덤 인덱스 선택
    const j = Math.floor(Math.random() * (i + 1));
    // 현재 요소와 랜덤 요소 교환
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  
  return shuffled;
}
