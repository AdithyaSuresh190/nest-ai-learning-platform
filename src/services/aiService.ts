import type { Lesson, Activity } from '@/types';

// Mock AI service - generates realistic educational content
// In production, this would call OpenAI/Gemini API

export interface AIExplanationResult {
  type: 'simple' | 'visual' | 'story' | 'audio';
  title: string;
  content: string;
  visualDescription: string;
  emoji: string;
}

export interface AITeachBackEvaluation {
  understandingScore: number;
  strengths: string[];
  weakAreas: string[];
  feedback: string;
}

export interface AILessonGeneration {
  title: string;
  subject: string;
  description: string;
  story: string;
  pages: { id: string; text: string; illustration: string; emoji: string }[];
  keyPoints: string[];
  vocabulary: { word: string; definition: string; emoji: string }[];
  activities: Activity[];
}

// Simulate async API call
function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function generateExplanation(
  topic: string,
  type: 'simple' | 'visual' | 'story' | 'audio'
): Promise<AIExplanationResult> {
  await delay(800);

  const explanations: Record<string, AIExplanationResult> = {
    simple: {
      type: 'simple',
      title: 'Simple Explanation',
      content: `${topic} is a concept that can be understood step by step. Let's break it down into small, easy pieces. Think of it like building blocks - each piece connects to make the whole picture. When you understand each piece, the whole thing makes sense!`,
      visualDescription: 'Imagine colorful building blocks stacking together',
      emoji: '🧱',
    },
    visual: {
      type: 'visual',
      title: 'Visual Explanation',
      content: `Picture this: ${topic} works like a big machine with different parts. Each part has a job to do. When all the parts work together, the machine runs smoothly. You can see how each piece connects to the next one, like a puzzle coming together!`,
      visualDescription: 'A colorful diagram showing connected parts working together',
      emoji: '🎨',
    },
    story: {
      type: 'story',
      title: 'Story Explanation',
      content: `Once upon a time, there was a curious little robot named Bit who wanted to understand ${topic}. Bit went on an adventure and met helpful friends along the way. Each friend taught Bit something new about ${topic}. By the end of the journey, Bit understood everything and was so happy! And just like Bit, you can understand it too!`,
      visualDescription: 'A friendly robot on an adventure meeting new friends',
      emoji: '🤖',
    },
    audio: {
      type: 'audio',
      title: 'Audio Explanation',
      content: `Let me explain ${topic} to you in a friendly voice. ${topic} is something that happens when different things work together. It's like when you and your friends play a game - everyone has a part to play, and when you all do your parts, the game is fun! That's how ${topic} works too.`,
      visualDescription: 'Sound waves with a friendly face',
      emoji: '🔊',
    },
  };

  return explanations[type];
}

export async function evaluateTeachBack(
  content: string,
  lessonTitle: string
): Promise<AITeachBackEvaluation> {
  await delay(1200);

  const wordCount = content.trim().split(/\s+/).length;
  const baseScore = Math.min(95, 60 + wordCount * 2);

  const strengths = [
    'Shows good understanding of the main concept',
    'Uses examples to explain ideas',
    'Demonstrates recall of key vocabulary',
  ];

  const weakAreas: string[] = [];
  if (wordCount < 20) {
    weakAreas.push('Try to explain with more details');
    strengths.pop();
  }
  if (!content.includes('because')) {
    weakAreas.push('Practice explaining WHY things happen, not just WHAT');
  }

  const score = Math.max(50, Math.min(98, baseScore - (weakAreas.length * 5)));

  const feedback =
    score >= 85
      ? `Amazing job! You really understand ${lessonTitle}! Your explanation shows that you learned a lot. Keep up the great work!`
      : score >= 70
        ? `Good work! You understand the main ideas of ${lessonTitle}. Try adding a few more details next time to make your explanation even better!`
        : `Nice try! You're on the right track with ${lessonTitle}. Let's review the lesson again and try to explain a few more details next time!`;

  return {
    understandingScore: score,
    strengths: strengths.slice(0, 2 + Math.floor(score / 30)),
    weakAreas,
    feedback,
  };
}

export async function generateLesson(prompt: string): Promise<AILessonGeneration> {
  await delay(2000);

  // Generate a lesson from the prompt
  const subject = detectSubject(prompt);
  const title = generateTitle(prompt);
  const story = generateStory(prompt, title);
  const pages = generatePages(story);
  const keyPoints = generateKeyPoints(prompt);
  const vocabulary = generateVocabulary(prompt);
  const activities = generateActivities(prompt, subject);

  return {
    title,
    subject,
    description: `An AI-generated lesson about ${prompt}. Designed to be fun, visual, and easy to understand!`,
    story,
    pages,
    keyPoints,
    vocabulary,
    activities,
  };
}

function detectSubject(prompt: string): string {
  const lower = prompt.toLowerCase();
  if (lower.match(/math|number|add|subtract|count|multiply|divide|fraction/)) return 'Math';
  if (lower.match(/science|water|animal|plant|space|planet|energy|body|weather/)) return 'Science';
  if (lower.match(/history|community|kindness|friend|family|world|country|culture/)) return 'Social Studies';
  if (lower.match(/color|paint|draw|art|music|creative/)) return 'Art';
  if (lower.match(/read|write|letter|word|story|grammar|poem/)) return 'English';
  return 'Science';
}

function generateTitle(prompt: string): string {
  const words = prompt.split(' ').slice(0, 4).join(' ');
  return `The Story of ${words}`;
}

function generateStory(prompt: string, title: string): string {
  return `Once upon a time, there was a wonderful world full of ${prompt}. A curious child named Alex wanted to learn all about it. Alex went on an amazing adventure to discover how ${prompt} works. Along the way, Alex met friendly helpers who explained everything in simple, fun ways. Alex learned that ${prompt} is fascinating and not as hard as it seemed! By the end of the adventure, Alex was an expert and couldn't wait to share what they learned with friends!`;
}

function generatePages(story: string): { id: string; text: string; illustration: string; emoji: string }[] {
  const sentences = story.split('. ');
  const emojis = ['🌟', '🚀', '🎈', '🎉', '🌈'];
  return sentences.slice(0, 5).map((sentence, i) => ({
    id: `p${i + 1}`,
    text: sentence.trim() + '.',
    illustration: `illustration-${i + 1}`,
    emoji: emojis[i % emojis.length],
  }));
}

function generateKeyPoints(prompt: string): string[] {
  return [
    `${prompt} is an important concept to understand`,
    'Breaking it into smaller parts makes it easier',
    'Visual examples help us learn faster',
    'Practice makes perfect!',
  ];
}

function generateVocabulary(prompt: string): { word: string; definition: string; emoji: string }[] {
  const words = prompt.split(' ').slice(0, 4);
  return words.map((word, i) => ({
    word: word.charAt(0).toUpperCase() + word.slice(1),
    definition: `An important word related to ${prompt}`,
    emoji: ['📖', '💡', '🔍', '📝'][i % 4],
  }));
}

function generateActivities(prompt: string, subject: string): Activity[] {
  return [
    {
      id: `act-${Date.now()}-1`,
      type: 'quiz',
      title: `${subject} Quiz`,
      description: 'Test what you learned!',
      difficulty: 2,
      data: {
        questions: [
          { id: 'gq1', question: `What is the main topic of this lesson?`, emoji: '📚', options: [prompt, 'Something else', 'Not sure', 'Nothing'], correctAnswer: 0, explanation: `The main topic is ${prompt}!` },
          { id: 'gq2', question: 'How should we learn new things?', emoji: '💡', options: ['All at once', 'Step by step', 'Give up', 'Skip it'], correctAnswer: 1, explanation: 'Breaking things into steps makes learning easier!' },
          { id: 'gq3', question: 'What helps us learn better?', emoji: '🎨', options: ['Pictures and stories', 'Nothing', 'Being bored', 'Skipping practice'], correctAnswer: 0, explanation: 'Pictures and stories make learning fun and easier!' },
        ],
      },
    },
    {
      id: `act-${Date.now()}-2`,
      type: 'flashcards',
      title: 'Word Flashcards',
      description: 'Learn important words!',
      difficulty: 1,
      data: {
        flashcards: [
          { front: 'Learn', back: 'To gain new knowledge', emoji: '📚' },
          { front: 'Practice', back: 'Doing something again to get better', emoji: '🔄' },
          { front: 'Understand', back: 'To know what something means', emoji: '💡' },
          { front: 'Discover', back: 'To find something new', emoji: '🔍' },
        ],
      },
    },
    {
      id: `act-${Date.now()}-3`,
      type: 'memory-game',
      title: 'Memory Match',
      description: 'Match the pictures!',
      difficulty: 2,
      data: {
        cards: [
          { id: 'gc1', emoji: '🌟', label: 'Star' },
          { id: 'gc2', emoji: '🎈', label: 'Balloon' },
          { id: 'gc3', emoji: '🎨', label: 'Art' },
          { id: 'gc4', emoji: '📚', label: 'Book' },
          { id: 'gc5', emoji: '🚀', label: 'Rocket' },
          { id: 'gc6', emoji: '🌈', label: 'Rainbow' },
        ],
      },
    },
  ];
}

export async function getRecommendations(studentId: string): Promise<string[]> {
  await delay(500);
  return [
    'Try the Solar System Journey lesson - it matches your interest in Science!',
    'Practice word recognition with flashcards to improve reading skills',
    'Listen to the audio narration while reading for better focus',
    'Try the Teach-Back activity after completing the Water Cycle lesson',
  ];
}
