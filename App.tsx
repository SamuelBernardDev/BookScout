import React, { useState, useEffect, useCallback } from 'react';
import { getReadBooks } from './services/goodreadsService';
import { getRecommendations } from './services/geminiService';
import type { Book, Recommendation } from './types';
import Header from './components/Header';
import UserInput from './components/UserInput';
import ReadShelf from './components/ReadShelf';
import RecommendationList from './components/RecommendationList';
import ErrorMessage from './components/ErrorMessage';
import Loader from './components/Loader';

const App: React.FC = () => {
  const [readBooks, setReadBooks] = useState<Book[]>([]);
  const [booksLoading, setBooksLoading] = useState<boolean>(true);
  const [booksError, setBooksError] = useState<string | null>(null);

  const [userQuery, setUserQuery] = useState<string>('');
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBooks = async () => {
      setBooksLoading(true);
      setBooksError(null);
      try {
        const books = await getReadBooks();
        setReadBooks(books);
        if (books.length === 0) {
            setBooksError("No books found on this page. Make sure you are on one of your Goodreads book shelves (e.g., 'read', 'currently-reading').");
        }
      } catch (err) {
        if (err instanceof Error) {
          setBooksError(err.message);
        } else {
          setBooksError("An unknown error occurred while fetching your books.");
        }
      } finally {
        setBooksLoading(false);
      }
    };

    fetchBooks();
  }, []);

  const handleSearch = useCallback(async () => {
    if (!userQuery.trim()) {
      setError('Please tell me what kind of book you are looking for.');
      return;
    }
    if (readBooks.length === 0 && !booksError) {
      setError('Your reading history is empty. Cannot generate recommendations.');
      return;
    }
     if (booksError) {
      setError(`Cannot search without your reading history. Please resolve the error: ${booksError}`);
      return;
    }


    setIsLoading(true);
    setError(null);
    setRecommendations([]);

    try {
      const results = await getRecommendations(readBooks, userQuery);
      setRecommendations(results);
    } catch (err) {
      console.error('Error getting recommendations:', err);
      setError('Sorry, I had trouble finding recommendations. The AI might be busy. Please try again in a moment.');
    } finally {
      setIsLoading(false);
    }
  }, [userQuery, readBooks, booksError]);

  return (
    <div className="h-full bg-brand-bg text-brand-text font-sans p-4 sm:p-6 lg:p-8 w-full overflow-y-auto">
      <div className="max-w-7xl mx-auto">
        <Header />
        <main className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1 space-y-6">
            <UserInput
              value={userQuery}
              onChange={(e) => setUserQuery(e.target.value)}
              onSubmit={handleSearch}
              isLoading={isLoading}
            />
            <ReadShelf books={readBooks} isLoading={booksLoading} error={booksError} />
          </div>

          <div className="lg:col-span-2">
            {isLoading && <Loader />}
            {error && <ErrorMessage message={error} />}
            {!isLoading && !error && recommendations.length === 0 && (
              <div className="flex flex-col items-center justify-center h-full bg-brand-secondary/50 rounded-lg p-8 text-center">
                 <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="text-brand-primary/50 mb-4"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v15H6.5A2.5 2.5 0 0 1 4 14.5v-10A2.5 2.5 0 0 1 6.5 2z"/><circle cx="14" cy="8" r="2"/><path d="m16 10 2 2"/></svg>
                <h3 className="text-xl font-serif text-brand-text">Discover Your Next Favorite Book</h3>
                <p className="text-brand-text/70 mt-2 max-w-md">
                  Your personalized recommendations will appear here. Tell us what you're in the mood for to get started!
                </p>
              </div>
            )}
            {recommendations.length > 0 && <RecommendationList recommendations={recommendations} />}
          </div>
        </main>
      </div>
    </div>
  );
};

export default App;
