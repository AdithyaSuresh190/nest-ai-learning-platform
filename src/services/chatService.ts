import type { UserRole } from '@/types';

interface ChatContext {
  role: UserRole;
  userName: string;
}

// Mock AI response generator — simulates an AI assistant tailored to NEST's learning platform.
// In production, this would call an OpenAI/Gemini API through an edge function.
export function generateAIResponse(
  userMessage: string,
  context: ChatContext
): string {
  const msg = userMessage.toLowerCase();
  const name = context.userName || 'friend';

  // Role-specific responses
  if (context.role === 'student') {
    if (msg.match(/help|stuck|confused|don't understand|dont understand|hard|difficult/)) {
      return `Don't worry, ${name}! Learning can be tricky sometimes. Let me help break it down into smaller steps. What specific part is confusing you? Remember, every expert was once a beginner! 💪`;
    }
    if (msg.match(/water cycle|evaporation|condensation|precipitation/)) {
      return `Great question about the water cycle! 🌧️ Here's a simple way to think about it:\n\n1. ☀️ The sun warms water in the ocean, and it floats up as vapor (Evaporation)\n2. ☁️ Up in the sky, the vapor cools and forms clouds (Condensation)\n3. 🌧️ When clouds get heavy, water falls as rain (Precipitation)\n4. 🌊 The rain flows back to the ocean and it starts again!\n\nWould you like to try a fun activity about this?`;
    }
    if (msg.match(/math|add|subtract|plus|minus|number/)) {
      return `Math is like a fun puzzle! 🧩 Let me help:\n\n➕ Addition means putting numbers together. Like 3 apples + 2 apples = 5 apples!\n➖ Subtraction means taking away. Like 5 apples - 2 apples = 3 apples!\n\nWould you like me to give you a practice problem?`;
    }
    if (msg.match(/animal|habitat|where.*live/)) {
      return `Animals live in special homes called habitats! 🐻‍❄️\n\n• Polar bears live in the cold Arctic ❄️\n• Parrots live in the rainforest 🌳\n• Dolphins live in the ocean 🌊\n• Camels live in the desert 🏜️\n\nEach animal's home is perfect for them. What animal is your favorite?`;
    }
    if (msg.match(/color|mix|paint/)) {
      return `Colors are magical! 🎨 When you mix colors:\n\n• Red + Blue = Purple 🟣\n• Blue + Yellow = Green 🟢\n• Red + Yellow = Orange 🟠\n\nRed, Blue, and Yellow are called primary colors because you can mix them to make lots of new colors! Want to learn more about colors?`;
    }
    if (msg.match(/hello|hi|hey|good morning|good afternoon/)) {
      return `Hello, ${name}! 🌟 I'm so happy to chat with you! I can help you with your lessons, explain things in a simpler way, or just be your learning buddy. What would you like to talk about today?`;
    }
    if (msg.match(/story|read|book/)) {
      return `I love stories! 📚 Stories are a wonderful way to learn. Did you know you can read storybooks in your lessons? Each lesson has a fun story with pictures! You can also use the "Explain It My Way" button to get a story about any topic. What kind of story would you like to hear?`;
    }
    if (msg.match(/game|play|fun|activity/)) {
      return `Learning is more fun with games! 🎮 You have lots of activities to try:\n\n🧠 Memory Games — match the pictures\n❓ Quizzes — test what you know\n📇 Flashcards — learn new words\n🔤 Word Recognition — find the right words\n\nGo to the Activities page to start playing! Which one sounds fun to you?`;
    }
    if (msg.match(/teach.?back|explain what i learned/)) {
      return `Teach-Back is a super cool way to show what you've learned! 🎤 You just explain the lesson in your own words — by typing or speaking — and the AI will tell you how well you understood it. It's like being the teacher for a moment! Try it from the Teach-Back page.`;
    }
    if (msg.match(/score|progress|how am i doing|grade/)) {
      return `You're doing great, ${name}! 🌟 You can see all your progress on the My Progress page. It shows your scores, stars, and what you're really good at. Keep up the amazing work!`;
    }
    return `That's a great thing to think about, ${name}! 🌟 I'm here to help you learn. You can ask me about any lesson topic, request a simpler explanation, or just chat. What would you like to know more about?`;
  }

  if (context.role === 'teacher') {
    if (msg.match(/generate|create|upload|content|lesson/)) {
      return `To create a new lesson, go to the Generate Content page! 📚 You can either type a topic or upload a PDF/image, and the AI will automatically create a story, visuals, vocabulary, and interactive activities for your students. It's quick and easy!`;
    }
    if (msg.match(/student|performance|progress|track/)) {
      return `You can track student performance on the Student Performance page! 📊 It shows scores by subject, strengths, areas needing practice, engagement patterns, and Teach-Back submissions. You can also generate detailed reports from the Reports page.`;
    }
    if (msg.match(/report|summary/)) {
      return `The Reports page has everything you need! 📄 It includes subject performance summaries, strengths and areas to improve, AI recommendations, activity logs, and Teach-Back analysis. You can download a complete progress report for each student.`;
    }
    return `Hello, ${name}! 👩‍🏫 I can help you with generating content, tracking student performance, managing lessons, or creating reports. What would you like to do today?`;
  }

  if (context.role === 'parent') {
    if (msg.match(/progress|how.*doing|score|grade/)) {
      return `You can see Maya's detailed progress on the Progress page! 📊 It shows scores by subject, completed lessons, strengths, and areas that need practice. She's doing wonderfully in Math and Art!`;
    }
    if (msg.match(/recommend|suggest|help|support|practice/)) {
      return `The AI Recommendations page has personalized suggestions for Maya! 💡 Based on her learning patterns, I recommend trying the Solar System lesson next and practicing word recognition with flashcards. Audio narration also boosts her focus by 40%.`;
    }
    return `Hello, ${name}! 👨 I can help you understand Maya's learning progress, show you her strengths, or suggest ways to support her learning at home. What would you like to know?`;
  }

  if (context.role === 'therapist') {
    if (msg.match(/pattern|engagement|behavior|learning style/)) {
      return `The Learning Patterns page shows detailed engagement insights! 🧠 Maya is most engaged with story-based and visual learning (85%), and audio narration increases her focus by 40%. She completes 95% of memory games but only 60% of word recognition activities.`;
    }
    if (msg.match(/activity|performance|which.*best/)) {
      return `Maya performs best in Memory Games (88%) and Quizzes (82%). 📊 Word Recognition is her lowest area at 60%. The Activity Performance page has a full breakdown by activity type.`;
    }
    if (msg.match(/teach.?back|understanding|comprehension/)) {
      return `Maya's Teach-Back submissions show strong understanding! 🎤 She scored 92% on the Math lesson and 95% on the Colors lesson. The AI identified that she could practice explaining with more details. You can see full analysis on the Reports page.`;
    }
    if (msg.match(/report|summary|insight/)) {
      return `The Reports page has comprehensive educational insights! 📄 It includes subject performance, learning patterns, engagement data, strengths, areas needing support, and Teach-Back analysis. Note: these are educational insights, not clinical assessments.`;
    }
    return `Hello, ${name}! 👩‍⚕️ I can provide educational learning insights about Maya's patterns, activity performance, engagement levels, and progress. What would you like to explore?`;
  }

  return `Hello! I'm your NEST learning assistant. How can I help you today?`;
}

export const suggestedPrompts: Record<UserRole, string[]> = {
  student: [
    'Can you explain the water cycle?',
    'Help me with math!',
    'Tell me about animal habitats',
    'What activities can I play?',
  ],
  teacher: [
    'How do I generate a new lesson?',
    'How do I track student performance?',
    'How do I create a report?',
  ],
  parent: [
    "How is Maya doing?",
    'What should Maya practice at home?',
    'Show me Maya\'s strengths',
  ],
  therapist: [
    'What are Maya\'s learning patterns?',
    'Which activities does Maya perform best in?',
    'Show me Teach-Back analysis',
  ],
};
