/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { GameMode, UserStats, VocabWord } from './types';
import { VOCAB_LIST } from './data/vocab';
import { Header } from './components/Header';
import { FlashcardMode } from './components/FlashcardMode';
import { MemoryMatchMode } from './components/MemoryMatchMode';
import { BubblePopMode } from './components/BubblePopMode';
import { SentenceBuilderMode } from './components/SentenceBuilderMode';
import { QuizMode } from './components/QuizMode';
import { WordModal } from './components/WordModal';
import { Sparkles, Heart, Info, Volume2 } from 'lucide-react';
import { speakChinese } from './utils/audio';

const STORAGE_KEY = 'chinese_vocab_game_stats_v1';

export default function App() {
  const [currentMode, setCurrentMode] = useState<GameMode>('learn');
  const [modalWord, setModalWord] = useState<VocabWord | null>(null);
  const [slowAudio, setSlowAudio] = useState<boolean>(true); // default slower for beginners

  const [stats, setStats] = useState<UserStats>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch {
      // ignore
    }
    return {
      masteredWords: [],
      highScores: { match: 0, bubble: 0, quiz: 0, builder: 0 },
      streak: 1,
      lastPlayedDate: new Date().toISOString().slice(0, 10),
      totalAnswered: 0,
    };
  });

  // Save stats to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(stats));
    } catch {
      // ignore
    }
  }, [stats]);

  const handleToggleMastered = (wordId: string) => {
    setStats((prev) => {
      const exists = prev.masteredWords.includes(wordId);
      const updated = exists
        ? prev.masteredWords.filter((id) => id !== wordId)
        : [...prev.masteredWords, wordId];
      return { ...prev, masteredWords: updated };
    });
  };

  const handleWordMastered = (wordId: string) => {
    setStats((prev) => {
      if (prev.masteredWords.includes(wordId)) return prev;
      return {
        ...prev,
        masteredWords: [...prev.masteredWords, wordId],
        totalAnswered: prev.totalAnswered + 1,
      };
    });
  };

  const handleResetStats = () => {
    if (window.confirm('确定要重置所有学习与通关记录吗？(Reset progress?)')) {
      const freshStats: UserStats = {
        masteredWords: [],
        highScores: { match: 0, bubble: 0, quiz: 0, builder: 0 },
        streak: 1,
        lastPlayedDate: new Date().toISOString().slice(0, 10),
        totalAnswered: 0,
      };
      setStats(freshStats);
      try {
        localStorage.removeItem(STORAGE_KEY);
      } catch {
        // ignore
      }
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF8F5] text-stone-800 font-sans selection:bg-amber-200">
      {/* Sticky Top Header Navigation */}
      <Header
        currentMode={currentMode}
        onSelectMode={setCurrentMode}
        stats={stats}
        totalWords={VOCAB_LIST.length}
        slowAudio={slowAudio}
        onToggleSlowAudio={() => setSlowAudio(!slowAudio)}
        onResetStats={handleResetStats}
      />

      {/* Main Game Mode Area */}
      <main className="flex-1 py-4 sm:py-6" id="app-main-content">
        {currentMode === 'learn' && (
          <FlashcardMode
            words={VOCAB_LIST}
            masteredWords={stats.masteredWords}
            onToggleMastered={handleToggleMastered}
            slowAudio={slowAudio}
            onOpenWordDetail={(word) => setModalWord(word)}
          />
        )}

        {currentMode === 'match' && (
          <MemoryMatchMode
            words={VOCAB_LIST}
            onWordMastered={handleWordMastered}
            slowAudio={slowAudio}
          />
        )}

        {currentMode === 'bubble' && (
          <BubblePopMode
            words={VOCAB_LIST}
            onWordMastered={handleWordMastered}
            slowAudio={slowAudio}
          />
        )}

        {currentMode === 'builder' && (
          <SentenceBuilderMode
            words={VOCAB_LIST}
            onPuzzleSolved={() => {}}
            slowAudio={slowAudio}
          />
        )}

        {currentMode === 'quiz' && (
          <QuizMode
            words={VOCAB_LIST}
            onWordMastered={handleWordMastered}
            slowAudio={slowAudio}
            onOpenWordDetail={(word) => setModalWord(word)}
          />
        )}
      </main>

      {/* Beginner Knowledge Pillows: Key Differences & Connections */}
      <section className="bg-stone-100/70 border-t border-stone-200/80 py-8 px-4 mt-12">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center gap-2 mb-4 text-stone-800 font-bold text-base sm:text-lg">
            <Info className="w-5 h-5 text-amber-600" />
            <span>初学者记忆指南 Beginner Memory Guide (11核心词)</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs sm:text-sm">
            {/* Box 1: 她 vs 他 */}
            <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-xs">
              <div className="flex items-center justify-between font-bold text-stone-900 mb-2">
                <span>
                  👧 她 (tā) <span className="text-stone-400">vs</span> 👦 他 (tā)
                </span>
                <button
                  onClick={() => speakChinese('她他', slowAudio ? 0.7 : 0.85)}
                  className="text-amber-600 hover:text-amber-700 p-1"
                  title="Listen"
                >
                  <Volume2 className="w-4 h-4" />
                </button>
              </div>
              <p className="text-stone-600 leading-relaxed">
                两词读音完全相同，但部首不同：<strong>她</strong> 是女字旁 (Woman radical 女)，指代女性；<strong>他</strong> 是单人旁 (Person radical 亻)，指代男性。
              </p>
            </div>

            {/* Box 2: 你 + 好 = 你好 */}
            <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-xs">
              <div className="flex items-center justify-between font-bold text-stone-900 mb-2">
                <span>
                  🤝 你 + 好 = 你好
                </span>
                <button
                  onClick={() => speakChinese('你好', slowAudio ? 0.7 : 0.85)}
                  className="text-amber-600 hover:text-amber-700 p-1"
                  title="Listen"
                >
                  <Volume2 className="w-4 h-4" />
                </button>
              </div>
              <p className="text-stone-600 leading-relaxed">
                汉语中很多词汇由单字组合而成。"你" (You) + "好" (Good) 即为 "你好" (Hello)；"早上" (Morning) + "好" (Good) 便是 "早上好" (Good morning)！
              </p>
            </div>

            {/* Box 3: 我叫... / 你叫什么？ */}
            <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-xs">
              <div className="flex items-center justify-between font-bold text-stone-900 mb-2">
                <span>
                  🗣️ 叫 (jiào) & 什么 (shénme)
                </span>
                <button
                  onClick={() => speakChinese('你叫什么？我叫...', slowAudio ? 0.7 : 0.85)}
                  className="text-amber-600 hover:text-amber-700 p-1"
                  title="Listen"
                >
                  <Volume2 className="w-4 h-4" />
                </button>
              </div>
              <p className="text-stone-600 leading-relaxed">
                "叫" 带口字旁，表示名字称呼。"你叫什么？" (What are you called?)，回答时用 "我叫 + 名字" (My name is...)。
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-stone-200 py-5 text-center text-xs text-stone-400">
        <div className="max-w-4xl mx-auto px-4 flex flex-wrap items-center justify-between gap-2">
          <span>汉语乐学堂 · 帮助初学者轻松记忆 11 个高频汉字</span>
          <span className="flex items-center gap-1 text-stone-500">
            涵盖: 你好 · 你 · 好 · 早上 · 老师 · 我 · 叫 · 什么 · 她 · 他 · 再见
          </span>
        </div>
      </footer>

      {/* Detailed Word Modal if open */}
      <WordModal word={modalWord} onClose={() => setModalWord(null)} />
    </div>
  );
}
