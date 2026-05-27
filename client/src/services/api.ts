import {
  InterviewConfig,
  InterviewQuestion,
  AnswerAnalysis,
} from '../types/interview';

const API_BASE = '/api/interview';

export async function fetchQuestions(
  config: InterviewConfig
): Promise<InterviewQuestion[]> {
  const response = await fetch(`${API_BASE}/questions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(config),
  });
  if (!response.ok) throw new Error('Failed to fetch questions');
  const data = await response.json();
  return data.questions;
}

export async function transcribeAudio(
  audioBlob: Blob,
  duration: number
): Promise<string> {
  const formData = new FormData();
  formData.append('audio', audioBlob, 'recording.webm');
  formData.append('duration', duration.toString());

  const response = await fetch(`${API_BASE}/transcribe`, {
    method: 'POST',
    body: formData,
  });
  if (!response.ok) throw new Error('Failed to transcribe audio');
  const data = await response.json();
  return data.text;
}

export async function analyzeAnswer(
  question: string,
  transcription: string,
  duration: number
): Promise<AnswerAnalysis> {
  const response = await fetch(`${API_BASE}/analyze`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ question, transcription, duration }),
  });
  if (!response.ok) throw new Error('Failed to analyze answer');
  return response.json();
}

export async function generateScorecard(data: {
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
}) {
  const response = await fetch(`${API_BASE}/scorecard`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error('Failed to generate scorecard');
  return response.json();
}

export async function checkHealth(): Promise<{ status: string; openaiConfigured: boolean }> {
  const response = await fetch(`${API_BASE}/health`);
  return response.json();
}
