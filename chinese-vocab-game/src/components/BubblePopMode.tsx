import React, { useState, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import {
  Volume2,
  Sparkles,
  RotateCcw,
  Trophy,
  Flame,
  Clock,
  Play,
} from 'lucide-react';
import { VocabWord } from '../types';
import {
  speakChinese,
  playBubblePop,
  playToneWrong,
  playLevelVictory,
} from '../utils/audio';

interface Bubble {
  id: string;
  word: VocabWord;
  x: number; // percentage 5% to 85%
  y: number; // percentage 10% to 75%
  color: string;
  size: number;
}

interface BubblePopModeProps {
  words: VocabWord[];
  onWordMastered: (wordId: string) => void;
  slowAudio: boolean;
}

const BUBBLE_COLORS = [
  'from-amber-400/90 to-orange-400/90 border-amber-300 text-amber-950',
  'from-emerald-400/90 to-teal-400/90 border-emerald-300 text-teal-950',
  'from-sky-400/90 to-blue-400/90 border-sky-300 text-blue-950',
  'from-rose-400/90 to-pink-400/90 border-rose-300 text-rose-950',
  'from-purple-400/90 to-indigo-400/90 border-purple-300 text-indigo-950',
];

export const BubblePopMode: React.FC<BubblePopModeProps> = ({
  words,
  onWordMastered,
  slowAudio,
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [timeLeft, setTimeLeft] = useState(30);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [targetWord, setTargetWord] = useState<VocabWord | null>(null);
  const [bubbles, setBubbles] = useState<Bubble[]>([]);
  const [gameOver, setGameOver] = useState(false);
  const [promptType, setPromptType] = useState<'english' | 'audio' | 'pinyin'>('english');
  const [wobbleId, setWobbleId] = useState<string | null>(null);

  const timerRef = useRef<number | null>(null);

  // Generate 6 bubbles on screen including the target
  const spawnBubbles = (target: VocabWord) => {
    // Pick 5 random distractors
    const distractors = words
      .filter((w) => w.id !== target.id)
      .sort(() => Math.random() - 0.5)
      .slice(0, 5);

    const candidates = [target, ...distractors].sort(() => Math.random() - 0.5);

    // Predefined flexible positions so bubbles don't overlap heavily
    const positions = [
      { x: 12, y: 15 },
      { x: 48, y: 12 },
      { x: 78, y: 20 },
      { x: 20, y: 55 },
      { x: 55, y: 60 },
      { x: 82, y: 58 },
    ].sort(() => Math.random() - 0.5);

    const newBubbles: Bubble[] = candidates.map((w, idx) => ({
      id: `${w.id}-${Date.now()}-${idx}`,
      word: w,
      x: positions[idx].x + (Math.random() * 6 - 3),
      y: positions[idx].y + (Math.random() * 6 - 3),
      color: BUBBLE_COLORS[idx % BUBBLE_COLORS.length],
      size: 90 + Math.floor(Math.random() * 15),
    }));

    setBubbles(newBubbles);
  };

  // Next Round
  const nextRound = (currentWords = words) => {
    const nextTarget = currentWords[Math.floor(Math.random() * currentWords.length)];
    setTargetWord(nextTarget);

    // alternate prompt types
    const types: ('english' | 'audio' | 'pinyin')[] = ['english', 'audio', 'pinyin'];
    const chosenType = types[Math.floor(Math.random() * types.length)];
    setPromptType(chosenType);

    spawnBubbles(nextTarget);

    // If audio mode or english mode, speak the target
    speakChinese(nextTarget.hanzi, slowAudio ? 0.7 : 0.85);
  };

  // Start game
  const startGame = () => {
    setIsPlaying(true);
    setGameOver(false);
    setScore(0);
    setStreak(0);
    setTimeLeft(30);
    nextRound();
  };

  // Timer
  useEffect(() => {
    if (isPlaying && !gameOver) {
      timerRef.current = window.setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            handleGameOver();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPlaying, gameOver]);

  const handleGameOver = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setIsPlaying(false);
    setGameOver(true);
    playLevelVictory();
    try {
      confetti({ particleCount: 70, spread: 60 });
    } catch {
      // ignore
    }
  };

  const handleBubbleClick = (bubble: Bubble) => {
    if (!isPlaying || !targetWord) return;

    if (bubble.word.id === targetWord.id) {
      // CORRECT
      playBubblePop();
      onWordMastered(targetWord.id);
      const nextStreak = streak + 1;
      setStreak(nextStreak);
      const points = 10 + nextStreak * 2;
      setScore((s) => s + points);

      // Trigger next round
      nextRound();
    } else {
      // WRONG
      playToneWrong();
      setStreak(0);
      setWobbleId(bubble.id);
      setTimeout(() => setWobbleId(null), 500);
    }
  };

  const handleReplayAudio = () => {
    if (targetWord) {
      speakChinese(targetWord.hanzi, slowAudio ? 0.7 : 0.85);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-6" id="bubble-pop-container">
      {/* Header Info */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-stone-900 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-500" />
            气泡大作战 Bubble Pop Arcade
          </h2>
          <p className="text-xs sm:text-sm text-stone-500">
            根据提示寻找对应的汉字气泡并快速点击戳破！
          </p>
        </div>

        {isPlaying && (
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1 px-3 py-1 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 font-bold text-sm">
              <Clock className="w-4 h-4 text-amber-600" />
              <span>{timeLeft}s</span>
            </div>
            <div className="flex items-center gap-1 px-3 py-1 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 font-bold text-sm">
              <Trophy className="w-4 h-4 text-emerald-600" />
              <span>得分: {score}</span>
            </div>
            <div className="flex items-center gap-1 px-3 py-1 rounded-xl bg-orange-50 border border-orange-200 text-orange-800 font-bold text-sm">
              <Flame className="w-4 h-4 text-orange-500" />
              <span>{streak}x</span>
            </div>
          </div>
        )}
      </div>

      {/* Main Game Stage */}
      {!isPlaying && !gameOver ? (
        /* Start Screen */
        <div className="min-h-[420px] bg-gradient-to-b from-amber-50/70 via-white to-orange-50/50 rounded-3xl border-2 border-dashed border-amber-200 p-8 flex flex-col items-center justify-center text-center">
          <div className="w-20 h-20 rounded-3xl bg-amber-500 text-white flex items-center justify-center shadow-lg shadow-amber-500/30 mb-5 animate-bounce">
            <Sparkles className="w-10 h-10" />
          </div>
          <h3 className="text-2xl font-extrabold text-stone-900 mb-2">
            准备好测试手速和眼力了吗？
          </h3>
          <p className="text-stone-600 text-sm max-w-md mb-6 leading-relaxed">
            30秒限时消除模式！系统将给出英文释义、拼音或语音，在漂浮气泡中找出正确的汉字并戳破它。
          </p>
          <button
            onClick={startGame}
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-2xl bg-amber-500 hover:bg-amber-600 active:scale-95 text-white font-black text-base shadow-lg shadow-amber-500/30 transition-all cursor-pointer"
            id="btn-start-bubble-game"
          >
            <Play className="w-5 h-5 fill-white" />
            开始游戏 Start 30s Challenge
          </button>
        </div>
      ) : (
        /* Active Game Arena */
        <div className="relative min-h-[460px] bg-gradient-to-b from-sky-50/50 via-white to-amber-50/40 rounded-3xl border border-stone-200 shadow-inner overflow-hidden select-none">
          {/* Target Prompt Banner */}
          {targetWord && isPlaying && (
            <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 bg-white/95 backdrop-blur-md px-6 py-2.5 rounded-2xl border border-stone-200 shadow-md flex items-center gap-3">
              <span className="text-xs font-bold text-stone-400 uppercase tracking-wider">
                寻找 Target:
              </span>

              {promptType === 'english' && (
                <div className="flex items-center gap-2">
                  <span className="text-lg font-black text-stone-900">
                    "{targetWord.english}"
                  </span>
                  <span className="text-xs font-mono text-amber-600">
                    ({targetWord.pinyin})
                  </span>
                </div>
              )}

              {promptType === 'audio' && (
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-stone-800">
                    [听音辨字 Listen]
                  </span>
                  <button
                    onClick={handleReplayAudio}
                    className="p-1 rounded-lg bg-amber-100 hover:bg-amber-200 text-amber-800 transition-colors"
                    title="Replay Audio"
                  >
                    <Volume2 className="w-4 h-4" />
                  </button>
                </div>
              )}

              {promptType === 'pinyin' && (
                <div className="flex items-center gap-2">
                  <span className="text-xl font-mono font-bold text-amber-700">
                    {targetWord.pinyin}
                  </span>
                  <span className="text-xs text-stone-500">
                    ({targetWord.english})
                  </span>
                </div>
              )}

              <button
                onClick={handleReplayAudio}
                className="text-stone-400 hover:text-amber-600 transition-colors ml-1"
                title="Speak again"
              >
                <Volume2 className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Bubbles Floating Area */}
          <div className="w-full h-[460px] relative p-4">
            {bubbles.map((b) => {
              const isWobbling = wobbleId === b.id;
              return (
                <button
                  key={b.id}
                  onClick={() => handleBubbleClick(b)}
                  style={{
                    left: `${b.x}%`,
                    top: `${b.y}%`,
                    width: `${b.size}px`,
                    height: `${b.size}px`,
                  }}
                  className={`absolute rounded-full bg-gradient-to-br ${b.color} border-2 shadow-lg flex flex-col items-center justify-center cursor-pointer transition-transform hover:scale-110 active:scale-95 duration-150 animate-in zoom-in-75 ${
                    isWobbling ? 'animate-bounce border-red-500 bg-red-100' : ''
                  }`}
                  id={`bubble-${b.word.id}`}
                >
                  <span className="text-2xl sm:text-3xl font-black tracking-wide font-sans">
                    {b.word.hanzi}
                  </span>
                  <span className="text-[10px] font-mono opacity-80 mt-0.5">
                    {b.word.pinyin}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Game Over Modal */}
      {gameOver && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-300">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 sm:p-8 text-center shadow-2xl border border-stone-100">
            <div className="w-16 h-16 rounded-3xl bg-amber-100 text-amber-600 flex items-center justify-center mx-auto mb-4">
              <Trophy className="w-8 h-8" />
            </div>
            <h3 className="text-2xl font-black text-stone-900 mb-1">
              时间到！挑战完成
            </h3>
            <p className="text-stone-500 text-xs sm:text-sm mb-5">
              Time is up! Great reflexes practicing vocabulary.
            </p>

            <div className="bg-stone-50 rounded-2xl p-4 border border-stone-200 mb-6 space-y-2 text-sm">
              <div className="flex justify-between text-stone-600">
                <span>最终得分 Score:</span>
                <strong className="text-stone-900 text-base">{score} 分</strong>
              </div>
              <div className="flex justify-between text-stone-600">
                <span>最高连击 Max Streak:</span>
                <strong className="text-amber-600">{streak}x 🔥</strong>
              </div>
            </div>

            <button
              onClick={startGame}
              className="w-full py-3 rounded-xl bg-amber-500 hover:bg-amber-600 active:scale-95 text-white font-bold text-sm shadow-md shadow-amber-500/25 transition-all cursor-pointer"
              id="btn-play-again-bubble"
            >
              再来一局 Play Again
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
