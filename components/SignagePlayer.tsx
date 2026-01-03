
import React, { useState, useEffect, useRef } from 'react';
import { Slide, SlideType, GlobalSettings } from '../types';
import { X, RefreshCw } from 'lucide-react';

interface SignagePlayerProps {
  slides: Slide[];
  globalSettings: GlobalSettings;
  onExit: () => void;
}

export const SignagePlayer: React.FC<SignagePlayerProps> = ({ slides, globalSettings, onExit }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [folderImageIndex, setFolderImageIndex] = useState(0);
  const timerRef = useRef<number | null>(null);

  const currentSlide = slides[currentIndex];

  useEffect(() => {
    if (!currentSlide) return;

    if (currentSlide.type === SlideType.NAS_FOLDER) {
      const images = currentSlide.content.folderFiles || [];
      if (images.length > 0) {
        setFolderImageIndex(0);
        // Cycle all images inside the folder within the slide's duration
        const interval = Math.max(800, (currentSlide.duration * 1000) / images.length);
        const subTimer = setInterval(() => {
          setFolderImageIndex(prev => (prev + 1) % images.length);
        }, interval);
        
        return () => clearInterval(subTimer);
      }
    } else {
      setFolderImageIndex(0);
    }
  }, [currentIndex, currentSlide]);

  useEffect(() => {
    if (slides.length === 0) return;

    const currentDuration = slides[currentIndex].duration * 1000;

    timerRef.current = window.setTimeout(() => {
      setCurrentIndex((prev) => (prev + 1) % slides.length);
    }, currentDuration);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [currentIndex, slides]);

  if (slides.length === 0) {
    return (
      <div className="fixed inset-0 bg-black flex flex-col items-center justify-center text-white">
        <RefreshCw className="animate-spin mb-4" size={48} />
        <p className="text-xl font-bold">Signage Offline - No Content</p>
        <button onClick={onExit} className="mt-8 px-8 py-3 bg-white text-black rounded-full font-bold shadow-xl">Return to Editor</button>
      </div>
    );
  }

  const renderSlideContent = () => {
    switch (currentSlide.type) {
      case SlideType.ONLY_IMAGE:
      case SlideType.GOOGLE_DRIVE:
        return (
          <div className="w-full h-full flex items-center justify-center p-4">
            <img src={currentSlide.content.imageUrl} alt="Signage" className="max-w-full max-h-full object-contain shadow-2xl rounded-lg" />
          </div>
        );

      case SlideType.ONLY_TEXT:
        return (
          <div className="w-full h-full flex items-center justify-center p-20 text-center">
            <h2 className="text-6xl md:text-8xl lg:text-9xl font-black text-white leading-tight drop-shadow-2xl uppercase tracking-tighter">
              {currentSlide.content.text}
            </h2>
          </div>
        );

      case SlideType.IMAGE_AND_TEXT:
        return (
          <div className="w-full h-full flex flex-col md:flex-row p-8 gap-8">
            <div className="w-full md:w-3/5 h-1/2 md:h-full flex items-center justify-center">
              <img src={currentSlide.content.imageUrl} className="max-w-full max-h-full object-contain shadow-2xl rounded-2xl" alt="Feature" />
            </div>
            <div className="w-full md:w-2/5 h-1/2 md:h-full flex items-center justify-center p-8 lg:p-16 text-white text-right">
              <p className="text-4xl lg:text-6xl font-black leading-tight drop-shadow-lg italic uppercase">
                {currentSlide.content.text}
              </p>
            </div>
          </div>
        );

      case SlideType.HTML_PAGE:
        return (
          <iframe src={currentSlide.content.htmlUrl} className="w-full h-full border-none bg-white rounded-lg shadow-inner" title="Signage Page" />
        );

      case SlideType.NAS_FOLDER:
        const folderImages = currentSlide.content.folderFiles || [];
        return (
          <div className="w-full h-full flex items-center justify-center p-4">
            {folderImages.length > 0 ? (
              <img src={folderImages[folderImageIndex]} alt="Folder Content" className="max-w-full max-h-full object-contain transition-all duration-700 transform scale-100" />
            ) : (
              <div className="text-white text-3xl font-black uppercase opacity-20">Scanning Directory...</div>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div 
      className="fixed inset-0 overflow-hidden z-[9999] flex flex-col transition-colors duration-1000 ease-in-out"
      style={{ backgroundColor: currentSlide.backgroundColor || globalSettings.backgroundColor }}
    >
      {/* GLOBAL STATIC HEADER */}
      <div className="w-full bg-black/60 backdrop-blur-xl border-b border-white/10 p-4 md:p-8 flex items-center justify-between z-[10001] shadow-2xl">
        <div className="flex items-center gap-8">
          {globalSettings.headerImage && <img src={globalSettings.headerImage} alt="Logo" className="h-10 md:h-16 lg:h-20 object-contain drop-shadow-md" />}
          <h1 className="text-white text-2xl md:text-5xl lg:text-6xl font-black tracking-tighter uppercase truncate max-w-4xl drop-shadow-lg">
            {globalSettings.headerText}
          </h1>
        </div>
        <div className="hidden md:flex flex-col items-end text-white/80 font-black">
          <span className="text-2xl lg:text-4xl">{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
          <span className="text-xs uppercase tracking-widest opacity-50">Local Time</span>
        </div>
      </div>

      {/* DYNAMIC BODY AREA */}
      <div className="flex-1 relative overflow-hidden">
        <div className="absolute inset-0">
          {renderSlideContent()}
        </div>

        {/* Dynamic Slide Progress */}
        <div 
          key={currentIndex} 
          className="absolute bottom-0 left-0 h-1.5 bg-indigo-500 shadow-[0_0_15px_rgba(99,102,241,0.8)] z-[10005]"
          style={{ width: '100%', animation: `progress ${currentSlide.duration}s linear forwards` }}
        />
      </div>

      {/* GLOBAL SCROLLING FOOTER (MARQUEE) */}
      <div className="w-full bg-black/80 backdrop-blur-2xl border-t border-white/20 h-20 md:h-28 flex items-center overflow-hidden z-[10001] relative">
        <div className="flex items-center gap-4 px-6 h-full border-r border-white/10 bg-black z-10 shrink-0">
          {globalSettings.footerImage && (
            <img src={globalSettings.footerImage} alt="Footer Icon" className="h-8 md:h-14 object-contain animate-pulse" />
          )}
          <div className="h-8 w-[2px] bg-indigo-500 rounded-full mx-2 hidden md:block"></div>
        </div>
        
        <div className="flex-1 overflow-hidden relative h-full flex items-center">
          <div className="marquee-content whitespace-nowrap inline-block animate-marquee pl-[100%]">
            <span className="text-white text-2xl md:text-4xl lg:text-5xl font-black uppercase tracking-tight drop-shadow-md">
              {globalSettings.footerText}
            </span>
            <span className="text-indigo-400 text-2xl md:text-4xl lg:text-5xl font-black uppercase tracking-tight mx-20 drop-shadow-md">
              &bull; &bull; &bull; &bull; &bull;
            </span>
            <span className="text-white text-2xl md:text-4xl lg:text-5xl font-black uppercase tracking-tight drop-shadow-md">
              {globalSettings.footerText}
            </span>
          </div>
        </div>
      </div>

      {/* System Controls - Overlay */}
      <div className="absolute top-32 right-8 z-[10002] opacity-0 hover:opacity-100 transition-opacity">
        <button 
          onClick={onExit} 
          className="bg-white text-black p-4 rounded-full shadow-2xl hover:scale-110 active:scale-95 transition-all flex items-center gap-2 font-bold"
        >
          <X size={24} strokeWidth={3} />
          <span className="pr-2">EXIT</span>
        </button>
      </div>

      <style>{`
        @keyframes progress {
          from { width: 0%; }
          to { width: 100%; }
        }

        @keyframes marquee {
          0% { transform: translate(0, 0); }
          100% { transform: translate(-100%, 0); }
        }

        .animate-marquee {
          display: inline-block;
          animation: marquee 30s linear infinite;
        }

        .marquee-content:hover {
          animation-play-state: paused;
        }
      `}</style>
    </div>
  );
};
