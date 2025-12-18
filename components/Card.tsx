import React from 'react';
import { QuoteData, CardLayout } from '../types';

interface CardProps {
  data: QuoteData;
  loading?: boolean;
  layout?: CardLayout;
  id?: string;
}

export const Card: React.FC<CardProps> = ({ data, loading, layout = 'classic', id }) => {
  const isZh = data.language === 'zh';
  const dateObj = new Date(data.date);
  const day = dateObj.getDate();
  const monthYear = dateObj.toLocaleString(isZh ? 'zh-CN' : 'en-US', { month: 'short', year: 'numeric' });

  // Base container styles - Changed default bg to stone/neutral
  const containerClasses = "relative w-full max-w-md mx-auto aspect-[3/4] overflow-hidden shadow-xl transition-all duration-500 bg-stone-100 group select-none";
  
  // Image Element
  const ImageBg = ({ className = "" }) => (
    data.imageUrl ? (
      <img
        src={data.imageUrl}
        alt={data.imagePrompt}
        className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ${
          loading ? 'opacity-50 blur-sm' : 'opacity-100'
        } ${className}`}
        crossOrigin="anonymous" 
      />
    ) : (
      <div className={`absolute inset-0 bg-stone-200 animate-pulse ${className}`} />
    )
  );

  const LoadingOverlay = () => (
    loading ? (
      <div className="absolute inset-0 flex items-center justify-center bg-stone-100/60 backdrop-blur-[2px] z-50">
         <div className="flex flex-col items-center space-y-3">
           <div className="w-8 h-8 border-2 border-stone-300 border-t-stone-600 rounded-full animate-spin"></div>
           <p className="text-stone-600 text-xs tracking-widest uppercase font-serif">Inking...</p>
         </div>
      </div>
    ) : null
  );

  // --- Layout Implementations ---

  const renderClassic = () => (
    <div id={id} className={`${containerClasses} rounded-sm shadow-md`}>
      <ImageBg className={loading ? "scale-105" : "group-hover:scale-105 transition-transform duration-[2000ms]"} />
      {/* Softer gradient for Classic */}
      <div className="absolute inset-0 bg-gradient-to-b from-stone-900/10 via-transparent to-stone-900/80" />
      
      <div className="absolute inset-0 flex flex-col justify-between p-8 text-white z-10">
        <div className="flex justify-between items-start">
            <div className="flex flex-col drop-shadow-md">
                <span className="text-4xl font-bold tracking-tighter opacity-95 font-serif text-white">{day}</span>
                <span className="text-xs uppercase tracking-[0.2em] opacity-80 font-sans text-stone-100">{monthYear}</span>
            </div>
            <div className="w-8 h-8 border border-white/50 rounded-full flex items-center justify-center backdrop-blur-sm">
                <div className="w-1 h-1 bg-white rounded-full"></div>
            </div>
        </div>
        <div className={`space-y-6 transition-all duration-700 ${loading ? 'opacity-0 translate-y-4' : 'opacity-100'}`}>
          <div className="relative">
            <span className="absolute -top-6 -left-4 text-6xl opacity-30 font-serif leading-none text-white">“</span>
            <p className={`text-xl md:text-2xl font-serif leading-relaxed drop-shadow-md ${isZh ? 'tracking-widest' : ''}`}>
              {data.quote}
            </p>
          </div>
          <div className="flex flex-col items-end space-y-1">
            <span className="text-sm md:text-base font-medium tracking-wide border-b border-white/40 pb-1">{data.author}</span>
            {data.source && <span className="text-xs md:text-sm opacity-80 italic">{isZh ? `《${data.source}》` : data.source}</span>}
          </div>
        </div>
      </div>
      <LoadingOverlay />
    </div>
  );

  const renderPolaroid = () => (
    <div id={id} className={`${containerClasses} bg-white rounded-sm shadow-lg`}>
      <div className="absolute top-4 left-4 right-4 bottom-32 bg-stone-50 overflow-hidden border border-stone-100">
         <ImageBg className={`grayscale-[20%] contrast-[1.1] ${loading ? "scale-105" : "group-hover:scale-105 transition-transform duration-[2000ms]"}`} />
         <LoadingOverlay />
      </div>
      <div className="absolute bottom-0 left-0 right-0 h-32 flex flex-col items-center justify-center p-6 text-center">
         {/* MUJI style typography for Polaroid */}
         <p className={`font-['Caveat'] text-3xl mb-3 leading-tight text-stone-800 ${isZh ? 'font-serif text-2xl font-normal' : ''}`}>{data.quote}</p>
         <div className="flex items-center gap-2 text-[10px] text-stone-400 font-sans tracking-[0.2em] uppercase">
             <span className="text-stone-600 font-bold">{data.author}</span>
             <span>•</span>
             <span>{monthYear} {day}</span>
         </div>
      </div>
    </div>
  );

  const renderCinematic = () => (
    <div id={id} className={`${containerClasses} bg-black rounded-sm shadow-2xl`}>
      <div className="absolute inset-0 flex flex-col">
        {/* Letterbox bars */}
        <div className="h-[15%] bg-black z-20 w-full flex items-center justify-center">
            <span className="text-stone-600 text-[10px] tracking-[0.3em] uppercase">Cinema Mode</span>
        </div>
        <div className="relative flex-1 overflow-hidden w-full">
            <ImageBg />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
            
            <div className="absolute bottom-8 left-0 right-0 px-8 text-center z-30">
                <p className={`text-white/90 text-lg md:text-xl font-medium tracking-wide leading-relaxed drop-shadow-md italic ${isZh ? 'font-serif' : ''}`}>
                   {data.quote}
                </p>
                <div className="mt-4 flex justify-center gap-4 text-xs text-stone-400 uppercase tracking-widest font-sans">
                     <span>— {data.author}</span>
                </div>
            </div>
        </div>
        <div className="h-[15%] bg-black z-20 w-full flex items-center justify-between px-6 text-stone-700">
             <span className="text-xs font-mono">{data.date}</span>
             <div className="flex gap-1">
                 <div className="w-1.5 h-1.5 rounded-full bg-red-900 animate-pulse"></div>
                 <span className="text-xs font-mono tracking-tighter">REC</span>
             </div>
        </div>
        <LoadingOverlay />
      </div>
    </div>
  );

  const renderMagazine = () => (
    <div id={id} className={`${containerClasses} rounded-none shadow-md bg-stone-100`}>
       <ImageBg className="grayscale-[10%]" />
       {/* Removed purple overlay, added warm subtle tone */}
       <div className="absolute inset-0 bg-stone-900/10 mix-blend-overlay" />
       
       <div className="absolute top-8 left-8 z-20 border-l-4 border-stone-800 pl-4 bg-white/80 p-2 backdrop-blur-sm">
          <h1 className="text-6xl font-['Oswald'] font-bold text-stone-900 leading-none">{day}</h1>
          <p className="text-stone-600 text-lg font-['Oswald'] uppercase tracking-widest">{dateObj.toLocaleString('en-US', { month: 'short' }).toUpperCase()}</p>
       </div>

       <div 
         className="absolute bottom-0 left-0 w-full bg-white p-8 z-20"
         style={{ clipPath: 'polygon(0 15%, 100% 0, 100% 100%, 0% 100%)' }}
       >
          <div className="mt-4">
            <p className={`text-stone-800 text-xl font-bold leading-snug mb-3 ${isZh ? 'font-serif' : 'font-sans'}`}>
               {data.quote}
            </p>
            <div className="flex justify-between items-center border-t border-stone-200 pt-3">
                <span className="text-xs font-bold uppercase tracking-widest text-stone-500">{data.author}</span>
                <span className="text-[10px] text-stone-400">{data.source}</span>
            </div>
          </div>
       </div>
       <LoadingOverlay />
    </div>
  );

  switch (layout) {
    case 'polaroid': return renderPolaroid();
    case 'cinematic': return renderCinematic();
    case 'magazine': return renderMagazine();
    case 'classic': 
    default: 
        return renderClassic();
  }
};