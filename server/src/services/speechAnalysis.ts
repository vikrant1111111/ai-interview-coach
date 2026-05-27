import {
  FillerWordAnalysis,
  SpeakingSpeedAnalysis,
  ConfidenceAnalysis,
} from '../types/interview';

const FILLER_WORDS = [
  'um', 'uh', 'like', 'you know', 'basically', 'actually',
  'literally', 'honestly', 'right', 'so', 'well', 'I mean',
  'kind of', 'sort of', 'anyway', 'obviously', 'er', 'ah',
];

export function analyzeFillerWords(text: string): FillerWordAnalysis {
  const lowerText = text.toLowerCase();
  const words = lowerText.split(/\s+/).filter(w => w.length > 0);
  const totalWords = words.length;
  const fillerWordCounts: Record<string, number> = {};
  let totalFillerWords = 0;

  for (const filler of FILLER_WORDS) {
    const regex = new RegExp(`\\b${filler}\\b`, 'gi');
    const matches = lowerText.match(regex);
    if (matches && matches.length > 0) {
      fillerWordCounts[filler] = matches.length;
      totalFillerWords += matches.length;
    }
  }

  const fillerWordPercentage = totalWords > 0
    ? Math.round((totalFillerWords / totalWords) * 100 * 10) / 10
    : 0;

  return {
    totalFillerWords,
    fillerWordCounts,
    fillerWordPercentage,
    totalWords,
  };
}

export function analyzeSpeakingSpeed(
  text: string,
  durationSeconds: number
): SpeakingSpeedAnalysis {
  const words = text.split(/\s+/).filter(w => w.length > 0);
  const durationMinutes = durationSeconds / 60;
  const wordsPerMinute = durationMinutes > 0
    ? Math.round(words.length / durationMinutes)
    : 0;

  let rating: SpeakingSpeedAnalysis['rating'];
  let feedback: string;

  if (wordsPerMinute < 80) {
    rating = 'too-slow';
    feedback = 'Your speaking pace is quite slow. Try to maintain a more natural conversational speed to keep the interviewer engaged.';
  } else if (wordsPerMinute < 120) {
    rating = 'slow';
    feedback = 'Your pace is slightly slow but still acceptable. A slightly faster pace could help convey more energy and enthusiasm.';
  } else if (wordsPerMinute <= 160) {
    rating = 'optimal';
    feedback = 'Great speaking pace! You are speaking at a natural, conversational speed that is easy to follow.';
  } else if (wordsPerMinute <= 190) {
    rating = 'fast';
    feedback = 'You are speaking a bit fast. Try to slow down slightly to ensure clarity and give the interviewer time to process your responses.';
  } else {
    rating = 'too-fast';
    feedback = 'You are speaking very fast. Slow down significantly to improve clarity and allow your key points to land effectively.';
  }

  return { wordsPerMinute, rating, feedback };
}

export function analyzeConfidence(
  fillerAnalysis: FillerWordAnalysis,
  speedAnalysis: SpeakingSpeedAnalysis,
  text: string,
  durationSeconds: number
): ConfidenceAnalysis {
  const fillerWordPenalty = Math.max(0, 100 - fillerAnalysis.fillerWordPercentage * 10);

  let speedScore: number;
  switch (speedAnalysis.rating) {
    case 'optimal': speedScore = 100; break;
    case 'slow':
    case 'fast': speedScore = 75; break;
    case 'too-slow':
    case 'too-fast': speedScore = 50; break;
  }

  const words = text.split(/\s+/).filter(w => w.length > 0);
  const responseLength = Math.min(100, (words.length / (durationSeconds / 60)) > 50 ? 100 : (words.length / 20) * 100);

  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
  const completeSentences = sentences.filter(s => s.trim().split(/\s+/).length >= 3);
  const sentenceCompleteness = sentences.length > 0
    ? (completeSentences.length / sentences.length) * 100
    : 50;

  const score = Math.round(
    fillerWordPenalty * 0.3 +
    speedScore * 0.25 +
    responseLength * 0.2 +
    sentenceCompleteness * 0.25
  );

  let rating: ConfidenceAnalysis['rating'];
  if (score >= 85) rating = 'very-high';
  else if (score >= 70) rating = 'high';
  else if (score >= 50) rating = 'moderate';
  else rating = 'low';

  return {
    score,
    factors: {
      fillerWordPenalty,
      speedScore,
      responseLength,
      sentenceCompleteness,
    },
    rating,
  };
}
