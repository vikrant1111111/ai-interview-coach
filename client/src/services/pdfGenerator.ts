import { jsPDF } from 'jspdf';

interface ScorecardData {
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

export function generateScorecardPDF(data: ScorecardData): void {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 20;
  const contentWidth = pageWidth - margin * 2;
  let y = 20;

  const addPageIfNeeded = (requiredSpace: number) => {
    if (y + requiredSpace > doc.internal.pageSize.getHeight() - 20) {
      doc.addPage();
      y = 20;
    }
  };

  // Header
  doc.setFillColor(37, 99, 235);
  doc.rect(0, 0, pageWidth, 45, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.text('Interview Scorecard', margin, 22);

  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  doc.text(`${data.role} | ${data.experienceLevel} | ${data.interviewType}`, margin, 32);
  doc.text(data.date, margin, 40);

  y = 55;
  doc.setTextColor(0, 0, 0);

  // Overall Score
  doc.setFillColor(249, 250, 251);
  doc.roundedRect(margin, y, contentWidth, 30, 3, 3, 'F');

  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Overall Score', margin + 10, y + 13);

  const scoreColor = data.overallScore >= 70
    ? [22, 163, 74] as const
    : data.overallScore >= 50
      ? [234, 179, 8] as const
      : [220, 38, 38] as const;
  doc.setTextColor(scoreColor[0], scoreColor[1], scoreColor[2]);
  doc.setFontSize(28);
  doc.text(`${data.overallScore}/100`, pageWidth - margin - 10, y + 20, { align: 'right' });
  doc.setTextColor(0, 0, 0);

  y += 40;

  // Summary Stats
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Summary', margin, y);
  y += 8;

  const stats = [
    ['Questions', data.summary.totalQuestions.toString()],
    ['Avg Confidence', `${data.summary.averageConfidence}%`],
    ['Avg Speaking Speed', `${data.summary.averageSpeakingSpeed} WPM`],
    ['Total Filler Words', data.summary.totalFillerWords.toString()],
    ['Avg STAR Score', `${data.summary.averageStarScore}%`],
  ];

  const colWidth = contentWidth / stats.length;
  stats.forEach(([label, value], i) => {
    const x = margin + i * colWidth;
    doc.setFillColor(239, 246, 255);
    doc.roundedRect(x + 1, y, colWidth - 2, 22, 2, 2, 'F');
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 100, 100);
    doc.text(label, x + colWidth / 2, y + 8, { align: 'center' });
    doc.setFontSize(13);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(37, 99, 235);
    doc.text(value, x + colWidth / 2, y + 18, { align: 'center' });
  });

  doc.setTextColor(0, 0, 0);
  y += 32;

  // Strengths & Improvements
  addPageIfNeeded(60);
  const halfWidth = (contentWidth - 5) / 2;

  doc.setFillColor(240, 253, 244);
  doc.roundedRect(margin, y, halfWidth, 8 + data.summary.strengths.length * 7, 2, 2, 'F');
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(22, 163, 74);
  doc.text('Strengths', margin + 5, y + 7);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(0, 0, 0);
  data.summary.strengths.forEach((s, i) => {
    const lines = doc.splitTextToSize(`+ ${s}`, halfWidth - 10);
    doc.text(lines[0], margin + 5, y + 14 + i * 7);
  });

  doc.setFillColor(254, 242, 242);
  doc.roundedRect(margin + halfWidth + 5, y, halfWidth, 8 + data.summary.improvements.length * 7, 2, 2, 'F');
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(220, 38, 38);
  doc.text('Areas for Improvement', margin + halfWidth + 10, y + 7);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(0, 0, 0);
  data.summary.improvements.forEach((s, i) => {
    const lines = doc.splitTextToSize(`- ${s}`, halfWidth - 10);
    doc.text(lines[0], margin + halfWidth + 10, y + 14 + i * 7);
  });

  y += 15 + Math.max(data.summary.strengths.length, data.summary.improvements.length) * 7;

  // Question Details
  data.questions.forEach((q, index) => {
    addPageIfNeeded(70);

    doc.setFillColor(249, 250, 251);
    doc.roundedRect(margin, y, contentWidth, 60, 3, 3, 'F');

    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(37, 99, 235);
    doc.text(`Q${index + 1}: ${q.category}`, margin + 5, y + 8);

    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(0, 0, 0);
    const questionLines = doc.splitTextToSize(q.question, contentWidth - 10);
    doc.text(questionLines.slice(0, 2), margin + 5, y + 15);

    const metricsY = y + 28;
    const metrics = [
      ['Confidence', `${q.confidenceScore}%`],
      ['Speed', `${q.speakingSpeed} WPM`],
      ['Fillers', q.fillerWordCount.toString()],
      ['STAR', `${q.starScore}%`],
    ];

    const metricWidth = (contentWidth - 10) / metrics.length;
    metrics.forEach(([label, value], i) => {
      const mx = margin + 5 + i * metricWidth;
      doc.setFontSize(8);
      doc.setTextColor(100, 100, 100);
      doc.text(label, mx, metricsY);
      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(0, 0, 0);
      doc.text(value, mx, metricsY + 7);
      doc.setFont('helvetica', 'normal');
    });

    doc.setFontSize(8);
    doc.setTextColor(80, 80, 80);
    const answerLines = doc.splitTextToSize(
      `Answer: ${q.transcription}`,
      contentWidth - 10
    );
    doc.text(answerLines.slice(0, 3), margin + 5, metricsY + 15);

    y += 65;
  });

  // Footer
  addPageIfNeeded(20);
  doc.setFontSize(8);
  doc.setTextColor(150, 150, 150);
  doc.text(
    'Generated by AI Interview Coach',
    pageWidth / 2,
    doc.internal.pageSize.getHeight() - 10,
    { align: 'center' }
  );

  doc.save(`interview-scorecard-${Date.now()}.pdf`);
}
