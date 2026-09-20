export interface ExampleSentence {
  zh: string;
  py: string;
  en: string;
}

export interface VocabWord {
  id: string;
  hanzi: string;
  pinyin: string;
  tones: number[];
  english: string;
  category: '问候 Greetings' | '代词 Pronouns' | '常用词 Core Words' | '人物 People';
  radicalInfo: string;
  memoryTip: string;
  example: ExampleSentence;
  strokes: number;
}

export type GameMode = 'learn' | 'match' | 'bubble' | 'builder' | 'quiz';

export interface UserStats {
  masteredWords: string[];
  highScores: {
    match: number;
    bubble: number;
    quiz: number;
    builder: number;
  };
  streak: number;
  lastPlayedDate: string;
  totalAnswered: number;
}

export interface SentencePuzzle {
  id: string;
  targetSentence: string;
  targetPinyin: string;
  translation: string;
  tokens: string[]; // correct sequence of tokens
  distractors: string[]; // additional wrong choices to challenge
  hint: string;
}
