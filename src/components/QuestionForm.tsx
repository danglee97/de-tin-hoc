import React, { useState, useEffect, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { EducationalLevel, ExamPeriod } from '../types';
import { EDUCATIONAL_LEVELS, GRADES_BY_LEVEL, EXAM_PERIODS, PRIMARY_EXAM_PERIODS, LESSONS_BY_GRADE } from '../constants';
import { ExamGenerationParams } from '../services/geminiService';
import { SpinnerIcon, FileTextIcon, UploadCloudIcon } from './icons';

interface QuestionFormProps {
  onSubmit: (params: Omit<ExamGenerationParams, 'subject'>) => void;
  isLoading: boolean;
}

// Helper to convert a file to a base64 string
const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const base64String = (reader.result as string).split(',')[1];
      resolve(base64String);
    };
    reader.onerror = error => reject(error);
  });
};

// Helper to read a text file's content
const fileToText = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsText(file);
    reader.onload = () => {
      resolve(reader.result as string);
    };
    reader.onerror = error => reject(error);
  });
};


export const QuestionForm: React.FC<QuestionFormProps> = ({ onSubmit, isLoading }) => {
  const [level, setLevel] = useState<EducationalLevel>(EducationalLevel.SECONDARY);
  const [grade, setGrade] = useState<string>(GRADES_BY_LEVEL[level][0]);
  const [period, setPeriod] = useState<ExamPeriod>(ExamPeriod.MID_TERM_1);
  const [duration, setDuration] = useState<number>(45);
  const [prompt, setPrompt] = useState('');
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<{ file: File, src: string }[]>([]);

  useEffect(() => {
    // Reset grade when level changes
    setGrade(GRADES_BY_LEVEL[level][0]);
    
    // Determine the valid exam periods for the current level
    const currentValidPeriods = level === EducationalLevel.PRIMARY ? PRIMARY_EXAM_PERIODS : EXAM_PERIODS;
    
    // Check if the currently selected period is valid for the new level
    const isCurrentPeriodValid = currentValidPeriods.some(p => p.value === period);

    // If not valid (e.g., switched to Primary while Mid-term was selected), reset to the first valid period
    if (!isCurrentPeriodValid) {
      setPeriod(currentValidPeriods[0].value as ExamPeriod);
    }
  }, [level, period]);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    setUploadedFiles(prev => [...prev, ...acceptedFiles]);
    acceptedFiles.forEach(file => {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => {
            setPreviews(prev => [...prev, { file, src: e.target?.result as string }]);
        };
        reader.readAsDataURL(file);
      } else {
        // For non-image files, use a placeholder or generic icon identifier
        setPreviews(prev => [...prev, { file, src: 'file_icon' }]);
      }
    });
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/png': ['.png'],
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/gif': ['.gif'],
      'text/plain': ['.txt'],
      'application/pdf': ['.pdf'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
    }
  });
  
  const removeFile = (fileToRemove: File, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent opening file dialog when clicking remove button
    setUploadedFiles(prev => prev.filter(f => f !== fileToRemove));
    setPreviews(prev => prev.filter(p => p.file !== fileToRemove));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const imageParts: { mimeType: string; data: string }[] = [];
    let aggregatedTextContent = '';

    await Promise.all(uploadedFiles.map(async (file) => {
      if (file.type.startsWith('image/')) {
        const data = await fileToBase64(file);
        imageParts.push({ mimeType: file.type, data });
      } else if (file.type === 'text/plain') {
        const text = await fileToText(file);
        aggregatedTextContent += `\n\n--- Content from ${file.name} ---\n${text}`;
      }
      // Note: PDF/DOCX content extraction is not handled here, AI will just be notified of their presence if needed.
    }));
    
    const lessonsForGrade = LESSONS_BY_GRADE[grade] || [];
    const lessonsString = `Toàn bộ chương trình học, bao gồm các chủ đề: ${lessonsForGrade.join(', ')}`;

    onSubmit({
      level,
      grade,
      period,
      duration,
      lessons: lessonsString,
      lessonPlanContent: aggregatedTextContent.trim(),
      prompt,
      images: imageParts,
    });
  };
  
  const availablePeriods = level === EducationalLevel.PRIMARY ? PRIMARY_EXAM_PERIODS : EXAM_PERIODS;

  return (
    <form onSubmit={handleSubmit} className="space-y-6 p-6 bg-white rounded-[var(--border-radius-lg)] shadow-[var(--shadow-md)] border border-slate-200">
      <h2 className="text-xl font-bold text-slate-800 border-b border-slate-200 pb-4">Tùy chọn tạo đề</h2>

      <fieldset className="space-y-4">
        <legend className="text-sm font-semibold text-slate-500 mb-2">Thông tin chung</legend>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="level" className="block text-sm font-medium text-slate-700 mb-1">Cấp học</label>
            <select
              id="level"
              value={level}
              onChange={(e) => setLevel(e.target.value as EducationalLevel)}
              className="w-full p-2 border rounded-[var(--border-radius-md)]"
            >
              {EDUCATIONAL_LEVELS.map(l => <option key={l.value} value={l.value}>{l.label}</option>)}
            </select>
          </div>
          <div>
            <label htmlFor="grade" className="block text-sm font-medium text-slate-700 mb-1">Lớp</label>
            <select
              id="grade"
              value={grade}
              onChange={(e) => setGrade(e.target.value)}
              className="w-full p-2 border rounded-[var(--border-radius-md)]"
            >
              {GRADES_BY_LEVEL[level].map(g => <option key={g} value={g}>{`Lớp ${g}`}</option>)}
            </select>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="period" className="block text-sm font-medium text-slate-700 mb-1">Kì kiểm tra</label>
            <select
              id="period"
              value={period}
              onChange={(e) => setPeriod(e.target.value as ExamPeriod)}
              className="w-full p-2 border rounded-[var(--border-radius-md)]"
            >
              {availablePeriods.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
            </select>
          </div>
          <div>
            <label htmlFor="duration" className="block text-sm font-medium text-slate-700 mb-1">Thời gian (phút)</label>
            <input
              type="number"
              id="duration"
              value={duration}
              onChange={(e) => setDuration(parseInt(e.target.value, 10))}
              min="15"
              max="120"
              step="5"
              className="w-full p-2 border rounded-[var(--border-radius-md)]"
            />
          </div>
        </div>
      </fieldset>
      
      <fieldset className="space-y-2">
         <legend className="text-sm font-semibold text-slate-500">Nội dung bổ sung</legend>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Tải lên giáo án hoặc ảnh (tùy chọn)
          </label>
          <div {...getRootProps()} className={`mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-slate-300 border-dashed rounded-md cursor-pointer hover:border-[var(--color-primary-600)] transition-colors ${isDragActive ? 'border-[var(--color-primary-600)] bg-[var(--color-primary-50)]' : ''}`}>
            <input {...getInputProps()} />
            <div className="space-y-1 text-center">
              <UploadCloudIcon className="mx-auto h-10 w-10 text-slate-400" />
               <p className="text-sm text-slate-500">
                  Kéo thả tệp, hoặc <span className="font-medium text-[var(--color-primary-600)]">duyệt tệp</span>
               </p>
              <p className="text-xs text-slate-400">Hỗ trợ: Ảnh, TXT, PDF, DOCX</p>
            </div>
          </div>
          {previews.length > 0 && (
            <div className="mt-3 grid grid-cols-2 sm:grid-cols-3 gap-3">
              {previews.map((p, index) => (
                <div key={index} className="relative group border border-slate-200 rounded-md p-1 shadow-sm">
                   {p.src === 'file_icon' ? (
                    <div className="flex flex-col items-center justify-center h-20 bg-slate-50 rounded-sm">
                      <FileTextIcon className="w-6 h-6 text-slate-500" />
                      <span className="text-xs text-slate-500 mt-1 px-1 truncate w-full text-center">{p.file.name}</span>
                    </div>
                  ) : (
                    <img src={p.src} alt={`preview ${p.file.name}`} className="h-20 w-full object-cover rounded-sm" />
                  )}
                  <button
                    type="button"
                    onClick={(e) => removeFile(p.file, e)}
                    className="absolute -top-1.5 -right-1.5 bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-all scale-75 group-hover:scale-100"
                    title="Xóa tệp"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
        <div>
          <label htmlFor="prompt" className="block text-sm font-medium text-slate-700 mb-1">
            Yêu cầu thêm (tùy chọn)
          </label>
          <textarea
            id="prompt"
            rows={3}
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Ví dụ: Tạo 10 câu trắc nghiệm và 2 câu tự luận..."
            className="w-full p-2 border rounded-[var(--border-radius-md)]"
          />
        </div>
      </fieldset>

      <button
        type="submit"
        disabled={isLoading}
        className="w-full flex justify-center items-center px-4 py-3 bg-[var(--color-primary-600)] text-[var(--color-text-on-primary)] rounded-[var(--border-radius-md)] font-semibold shadow-sm hover:bg-[var(--color-primary-700)] transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--color-ring)] focus:ring-offset-2 disabled:bg-[var(--color-disabled-bg)] disabled:text-[var(--color-disabled-text)] disabled:cursor-not-allowed"
      >
        {isLoading ? (
          <>
            <SpinnerIcon className="animate-spin -ml-1 mr-3 h-5 w-5" />
            Đang tạo đề...
          </>
        ) : (
          'Tạo đề thi bằng AI'
        )}
      </button>
    </form>
  );
};