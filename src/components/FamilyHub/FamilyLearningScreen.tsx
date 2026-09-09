import React, { useState } from 'react';
import { LEARNING_TOPICS } from '../../data/familyData';
import { ArrowLeft, Sparkles } from 'lucide-react';
import { sound } from '../../utils/sound';
import { fireBurstConfetti } from '../../utils/confetti';

interface FamilyLearningScreenProps {
  onBack: () => void;
}

export const FamilyLearningScreen: React.FC<FamilyLearningScreenProps> = ({ onBack }) => {
  const [selectedTopicId, setSelectedTopicId] = useState<string>(LEARNING_TOPICS[0].id);
  const [selectedQuizAnswer, setSelectedQuizAnswer] = useState<number | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);

  const currentTopic = LEARNING_TOPICS.find(t => t.id === selectedTopicId) || LEARNING_TOPICS[0];

  const handleSelectAnswer = (idx: number) => {
    setSelectedQuizAnswer(idx);
    setShowExplanation(true);
    if (currentTopic.quiz && idx === currentTopic.quiz.correctIndex) {
      sound.playSuccess();
      fireBurstConfetti();
    } else {
      sound.playSkip();
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 pb-24 space-y-6 animate-pop-in">
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="px-4 py-2 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold text-xs flex items-center gap-1.5 shadow-sm active:scale-95"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Kembali</span>
        </button>

        <h2 className="font-display font-black text-xl text-slate-900 dark:text-white flex items-center gap-2">
          <span>📚</span> Belajar Bersama Keluarga
        </h2>

        <div className="w-8" />
      </div>

      {/* Topic selector pills */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {LEARNING_TOPICS.map((t) => (
          <button
            key={t.id}
            onClick={() => {
              sound.playClick();
              setSelectedTopicId(t.id);
              setSelectedQuizAnswer(null);
              setShowExplanation(false);
            }}
            className={`px-4 py-2 rounded-2xl text-xs font-bold shrink-0 flex items-center gap-1.5 transition-all ${
              selectedTopicId === t.id
                ? 'bg-purple-600 text-white shadow-md scale-105'
                : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
            }`}
          >
            <span>{t.emoji}</span>
            <span>{t.categoryLabel}</span>
          </button>
        ))}
      </div>

      {/* Topic Detail */}
      <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border-3 border-purple-200 dark:border-purple-900/60 shadow-bubbly-sm space-y-4">
        <div className="flex items-center gap-3">
          <span className="text-4xl">{currentTopic.emoji}</span>
          <div>
            <span className="text-[10px] font-extrabold uppercase text-purple-600 dark:text-purple-300">
              {currentTopic.categoryLabel}
            </span>
            <h3 className="font-display font-black text-xl text-slate-900 dark:text-white">
              {currentTopic.title}
            </h3>
          </div>
        </div>

        <div className="bg-purple-50/60 dark:bg-purple-950/30 p-4 rounded-2xl text-xs sm:text-sm text-slate-700 dark:text-slate-200 leading-relaxed font-medium whitespace-pre-line">
          {currentTopic.content}
        </div>

        {/* Mini Quiz */}
        {currentTopic.quiz && (
          <div className="pt-3 border-t border-slate-100 dark:border-slate-700 space-y-3">
            <h4 className="font-display font-black text-sm text-purple-900 dark:text-purple-200 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-purple-600" />
              <span>Kuis Cepat: {currentTopic.quiz.question}</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {currentTopic.quiz.options.map((opt, idx) => {
                const isSelected = selectedQuizAnswer === idx;
                const isCorrect = idx === currentTopic.quiz?.correctIndex;

                let btnStyle = 'bg-slate-50 dark:bg-slate-700/60 border-slate-200 dark:border-slate-600';
                if (showExplanation) {
                  if (isCorrect) btnStyle = 'bg-emerald-500 text-white border-emerald-500';
                  else if (isSelected) btnStyle = 'bg-red-500 text-white border-red-500';
                }

                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSelectAnswer(idx)}
                    className={`p-3 rounded-2xl border text-xs font-bold text-left transition-all ${btnStyle}`}
                  >
                    {opt}
                  </button>
                );
              })}
            </div>

            {showExplanation && (
              <p className="text-xs font-bold text-purple-700 dark:text-purple-300 bg-purple-100/70 dark:bg-purple-950/60 p-3 rounded-2xl animate-pop-in">
                💡 {currentTopic.quiz.explanation}
              </p>
            )}
          </div>
        )}
      </div>

    </div>
  );
};
