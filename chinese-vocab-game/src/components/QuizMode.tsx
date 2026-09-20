import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import {
  HelpCircle,
  Volume2,
  CheckCircle2,
  XCircle,
  Trophy,
  RotateCcw,
  Sparkles,
  ArrowRight,
} from 'lucide-react';
import { VocabWord } from '../types';
import {
  speakChinese,
  playToneSuccess,
  playToneWrong,
  playLevelVictory,
} from '../utils/audio';

interface QuizQuestion {
  id: string;
  type: 'listen' | 'meaning' | 'pinyin';
  question: string;
  targetWord: VocabWord;
  options: VocabWord[];
  explanation: string;
}

interface QuizModeProps {
  words: VocabWord[];
  onWordMastered: (wordId: string) => void;
  slowAudio: boolean;
  onOpenWordDetail: (word: VocabWord) => void;
}

export const QuizMode: React.FC<QuizModeProps> = ({
  words,
  onWordMastered,
  slowAudio,
  onOpenWordDetail,
}) => {
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState<boolean>(false);
  const [score, setScore] = useState<number>(0);
  const [isQuizComplete, setIsQuizComplete] = useState<boolean>(false);

  // Generate a quiz of 10 dynamic questions
  const generateQuiz = () => {
    const shuffledWords = [...words].sort(() => Math.random() - 0.5);
    const newQuestions: QuizQuestion[] = [];

    // Question templates
    shuffledWords.slice(0, 10).forEach((target, i) => {
      // 3 distractors
      const distractors = words
        .filter((w) => w.id !== target.id)
        .sort(() => Math.random() - 0.5)
        .slice(0, 3);
      const options = [target, ...distractors].sort(() => Math.random() - 0.5);

      const typeChoice: 'listen' | 'meaning' | 'pinyin' =
        i % 3 === 0 ? 'listen' : i % 3 === 1 ? 'meaning' : 'pinyin';

      let qText = '';
      let explanation = `${target.hanzi} (${target.pinyin}): ${target.english}. 记忆要点: ${target.memoryTip}`;

      if (typeChoice === 'listen') {
        qText = '点击喇叭仔细听发音，选出正确的汉字：';
      } else if (typeChoice === 'meaning') {
        qText = `选出表示 "${target.english}" 的汉字：`;
      } else {
        qText = `选出拼音为 [${target.pinyin}] 的汉字：`;
      }

      newQuestions.push({
        id: `q-${i}-${target.id}`,
        type: typeChoice,
        question: qText,
        targetWord: target,
        options,
        explanation,
      });
    });

    setQuestions(newQuestions);
    setCurrentIndex(0);
    setSelectedOption(null);
    setIsAnswered(false);
    setScore(0);
    setIsQuizComplete(false);
  };

  useEffect(() => {
    generateQuiz();
  }, [words]);

  const currentQ = questions[currentIndex];

  // Auto-play audio if listen question
  useEffect(() => {
    if (currentQ && currentQ.type === 'listen') {
      speakChinese(currentQ.targetWord.hanzi, slowAudio ? 0.7 : 0.85);
    }
  }, [currentQ, slowAudio]);

  const handleSelectOption = (word: VocabWord) => {
    if (isAnswered || !currentQ) return;

    setSelectedOption(word.id);
    setIsAnswered(true);

    const isCorrect = word.id === currentQ.targetWord.id;

    if (isCorrect) {
      playToneSuccess();
      setScore((s) => s + 1);
      onWordMastered(word.id);
    } else {
      playToneWrong();
    }

    // Pronounce the chosen option
    speakChinese(word.hanzi, slowAudio ? 0.7 : 0.85);
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      setSelectedOption(null);
      setIsAnswered(false);
    } else {
      setIsQuizComplete(true);
      playLevelVictory();
      try {
        confetti({ particleCount: 80, spread: 70 });
      } catch {
        // ignore
      }
    }
  };

  const handlePlayTargetAudio = () => {
    if (currentQ) {
      speakChinese(currentQ.targetWord.hanzi, slowAudio ? 0.7 : 0.85);
    }
  };

  if (!currentQ && !isQuizComplete) return null;

  return (
    <div className="max-w-3xl mx-auto px-4 py-6" id="quiz-mode-container">
      {/* Quiz Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-stone-900 flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-amber-500" />
            听音认字测验 Vocabulary Quiz
          </h2>
          <p className="text-xs sm:text-sm text-stone-500">
            涵盖听辨读音、释义测试与拼音识字，全面检验初学成果。
          </p>
        </div>

        {!isQuizComplete && (
          <div className="flex items-center gap-3">
            <span className="text-xs font-bold text-stone-500 font-mono">
              进度: {currentIndex + 1} / {questions.length}
            </span>
            <div className="px-3 py-1 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs font-bold">
              得分: {score}
            </div>
          </div>
        )}
      </div>

      {/* Main Question Card */}
      {!isQuizComplete ? (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200 shadow-xs">
          {/* Question Type Banner */}
          <div className="flex items-center justify-between mb-4">
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-100/80 text-amber-900">
              {currentQ.type === 'listen' && '🎧 听音选字 Listening'}
              {currentQ.type === 'meaning' && '📖 词义测试 Meaning'}
              {currentQ.type === 'pinyin' && '🔤 拼音识字 Pinyin'}
            </span>
            <span className="text-xs text-stone-400 font-medium">
              单项选择题
            </span>
          </div>

          {/* Question Prompt */}
          <div className="mb-6">
            <h3 className="text-lg sm:text-xl font-bold text-stone-800 mb-3">
              {currentQ.question}
            </h3>

            {/* If listen type, big speaker button */}
            {currentQ.type === 'listen' && (
              <div className="flex items-center gap-3 p-4 bg-amber-50 rounded-2xl border border-amber-200">
                <button
                  onClick={handlePlayTargetAudio}
                  className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 active:scale-95 text-white font-bold text-sm flex items-center gap-2 shadow-sm shadow-amber-500/30 cursor-pointer"
                  id="btn-quiz-play-audio"
                >
                  <Volume2 className="w-5 h-5" />
                  再次播放发音 Replay Audio
                </button>
                <span className="text-xs text-amber-800">
                  仔细辨析声调和部首特征
                </span>
              </div>
            )}
          </div>

          {/* 4 Choices Options */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6" id="quiz-options-grid">
            {currentQ.options.map((opt) => {
              const isSelected = selectedOption === opt.id;
              const isCorrectTarget = opt.id === currentQ.targetWord.id;

              let style = 'bg-stone-50 hover:bg-amber-50/70 border-stone-200 text-stone-800';

              if (isAnswered) {
                if (isCorrectTarget) {
                  style = 'bg-emerald-100 border-emerald-400 text-emerald-950 font-bold';
                } else if (isSelected && !isCorrectTarget) {
                  style = 'bg-rose-100 border-rose-400 text-rose-950';
                } else {
                  style = 'bg-stone-50/50 border-stone-200 text-stone-400 opacity-60';
                }
              }

              return (
                <button
                  key={opt.id}
                  onClick={() => handleSelectOption(opt)}
                  disabled={isAnswered}
                  className={`p-4 rounded-2xl border-2 text-left flex items-center justify-between transition-all cursor-pointer ${style}`}
                  id={`quiz-option-${opt.id}`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-3xl sm:text-4xl font-black font-sans">
                      {opt.hanzi}
                    </span>
                    <div>
                      <div className="text-xs font-mono text-stone-500">
                        {opt.pinyin}
                      </div>
                      <div className="text-xs font-medium text-stone-600">
                        {opt.english}
                      </div>
                    </div>
                  </div>

                  {isAnswered && isCorrectTarget && (
                    <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0" />
                  )}
                  {isAnswered && isSelected && !isCorrectTarget && (
                    <XCircle className="w-6 h-6 text-rose-600 shrink-0" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Explanation & Next Step */}
          {isAnswered && (
            <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-200 animate-in fade-in duration-200 mb-4">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-bold text-amber-900 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                  词义解析 Explanation:
                </span>
                <button
                  onClick={() => onOpenWordDetail(currentQ.targetWord)}
                  className="text-xs font-bold text-amber-700 hover:text-amber-800 underline cursor-pointer"
                >
                  查看该词完整卡片 →
                </button>
              </div>
              <p className="text-xs sm:text-sm text-stone-700 leading-relaxed">
                {currentQ.explanation}
              </p>
            </div>
          )}

          {/* Next Button */}
          {isAnswered && (
            <div className="flex justify-end">
              <button
                onClick={handleNext}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 active:scale-95 text-white font-bold text-sm shadow-md shadow-amber-500/25 transition-all cursor-pointer"
                id="btn-quiz-next"
              >
                {currentIndex < questions.length - 1 ? '下一题 Next' : '查看测验结果 Results'}
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      ) : (
        /* Quiz Summary Screen */
        <div className="bg-white rounded-3xl p-8 text-center border border-stone-200 shadow-sm">
          <div className="w-20 h-20 rounded-3xl bg-amber-100 text-amber-600 flex items-center justify-center mx-auto mb-4">
            <Trophy className="w-10 h-10" />
          </div>

          <h3 className="text-2xl sm:text-3xl font-black text-stone-900 mb-2">
            测验完成！Quiz Finished
          </h3>
          <p className="text-stone-500 text-sm mb-6">
            你在 10 道汉语初级词汇题目中答对了：
          </p>

          <div className="inline-block px-8 py-4 rounded-2xl bg-amber-50 border border-amber-200 mb-6">
            <div className="text-5xl font-black text-amber-600 mb-1 font-mono">
              {score} / {questions.length}
            </div>
            <div className="text-xs font-bold text-amber-800">
              {score === 10
                ? '🌟 完美满分！11个核心词汇已熟记于心！'
                : score >= 7
                ? '🎉 成绩优异！掌握了绝大多数核心词！'
                : '💪 继续加油！建议回到词汇研学卡片温习。'}
            </div>
          </div>

          <div className="flex justify-center gap-4">
            <button
              onClick={generateQuiz}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-amber-500 hover:bg-amber-600 active:scale-95 text-white font-bold text-sm shadow-md shadow-amber-500/25 transition-all cursor-pointer"
              id="btn-quiz-restart"
            >
              <RotateCcw className="w-4 h-4" />
              重新测验 Retake Quiz
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
