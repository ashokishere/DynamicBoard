
import React, { useState } from 'react';
import { Slide, SlideType, GlobalSettings, TextLayout, TextAlignment } from '../types';
import { Play, Plus, Trash2, Layout, Image as ImageIcon, Type, Globe, FolderOpen, AlertCircle, Settings, Palette, Star, Share2, Type as TypeIcon, Maximize, Bold, Italic, Highlighter, ExternalLink, AlignLeft, AlignCenter, AlignRight, Layers, Columns } from 'lucide-react';
import { DEFAULT_IMAGES, PRESETS } from '../constants';

interface SignageEditorProps {
  slides: Slide[];
  onSlidesChange: (slides: Slide[]) => void;
  globalSettings: GlobalSettings;
  onSettingsChange: (settings: GlobalSettings) => void;
  onPlay: () => void;
}

const FONT_OPTIONS = [
  { id: 'sans', label: 'Inter (Modern Sans)' },
  { id: 'montserrat', label: 'Montserrat (Geometric)' },
  { id: 'bebas', label: 'Bebas Neue (Heavy Display)' },
  { id: 'playfair', label: 'Playfair (Elegant Serif)' },
  { id: 'lora', label: 'Lora (Editorial Serif)' },
  { id: 'mono', label: 'Roboto Mono (Technical)' },
];

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
      fontSize: 100,
      fontFamily: 'sans',
      isBold: true,
      isItalic: false,
      textColor: '#FFFFFF',
      highlightColor: '#F59E0B',
      textLayout: type === SlideType.IMAGE_AND_TEXT ? 'SPLIT' : 'OVERLAY',
      textAlignment: 'center',
      content: {
        imageUrl: customUrl || (type === SlideType.ONLY_IMAGE || type === SlideType.IMAGE_AND_TEXT 
          ? DEFAULT_IMAGES[Math.floor(Math.random() * DEFAULT_IMAGES.length)] 
          : ''),
        text: type === SlideType.ONLY_TEXT || type === SlideType.IMAGE_AND_TEXT 
          ? 'Enter your [[highlighted]] message...' 
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
      const imageFiles = Array.from(files).filter(f => f.type.startsWith('image/'));
      let loaded = 0;
      imageFiles.forEach(file => {
        const reader = new FileReader();
        reader.onloadend = () => {
          fileUrls.push(reader.result as string);
          loaded++;
          if (loaded === imageFiles.length) {
            updateSlide(id, { content: { ...slides.find(s => s.id === id)?.content, folderFiles: fileUrls } });
          }
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const processDriveLink = (id: string, url: string) => {
    let directUrl = url;
    const match = url.match(/\/file\/d\/(.+?)\/(?:view|edit)/) || url.match(/id=(.+?)(&|$)/);
    if (match && match[1]) {
      directUrl = `https://lh3.googleusercontent.com/d/${match[1]}=s1920`;
    }
    updateSlide(id, { content: { ...slides.find(s => s.id === id)?.content, imageUrl: directUrl } });
  };

  const canHaveTypography = (type: SlideType) => 
    [SlideType.ONLY_IMAGE, SlideType.IMAGE_AND_TEXT, SlideType.ONLY_TEXT, SlideType.NAS_FOLDER, SlideType.GOOGLE_DRIVE].includes(type);

  return (
    <div className="flex-1 max-w-6xl mx-auto w-full p-4 md:p-8">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6">
        <div>
          <h1 className="text-4xl font-black text-gray-900 tracking-tighter">FLUX BOARD PRO</h1>
          <p className="text-gray-500 font-medium italic">Digital Signage Master Control & Playback Engine</p>
        </div>
        <div className="flex gap-4">
          <button onClick={() => setShowGlobalSettings(!showGlobalSettings)} className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-bold border transition-all ${showGlobalSettings ? 'bg-indigo-600 text-white border-indigo-600 shadow-lg' : 'bg-white border-gray-200 hover:border-indigo-500'}`}>
            <Settings size={20} /> Settings
          </button>
          <button onClick={onPlay} disabled={slides.length === 0} className="flex items-center gap-2 bg-black text-white px-10 py-3 rounded-2xl font-black shadow-2xl hover:scale-105 active:scale-95 transition-all disabled:opacity-50">
            <Play size={20} fill="currentColor" /> LAUNCH BOARD
          </button>
        </div>
      </header>

      {showGlobalSettings && (
        <div className="mb-12 bg-white rounded-[40px] border border-gray-100 shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
          <div className="p-8 bg-indigo-50/50 border-b border-indigo-100 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <h2 className="text-xl font-black text-indigo-900 flex items-center gap-2 uppercase tracking-tight">
              <Settings size={24} /> Configuration & Assets
            </h2>
            <div className="flex gap-2 bg-white/50 p-1 rounded-xl border border-indigo-100">
              {(['week', 'season', 'month'] as const).map(tab => (
                <button key={tab} onClick={() => setActivePresetTab(tab)} className={`capitalize flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-black transition-all ${activePresetTab === tab ? 'bg-indigo-600 text-white shadow-md' : 'text-indigo-700 hover:bg-indigo-100'}`}>
                  {tab} Presets
                </button>
              ))}
            </div>
          </div>
          
          <div className="p-8 space-y-10">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-3">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Global Header</label>
                <input type="text" className="w-full bg-gray-50 border rounded-xl px-4 py-3 font-bold" value={globalSettings.headerText} onChange={(e) => onSettingsChange({...globalSettings, headerText: e.target.value})} />
              </div>
              <div className="space-y-3">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Ticker Footer</label>
                <input type="text" className="w-full bg-gray-50 border rounded-xl px-4 py-3 font-bold" value={globalSettings.footerText} onChange={(e) => onSettingsChange({...globalSettings, footerText: e.target.value})} />
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Star size={16} className="text-amber-500 fill-amber-500" />
                <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Quick-Add Image Assets</h3>
              </div>
              <div className="flex gap-4 overflow-x-auto pb-4">
                {PRESETS[activePresetTab].map((url, i) => (
                  <div key={i} className="relative group shrink-0 w-32 h-44 rounded-2xl overflow-hidden border-2 border-gray-100 hover:border-indigo-500 transition-all cursor-pointer shadow-sm">
                    <img src={url} alt="Preset" className="w-full h-full object-cover" />
                    <button onClick={() => addSlide(SlideType.ONLY_IMAGE, url)} className="absolute inset-0 bg-indigo-600/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <Plus className="text-white" size={32} strokeWidth={3} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
        <div className="lg:col-span-1 space-y-3">
          <h2 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] mb-4 px-2">Components</h2>
          {[
            { type: SlideType.ONLY_IMAGE, icon: ImageIcon, label: 'Full Image' },
            { type: SlideType.IMAGE_AND_TEXT, icon: Layout, label: 'Media + Captions' },
            { type: SlideType.ONLY_TEXT, icon: Type, label: 'Typography' },
            { type: SlideType.HTML_PAGE, icon: Globe, label: 'Live Website' },
            { type: SlideType.NAS_FOLDER, icon: FolderOpen, label: 'NAS Folder' },
            { type: SlideType.GOOGLE_DRIVE, icon: Share2, label: 'Google Drive' },
          ].map((btn) => (
            <button key={btn.type} onClick={() => setActiveType(btn.type)} className={`w-full flex items-center gap-4 p-5 rounded-2xl font-black text-sm transition-all border ${activeType === btn.type ? 'bg-indigo-600 border-indigo-600 text-white shadow-xl' : 'bg-white text-gray-600 hover:bg-gray-50 border-gray-100'}`}>
              <btn.icon size={20} strokeWidth={2.5} /> {btn.label}
            </button>
          ))}
          <button onClick={() => addSlide()} className="w-full mt-4 flex items-center justify-center gap-2 bg-black text-white p-5 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl hover:bg-gray-900 active:scale-95 transition-all">
            <Plus size={20} /> ADD SLIDE
          </button>
        </div>

        <div className="lg:col-span-3 space-y-8 pb-32">
          {slides.map((slide, index) => (
            <div key={slide.id} className="bg-white rounded-[40px] border border-gray-100 shadow-sm p-8 relative group border-l-[16px]" style={{ borderLeftColor: slide.backgroundColor || globalSettings.backgroundColor }}>
              <div className="flex flex-col xl:flex-row gap-10">
                <div className="w-full xl:w-56 h-40 bg-gray-100 rounded-3xl overflow-hidden relative shadow-inner shrink-0">
                  {slide.type === SlideType.NAS_FOLDER ? (
                    <div className="w-full h-full flex flex-col items-center justify-center bg-emerald-50 text-emerald-600">
                      <FolderOpen size={40} />
                      <span className="text-[10px] font-black mt-2 uppercase tracking-widest">{slide.content.folderFiles?.length || 0} ITEMS</span>
                    </div>
                  ) : slide.content.imageUrl ? (
                    <img src={slide.content.imageUrl} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center opacity-20"><ImageIcon size={48} /></div>
                  )}
                  <div className="absolute top-4 left-4 bg-black/80 text-white text-[10px] px-3 py-1 rounded-full font-black">SLIDE {index + 1}</div>
                </div>

                <div className="flex-1 space-y-6">
                  <div className="flex flex-wrap items-center justify-between gap-4">
                     <div className="flex items-center gap-3 bg-gray-50 px-4 py-2 rounded-xl border">
                        <Palette size={16} className="text-gray-400" />
                        <input type="color" value={slide.backgroundColor} onChange={(e) => updateSlide(slide.id, { backgroundColor: e.target.value })} className="w-6 h-6 p-0 border-0 bg-transparent cursor-pointer" />
                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">BG Color</span>
                     </div>
                     <div className="flex items-center gap-2 bg-gray-50 px-4 py-2 rounded-xl border">
                        <span className="text-[10px] font-black text-gray-400">DURATION</span>
                        <input type="number" value={slide.duration} onChange={(e) => updateSlide(slide.id, { duration: parseInt(e.target.value) || 1 })} className="w-12 bg-transparent font-black text-indigo-600 text-center outline-none" />
                        <span className="text-[10px] font-black text-gray-400">SEC</span>
                     </div>
                  </div>

                  {canHaveTypography(slide.type) && (
                    <div className="space-y-6 bg-indigo-50/30 p-6 rounded-3xl border border-indigo-100/50">
                       <div className="flex flex-wrap items-center gap-4">
                          <select value={slide.fontFamily} onChange={(e) => updateSlide(slide.id, { fontFamily: e.target.value as any })} className="bg-white border rounded-lg px-3 py-2 text-xs font-bold outline-none">
                            {FONT_OPTIONS.map(f => <option key={f.id} value={f.id}>{f.label}</option>)}
                          </select>
                          <div className="flex gap-1 border-r border-indigo-100 pr-4">
                             <button onClick={() => updateSlide(slide.id, { isBold: !slide.isBold })} className={`p-2 rounded-lg transition-all ${slide.isBold ? 'bg-black text-white' : 'bg-white text-gray-400 hover:bg-gray-100'}`}><Bold size={16}/></button>
                             <button onClick={() => updateSlide(slide.id, { isItalic: !slide.isItalic })} className={`p-2 rounded-lg transition-all ${slide.isItalic ? 'bg-black text-white' : 'bg-white text-gray-400 hover:bg-gray-100'}`}><Italic size={16}/></button>
                          </div>
                          
                          <div className="flex gap-1 border-r border-indigo-100 pr-4">
                             <button onClick={() => updateSlide(slide.id, { textAlignment: 'left' })} className={`p-2 rounded-lg ${slide.textAlignment === 'left' ? 'bg-indigo-600 text-white' : 'text-gray-400 hover:bg-gray-100'}`}><AlignLeft size={16}/></button>
                             <button onClick={() => updateSlide(slide.id, { textAlignment: 'center' })} className={`p-2 rounded-lg ${slide.textAlignment === 'center' ? 'bg-indigo-600 text-white' : 'text-gray-400 hover:bg-gray-100'}`}><AlignCenter size={16}/></button>
                             <button onClick={() => updateSlide(slide.id, { textAlignment: 'right' })} className={`p-2 rounded-lg ${slide.textAlignment === 'right' ? 'bg-indigo-600 text-white' : 'text-gray-400 hover:bg-gray-100'}`}><AlignRight size={16}/></button>
                          </div>

                          <div className="flex gap-1">
                             <button onClick={() => updateSlide(slide.id, { textLayout: 'SPLIT' })} className={`p-2 rounded-lg flex items-center gap-2 text-[10px] font-black ${slide.textLayout === 'SPLIT' ? 'bg-indigo-600 text-white' : 'bg-white text-gray-400'}`}><Columns size={14}/> SPLIT</button>
                             <button onClick={() => updateSlide(slide.id, { textLayout: 'OVERLAY' })} className={`p-2 rounded-lg flex items-center gap-2 text-[10px] font-black ${slide.textLayout === 'OVERLAY' ? 'bg-indigo-600 text-white' : 'bg-white text-gray-400'}`}><Layers size={14}/> OVERLAY</button>
                          </div>

                          <div className="flex items-center gap-3 ml-auto">
                             <div className="flex items-center gap-1 group">
                                <input type="color" value={slide.textColor} onChange={(e) => updateSlide(slide.id, { textColor: e.target.value })} className="w-6 h-6 rounded border-0 p-0 cursor-pointer" />
                                <span className="text-[9px] font-black text-gray-400 uppercase">Base</span>
                             </div>
                             <div className="flex items-center gap-1 group">
                                <input type="color" value={slide.highlightColor} onChange={(e) => updateSlide(slide.id, { highlightColor: e.target.value })} className="w-6 h-6 rounded border-0 p-0 cursor-pointer" />
                                <span className="text-[9px] font-black text-gray-400 uppercase">Accent</span>
                             </div>
                          </div>
                       </div>
                       <div className="space-y-2">
                          <div className="flex justify-between text-[10px] font-black text-indigo-400 uppercase tracking-widest"><span>Font Scale</span><span>{slide.fontSize}%</span></div>
                          <input type="range" min="30" max="300" value={slide.fontSize} onChange={(e) => updateSlide(slide.id, { fontSize: parseInt(e.target.value) })} className="w-full h-1 bg-indigo-100 rounded-full appearance-none accent-indigo-600 cursor-pointer" />
                       </div>
                       <textarea value={slide.content.text} onChange={(e) => updateSlide(slide.id, { content: {...slide.content, text: e.target.value} })} className="w-full bg-white border rounded-2xl p-4 text-sm font-medium focus:ring-2 ring-indigo-200 outline-none transition-all min-h-[100px]" placeholder="Signage message here... (optional for images)" />
                       <p className="text-[9px] text-gray-400 font-bold px-2 flex items-center gap-1">
                          <Highlighter size={10} /> Tip: Use [[word]] for character-specific highlight colors.
                       </p>
                    </div>
                  )}

                  <div className="space-y-3">
                    {slide.type === SlideType.NAS_FOLDER && (
                      <div className="flex items-center gap-4">
                        <input type="file" id={`folder-${slide.id}`} {...({ webkitdirectory: "", directory: "" } as any)} multiple className="hidden" onChange={(e) => handleFolderUpload(slide.id, e)} />
                        <label htmlFor={`folder-${slide.id}`} className="flex-1 bg-emerald-600 text-white text-center py-4 rounded-2xl font-black text-xs uppercase tracking-widest cursor-pointer hover:bg-emerald-700 flex items-center justify-center gap-2 transition-all">
                          <FolderOpen size={16} /> SELECT LOCAL DIRECTORY IMAGES
                        </label>
                      </div>
                    )}
                    {slide.type === SlideType.GOOGLE_DRIVE && (
                      <div className="flex gap-2">
                        <input type="text" placeholder="Paste Google Drive Sharing Link..." className="flex-1 bg-gray-50 border rounded-xl px-4 py-3 text-sm font-bold" onChange={(e) => processDriveLink(slide.id, e.target.value)} />
                        <div className="bg-indigo-100 text-indigo-700 px-4 flex items-center rounded-xl"><Share2 size={16}/></div>
                      </div>
                    )}
                    {(slide.type === SlideType.ONLY_IMAGE || slide.type === SlideType.IMAGE_AND_TEXT) && (
                      <div className="flex gap-2">
                        <input type="text" placeholder="Image URL..." className="flex-1 bg-gray-50 border rounded-xl px-4 py-3 text-sm font-bold" value={slide.content.imageUrl} onChange={(e) => updateSlide(slide.id, { content: {...slide.content, imageUrl: e.target.value} })} />
                        <input type="file" id={`file-${slide.id}`} className="hidden" accept="image/*" onChange={(e) => handleFileUpload(slide.id, e)} />
                        <label htmlFor={`file-${slide.id}`} className="bg-white border-2 border-indigo-600 text-indigo-600 px-6 py-3 rounded-xl text-xs font-black cursor-pointer hover:bg-indigo-50 transition-all">LOCAL</label>
                      </div>
                    )}
                    {slide.type === SlideType.HTML_PAGE && (
                      <div className="flex gap-2">
                        <input type="url" placeholder="https://website.com" className="flex-1 bg-gray-50 border rounded-xl px-4 py-3 text-sm font-bold" value={slide.content.htmlUrl} onChange={(e) => updateSlide(slide.id, { content: {...slide.content, htmlUrl: e.target.value} })} />
                        <div className="bg-blue-100 text-blue-700 px-4 flex items-center rounded-xl"><ExternalLink size={16}/></div>
                      </div>
                    )}
                  </div>
                </div>

                <button onClick={() => deleteSlide(slide.id)} className="absolute top-8 right-8 text-gray-300 hover:text-red-500 transition-all p-3 hover:bg-red-50 rounded-full">
                  <Trash2 size={24} />
                </button>
              </div>
            </div>
          ))}

          {slides.length === 0 && (
            <div className="py-48 text-center bg-white rounded-[64px] border-4 border-dashed border-gray-100 text-gray-300">
               <AlertCircle size={80} className="mx-auto mb-6 opacity-20" />
               <p className="text-2xl font-black uppercase tracking-widest">Board is Offline</p>
               <p className="font-bold mt-2 opacity-50">Create slides on the left or add presets to begin.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};