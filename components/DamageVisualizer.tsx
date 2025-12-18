import React, { useEffect, useRef, useState } from 'react';
import { DamageItem } from '../types';

interface Props {
  imageUrl: string;
  damages: DamageItem[];
}

export const DamageVisualizer: React.FC<Props> = ({ imageUrl, damages }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [imageSize, setImageSize] = useState({ width: 0, height: 0 });

  // Colors based on severity
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'Severe': return { border: 'border-red-600', bg: 'bg-red-500/30', text: 'bg-red-600' };
      case 'Moderate': return { border: 'border-orange-500', bg: 'bg-orange-500/30', text: 'bg-orange-500' };
      default: return { border: 'border-yellow-400', bg: 'bg-yellow-400/30', text: 'bg-yellow-400' };
    }
  };

  const handleImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    setImageSize({
      width: e.currentTarget.naturalWidth,
      height: e.currentTarget.naturalHeight
    });
  };

  return (
    <div ref={containerRef} className="relative w-full h-full bg-slate-900 rounded-xl overflow-hidden shadow-inner flex items-center justify-center">
      <img 
        src={imageUrl} 
        alt="Analyzed Vehicle" 
        className="w-full h-auto max-h-[80vh] object-contain block"
        onLoad={handleImageLoad}
      />
      
      {damages.map((damage) => {
        // box_2d is [ymin, xmin, ymax, xmax] 0-1000
        const [ymin, xmin, ymax, xmax] = damage.box_2d;
        
        // Convert normalized coordinates to percentage strings for CSS positioning
        const top = ymin / 10;
        const left = xmin / 10;
        const height = (ymax - ymin) / 10;
        const width = (xmax - xmin) / 10;

        const colors = getSeverityColor(damage.severity);

        return (
          <div
            key={damage.id}
            className={`absolute ${colors.border} border-2 ${colors.bg} transition-all duration-300 hover:bg-opacity-40 group z-10`}
            style={{
              top: `${top}%`,
              left: `${left}%`,
              width: `${width}%`,
              height: `${height}%`,
              boxShadow: '0 0 0 1px rgba(255,255,255,0.2)'
            }}
          >
            {/* Corner Markers for better visibility */}
            <div className={`absolute -top-1 -left-1 w-2 h-2 ${colors.text}`}></div>
            <div className={`absolute -top-1 -right-1 w-2 h-2 ${colors.text}`}></div>
            <div className={`absolute -bottom-1 -left-1 w-2 h-2 ${colors.text}`}></div>
            <div className={`absolute -bottom-1 -right-1 w-2 h-2 ${colors.text}`}></div>

            {/* Tooltip on Hover */}
            <div className="absolute -top-10 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-20 pointer-events-none">
               <div className={`${colors.text} text-white text-xs px-3 py-1.5 rounded shadow-xl font-bold flex flex-col items-center`}>
                 <span>{damage.label}</span>
                 <span className="text-[10px] font-normal opacity-90">{(damage.confidence * 100).toFixed(0)}% confidence</span>
               </div>
               <div className={`w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[6px] border-t-${colors.text.replace('bg-', '')} mx-auto`}></div>
            </div>
            
            {/* Mobile-friendly permanent label for severe items if needed */}
            {damage.severity === 'Severe' && (
              <div className="absolute -bottom-3 right-0 md:hidden z-20">
                 <div className="w-3 h-3 bg-red-600 rounded-full animate-pulse border-2 border-white"></div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};