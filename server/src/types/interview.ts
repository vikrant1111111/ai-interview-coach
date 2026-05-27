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

export interface TranscriptionResult {
  text: string;
  duration: number;
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

export interface InterviewScorecard {
  role: string;
  experienceLevel: string;
  interviewType: string;
  date: string;
  overallScore: number;
  questions: {
    question: string;
    category: string;
    transcription: string;
    fillerWordCount: number;
    speakingSpeed: number;
    confidenceScore: number;
    starScore: number;
  }[];
  summary: {
    totalQuestions: number;
    averageConfidence: number;
    averageSpeakingSpeed: number;
    totalFillerWords: number;
    averageStarScore: number;
    strengths: string[];
    improvements: string[];
  };
}
