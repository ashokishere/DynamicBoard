
export enum SlideType {
  ONLY_IMAGE = 'ONLY_IMAGE',
  IMAGE_AND_TEXT = 'IMAGE_AND_TEXT',
  ONLY_TEXT = 'ONLY_TEXT',
  HTML_PAGE = 'HTML_PAGE',
  NAS_FOLDER = 'NAS_FOLDER',
  GOOGLE_DRIVE = 'GOOGLE_DRIVE'
}

export type TextLayout = 'SPLIT' | 'OVERLAY';
export type TextAlignment = 'left' | 'center' | 'right';

export interface Slide {
  id: string;
  type: SlideType;
  content: {
    imageUrl?: string;
    text?: string;
    htmlUrl?: string;
    folderFiles?: string[]; 
    driveFileId?: string;
  };
  duration: number;
  backgroundColor?: string;
  
  // Advanced Typography & Layout
  fontSize?: number; 
  fontFamily?: 'sans' | 'serif' | 'mono' | 'display' | 'montserrat' | 'playfair' | 'bebas' | 'lora';
  isItalic?: boolean;
  isBold?: boolean;
  textColor?: string;
  highlightColor?: string;
  textLayout?: TextLayout;
  textAlignment?: TextAlignment;
}

export interface GlobalSettings {
  headerText: string;
  footerText: string;
  backgroundColor: string;
  headerImage?: string;
  footerImage?: string;
  defaultTextColor?: string;
  defaultHighlightColor?: string;
}

export interface SignageConfig {
  slides: Slide[];
  globalSettings: GlobalSettings;
}