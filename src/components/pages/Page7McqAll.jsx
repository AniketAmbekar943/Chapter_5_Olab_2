import React, { useState } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Lightbulb,
  CheckCircle2,
  XCircle,
  AlertCircle,
} from 'lucide-react';
import { useLab } from '../../context/LabContext';
import { QUIZ_QUESTIONS } from '../../data/quizData';

const Page7McqAll = () => {
  const { prevPage, nextPage, quizState, submitAnswer, scoreData } = useLab();

  const [activeId, setActiveId] = useState(QUIZ_QUESTIONS[0].id);

  const currentQuestion = QUIZ_QUESTIONS.find(q => q.id === activeId) || QUIZ_QUESTIONS[0];
  const qState = quizState[currentQuestion.id] || {
    selectedIndex: null,
    attempts: 0,
    revealed: false,
    isCorrect: false,
  };

  const currentIdx = QUIZ_QUESTIONS.findIndex(q => q.id === activeId);

  const handleSelectOption = (index) => {
    if (qState.isCorrect || qState.revealed) return;
    submitAnswer(currentQuestion.id, index);
  };

  const goToQuestion = (id) => setActiveId(id);
  const goPrev = () => {
    if (currentIdx > 0) setActiveId(QUIZ_QUESTIONS[currentIdx - 1].id);
  };
  const goNext = () => {
    if (currentIdx < QUIZ_QUESTIONS.length - 1) setActiveId(QUIZ_QUESTIONS[currentIdx + 1].id);
  };

  const answeredCount = QUIZ_QUESTIONS.filter(q => {
    const s = quizState[q.id];
    return s?.isCorrect || s?.revealed || s?.selectedIndex !== null;
  }).length;

  return (
    <div className="w-full max-w-3xl mx-auto px-4 py-6 sm:py-10 space-y-6 animate-in fade-in duration-300">

      {/* Header row */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-[#14213D] tracking-tight">
            MCQ Assessment
          </h1>
          <p className="text-xs text-[#5B6B7A] mt-0.5">
            {answeredCount} / {QUIZ_QUESTIONS.length} answered &nbsp;•&nbsp; Score so far: {scoreData.score} / {scoreData.maxScore}
          </p>
        </div>
        <span className="px-3 py-1.5 rounded-full bg-[#EAF4FF] border border-[#064A8C]/20 text-[#064A8C] text-xs font-bold font-mono">
          Q{currentQuestion.questionNumber} of {QUIZ_QUESTIONS.length}
        </span>
      </div>

      {/* Question dot navigator */}
      <div className="flex flex-wrap gap-2">
        {QUIZ_QUESTIONS.map((q) => {
          const s = quizState[q.id];
          const isActive = q.id === activeId;
          const isCorrect = s?.isCorrect;
          const isRevealed = s?.revealed;
          const isAttempted = s?.selectedIndex !== null;

          return (
            <button
              key={q.id}
              onClick={() => goToQuestion(q.id)}
              className={`w-8 h-8 rounded-full text-xs font-bold transition-all flex items-center justify-center border-2 ${
                isActive
                  ? 'bg-[#064A8C] text-white border-[#064A8C] shadow-md scale-110'
                  : isCorrect
                  ? 'bg-emerald-500 text-white border-emerald-500'
                  : isRevealed
                  ? 'bg-rose-400 text-white border-rose-400'
                  : isAttempted
                  ? 'bg-amber-400 text-white border-amber-400'
                  : 'bg-white text-slate-500 border-slate-300 hover:border-blue-400 hover:text-[#064A8C]'
              }`}
              title={`Question ${q.questionNumber}`}
            >
              {q.questionNumber}
            </button>
          );
        })}
      </div>

      {/* Main question card */}
      <div className="bg-white rounded-2xl border border-[#D7E1EC] shadow-lab-card p-6 sm:p-8 space-y-5">

        {/* Question text */}
        <div className="space-y-1">
          <span className="text-[11px] font-bold text-[#064A8C] uppercase tracking-widest">
            Question {currentQuestion.questionNumber} of {QUIZ_QUESTIONS.length}
          </span>
          <p className="text-xs text-slate-400 font-mono text-right">Attempts: {qState.attempts} / 3</p>
          <h2 className="text-base sm:text-lg font-bold text-[#14213D] leading-snug pt-1">
            {currentQuestion.question}
          </h2>
        </div>

        {/* Options */}
        <div className="space-y-3">
          {currentQuestion.options.map((option, idx) => {
            const isSelected = qState.selectedIndex === idx;
            const isCorrectOption = idx === currentQuestion.correctIndex;
            const showCorrect = (qState.isCorrect && isSelected) || (qState.revealed && isCorrectOption);
            const showWrong = !qState.isCorrect && isSelected && qState.attempts > 0;

            let style = 'border-[#D7E1EC] bg-white hover:border-blue-300 hover:bg-blue-50/40 text-[#14213D]';
            if (showCorrect) style = 'border-emerald-500 bg-emerald-50 text-emerald-900 ring-2 ring-emerald-200';
            else if (showWrong) style = 'border-rose-400 bg-rose-50 text-rose-900 ring-2 ring-rose-200';
            else if (isSelected) style = 'border-[#064A8C] bg-blue-50 text-[#064A8C] ring-2 ring-blue-100';

            return (
              <button
                key={idx}
                onClick={() => handleSelectOption(idx)}
                disabled={qState.isCorrect || qState.revealed}
                className={`w-full p-4 rounded-xl border text-left text-sm sm:text-base font-medium transition-all flex items-center justify-between disabled:cursor-not-allowed ${style}`}
              >
                <div className="flex items-center space-x-3">
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all ${
                    showCorrect ? 'border-emerald-600 bg-emerald-600'
                    : showWrong ? 'border-rose-600 bg-rose-600'
                    : isSelected ? 'border-[#064A8C] bg-[#064A8C]'
                    : 'border-slate-300'
                  }`}>
                    {(isSelected || showCorrect) && (
                      <div className="w-2 h-2 rounded-full bg-white" />
                    )}
                  </div>
                  <span>{option}</span>
                </div>
                {showCorrect && <CheckCircle2 size={18} className="text-emerald-600 shrink-0" />}
                {showWrong && <XCircle size={18} className="text-rose-600 shrink-0" />}
              </button>
            );
          })}
        </div>

        {/* Feedback / hint banners */}
        {qState.isCorrect && (
          <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs sm:text-sm flex items-start space-x-3 animate-in fade-in">
            <CheckCircle2 size={18} className="text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold block mb-0.5">Correct! (+1 Point)</span>
              <p>{currentQuestion.hints[2]}</p>
            </div>
          </div>
        )}

        {!qState.isCorrect && qState.attempts === 1 && (
          <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs sm:text-sm flex items-start space-x-3 animate-in fade-in">
            <Lightbulb size={18} className="text-amber-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold block mb-0.5">Hint 1/3</span>
              <p>{currentQuestion.hints[0]}</p>
            </div>
          </div>
        )}

        {!qState.isCorrect && qState.attempts === 2 && (
          <div className="p-4 rounded-xl bg-orange-50 border border-orange-200 text-orange-900 text-xs sm:text-sm flex items-start space-x-3 animate-in fade-in">
            <Lightbulb size={18} className="text-orange-500 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold block mb-0.5">Hint 2/3</span>
              <p>{currentQuestion.hints[1]}</p>
            </div>
          </div>
        )}

        {!qState.isCorrect && qState.attempts >= 3 && (
          <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-900 text-xs sm:text-sm flex items-start space-x-3 animate-in fade-in">
            <AlertCircle size={18} className="text-rose-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold block mb-0.5">Answer Revealed (0 Points)</span>
              <p>{currentQuestion.hints[2]}</p>
            </div>
          </div>
        )}
      </div>

      {/* Unified question and section navigation */}
      <div className="flex items-center justify-between pt-2">
        <button
          onClick={() => {
            if (currentIdx === 0) {
              prevPage();
            } else {
              goPrev();
            }
          }}
          className="inline-flex items-center space-x-2 px-6 py-2.5 rounded-xl border border-[#D7E1EC] bg-white text-[#5B6B7A] hover:text-[#14213D] font-bold text-sm transition-all shadow-xs cursor-pointer active:scale-95"
        >
          <ChevronLeft size={16} />
          <span>Back</span>
        </button>

        <button
          onClick={() => {
            if (currentIdx === QUIZ_QUESTIONS.length - 1) {
              nextPage();
            } else {
              goNext();
            }
          }}
          className="inline-flex items-center space-x-2 px-7 py-2.5 rounded-xl bg-[#064A8C] hover:bg-[#085aa8] text-white font-bold text-sm shadow-lab-button transition-all active:scale-95 cursor-pointer"
        >
          <span>{currentIdx === QUIZ_QUESTIONS.length - 1 ? 'View Results' : 'Next'}</span>
          <ChevronRight size={16} />
        </button>
      </div>

    </div>
  );
};

export default Page7McqAll;
