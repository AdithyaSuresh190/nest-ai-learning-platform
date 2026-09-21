import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Badge, Button, Spinner, ProgressBar } from '@/components/ui/Card';
import { useAuth } from '@/context/AuthContext';
import { generateLesson, type AILessonGeneration } from '@/services/aiService';
import { subjectColors, difficultyLabels } from '@/services/mockData';
import { Upload, FileText, Sparkles, Type, CheckCircle2, ArrowRight, BookOpen, Gamepad2 } from 'lucide-react';

type Step = 'input' | 'generating' | 'preview' | 'success';

export function GenerateContent() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>('input');
  const [inputMode, setInputMode] = useState<'prompt' | 'upload'>('prompt');
  const [prompt, setPrompt] = useState('');
  const [fileName, setFileName] = useState('');
  const [generated, setGenerated] = useState<AILessonGeneration | null>(null);
  const [progress, setProgress] = useState(0);

  if (!user) return null;

  const handleGenerate = async () => {
    if (inputMode === 'prompt' && !prompt.trim()) return;
    if (inputMode === 'upload' && !fileName) return;

    setStep('generating');
    setProgress(0);

    // Simulate progress
    const stages = [
      { label: 'Extracting content', pct: 20 },
      { label: 'Simplifying text', pct: 40 },
      { label: 'Creating story', pct: 60 },
      { label: 'Generating visuals', pct: 75 },
      { label: 'Creating audio narration', pct: 85 },
      { label: 'Building activities', pct: 100 },
    ];

    for (const stage of stages) {
      await new Promise((r) => setTimeout(r, 400));
      setProgress(stage.pct);
    }

    const result = await generateLesson(inputMode === 'prompt' ? prompt : fileName.replace(/\.(pdf|png|jpg|jpeg)$/i, ''));
    setGenerated(result);
    setStep('preview');
  };

  const handlePublish = () => {
    setStep('success');
  };

  if (step === 'generating') {
    return (
      <div className="space-y-6 animate-slide-up">
        <h1 className="text-2xl lg:text-3xl font-bold text-gray-800">Generating Your Lesson...</h1>
        <Card className="text-center py-12">
          <div className="text-6xl mb-4 animate-bounce-soft">🤖</div>
          <ProgressBar value={progress} className="max-w-md mx-auto" color="bg-nest-lavender-400" />
          <p className="mt-4 text-lg font-semibold text-gray-600">
            {progress < 20 ? 'Extracting content...' :
             progress < 40 ? 'Simplifying text...' :
             progress < 60 ? 'Creating story...' :
             progress < 75 ? 'Generating visuals...' :
             progress < 85 ? 'Creating audio narration...' :
             'Building interactive activities...'}
          </p>
          <p className="text-sm text-gray-400 mt-2">AI is working its magic! This will just take a moment.</p>
        </Card>
      </div>
    );
  }

  if (step === 'success') {
    return (
      <div className="space-y-6 animate-slide-up">
        <Card className="text-center py-12 bg-gradient-to-br from-nest-green-50 to-nest-blue-50 border-nest-green-200">
          <CheckCircle2 className="w-16 h-16 text-nest-green-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Lesson Published!</h1>
          <p className="text-gray-500 mb-6">Your lesson "{generated?.title}" is now available to your students!</p>
          <div className="flex gap-3 justify-center">
            <Button variant="ghost" onClick={() => { setStep('input'); setGenerated(null); setPrompt(''); setFileName(''); }}>
              Create Another
            </Button>
            <Button variant="primary" onClick={() => navigate('/teacher/lessons')} icon={<BookOpen className="w-5 h-5" />}>
              View All Lessons
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  if (step === 'preview' && generated) {
    const sc = subjectColors[generated.subject] || subjectColors.Science;
    return (
      <div className="space-y-6 animate-slide-up">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-800">Preview Your Lesson</h1>
          <Badge className="bg-nest-lavender-100 text-nest-lavender-700">AI Generated</Badge>
        </div>

        {/* Lesson preview header */}
        <div className={`rounded-3xl p-6 ${sc.bg}`}>
          <div className="flex items-start gap-4">
            <div className="w-20 h-20 rounded-2xl bg-white/60 flex items-center justify-center text-5xl flex-shrink-0">
              ✨
            </div>
            <div>
              <Badge className={`${sc.bg} ${sc.text} mb-2`}>{sc.emoji} {generated.subject}</Badge>
              <h2 className="text-2xl font-bold text-gray-800">{generated.title}</h2>
              <p className="text-gray-500 mt-1">{generated.description}</p>
            </div>
          </div>
        </div>

        {/* Story preview */}
        <Card>
          <h3 className="font-bold text-gray-700 mb-3 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-nest-blue-500" /> Story
          </h3>
          <div className="space-y-3">
            {generated.pages.map((page, i) => (
              <div key={page.id} className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
                <span className="text-3xl">{page.emoji}</span>
                <div>
                  <span className="text-xs font-bold text-gray-400">PAGE {i + 1}</span>
                  <p className="text-gray-700">{page.text}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Key points */}
        <Card>
          <h3 className="font-bold text-gray-700 mb-3 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-nest-yellow-500" /> Key Points
          </h3>
          <ul className="space-y-2">
            {generated.keyPoints.map((kp, i) => (
              <li key={i} className="flex items-start gap-2 text-gray-600">
                <CheckCircle2 className="w-5 h-5 text-nest-green-500 flex-shrink-0 mt-0.5" />
                {kp}
              </li>
            ))}
          </ul>
        </Card>

        {/* Vocabulary */}
        <Card>
          <h3 className="font-bold text-gray-700 mb-3 flex items-center gap-2">
            <Type className="w-5 h-5 text-nest-lavender-500" /> Vocabulary
          </h3>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {generated.vocabulary.map((v, i) => (
              <div key={i} className="p-3 bg-gray-50 rounded-xl">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{v.emoji}</span>
                  <span className="font-bold text-gray-700">{v.word}</span>
                </div>
                <p className="text-sm text-gray-400 mt-1">{v.definition}</p>
              </div>
            ))}
          </div>
        </Card>

        {/* Activities */}
        <Card>
          <h3 className="font-bold text-gray-700 mb-3 flex items-center gap-2">
            <Gamepad2 className="w-5 h-5 text-nest-green-500" /> Activities ({generated.activities.length})
          </h3>
          <div className="space-y-2">
            {generated.activities.map((a) => (
              <div key={a.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                <span className="text-2xl">{a.type === 'quiz' ? '❓' : a.type === 'flashcards' ? '📇' : a.type === 'memory-game' ? '🧠' : '🎮'}</span>
                <div>
                  <p className="font-semibold text-gray-700">{a.title}</p>
                  <p className="text-sm text-gray-400">{a.description}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Actions */}
        <div className="flex gap-3 justify-end">
          <Button variant="ghost" onClick={() => { setStep('input'); setGenerated(null); }}>
            Back to Edit
          </Button>
          <Button variant="success" onClick={handlePublish} icon={<CheckCircle2 className="w-5 h-5" />}>
            Publish Lesson
          </Button>
        </div>
      </div>
    );
  }

  // Input step
  return (
    <div className="space-y-6 animate-slide-up">
      <div>
        <h1 className="text-2xl lg:text-3xl font-bold text-gray-800 mb-2">Generate New Content</h1>
        <p className="text-gray-400">Upload a file or type a topic — AI will create a complete lesson with stories, visuals, and activities!</p>
      </div>

      {/* Mode selection */}
      <div className="flex gap-3">
        <button
          onClick={() => setInputMode('prompt')}
          className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border-2 font-semibold transition-all ${
            inputMode === 'prompt' ? 'border-nest-lavender-400 bg-nest-lavender-50 text-nest-lavender-700' : 'border-gray-200 text-gray-400'
          }`}
        >
          <Type className="w-5 h-5" /> Type a Prompt
        </button>
        <button
          onClick={() => setInputMode('upload')}
          className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border-2 font-semibold transition-all ${
            inputMode === 'upload' ? 'border-nest-blue-400 bg-nest-blue-50 text-nest-blue-700' : 'border-gray-200 text-gray-400'
          }`}
        >
          <Upload className="w-5 h-5" /> Upload File
        </button>
      </div>

      {inputMode === 'prompt' ? (
        <Card>
          <label className="block text-sm font-semibold text-gray-600 mb-2">What should the lesson be about?</label>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="e.g., 'Explain how plants grow from seeds' or 'The life cycle of a butterfly'"
            rows={5}
            className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-nest-lavender-400 outline-none font-medium text-gray-700 resize-none text-lg"
          />
          <div className="flex flex-wrap gap-2 mt-3">
            {['How plants grow', 'The butterfly life cycle', 'Why we need sleep', 'How rainbows form'].map((s) => (
              <button
                key={s}
                onClick={() => setPrompt(s)}
                className="px-3 py-1.5 rounded-lg bg-gray-50 hover:bg-nest-lavender-100 text-sm font-medium text-gray-600 border border-gray-200 transition-all"
              >
                {s}
              </button>
            ))}
          </div>
        </Card>
      ) : (
        <Card>
          <label className="block text-sm font-semibold text-gray-600 mb-2">Upload a PDF or image</label>
          <div className="border-2 border-dashed border-gray-300 rounded-2xl p-8 text-center hover:border-nest-blue-400 transition-all cursor-pointer"
            onClick={() => document.getElementById('file-input')?.click()}
          >
            {fileName ? (
              <div className="flex items-center justify-center gap-3">
                <FileText className="w-10 h-10 text-nest-blue-500" />
                <div className="text-left">
                  <p className="font-semibold text-gray-700">{fileName}</p>
                  <p className="text-sm text-gray-400">Click to change file</p>
                </div>
              </div>
            ) : (
              <>
                <Upload className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="font-semibold text-gray-600">Click to upload a PDF or image</p>
                <p className="text-sm text-gray-400 mt-1">AI will extract and simplify the content</p>
              </>
            )}
            <input
              id="file-input"
              type="file"
              accept=".pdf,.png,.jpg,.jpeg"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) setFileName(file.name);
              }}
            />
          </div>
          <div className="mt-3">
            <input
              type="text"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Or add a topic hint (optional)..."
              className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-nest-blue-400 outline-none font-medium text-gray-700"
            />
          </div>
        </Card>
      )}

      {/* AI flow visualization */}
      <Card className="bg-gradient-to-r from-nest-lavender-50 to-nest-blue-50 border-nest-lavender-200">
        <h3 className="font-bold text-gray-700 mb-3 flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-nest-lavender-500" /> How AI creates your lesson:
        </h3>
        <div className="flex flex-wrap items-center gap-2 text-sm">
          {['Extract content', 'Simplify text', 'Create story', 'Generate visuals', 'Audio narration', 'Build activities'].map((stage, i, arr) => (
            <div key={stage} className="flex items-center gap-2">
              <span className="px-3 py-1.5 rounded-lg bg-white font-semibold text-gray-600 border border-gray-200">{stage}</span>
              {i < arr.length - 1 && <ArrowRight className="w-4 h-4 text-gray-300" />}
            </div>
          ))}
        </div>
      </Card>

      <Button size="lg" onClick={handleGenerate} disabled={inputMode === 'prompt' ? !prompt.trim() : !fileName} icon={<Sparkles className="w-5 h-5" />}>
        Generate Lesson with AI
      </Button>
    </div>
  );
}
