import React, { useState } from 'react';
import { Header } from './components/Header';
import { QuestionForm } from './components/QuestionForm';
import { QuestionDisplay } from './components/QuestionDisplay';
import { GeneratedExam } from './types';
import { generateExam, ExamGenerationParams } from './services/geminiService';
import { FacebookIcon, YoutubeIcon, ZaloIcon, LogoIcon } from './components/icons';

function App() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [exam, setExam] = useState<GeneratedExam | null>(null);

  const handleFormSubmit = async (params: Omit<ExamGenerationParams, 'subject'>) => {
    setIsLoading(true);
    setError(null);
    setExam(null);
    try {
      // Hardcode subject as 'Tin học' as it's removed from the form
      const fullParams: ExamGenerationParams = { ...params, subject: 'Tin học' };
      const generatedExam = await generateExam(fullParams);
      setExam(generatedExam);
    } catch (e) {
      if (e instanceof Error) {
        setError(`Lỗi khi tạo đề thi: ${e.message}`);
      } else {
        setError('Đã xảy ra lỗi không xác định. Vui lòng thử lại.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Header />
      <main className="container mx-auto p-4 md:p-6 flex-grow w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <div className="lg:col-span-4 lg:sticky lg:top-6">
            <QuestionForm onSubmit={handleFormSubmit} isLoading={isLoading} />
          </div>
          <div className="lg:col-span-8">
            <QuestionDisplay isLoading={isLoading} error={error} exam={exam} />
          </div>
        </div>
      </main>
      <footer className="bg-white text-sm border-t border-slate-200">
        <div className="container mx-auto px-4 md:px-6 py-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center md:text-left">
            <div className="flex flex-col items-center md:items-start space-y-3">
               <div className="flex items-center space-x-3">
                <LogoIcon className="w-8 h-8 text-[var(--color-primary-600)]" />
                <span className="text-lg font-bold text-slate-800">
                  Đề Tin AI - Minh Đăng IT
                </span>
              </div>
              <p className="text-slate-500 max-w-sm">
                Ứng dụng AI tạo đề thi thông minh theo chuẩn GDPT 2018, phát triển bởi Minh Đăng IT.
              </p>
            </div>
            
            <div className="md:mx-auto">
              <h3 className="font-semibold text-slate-800 mb-3">Thông Tin Liên Hệ</h3>
              <ul className="space-y-2 text-slate-500">
                <li><a href="tel:0899977870" className="hover:text-[var(--color-primary-600)] transition-colors">Phone: 089 99 77 870</a></li>
                <li><a href="mailto:danglee@leminhdang.com" className="hover:text-[var(--color-primary-600)] transition-colors">Email: danglee@leminhdang.com</a></li>
              </ul>
            </div>

            <div className="md:ml-auto">
              <h3 className="font-semibold text-slate-800 mb-3">Kết nối với chúng tôi</h3>
              <div className="flex justify-center md:justify-start space-x-4 text-slate-500">
                <a href="https://www.facebook.com/danglee97" target="_blank" rel="noopener noreferrer" className="hover:text-[var(--color-primary-600)] transition-colors" aria-label="Facebook">
                  <FacebookIcon className="w-6 h-6" />
                </a>
                <a href="https://www.youtube.com/@dang_lee" target="_blank" rel="noopener noreferrer" className="hover:text-[var(--color-primary-600)] transition-colors" aria-label="YouTube">
                  <YoutubeIcon className="w-6 h-6" />
                </a>
                <a href="https://zaloapp.com/qr/p/xzyx8g0gmokv?src=qr" target="_blank" rel="noopener noreferrer" className="hover:text-[var(--color-primary-600)] transition-colors" aria-label="Zalo">
                   <ZaloIcon className="w-7 h-7" />
                </a>
              </div>
            </div>
          </div>
          <div className="border-t border-slate-200 mt-8 pt-6 text-center text-slate-500">
            © 2025 Minh Đăng IT. All Rights Reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;