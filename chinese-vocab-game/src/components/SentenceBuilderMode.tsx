import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import {
  Puzzle,
  Volume2,
  CheckCircle2,
  HelpCircle,
  Sparkles,
  ChevronRight,
  RotateCcw,
} from 'lucide-react';
import { SentencePuzzle, VocabWord } from '../types';
import { SENTENCE_PUZZLES } from '../data/vocab';
import {
  speakChinese,
  playToneSuccess,
  playToneWrong,
  playCardFlip,
  playLevelVictory,
} from '../utils/audio';

interface SentenceBuilderModeProps {
  words: VocabWord[];
  onPuzzleSolved?: () => void;
  slowAudio: boolean;
}

export const SentenceBuilderMode: React.FC<SentenceBuilderModeProps> = ({
  slowAudio,
}) => {
  const [puzzleIndex, setPuzzleIndex] = useState<number>(0);
  const [selectedTokens, setSelectedTokens] = useState<string[]>([]);
  const [availableTokens, setAvailableTokens] = useState<{ id: string; text: string }[]>([]);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);
  const [isError, setIsError] = useState<boolean>(false);
  const [showHint, setShowHint] = useState<boolean>(false);
  const [completedCount, setCompletedCount] = useState<number>(0);

  const currentPuzzle: SentencePuzzle = SENTENCE_PUZZLES[puzzleIndex];

  // Initialize pool of tokens for current puzzle
  useEffect(() => {
    resetCurrentPuzzle();
  }, [puzzleIndex]);

  const resetCurrentPuzzle = () => {
    const all = [...currentPuzzle.tokens, ...currentPuzzle.distractors]
      .sort(() => Math.random() - 0.5)
      .map((text, idx) => ({
        id: `${text}-${idx}-${Date.now()}`,
        text,
      }));

    setAvailableTokens(all);
    setSelectedTokens([]);
    setIsSuccess(false);
    setIsError(false);
    setShowHint(false);
  };

  // Pick a token into answer box
  const handleSelectToken = (tokenObj: { id: string; text: string }) => {
    if (isSuccess) return;
    playCardFlip();
    speakChinese(tokenObj.text, slowAudio ? 0.7 : 0.85);

    setSelectedTokens((prev) => [...prev, tokenObj.text]);
    setAvailableTokens((prev) => prev.filter((t) => t.id !== tokenObj.id));
    setIsError(false);
  };

  // Remove a token from answer box back to pool
  const handleRemoveToken = (index: number) => {
    if (isSuccess) return;
    playCardFlip();
    const tokenText = selectedTokens[index];
    setSelectedTokens((prev) => prev.filter((_, i) => i !== index));
    setAvailableTokens((prev) => [
      ...prev,
      { id: `${tokenText}-${Date.now()}`, text: tokenText },
    ]);
    setIsError(false);
  };

  // Check the answer
  const handleCheck = () => {
    const userSentence = selectedTokens.join('');
    if (userSentence === currentPuzzle.targetSentence) {
      // CORRECT!
      setIsSuccess(true);
      setIsError(false);
      setCompletedCount((c) => c + 1);
      playToneSuccess();
      speakChinese(currentPuzzle.targetSentence, slowAudio ? 0.7 : 0.85);

      try {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.6 },
        });
      } catch {
        // ignore
      }
    } else {
      // INCORRECT
      setIsError(true);
      playToneWrong();
    }
  };

  const handleNext = () => {
    if (puzzleIndex < SENTENCE_PUZZLES.length - 1) {
      setPuzzleIndex((prev) => prev + 1);
    } else {
      // Looped or completed all
      playLevelVictory();
      setPuzzleIndex(0);
    }
  };

  const handlePronounceTarget = () => {
    speakChinese(currentPuzzle.targetSentence, slowAudio ? 0.7 : 0.85);
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-6" id="sentence-builder-container">
      {/* Header Info */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-stone-900 flex items-center gap-2">
            <Puzzle className="w-5 h-5 text-amber-500" />
            拼字组句 Sentence & Phrase Builder
          </h2>
          <p className="text-xs sm:text-sm text-stone-500">
            用学过的词汇拼出地道日常表达，理解中文词序逻辑。
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-mono font-bold px-3 py-1.5 rounded-xl bg-amber-50 text-amber-900 border border-amber-200">
            关卡 {puzzleIndex + 1} / {SENTENCE_PUZZLES.length}
          </span>
          <button
            onClick={resetCurrentPuzzle}
            className="p-1.5 rounded-xl text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors"
            title="Reset tiles"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Target Mission Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200 shadow-xs mb-6">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-bold text-amber-700 uppercase tracking-wider">
            请拼出对应句子 Assemble the Target Phrase:
          </span>
          <button
            onClick={() => setShowHint(!showHint)}
            className="text-stone-400 hover:text-amber-600 flex items-center gap-1 text-xs font-semibold cursor-pointer"
            id="btn-sentence-hint"
          >
            <HelpCircle className="w-3.5 h-3.5" />
            {showHint ? '隐藏提示' : '词义提示 Hint'}
          </button>
        </div>

        {/* Translation Prompt */}
        <div className="text-2xl sm:text-3xl font-black text-stone-900 mb-2">
          "{currentPuzzle.translation}"
        </div>

        {/* Hint Box */}
        {showHint && (
          <div className="bg-amber-50 rounded-2xl p-3 border border-amber-200 text-xs text-amber-900 mb-3 animate-in fade-in duration-200">
            💡 <strong>提示:</strong> {currentPuzzle.hint} (Pinyin: {currentPuzzle.targetPinyin})
          </div>
        )}

        {/* Answer Assembly Box */}
        <div
          className={`min-h-[72px] rounded-2xl p-3 border-2 flex flex-wrap items-center gap-2 transition-all my-5 ${
            isSuccess
              ? 'bg-emerald-50 border-emerald-400'
              : isError
              ? 'bg-rose-50 border-rose-400'
              : 'bg-stone-50 border-stone-300'
          }`}
          id="answer-assembly-slots"
        >
          {selectedTokens.length === 0 && (
            <span className="text-stone-400 text-xs sm:text-sm italic pl-2 select-none">
              点击下方词块按正确顺序排入此处... (Click word tiles below in order)
            </span>
          )}

          {selectedTokens.map((token, idx) => (
            <button
              key={`${token}-${idx}`}
              onClick={() => handleRemoveToken(idx)}
              className={`px-4 py-2.5 rounded-xl font-bold text-lg sm:text-xl shadow-xs transition-transform active:scale-95 cursor-pointer ${
                isSuccess
                  ? 'bg-emerald-500 text-white shadow-emerald-500/20'
                  : 'bg-white hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 text-stone-900 border border-stone-200'
              }`}
              title="Click to remove"
            >
              {token}
            </button>
          ))}
        </div>

        {/* Action button: Check or Next */}
        <div className="flex items-center justify-between pt-2">
          {isSuccess ? (
            <div className="flex items-center gap-2 text-emerald-700 font-bold text-sm">
              <CheckCircle2 className="w-5 h-5 text-emerald-500" />
              <span>
                太棒了！正确表达: <strong>{currentPuzzle.targetSentence}</strong> (
                {currentPuzzle.targetPinyin})
              </span>
              <button
                onClick={handlePronounceTarget}
                className="p-1 rounded-lg bg-emerald-100 hover:bg-emerald-200 text-emerald-800"
                title="Listen to full phrase"
              >
                <Volume2 className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div>
              {isError && (
                <span className="text-rose-600 text-xs sm:text-sm font-semibold">
                  词序或选词有误，请调整重试！
                </span>
              )}
            </div>
          )}

          <div className="ml-auto flex items-center gap-2">
            {!isSuccess ? (
              <button
                onClick={handleCheck}
                disabled={selectedTokens.length === 0}
                className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 disabled:opacity-50 active:scale-95 text-white font-bold text-sm shadow-md shadow-amber-500/20 transition-all cursor-pointer"
                id="btn-check-sentence"
              >
                检查答案 Check
              </button>
            ) : (
              <button
                onClick={handleNext}
                className="flex items-center gap-1 px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-bold text-sm shadow-md shadow-emerald-600/20 transition-all cursor-pointer"
                id="btn-next-puzzle"
              >
                下一题 Next
                <ChevronRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Available Word Tiles Pool */}
      <div className="bg-stone-100/80 rounded-3xl p-6 border border-stone-200/80">
        <div className="text-xs font-bold text-stone-500 uppercase tracking-wider mb-4">
          备选词块 Available Word Tiles:
        </div>

        <div className="flex flex-wrap gap-3" id="available-word-tiles">
          {availableTokens.map((tokenObj) => (
            <button
              key={tokenObj.id}
              onClick={() => handleSelectToken(tokenObj)}
              className="px-5 py-3 rounded-2xl bg-white hover:bg-amber-50 hover:border-amber-300 active:scale-95 text-stone-900 border-2 border-stone-200 shadow-sm font-bold text-xl sm:text-2xl transition-all cursor-pointer select-none"
              id={`token-${tokenObj.text}`}
            >
              {tokenObj.text}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
