export interface Contact {
  id: string;
  name: string;
  email: string;
  avatar: string;
  isFavorite?: boolean;
}

export interface EmailState {
  to: string;
  subject: string;
  body: string;
  cc: string;
  bcc: string;
  hasAttachment: boolean;
  imageStyle?: 'shadow' | 'border' | 'none';
  // Formatting specific states
  isFormatted: boolean; // General flag for progress
  isBold: boolean;
  isItalic: boolean;
  isUnderline: boolean;
  textColor: string;
}

export enum GameStage {
  INTRO = 'INTRO',
  BASICS = 'BASICS',
  SPELL_CHECK = 'SPELL_CHECK',
  FORMATTING_IMAGES = 'FORMATTING_IMAGES',
  CONTACTS_MANAGEMENT = 'CONTACTS_MANAGEMENT',
  ADVANCED_CC_BCC = 'ADVANCED_CC_BCC',
  QUIZ = 'QUIZ',
  CERTIFICATE = 'CERTIFICATE',
}

export interface CorrectionTask {
  id: number;
  wrongWord: string;
  correctWord: string;
  preText: string; // Text before the word
  postText: string; // Text after the word
  isFixed: boolean;
}