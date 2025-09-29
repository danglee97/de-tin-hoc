import React, { useState } from 'react';
import { Question, MultipleChoiceQuestion, TrueFalseQuestion } from '../types';
import { EyeIcon, EyeOffIcon } from './icons';

interface QuestionCardProps {
  question: Question;
  index: number;
}

const isMultipleChoice = (q: Question): q is MultipleChoiceQuestion => {
    return 'options' in q;
};

const isTrueFalse = (q: Question): q is TrueFalseQuestion => {
    return typeof q.answer === 'boolean';
};

export const QuestionCard: React.FC<QuestionCardProps> = ({ question, index }) => {
  const [isAnswerVisible, setIsAnswerVisible] = useState(false);

  const renderAnswer = () => {
    const answerTextClass = "text-[var(--color-success)] font-bold";
    if (isMultipleChoice(question)) {
      return <p className={answerTextClass}>{question.answer}</p>;
    }
    if (isTrueFalse(question)) {
      return <p className={answerTextClass}>{question.answer ? 'Đúng' : 'Sai'}</p>;
    }
    return <p className={answerTextClass}>{question.answer}</p>;
  };
  
  const getOptionClass = (option: string) => {
    if (!isAnswerVisible || !isMultipleChoice(question)) return "border-slate-200 hover:bg-slate-50";
    
    const isCorrect = option.replace(/^[A-ZĐ]\.\s*/, '') === question.answer.replace(/^[A-ZĐ]\.\s*/, '') || option === question.answer;
    return isCorrect 
      ? "border-green-300 bg-[var(--color-success-light)] ring-1 ring-green-200" 
      : "border-slate-200 hover:bg-slate-50";
  }

  return (
    <div className="bg-white p-4 rounded-lg border border-slate-200">
      <div className="flex justify-between items-start gap-4">
        <div className="text-base text-slate-800 leading-relaxed">
          <span className="text-[var(--color-primary-600)] font-bold mr-2">Câu {index}:</span>
          {question.question}
        </div>
        <button
          onClick={() => setIsAnswerVisible(!isAnswerVisible)}
          className="p-1.5 rounded-full hover:bg-slate-100 text-slate-500 hover:text-slate-800 flex-shrink-0 transition-colors"
          title={isAnswerVisible ? "Ẩn đáp án" : "Hiện đáp án"}
          aria-label={isAnswerVisible ? "Ẩn đáp án" : "Hiện đáp án"}
        >
          {isAnswerVisible ? <EyeOffIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
        </button>
      </div>

      {isMultipleChoice(question) && (
        <div className="space-y-2 mt-3 pl-7">
          {question.options.map((option, i) => (
            <div key={i} className={`p-2 border rounded-md transition-colors text-sm ${getOptionClass(option)}`}>
              <span className="font-mono mr-3 text-slate-500">{String.fromCharCode(65 + i)}.</span>
              <span className="text-slate-700">{option.replace(/^[A-ZĐ]\.\s*/, '')}</span>
            </div>
          ))}
        </div>
      )}

      {isAnswerVisible && (
        <div className="mt-3 pt-3 border-t border-dashed border-slate-200">
          <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Đáp án</h4>
          {renderAnswer()}
        </div>
      )}
    </div>
  );
};