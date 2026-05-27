import { Router, Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import {
  InterviewConfig,
  AnswerAnalysis,
  InterviewScorecard,
} from '../types/interview';
import {
  generateQuestions,
  transcribeAudio,
  analyzeSTAR,
  generateScorecardSummary,
  isConfigured,
} from '../services/openaiService';
import {
  analyzeFillerWords,
  analyzeSpeakingSpeed,
  analyzeConfidence,
} from '../services/speechAnalysis';

const router = Router();

const upload = multer({
  dest: path.join(process.cwd(), 'uploads'),
  limits: { fileSize: 25 * 1024 * 1024 },
});

router.get('/health', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    openaiConfigured: isConfigured(),
  });
});

router.post('/questions', async (req: Request, res: Response) => {
  try {
    const config: InterviewConfig = req.body;
    if (!config.role || !config.experienceLevel || !config.interviewType) {
      res.status(400).json({ error: 'Missing required fields: role, experienceLevel, interviewType' });
      return;
    }
    config.questionCount = config.questionCount || 5;
    const questions = await generateQuestions(config);
    res.json({ questions });
  } catch (error) {
    console.error('Error generating questions:', error);
    res.status(500).json({ error: 'Failed to generate questions' });
  }
});

router.post(
  '/transcribe',
  upload.single('audio'),
  async (req: Request, res: Response) => {
    try {
      if (!req.file) {
        res.status(400).json({ error: 'No audio file provided' });
        return;
      }

      const transcription = await transcribeAudio(req.file.path);
      fs.unlinkSync(req.file.path);

      res.json({ text: transcription, duration: parseFloat(req.body.duration || '0') });
    } catch (error) {
      if (req.file) {
        try { fs.unlinkSync(req.file.path); } catch { /* ignore */ }
      }
      console.error('Error transcribing audio:', error);
      res.status(500).json({ error: 'Failed to transcribe audio' });
    }
  }
);

router.post('/analyze', async (req: Request, res: Response) => {
  try {
    const { question, transcription, duration } = req.body;
    if (!transcription || !duration) {
      res.status(400).json({ error: 'Missing required fields: transcription, duration' });
      return;
    }

    const fillerWords = analyzeFillerWords(transcription);
    const speakingSpeed = analyzeSpeakingSpeed(transcription, duration);
    const confidence = analyzeConfidence(fillerWords, speakingSpeed, transcription, duration);
    const starAnalysis = await analyzeSTAR(question || '', transcription);

    const analysis: AnswerAnalysis = {
      transcription,
      duration,
      fillerWords,
      speakingSpeed,
      confidence,
      starAnalysis,
    };

    res.json(analysis);
  } catch (error) {
    console.error('Error analyzing answer:', error);
    res.status(500).json({ error: 'Failed to analyze answer' });
  }
});

router.post('/scorecard', async (req: Request, res: Response) => {
  try {
    const scorecardData: Omit<InterviewScorecard, 'summary'> = req.body;
    if (!scorecardData.questions || scorecardData.questions.length === 0) {
      res.status(400).json({ error: 'No question data provided' });
      return;
    }

    const summary = await generateScorecardSummary(scorecardData);
    const scorecard: InterviewScorecard = { ...scorecardData, summary };
    res.json(scorecard);
  } catch (error) {
    console.error('Error generating scorecard:', error);
    res.status(500).json({ error: 'Failed to generate scorecard' });
  }
});

export default router;
