import { useState, useEffect } from 'react';
import { Tooltip } from 'react-tooltip';

export default function ConfidenceBar({ label, score, description = '' }) {
  const [displayScore, setDisplayScore] = useState(0);
  const value = Math.max(0, Math.min(100, score));
  
  // Smooth animation for the score
  useEffect(() => {
    const duration = 1000; // Animation duration in ms
    const start = 0;
    const startTime = performance.now();
    
    const animate = (currentTime) => {
      const elapsedTime = currentTime - startTime;
      const progress = Math.min(elapsedTime / duration, 1);
      
      setDisplayScore(Math.floor(progress * value));
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };
    
    requestAnimationFrame(animate);
  }, [value]);
  
  // Get color based on score
  const getColorClass = (score) => {
    if (score >= 80) return 'from-green-500 to-green-400';
    if (score >= 60) return 'from-blue-500 to-blue-400';
    if (score >= 40) return 'from-yellow-500 to-yellow-400';
    return 'from-red-500 to-red-400';
  };
  
  const colorClass = getColorClass(value);
  
  return (
    <div className="mb-4 group">
      <div className="flex justify-between items-center mb-1">
        <div className="flex items-center">
          <span className="font-medium text-gray-700">{label}</span>
          {description && (
            <>
              <span 
                className="ml-2 text-gray-400 cursor-help"
                data-tooltip-id={`tooltip-${label}`}
                data-tooltip-content={description}
              >
                ⓘ
              </span>
              <Tooltip id={`tooltip-${label}`} place="top" />
            </>
          )}
        </div>
        <span className={`text-sm font-semibold ${
          value >= 80 ? 'text-green-600' : 
          value >= 60 ? 'text-blue-600' : 
          value >= 40 ? 'text-yellow-600' : 'text-red-600'
        }`}>
          {displayScore}%
        </span>
      </div>
      <div className="w-full bg-gray-100 h-3 rounded-full overflow-hidden">
        <div 
          className={`h-full rounded-full bg-gradient-to-r ${colorClass} transition-all duration-1000 ease-out`}
          style={{ width: `${displayScore}%` }}
        />
      </div>
    </div>
  );
}