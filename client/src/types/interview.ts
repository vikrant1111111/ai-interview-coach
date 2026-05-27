export interface InterviewConfig {
  role: string;
  experienceLevel: 'junior' | 'mid' | 'senior' | 'lead';
  interviewType: 'behavioral' | 'technical' | 'mixed';
  questionCount: number;
}

export interface InterviewQuestion {
  id: number;
  question: string;
  category: string;
  difficulty: string;
}

export interface FillerWordAnalysis {
  totalFillerWords: number;
  fillerWordCounts: Record<string, number>;
  fillerWordPercentage: number;
  totalWords: number;
}

export interface SpeakingSpeedAnalysis {
  wordsPerMinute: number;
  rating: 'too-slow' | 'slow' | 'optimal' | 'fast' | 'too-fast';
  feedback: string;
}

export interface ConfidenceAnalysis {
  score: number;
  factors: {
    fillerWordPenalty: number;
    speedScore: number;
    responseLength: number;
    sentenceCompleteness: number;
  };
  rating: 'low' | 'moderate' | 'high' | 'very-high';
}

export interface STARAnalysis {
  hasSituation: boolean;
  hasTask: boolean;
  hasAction: boolean;
  hasResult: boolean;
  score: number;
  suggestions: string[];
  improvedResponse: string;
}

export interface AnswerAnalysis {
  transcription: string;
  duration: number;
  fillerWords: FillerWordAnalysis;
  speakingSpeed: SpeakingSpeedAnalysis;
  confidence: ConfidenceAnalysis;
  starAnalysis: STARAnalysis;
}

export interface QuestionResult {
  question: InterviewQuestion;
  analysis: AnswerAnalysis;
}

export type InterviewPhase = 'setup' | 'interview' | 'results';
