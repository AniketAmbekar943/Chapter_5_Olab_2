import React, { useEffect } from 'react';
import { 
  Trophy, 
  CheckCircle2, 
  RotateCcw, 
  ArrowRight, 
  ChevronLeft, 
  AlertTriangle, 
  Sparkles, 
  Dna,
  BookOpen
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useLab } from '../../context/LabContext';
import { QUIZ_QUESTIONS } from '../../data/quizData';

// Pedagogical concepts mastered in OLAB 2
const CONCEPTS = [
  'Central Dogma: Genetic information flows from DNA → mRNA → Protein',
  'Transcription: Complementary base pairing by RNA Polymerase (A-U, C-G)',
  'Translation: Triplet codons read by ribosomes to assemble polypeptides',
  'Point Mutations: Substitution (silent, missense, and nonsense consequences)',
  'Frameshift Mutations: Additions & deletions disrupting the downstream code',
];

// Grade threshold rules:
// <= 30%: Grade D (Reattempt required)
// 31% - 59%: Grade C (Passed - Fair)
// 60% - 79%: Grade B (Passed - Good)
// 80% - 100%: Grade A (Passed - Excellent)
const getGradeData = (percentage) => {
  if (percentage >= 80) {
    return {
      grade: 'A',
      status: 'PASSED (EXCELLENT)',
      color: '#10B981', // emerald
      badgeBg: 'rgba(16, 185, 129, 0.12)',
      borderCol: 'rgba(16, 185, 129, 0.35)',
      feedback: 'Outstanding mastery of gene expression, transcription mechanics, and mutation effects!',
      isPass: true,
    };
  }
  if (percentage >= 60) {
    return {
      grade: 'B',
      status: 'PASSED (GOOD)',
      color: '#0284C7', // sky / ocean
      badgeBg: 'rgba(2, 132, 199, 0.12)',
      borderCol: 'rgba(2, 132, 199, 0.35)',
      feedback: 'Good work! You demonstrated strong competency in mRNA synthesis and mutation consequences.',
      isPass: true,
    };
  }
  if (percentage > 30) {
    return {
      grade: 'C',
      status: 'PASSED (FAIR)',
      color: '#D97706', // amber
      badgeBg: 'rgba(217, 119, 6, 0.12)',
      borderCol: 'rgba(217, 119, 6, 0.35)',
      feedback: 'Passed! You understand the foundations of the central dogma. Review codon reading frames to boost your score.',
      isPass: true,
    };
  }
  // <= 30%
  return {
    grade: 'D',
    status: 'REATTEMPT REQUIRED',
    color: '#EF4444', // rose / red
    badgeBg: 'rgba(239, 68, 68, 0.12)',
    borderCol: 'rgba(239, 68, 68, 0.35)',
    feedback: 'Your score is 30% or below. Review the transcription and mutation concepts, then reattempt the quiz section.',
    isPass: false,
  };
};

const Page8Completion = () => {
  const { prevPage, resetLab, reattemptQuiz, scoreData, markLabCompletedInStorage } = useLab();
  const { score, maxScore, percentage } = scoreData;

  const gradeInfo = getGradeData(percentage);
  const isD = !gradeInfo.isPass;

  // Trigger celebration only if passed
  useEffect(() => {
    if (!isD) {
      markLabCompletedInStorage();
      try {
        confetti({
          particleCount: 75,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#064A8C', '#10B981', '#38BDF8', '#F59E0B'],
        });
      } catch (e) {
        // Ignore confetti if not supported
      }
    }
  }, [isD, markLabCompletedInStorage]);

  // Circular gauge calculations
  const radius = 38;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-6 sm:py-10 space-y-6 animate-in fade-in duration-300">

      {/* Top Banner with Trophy styling referencing OLAB 1 */}
      <div 
        className="relative rounded-2xl overflow-hidden p-6 sm:p-8"
        style={{
          background: 'linear-gradient(135deg, rgba(6,74,140,0.08) 0%, #ffffff 60%)',
          border: '1px solid #D7E1EC',
          boxShadow: '0 4px 24px rgba(6,74,140,0.08)',
        }}
      >
        <div 
          className="absolute top-0 left-0 right-0 h-1"
          style={{ background: `linear-gradient(90deg, transparent, ${gradeInfo.color}, transparent)` }} 
        />
        
        <div className="flex flex-col sm:flex-row items-center gap-6 text-center sm:text-left">
          <div 
            className="w-20 h-20 rounded-2xl flex items-center justify-center shrink-0 shadow-md"
            style={{ 
              background: isD ? 'rgba(239,68,68,0.10)' : 'rgba(245,158,11,0.12)', 
              border: isD ? '2px solid rgba(239,68,68,0.4)' : '2px solid rgba(245,158,11,0.4)', 
              boxShadow: isD ? '0 4px 16px rgba(239,68,68,0.15)' : '0 4px 16px rgba(245,158,11,0.15)' 
            }}
          >
            {isD ? (
              <AlertTriangle size={38} className="text-rose-500" />
            ) : (
              <Trophy size={40} className="text-amber-500 animate-pulse" />
            )}
          </div>

          <div className="space-y-1">
            <div className="text-[11px] font-black tracking-[0.2em] uppercase text-[#5B6B7A]">
              OLAB 2 Assessment Summary
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-[#14213D] tracking-tight">
              Genes, Gene Expression & Mutations
            </h1>
            <p className="text-xs sm:text-sm font-bold tracking-wider" style={{ color: gradeInfo.color }}>
              {isD ? 'MODULE EVALUATION • REATTEMPT REQUIRED' : 'MODULE 2 OF CHAPTER 5 • COMPLETED'}
            </p>
          </div>
        </div>
      </div>

      {/* Main Score + Concepts Two-Column Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 items-stretch">

        {/* Score Card */}
        <div 
          className="rounded-2xl p-6 sm:p-8 flex flex-col items-center justify-center text-center bg-white"
          style={{
            border: `2px solid ${gradeInfo.borderCol}`,
            boxShadow: `0 4px 24px ${gradeInfo.badgeBg}`,
          }}
        >
          <div className="text-[10px] font-black tracking-[0.25em] uppercase text-[#5B6B7A] mb-2">
            Assessment Score
          </div>

          {/* Large percentage gauge and numerical score */}
          <div className="flex items-center justify-center gap-4 my-2">
            <div className="text-6xl sm:text-7xl font-black font-mono tracking-tight" style={{ color: gradeInfo.color }}>
              {score}
            </div>
            <div className="text-left font-mono">
              <span className="text-2xl font-bold text-slate-400 block">/ {maxScore}</span>
              <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-600">
                {percentage}%
              </span>
            </div>
          </div>

          {/* Grade & Status Badges */}
          <div className="flex flex-wrap items-center justify-center gap-2.5 my-3">
            <div 
              className="px-3.5 py-1.5 rounded-lg text-xs font-black tracking-wide"
              style={{ background: gradeInfo.badgeBg, color: gradeInfo.color }}
            >
              Grade: {gradeInfo.grade}
            </div>
            <div 
              className="px-3.5 py-1.5 rounded-lg text-xs font-black tracking-wide"
              style={{ background: gradeInfo.badgeBg, color: gradeInfo.color }}
            >
              {gradeInfo.status}
            </div>
          </div>

          {/* Qualitative pedagogical feedback */}
          <p className="text-xs sm:text-sm text-[#5B6B7A] max-w-sm mt-1 leading-relaxed">
            {gradeInfo.feedback}
          </p>

          {/* Grade D Reattempt Requirement Alert */}
          {isD && (
            <div 
              className="mt-5 w-full flex items-start gap-2.5 text-xs font-bold p-3.5 rounded-xl text-left"
              style={{ 
                background: 'rgba(239,68,68,0.08)', 
                color: '#DC2626', 
                border: '1px solid rgba(239,68,68,0.25)' 
              }}
            >
              <AlertTriangle size={16} className="shrink-0 mt-0.5 text-red-600" />
              <div>
                <span>Score is below the 31% passing mark. </span>
                <span className="block mt-0.5 font-normal text-rose-800">
                  You must reattempt the quiz section to achieve a passing grade and finalize this module.
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Concepts Covered Card */}
        <div className="rounded-2xl p-6 sm:p-7 bg-white border border-[#D7E1EC] shadow-sm flex flex-col justify-between">
          <div>
            <div className="text-[10px] font-black tracking-[0.25em] uppercase text-[#5B6B7A] mb-4 flex items-center justify-between">
              <span>Concepts Covered</span>
              <span className="text-emerald-700 font-bold font-mono">5 Core Areas</span>
            </div>

            <ul className="space-y-3">
              {CONCEPTS.map((concept, idx) => (
                <li key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-700 leading-snug">
                  <CheckCircle2 size={16} className="mt-0.5 text-emerald-600 shrink-0 stroke-[2.5]" />
                  <span>{concept}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Metrics summary bar */}
          <div className="mt-6 pt-4 border-t border-slate-100 grid grid-cols-3 gap-2 text-center">
            <div className="p-2 rounded-lg bg-slate-50 border border-slate-100">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Total</span>
              <span className="text-sm font-black text-slate-700 font-mono">10 Questions</span>
            </div>
            <div className="p-2 rounded-lg bg-emerald-50 border border-emerald-100">
              <span className="text-[10px] uppercase font-bold text-emerald-600 block">Correct</span>
              <span className="text-sm font-black text-emerald-800 font-mono">{score}</span>
            </div>
            <div className="p-2 rounded-lg bg-blue-50 border border-blue-100">
              <span className="text-[10px] uppercase font-bold text-blue-600 block">Pass Mark</span>
              <span className="text-sm font-black text-blue-800 font-mono">&gt; 30%</span>
            </div>
          </div>
        </div>

      </div>

      {/* Action CTA Row matching OLAB 1 */}
      <div 
        className="rounded-2xl p-5 sm:p-6 flex flex-col sm:flex-row items-center justify-between gap-4"
        style={{ 
          background: 'linear-gradient(135deg, rgba(6,74,140,0.06), rgba(11,95,165,0.04))', 
          border: '1px solid #D7E1EC' 
        }}
      >
        <div>
          <div className="font-black text-sm sm:text-base text-[#14213D] mb-0.5">
            {isD ? 'Reattempt Required to Proceed' : 'Module Completed Successfully'}
          </div>
          <p className="text-xs text-[#5B6B7A]">
            {isD 
              ? 'Your score is 30% or below (Grade D). Reattempt the quiz to improve your grade.' 
              : 'You have mastered transcription, translation, and genetic mutation analysis.'}
          </p>
        </div>

        <div className="flex gap-2.5 flex-wrap justify-center sm:justify-end w-full sm:w-auto">
          {/* If Grade D: show prominent Reattempt Quiz Section button */}
          {isD ? (
            <>
              <button
                onClick={prevPage}
                className="px-4 py-2.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <ChevronLeft size={14} />
                <span>Review Questions</span>
              </button>

              <button
                onClick={reattemptQuiz}
                className="px-6 py-2.5 rounded-xl bg-[#DC2626] hover:bg-[#b91c1c] text-white font-bold text-xs shadow-md transition-all active:scale-95 flex items-center gap-2 cursor-pointer"
              >
                <RotateCcw size={14} />
                <span>Reattempt Quiz Section</span>
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => {
                  if (window.confirm('Reset quiz answers to try for a higher score?')) {
                    reattemptQuiz();
                  }
                }}
                className="px-4 py-2.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <RotateCcw size={14} />
                <span>Retake Quiz</span>
              </button>

              <button
                onClick={() => {
                  if (window.confirm('Reset all simulations and activities from Section 1?')) {
                    resetLab();
                  }
                }}
                className="px-4 py-2.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <span>Restart Lab</span>
              </button>

              <button
                onClick={() => {
                  alert('OLAB 3: Population Genetics & Natural Selection will open in the next scheduled module.');
                }}
                className="px-6 py-2.5 rounded-xl bg-[#064A8C] hover:bg-[#085aa8] text-white font-bold text-xs shadow-lab-button transition-all active:scale-95 flex items-center gap-2 cursor-pointer"
              >
                <span>Next Module</span>
                <ArrowRight size={14} />
              </button>
            </>
          )}
        </div>
      </div>

    </div>
  );
};

export default Page8Completion;
