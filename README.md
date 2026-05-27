# AI Interview Coach Platform

An AI-powered mock interview platform that conducts interviews using voice + AI feedback. Practice your interview skills and receive detailed analysis on your delivery, confidence, and STAR-format compliance.

![Interview Coach](https://img.shields.io/badge/AI-Interview%20Coach-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue)
![React](https://img.shields.io/badge/React-19-blue)
![Node.js](https://img.shields.io/badge/Node.js-Express-green)

## Features

- **AI Interviewer** — Generates role-specific interview questions based on job title, experience level, and interview type (behavioral, technical, or mixed)
- **Speech-to-Text Transcription** — Records your voice answers and transcribes them using OpenAI Whisper (or use text input mode)
- **Filler Word Detection** — Detects and counts filler words like "um", "uh", "like", "you know", "basically", and more
- **Confidence Analysis** — Scores your confidence based on filler word usage, speaking speed, response length, and sentence completeness
- **Speaking Speed Analysis** — Measures your words-per-minute and provides feedback on pacing
- **STAR Format Coaching** — Analyzes your answers for Situation, Task, Action, and Result components with specific improvement suggestions
- **Interview Scorecard PDF** — Generates a professional PDF report with all metrics, strengths, and improvement areas

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19, TypeScript, Vite, TailwindCSS |
| Backend | Node.js, Express, TypeScript |
| AI/LLM | OpenAI GPT-4o-mini (questions & analysis), Whisper (transcription) |
| PDF | jsPDF |
| Icons | Lucide React |

## Getting Started

### Prerequisites

- Node.js 18+
- npm 9+
- OpenAI API key (optional — app works in fallback mode without it)

### Installation

```bash
# Clone the repository
git clone <repo-url>
cd ai-interview-coach

# Install dependencies
npm install

# Set up environment variables (optional)
cp .env.example server/.env
# Edit server/.env and add your OPENAI_API_KEY
```

### Running in Development

```bash
# Start both frontend and backend
npm run dev
```

- Frontend: http://localhost:5173
- Backend: http://localhost:3001

### Building for Production

```bash
npm run build
npm start
```

## How It Works

1. **Setup** — Choose your target role, experience level, interview type, and number of questions
2. **Interview** — Answer each question using voice recording or text input
3. **Analysis** — Each answer is analyzed for:
   - Filler word frequency and types
   - Speaking speed (words per minute)
   - Overall confidence score
   - STAR format compliance with improvement suggestions
4. **Results** — View detailed per-question analysis with expandable breakdowns
5. **Scorecard** — Download a professional PDF report summarizing your performance

## Fallback Mode

The app works without an OpenAI API key using built-in fallback logic:
- Questions are generated from a curated pool of common interview questions
- STAR analysis uses keyword-based detection
- Scorecard summaries use rule-based generation

With an OpenAI API key, you get:
- AI-generated questions tailored to your specific role and level
- GPT-powered STAR analysis with rewritten example answers
- AI-generated strengths and improvement summaries
- Whisper-based audio transcription

## Project Structure

```
ai-interview-coach/
├── client/                    # React frontend
│   ├── src/
│   │   ├── components/        # React components
│   │   │   ├── SetupForm.tsx
│   │   │   ├── InterviewSession.tsx
│   │   │   └── ResultsDashboard.tsx
│   │   ├── hooks/
│   │   │   └── useAudioRecorder.ts
│   │   ├── services/
│   │   │   ├── api.ts
│   │   │   └── pdfGenerator.ts
│   │   ├── types/
│   │   │   └── interview.ts
│   │   ├── App.tsx
│   │   └── main.tsx
│   └── index.html
├── server/                    # Express backend
│   └── src/
│       ├── routes/
│       │   └── interview.ts
│       ├── services/
│       │   ├── openaiService.ts
│       │   └── speechAnalysis.ts
│       ├── types/
│       │   └── interview.ts
│       └── index.ts
├── package.json
└── README.md
```

## License

MIT
