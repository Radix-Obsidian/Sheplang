import React from 'react';
import Image from 'next/image';
import ThemeSwitcher from './ThemeSwitcher';

const Header: React.FC = () => {
  return (
    <header className="bg-white dark:bg-gray-900 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="shrink-0 flex items-center gap-3">
              <Image
                src="/logo.png"
                alt="ShepLang Logo"
                width={32}
                height={32}
                className="h-8 w-8"
                priority
              />
              <div className="flex flex-col">
                <span className="text-xl font-bold text-gray-900 dark:text-white">ShepLang Playground</span>
                <span className="text-xs text-gray-500 dark:text-gray-400">Milestone 4 - UI Polish</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <ThemeSwitcher />
            
            {/* ShepLang Landing Page */}
            <a
              href="https://sheplang.lovable.app/"
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-2 rounded-md text-sm hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors flex items-center gap-1.5"
              title="ShepLang Landing Page"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                <polyline points="9 22 9 12 15 12 15 22" />
              </svg>
              <span className="text-xs hidden sm:inline">Home</span>
            </a>
            
            {/* VS Code Extension */}
            <a
              href="https://marketplace.visualstudio.com/items?itemName=GoldenSheepAI.sheplang-vscode"
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-2 rounded-md text-sm bg-blue-500 hover:bg-blue-600 text-white transition-colors flex items-center gap-1.5 font-medium"
              title="Install VS Code Extension"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
                <path d="M21.29 4.1L18 2.3c-.5-.3-1.2-.3-1.8 0L8.5 7.2 3.78 3.5c-.4-.3-1-.3-1.4 0l-.8.6c-.4.3-.6.8-.6 1.2v13.5c0 .5.2.9.6 1.2l.8.6c.4.3 1 .3 1.4 0l4.72-3.7 7.7 4.9c.6.3 1.3.3 1.8 0l3.29-1.8c.6-.3 1-1 1-1.7V5.8c0-.7-.4-1.4-1-1.7zM8.5 15.4L5 12.5l3.5-2.9v5.8zm9.5.9l-5-3.2 5-3.2v6.4z"/>
              </svg>
              <span className="text-xs">Install Extension</span>
            </a>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
