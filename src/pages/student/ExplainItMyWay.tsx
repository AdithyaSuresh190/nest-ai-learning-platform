import { useState } from 'react';
import { Card, Button, Spinner, Badge } from '@/components/ui/Card';
import { useAccessibility } from '@/context/AccessibilityContext';
import { generateExplanation, type AIExplanationResult } from '@/services/aiService';
import { speak, stopSpeaking } from '@/services/tts';
import { Sparkles, Type, Eye, BookOpen, Volume2, Square, Lightbulb } from 'lucide-react';

type ExplanationType = 'simple' | 'visual' | 'story' | 'audio';

const types: { value: ExplanationType; label: string; icon: typeof Type; color: string; description: string }[] = [
  { value: 'simple', label: 'Simple Text', icon: Type, color: 'nest-blue', description: 'Easy words and short sentences' },
  { value: 'visual', label: 'Visual Explanation', icon: Eye, color: 'nest-lavender', description: 'See it with pictures and diagrams' },
  { value: 'story', label: 'Story Explanation', icon: BookOpen, color: 'nest-green', description: 'Learn through a fun story' },
  { value: 'audio', label: 'Audio Explanation', icon: Volume2, color: 'nest-peach', description: 'Listen to a friendly voice' },
];

const suggestions = ['The Water Cycle', 'Addition and Subtraction', 'Animal Habitats', 'Colors', 'The Solar System', 'Kindness'];

export function ExplainItMyWay() {
  const { settings } = useAccessibility();
  const [topic, setTopic] = useState('');
  const [selectedType, setSelectedType] = useState<ExplanationType>('simple');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AIExplanationResult | null>(null);
  const [isReading, setIsReading] = useState(false);

  const handleExplain = async () => {
    if (!topic.trim()) return;
    setLoading(true);
    setResult(null);
    const res = await generateExplanation(topic, selectedType);
    setResult(res);
    setLoading(false);
    if (selectedType === 'audio' && settings.textToSpeech) {
      speak(res.content, { rate: 0.85 });
      setIsReading(true);
    }
  };

  const handleRead = () => {
    if (isReading) {
      stopSpeaking();
      setIsReading(false);
    } else if (result) {
      speak(result.content, { rate: 0.85 });
      setIsReading(true);
      setTimeout(() => setIsReading(false), result.content.length * 80 + 2000);
    }
  };

  return (
    <div className="space-y-6 animate-slide-up">
      <div>
        <div className="flex items-center gap-3 mb-2">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-nest-lavender-400 to-nest-blue-400 flex items-center justify-center text-white">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-gray-800">Explain It My Way</h1>
            <p className="text-gray-400">Type any topic and get an explanation that works for YOU!</p>
          </div>
        </div>
      </div>

      {/* Input */}
      <Card className="bg-gradient-to-br from-nest-lavender-50 to-nest-blue-50 border-nest-lavender-200">
        <label className="block text-sm font-semibold text-gray-600 mb-2">What do you want to learn about?</label>
        <input
          type="text"
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          placeholder="Type a topic like 'The Water Cycle' or 'Addition'"
          className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-nest-lavender-400 outline-none font-medium text-gray-700 text-lg"
          onKeyDown={(e) => e.key === 'Enter' && handleExplain()}
        />
        <div className="flex flex-wrap gap-2 mt-3">
          {suggestions.map((s) => (
            <button
              key={s}
              onClick={() => setTopic(s)}
              className="px-3 py-1.5 rounded-lg bg-white text-sm font-medium text-gray-600 hover:bg-nest-lavender-100 border border-gray-200 transition-all"
            >
              {s}
            </button>
          ))}
        </div>
      </Card>

      {/* Type selection */}
      <div>
        <p className="font-semibold text-gray-600 mb-3">How should I explain it?</p>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {types.map((t) => {
            const Icon = t.icon;
            const active = selectedType === t.value;
            return (
              <button
                key={t.value}
                onClick={() => setSelectedType(t.value)}
                className={`p-4 rounded-2xl border-2 text-center transition-all ${
                  active
                    ? `border-${t.color}-400 bg-${t.color}-50 shadow-soft`
                    : 'border-gray-100 hover:border-gray-200'
                }`}
              >
                <Icon className={`w-8 h-8 mx-auto mb-2 ${active ? `text-${t.color}-600` : 'text-gray-400'}`} />
                <p className={`font-bold text-sm ${active ? `text-${t.color}-700` : 'text-gray-600'}`}>{t.label}</p>
                <p className="text-xs text-gray-400 mt-1">{t.description}</p>
              </button>
            );
          })}
        </div>
      </div>

      <Button size="lg" onClick={handleExplain} disabled={!topic.trim() || loading} icon={<Sparkles className="w-5 h-5" />}>
        {loading ? 'Creating your explanation...' : 'Explain It!'}
      </Button>

      {/* Loading */}
      {loading && (
        <Card className="flex justify-center py-12">
          <Spinner label="AI is creating your personalized explanation..." />
        </Card>
      )}

      {/* Result */}
      {result && !loading && (
        <Card className="animate-slide-up">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <span className="text-4xl">{result.emoji}</span>
              <div>
                <Badge className="bg-nest-lavender-100 text-nest-lavender-700">{result.title}</Badge>
                <h2 className="text-xl font-bold text-gray-800 mt-1">About: {topic}</h2>
              </div>
            </div>
            {settings.textToSpeech && (
              <Button
                variant={isReading ? 'warning' : 'primary'}
                onClick={handleRead}
                icon={isReading ? <Square className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              >
                {isReading ? 'Stop' : 'Read to Me'}
              </Button>
            )}
          </div>

          {/* Visual description */}
          {result.type === 'visual' && (
            <div className="mb-4 p-6 bg-gradient-to-br from-nest-lavender-100 to-nest-blue-100 rounded-2xl text-center">
              <div className="text-6xl mb-3 animate-float">{result.emoji}</div>
              <p className="text-gray-500 italic">{result.visualDescription}</p>
            </div>
          )}

          {/* Story styling */}
          {result.type === 'story' && (
            <div className="mb-4 p-6 bg-gradient-to-br from-nest-green-50 to-nest-yellow-50 rounded-2xl border-2 border-nest-green-200">
              <div className="flex items-center gap-2 mb-3">
                <BookOpen className="w-5 h-5 text-nest-green-600" />
                <span className="font-bold text-nest-green-700">Once Upon a Time...</span>
              </div>
            </div>
          )}

          <p className="text-lg text-gray-700 leading-relaxed">{result.content}</p>

          <div className="mt-6 p-4 bg-nest-yellow-50 rounded-xl flex items-start gap-3">
            <Lightbulb className="w-5 h-5 text-nest-yellow-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-gray-600">
              <span className="font-bold">Tip:</span> You can ask for the same topic in a different way! Try all four types to find what works best for you.
            </p>
          </div>
        </Card>
      )}
    </div>
  );
}
