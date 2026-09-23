export type UserRole = 'student' | 'teacher' | 'parent' | 'therapist';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar: string;
  avatarUrl?: string;
  bio?: string;
  dateOfBirth?: string;
  phone?: string;
  address?: string;
  // For parent/therapist: linked student IDs
  linkedStudents?: string[];
  // For student: grade level
  gradeLevel?: string;
}

export interface Lesson {
  id: string;
  title: string;
  subject: string;
  description: string;
  difficulty: 1 | 2 | 3 | 4 | 5;
  content: LessonContent;
  activities: Activity[];
  status: 'not-started' | 'in-progress' | 'completed';
  progress: number;
  assignedTo: string[];
  createdAt: string;
  createdBy: string;
  thumbnail: string;
  estimatedTime: number;
}

export interface LessonContent {
  story: string;
  pages: StoryPage[];
  keyPoints: string[];
  vocabulary: { word: string; definition: string; emoji: string }[];
}

export interface StoryPage {
  id: string;
  text: string;
  illustration: string;
  emoji: string;
}

export interface Activity {
  id: string;
  type: 'memory-game' | 'picture-matching' | 'quiz' | 'flashcards' | 'puzzle' | 'word-recognition';
  title: string;
  description: string;
  difficulty: 1 | 2 | 3 | 4 | 5;
  data: ActivityData;
}

export interface ActivityData {
  // Memory game
  cards?: { id: string; emoji: string; label: string }[];
  // Picture matching
  pairs?: { left: { id: string; emoji: string; label: string }; right: { id: string; emoji: string; label: string } }[];
  // Quiz
  questions?: QuizQuestion[];
  // Flashcards
  flashcards?: { front: string; back: string; emoji: string }[];
  // Puzzle
  puzzlePieces?: { id: string; position: number; emoji: string }[];
  // Word recognition
  words?: { word: string; correct: boolean; emoji: string }[];
}

export interface QuizQuestion {
  id: string;
  question: string;
  emoji: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

export interface ProgressEntry {
  id: string;
  studentId: string;
  lessonId: string;
  lessonTitle: string;
  subject: string;
  score: number;
  timeSpent: number;
  date: string;
  activitiesCompleted: number;
  totalActivities: number;
  difficulty: number;
}

export interface LearningInsight {
  id: string;
  studentId: string;
  type: 'strength' | 'needs-practice' | 'recommendation' | 'engagement';
  category: string;
  title: string;
  description: string;
  value: number;
  trend: 'up' | 'down' | 'stable';
}

export interface TeachBackSubmission {
  id: string;
  studentId: string;
  lessonId: string;
  lessonTitle: string;
  mode: 'voice' | 'text';
  content: string;
  aiEvaluation: {
    understandingScore: number;
    strengths: string[];
    weakAreas: string[];
    feedback: string;
  };
  date: string;
}

export interface AccessibilitySettings {
  dyslexiaFont: boolean;
  fontSize: 'small' | 'medium' | 'large' | 'x-large';
  lineSpacing: 'normal' | 'relaxed' | 'wide';
  wordSpacing: 'normal' | 'wide';
  readingRuler: boolean;
  highContrast: boolean;
  colorTheme: 'default' | 'blue' | 'green' | 'warm' | 'high-contrast';
  textToSpeech: boolean;
  largeButtons: boolean;
}
