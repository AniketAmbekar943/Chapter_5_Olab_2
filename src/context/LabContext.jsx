import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { QUIZ_QUESTIONS } from '../data/quizData';

const LabContext = createContext(null);

/* global __SERVER_SESSION_ID__ */
const CURRENT_SERVER_ID = typeof __SERVER_SESSION_ID__ !== 'undefined' ? __SERVER_SESSION_ID__ : 'dev_session';
const SESSION_PROGRESS_KEY = 'olab2_session_progress';
const SESSION_SERVER_ID_KEY = 'olab2_server_session_id';

// Clear legacy persistent localStorage so stale testing never bleeds
try {
  localStorage.removeItem('olab2_genes_progress_v1');
  localStorage.removeItem('olab2_genes_preferences_v1');
  localStorage.removeItem('olab2_genes_progress_v2');
  localStorage.removeItem('olab2_genes_preferences_v2');
} catch (_) {}

// Read session progress: preserves state on tab refresh, but resets on new tab or server restart
const getSessionProgress = () => {
  try {
    const savedServerId = sessionStorage.getItem(SESSION_SERVER_ID_KEY);
    // If npm run dev was stopped and restarted, reset progress completely
    if (savedServerId && savedServerId !== CURRENT_SERVER_ID) {
      sessionStorage.clear();
      sessionStorage.setItem(SESSION_SERVER_ID_KEY, CURRENT_SERVER_ID);
      return null;
    }
    sessionStorage.setItem(SESSION_SERVER_ID_KEY, CURRENT_SERVER_ID);

    const saved = sessionStorage.getItem(SESSION_PROGRESS_KEY);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (_) {}
  return null;
};

export const PAGE_CONFIG = [
  { page: 1, title: 'Introduction',         path: 'introduction',       breadcrumb: 'Unit 5 • Genes, Gene Expression & Mutations' },
  { page: 2, title: 'Theory',               path: 'theory',             breadcrumb: 'Theory' },
  { page: 3, title: 'Simulation Demo',      path: 'simulation-demo',    breadcrumb: 'Simulation Demo' },
  { page: 4, title: 'Concept Exploration',  path: 'concept-exploration', breadcrumb: 'Concept Exploration' },
  { page: 5, title: 'Simulation 1',         path: 'simulation-1',       breadcrumb: 'Simulation 1' },
  { page: 6, title: 'Simulation 2',         path: 'simulation-2',       breadcrumb: 'Simulation 2' },
  { page: 7, title: 'MCQ Assessment',       path: 'assessment',         breadcrumb: 'MCQ Assessment' },
  { page: 8, title: 'Completion',           path: 'completion',         breadcrumb: 'Completion' },
];

export const LabProvider = ({ children }) => {
  const initialData = getSessionProgress();

  // Page Navigation State
  const [currentPage, setCurrentPage] = useState(() => {
    if (initialData && typeof initialData.currentPage === 'number' && initialData.currentPage >= 1 && initialData.currentPage <= PAGE_CONFIG.length) {
      const maxP = typeof initialData.maxUnlockedPage === 'number' ? initialData.maxUnlockedPage : 1;
      return Math.min(initialData.currentPage, maxP);
    }
    return 1;
  });

  // Simulation 1 State
  const [sim1State, setSim1State] = useState(() => {
    if (initialData && initialData.sim1State) return initialData.sim1State;
    return {
      completed: false,
      currentStep: 1,
      transcribedBases: [],
      mistakes: 0,
    };
  });

  // Simulation 2 State
  const [sim2State, setSim2State] = useState(() => {
    if (initialData && initialData.sim2State) return initialData.sim2State;
    return {
      completed: false,
      mutationType: 'substitution',
      selectedPosition: 4,
      newBase: 'A',
      isApplied: false,
      analysisResult: null,
    };
  });

  // Quiz State
  const [quizState, setQuizState] = useState(() => {
    if (initialData && initialData.quizState) return initialData.quizState;
    const initial = {};
    QUIZ_QUESTIONS.forEach(q => {
      initial[q.id] = {
        selectedIndex: null,
        attempts: 0,
        revealed: false,
        isCorrect: false,
      };
    });
    return initial;
  });

  // Tutorial / First-Time Guide State
  const [showTutorial, setShowTutorial] = useState(false);
  const [dontShowAgain, setDontShowAgain] = useState(false);

  // Progressive Module Unlocking State
  const [hasCompletedLab, setHasCompletedLab] = useState(() => {
    return Boolean(initialData && initialData.hasCompletedLab);
  });

  const [maxUnlockedPage, setMaxUnlockedPage] = useState(() => {
    if (initialData && typeof initialData.maxUnlockedPage === 'number' && initialData.maxUnlockedPage >= 1) {
      return Math.min(initialData.maxUnlockedPage, PAGE_CONFIG.length);
    }
    return 1;
  });

  // Save Progress to SessionStorage
  useEffect(() => {
    try {
      const dataToSave = {
        currentPage,
        maxUnlockedPage,
        hasCompletedLab,
        sim1State,
        sim2State,
        quizState,
      };
      sessionStorage.setItem(SESSION_PROGRESS_KEY, JSON.stringify(dataToSave));
      sessionStorage.setItem(SESSION_SERVER_ID_KEY, CURRENT_SERVER_ID);
    } catch (err) {
      console.warn('SessionStorage error while saving OLAB 2 progress:', err);
    }
  }, [currentPage, maxUnlockedPage, hasCompletedLab, sim1State, sim2State, quizState]);

  // Save Preferences to SessionStorage
  const updateDontShowAgain = useCallback((value) => {
    setDontShowAgain(value);
    try {
      sessionStorage.setItem('olab2_dont_show_tutorial', JSON.stringify(value));
    } catch (err) {
      console.warn('Error saving tutorial preferences:', err);
    }
  }, []);

  const markLabCompletedInStorage = useCallback(() => {
    setHasCompletedLab(true);
    setMaxUnlockedPage(PAGE_CONFIG.length);
    try {
      const current = JSON.parse(sessionStorage.getItem(SESSION_PROGRESS_KEY) || '{}');
      current.hasCompletedLab = true;
      current.maxUnlockedPage = PAGE_CONFIG.length;
      sessionStorage.setItem(SESSION_PROGRESS_KEY, JSON.stringify(current));
    } catch (err) {
      console.warn('SessionStorage error while saving lab completion state:', err);
    }
  }, []);

  // Calculate Quiz Score out of 10
  const scoreData = useMemo(() => {
    let score = 0;
    let answeredCount = 0;
    QUIZ_QUESTIONS.forEach(q => {
      const state = quizState[q.id];
      if (state && (state.isCorrect || state.revealed || state.selectedIndex !== null)) {
        answeredCount++;
      }
      // Points policy: Only earns 1 pt if answered correctly without having answer revealed after 3 wrong tries
      if (state && state.isCorrect && !state.revealed) {
        score += 1;
      }
    });

    const percentage = Math.round((score / QUIZ_QUESTIONS.length) * 100);
    const isAllAnswered = answeredCount === QUIZ_QUESTIONS.length;
    return { score, maxScore: QUIZ_QUESTIONS.length, percentage, answeredCount, isAllAnswered };
  }, [quizState]);

  // Answer Submission with 3-Attempt Hint Policy
  const submitAnswer = useCallback((questionId, optionIndex) => {
    const question = QUIZ_QUESTIONS.find(q => q.id === questionId);
    if (!question) return;

    setQuizState(prev => {
      const current = prev[questionId] || { selectedIndex: null, attempts: 0, revealed: false, isCorrect: false };
      
      // If already correct or already revealed, ignore changes
      if (current.isCorrect || current.revealed) return prev;

      const isCorrect = optionIndex === question.correctIndex;
      const nextAttempts = current.attempts + 1;
      const revealed = !isCorrect && nextAttempts >= 3;

      return {
        ...prev,
        [questionId]: {
          selectedIndex: optionIndex,
          attempts: nextAttempts,
          revealed,
          isCorrect,
        },
      };
    });
  }, []);

  // Check if a specific page is unlocked
  const isPageUnlocked = useCallback((pageNum) => {
    return pageNum <= maxUnlockedPage;
  }, [maxUnlockedPage]);

  // Navigation helpers with progressive gating
  const goToPage = useCallback((pageNum) => {
    if (pageNum >= 1 && pageNum <= PAGE_CONFIG.length) {
      if (pageNum > maxUnlockedPage) {
        return false;
      }
      setCurrentPage(pageNum);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return true;
    }
    return false;
  }, [maxUnlockedPage]);

  const nextPage = useCallback(() => {
    setCurrentPage(prev => {
      const next = Math.min(prev + 1, PAGE_CONFIG.length);
      setMaxUnlockedPage(currMax => Math.max(currMax, next));
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return next;
    });
  }, []);

  const prevPage = useCallback(() => {
    setCurrentPage(prev => {
      const prevP = Math.max(prev - 1, 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return prevP;
    });
  }, []);

  // Full Reset (retaining tutorial preferences, but resetting score and activities cleanly)
  const resetLab = useCallback(() => {
    const freshQuiz = {};
    QUIZ_QUESTIONS.forEach(q => {
      freshQuiz[q.id] = { selectedIndex: null, attempts: 0, revealed: false, isCorrect: false };
    });

    setQuizState(freshQuiz);
    setSim1State({
      completed: false,
      currentStep: 1,
      transcribedBases: [],
      mistakes: 0,
    });
    setSim2State({
      completed: false,
      mutationType: 'substitution',
      selectedPosition: 4,
      newBase: 'A',
      isApplied: false,
      analysisResult: null,
    });
    setCurrentPage(1);
    setMaxUnlockedPage(1);
    setHasCompletedLab(false);

    try {
      sessionStorage.removeItem(SESSION_PROGRESS_KEY);
    } catch (err) {
      console.warn('SessionStorage reset error:', err);
    }
  }, []);

  // Reattempt Quiz Only
  const reattemptQuiz = useCallback(() => {
    const freshQuiz = {};
    QUIZ_QUESTIONS.forEach(q => {
      freshQuiz[q.id] = { selectedIndex: null, attempts: 0, revealed: false, isCorrect: false };
    });
    setQuizState(freshQuiz);
    setCurrentPage(7);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const value = {
    currentPage,
    goToPage,
    nextPage,
    prevPage,
    isPageUnlocked,
    maxUnlockedPage,
    hasCompletedLab,
    PAGE_CONFIG,
    currentPageMeta: PAGE_CONFIG[currentPage - 1],
    // Sim 1
    sim1State,
    setSim1State,
    // Sim 2
    sim2State,
    setSim2State,
    // Quiz
    quizState,
    submitAnswer,
    scoreData,
    reattemptQuiz,
    // Tutorial
    showTutorial,
    setShowTutorial,
    dontShowAgain,
    updateDontShowAgain,
    markLabCompletedInStorage,
    resetLab,
  };

  return <LabContext.Provider value={value}>{children}</LabContext.Provider>;
};

export const useLab = () => {
  const context = useContext(LabContext);
  if (!context) {
    throw new Error('useLab must be used within a LabProvider');
  }
  return context;
};
