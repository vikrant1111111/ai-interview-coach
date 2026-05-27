import { useState, useEffect, useCallback } from 'react';
import {
  Mic,
  MicOff,
  Square,
  SkipForward,
  Clock,
  Volume2,
  Keyboard,
  AlertCircle,
} from 'lucide-react';
import {
  InterviewQuestion,
  AnswerAnalysis,
  QuestionResult,
  InterviewConfig,
} from '../types/interview';
import { useAudioRecorder } from '../hooks/useAudioRecorder';
import { transcribeAudio, analyzeAnswer } from '../services/api';

interface InterviewSessionProps {
  config: InterviewConfig;
  questions: InterviewQuestion[];
  onComplete: (results: QuestionResult[]) => void;
}

export function InterviewSession({ config, questions, onComplete }: InterviewSessionProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [results, setResults] = useState<QuestionResult[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [textInput, setTextInput] = useState('');
  const [useTextMode, setUseTextMode] = useState(false);
  const [answerStartTime, setAnswerStartTime] = useState<number>(0);

  const {
    isRecording,
    duration,
    startRecording,
    stopRecording,
  } = useAudioRecorder();

  const currentQuestion = questions[currentIndex];
  const progress = ((currentIndex) / questions.length) * 100;

  const processAnswer = useCallback(async (
    transcription: string,
    answerDuration: number,
    question: InterviewQuestion
  ) => {
    setIsAnalyzing(true);
    setError(null);
    try {
      const analysis: AnswerAnalysis = await analyzeAnswer(
        question.question,
        transcription,
        answerDuration
      );

      const result: QuestionResult = { question, analysis };
      const newResults = [...results, result];
      setResults(newResults);

      if (currentIndex + 1 >= questions.length) {
        onComplete(newResults);
      } else {
        setCurrentIndex(currentIndex + 1);
        setTextInput('');
      }
    } catch {
      setError('Failed to analyze your answer. Please try again.');
    } finally {
      setIsAnalyzing(false);
    }
  }, [results, currentIndex, questions, onComplete]);

  const handleStartRecording = async () => {
    setError(null);
    try {
      await startRecording();
      setAnswerStartTime(Date.now());
    } catch {
      setError('Could not access microphone. Please check permissions or use text mode.');
      setUseTextMode(true);
    }
  };

  const handleStopRecording = async () => {
    const blob = await stopRecording();
    if (!blob) return;

    setIsAnalyzing(true);
    try {
      const transcription = await transcribeAudio(blob, duration);
      await processAnswer(transcription, duration, currentQuestion);
    } catch {
      setError('Failed to transcribe audio. You can use text mode instead.');
      setUseTextMode(true);
      setIsAnalyzing(false);
    }
  };

  const handleTextSubmit = async () => {
    if (!textInput.trim()) return;
    const answerDuration = answerStartTime > 0
      ? (Date.now() - answerStartTime) / 1000
      : 60;
    await processAnswer(textInput, answerDuration, currentQuestion);
  };

  useEffect(() => {
    if (useTextMode && answerStartTime === 0) {
      setAnswerStartTime(Date.now());
    }
  }, [useTextMode, answerStartTime]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-800">
              Mock Interview: {config.role}
            </h2>
            <p className="text-sm text-gray-500">
              {config.experienceLevel} level · {config.interviewType}
            </p>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-500">
              Question {currentIndex + 1} of {questions.length}
            </span>
            <button
              onClick={() => setUseTextMode(!useTextMode)}
              className={`p-2 rounded-lg transition-colors ${
                useTextMode
                  ? 'bg-blue-100 text-blue-600'
                  : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
              }`}
              title={useTextMode ? 'Switch to voice mode' : 'Switch to text mode'}
            >
              {useTextMode ? <Keyboard className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
            </button>
          </div>
        </div>
        {/* Progress bar */}
        <div className="max-w-4xl mx-auto mt-3">
          <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 transition-all duration-500 rounded-full"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-6 py-12">
        {/* Question Card */}
        <div className="bg-white rounded-2xl shadow-lg shadow-gray-200/50 p-8 mb-8 border border-gray-100">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
              <span className="text-blue-600 font-bold">{currentIndex + 1}</span>
            </div>
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs font-medium px-2 py-1 rounded-full bg-blue-50 text-blue-600">
                  {currentQuestion.category}
                </span>
                <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                  currentQuestion.difficulty === 'Hard'
                    ? 'bg-red-50 text-red-600'
                    : currentQuestion.difficulty === 'Medium'
                      ? 'bg-yellow-50 text-yellow-600'
                      : 'bg-green-50 text-green-600'
                }`}>
                  {currentQuestion.difficulty}
                </span>
              </div>
              <p className="text-xl text-gray-800 leading-relaxed">
                {currentQuestion.question}
              </p>
            </div>
          </div>
        </div>

        {/* Error message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        {/* Answer Area */}
        {isAnalyzing ? (
          <div className="text-center py-16">
            <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-6" />
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              Analyzing Your Response
            </h3>
            <p className="text-gray-500">
              Evaluating filler words, confidence, speaking speed, and STAR format...
            </p>
          </div>
        ) : useTextMode ? (
          <div className="space-y-4">
            <textarea
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              placeholder="Type your answer here... Try to respond as you would in a real interview. Use the STAR method (Situation, Task, Action, Result) for behavioral questions."
              className="w-full h-48 px-6 py-4 rounded-2xl border border-gray-200 bg-white text-gray-800 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-400">
                {textInput.split(/\s+/).filter(w => w).length} words
              </span>
              <div className="flex gap-3">
                {currentIndex + 1 < questions.length && (
                  <button
                    onClick={() => {
                      setCurrentIndex(currentIndex + 1);
                      setTextInput('');
                    }}
                    className="flex items-center gap-2 px-5 py-3 text-gray-500 hover:text-gray-700 transition-colors"
                  >
                    <SkipForward className="w-4 h-4" />
                    Skip
                  </button>
                )}
                <button
                  onClick={handleTextSubmit}
                  disabled={!textInput.trim()}
                  className="px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-blue-200"
                >
                  Submit Answer
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            {isRecording ? (
              <div className="space-y-8">
                {/* Recording animation */}
                <div className="relative inline-flex items-center justify-center">
                  <div className="absolute w-32 h-32 bg-red-100 rounded-full animate-ping opacity-25" />
                  <div className="absolute w-24 h-24 bg-red-200 rounded-full animate-pulse" />
                  <div className="relative w-20 h-20 bg-red-500 rounded-full flex items-center justify-center shadow-lg shadow-red-200">
                    <Mic className="w-8 h-8 text-white" />
                  </div>
                </div>

                <div className="flex items-center justify-center gap-2 text-2xl font-mono text-gray-800">
                  <Clock className="w-5 h-5 text-gray-400" />
                  {formatTime(duration)}
                </div>

                <p className="text-gray-500">Recording your answer...</p>

                <button
                  onClick={handleStopRecording}
                  className="inline-flex items-center gap-2 px-8 py-4 bg-red-500 text-white font-semibold rounded-xl hover:bg-red-600 transition-all shadow-lg shadow-red-200"
                >
                  <Square className="w-5 h-5" />
                  Stop Recording
                </button>
              </div>
            ) : (
              <div className="space-y-6">
                <button
                  onClick={handleStartRecording}
                  className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-blue-500 to-indigo-600 text-white rounded-full hover:from-blue-600 hover:to-indigo-700 transition-all shadow-lg shadow-blue-200 group"
                >
                  <Mic className="w-10 h-10 group-hover:scale-110 transition-transform" />
                </button>
                <p className="text-gray-500">
                  Click to start recording your answer
                </p>
                <div className="flex items-center justify-center gap-4">
                  {currentIndex + 1 < questions.length && (
                    <button
                      onClick={() => setCurrentIndex(currentIndex + 1)}
                      className="flex items-center gap-1 text-sm text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      <SkipForward className="w-4 h-4" />
                      Skip Question
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
