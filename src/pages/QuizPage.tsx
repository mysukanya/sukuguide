import React, { useState } from 'react';
import {
  FlaskConical,
  CheckCircle2,
  XCircle,
  HelpCircle,
  RotateCcw,
  Play,
  ArrowRight,
  Award,
  Layers,
  Sparkles,
  Check
} from 'lucide-react';
import { useStudyData } from '../context/StudyDataContext';
import { Quiz, QuizQuestion } from '../types';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';

export const QuizPage: React.FC = () => {
  const { quizzes, subjects, recordQuizAttempt, logStudySession } = useStudyData();

  const [activeQuizId, setActiveQuizId] = useState<string | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [hasSubmittedAnswer, setHasSubmittedAnswer] = useState(false);
  const [userAnswers, setUserAnswers] = useState<Record<number, number>>({});
  const [quizFinished, setQuizFinished] = useState(false);

  const activeQuiz = quizzes.find(q => q.id === activeQuizId) || null;
  const currentQuestion: QuizQuestion | undefined = activeQuiz?.questions[currentQuestionIndex];

  const handleStartQuiz = (quizId: string) => {
    setActiveQuizId(quizId);
    setCurrentQuestionIndex(0);
    setSelectedOption(null);
    setHasSubmittedAnswer(false);
    setUserAnswers({});
    setQuizFinished(false);
  };

  const handleSelectOption = (index: number) => {
    if (hasSubmittedAnswer) return;
    setSelectedOption(index);
  };

  const handleSubmitAnswer = () => {
    if (selectedOption === null || !currentQuestion) return;
    setHasSubmittedAnswer(true);
    setUserAnswers(prev => ({ ...prev, [currentQuestionIndex]: selectedOption }));
  };

  const handleNextQuestion = () => {
    if (!activeQuiz) return;
    if (currentQuestionIndex + 1 < activeQuiz.questions.length) {
      setCurrentQuestionIndex(prev => prev + 1);
      setSelectedOption(null);
      setHasSubmittedAnswer(false);
    } else {
      // Complete quiz
      setQuizFinished(true);
      calculateAndSaveResults();
    }
  };

  const calculateAndSaveResults = async () => {
    if (!activeQuiz) return;
    let correctCount = 0;
    activeQuiz.questions.forEach((q, idx) => {
      if (userAnswers[idx] === q.correctIndex) {
        correctCount++;
      }
    });

    const scorePercent = Math.round((correctCount / activeQuiz.questions.length) * 100);
    await recordQuizAttempt(activeQuiz.id, scorePercent);

    // Also log study session
    const subject = subjects.find(s => s.id === activeQuiz.subjectId);
    await logStudySession({
      subjectId: activeQuiz.subjectId,
      subjectName: subject?.name || 'Security Lab',
      durationMinutes: 15,
      type: 'quiz_lab'
    });
  };

  const calculateScore = () => {
    if (!activeQuiz) return 0;
    let correctCount = 0;
    activeQuiz.questions.forEach((q, idx) => {
      if (userAnswers[idx] === q.correctIndex) {
        correctCount++;
      }
    });
    return Math.round((correctCount / activeQuiz.questions.length) * 100);
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 font-mono text-xs text-emerald-400 mb-1">
            <FlaskConical className="w-4 h-4" />
            <span>PRACTICE_LAB // TECHNICAL_ASSESSMENTS</span>
          </div>
          <h1 className="font-mono text-xl sm:text-2xl font-bold text-slate-100">
            QUIZ & PRACTICE LAB
          </h1>
          <p className="text-xs text-slate-400">
            Simulated exam challenges, protocol questions, and hands-on comprehension labs.
          </p>
        </div>

        {activeQuiz && (
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setActiveQuizId(null)}
          >
            &lt; RETURN_TO_LAB_INDEX
          </Button>
        )}
      </div>

      {/* View 1: Quiz Selection Index */}
      {!activeQuiz && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {quizzes.map((quiz) => {
            const subject = subjects.find(s => s.id === quiz.subjectId);
            const difficultyVariants = {
              easy: 'green',
              medium: 'amber',
              hard: 'red'
            } as const;

            return (
              <div
                key={quiz.id}
                className="bg-cyber-surface border border-cyber-border hover:border-slate-700 rounded-lg p-5 flex flex-col justify-between gap-4 transition-all"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    {subject && (
                      <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded border border-cyber-border bg-cyber-bg" style={{ color: subject.color }}>
                        {subject.code}
                      </span>
                    )}
                    <Badge variant={difficultyVariants[quiz.difficulty]} size="sm">
                      {quiz.difficulty}
                    </Badge>
                  </div>

                  <div>
                    <h2 className="font-mono text-base font-semibold text-slate-100">
                      {quiz.title}
                    </h2>
                    <p className="text-xs text-slate-400 mt-1">
                      {quiz.description}
                    </p>
                  </div>
                </div>

                <div className="pt-3 border-t border-cyber-border flex items-center justify-between">
                  <div className="flex items-center gap-3 text-xs font-mono text-slate-400">
                    <span>{quiz.questions.length} questions</span>
                    {quiz.bestScore !== undefined && quiz.attemptsCount > 0 && (
                      <>
                        <span>•</span>
                        <span className="text-emerald-400">Best: {quiz.bestScore}%</span>
                      </>
                    )}
                  </div>

                  <Button
                    variant="primary"
                    size="sm"
                    icon={<Play className="w-3.5 h-3.5" />}
                    onClick={() => handleStartQuiz(quiz.id)}
                  >
                    START_LAB
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* View 2: Active Quiz Testing Session */}
      {activeQuiz && !quizFinished && currentQuestion && (
        <div className="max-w-3xl mx-auto bg-cyber-surface border border-cyber-border rounded-lg overflow-hidden shadow-cyber-card">
          {/* Header Bar */}
          <div className="px-5 py-3.5 bg-cyber-bg border-b border-cyber-border flex items-center justify-between font-mono text-xs text-slate-400">
            <div className="flex items-center gap-2">
              <span className="text-emerald-400 font-semibold">{activeQuiz.title}</span>
              <span>//</span>
              <span>QUESTION {currentQuestionIndex + 1} OF {activeQuiz.questions.length}</span>
            </div>
            <Badge variant="cyan" size="sm">
              {currentQuestion.category}
            </Badge>
          </div>

          <div className="p-6 space-y-6">
            {/* Question Text */}
            <div className="space-y-3">
              <h2 className="font-mono text-base sm:text-lg font-bold text-slate-100 leading-snug">
                {currentQuestion.question}
              </h2>

              {currentQuestion.codeSnippet && (
                <pre className="p-3 bg-cyber-bg border border-cyber-border rounded font-mono text-xs text-emerald-300 overflow-x-auto">
                  {currentQuestion.codeSnippet}
                </pre>
              )}
            </div>

            {/* Multiple Choice Options */}
            <div className="space-y-2.5">
              {currentQuestion.options.map((option, idx) => {
                const isSelected = selectedOption === idx;
                const isCorrect = idx === currentQuestion.correctIndex;

                let stateClass = 'bg-cyber-bg border-cyber-border hover:border-slate-600 text-slate-200';
                if (hasSubmittedAnswer) {
                  if (isCorrect) {
                    stateClass = 'bg-emerald-950/60 border-emerald-500 text-emerald-300';
                  } else if (isSelected && !isCorrect) {
                    stateClass = 'bg-red-950/60 border-red-500 text-red-300';
                  }
                } else if (isSelected) {
                  stateClass = 'bg-cyber-card border-emerald-500 text-emerald-400 shadow-terminal';
                }

                return (
                  <button
                    key={idx}
                    onClick={() => handleSelectOption(idx)}
                    disabled={hasSubmittedAnswer}
                    className={`w-full p-3.5 rounded border text-left text-xs font-mono transition-all flex items-start gap-3 ${stateClass}`}
                  >
                    <span className="w-5 h-5 rounded border border-current/40 flex items-center justify-center shrink-0 font-bold text-[10px]">
                      {String.fromCharCode(65 + idx)}
                    </span>
                    <span className="flex-1 mt-0.5">{option}</span>
                    {hasSubmittedAnswer && isCorrect && (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    )}
                    {hasSubmittedAnswer && isSelected && !isCorrect && (
                      <XCircle className="w-4 h-4 text-red-400 shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Explanation Breakdown after submit */}
            {hasSubmittedAnswer && (
              <div className="p-4 bg-cyber-bg border border-cyber-border rounded space-y-1.5 font-mono text-xs">
                <div className="flex items-center gap-2 text-emerald-400 font-semibold">
                  <HelpCircle className="w-4 h-4" />
                  <span>TECHNICAL DEEP-DIVE:</span>
                </div>
                <p className="text-slate-300 leading-relaxed text-[11px]">
                  {currentQuestion.explanation}
                </p>
              </div>
            )}

            {/* Action Bar */}
            <div className="pt-4 border-t border-cyber-border flex justify-between items-center">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setActiveQuizId(null)}
              >
                ABORT_LAB
              </Button>

              {!hasSubmittedAnswer ? (
                <Button
                  variant="primary"
                  size="md"
                  disabled={selectedOption === null}
                  onClick={handleSubmitAnswer}
                >
                  VALIDATE_ANSWER
                </Button>
              ) : (
                <Button
                  variant="primary"
                  size="md"
                  icon={<ArrowRight className="w-4 h-4" />}
                  onClick={handleNextQuestion}
                >
                  {currentQuestionIndex + 1 < activeQuiz.questions.length ? 'NEXT_CHALLENGE' : 'FINALIZE_ASSESSMENT'}
                </Button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* View 3: Completed Results Report Card */}
      {quizFinished && activeQuiz && (
        <div className="max-w-2xl mx-auto bg-cyber-surface border border-cyber-border rounded-lg p-6 sm:p-8 text-center space-y-6 shadow-cyber-card">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-950/80 border border-emerald-500/50 text-emerald-400 mx-auto">
            <Award className="w-8 h-8" />
          </div>

          <div className="space-y-1">
            <span className="font-mono text-xs text-emerald-400 tracking-wider">
              ASSESSMENT_COMPLETE // AUDIT_COMMITTED
            </span>
            <h2 className="font-mono text-2xl font-bold text-slate-100">
              {activeQuiz.title}
            </h2>
          </div>

          {/* Score Indicator */}
          <div className="p-6 bg-cyber-bg border border-cyber-border rounded-lg inline-block min-w-[200px]">
            <div className="font-mono text-4xl font-bold text-emerald-400">
              {calculateScore()}%
            </div>
            <p className="font-mono text-xs text-slate-400 mt-1">
              ACCURACY RATING
            </p>
          </div>

          <p className="text-xs font-mono text-slate-400 max-w-md mx-auto">
            Result recorded into your Supabase performance stream. Study session duration credited to your subject velocity metrics.
          </p>

          <div className="flex justify-center gap-3 pt-2">
            <Button
              variant="secondary"
              onClick={() => handleStartQuiz(activeQuiz.id)}
              icon={<RotateCcw className="w-3.5 h-3.5" />}
            >
              RETAKE_LAB
            </Button>
            <Button
              variant="primary"
              onClick={() => setActiveQuizId(null)}
            >
              RETURN_TO_INDEX
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
