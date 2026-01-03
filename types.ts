
export enum SlideType {
  ONLY_IMAGE = 'ONLY_IMAGE',
  IMAGE_AND_TEXT = 'IMAGE_AND_TEXT',
  ONLY_TEXT = 'ONLY_TEXT',
  HTML_PAGE = 'HTML_PAGE',
  NAS_FOLDER = 'NAS_FOLDER',
  GOOGLE_DRIVE = 'GOOGLE_DRIVE'
}

export interface Slide {
  id: string;
  type: SlideType;
  content: {
    imageUrl?: string;
    text?: string;
    htmlUrl?: string;
    folderFiles?: string[]; // Base64 or Blob URLs
    driveFileId?: string;
  };
  duration: number; // in seconds
  backgroundColor?: string; // Per-slide background color override
}

export interface GlobalSettings {
  headerText: string;
  footerText: string;
  backgroundColor: string; // Default background color
  headerImage?: string;
  footerImage?: string;
}

export interface SignageConfig {
  slides: Slide[];
  globalSettings: GlobalSettings;
}
