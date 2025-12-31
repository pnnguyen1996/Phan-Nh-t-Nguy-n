
export interface SubQuestion {
  id: string;
  part: string; // e.g., 'a', 'b', 'i'
  text: string;
  points: number;
  correctAnswer: string;
}

export interface Question {
  id: string;
  number: number;
  mainText: string;
  subQuestions: SubQuestion[];
}

export interface Exam {
  id: string;
  title: string;
  durationMinutes: number;
  questions: Question[];
}

export interface StudentInfo {
  name: string;
  className: string;
}

export interface AnswerState {
  [subQuestionId: string]: string;
}

export interface SubmittedAnswers {
  [questionId: string]: boolean;
}

export enum AppMode {
  LOGIN = 'LOGIN',
  TEACHER_DASHBOARD = 'TEACHER_DASHBOARD',
  STUDENT_EXAM = 'STUDENT_EXAM',
  RESULTS = 'RESULTS'
}
