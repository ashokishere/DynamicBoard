
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

  const renderRichText = (text: string = '', baseColor: string = '#FFF', highlightColor: string = '#F59E0B') => {
    if (!text) return null;
    const parts = text.split(/(\[\[.*?\]\])/g);
    return parts.map((part, i) => {
      if (part.startsWith('[[') && part.endsWith(']]')) {
        const cleanPart = part.substring(2, part.length - 2);
        return <span key={i} style={{ color: highlightColor }}>{cleanPart}</span>;
      }
      return <span key={i} style={{ color: baseColor }}>{part}</span>;
    });
  };

  const getDynamicFontSize = (slide: Slide, isHalfWidth: boolean = false) => {
    const text = slide.content.text || '';
    const length = text.replace(/\[\[|\]\]/g, '').length;
    const userScale = (slide.fontSize || 100) / 100;
    
    let baseSize = isHalfWidth ? 4 : 8;
    if (length > 30) baseSize *= 0.8;
    if (length > 100) baseSize *= 0.6;
    if (length > 250) baseSize *= 0.4;

    return `${baseSize * userScale}vw`;
  };

  const getFontFamilyClass = (family?: string) => {
    switch(family) {
      case 'montserrat': return 'font-montserrat';
      case 'bebas': return 'font-bebas';
      case 'playfair': return 'font-playfair';
      case 'lora': return 'font-lora';
      case 'mono': return 'font-mono-roboto';
      case 'serif': return 'font-serif';
      default: return 'font-sans';
    }
  };

  useEffect(() => {
    if (!currentSlide || currentSlide.type !== SlideType.NAS_FOLDER) return;
    const images = currentSlide.content.folderFiles || [];
    if (images.length > 1) {
      setFolderImageIndex(0);
      const subInterval = (currentSlide.duration * 1000) / images.length;
      const folderTimer = setInterval(() => {
        setFolderImageIndex(prev => (prev + 1) % images.length);
      }, Math.max(800, subInterval));
      return () => clearInterval(folderTimer);
    }
  }, [currentIndex, currentSlide]);

  useEffect(() => {
    if (slides.length === 0) return;
    const currentDuration = slides[currentIndex].duration * 1000;
    timerRef.current = window.setTimeout(() => {
      setCurrentIndex((prev) => (prev + 1) % slides.length);
    }, currentDuration);
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [currentIndex, slides]);

  if (slides.length === 0) return null;

  const renderSlideContent = () => {
    const fontClass = getFontFamilyClass(currentSlide.fontFamily);
    const textLayout = currentSlide.textLayout || 'OVERLAY';
    const alignClass = currentSlide.textAlignment === 'left' ? 'text-left' : currentSlide.textAlignment === 'right' ? 'text-right' : 'text-center';
    
    const textStyle: React.CSSProperties = {
      fontSize: getDynamicFontSize(currentSlide, textLayout === 'SPLIT'),
      fontWeight: currentSlide.isBold ? 900 : 400,
      fontStyle: currentSlide.isItalic ? 'italic' : 'normal',
      lineHeight: 1.1,
    };

    const renderMedia = (className: string = "max-w-full max-h-full object-contain rounded-2xl shadow-2xl") => {
      if (currentSlide.type === SlideType.NAS_FOLDER) {
        const images = currentSlide.content.folderFiles || [];
        return images.length > 0 ? <img src={images[folderImageIndex]} className={className} /> : <div className="text-white/10 font-black">NO IMAGES</div>;
      }
      if (currentSlide.type === SlideType.HTML_PAGE) return <iframe src={currentSlide.content.htmlUrl} className="w-full h-full border-none bg-white" />;
      return <img src={currentSlide.content.imageUrl} className={className} />;
    };

    const renderTypography = (overlay: boolean = false) => {
      if (!currentSlide.content.text) return null;
      return (
        <div className={`p-12 md:p-20 flex items-center justify-center ${alignClass} ${overlay ? 'absolute inset-0 pointer-events-none z-10 select-none' : 'w-full h-full'}`}>
          <h2 className={`${fontClass} break-words hyphens-auto drop-shadow-[0_2px_15px_rgba(0,0,0,0.8)]`} style={textStyle}>
            {renderRichText(currentSlide.content.text, currentSlide.textColor, currentSlide.highlightColor)}
          </h2>
        </div>
      );
    };

    if (currentSlide.type === SlideType.ONLY_TEXT) {
      return renderTypography(false);
    }

    if (currentSlide.type === SlideType.HTML_PAGE) {
      return renderMedia();
    }

    // Split Layout
    if (textLayout === 'SPLIT' && currentSlide.content.text) {
      return (
        <div className="w-full h-full flex flex-col md:flex-row p-12 md:p-24 gap-16 overflow-hidden">
          <div className="w-full md:w-3/5 h-1/2 md:h-full flex items-center justify-center">
            {renderMedia()}
          </div>
          <div className="w-full md:w-2/5 h-1/2 md:h-full flex items-center justify-center overflow-hidden">
            {renderTypography(false)}
          </div>
        </div>
      );
    }

    // Overlay Layout (Default)
    return (
      <div className="relative w-full h-full flex items-center justify-center p-8 overflow-hidden">
        {renderMedia()}
        {renderTypography(true)}
      </div>
    );
  };

  return (
    <div 
      className="fixed inset-0 overflow-hidden z-[9999] flex flex-col transition-colors duration-1000 ease-in-out"
      style={{ backgroundColor: currentSlide.backgroundColor || globalSettings.backgroundColor }}
    >
      <div className="w-full bg-black/60 backdrop-blur-2xl border-b border-white/10 p-6 md:p-10 flex items-center justify-between z-[10001] shrink-0">
        <div className="flex items-center gap-6">
          <h1 className="text-white text-2xl md:text-5xl font-black tracking-tighter truncate max-w-[70vw] drop-shadow-md">
            {globalSettings.headerText}
          </h1>
        </div>
        <div className="hidden sm:flex flex-col items-end text-white/90 font-black">
          <span className="text-2xl md:text-3xl tracking-tighter">{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
          <span className="text-[10px] uppercase tracking-widest opacity-40">SYSTEM TIME</span>
        </div>
      </div>

      <div className="flex-1 relative overflow-hidden">
        <div className="absolute inset-0">
          {renderSlideContent()}
        </div>
        <div 
          key={currentIndex} 
          className="absolute bottom-0 left-0 h-1.5 bg-white/40 z-[10005]"
          style={{ width: '100%', animation: `progress ${currentSlide.duration}s linear forwards` }}
        />
      </div>

      <div className="w-full bg-black border-t border-white/20 h-16 md:h-24 flex items-center overflow-hidden z-[10001] shrink-0">
        <div className="flex-1 overflow-hidden relative h-full flex items-center">
          <div className="marquee-content whitespace-nowrap inline-block animate-marquee pl-[100%]">
            <span className="text-white text-2xl md:text-4xl font-black tracking-tight uppercase">
              {globalSettings.footerText}
            </span>
            <span className="text-indigo-500 mx-24 opacity-50">• • • • •</span>
          </div>
        </div>
      </div>

      <div className="absolute top-40 right-10 z-[10002] opacity-0 hover:opacity-100 transition-opacity">
        <button onClick={onExit} className="bg-white text-black p-5 rounded-full shadow-2xl hover:scale-110 active:scale-95 transition-all flex items-center gap-3 font-black uppercase text-xs tracking-widest">
          <X size={24} strokeWidth={3} />
          <span>Exit Player</span>
        </button>
      </div>

      <style>{`
        @keyframes progress { from { width: 0%; } to { width: 100%; } }
        @keyframes marquee { 0% { transform: translate(0, 0); } 100% { transform: translate(-100%, 0); } }
        .animate-marquee { display: inline-block; animation: marquee 35s linear infinite; }
      `}</style>
    </div>
  );
};