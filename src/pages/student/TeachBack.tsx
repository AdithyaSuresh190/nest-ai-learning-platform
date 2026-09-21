import { useState } from 'react';
import { Card, Button, Spinner, Badge, ProgressBar } from '@/components/ui/Card';
import { useAuth } from '@/context/AuthContext';
import { useAccessibility } from '@/context/AccessibilityContext';
import { evaluateTeachBack, type AITeachBackEvaluation } from '@/services/aiService';
import { mockLessons, mockTeachBacks } from '@/services/mockData';
import { speak, stopSpeaking } from '@/services/tts';
import {
  Mic, Type, Square, Volume2, CheckCircle2, AlertCircle,
  TrendingUp, Star, MessageSquare, Sparkles,
} from 'lucide-react';

export function TeachBack() {
  const { user } = useAuth();
  const { settings } = useAccessibility();
  const [mode, setMode] = useState<'voice' | 'text'>('text');
  const [text, setText] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [selectedLesson, setSelectedLesson] = useState(mockLessons[0]?.id || '');
  const [loading, setLoading] = useState(false);
  const [evaluation, setEvaluation] = useState<AITeachBackEvaluation | null>(null);
  const [isReading, setIsReading] = useState(false);

  if (!user) return null;
  const myLessons = mockLessons.filter((l) => l.assignedTo.includes(user.id));
  const pastSubmissions = mockTeachBacks.filter((t) => t.studentId === user.id);

  const handleSubmit = async () => {
    if (!text.trim()) return;
    setLoading(true);
    setEvaluation(null);
    const lesson = mockLessons.find((l) => l.id === selectedLesson);
    const result = await evaluateTeachBack(text, lesson?.title || 'the lesson');
    setEvaluation(result);
    setLoading(false);
  };

  const handleVoice = () => {
    if (isRecording) {
      setIsRecording(false);
      // Simulate voice transcription
      setText('I learned that water goes up into the sky when it gets warm. This is called evaporation. Then it makes clouds up in the sky. That is condensation. When the clouds get heavy, the water falls down as rain. That is precipitation. Then the water goes back to the ocean and it starts all over again.');
    } else {
      setIsRecording(true);
      setText('');
    }
  };

  const handleRead = (content: string) => {
    if (isReading) {
      stopSpeaking();
      setIsReading(false);
    } else {
      speak(content, { rate: 0.85 });
      setIsReading(true);
      setTimeout(() => setIsReading(false), content.length * 80 + 2000);
    }
  };

  return (
    <div className="space-y-6 animate-slide-up">
      <div>
        <div className="flex items-center gap-3 mb-2">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-nest-green-400 to-nest-blue-400 flex items-center justify-center text-white">
            <Mic className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-gray-800">Teach-Back Mode</h1>
            <p className="text-gray-400">Explain what you learned and let AI check your understanding!</p>
          </div>
        </div>
      </div>

      {/* How it works */}
      <Card className="bg-gradient-to-r from-nest-green-50 to-nest-blue-50 border-nest-green-200">
        <div className="flex items-start gap-3">
          <Sparkles className="w-5 h-5 text-nest-green-600 flex-shrink-0 mt-1" />
          <div>
            <p className="font-semibold text-gray-700">How Teach-Back works:</p>
            <ol className="text-sm text-gray-500 mt-2 space-y-1 list-decimal list-inside">
              <li>Pick a lesson you've been learning</li>
              <li>Explain what you learned using your voice or by typing</li>
              <li>AI will check your understanding and find areas to practice</li>
              <li>You'll get friendly feedback and a score!</li>
            </ol>
          </div>
        </div>
      </Card>

      {/* Lesson selection */}
      <div>
        <label className="block text-sm font-semibold text-gray-600 mb-2">Which lesson are you explaining?</label>
        <select
          value={selectedLesson}
          onChange={(e) => setSelectedLesson(e.target.value)}
          className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-nest-green-400 outline-none font-medium text-gray-700 bg-white cursor-pointer"
        >
          {myLessons.map((l) => (
            <option key={l.id} value={l.id}>{l.thumbnail} {l.title}</option>
          ))}
        </select>
      </div>

      {/* Mode selection */}
      <div className="flex gap-3">
        <button
          onClick={() => setMode('text')}
          className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border-2 font-semibold transition-all ${
            mode === 'text' ? 'border-nest-blue-400 bg-nest-blue-50 text-nest-blue-700' : 'border-gray-200 text-gray-400'
          }`}
        >
          <Type className="w-5 h-5" /> Type It
        </button>
        <button
          onClick={() => setMode('voice')}
          className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border-2 font-semibold transition-all ${
            mode === 'voice' ? 'border-nest-green-400 bg-nest-green-50 text-nest-green-700' : 'border-gray-200 text-gray-400'
          }`}
        >
          <Mic className="w-5 h-5" /> Say It
        </button>
      </div>

      {/* Input area */}
      {mode === 'text' ? (
        <Card>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Explain what you learned in your own words... Don't worry about being perfect, just share what you remember!"
            rows={6}
            className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-nest-blue-400 outline-none font-medium text-gray-700 resize-none text-lg"
          />
          <div className="flex justify-between items-center mt-3">
            <span className="text-sm text-gray-400">{text.trim().split(/\s+/).filter(Boolean).length} words</span>
            <Button onClick={handleSubmit} disabled={!text.trim() || loading} icon={<Sparkles className="w-4 h-4" />}>
              {loading ? 'AI is checking...' : 'Submit for AI Review'}
            </Button>
          </div>
        </Card>
      ) : (
        <Card className="text-center">
          <div className="py-8">
            <button
              onClick={handleVoice}
              className={`w-24 h-24 rounded-full flex items-center justify-center mx-auto transition-all ${
                isRecording ? 'bg-nest-peach-400 animate-pulse-soft' : 'bg-nest-green-400 hover:bg-nest-green-500'
              }`}
            >
              {isRecording ? <Square className="w-10 h-10 text-white" /> : <Mic className="w-10 h-10 text-white" />}
            </button>
            <p className="mt-4 font-semibold text-gray-600">
              {isRecording ? 'Listening... Tap to stop' : 'Tap to start speaking'}
            </p>
            <p className="text-sm text-gray-400 mt-1">
              {isRecording ? 'Tell me what you learned about this lesson' : 'Your voice will be turned into text'}
            </p>
          </div>
          {text && (
            <div className="mt-4 p-4 bg-nest-green-50 rounded-xl text-left">
              <p className="text-sm font-semibold text-nest-green-700 mb-2">What you said:</p>
              <p className="text-gray-700">{text}</p>
            </div>
          )}
          {text && (
            <Button onClick={handleSubmit} disabled={loading} className="mt-4" icon={<Sparkles className="w-4 h-4" />}>
              {loading ? 'AI is checking...' : 'Submit for AI Review'}
            </Button>
          )}
        </Card>
      )}

      {/* Loading */}
      {loading && (
        <Card className="flex justify-center py-12">
          <Spinner label="AI is evaluating your understanding..." />
        </Card>
      )}

      {/* Evaluation */}
      {evaluation && !loading && (
        <Card className="animate-slide-up border-2 border-nest-green-200">
          <div className="text-center mb-6">
            <div className={`w-20 h-20 rounded-full mx-auto flex items-center justify-center ${
              evaluation.understandingScore >= 85 ? 'bg-nest-green-100' : evaluation.understandingScore >= 70 ? 'bg-nest-yellow-100' : 'bg-nest-peach-100'
            }`}>
              <span className="text-3xl font-bold text-gray-700">{evaluation.understandingScore}</span>
            </div>
            <h3 className="text-xl font-bold text-gray-800 mt-3">Understanding Score</h3>
            <p className="text-gray-400">
              {evaluation.understandingScore >= 85 ? 'Excellent understanding!' : evaluation.understandingScore >= 70 ? 'Good understanding!' : 'Keep practicing!'}
            </p>
          </div>

          <ProgressBar
            value={evaluation.understandingScore}
            color={evaluation.understandingScore >= 85 ? 'bg-nest-green-400' : evaluation.understandingScore >= 70 ? 'bg-nest-yellow-400' : 'bg-nest-peach-400'}
            className="mb-6"
          />

          {/* Feedback */}
          <div className="p-4 bg-nest-blue-50 rounded-xl mb-4">
            <div className="flex items-start gap-3">
              <MessageSquare className="w-5 h-5 text-nest-blue-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-gray-700 mb-1">AI Feedback</p>
                <p className="text-gray-600">{evaluation.feedback}</p>
                {settings.textToSpeech && (
                  <Button size="sm" variant="ghost" onClick={() => handleRead(evaluation.feedback)} icon={<Volume2 className="w-4 h-4" />}>
                    {isReading ? 'Stop' : 'Listen to feedback'}
                  </Button>
                )}
              </div>
            </div>
          </div>

          {/* Strengths */}
          {evaluation.strengths.length > 0 && (
            <div className="mb-4">
              <h4 className="font-bold text-nest-green-700 mb-2 flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5" /> What you got right:
              </h4>
              <ul className="space-y-2">
                {evaluation.strengths.map((s, i) => (
                  <li key={i} className="flex items-start gap-2 text-gray-600">
                    <span className="text-nest-green-500 mt-0.5">✓</span>
                    {s}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Weak areas */}
          {evaluation.weakAreas.length > 0 && (
            <div className="mb-4">
              <h4 className="font-bold text-nest-peach-700 mb-2 flex items-center gap-2">
                <AlertCircle className="w-5 h-5" /> Areas to practice:
              </h4>
              <ul className="space-y-2">
                {evaluation.weakAreas.map((w, i) => (
                  <li key={i} className="flex items-start gap-2 text-gray-600">
                    <span className="text-nest-peach-500 mt-0.5">!</span>
                    {w}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="flex gap-3">
            <Button variant="ghost" onClick={() => { setEvaluation(null); setText(''); }}>
              Try Again
            </Button>
            <Button variant="primary" className="flex-1" icon={<TrendingUp className="w-4 h-4" />}>
              See My Progress
            </Button>
          </div>
        </Card>
      )}

      {/* Past submissions */}
      {pastSubmissions.length > 0 && (
        <div>
          <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            <Star className="w-5 h-5 text-nest-yellow-400" />
            Your Past Teach-Backs
          </h2>
          <div className="space-y-3">
            {pastSubmissions.map((sub) => (
              <Card key={sub.id} className="flex items-start gap-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${
                  sub.aiEvaluation.understandingScore >= 85 ? 'bg-nest-green-100' : 'bg-nest-yellow-100'
                }`}>
                  <span className="font-bold text-gray-700">{sub.aiEvaluation.understandingScore}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge className="bg-nest-lavender-100 text-nest-lavender-700">{sub.mode === 'voice' ? '🎤 Voice' : '⌨️ Text'}</Badge>
                    <span className="text-sm text-gray-400">{sub.date}</span>
                  </div>
                  <h3 className="font-bold text-gray-700">{sub.lessonTitle}</h3>
                  <p className="text-sm text-gray-500 mt-1 line-clamp-2">{sub.content}</p>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
