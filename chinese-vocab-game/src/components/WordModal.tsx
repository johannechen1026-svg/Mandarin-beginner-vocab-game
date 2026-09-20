import React from 'react';
import { Volume2, X, Sparkles, BookOpen } from 'lucide-react';
import { VocabWord } from '../types';
import { speakChinese, playCardFlip } from '../utils/audio';

interface WordModalProps {
  word: VocabWord | null;
  onClose: () => void;
}

export const WordModal: React.FC<WordModalProps> = ({ word, onClose }) => {
  if (!word) return null;

  const handleSpeak = (e: React.MouseEvent) => {
    e.stopPropagation();
    speakChinese(word.hanzi);
  };

  const handleSpeakExample = (e: React.MouseEvent) => {
    e.stopPropagation();
    speakChinese(word.example.zh);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-200"
      onClick={onClose}
      id="word-detail-modal-backdrop"
    >
      <div
        className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl border border-stone-100 relative max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
        id="word-detail-modal-card"
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors cursor-pointer"
          aria-label="Close"
          id="btn-close-word-modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Category tag */}
        <div className="flex items-center gap-2 mb-3">
          <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-amber-50 text-amber-800 border border-amber-200/60">
            {word.category}
          </span>
          <span className="text-xs text-stone-400 font-medium">
            {word.strokes} 画 (strokes)
          </span>
        </div>

        {/* Main Hanzi & Audio */}
        <div className="text-center my-4 py-4 bg-amber-50/50 rounded-2xl border border-amber-100/60">
          <div className="text-stone-500 font-mono text-xl tracking-wider mb-1">
            {word.pinyin}
          </div>
          <div className="text-6xl sm:text-7xl font-bold text-stone-900 tracking-wide font-sans mb-3 select-none">
            {word.hanzi}
          </div>
          <button
            onClick={handleSpeak}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 active:scale-95 text-white font-medium text-sm transition-all shadow-sm shadow-amber-200 cursor-pointer"
            id="btn-modal-pronounce"
          >
            <Volume2 className="w-4 h-4" />
            发音 Pronounce
          </button>
        </div>

        {/* English Meaning */}
        <div className="mb-4">
          <div className="text-xs font-semibold text-stone-400 uppercase tracking-wider mb-1">
            Meaning 英文释义
          </div>
          <div className="text-xl font-bold text-stone-800">
            {word.english}
          </div>
        </div>

        {/* Memory Tip & Radical */}
        <div className="bg-emerald-50/70 rounded-2xl p-4 border border-emerald-100 mb-4">
          <div className="flex items-center gap-1.5 text-emerald-800 font-semibold text-sm mb-1.5">
            <Sparkles className="w-4 h-4 text-emerald-600" />
            记忆小贴士 Memory Tip
          </div>
          <p className="text-emerald-900 text-sm leading-relaxed mb-2 font-medium">
            {word.memoryTip}
          </p>
          <div className="text-xs text-emerald-700/90 font-mono bg-white/70 px-2.5 py-1 rounded-md inline-block">
            字根结构: {word.radicalInfo}
          </div>
        </div>

        {/* Example Sentence */}
        <div className="bg-stone-50 rounded-2xl p-4 border border-stone-200/70">
          <div className="flex items-center justify-between mb-2">
            <span className="flex items-center gap-1.5 text-stone-600 font-semibold text-xs uppercase tracking-wider">
              <BookOpen className="w-3.5 h-3.5" />
              Example 例句
            </span>
            <button
              onClick={handleSpeakExample}
              className="text-amber-600 hover:text-amber-700 p-1 rounded-md hover:bg-amber-100/50 transition-colors flex items-center gap-1 text-xs font-medium cursor-pointer"
              title="Speak example sentence"
            >
              <Volume2 className="w-3.5 h-3.5" />
              朗读
            </button>
          </div>
          <div className="text-stone-900 font-bold text-base mb-0.5">
            {word.example.zh}
          </div>
          <div className="text-stone-500 font-mono text-xs mb-1">
            {word.example.py}
          </div>
          <div className="text-stone-600 text-xs italic">
            "{word.example.en}"
          </div>
        </div>
      </div>
    </div>
  );
};
