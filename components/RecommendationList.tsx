
import React from 'react';
import type { Recommendation } from '../types';
import RecommendationCard from './RecommendationCard';

interface RecommendationListProps {
  recommendations: Recommendation[];
}

const RecommendationList: React.FC<RecommendationListProps> = ({ recommendations }) => {
  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-serif text-brand-text pb-2 border-b-2 border-brand-secondary">Your AI Recommendations</h2>
      {recommendations.map((rec, index) => (
        <RecommendationCard key={index} recommendation={rec} />
      ))}
    </div>
  );
};

export default RecommendationList;
