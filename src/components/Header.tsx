import React from 'react';
import { LogoIcon } from './icons';

export const Header: React.FC = () => {
  return (
    <header className="bg-white shadow-sm border-b border-slate-200 sticky top-0 z-10">
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-3">
            <LogoIcon className="w-8 h-8 text-[var(--color-primary-600)]" />
            <div>
              <h1 className="text-xl font-bold text-slate-800">
                Ngân hàng Đề Tin học - Minh Đăng IT
              </h1>
              <p className="text-xs text-slate-500 hidden sm:block">
                Tạo đề kiểm tra thông minh theo chuẩn GDPT 2018
              </p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};