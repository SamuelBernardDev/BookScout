
import React from 'react';

interface UserInputProps {
  value: string;
  onChange: (event: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onSubmit: () => void;
  isLoading: boolean;
}

const UserInput: React.FC<UserInputProps> = ({ value, onChange, onSubmit, isLoading }) => {
  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      onSubmit();
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-brand-secondary/50">
      <label htmlFor="user-query" className="block text-lg font-serif font-semibold text-brand-text mb-2">
        What are you in the mood for?
      </label>
      <p className="text-sm text-brand-text/60 mb-4">
        e.g., "A fast-paced sci-fi thriller with a strong female lead" or "A cozy fantasy like 'The Name of the Wind'."
      </p>
      <textarea
        id="user-query"
        rows={4}
        className="w-full p-3 border border-brand-secondary rounded-md focus:ring-2 focus:ring-brand-primary focus:border-brand-primary transition duration-200 resize-none"
        placeholder="Tell me what you're looking for..."
        value={value}
        onChange={onChange}
        onKeyDown={handleKeyDown}
        disabled={isLoading}
      />
      <button
        onClick={onSubmit}
        disabled={isLoading}
        className="mt-4 w-full bg-brand-primary text-white font-bold py-3 px-4 rounded-md hover:bg-brand-accent transition-transform duration-200 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-primary disabled:bg-gray-400 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center"
      >
        {isLoading ? (
          <>
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Finding Books...
          </>
        ) : (
          'Find My Next Book'
        )}
      </button>
    </div>
  );
};

export default UserInput;
