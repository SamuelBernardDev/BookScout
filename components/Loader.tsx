
import React from 'react';

const SkeletonCard: React.FC = () => (
    <div className="bg-white rounded-lg shadow-md border border-brand-secondary/50 overflow-hidden">
        <div className="flex flex-col md:flex-row animate-pulse">
            <div className="md:w-1/3 flex-shrink-0 bg-gray-300 h-96 md:h-auto"></div>
            <div className="p-6 flex flex-col justify-between flex-grow w-full">
                <div>
                    <div className="h-4 bg-gray-300 rounded w-1/4"></div>
                    <div className="h-8 bg-gray-300 rounded w-3/4 mt-2"></div>
                    <div className="h-4 bg-gray-300 rounded w-1/2 mt-2"></div>
                    <div className="h-6 bg-gray-300 rounded w-1/3 mt-3"></div>
                    <div className="space-y-2 mt-5">
                        <div className="h-4 bg-gray-300 rounded"></div>
                        <div className="h-4 bg-gray-300 rounded"></div>
                        <div className="h-4 bg-gray-300 rounded w-5/6"></div>
                    </div>
                    <div className="mt-4 p-4 bg-gray-100 rounded-md">
                        <div className="h-4 bg-gray-300 rounded w-1/3 mb-2"></div>
                        <div className="h-4 bg-gray-300 rounded"></div>
                    </div>
                </div>
                <div className="mt-6 flex flex-wrap gap-3">
                    <div className="h-10 bg-gray-300 rounded w-32"></div>
                    <div className="h-10 bg-gray-300 rounded w-32"></div>
                </div>
            </div>
        </div>
    </div>
);


const Loader: React.FC = () => {
  return (
    <div className="space-y-6">
       <h2 className="text-3xl font-serif text-brand-text pb-2 border-b-2 border-brand-secondary">Thinking...</h2>
      <SkeletonCard />
      <SkeletonCard />
    </div>
  );
};

export default Loader;
