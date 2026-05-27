import OpenAI from 'openai';
import fs from 'fs';
import {
  InterviewConfig,
  InterviewQuestion,
  STARAnalysis,
  InterviewScorecard,
} from '../types/interview';

let openai: OpenAI | null = null;

function getClient(): OpenAI {
  if (!openai) {
    openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  }
  return openai;
}

export function isConfigured(): boolean {
  return !!process.env.OPENAI_API_KEY;
}

export async function generateQuestions(
  config: InterviewConfig
): Promise<InterviewQuestion[]> {
  if (!isConfigured()) {
    return generateFallbackQuestions(config);
  }

  try {
    const client = getClient();
    const response = await client.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: `You are an expert interview coach. Generate ${config.questionCount} interview questions for a ${config.experienceLevel} ${config.role} position. The interview type is ${config.interviewType}. Return a JSON array with objects having: id (number), question (string), category (string like "Leadership", "Problem Solving", "Technical", etc.), difficulty (string: "Easy", "Medium", "Hard").`,
        },
        {
          role: 'user',
          content: `Generate ${config.questionCount} ${config.interviewType} interview questions for a ${config.experienceLevel} ${config.role}.`,
        },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.8,
    });

    const content = response.choices[0]?.message?.content;
    if (!content) throw new Error('No response from OpenAI');

    const parsed = JSON.parse(content);
    const questions = parsed.questions || parsed;
    return Array.isArray(questions) ? questions : generateFallbackQuestions(config);
  } catch {
    console.error('Failed to generate questions via OpenAI, using fallback');
    return generateFallbackQuestions(config);
  }
}

export async function transcribeAudio(filePath: string): Promise<string> {
  if (!isConfigured()) {
    throw new Error('OpenAI API key not configured. Please set OPENAI_API_KEY environment variable.');
  }

  const client = getClient();
  const response = await client.audio.transcriptions.create({
    file: fs.createReadStream(filePath),
    model: 'whisper-1',
    response_format: 'text',
  });

  return response as unknown as string;
}

export async function analyzeSTAR(
  question: string,
  answer: string
): Promise<STARAnalysis> {
  if (!isConfigured()) {
    return analyzeFallbackSTAR(answer);
  }

  try {
    const client = getClient();
    const response = await client.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: `You are an expert interview coach. Analyze the following interview answer using the STAR method (Situation, Task, Action, Result). Return a JSON object with:
- hasSituation (boolean): whether the answer describes a specific situation/context
- hasTask (boolean): whether the answer describes the task/challenge
- hasAction (boolean): whether the answer describes specific actions taken
- hasResult (boolean): whether the answer describes measurable results/outcomes
- score (number 0-100): overall STAR compliance score
- suggestions (string array): 2-4 specific suggestions for improvement
- improvedResponse (string): a rewritten version using proper STAR format`,
        },
        {
          role: 'user',
          content: `Question: ${question}\n\nAnswer: ${answer}`,
        },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.7,
    });

    const content = response.choices[0]?.message?.content;
    if (!content) throw new Error('No response');

    return JSON.parse(content) as STARAnalysis;
  } catch {
    return analyzeFallbackSTAR(answer);
  }
}

export async function generateScorecardSummary(
  scorecard: Omit<InterviewScorecard, 'summary'>
): Promise<InterviewScorecard['summary']> {
  const totalQuestions = scorecard.questions.length;
  const averageConfidence = Math.round(
    scorecard.questions.reduce((sum, q) => sum + q.confidenceScore, 0) / totalQuestions
  );
  const averageSpeakingSpeed = Math.round(
    scorecard.questions.reduce((sum, q) => sum + q.speakingSpeed, 0) / totalQuestions
  );
  const totalFillerWords = scorecard.questions.reduce(
    (sum, q) => sum + q.fillerWordCount, 0
  );
  const averageStarScore = Math.round(
    scorecard.questions.reduce((sum, q) => sum + q.starScore, 0) / totalQuestions
  );

  if (!isConfigured()) {
    return {
      totalQuestions,
      averageConfidence,
      averageSpeakingSpeed,
      totalFillerWords,
      averageStarScore,
      strengths: generateFallbackStrengths(averageConfidence, averageSpeakingSpeed, totalFillerWords),
      improvements: generateFallbackImprovements(averageConfidence, averageSpeakingSpeed, totalFillerWords),
    };
  }

  try {
    const client = getClient();
    const response = await client.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'You are an expert interview coach. Based on the interview data, provide 3-5 specific strengths and 3-5 specific areas for improvement. Return JSON with: strengths (string[]), improvements (string[]).',
        },
        {
          role: 'user',
          content: JSON.stringify({
            role: scorecard.role,
            level: scorecard.experienceLevel,
            averageConfidence,
            averageSpeakingSpeed,
            totalFillerWords,
            averageStarScore,
            questions: scorecard.questions,
          }),
        },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.7,
    });

    const content = response.choices[0]?.message?.content;
    if (!content) throw new Error('No response');

    const parsed = JSON.parse(content);
    return {
      totalQuestions,
      averageConfidence,
      averageSpeakingSpeed,
      totalFillerWords,
      averageStarScore,
      strengths: parsed.strengths || [],
      improvements: parsed.improvements || [],
    };
  } catch {
    return {
      totalQuestions,
      averageConfidence,
      averageSpeakingSpeed,
      totalFillerWords,
      averageStarScore,
      strengths: generateFallbackStrengths(averageConfidence, averageSpeakingSpeed, totalFillerWords),
      improvements: generateFallbackImprovements(averageConfidence, averageSpeakingSpeed, totalFillerWords),
    };
  }
}

function generateFallbackQuestions(config: InterviewConfig): InterviewQuestion[] {
  const behavioralQuestions: InterviewQuestion[] = [
    { id: 1, question: 'Tell me about a time when you had to deal with a difficult team member. How did you handle the situation?', category: 'Teamwork', difficulty: 'Medium' },
    { id: 2, question: 'Describe a project where you had to learn a new technology quickly. What was your approach?', category: 'Adaptability', difficulty: 'Medium' },
    { id: 3, question: 'Tell me about a time when you failed at something. What did you learn from it?', category: 'Self-Awareness', difficulty: 'Hard' },
    { id: 4, question: 'Describe a situation where you had to make a decision without all the information you needed.', category: 'Decision Making', difficulty: 'Hard' },
    { id: 5, question: 'Tell me about your most significant professional achievement. What made it successful?', category: 'Leadership', difficulty: 'Medium' },
    { id: 6, question: 'Describe a time when you had to manage competing priorities. How did you decide what to focus on?', category: 'Time Management', difficulty: 'Medium' },
    { id: 7, question: 'Tell me about a time when you went above and beyond for a customer or stakeholder.', category: 'Customer Focus', difficulty: 'Easy' },
    { id: 8, question: 'Describe a conflict you had with a coworker and how you resolved it.', category: 'Conflict Resolution', difficulty: 'Hard' },
  ];

  const technicalQuestions: InterviewQuestion[] = [
    { id: 1, question: `As a ${config.role}, how would you design a system that needs to handle 10x traffic growth?`, category: 'System Design', difficulty: 'Hard' },
    { id: 2, question: 'Walk me through your approach to debugging a production issue that affects users.', category: 'Problem Solving', difficulty: 'Medium' },
    { id: 3, question: 'How do you ensure code quality in your projects? What practices do you follow?', category: 'Best Practices', difficulty: 'Easy' },
    { id: 4, question: 'Explain a complex technical concept you recently worked with to a non-technical audience.', category: 'Communication', difficulty: 'Medium' },
    { id: 5, question: 'How do you stay current with new technologies and industry trends?', category: 'Growth Mindset', difficulty: 'Easy' },
    { id: 6, question: 'Describe your approach to testing. How do you decide what to test and at what level?', category: 'Testing', difficulty: 'Medium' },
  ];

  const pool = config.interviewType === 'behavioral'
    ? behavioralQuestions
    : config.interviewType === 'technical'
      ? technicalQuestions
      : [...behavioralQuestions, ...technicalQuestions];

  const shuffled = pool.sort(() => Math.random() - 0.5);
  return shuffled.slice(0, config.questionCount).map((q, i) => ({ ...q, id: i + 1 }));
}

function analyzeFallbackSTAR(answer: string): STARAnalysis {
  const lower = answer.toLowerCase();
  const hasSituation = /\b(when|situation|context|background|at my|in my|during)\b/i.test(lower);
  const hasTask = /\b(task|challenge|goal|objective|needed to|had to|responsible)\b/i.test(lower);
  const hasAction = /\b(i did|i took|i created|i implemented|i led|i decided|i built|my approach)\b/i.test(lower);
  const hasResult = /\b(result|outcome|achieved|improved|increased|decreased|saved|delivered|success)\b/i.test(lower);

  const components = [hasSituation, hasTask, hasAction, hasResult].filter(Boolean).length;
  const score = Math.round((components / 4) * 100);

  const suggestions: string[] = [];
  if (!hasSituation) suggestions.push('Start by setting the scene — describe the specific situation or context with relevant details like when, where, and what was happening.');
  if (!hasTask) suggestions.push('Clearly define your task or role — what was your specific responsibility or the challenge you faced?');
  if (!hasAction) suggestions.push('Detail the specific actions YOU took — use "I" statements and be specific about your contributions, not just what the team did.');
  if (!hasResult) suggestions.push('End with measurable results — quantify your impact with numbers, percentages, or specific outcomes whenever possible.');

  return {
    hasSituation,
    hasTask,
    hasAction,
    hasResult,
    score,
    suggestions: suggestions.length > 0 ? suggestions : ['Great job covering all STAR components! Consider adding more quantifiable metrics to strengthen your results.'],
    improvedResponse: 'Try restructuring your answer: Start with the Situation (context), then the Task (your responsibility), followed by the Actions you took, and finally the Results you achieved with measurable outcomes.',
  };
}

function generateFallbackStrengths(confidence: number, speed: number, fillers: number): string[] {
  const strengths: string[] = [];
  if (confidence >= 70) strengths.push('Strong confidence level throughout the interview');
  if (speed >= 120 && speed <= 160) strengths.push('Excellent speaking pace — natural and easy to follow');
  if (fillers < 10) strengths.push('Minimal use of filler words, showing clear and focused communication');
  if (strengths.length === 0) strengths.push('Completed all interview questions', 'Showed willingness to engage with challenging topics');
  return strengths;
}

function generateFallbackImprovements(confidence: number, speed: number, fillers: number): string[] {
  const improvements: string[] = [];
  if (confidence < 70) improvements.push('Work on building confidence — practice responses out loud and use the STAR method');
  if (speed < 120) improvements.push('Try to speak at a slightly faster, more conversational pace');
  if (speed > 160) improvements.push('Slow down your speaking pace to ensure clarity');
  if (fillers >= 10) improvements.push('Reduce filler words by pausing briefly instead of using "um" or "like"');
  if (improvements.length === 0) improvements.push('Continue practicing with different question types to maintain your strong performance');
  return improvements;
}
