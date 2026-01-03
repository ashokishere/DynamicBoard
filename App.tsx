
import React, { useState, useEffect, useCallback } from 'react';
import { SignageEditor } from './components/SignageEditor';
import { SignagePlayer } from './components/SignagePlayer';
import { Slide, GlobalSettings } from './types';
import { INITIAL_SLIDES_STORAGE_KEY } from './constants';

const DEFAULT_SETTINGS: GlobalSettings = {
  headerText: 'Dynamic Flux Board',
  footerText: 'Powered by Dynamic Flux Engine v1.0 • Evolving Vision',
  backgroundColor: '#000000',
};

const App: React.FC = () => {
  const [slides, setSlides] = useState<Slide[]>([]);
  const [globalSettings, setGlobalSettings] = useState<GlobalSettings>(DEFAULT_SETTINGS);
  const [isPlaying, setIsPlaying] = useState(false);

  // Load from local storage
  useEffect(() => {
    const savedSlides = localStorage.getItem(INITIAL_SLIDES_STORAGE_KEY);
    const savedSettings = localStorage.getItem('flux_global_settings');
    
    if (savedSlides) {
      try {
        setSlides(JSON.parse(savedSlides));
      } catch (e) {
        console.error("Failed to parse saved slides", e);
      }
    }
    
    if (savedSettings) {
      try {
        setGlobalSettings(JSON.parse(savedSettings));
      } catch (e) {
        console.error("Failed to parse saved settings", e);
      }
    }
  }, []);

  // Save to local storage
  useEffect(() => {
    localStorage.setItem(INITIAL_SLIDES_STORAGE_KEY, JSON.stringify(slides));
  }, [slides]);

  useEffect(() => {
    localStorage.setItem('flux_global_settings', JSON.stringify(globalSettings));
  }, [globalSettings]);

  const handleStartPlayback = () => {
    setIsPlaying(true);
    if (document.documentElement.requestFullscreen) {
      document.documentElement.requestFullscreen();
    }
  };

  const handleStopPlayback = useCallback(() => {
    setIsPlaying(false);
    if (document.fullscreenElement) {
      document.exitFullscreen();
    }
  }, []);

  useEffect(() => {
    const handleFullscreenChange = () => {
      if (!document.fullscreenElement && isPlaying) {
        setIsPlaying(false);
      }
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, [isPlaying]);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {isPlaying ? (
        <SignagePlayer 
          slides={slides} 
          globalSettings={globalSettings}
          onExit={handleStopPlayback} 
        />
      ) : (
        <SignageEditor 
          slides={slides} 
          onSlidesChange={setSlides} 
          globalSettings={globalSettings}
          onSettingsChange={setGlobalSettings}
          onPlay={handleStartPlayback} 
        />
      )}
    </div>
  );
};

export default App;