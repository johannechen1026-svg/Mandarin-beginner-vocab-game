import React, { useState, useEffect } from 'react';
import {
  Volume2,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Sparkles,
  Shuffle,
  RotateCw,
  BookOpen,
} from 'lucide-react';
import { VocabWord } from '../types';
import { speakChinese, playCardFlip } from '../utils/audio';

interface FlashcardModeProps {
  words: VocabWord[];
  masteredWords: string[];
  onToggleMastered: (wordId: string) => void;
  slowAudio: boolean;
  onOpenWordDetail: (word: VocabWord) => void;
}

export const FlashcardMode: React.FC<FlashcardModeProps> = ({
  words,
  masteredWords,
  onToggleMastered,
  slowAudio,
  onOpenWordDetail,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [autoPlayAudio, setAutoPlayAudio] = useState(true);

  const currentWord = words[currentIndex] || words[0];
  const isMastered = masteredWords.includes(currentWord.id);

  // Play audio when changing words if autoPlayAudio is enabled
  useEffect(() => {
    setIsFlipped(false);
    if (autoPlayAudio && currentWord) {
      speakChinese(currentWord.hanzi, slowAudio ? 0.7 : 0.85);
    }
  }, [currentIndex, autoPlayAudio, currentWord, slowAudio]);

  const handleFlip = () => {
    playCardFlip();
    setIsFlipped(!isFlipped);
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : words.length - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev < words.length - 1 ? prev + 1 : 0));
  };

  const handleShuffle = () => {
    const nextIdx = Math.floor(Math.random() * words.length);
    setCurrentIndex(nextIdx);
  };

  const handleSpeak = (e: React.MouseEvent) => {
    e.stopPropagation();
    speakChinese(currentWord.hanzi, slowAudio ? 0.7 : 0.85);
  };

  const handleSpeakExample = (e: React.MouseEvent) => {
    e.stopPropagation();
    speakChinese(currentWord.example.zh, slowAudio ? 0.7 : 0.85);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-6" id="flashcard-mode-container">
      {/* Controls Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-stone-900 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-amber-500" />
            词汇研学卡片 Vocabulary Flashcards
          </h2>
          <p className="text-xs sm:text-sm text-stone-500">
            点击卡片可翻转查看释义与记忆诀窍，点击喇叭练习纯正发音。
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setAutoPlayAudio(!autoPlayAudio)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-colors cursor-pointer ${
              autoPlayAudio
                ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                : 'bg-stone-100 text-stone-500 border-stone-200'
            }`}
            title="Auto-play audio when switching cards"
            id="btn-toggle-autoplay"
          >
            自动朗读: {autoPlayAudio ? '开 ON' : '关 OFF'}
          </button>

          <button
            onClick={handleShuffle}
            className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold bg-stone-100 text-stone-700 border border-stone-200 hover:bg-stone-200 transition-colors cursor-pointer"
            id="btn-shuffle-flashcards"
          >
            <Shuffle className="w-3.5 h-3.5" />
            随机
          </button>
        </div>
      </div>

      {/* Main Flashcard View */}
      <div className="flex flex-col items-center justify-center">
        {/* Card Frame */}
        <div
          onClick={handleFlip}
          className="w-full max-w-xl min-h-[380px] bg-white rounded-3xl p-6 sm:p-8 border-2 border-amber-100 shadow-xl shadow-amber-500/5 hover:border-amber-300 transition-all cursor-pointer relative flex flex-col justify-between select-none group"
          id="flashcard-main"
        >
          {/* Top badges */}
          <div className="flex items-center justify-between">
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-100/70 text-amber-800 border border-amber-200/50">
              {currentWord.category}
            </span>

            <div className="flex items-center gap-2">
              <span className="text-xs font-mono text-stone-400">
                {currentIndex + 1} / {words.length}
              </span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleMastered(currentWord.id);
                }}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold border transition-all cursor-pointer ${
                  isMastered
                    ? 'bg-emerald-500 text-white border-emerald-600 shadow-sm'
                    : 'bg-stone-100 text-stone-500 border-stone-200 hover:bg-emerald-50 hover:text-emerald-700'
                }`}
                id="btn-toggle-mastered"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                {isMastered ? '已掌握' : '标为掌握'}
              </button>
            </div>
          </div>

          {/* Card Face Content */}
          {!isFlipped ? (
            /* FRONT FACE: Character, Pinyin, Pronunciation */
            <div className="my-auto py-8 text-center flex flex-col items-center">
              <div className="text-stone-500 font-mono text-2xl sm:text-3xl font-medium tracking-wide mb-3">
                {currentWord.pinyin}
              </div>

              <div className="text-7xl sm:text-8xl font-black text-stone-900 tracking-wider mb-6 group-hover:scale-105 transition-transform duration-200">
                {currentWord.hanzi}
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={handleSpeak}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-amber-500 hover:bg-amber-600 active:scale-95 text-white font-bold text-sm shadow-md shadow-amber-500/25 transition-all cursor-pointer"
                  id="btn-card-speak-front"
                >
                  <Volume2 className="w-5 h-5" />
                  点击发音 Listen
                </button>

                <div className="text-xs text-stone-400 font-medium hidden sm:block">
                  ({currentWord.strokes} 画)
                </div>
              </div>
            </div>
          ) : (
            /* BACK FACE: English Meaning, Mnemonic Tip, Example */
            <div className="my-auto py-4 animate-in fade-in duration-200">
              <div className="text-center mb-5">
                <div className="text-sm font-bold text-amber-600 uppercase tracking-widest mb-1">
                  {currentWord.pinyin}
                </div>
                <div className="text-4xl sm:text-5xl font-extrabold text-stone-900 mb-2">
                  {currentWord.english}
                </div>
                <div className="text-stone-400 text-xs font-mono">
                  汉字: <span className="text-stone-800 font-bold">{currentWord.hanzi}</span>
                </div>
              </div>

              {/* Memory Tip */}
              <div className="bg-amber-50/80 rounded-2xl p-4 border border-amber-200/60 mb-3">
                <div className="flex items-center gap-1.5 text-amber-900 font-bold text-xs mb-1">
                  <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                  记忆诀窍 & 部首
                </div>
                <p className="text-xs sm:text-sm text-stone-700 leading-relaxed font-medium">
                  {currentWord.memoryTip}
                </p>
                <div className="text-xs text-amber-800 font-mono mt-1">
                  结构: {currentWord.radicalInfo}
                </div>
              </div>

              {/* Example sentence */}
              <div className="bg-stone-50 rounded-2xl p-3.5 border border-stone-200">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[11px] font-bold text-stone-400 uppercase tracking-wider">
                    常用例句 Example
                  </span>
                  <button
                    onClick={handleSpeakExample}
                    className="text-amber-600 hover:text-amber-700 flex items-center gap-1 text-xs font-semibold cursor-pointer"
                  >
                    <Volume2 className="w-3.5 h-3.5" />
                    朗读
                  </button>
                </div>
                <div className="text-stone-900 font-bold text-sm">
                  {currentWord.example.zh}
                </div>
                <div className="text-stone-500 font-mono text-xs">
                  {currentWord.example.py}
                </div>
                <div className="text-stone-600 text-xs italic">
                  "{currentWord.example.en}"
                </div>
              </div>
            </div>
          )}

          {/* Bottom Flip Tip */}
          <div className="pt-3 border-t border-stone-100 flex items-center justify-between text-xs text-stone-400">
            <span className="flex items-center gap-1">
              <RotateCw className="w-3.5 h-3.5" />
              点击卡片任意区域翻转 (Click to Flip)
            </span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onOpenWordDetail(currentWord);
              }}
              className="text-amber-600 hover:text-amber-700 font-semibold cursor-pointer"
            >
              详细解析 →
            </button>
          </div>
        </div>

        {/* Navigation buttons: Prev / Next */}
        <div className="flex items-center gap-4 mt-6">
          <button
            onClick={handlePrev}
            className="flex items-center gap-1.5 px-5 py-2.5 rounded-2xl bg-white border border-stone-200 hover:border-amber-400 text-stone-700 font-bold text-sm shadow-sm hover:shadow transition-all cursor-pointer"
            id="btn-flashcard-prev"
          >
            <ChevronLeft className="w-4 h-4" />
            上一个 Previous
          </button>

          <button
            onClick={handleFlip}
            className="px-4 py-2.5 rounded-2xl bg-amber-100 hover:bg-amber-200 text-amber-900 font-bold text-sm transition-colors cursor-pointer"
            id="btn-flashcard-flip"
          >
            <RotateCw className="w-4 h-4 inline mr-1" />
            翻面 Flip
          </button>

          <button
            onClick={handleNext}
            className="flex items-center gap-1.5 px-5 py-2.5 rounded-2xl bg-white border border-stone-200 hover:border-amber-400 text-stone-700 font-bold text-sm shadow-sm hover:shadow transition-all cursor-pointer"
            id="btn-flashcard-next"
          >
            下一个 Next
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Quick Grid of all 11 Vocabulary Words */}
      <div className="mt-10 pt-6 border-t border-stone-200">
        <h3 className="text-sm font-bold text-stone-700 mb-3 flex items-center justify-between">
          <span>全部 11 个词汇快速直达 All 11 Vocabulary:</span>
          <span className="text-xs text-stone-400 font-normal">
            点击任意字卡即可跳转研学
          </span>
        </h3>

        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2.5">
          {words.map((w, idx) => {
            const isSelected = idx === currentIndex;
            const mastered = masteredWords.includes(w.id);
            return (
              <button
                key={w.id}
                onClick={() => setCurrentIndex(idx)}
                className={`p-3 rounded-2xl border text-center transition-all cursor-pointer relative ${
                  isSelected
                    ? 'bg-amber-500 text-white border-amber-600 shadow-md scale-105'
                    : 'bg-white hover:bg-amber-50/60 text-stone-800 border-stone-200 hover:border-amber-300'
                }`}
                id={`btn-word-tile-${w.id}`}
              >
                {mastered && (
                  <span
                    className={`absolute top-1.5 right-1.5 w-2 h-2 rounded-full ${
                      isSelected ? 'bg-white' : 'bg-emerald-500'
                    }`}
                    title="Mastered"
                  />
                )}
                <div
                  className={`text-xl font-bold font-sans ${
                    isSelected ? 'text-white' : 'text-stone-900'
                  }`}
                >
                  {w.hanzi}
                </div>
                <div
                  className={`text-xs font-mono truncate ${
                    isSelected ? 'text-amber-100' : 'text-stone-400'
                  }`}
                >
                  {w.pinyin}
                </div>
                <div
                  className={`text-[11px] truncate font-medium ${
                    isSelected ? 'text-white/90' : 'text-stone-500'
                  }`}
                >
                  {w.english}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
