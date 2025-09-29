export enum EducationalLevel {
  PRIMARY = 'PRIMARY',
  SECONDARY = 'SECONDARY',
  HIGH_SCHOOL = 'HIGH_SCHOOL',
}

export enum QuestionType {
  MULTIPLE_CHOICE = 'MULTIPLE_CHOICE',
  TRUE_FALSE = 'TRUE_FALSE',
  SHORT_ANSWER = 'SHORT_ANSWER',
}

export enum ExamPeriod {
  MID_TERM_1 = 'MID_TERM_1',
  END_TERM_1 = 'END_TERM_1',
  MID_TERM_2 = 'MID_TERM_2',
  END_TERM_2 = 'END_TERM_2',
}

export interface ExamQuestion {
  question_id: string;
  question_text: string;
  question_type: string;
  options?: string[];
}

export interface ExamAnswer {
  question_id: string;
  answer: string;
  explanation?: string;
}

export interface GeneratedExam {
  matrix: string;
  specification: string;
  exam: ExamQuestion[];
  answer_key: ExamAnswer[];
}


export interface MultipleChoiceQuestion {
  question: string;
  options: string[];
  answer: string;
}

export interface TrueFalseQuestion {
  question: string;
  answer: boolean;
}

export interface ShortAnswerQuestion {
  question: string;
  answer: string;
}

export type Question = MultipleChoiceQuestion | TrueFalseQuestion | ShortAnswerQuestion;
