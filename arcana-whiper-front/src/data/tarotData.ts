// 타로 카드 데이터

export interface TarotCard {
  number: number;
  name: string;
  reversed?: boolean;
}

// 대 아르카나 카드 데이터 (22장)
export const majorArcana: TarotCard[] = [
  { number: 1, name: 'The Fool' },
  { number: 2, name: 'The Magician' },
  { number: 3, name: 'The High Priestess' },
  { number: 4, name: 'The Empress' },
  { number: 5, name: 'The Emperor' },
  { number: 6, name: 'The Hierophant' },
  { number: 7, name: 'The Lovers' },
  { number: 8, name: 'The Chariot' },
  { number: 9, name: 'Strength' },
  { number: 10, name: 'The Hermit' },
  { number: 11, name: 'Wheel of Fortune' },
  { number: 12, name: 'Justice' },
  { number: 13, name: 'The Hanged Man' },
  { number: 14, name: 'Death' },
  { number: 15, name: 'Temperance' },
  { number: 16, name: 'The Devil' },
  { number: 17, name: 'The Tower' },
  { number: 18, name: 'The Star' },
  { number: 19, name: 'The Moon' },
  { number: 20, name: 'The Sun' },
  { number: 21, name: 'Judgement' },
  { number: 22, name: 'The World' },
];

/**
 * Fisher-Yates 알고리즘을 사용하여 카드를 섞습니다.
 * @returns 섞인 타로 카드 배열
 */
export function shuffleCards(): TarotCard[] {
  const shuffled = [...majorArcana];

  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }

  return shuffled;
}
