
export enum AppStage {
  ORIENTATION = 'ORIENTATION',
  PILLARS = 'PILLARS',
  VARIATIONS = 'VARIATIONS',
  QUESTIONS = 'QUESTIONS'
}

export type ViewMode = 'HOME' | 'PILLARS' | 'VARIATIONS' | 'QUESTIONS';

export type Language = 'en' | 'ko';

export interface Message {
  id: string;
  role: 'user' | 'model' | 'system';
  text: string;
  timestamp: number;
}

export interface Pillar {
  id: string;
  title: string;
  description: string;
  category: string;
}

export interface LessonVariation {
  id: string;
  title: string;
  description: string;
  angle: string; // e.g., "Beginner Guide", "Controversial Take", "Case Study"
}

export interface AudienceQuestion {
  id: string;
  question: string;
  intent: string; // e.g., "Informational", "Transactional"
}

export interface State {
  apiKey: string | null;
  topic: string | null;
  currentStage: AppStage;
  currentView: ViewMode;
  messages: Message[];
  
  // Data containers
  pillars: Pillar[];
  variations: LessonVariation[];
  questions: AudienceQuestion[];

  // Selection tracking
  selectedPillar: Pillar | null;
  selectedVariation: LessonVariation | null;

  isLoading: boolean;
  language: Language;
}
