import { useState } from 'react';
import {
  InterviewConfig,
  InterviewQuestion,
  QuestionResult,
  InterviewPhase,
} from './types/interview';
import { fetchQuestions } from './services/api';
import { SetupForm } from './components/SetupForm';
import { InterviewSession } from './components/InterviewSession';
import { ResultsDashboard } from './components/ResultsDashboard';

function App() {
  const [phase, setPhase] = useState<InterviewPhase>('setup');
  const [config, setConfig] = useState<InterviewConfig | null>(null);
  const [questions, setQuestions] = useState<InterviewQuestion[]>([]);
  const [results, setResults] = useState<QuestionResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleStart = async (interviewConfig: InterviewConfig) => {
    setIsLoading(true);
    try {
      const generatedQuestions = await fetchQuestions(interviewConfig);
      setConfig(interviewConfig);
      setQuestions(generatedQuestions);
      setPhase('interview');
    } catch (error) {
      console.error('Failed to start interview:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleComplete = (interviewResults: QuestionResult[]) => {
    setResults(interviewResults);
    setPhase('results');
  };

  const handleRestart = () => {
    setPhase('setup');
    setConfig(null);
    setQuestions([]);
    setResults([]);
  };

  return (
    <>
      {phase === 'setup' && (
        <SetupForm onStart={handleStart} isLoading={isLoading} />
      )}
      {phase === 'interview' && config && (
        <InterviewSession
          config={config}
          questions={questions}
          onComplete={handleComplete}
        />
      )}
      {phase === 'results' && config && (
        <ResultsDashboard
          config={config}
          results={results}
          onRestart={handleRestart}
        />
      )}
    </>
  );
}

export default App;
