import React, { useState, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import {
  RotateCcw,
  Trophy,
  Flame,
  Clock,
  Sparkles,
  Volume2,
  CheckCircle,
} from 'lucide-react';
import { VocabWord } from '../types';
import {
  speakChinese,
  playCardFlip,
  playToneSuccess,
  playToneWrong,
  playLevelVictory,
} from '../utils/audio';

interface MemoryCard {
  id: string; // unique card id
  wordId: string; // matches partner
  type: 'hanzi' | 'meaning';
  displayPrimary: string;
  displaySecondary?: string;
  isFlipped: boolean;
  isMatched: boolean;
}

interface MemoryMatchModeProps {
  words: VocabWord[];
  onWordMastered: (wordId: string) => void;
  slowAudio: boolean;
}

export const MemoryMatchMode: React.FC<MemoryMatchModeProps> = ({
  words,
  onWordMastered,
  slowAudio,
}) => {
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'all'>('easy');
  const [cards, setCards] = useState<MemoryCard[]>([]);
  const [selectedCards, setSelectedCards] = useState<MemoryCard[]>([]);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [moves, setMoves] = useState<number>(0);
  const [combo, setCombo] = useState<number>(0);
  const [maxCombo, setMaxCombo] = useState<number>(0);
  const [seconds, setSeconds] = useState<number>(0);
  const [isGameActive, setIsGameActive] = useState<boolean>(false);
  const [isGameWon, setIsGameWon] = useState<boolean>(false);

  const timerRef = useRef<number | null>(null);

  // Initialize or reset game
  const startNewGame = (diff: 'easy' | 'medium' | 'all' = difficulty) => {
    // Select subset of words based on difficulty
    let count = 4;
    if (diff === 'medium') count = 8;
    if (diff === 'all') count = words.length;

    // Shuffle and pick
    const shuffledWords = [...words].sort(() => Math.random() - 0.5).slice(0, count);

    const newCards: MemoryCard[] = [];
    shuffledWords.forEach((word) => {
      // Hanzi card
      newCards.push({
        id: `${word.id}-hanzi`,
        wordId: word.id,
        type: 'hanzi',
        displayPrimary: word.hanzi,
        displaySecondary: word.pinyin,
        isFlipped: false,
        isMatched: false,
      });
      // Meaning & Pinyin card
      newCards.push({
        id: `${word.id}-meaning`,
        wordId: word.id,
        type: 'meaning',
        displayPrimary: word.english,
        displaySecondary: word.pinyin,
        isFlipped: false,
        isMatched: false,
      });
    });

    // Shuffle the deck
    setCards(newCards.sort(() => Math.random() - 0.5));
    setSelectedCards([]);
    setIsProcessing(false);
    setMoves(0);
    setCombo(0);
    setMaxCombo(0);
    setSeconds(0);
    setIsGameWon(false);
    setIsGameActive(true);

    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
  };

  // Setup timer
  useEffect(() => {
    startNewGame(difficulty);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [difficulty]);

  useEffect(() => {
    if (isGameActive && !isGameWon) {
      timerRef.current = window.setInterval(() => {
        setSeconds((s) => s + 1);
      }, 1000);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isGameActive, isGameWon]);

  // Handle card click
  const handleCardClick = (card: MemoryCard) => {
    if (isProcessing || card.isFlipped || card.isMatched) return;

    playCardFlip();

    // Pronounce if it's the hanzi card
    const targetWord = words.find((w) => w.id === card.wordId);
    if (targetWord) {
      speakChinese(targetWord.hanzi, slowAudio ? 0.7 : 0.85);
    }

    const updatedCards = cards.map((c) =>
      c.id === card.id ? { ...c, isFlipped: true } : c
    );
    setCards(updatedCards);

    const newSelected = [...selectedCards, card];
    setSelectedCards(newSelected);

    if (newSelected.length === 2) {
      setIsProcessing(true);
      setMoves((m) => m + 1);

      const [first, second] = newSelected;
      if (first.wordId === second.wordId) {
        // MATCH!
        playToneSuccess();
        const nextCombo = combo + 1;
        setCombo(nextCombo);
        if (nextCombo > maxCombo) setMaxCombo(nextCombo);

        // Mark word mastered
        onWordMastered(first.wordId);

        setTimeout(() => {
          setCards((prev) =>
            prev.map((c) =>
              c.wordId === first.wordId
                ? { ...c, isMatched: true, isFlipped: true }
                : c
            )
          );
          setSelectedCards([]);
          setIsProcessing(false);

          // Check if all matched
          const remainingUnmatched = updatedCards.filter(
            (c) => !c.isMatched && c.wordId !== first.wordId
          );
          if (remainingUnmatched.length === 0) {
            handleVictory();
          }
        }, 400);
      } else {
        // NO MATCH
        playToneWrong();
        setCombo(0);
        setTimeout(() => {
          setCards((prev) =>
            prev.map((c) =>
              c.id === first.id || c.id === second.id
                ? { ...c, isFlipped: false }
                : c
            )
          );
          setSelectedCards([]);
          setIsProcessing(false);
        }, 900);
      }
    }
  };

  const handleVictory = () => {
    setIsGameWon(true);
    playLevelVictory();
    try {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
      });
    } catch {
      // ignore
    }
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-6" id="memory-match-container">
      {/* Top Banner & Info */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-stone-900 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-500" />
            汉字翻牌消消乐 Memory Match
          </h2>
          <p className="text-xs sm:text-sm text-stone-500">
            找出配对的汉字与英文释义，连击可赢取更多星星！
          </p>
        </div>

        {/* Difficulty Selector */}
        <div className="flex items-center gap-2">
          {(['easy', 'medium', 'all'] as const).map((diff) => (
            <button
              key={diff}
              onClick={() => {
                setDifficulty(diff);
                startNewGame(diff);
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                difficulty === diff
                  ? 'bg-amber-500 text-white shadow-sm shadow-amber-500/30'
                  : 'bg-white text-stone-600 border border-stone-200 hover:bg-stone-100'
              }`}
            >
              {diff === 'easy' && '入门 4对 (8张)'}
              {diff === 'medium' && '进阶 8对 (16张)'}
              {diff === 'all' && '大满贯 11对 (22张)'}
            </button>
          ))}
        </div>
      </div>

      {/* Game Dashboard Stats */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-stone-200 shadow-xs mb-6">
        <div className="flex items-center gap-4 sm:gap-6 text-sm font-semibold">
          <div className="flex items-center gap-1.5 text-stone-700">
            <Clock className="w-4 h-4 text-stone-400" />
            <span>时间: {formatTime(seconds)}</span>
          </div>

          <div className="flex items-center gap-1.5 text-stone-700">
            <RotateCcw className="w-4 h-4 text-stone-400" />
            <span>翻牌步数: {moves}</span>
          </div>

          <div className="flex items-center gap-1.5 text-amber-600">
            <Flame className="w-4 h-4 text-amber-500" />
            <span>
              连击 Combo: <strong className="text-base">{combo}x</strong>
            </span>
          </div>
        </div>

        <button
          onClick={() => startNewGame(difficulty)}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold bg-stone-100 hover:bg-stone-200 text-stone-700 transition-colors cursor-pointer"
          id="btn-restart-memory-game"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          重新洗牌 Restart
        </button>
      </div>

      {/* Cards Grid */}
      <div
        className={`grid gap-3 select-none ${
          cards.length <= 8
            ? 'grid-cols-2 sm:grid-cols-4'
            : cards.length <= 16
            ? 'grid-cols-2 sm:grid-cols-4 md:grid-cols-4'
            : 'grid-cols-2 sm:grid-cols-4 md:grid-cols-6'
        }`}
        id="memory-cards-grid"
      >
        {cards.map((card) => {
          const isSelected = selectedCards.some((sc) => sc.id === card.id);
          const showFace = card.isFlipped || card.isMatched;

          return (
            <div
              key={card.id}
              onClick={() => handleCardClick(card)}
              className={`min-h-[110px] sm:min-h-[130px] rounded-2xl p-3 flex flex-col items-center justify-center text-center transition-all duration-200 border-2 cursor-pointer relative ${
                card.isMatched
                  ? 'bg-emerald-50/80 border-emerald-300 text-emerald-900 opacity-90 scale-95'
                  : showFace
                  ? 'bg-amber-50 border-amber-400 text-stone-900 shadow-md scale-102'
                  : 'bg-white hover:bg-amber-50/30 border-stone-200 hover:border-amber-200 shadow-xs hover:shadow-sm'
              }`}
            >
              {card.isMatched && (
                <div className="absolute top-2 right-2 text-emerald-600">
                  <CheckCircle className="w-4 h-4" />
                </div>
              )}

              {showFace ? (
                <div className="flex flex-col items-center justify-center animate-in zoom-in-95 duration-150 w-full px-1">
                  {card.type === 'hanzi' ? (
                    <>
                      <span className="text-2xl sm:text-3xl font-extrabold font-sans text-stone-900 mb-1">
                        {card.displayPrimary}
                      </span>
                      <span className="text-xs font-mono text-amber-700 font-medium">
                        {card.displaySecondary}
                      </span>
                    </>
                  ) : (
                    <>
                      <span className="text-xs font-mono text-stone-400 mb-0.5">
                        {card.displaySecondary}
                      </span>
                      <span className="text-sm sm:text-base font-bold text-stone-800 leading-tight">
                        {card.displayPrimary}
                      </span>
                    </>
                  )}
                </div>
              ) : (
                /* Card Back Pattern */
                <div className="flex flex-col items-center justify-center text-amber-500/80 group">
                  <div className="w-10 h-10 rounded-xl bg-amber-100/60 flex items-center justify-center font-bold text-lg text-amber-700 mb-1">
                    ?
                  </div>
                  <span className="text-[10px] text-stone-400 font-medium">
                    点开翻牌
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Victory Modal */}
      {isGameWon && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-300">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 sm:p-8 text-center shadow-2xl border border-stone-100">
            <div className="w-16 h-16 rounded-3xl bg-amber-100 text-amber-600 flex items-center justify-center mx-auto mb-4">
              <Trophy className="w-8 h-8" />
            </div>
            <h3 className="text-2xl font-black text-stone-900 mb-1">
              太棒了！全部配对成功！
            </h3>
            <p className="text-stone-500 text-xs sm:text-sm mb-5">
              Excellent job! You successfully matched all words.
            </p>

            <div className="bg-stone-50 rounded-2xl p-4 border border-stone-200 mb-6 text-left text-xs sm:text-sm space-y-2">
              <div className="flex justify-between text-stone-600">
                <span>耗时 Time:</span>
                <strong className="text-stone-900">{formatTime(seconds)}</strong>
              </div>
              <div className="flex justify-between text-stone-600">
                <span>总步数 Moves:</span>
                <strong className="text-stone-900">{moves} 步</strong>
              </div>
              <div className="flex justify-between text-stone-600">
                <span>最高连击 Max Combo:</span>
                <strong className="text-amber-600">{maxCombo}x 🔥</strong>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => startNewGame(difficulty)}
                className="flex-1 py-3 rounded-xl bg-amber-500 hover:bg-amber-600 active:scale-95 text-white font-bold text-sm shadow-md shadow-amber-500/25 transition-all cursor-pointer"
                id="btn-play-again-memory"
              >
                再玩一局 Play Again
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
