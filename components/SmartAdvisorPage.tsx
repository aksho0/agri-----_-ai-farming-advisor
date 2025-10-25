import React, { useState, useMemo, useRef } from 'react';
import { Theme, Season } from '../hooks/useSeason';
import { useTranslation } from '../hooks/useTranslation';
import { getPestDiagnosisAdviceStream, getFertilizerAdviceStream, getCropSelectionAdviceStream } from '../services/geminiService';
import { cropAdvisorDataset } from '../services/cropAdvisorDataset';
import { pestAdvisorDataset } from '../services/pestAdvisorDataset';
import { fertilizerAdvisorDataset } from '../services/fertilizerAdvisorDataset';
import ReactMarkdown from 'react-markdown';
import { BackIcon, SproutIcon, CropsIcon, BugIcon, FertilizerIcon } from './Icons';
import FeatureCard from './FeatureCard';
import { Language } from '../types';

interface SmartAdvisorPageProps {
  seasonTheme: Theme;
  season: Season;
  onNavigateHome: () => void;
}

type QuizKey = 'crop' | 'pest' | 'fertilizer';

// Fix: Define a Quiz interface with an optional getAdviceStream to handle different quiz types.
interface Quiz {
  title: string;
  preview: string;
  icon: JSX.Element;
  questions: { question: string; options: string[]; }[];
  getAdviceLocal: (answers: { [key: number]: string }) => string;
  getAdviceStream?: (
    answers: { [key: number]: string },
    language: Language,
    onChunk: (chunk: string) => void
  ) => Promise<void>;
}

// Helper to format answers into a key for the crop dataset
const formatCropAnswersToKey = (answers: { [key: number]: string }): string => {
    const seasonMap: { [key: string]: string } = { 'Monsoon (Kharif)': 'Monsoon', 'Winter (Rabi)': 'Winter', 'Summer': 'Summer' };
    const soilMap: { [key: string]: string } = { 'Clay (Heavy, holds moisture)': 'Clay', 'Sandy (Light, drains quickly)': 'Sandy', 'Loamy (Balanced mix)': 'Loamy' };
    const irrigationMap: { [key: string]: string } = { 'Yes': 'Yes', 'No': 'No' };
    const sizeMap: { [key: string]: string } = { '<2 acres': '<2', '2–5 acres': '2-5', '>5 acres': '>5' };
    return `${seasonMap[answers[0]]}_${soilMap[answers[1]]}_${irrigationMap[answers[2]]}_${sizeMap[answers[3]]}`;
};

// Helper to format answers into a key for the pest dataset
const formatPestAnswersToKey = (answers: { [key: number]: string }): string => {
    const cropMap: { [key: string]: string } = { 'Paddy (Rice)': 'Paddy', 'Wheat': 'Wheat', 'Tomato / Brinjal': 'Tomato', 'Cotton': 'Cotton' };
    const symptomMap: { [key: string]: string } = { 'Spots or discoloration on leaves': 'Spots', 'Holes in leaves or fruits': 'Holes', 'Wilting or stunted growth': 'Wilting', 'Visible insects or webs': 'Insects' };
    const timeMap: { [key: string]: string } = { 'Just now (1-2 days)': '<1week', 'Within the last week': '1-2weeks', 'More than a week ago': '>2weeks' };
    return `${cropMap[answers[0]]}_${symptomMap[answers[1]]}_${timeMap[answers[2]]}`;
};

// Helper to format answers into a key for the fertilizer dataset
const formatFertilizerAnswersToKey = (answers: { [key: number]: string }): string => {
    const cropMap: { [key: string]: string } = { 'Maize (Corn)': 'Maize', 'Sugarcane': 'Sugarcane', 'Soybean': 'Soybean', 'Groundnut': 'Groundnut' };
    const stageMap: { [key: string]: string } = { 'Sowing / Germination': 'Sowing', 'Vegetative Growth (Leafy stage)': 'Vegetative', 'Flowering / Fruiting': 'Flowering', 'Maturity / Pre-harvest': 'Harvest' };
    const appliedMap: { [key: string]: string } = { 'At the time of sowing (Basal dose)': 'Yes', 'More than a month ago': 'No' };
    return `${cropMap[answers[0]]}_${stageMap[answers[1]]}_${appliedMap[answers[2]]}`;
};

const SmartAdvisorPage: React.FC<SmartAdvisorPageProps> = ({ seasonTheme, season, onNavigateHome }) => {
  const { t, language } = useTranslation();

  const quizzes = useMemo((): Record<QuizKey, Quiz> => ({
    crop: {
      title: t('crop_selection_quiz_title'),
      preview: t('crop_selection_quiz_preview'),
      icon: <CropsIcon />,
      questions: [
        { question: t('quiz_crop_q1_title'), options: [t('quiz_crop_q1_op1'), t('quiz_crop_q1_op2'), t('quiz_crop_q1_op3')] },
        { question: t('quiz_crop_q2_title'), options: [t('quiz_crop_q2_op1'), t('quiz_crop_q2_op2'), t('quiz_crop_q2_op3')] },
        { question: t('quiz_crop_q3_title'), options: [t('quiz_crop_q3_op1'), t('quiz_crop_q3_op2')] },
        { question: t('quiz_crop_q4_title'), options: [t('quiz_crop_q4_op1'), t('quiz_crop_q4_op2'), t('quiz_crop_q4_op3')] },
      ],
      getAdviceStream: getCropSelectionAdviceStream,
      getAdviceLocal: (answers: { [key: number]: string }): string => {
        const key = formatCropAnswersToKey(answers);
        return cropAdvisorDataset[key] || "No recommendation found for the selected combination. Please consult a local expert.";
      },
    },
    pest: {
      title: t('pest_diagnosis_quiz_title'),
      preview: t('pest_diagnosis_quiz_preview'),
      icon: <BugIcon />,
      questions: [
        { question: t('quiz_pest_q1_title'), options: [t('quiz_pest_q1_op1'), t('quiz_pest_q1_op2'), t('quiz_pest_q1_op3'), t('quiz_pest_q1_op4')] },
        { question: t('quiz_pest_q2_title'), options: [t('quiz_pest_q2_op1'), t('quiz_pest_q2_op2'), t('quiz_pest_q2_op3'), t('quiz_pest_q2_op4')] },
        { question: t('quiz_pest_q3_title'), options: [t('quiz_pest_q3_op1'), t('quiz_pest_q3_op2'), t('quiz_pest_q3_op3')] },
      ],
      getAdviceStream: getPestDiagnosisAdviceStream,
      getAdviceLocal: (answers: { [key: number]: string }): string => {
        const key = formatPestAnswersToKey(answers);
        return pestAdvisorDataset[key] || "Could not determine the issue from the selected options. Please try describing it to the AI chat advisor.";
      },
    },
    fertilizer: {
      title: t('fertilizer_quiz_title'),
      preview: t('fertilizer_quiz_preview'),
      icon: <FertilizerIcon />,
      questions: [
        { question: t('quiz_fert_q1_title'), options: [t('quiz_fert_q1_op1'), t('quiz_fert_q1_op2'), t('quiz_fert_q1_op3'), t('quiz_fert_q1_op4')] },
        { question: t('quiz_fert_q2_title'), options: [t('quiz_fert_q2_op1'), t('quiz_fert_q2_op2'), t('quiz_fert_q2_op3'), t('quiz_fert_q2_op4')] },
        { question: t('quiz_fert_q3_title'), options: [t('quiz_fert_q3_op1'), t('quiz_fert_q3_op2')] },
      ],
      getAdviceStream: getFertilizerAdviceStream,
      getAdviceLocal: (answers: { [key: number]: string }): string => {
          const key = formatFertilizerAnswersToKey(answers);
          return fertilizerAdvisorDataset[key] || "Could not determine the recommendation from the selected options. Please try describing your needs to the AI chat advisor.";
      }
    },
  }), [t, language]);

  const [activeQuizKey, setActiveQuizKey] = useState<QuizKey | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<{ [key: number]: string }>({});
  const [isQuizFinished, setIsQuizFinished] = useState(false);
  const [advice, setAdvice] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isFallback, setIsFallback] = useState(false);

  const fallbackTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const adviceRef = useRef('');

  const activeQuiz = activeQuizKey ? quizzes[activeQuizKey] : null;

  const resetQuizState = () => {
    setCurrentQuestionIndex(0);
    setAnswers({});
    setIsQuizFinished(false);
    setAdvice('');
    adviceRef.current = '';
    setError(null);
    setIsLoading(false);
    setIsFallback(false);
    if (fallbackTimeoutRef.current) {
        clearTimeout(fallbackTimeoutRef.current);
    }
  };

  const handleQuizSelect = (key: QuizKey) => {
    resetQuizState();
    setActiveQuizKey(key);
  };

  const handleAnswerSelect = (option: string) => {
    setAnswers(prev => ({ ...prev, [currentQuestionIndex]: option }));
  };

  const handleNext = () => {
    if (activeQuiz && currentQuestionIndex < activeQuiz.questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      handleGetAdvice();
      setIsQuizFinished(true);
    }
  };

  const handleBack = () => {
    if (advice || error || isLoading) {
      setIsQuizFinished(true);
      setAdvice('');
      adviceRef.current = '';
      setError(null);
      setIsLoading(false);
      setIsFallback(false);
    } else if (isQuizFinished) {
      setIsQuizFinished(false);
       setCurrentQuestionIndex(activeQuiz ? activeQuiz.questions.length - 1 : 0);
    } else if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    } else {
      setActiveQuizKey(null);
      resetQuizState();
    }
  };

  const handleGetAdvice = async () => {
    if (!activeQuiz) return;
    setIsLoading(true);
    setError(null);
    setAdvice('');
    adviceRef.current = '';
    setIsFallback(false);

    try {
        fallbackTimeoutRef.current = setTimeout(() => {
            if (!adviceRef.current && activeQuiz.getAdviceLocal) { // Check if API has not responded yet
                console.log("API response too slow. Using fallback.");
                const localAdvice = activeQuiz.getAdviceLocal(answers);
                setAdvice(localAdvice);
                setIsLoading(false);
                setIsFallback(true);
            }
        }, 20000); // 20-second timeout

        const streamAdvice = activeQuiz.getAdviceStream;
        if (streamAdvice) {
            await streamAdvice(answers, language, (chunk) => {
                if (fallbackTimeoutRef.current) clearTimeout(fallbackTimeoutRef.current);
                if (isFallback) return; // Ignore chunks if fallback is already active
                
                const newAdvice = adviceRef.current + chunk;
                adviceRef.current = newAdvice;
                setAdvice(newAdvice);
            });
        }
    } catch (err: any) {
      if (fallbackTimeoutRef.current) clearTimeout(fallbackTimeoutRef.current);
      setError(err.message || 'An unknown error occurred.');
    } finally {
      if (fallbackTimeoutRef.current) clearTimeout(fallbackTimeoutRef.current);
      if (!isFallback) { // Don't turn off loading if fallback is already showing
        setIsLoading(false);
      }
    }
  };

  const renderQuizSelection = () => (
    <>
      <div className="text-center mb-8">
        <h2 className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-gray-100">{t('smart_advisor_page_title')}</h2>
        <p className={seasonTheme.textMuted}>{t('smart_advisor_page_subtitle')}</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
        {(Object.keys(quizzes) as QuizKey[]).map(key => (
          <FeatureCard
            key={key}
            icon={quizzes[key].icon}
            title={quizzes[key].title}
            preview={quizzes[key].preview}
            onClick={() => handleQuizSelect(key)}
            isHighlighted
            seasonTheme={seasonTheme}
          />
        ))}
      </div>
    </>
  );

  const renderQuizRunner = () => {
    if (!activeQuiz) return null;
    const currentQuestion = activeQuiz.questions[currentQuestionIndex];
    const isNextDisabled = answers[currentQuestionIndex] === undefined;

    return (
      <div className="w-full max-w-2xl mx-auto">
        <div className="text-center mb-6">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-gray-100">{activeQuiz.title}</h2>
        </div>
        <div className="bg-white/60 dark:bg-gray-800/60 p-6 rounded-2xl shadow-lg space-y-6">
            <div className="text-center">
                <p className={`${seasonTheme.text} font-semibold`}>
                    {t('question')} {currentQuestionIndex + 1} {t('of')} {activeQuiz.questions.length}
                </p>
                <h3 className="text-xl md:text-2xl font-bold text-gray-800 dark:text-gray-100 mt-2">
                    {currentQuestion.question}
                </h3>
            </div>
            <div className="space-y-3">
                {currentQuestion.options.map(option => (
                    <button
                        key={option}
                        onClick={() => handleAnswerSelect(option)}
                        className={`w-full text-left p-4 rounded-lg border-2 transition-all duration-200 text-gray-700 dark:text-gray-200
                            ${answers[currentQuestionIndex] === option
                                ? `${seasonTheme.primaryBg} text-white border-transparent`
                                : `bg-white/50 dark:bg-gray-700/50 border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500`
                            }`}
                    >
                        {option}
                    </button>
                ))}
            </div>
        </div>
        <div className="mt-6 flex justify-between">
            <button onClick={handleBack} className={`py-2 px-6 rounded-lg font-semibold bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-100 hover:opacity-90`}>
                {t('back')}
            </button>
            <button onClick={handleNext} disabled={isNextDisabled} className={`py-2 px-6 rounded-lg font-semibold text-white ${seasonTheme.primaryBg} hover:opacity-90 disabled:bg-gray-400`}>
                {currentQuestionIndex === activeQuiz.questions.length - 1 ? t('get_advice') : t('next')}
            </button>
        </div>
      </div>
    );
  };

  const renderSummaryAndAdvice = () => {
    if (!activeQuiz) return null;
    return (
        <div className="w-full max-w-3xl mx-auto space-y-6">
             <div className="text-center mb-6">
                <h2 className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-gray-100">{activeQuiz.title}</h2>
            </div>
            <div className="bg-white/60 dark:bg-gray-800/60 p-6 rounded-2xl shadow-lg">
                <h3 className={`text-xl font-bold mb-4 ${seasonTheme.text}`}>{t('your_answers')}</h3>
                <ul className="space-y-3">
                    {activeQuiz.questions.map((q, index) => (
                        <li key={index} className="p-3 bg-black/5 dark:bg-white/5 rounded-lg">
                            <p className="font-semibold text-gray-700 dark:text-gray-200">{q.question}</p>
                            <p className="text-gray-600 dark:text-gray-300">{answers[index]}</p>
                        </li>
                    ))}
                </ul>
            </div>
            
            {isLoading && (
                <div className="flex justify-center items-center space-x-3 p-4">
                   <SproutIcon />
                   <span className="text-lg font-medium animate-pulse text-gray-700 dark:text-gray-300">{t('generating_advice')}</span>
                </div>
            )}

            {error && <p className="text-red-500 text-center">{error}</p>}
            
            {advice && (
                 <div className="bg-white/60 dark:bg-gray-800/60 p-6 rounded-2xl shadow-lg">
                    <h3 className={`text-xl font-bold mb-3 ${seasonTheme.text}`}>{t('your_plan')}</h3>
                    {isFallback && <p className="text-sm italic text-yellow-700 dark:text-yellow-300 mb-3 bg-yellow-100 dark:bg-yellow-900/50 p-2 rounded-md">Showing a quick suggestion as the network is slow. For a more detailed analysis by the AI, please try again later.</p>}
                    <div className="prose prose-sm dark:prose-invert max-w-none">
                        <ReactMarkdown>{advice}</ReactMarkdown>
                    </div>
                </div>
            )}

            <div className="mt-6 flex justify-between items-center">
                <button onClick={handleBack} className={`py-2 px-6 rounded-lg font-semibold bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-100 hover:opacity-90`}>
                    {t('back')}
                </button>
                 <button onClick={() => { setActiveQuizKey(null); resetQuizState(); }} className={`py-2 px-6 rounded-lg font-semibold ${seasonTheme.text}`}>
                    {t('back_to_quizzes')}
                </button>
            </div>
        </div>
      );
  };
  
  return (
    <div className="pb-20 md:pb-4">
        {!activeQuizKey 
            ? renderQuizSelection() 
            : isQuizFinished 
                ? renderSummaryAndAdvice()
                : renderQuizRunner()
        }
    </div>
  );
};

export default SmartAdvisorPage;