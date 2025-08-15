
import React from 'react';

const Header: React.FC = () => {
  return (
    <header className="text-center border-b-2 border-brand-secondary pb-6">
       <div className="flex items-center justify-center gap-3">
         <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-brand-primary"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>
        <h1 className="text-4xl font-serif font-bold text-brand-text">AI Book Recommender</h1>
       </div>
      <p className="mt-2 text-lg text-brand-text/70">
        Your personal literary guide, powered by Goodreads and AI.
      </p>
    </header>
  );
};

export default Header;
