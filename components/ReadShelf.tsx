import React from 'react';
import type { Book } from '../types';

interface ReadShelfProps {
  books: Book[];
  isLoading: boolean;
  error: string | null;
}

const ShelfLoader: React.FC = () => (
  <div className="max-h-80 overflow-y-auto pr-2">
    <ul className="space-y-3 animate-pulse">
      {[...Array(8)].map((_, i) => (
        <li key={i} className="p-3 bg-brand-bg rounded-md border border-brand-secondary">
          <div className="h-4 bg-gray-300 rounded w-3/4"></div>
          <div className="h-3 bg-gray-300 rounded w-1/2 mt-2"></div>
        </li>
      ))}
    </ul>
  </div>
);

const ReadShelf: React.FC<ReadShelfProps> = ({ books, isLoading, error }) => {
  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-brand-secondary/50">
      <h3 className="text-lg font-serif font-semibold text-brand-text mb-4">Your Reading History</h3>
      {isLoading && <ShelfLoader />}
      {error && (
         <div className="p-3 bg-red-50 border border-red-200 rounded-md text-sm text-red-700">
            <p className="font-semibold">Could not load books</p>
            <p>{error}</p>
        </div>
      )}
      {!isLoading && !error && (
         <div className="max-h-80 overflow-y-auto pr-2">
            {books.length === 0 && (
                <p className="text-sm text-brand-text/70">No books found on the current page.</p>
            )}
            <ul className="space-y-3">
            {books.map((book, index) => (
                <li key={index} className="p-3 bg-brand-bg rounded-md border border-brand-secondary">
                <p className="font-semibold text-brand-text truncate" title={book.title}>{book.title}</p>
                <p className="text-sm text-brand-text/70 truncate">{book.author}</p>
                </li>
            ))}
            </ul>
        </div>
      )}
    </div>
  );
};

export default ReadShelf;
