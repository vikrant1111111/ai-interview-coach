import { useState, useEffect } from 'react';
import {
  BarChart3,
  Clock,
  MessageSquare,
  Target,
  TrendingUp,
  FileDown,
  RotateCcw,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  XCircle,
  Loader2,
} from 'lucide-react';
import { InterviewConfig, QuestionResult } from '../types/interview';
import { generateScorecard } from '../services/api';
import { generateScorecardPDF } from '../services/pdfGenerator';

interface ResultsDashboardProps {
  config: InterviewConfig;
  results: QuestionResult[];
  onRestart: () => void;
}

export function ResultsDashboard({ config, results, onRestart }: ResultsDashboardProps) {
  const [expandedQuestion, setExpandedQuestion] = useState<number | null>(null);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [overallScore, setOverallScore] = useState(0);

  useEffect(() => {
    if (results.length === 0) return;
    const avgConfidence = results.reduce((s, r) => s + r.analysis.confidence.score, 0) / results.length;
    const avgStar = results.reduce((s, r) => s + r.analysis.starAnalysis.score, 0) / results.length;
    const fillerPenalty = Math.max(0, 100 - results.reduce((s, r) => s + r.analysis.fillerWords.fillerWordPercentage, 0) / results.length * 5);
    setOverallScore(Math.round((avgConfidence * 0.35 + avgStar * 0.35 + fillerPenalty * 0.3)));
  }, [results]);

  const handleDownloadPDF = async () => {
    setIsGeneratingPDF(true);
    try {
      const scorecardData = {
        role: config.role,
        experienceLevel: config.experienceLevel,
        interviewType: config.interviewType,
        date: new Date().toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        }),
        overallScore,
        questions: results.map((r) => ({
          question: r.question.question,
          category: r.question.category,
          transcription: r.analysis.transcription,
          fillerWordCount: r.analysis.fillerWords.totalFillerWords,
          speakingSpeed: r.analysis.speakingSpeed.wordsPerMinute,
          confidenceScore: r.analysis.confidence.score,
          starScore: r.analysis.starAnalysis.score,
        })),
      };

      const fullScorecard = await generateScorecard(scorecardData);
      generateScorecardPDF(fullScorecard);
    } catch {
      const fallbackData = {
        role: config.role,
        experienceLevel: config.experienceLevel,
        interviewType: config.interviewType,
        date: new Date().toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        }),
        overallScore,
        questions: results.map((r) => ({
          question: r.question.question,
          category: r.question.category,
          transcription: r.analysis.transcription,
          fillerWordCount: r.analysis.fillerWords.totalFillerWords,
          speakingSpeed: r.analysis.speakingSpeed.wordsPerMinute,
          confidenceScore: r.analysis.confidence.score,
          starScore: r.analysis.starAnalysis.score,
        })),
        summary: {
          totalQuestions: results.length,
          averageConfidence: Math.round(results.reduce((s, r) => s + r.analysis.confidence.score, 0) / results.length),
          averageSpeakingSpeed: Math.round(results.reduce((s, r) => s + r.analysis.speakingSpeed.wordsPerMinute, 0) / results.length),
          totalFillerWords: results.reduce((s, r) => s + r.analysis.fillerWords.totalFillerWords, 0),
          averageStarScore: Math.round(results.reduce((s, r) => s + r.analysis.starAnalysis.score, 0) / results.length),
          strengths: ['Completed all interview questions'],
          improvements: ['Continue practicing with STAR method'],
        },
      };
      generateScorecardPDF(fallbackData);
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBg = (score: number) => {
    if (score >= 80) return 'bg-green-50 border-green-200';
    if (score >= 60) return 'bg-yellow-50 border-yellow-200';
    return 'bg-red-50 border-red-200';
  };

  const getSpeedBadge = (rating: string) => {
    const badges: Record<string, { bg: string; text: string }> = {
      'optimal': { bg: 'bg-green-100 text-green-700', text: 'Optimal' },
      'slow': { bg: 'bg-yellow-100 text-yellow-700', text: 'Slow' },
      'fast': { bg: 'bg-yellow-100 text-yellow-700', text: 'Fast' },
      'too-slow': { bg: 'bg-red-100 text-red-700', text: 'Too Slow' },
      'too-fast': { bg: 'bg-red-100 text-red-700', text: 'Too Fast' },
    };
    return badges[rating] || badges['optimal'];
  };

  const avgConfidence = Math.round(
    results.reduce((s, r) => s + r.analysis.confidence.score, 0) / results.length
  );
  const avgSpeed = Math.round(
    results.reduce((s, r) => s + r.analysis.speakingSpeed.wordsPerMinute, 0) / results.length
  );
  const totalFillers = results.reduce(
    (s, r) => s + r.analysis.fillerWords.totalFillerWords, 0
  );
  const avgStarScore = Math.round(
    results.reduce((s, r) => s + r.analysis.starAnalysis.score, 0) / results.length
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 pb-12">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white px-6 py-8">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-3xl font-bold mb-2">Interview Results</h1>
          <p className="text-blue-100">
            {config.role} · {config.experienceLevel} · {config.interviewType} · {results.length} questions
          </p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 -mt-6">
        {/* Score Overview Cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          <div className={`col-span-2 md:col-span-1 rounded-2xl p-5 border ${getScoreBg(overallScore)} shadow-sm`}>
            <div className="text-xs font-medium text-gray-500 mb-1">Overall</div>
            <div className={`text-4xl font-bold ${getScoreColor(overallScore)}`}>{overallScore}</div>
            <div className="text-xs text-gray-400">/ 100</div>
          </div>
          {[
            { icon: TrendingUp, label: 'Confidence', value: `${avgConfidence}%`, color: getScoreColor(avgConfidence) },
            { icon: Clock, label: 'Avg Speed', value: `${avgSpeed}`, sub: 'WPM', color: avgSpeed >= 120 && avgSpeed <= 160 ? 'text-green-600' : 'text-yellow-600' },
            { icon: MessageSquare, label: 'Filler Words', value: `${totalFillers}`, color: totalFillers < 10 ? 'text-green-600' : 'text-yellow-600' },
            { icon: Target, label: 'STAR Score', value: `${avgStarScore}%`, color: getScoreColor(avgStarScore) },
          ].map(({ icon: Icon, label, value, sub, color }) => (
            <div key={label} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
              <div className="flex items-center gap-1.5 mb-2">
                <Icon className="w-4 h-4 text-gray-400" />
                <span className="text-xs font-medium text-gray-500">{label}</span>
              </div>
              <div className={`text-2xl font-bold ${color}`}>{value}</div>
              {sub && <div className="text-xs text-gray-400">{sub}</div>}
            </div>
          ))}
        </div>

        {/* Actions */}
        <div className="flex gap-3 mb-8">
          <button
            onClick={handleDownloadPDF}
            disabled={isGeneratingPDF}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg shadow-blue-200 disabled:opacity-50"
          >
            {isGeneratingPDF ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <FileDown className="w-5 h-5" />
            )}
            {isGeneratingPDF ? 'Generating...' : 'Download Scorecard PDF'}
          </button>
          <button
            onClick={onRestart}
            className="flex items-center gap-2 px-6 py-3 bg-white text-gray-700 font-semibold rounded-xl border border-gray-200 hover:bg-gray-50 transition-all"
          >
            <RotateCcw className="w-5 h-5" />
            New Interview
          </button>
        </div>

        {/* Question Results */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-blue-600" />
            Question-by-Question Analysis
          </h2>

          {results.map((result, index) => {
            const isExpanded = expandedQuestion === index;
            const { analysis } = result;
            const speedBadge = getSpeedBadge(analysis.speakingSpeed.rating);

            return (
              <div
                key={index}
                className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden"
              >
                {/* Collapsed Header */}
                <button
                  onClick={() => setExpandedQuestion(isExpanded ? null : index)}
                  className="w-full px-6 py-5 flex items-center justify-between text-left hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                    <div className={`flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm ${getScoreBg(analysis.confidence.score)} ${getScoreColor(analysis.confidence.score)}`}>
                      {analysis.confidence.score}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-blue-50 text-blue-600">
                          {result.question.category}
                        </span>
                      </div>
                      <p className="text-sm text-gray-800 truncate">
                        {result.question.question}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 ml-4">
                    <span className={`text-xs font-medium px-2 py-1 rounded-full ${speedBadge.bg}`}>
                      {analysis.speakingSpeed.wordsPerMinute} WPM
                    </span>
                    <span className="text-xs text-gray-400">
                      {analysis.fillerWords.totalFillerWords} fillers
                    </span>
                    {isExpanded ? (
                      <ChevronUp className="w-5 h-5 text-gray-400" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-gray-400" />
                    )}
                  </div>
                </button>

                {/* Expanded Content */}
                {isExpanded && (
                  <div className="px-6 pb-6 border-t border-gray-100">
                    <div className="pt-4 space-y-6">
                      {/* Transcription */}
                      <div>
                        <h4 className="text-sm font-semibold text-gray-700 mb-2">Your Response</h4>
                        <p className="text-sm text-gray-600 bg-gray-50 rounded-xl p-4 leading-relaxed">
                          {analysis.transcription}
                        </p>
                      </div>

                      {/* Metrics Grid */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        <div className="bg-gray-50 rounded-xl p-3">
                          <div className="text-xs text-gray-500 mb-1">Confidence</div>
                          <div className={`text-xl font-bold ${getScoreColor(analysis.confidence.score)}`}>
                            {analysis.confidence.score}%
                          </div>
                          <div className="text-xs text-gray-400 capitalize">{analysis.confidence.rating}</div>
                        </div>
                        <div className="bg-gray-50 rounded-xl p-3">
                          <div className="text-xs text-gray-500 mb-1">Speaking Speed</div>
                          <div className={`text-xl font-bold ${speedBadge.bg.includes('green') ? 'text-green-600' : 'text-yellow-600'}`}>
                            {analysis.speakingSpeed.wordsPerMinute}
                          </div>
                          <div className="text-xs text-gray-400">words/min</div>
                        </div>
                        <div className="bg-gray-50 rounded-xl p-3">
                          <div className="text-xs text-gray-500 mb-1">Filler Words</div>
                          <div className={`text-xl font-bold ${analysis.fillerWords.totalFillerWords < 5 ? 'text-green-600' : 'text-yellow-600'}`}>
                            {analysis.fillerWords.totalFillerWords}
                          </div>
                          <div className="text-xs text-gray-400">{analysis.fillerWords.fillerWordPercentage}% of words</div>
                        </div>
                        <div className="bg-gray-50 rounded-xl p-3">
                          <div className="text-xs text-gray-500 mb-1">STAR Score</div>
                          <div className={`text-xl font-bold ${getScoreColor(analysis.starAnalysis.score)}`}>
                            {analysis.starAnalysis.score}%
                          </div>
                          <div className="text-xs text-gray-400">format compliance</div>
                        </div>
                      </div>

                      {/* Filler Words Breakdown */}
                      {Object.keys(analysis.fillerWords.fillerWordCounts).length > 0 && (
                        <div>
                          <h4 className="text-sm font-semibold text-gray-700 mb-2">Filler Words Detected</h4>
                          <div className="flex flex-wrap gap-2">
                            {Object.entries(analysis.fillerWords.fillerWordCounts).map(([word, count]) => (
                              <span key={word} className="px-3 py-1 bg-orange-50 text-orange-700 rounded-full text-sm">
                                &ldquo;{word}&rdquo; × {count}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Speed Feedback */}
                      <div>
                        <h4 className="text-sm font-semibold text-gray-700 mb-2">Speaking Pace</h4>
                        <p className="text-sm text-gray-600">{analysis.speakingSpeed.feedback}</p>
                      </div>

                      {/* STAR Analysis */}
                      <div>
                        <h4 className="text-sm font-semibold text-gray-700 mb-3">STAR Format Analysis</h4>
                        <div className="grid grid-cols-4 gap-2 mb-4">
                          {[
                            { label: 'Situation', has: analysis.starAnalysis.hasSituation },
                            { label: 'Task', has: analysis.starAnalysis.hasTask },
                            { label: 'Action', has: analysis.starAnalysis.hasAction },
                            { label: 'Result', has: analysis.starAnalysis.hasResult },
                          ].map(({ label, has }) => (
                            <div
                              key={label}
                              className={`flex items-center gap-2 p-3 rounded-xl ${
                                has ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
                              }`}
                            >
                              {has ? (
                                <CheckCircle2 className="w-4 h-4 text-green-600" />
                              ) : (
                                <XCircle className="w-4 h-4 text-red-500" />
                              )}
                              <span className={`text-sm font-medium ${has ? 'text-green-700' : 'text-red-700'}`}>
                                {label}
                              </span>
                            </div>
                          ))}
                        </div>

                        {analysis.starAnalysis.suggestions.length > 0 && (
                          <div className="bg-blue-50 rounded-xl p-4">
                            <h5 className="text-sm font-semibold text-blue-800 mb-2">Improvement Suggestions</h5>
                            <ul className="space-y-2">
                              {analysis.starAnalysis.suggestions.map((suggestion, i) => (
                                <li key={i} className="text-sm text-blue-700 flex items-start gap-2">
                                  <span className="text-blue-400 mt-1">•</span>
                                  {suggestion}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
