
import React from 'react';
import type { Recommendation } from '../types';

interface RecommendationCardProps {
  recommendation: Recommendation;
}

const StarRating: React.FC<{ rating: number }> = ({ rating }) => {
  const fullStars = Math.floor(rating);
  const halfStar = rating % 1 !== 0;
  const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);

  return (
    <div className="flex items-center">
      {[...Array(fullStars)].map((_, i) => (
        <svg key={`full-${i}`} className="w-5 h-5 text-amber-400" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
      ))}
      {halfStar && (
        <svg className="w-5 h-5 text-amber-400" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /><path d="M10 4.165v11.67l-2.13-1.545a1 1 0 00-1.175 0L4.5 16.34V4.165l1.07 3.292a1 1 0 00.95.69h3.462a1 1 0 00.95-.69L10 4.165z" clipRule="evenodd" fill="lightgray" /></svg>
      )}
      {[...Array(emptyStars)].map((_, i) => (
        <svg key={`empty-${i}`} className="w-5 h-5 text-gray-300" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
      ))}
    </div>
  );
};


const RecommendationCard: React.FC<RecommendationCardProps> = ({ recommendation }) => {
  const { title, author, year, genre, summary, reasoning, averageRating, purchaseLinks, coverImageUrl } = recommendation;

  return (
    <div className="bg-white rounded-lg shadow-md border border-brand-secondary/50 overflow-hidden transition-shadow duration-300 hover:shadow-xl">
      <div className="flex flex-col md:flex-row">
        <div className="md:w-1/3 flex-shrink-0">
          <img 
            className="h-full w-full object-cover" 
            src={coverImageUrl} 
            alt={`Cover of ${title}`} 
          />
        </div>
        <div className="p-6 flex flex-col justify-between flex-grow">
          <div>
            <div className="text-sm font-semibold uppercase tracking-wide text-brand-primary">{genre} &middot; {year}</div>
            <h3 className="mt-1 text-2xl font-serif font-bold text-brand-text leading-tight">{title}</h3>
            <p className="mt-1 text-md text-brand-text/80">by {author}</p>
            <div className="mt-2 flex items-center gap-2">
              <StarRating rating={averageRating} />
              <span className="text-brand-text/60 font-semibold">{averageRating.toFixed(1)}/5.0</span>
            </div>

            <p className="mt-4 text-brand-text/90 leading-relaxed">{summary}</p>
            
            <div className="mt-4 p-4 bg-brand-bg rounded-md border-l-4 border-brand-accent">
              <h4 className="font-semibold text-brand-text">Why you'll like it:</h4>
              <p className="mt-1 text-brand-text/80 italic">"{reasoning}"</p>
            </div>
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            {purchaseLinks.map(link => (
              <a 
                key={link.storeName} 
                href={link.url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-brand-text hover:bg-black focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-primary transition-colors"
              >
                Buy on {link.storeName}
              </a>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecommendationCard;
