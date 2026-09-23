import { useState, useEffect, useRef } from 'react';
import { MessageSquare, X, Send, Sparkles } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useAccessibility } from '@/context/AccessibilityContext';
import { supabase } from '@/services/supabaseClient';
import { generateAIResponse, suggestedPrompts } from '@/services/chatService';
import { speak, stopSpeaking } from '@/services/tts';
import { Volume2, Square } from 'lucide-react';
import type { UserRole } from '@/types';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  created_at: string;
}

export function ChatModule() {
  const { user } = useAuth();
  const { settings } = useAccessibility();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [typing, setTyping] = useState(false);
  const [readingId, setReadingId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const role = user?.role || 'student';

  useEffect(() => {
    if (open && user) {
      loadMessages();
    }
  }, [open, user]);

  useEffect(() => {
    if (open) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, typing, open]);

  const loadMessages = async () => {
    if (!user) return;
    const { data, error } = await supabase
      .from('chat_messages')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: true })
      .limit(50);

    if (error) {
      console.error('Error loading messages:', error);
      return;
    }

    if (data && data.length > 0) {
      setMessages(data as ChatMessage[]);
    } else {
      // Welcome message for first-time users
      const welcome: ChatMessage = {
        id: 'welcome',
        role: 'assistant',
        content: getWelcomeMessage(role, user.name),
        created_at: new Date().toISOString(),
      };
      setMessages([welcome]);
    }
  };

  const getWelcomeMessage = (role: UserRole, name: string): string => {
    const welcomes: Record<UserRole, string> = {
      student: `Hi ${name}! 🌟 I'm your NEST learning buddy! I can help you with your lessons, explain things in a simpler way, or just chat. What would you like to learn about today?`,
      teacher: `Hello ${name}! 👩‍🏫 I'm your NEST teaching assistant. I can help you generate content, track student progress, or answer questions about your lessons. How can I help?`,
      parent: `Hi ${name}! 👨 I'm here to help you understand your child's learning progress. I can show you strengths, areas to practice, and recommendations. What would you like to know?`,
      therapist: `Hello ${name}! 👩‍⚕️ I can provide educational learning insights about engagement patterns, activity performance, and progress. What would you like to explore?`,
    };
    return welcomes[role];
  };

  const saveMessage = async (msg: Omit<ChatMessage, 'id' | 'created_at'>): Promise<string | null> => {
    if (!user) return null;
    const { data, error } = await supabase
      .from('chat_messages')
      .insert({ ...msg, user_id: user.id })
      .select()
      .maybeSingle();

    if (error) {
      console.error('Error saving message:', error);
      return null;
    }
    return data?.id || null;
  };

  const handleSend = async (text?: string) => {
    const content = (text || input).trim();
    if (!content || loading || !user) return;

    setInput('');
    setLoading(true);

    // Add user message to UI immediately
    const userMsg: ChatMessage = {
      id: `temp-user-${Date.now()}`,
      role: 'user',
      content,
      created_at: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, userMsg]);

    // Save user message to Supabase
    await saveMessage({ role: 'user', content });

    // Simulate AI thinking
    setTyping(true);
    await new Promise((r) => setTimeout(r, 600 + Math.random() * 800));

    // Generate AI response
    const aiContent = generateAIResponse(content, { role, userName: user.name });
    setTyping(false);

    // Save AI response to Supabase
    const savedId = await saveMessage({ role: 'assistant', content: aiContent });

    const aiMsg: ChatMessage = {
      id: savedId || `temp-ai-${Date.now()}`,
      role: 'assistant',
      content: aiContent,
      created_at: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, aiMsg]);
    setLoading(false);
  };

  const handleRead = (msg: ChatMessage) => {
    if (readingId === msg.id) {
      stopSpeaking();
      setReadingId(null);
    } else {
      stopSpeaking();
      setReadingId(msg.id);
      speak(msg.content, { rate: 0.85 });
      // Auto-clear after estimated duration
      const duration = msg.content.length * 80 + 2000;
      setTimeout(() => setReadingId(null), duration);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (!user) return null;

  const prompts = suggestedPrompts[role];

  return (
    <>
      {/* Floating button */}
      <button
        onClick={() => setOpen(!open)}
        className={`fixed bottom-6 right-6 z-40 w-16 h-16 rounded-full bg-gradient-to-br from-nest-blue-400 to-nest-lavender-400 text-white shadow-card flex items-center justify-center hover:scale-110 transition-all ${open ? 'rotate-90' : ''}`}
        aria-label="Open chat"
      >
        {open ? <X className="w-7 h-7" /> : <MessageSquare className="w-7 h-7" />}
        {!open && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-nest-peach-400 rounded-full text-xs flex items-center justify-center font-bold animate-pulse-soft">
            !
          </span>
        )}
      </button>

      {/* Chat panel */}
      {open && (
        <div className="fixed bottom-24 right-6 z-40 w-[calc(100vw-3rem)] sm:w-96 max-h-[70vh] bg-white rounded-3xl shadow-card flex flex-col animate-slide-up overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-nest-blue-400 to-nest-lavender-400 p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-xl">
              🪺
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-white">NEST Learning Buddy</h3>
              <p className="text-xs text-white/70">AI-powered assistant</p>
            </div>
            <span className="w-3 h-3 bg-nest-green-300 rounded-full animate-pulse-soft" />
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-mesh-warm min-h-[300px]">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-2.5 ${
                    msg.role === 'user'
                      ? 'bg-nest-blue-400 text-white rounded-br-md'
                      : 'bg-white text-gray-700 rounded-bl-md shadow-soft border border-gray-100'
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                  {msg.role === 'assistant' && settings.textToSpeech && (
                    <button
                      onClick={() => handleRead(msg)}
                      className="mt-1.5 flex items-center gap-1 text-xs text-gray-400 hover:text-nest-blue-500 transition-colors"
                    >
                      {readingId === msg.id ? (
                        <><Square className="w-3 h-3" /> Stop</>
                      ) : (
                        <><Volume2 className="w-3 h-3" /> Listen</>
                      )}
                    </button>
                  )}
                </div>
              </div>
            ))}

            {/* Typing indicator */}
            {typing && (
              <div className="flex justify-start">
                <div className="bg-white rounded-2xl rounded-bl-md shadow-soft border border-gray-100 px-4 py-3">
                  <div className="flex gap-1">
                    <span className="w-2 h-2 bg-gray-300 rounded-full animate-bounce-soft" style={{ animationDelay: '0ms' }} />
                    <span className="w-2 h-2 bg-gray-300 rounded-full animate-bounce-soft" style={{ animationDelay: '150ms' }} />
                    <span className="w-2 h-2 bg-gray-300 rounded-full animate-bounce-soft" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Suggested prompts */}
          {messages.length <= 1 && (
            <div className="px-4 pb-2 flex flex-wrap gap-2 bg-mesh-warm">
              {prompts.map((prompt) => (
                <button
                  key={prompt}
                  onClick={() => handleSend(prompt)}
                  className="px-3 py-1.5 rounded-full bg-white border border-gray-200 text-xs font-medium text-gray-600 hover:bg-nest-blue-50 hover:border-nest-blue-300 transition-all"
                >
                  {prompt}
                </button>
              ))}
            </div>
          )}

          {/* Input */}
          <div className="p-3 border-t border-gray-100 bg-white">
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type your message..."
                disabled={loading}
                className="flex-1 px-4 py-2.5 rounded-xl border-2 border-gray-200 focus:border-nest-blue-400 outline-none text-sm font-medium text-gray-700"
              />
              <button
                onClick={() => handleSend()}
                disabled={loading || !input.trim()}
                className="w-10 h-10 rounded-xl bg-nest-blue-400 hover:bg-nest-blue-500 text-white flex items-center justify-center disabled:opacity-50 transition-all flex-shrink-0"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
