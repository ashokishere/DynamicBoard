
import React, { useState } from 'react';
import { Slide, SlideType, GlobalSettings } from '../types';
import { Play, Plus, Trash2, Layout, Image as ImageIcon, Type, Globe, FolderOpen, AlertCircle, Settings, Palette, Star, Calendar, Sun, Clock, Share2 } from 'lucide-react';
import { DEFAULT_IMAGES, PRESETS } from '../constants';

interface SignageEditorProps {
  slides: Slide[];
  onSlidesChange: (slides: Slide[]) => void;
  globalSettings: GlobalSettings;
  onSettingsChange: (settings: GlobalSettings) => void;
  onPlay: () => void;
}

export const SignageEditor: React.FC<SignageEditorProps> = ({ 
  slides, 
  onSlidesChange, 
  globalSettings, 
  onSettingsChange, 
  onPlay 
}) => {
  const [activeType, setActiveType] = useState<SlideType>(SlideType.ONLY_IMAGE);
  const [showGlobalSettings, setShowGlobalSettings] = useState(false);
  const [activePresetTab, setActivePresetTab] = useState<'week' | 'season' | 'month'>('week');

  const addSlide = (type: SlideType = activeType, customUrl?: string) => {
    const newSlide: Slide = {
      id: Math.random().toString(36).substr(2, 9),
      type: type,
      duration: 5,
      backgroundColor: globalSettings.backgroundColor,
      content: {
        imageUrl: customUrl || (type === SlideType.ONLY_IMAGE || type === SlideType.IMAGE_AND_TEXT 
          ? DEFAULT_IMAGES[Math.floor(Math.random() * DEFAULT_IMAGES.length)] 
          : ''),
        text: type === SlideType.ONLY_TEXT || type === SlideType.IMAGE_AND_TEXT 
          ? 'Enter your message here...' 
          : '',
        htmlUrl: type === SlideType.HTML_PAGE ? 'https://www.google.com' : '',
        folderFiles: []
      }
    };
    onSlidesChange([...slides, newSlide]);
  };

  const updateSlide = (id: string, updates: Partial<Slide>) => {
    onSlidesChange(slides.map(s => s.id === id ? { ...s, ...updates } : s));
  };

  const deleteSlide = (id: string) => {
    onSlidesChange(slides.filter(s => s.id !== id));
  };

  const handleFileUpload = (id: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        updateSlide(id, { content: { ...slides.find(s => s.id === id)?.content, imageUrl: reader.result as string } });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleFolderUpload = (id: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const fileUrls: string[] = [];
      const imageFiles = (Array.from(files) as File[]).filter(f => f.type.startsWith('image/'));
      
      const readNext = (index: number) => {
        if (index >= imageFiles.length) {
          updateSlide(id, { content: { ...slides.find(s => s.id === id)?.content, folderFiles: fileUrls } });
          return;
        }
        const reader = new FileReader();
        reader.onloadend = () => {
          fileUrls.push(reader.result as string);
          readNext(index + 1);
        };
        reader.readAsDataURL(imageFiles[index]);
      };
      
      readNext(0);
    }
  };

  const handleGlobalImageUpload = (key: 'headerImage' | 'footerImage', e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        onSettingsChange({ ...globalSettings, [key]: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  // Helper to convert Drive view links to direct image links
  const processDriveLink = (id: string, url: string) => {
    let directUrl = url;
    const match = url.match(/\/file\/d\/(.+?)\/(?:view|edit)/) || url.match(/id=(.+?)(&|$)/);
    if (match && match[1]) {
      directUrl = `https://lh3.googleusercontent.com/d/${match[1]}=s1920`;
    }
    updateSlide(id, { content: { ...slides.find(s => s.id === id)?.content, imageUrl: directUrl } });
  };

  return (
    <div className="flex-1 max-w-6xl mx-auto w-full p-4 md:p-8">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Dynamic Flux Board</h1>
          <p className="text-gray-500 font-medium">Professional layout with header, marquee footer, and dynamic body.</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => setShowGlobalSettings(!showGlobalSettings)}
            className={`flex items-center gap-2 px-5 py-3 rounded-xl font-bold transition-all border ${
              showGlobalSettings ? 'bg-indigo-600 border-indigo-600 text-white' : 'bg-white border-gray-200 text-gray-700 hover:border-indigo-300'
            }`}
          >
            <Settings size={20} />
            Setup Global
          </button>
          <button 
            onClick={onPlay}
            disabled={slides.length === 0}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3 rounded-xl font-bold transition-all shadow-lg shadow-indigo-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Play size={20} fill="currentColor" />
            Play (F11)
          </button>
        </div>
      </header>

      {showGlobalSettings && (
        <div className="mb-8 bg-white rounded-3xl border-2 border-indigo-100 shadow-xl overflow-hidden animate-in fade-in zoom-in duration-300">
          <div className="p-6 bg-indigo-50 border-b border-indigo-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <h2 className="text-xl font-black text-indigo-900 flex items-center gap-2">
              <Settings size={24} className="animate-spin-slow" />
              GLOBAL SYSTEM CONFIGURATION
            </h2>
            <div className="flex gap-2 bg-white/50 p-1 rounded-xl border border-indigo-100">
              {[
                { id: 'week', label: 'Weekly', icon: Clock },
                { id: 'season', label: 'Seasonal', icon: Sun },
                { id: 'month', label: 'Monthly', icon: Calendar }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActivePresetTab(tab.id as any)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                    activePresetTab === tab.id ? 'bg-indigo-600 text-white shadow-md' : 'text-indigo-700 hover:bg-indigo-100'
                  }`}
                >
                  <tab.icon size={14} />
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
          
          <div className="p-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-10">
              <div className="space-y-4">
                <label className="block text-sm font-black text-gray-500 uppercase tracking-widest">Static Header Text</label>
                <input 
                  type="text"
                  placeholder="Header text..."
                  className="w-full bg-gray-50 border-2 border-gray-100 rounded-xl px-4 py-3 text-sm focus:border-indigo-500 outline-none transition-all font-bold"
                  value={globalSettings.headerText}
                  onChange={(e) => onSettingsChange({ ...globalSettings, headerText: e.target.value })}
                />
                <div className="flex items-center gap-3">
                  <input type="file" id="globalHeaderImg" className="hidden" accept="image/*" onChange={(e) => handleGlobalImageUpload('headerImage', e)} />
                  <label htmlFor="globalHeaderImg" className="text-xs bg-indigo-100 text-indigo-700 px-4 py-2 rounded-lg cursor-pointer hover:bg-indigo-200 font-bold">Upload Header Logo</label>
                  {globalSettings.headerImage && <button onClick={() => onSettingsChange({...globalSettings, headerImage: undefined})} className="text-xs text-red-500 font-black hover:underline">Remove</button>}
                </div>
              </div>

              <div className="space-y-4">
                <label className="block text-sm font-black text-gray-500 uppercase tracking-widest">Marquee Footer Text</label>
                <textarea 
                  placeholder="Scrolling footer message..."
                  className="w-full bg-gray-50 border-2 border-gray-100 rounded-xl px-4 py-3 text-sm focus:border-indigo-500 outline-none transition-all font-bold"
                  rows={2}
                  value={globalSettings.footerText}
                  onChange={(e) => onSettingsChange({ ...globalSettings, footerText: e.target.value })}
                />
                <div className="flex items-center gap-3">
                  <input type="file" id="globalFooterImg" className="hidden" accept="image/*" onChange={(e) => handleGlobalImageUpload('footerImage', e)} />
                  <label htmlFor="globalFooterImg" className="text-xs bg-indigo-100 text-indigo-700 px-4 py-2 rounded-lg cursor-pointer hover:bg-indigo-200 font-bold">Upload Footer Icon</label>
                  {globalSettings.footerImage && <button onClick={() => onSettingsChange({...globalSettings, footerImage: undefined})} className="text-xs text-red-500 font-black hover:underline">Remove</button>}
                </div>
              </div>

              <div className="space-y-4">
                <label className="block text-sm font-black text-gray-500 uppercase tracking-widest">Canvas BG Color</label>
                <div className="flex items-center gap-4">
                  <input 
                    type="color"
                    className="w-16 h-12 border-0 p-1 rounded-xl cursor-pointer bg-gray-100"
                    value={globalSettings.backgroundColor}
                    onChange={(e) => onSettingsChange({ ...globalSettings, backgroundColor: e.target.value })}
                  />
                  <input 
                    type="text"
                    className="flex-1 bg-gray-50 border-2 border-gray-100 rounded-xl px-4 py-3 text-sm font-mono font-bold uppercase"
                    value={globalSettings.backgroundColor}
                    onChange={(e) => onSettingsChange({ ...globalSettings, backgroundColor: e.target.value })}
                  />
                </div>
              </div>
            </div>

            <div className="border-t border-gray-100 pt-8">
              <h3 className="text-sm font-black text-gray-500 uppercase tracking-widest mb-6 flex items-center gap-2">
                <Star size={16} className="text-amber-500 fill-amber-500" />
                {activePresetTab.toUpperCase()} Favorites
              </h3>
              <div className="flex gap-4 overflow-x-auto pb-4 custom-scrollbar">
                {PRESETS[activePresetTab].map((url, i) => (
                  <div key={i} className="relative group shrink-0">
                    <img 
                      src={url} 
                      alt={`Preset ${i}`} 
                      className="w-24 h-32 object-cover rounded-xl border-2 border-gray-100 group-hover:border-indigo-500 transition-all shadow-sm"
                    />
                    <button 
                      onClick={() => addSlide(SlideType.ONLY_IMAGE, url)}
                      className="absolute inset-0 bg-indigo-600/0 group-hover:bg-indigo-600/60 flex items-center justify-center transition-all opacity-0 group-hover:opacity-100 rounded-xl"
                    >
                      <Plus className="text-white" size={32} />
                    </button>
                    <div className="absolute -bottom-1 -right-1 bg-white text-indigo-600 rounded-full p-1 shadow-md opacity-0 group-hover:opacity-100 transition-opacity">
                      <Star size={12} fill="currentColor" />
                    </div>
                  </div>
                ))}
              </div>
              <p className="mt-4 text-xs font-bold text-gray-400 italic">Tip: Click the "+" overlay on a favorite picture to instantly add it to your loop.</p>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm sticky top-8">
            <h2 className="text-xs font-black uppercase tracking-widest text-gray-400 mb-6">Create Content</h2>
            <div className="grid grid-cols-1 gap-3">
              {[
                { type: SlideType.ONLY_IMAGE, icon: ImageIcon, label: 'Full Images' },
                { type: SlideType.IMAGE_AND_TEXT, icon: Layout, label: 'Image + Caption' },
                { type: SlideType.ONLY_TEXT, icon: Type, label: 'Bold Message' },
                { type: SlideType.HTML_PAGE, icon: Globe, label: 'Web Page' },
                { type: SlideType.NAS_FOLDER, icon: FolderOpen, label: 'Media Folder' },
                { type: SlideType.GOOGLE_DRIVE, icon: Share2, label: 'Google Drive' },
              ].map((btn) => (
                <button
                  key={btn.type}
                  onClick={() => setActiveType(btn.type)}
                  className={`flex items-center gap-3 p-4 rounded-2xl transition-all text-sm font-bold ${
                    activeType === btn.type ? 'bg-indigo-50 text-indigo-700 ring-2 ring-indigo-200' : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <btn.icon size={20} />
                  {btn.label}
                </button>
              ))}
              <button 
                onClick={() => addSlide()}
                className="mt-6 flex items-center justify-center gap-2 bg-indigo-900 text-white p-5 rounded-2xl hover:bg-black transition-all font-black text-sm uppercase tracking-widest shadow-xl active:scale-95"
              >
                <Plus size={20} />
                Append Slide
              </button>
            </div>
          </div>
        </div>

        <div className="lg:col-span-3 space-y-6">
          {slides.map((slide, index) => (
            <div key={slide.id} className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm hover:shadow-xl transition-all group relative overflow-hidden border-l-[12px]" style={{ borderLeftColor: slide.backgroundColor || globalSettings.backgroundColor }}>
              <div className="flex flex-col md:flex-row gap-8">
                <div className="w-full md:w-56 h-36 bg-gray-100 rounded-2xl overflow-hidden flex-shrink-0 relative shadow-inner">
                  {(slide.type === SlideType.ONLY_IMAGE || slide.type === SlideType.GOOGLE_DRIVE) && slide.content.imageUrl && (
                    <img src={slide.content.imageUrl} alt="Preview" className="w-full h-full object-cover" />
                  )}
                  {slide.type === SlideType.IMAGE_AND_TEXT && (
                    <div className="flex h-full">
                      <div className="w-1/2 bg-gray-200 border-r border-white"><img src={slide.content.imageUrl} className="w-full h-full object-cover" /></div>
                      <div className="w-1/2 p-2 flex items-center justify-center bg-white"><p className="text-[10px] line-clamp-3 font-bold">{slide.content.text}</p></div>
                    </div>
                  )}
                  {slide.type === SlideType.ONLY_TEXT && (
                    <div className="flex items-center justify-center h-full p-4 bg-indigo-50 text-indigo-900 font-black text-center text-xs uppercase leading-tight">
                      {slide.content.text}
                    </div>
                  )}
                  {slide.type === SlideType.HTML_PAGE && (
                    <div className="flex items-center justify-center h-full bg-blue-50 text-blue-700">
                      <Globe size={40} strokeWidth={3} />
                    </div>
                  )}
                  {slide.type === SlideType.NAS_FOLDER && (
                    <div className="flex flex-col items-center justify-center h-full bg-emerald-50 text-emerald-700">
                      <FolderOpen size={40} strokeWidth={3} />
                      <span className="text-xs mt-2 font-black tracking-widest uppercase">{slide.content.folderFiles?.length || 0} ITEMS</span>
                    </div>
                  )}
                  <div className="absolute top-3 left-3 bg-black/80 text-white text-[10px] px-3 py-1 rounded-full font-black tracking-widest">SLIDE #{index + 1}</div>
                </div>

                <div className="flex-1 space-y-5">
                  <div className="flex justify-between items-center">
                    <h3 className="font-black text-gray-800 uppercase tracking-widest flex items-center gap-2">
                      {slide.type.replace(/_/g, ' ')}
                    </h3>
                    <div className="flex items-center gap-6">
                      <div className="flex items-center gap-2 bg-gray-50 px-3 py-1.5 rounded-xl border border-gray-100">
                         <Palette size={16} className="text-gray-400" />
                         <input 
                          type="color" 
                          value={slide.backgroundColor || globalSettings.backgroundColor} 
                          onChange={(e) => updateSlide(slide.id, { backgroundColor: e.target.value })}
                          className="w-8 h-8 border-0 p-0 cursor-pointer bg-transparent rounded-lg"
                        />
                      </div>
                      <div className="flex items-center gap-3">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Stay</label>
                        <div className="flex items-center gap-1 bg-gray-50 border border-gray-100 rounded-xl px-2">
                          <input 
                            type="number" 
                            value={slide.duration} 
                            onChange={(e) => updateSlide(slide.id, { duration: parseInt(e.target.value) || 1 })}
                            className="w-12 bg-transparent py-2 text-sm text-center font-black text-indigo-600 outline-none"
                          />
                          <span className="text-[10px] font-bold text-gray-400 pr-1">SEC</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {(slide.type === SlideType.ONLY_IMAGE || slide.type === SlideType.IMAGE_AND_TEXT) && (
                      <div className="flex flex-col sm:flex-row gap-3">
                        <input 
                          type="text" 
                          placeholder="Resource URL (Unsplash/Web)" 
                          className="flex-1 bg-gray-50 border-2 border-gray-100 rounded-xl px-4 py-3 text-sm font-bold focus:border-indigo-400 outline-none transition-all"
                          value={slide.content.imageUrl}
                          onChange={(e) => updateSlide(slide.id, { content: { ...slide.content, imageUrl: e.target.value } })}
                        />
                        <div className="flex items-center">
                          <input 
                            type="file" 
                            id={`file-${slide.id}`} 
                            className="hidden" 
                            accept="image/*"
                            onChange={(e) => handleFileUpload(slide.id, e)}
                          />
                          <label htmlFor={`file-${slide.id}`} className="cursor-pointer bg-white border-2 border-indigo-100 text-indigo-700 rounded-xl px-6 py-3 text-sm font-black hover:bg-indigo-50 transition-all uppercase tracking-widest">
                            Upload
                          </label>
                        </div>
                      </div>
                    )}

                    {slide.type === SlideType.GOOGLE_DRIVE && (
                      <div className="space-y-3">
                        <div className="flex items-center gap-3 bg-indigo-50 p-4 rounded-xl border border-indigo-100">
                          <Share2 size={24} className="text-indigo-600" />
                          <div className="flex-1">
                            <p className="text-xs font-black text-indigo-900 uppercase">Paste Google Drive Share Link</p>
                            <input 
                              type="text" 
                              placeholder="https://drive.google.com/file/d/..." 
                              className="w-full bg-white border border-indigo-200 rounded-lg px-3 py-2 text-sm font-bold mt-1 outline-none"
                              onChange={(e) => processDriveLink(slide.id, e.target.value)}
                            />
                          </div>
                        </div>
                        <p className="text-[10px] text-gray-400 font-bold italic">Note: File must be set to "Anyone with the link can view".</p>
                      </div>
                    )}

                    {(slide.type === SlideType.ONLY_TEXT || slide.type === SlideType.IMAGE_AND_TEXT) && (
                      <textarea 
                        placeholder="Dynamic content message..."
                        className="w-full bg-gray-50 border-2 border-gray-100 rounded-xl px-4 py-3 text-sm font-bold focus:border-indigo-400 outline-none transition-all"
                        rows={2}
                        value={slide.content.text}
                        onChange={(e) => updateSlide(slide.id, { content: { ...slide.content, text: e.target.value } })}
                      />
                    )}

                    {slide.type === SlideType.HTML_PAGE && (
                      <input 
                        type="url" 
                        placeholder="Public Website Address"
                        className="w-full bg-gray-50 border-2 border-gray-100 rounded-xl px-4 py-3 text-sm font-bold focus:border-indigo-400 outline-none transition-all"
                        value={slide.content.htmlUrl}
                        onChange={(e) => updateSlide(slide.id, { content: { ...slide.content, htmlUrl: e.target.value } })}
                      />
                    )}

                    {slide.type === SlideType.NAS_FOLDER && (
                      <div className="bg-emerald-50 p-6 rounded-2xl border-2 border-dashed border-emerald-200">
                        <p className="text-xs text-emerald-800 font-black uppercase tracking-widest mb-4">Sequence Browser</p>
                        <input 
                          type="file" 
                          {...({ webkitdirectory: "true", directory: "true" } as any)}
                          multiple
                          onChange={(e) => handleFolderUpload(slide.id, e)}
                          className="text-xs file:mr-6 file:py-3 file:px-8 file:rounded-xl file:border-0 file:text-[10px] file:font-black file:uppercase file:tracking-widest file:bg-emerald-600 file:text-white hover:file:bg-emerald-700 cursor-pointer w-full"
                        />
                        <p className="mt-4 text-[10px] text-emerald-600 font-bold uppercase italic">All selected images will cycle automatically.</p>
                      </div>
                    )}
                  </div>
                </div>

                <button 
                  onClick={() => deleteSlide(slide.id)}
                  className="absolute top-4 right-4 text-gray-300 hover:text-red-500 transition-all p-3 bg-gray-50 group-hover:bg-white rounded-full hover:shadow-md"
                >
                  <Trash2 size={22} strokeWidth={2.5} />
                </button>
              </div>
            </div>
          ))}
          
          {slides.length === 0 && (
            <div className="flex flex-col items-center justify-center p-32 bg-white rounded-[40px] border-4 border-dashed border-gray-100 text-gray-300">
               <AlertCircle size={80} strokeWidth={1} className="mb-6 text-indigo-100" />
               <p className="text-xl font-black uppercase tracking-[0.2em]">Playlist Empty</p>
               <p className="text-sm font-bold mt-2 opacity-60">Add some content to begin broadcasting.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};