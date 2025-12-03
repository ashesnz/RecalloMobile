export interface Question {
  id: string;
  text: string;
}

export interface DailyQuestion {
  id: string;
  question: string;
  answer: string | null;
  scheduledFor: string;
}

export interface QuestionResponse {
  questionId: string;
  audioUri?: string;
  transcript?: string;
}

export interface QuestionResult {
  questionId: string;
  question: string;
  grade: 'A' | 'B' | 'C' | 'D' | 'F';
  score: number; // 0-100
  feedback: string;
}

export interface TranscriptionResponse {
  transcript: string;
}

export interface EvaluationResponse {
  questionId: string;
  transcript: string;
  grade: 'A' | 'B' | 'C' | 'D' | 'F';
  score: number;
  feedback: string;
  correctAnswer?: string;
}


