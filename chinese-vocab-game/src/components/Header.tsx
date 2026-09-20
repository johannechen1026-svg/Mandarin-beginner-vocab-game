import React from 'react';
import {
  BookOpen,
  Layers,
  Sparkles,
  Puzzle,
  HelpCircle,
  Trophy,
  Volume2,
  RotateCcw,
} from 'lucide-react';
import { GameMode, UserStats } from '../types';

interface HeaderProps {
  currentMode: GameMode;
  onSelectMode: (mode: GameMode) => void;
  stats: UserStats;
  totalWords: number;
  slowAudio: boolean;
  onToggleSlowAudio: () => void;
  onResetStats: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentMode,
  onSelectMode,
  stats,
  totalWords,
  slowAudio,
  onToggleSlowAudio,
  onResetStats,
}) => {
  const modes: { id: GameMode; label: string; icon: React.ReactNode; desc: string }[] = [
    {
      id: 'learn',
      label: '词汇研学',
      icon: <BookOpen className="w-4 h-4" />,
      desc: '发音与记忆卡',
    },
    {
      id: 'match',
      label: '对对碰',
      icon: <Layers className="w-4 h-4" />,
      desc: '汉字拼音配对',
    },
    {
      id: 'bubble',
      label: '气泡大作战',
      icon: <Sparkles className="w-4 h-4" />,
      desc: '手速消词挑战',
    },
    {
      id: 'builder',
      label: '拼字组句',
      icon: <Puzzle className="w-4 h-4" />,
      desc: '组词与实用句型',
    },
    {
      id: 'quiz',
      label: '听音测验',
      icon: <HelpCircle className="w-4 h-4" />,
      desc: '听辨与释义测试',
    },
  ];

  const masteredPercentage = Math.round((stats.masteredWords.length / totalWords) * 100);

  return (
    <header className="w-full bg-white/90 backdrop-blur-md border-b border-stone-200/80 sticky top-0 z-40">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3.5">
        {/* Top Branding & Quick Stats */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-400 flex items-center justify-center text-white font-bold text-2xl shadow-md shadow-amber-500/20 select-none">
              汉
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black text-stone-900 tracking-tight font-sans">
                  汉语乐学堂
                </h1>
                <span className="hidden sm:inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
                  初学专版 11词
                </span>
              </div>
              <p className="text-xs text-stone-500">
                Beginner Chinese Flashcards & Mini-Games
              </p>
            </div>
          </div>

          {/* Stats Badges & Controls */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Audio Speed Selector */}
            <button
              onClick={onToggleSlowAudio}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all border cursor-pointer ${
                slowAudio
                  ? 'bg-amber-100 text-amber-900 border-amber-300'
                  : 'bg-stone-100 text-stone-700 border-stone-200 hover:bg-stone-200'
              }`}
              title="Toggle audio pronunciation speed"
              id="btn-toggle-audio-speed"
            >
              <Volume2 className="w-3.5 h-3.5 text-amber-600" />
              <span>语速: {slowAudio ? '慢速 0.7x' : '正常 0.9x'}</span>
            </button>

            {/* Mastered Words Progress */}
            <div
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-stone-100 border border-stone-200 text-xs text-stone-700 font-semibold"
              title="Number of mastered vocabulary words"
            >
              <Trophy className="w-3.5 h-3.5 text-amber-500" />
              <span>
                掌握 {stats.masteredWords.length}/{totalWords}
              </span>
              <div className="w-12 h-2 bg-stone-200 rounded-full overflow-hidden hidden xs:block">
                <div
                  className="h-full bg-emerald-500 rounded-full transition-all duration-300"
                  style={{ width: `${masteredPercentage}%` }}
                />
              </div>
            </div>

            {/* Reset Progress */}
            <button
              onClick={onResetStats}
              className="p-1.5 rounded-xl text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors cursor-pointer"
              title="重置学习进度 Reset stats"
              id="btn-reset-stats"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Navigation Game Mode Tabs */}
        <nav
          className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar border-t border-stone-100 pt-2.5"
          aria-label="Game Modes"
        >
          {modes.map((m) => {
            const isActive = currentMode === m.id;
            return (
              <button
                key={m.id}
                onClick={() => onSelectMode(m.id)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-semibold whitespace-nowrap transition-all duration-150 cursor-pointer ${
                  isActive
                    ? 'bg-amber-500 text-white shadow-sm shadow-amber-500/30'
                    : 'bg-stone-100/80 text-stone-600 hover:bg-stone-200/80 hover:text-stone-900'
                }`}
                id={`tab-mode-${m.id}`}
              >
                <span className={isActive ? 'text-white' : 'text-stone-500'}>
                  {m.icon}
                </span>
                <span>{m.label}</span>
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
};
