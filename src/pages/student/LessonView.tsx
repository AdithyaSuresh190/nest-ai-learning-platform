import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Badge, Button, ProgressBar, Modal } from '@/components/ui/Card';
import { useAccessibility } from '@/context/AccessibilityContext';
import { mockLessons, subjectColors, difficultyLabels } from '@/services/mockData';
import { speak, stopSpeaking } from '@/services/tts';
import {
  Volume2, Square, ChevronLeft, ChevronRight, BookOpen,
  Lightbulb, Gamepad2, CheckCircle2, Star, ArrowRight, Mic, Sparkles, X,
} from 'lucide-react';
import type { Activity, QuizQuestion } from '@/types';

type Tab = 'story' | 'key-points' | 'vocabulary' | 'activities';

export function LessonView() {
  const { lessonId } = useParams<{ lessonId: string }>();
  const navigate = useNavigate();
  const { settings } = useAccessibility();
  const lesson = mockLessons.find((l) => l.id === lessonId);

  const [tab, setTab] = useState<Tab>('story');
  const [pageIdx, setPageIdx] = useState(0);
  const [isReading, setIsReading] = useState(false);
  const [completedActivities, setCompletedActivities] = useState<Set<string>>(new Set());
  const [showTeachBackPrompt, setShowTeachBackPrompt] = useState(false);

  useEffect(() => {
    return () => stopSpeaking();
  }, []);

  if (!lesson) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-400">Lesson not found.</p>
        <Button onClick={() => navigate('/student/lessons')} className="mt-4">Back to Lessons</Button>
      </div>
    );
  }

  const sc = subjectColors[lesson.subject] || subjectColors.Science;
  const currentPage = lesson.content.pages[pageIdx];

  const handleRead = (text?: string) => {
    if (isReading) {
      stopSpeaking();
      setIsReading(false);
    } else {
      const toRead = text || currentPage.text;
      speak(toRead, { rate: 0.85 });
      setIsReading(true);
      // Auto-stop state after speech ends
      setTimeout(() => setIsReading(false), toRead.length * 80 + 2000);
    }
  };

  const nextActivity = () => {
    if (completedActivities.size === lesson.activities.length) {
      setShowTeachBackPrompt(true);
    }
  };

  const tabs: { id: Tab; label: string; icon: typeof BookOpen }[] = [
    { id: 'story', label: 'Storybook', icon: BookOpen },
    { id: 'key-points', label: 'Key Points', icon: Lightbulb },
    { id: 'vocabulary', label: 'Words', icon: Sparkles },
    { id: 'activities', label: 'Activities', icon: Gamepad2 },
  ];

  return (
    <div className="space-y-6 animate-slide-up">
      {/* Header */}
      <div className={`rounded-3xl p-6 ${sc.bg} relative overflow-hidden`}>
        <button onClick={() => navigate('/student/lessons')} className="flex items-center gap-1 text-gray-500 hover:text-gray-700 mb-3 font-semibold text-sm">
          <ChevronLeft className="w-4 h-4" /> Back to Lessons
        </button>
        <div className="flex items-start gap-4">
          <div className="w-20 h-20 rounded-2xl bg-white/60 flex items-center justify-center text-5xl flex-shrink-0">
            {lesson.thumbnail}
          </div>
          <div className="flex-1">
            <Badge className={`${sc.bg} ${sc.text} mb-2`}>{sc.emoji} {lesson.subject}</Badge>
            <h1 className="text-2xl lg:text-3xl font-bold text-gray-800">{lesson.title}</h1>
            <p className="text-gray-500 mt-1">{lesson.description}</p>
            <div className="flex items-center gap-3 mt-3">
              <Badge className={difficultyLabels[lesson.difficulty].color}>{difficultyLabels[lesson.difficulty].label}</Badge>
              <span className="text-sm text-gray-400">{lesson.activities.length} activities</span>
              <span className="text-sm text-gray-400">{lesson.estimatedTime} min</span>
            </div>
          </div>
        </div>
        <ProgressBar value={lesson.progress} className="mt-4" color={sc.text.replace('text-', 'bg-').replace('-700', '-400')} />
      </div>

      {/* Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {tabs.map((t) => {
          const Icon = t.icon;
          const active = tab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => { setTab(t.id); stopSpeaking(); setIsReading(false); }}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold whitespace-nowrap transition-all ${
                active ? `${sc.bg} ${sc.text} shadow-soft` : 'bg-white text-gray-400 hover:bg-gray-50'
              }`}
            >
              <Icon className="w-5 h-5" />
              {t.label}
              {t.id === 'activities' && completedActivities.size > 0 && (
                <span className="bg-nest-green-400 text-white text-xs px-2 py-0.5 rounded-full">{completedActivities.size}/{lesson.activities.length}</span>
              )}
            </button>
          );
        })}
      </div>

      {/* Story tab */}
      {tab === 'story' && (
        <Card className="overflow-hidden">
          <div className={`${sc.bg} p-8 rounded-xl text-center min-h-[300px] flex flex-col items-center justify-center`}>
            <div className="text-8xl mb-4 animate-float">{currentPage.emoji}</div>
            <p className="text-xl lg:text-2xl text-gray-700 font-medium leading-relaxed max-w-2xl">
              {currentPage.text}
            </p>
          </div>
          {settings.textToSpeech && (
            <div className="flex justify-center mt-4">
              <Button
                variant={isReading ? 'warning' : 'primary'}
                onClick={() => handleRead()}
                icon={isReading ? <Square className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              >
                {isReading ? 'Stop Reading' : 'Read to Me'}
              </Button>
            </div>
          )}
          <div className="flex items-center justify-between mt-6">
            <Button
              variant="outline"
              onClick={() => { setPageIdx(Math.max(0, pageIdx - 1)); stopSpeaking(); setIsReading(false); }}
              disabled={pageIdx === 0}
              icon={<ChevronLeft className="w-4 h-4" />}
            >
              Previous
            </Button>
            <span className="text-sm font-semibold text-gray-400">
              Page {pageIdx + 1} of {lesson.content.pages.length}
            </span>
            <Button
              variant="primary"
              onClick={() => { setPageIdx(Math.min(lesson.content.pages.length - 1, pageIdx + 1)); stopSpeaking(); setIsReading(false); }}
              disabled={pageIdx === lesson.content.pages.length - 1}
              icon={<ChevronRight className="w-4 h-4" />}
            >
              Next
            </Button>
          </div>
          {pageIdx === lesson.content.pages.length - 1 && (
            <div className="mt-4 p-4 bg-nest-green-50 rounded-xl text-center">
              <CheckCircle2 className="w-8 h-8 text-nest-green-500 mx-auto mb-2" />
              <p className="font-semibold text-gray-700 mb-3">You finished the story! Now try the activities!</p>
              <Button variant="success" onClick={() => setTab('activities')} icon={<Gamepad2 className="w-5 h-5" />}>
                Go to Activities
              </Button>
            </div>
          )}
        </Card>
      )}

      {/* Key Points tab */}
      {tab === 'key-points' && (
        <div className="grid sm:grid-cols-2 gap-4">
          {lesson.content.keyPoints.map((point, i) => (
            <Card key={i} className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-nest-yellow-200 flex items-center justify-center flex-shrink-0">
                <Lightbulb className="w-5 h-5 text-nest-yellow-700" />
              </div>
              <div>
                <span className="text-xs font-bold text-nest-yellow-600">KEY POINT {i + 1}</span>
                <p className="text-gray-700 font-medium mt-1">{point}</p>
              </div>
            </Card>
          ))}
          {settings.textToSpeech && (
            <Card className="sm:col-span-2 text-center bg-nest-blue-50">
              <Button variant="primary" onClick={() => speak(lesson.content.keyPoints.join('. '))} icon={<Volume2 className="w-4 h-4" />}>
                Read All Key Points
              </Button>
            </Card>
          )}
        </div>
      )}

      {/* Vocabulary tab */}
      {tab === 'vocabulary' && (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {lesson.content.vocabulary.map((vocab, i) => (
            <Card key={i} className="flex flex-col gap-2">
              <div className="flex items-center gap-3">
                <span className="text-4xl">{vocab.emoji}</span>
                <div>
                  <h3 className="font-bold text-gray-800 text-lg">{vocab.word}</h3>
                  <p className="text-sm text-gray-400">Vocabulary word</p>
                </div>
              </div>
              <p className="text-gray-600">{vocab.definition}</p>
              {settings.textToSpeech && (
                <Button size="sm" variant="ghost" onClick={() => speak(`${vocab.word}. ${vocab.definition}`)} icon={<Volume2 className="w-4 h-4" />}>
                  Listen
                </Button>
              )}
            </Card>
          ))}
        </div>
      )}

      {/* Activities tab */}
      {tab === 'activities' && (
        <div className="space-y-4">
          {lesson.activities.map((activity) => (
            <ActivityRenderer
              key={activity.id}
              activity={activity}
              onComplete={() => {
                const newSet = new Set(completedActivities);
                newSet.add(activity.id);
                setCompletedActivities(newSet);
                setTimeout(nextActivity, 500);
              }}
              isCompleted={completedActivities.has(activity.id)}
            />
          ))}
          {completedActivities.size === lesson.activities.length && (
            <Card className="bg-gradient-to-r from-nest-green-50 to-nest-blue-50 border-nest-green-200 text-center">
              <Star className="w-12 h-12 text-nest-yellow-400 mx-auto mb-3 fill-nest-yellow-400" />
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Amazing! You completed all activities!</h2>
              <p className="text-gray-500 mb-4">Now try the Teach-Back to show what you learned!</p>
              <Button variant="success" size="lg" onClick={() => navigate('/student/teach-back')} icon={<Mic className="w-5 h-5" />}>
                Try Teach-Back
              </Button>
            </Card>
          )}
        </div>
      )}

      {/* Teach-back prompt modal */}
      <Modal open={showTeachBackPrompt} onClose={() => setShowTeachBackPrompt(false)} title="Great Job!">
        <div className="text-center">
          <Star className="w-16 h-16 text-nest-yellow-400 mx-auto mb-4 fill-nest-yellow-400" />
          <h3 className="text-xl font-bold text-gray-800 mb-2">You finished all activities!</h3>
          <p className="text-gray-500 mb-4">Would you like to try the Teach-Back activity to show what you learned?</p>
          <div className="flex gap-3 justify-center">
            <Button variant="ghost" onClick={() => setShowTeachBackPrompt(false)}>Maybe Later</Button>
            <Button variant="success" onClick={() => navigate('/student/teach-back')} icon={<Mic className="w-5 h-5" />}>
              Yes, Let's Do It!
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

// ============ Activity Renderer ============

function ActivityRenderer({ activity, onComplete, isCompleted }: { activity: Activity; onComplete: () => void; isCompleted: boolean }) {
  const [started, setStarted] = useState(false);

  if (!started) {
    return (
      <Card className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-nest-lavender-100 flex items-center justify-center text-3xl">
            {activityIcon(activity.type)}
          </div>
          <div>
            <h3 className="font-bold text-gray-800 text-lg">{activity.title}</h3>
            <p className="text-sm text-gray-400">{activity.description}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {isCompleted && <CheckCircle2 className="w-6 h-6 text-nest-green-500" />}
          <Button onClick={() => setStarted(true)} icon={<ArrowRight className="w-4 h-4" />}>
            {isCompleted ? 'Play Again' : 'Start'}
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <Card>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <span className="text-2xl">{activityIcon(activity.type)}</span>
          <h3 className="font-bold text-gray-800">{activity.title}</h3>
        </div>
        <button onClick={() => setStarted(false)} className="text-gray-400 hover:text-gray-600">
          <X className="w-5 h-5" />
        </button>
      </div>
      {activity.type === 'quiz' && <QuizActivity questions={activity.data.questions || []} onComplete={onComplete} />}
      {activity.type === 'flashcards' && <FlashcardActivity flashcards={activity.data.flashcards || []} onComplete={onComplete} />}
      {activity.type === 'memory-game' && <MemoryGameActivity cards={activity.data.cards || []} onComplete={onComplete} />}
      {activity.type === 'picture-matching' && <PictureMatchingActivity pairs={activity.data.pairs || []} onComplete={onComplete} />}
      {activity.type === 'word-recognition' && <WordRecognitionActivity words={activity.data.words || []} onComplete={onComplete} />}
    </Card>
  );
}

function activityIcon(type: string): string {
  const icons: Record<string, string> = {
    'memory-game': '🧠',
    'picture-matching': '🔗',
    'quiz': '❓',
    'flashcards': '📇',
    'puzzle': '🧩',
    'word-recognition': '🔤',
  };
  return icons[type] || '🎮';
}

// ============ Quiz ============
function QuizActivity({ questions, onComplete }: { questions: QuizQuestion[]; onComplete: () => void }) {
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);
  const q = questions[current];

  const handleSelect = (idx: number) => {
    if (showResult) return;
    setSelected(idx);
    setShowResult(true);
    if (idx === q.correctAnswer) setScore(score + 1);
  };

  const handleNext = () => {
    if (current === questions.length - 1) {
      setFinished(true);
      onComplete();
    } else {
      setCurrent(current + 1);
      setSelected(null);
      setShowResult(false);
    }
  };

  if (finished) {
    return (
      <div className="text-center py-6">
        <Star className="w-16 h-16 text-nest-yellow-400 mx-auto mb-3 fill-nest-yellow-400" />
        <h3 className="text-2xl font-bold text-gray-800">Quiz Complete!</h3>
        <p className="text-lg text-gray-500 mt-2">You got {score} out of {questions.length} correct!</p>
        <div className="flex justify-center gap-1 my-4">
          {questions.map((_, i) => (
            <span key={i} className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${i < score ? 'bg-nest-green-200 text-nest-green-700' : 'bg-gray-100 text-gray-400'}`}>
              {i < score ? '✓' : '✗'}
            </span>
          ))}
        </div>
        <p className="text-gray-500">{score === questions.length ? 'Perfect score! Amazing!' : score >= questions.length / 2 ? 'Great job! Keep practicing!' : 'Good try! Let\'s practice more!'}</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <span className="text-sm font-semibold text-gray-400">Question {current + 1} of {questions.length}</span>
        <Badge className="bg-nest-blue-100 text-nest-blue-700">Score: {score}</Badge>
      </div>
      <ProgressBar value={current} max={questions.length} className="mb-6" />
      <div className="text-center mb-6">
        <span className="text-6xl mb-3 block">{q.emoji}</span>
        <h3 className="text-xl font-bold text-gray-800">{q.question}</h3>
      </div>
      <div className="grid sm:grid-cols-2 gap-3">
        {q.options.map((opt, idx) => {
          let cls = 'border-gray-200 hover:border-nest-blue-300 hover:bg-nest-blue-50';
          if (showResult) {
            if (idx === q.correctAnswer) cls = 'border-nest-green-400 bg-nest-green-50 text-nest-green-700';
            else if (idx === selected) cls = 'border-nest-peach-400 bg-nest-peach-50 text-nest-peach-700';
            else cls = 'border-gray-100 opacity-50';
          }
          return (
            <button
              key={idx}
              onClick={() => handleSelect(idx)}
              disabled={showResult}
              className={`p-4 rounded-xl border-2 font-semibold text-gray-700 transition-all ${cls}`}
            >
              {opt}
              {showResult && idx === q.correctAnswer && <CheckCircle2 className="w-5 h-5 inline ml-2 text-nest-green-500" />}
            </button>
          );
        })}
      </div>
      {showResult && (
        <div className="mt-4 p-4 bg-nest-blue-50 rounded-xl">
          <p className="text-gray-600 font-medium">{q.explanation}</p>
          <Button onClick={handleNext} className="mt-3 w-full" icon={<ArrowRight className="w-4 h-4" />}>
            {current === questions.length - 1 ? 'Finish Quiz' : 'Next Question'}
          </Button>
        </div>
      )}
    </div>
  );
}

// ============ Flashcards ============
function FlashcardActivity({ flashcards, onComplete }: { flashcards: { front: string; back: string; emoji: string }[]; onComplete: () => void }) {
  const [current, setCurrent] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [viewed, setViewed] = useState<Set<number>>(new Set());
  const card = flashcards[current];

  const handleFlip = () => {
    setFlipped(!flipped);
    if (!flipped) {
      const newViewed = new Set(viewed);
      newViewed.add(current);
      setViewed(newViewed);
    }
  };

  const handleNext = () => {
    if (current === flashcards.length - 1) {
      onComplete();
    } else {
      setCurrent(current + 1);
      setFlipped(false);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <span className="text-sm font-semibold text-gray-400">Card {current + 1} of {flashcards.length}</span>
        <span className="text-sm text-gray-400">{viewed.size} viewed</span>
      </div>
      <div
        onClick={handleFlip}
        className="relative w-full h-64 cursor-pointer"
        style={{ perspective: '1000px' }}
      >
        <div
          className="relative w-full h-full transition-transform duration-500"
          style={{ transformStyle: 'preserve-3d', transform: flipped ? 'rotateY(180deg)' : '' }}
        >
          {/* Front */}
          <div className="absolute inset-0 w-full h-full rounded-2xl bg-gradient-to-br from-nest-blue-100 to-nest-lavender-100 flex flex-col items-center justify-center" style={{ backfaceVisibility: 'hidden' }}>
            <span className="text-6xl mb-3">{card.emoji}</span>
            <h3 className="text-2xl font-bold text-gray-800">{card.front}</h3>
            <p className="text-sm text-gray-400 mt-4">Tap to flip</p>
          </div>
          {/* Back */}
          <div className="absolute inset-0 w-full h-full rounded-2xl bg-gradient-to-br from-nest-green-100 to-nest-yellow-100 flex flex-col items-center justify-center p-6" style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}>
            <span className="text-5xl mb-3">{card.emoji}</span>
            <p className="text-lg font-semibold text-gray-700 text-center">{card.back}</p>
            <p className="text-sm text-gray-400 mt-4">Tap to flip back</p>
          </div>
        </div>
      </div>
      <div className="flex gap-3 mt-4">
        <Button variant="outline" onClick={handleFlip}>{flipped ? 'Show Front' : 'Show Back'}</Button>
        <Button onClick={handleNext} className="flex-1" icon={<ArrowRight className="w-4 h-4" />}>
          {current === flashcards.length - 1 ? 'Finish' : 'Next Card'}
        </Button>
      </div>
    </div>
  );
}

// ============ Memory Game ============
function MemoryGameActivity({ cards, onComplete }: { cards: { id: string; emoji: string; label: string }[]; onComplete: () => void }) {
  const [flipped, setFlipped] = useState<number[]>([]);
  const [matched, setMatched] = useState<Set<string>>(new Set());
  const [moves, setMoves] = useState(0);

  // Duplicate and shuffle cards
  const [deck] = useState(() => {
    const doubled = [...cards, ...cards].map((c, i) => ({ ...c, uid: `${c.id}-${i}` }));
    return doubled.sort(() => Math.random() - 0.5);
  });

  const handleClick = (idx: number) => {
    if (flipped.length === 2 || flipped.includes(idx) || matched.has(deck[idx].id)) return;
    const newFlipped = [...flipped, idx];
    setFlipped(newFlipped);

    if (newFlipped.length === 2) {
      setMoves(moves + 1);
      const [a, b] = newFlipped;
      if (deck[a].id === deck[b].id) {
        const newMatched = new Set(matched);
        newMatched.add(deck[a].id);
        setMatched(newMatched);
        setFlipped([]);
        if (newMatched.size === cards.length) {
          setTimeout(onComplete, 500);
        }
      } else {
        setTimeout(() => setFlipped([]), 1000);
      }
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <span className="text-sm font-semibold text-gray-400">Moves: {moves}</span>
        <span className="text-sm text-gray-400">Matched: {matched.size}/{cards.length}</span>
      </div>
      <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
        {deck.map((card, idx) => {
          const isFlipped = flipped.includes(idx) || matched.has(card.id);
          return (
            <button
              key={card.uid}
              onClick={() => handleClick(idx)}
              disabled={isFlipped}
              className={`aspect-square rounded-2xl flex flex-col items-center justify-center transition-all duration-300 ${
                isFlipped
                  ? matched.has(card.id)
                    ? 'bg-nest-green-100 border-2 border-nest-green-300'
                    : 'bg-nest-blue-100 border-2 border-nest-blue-300'
                  : 'bg-gradient-to-br from-nest-lavender-300 to-nest-blue-300 hover:scale-105'
              }`}
            >
              {isFlipped ? (
                <>
                  <span className="text-4xl">{card.emoji}</span>
                  <span className="text-xs font-semibold text-gray-500 mt-1">{card.label}</span>
                </>
              ) : (
                <span className="text-3xl">❓</span>
              )}
            </button>
          );
        })}
      </div>
      {matched.size === cards.length && (
        <div className="mt-4 p-4 bg-nest-green-50 rounded-xl text-center">
          <Star className="w-10 h-10 text-nest-yellow-400 mx-auto mb-2 fill-nest-yellow-400" />
          <p className="font-bold text-gray-700">You matched all pairs in {moves} moves!</p>
        </div>
      )}
    </div>
  );
}

// ============ Picture Matching ============
function PictureMatchingActivity({ pairs, onComplete }: { pairs: { left: { id: string; emoji: string; label: string }; right: { id: string; emoji: string; label: string } }[]; onComplete: () => void }) {
  const [selectedLeft, setSelectedLeft] = useState<string | null>(null);
  const [matched, setMatched] = useState<Set<string>>(new Set());
  const [wrong, setWrong] = useState(false);
  const [shuffledRight] = useState(() => [...pairs].sort(() => Math.random() - 0.5));

  const handleLeftClick = (id: string) => {
    if (matched.has(id)) return;
    setSelectedLeft(id);
  };

  const handleRightClick = (rightId: string) => {
    if (!selectedLeft) return;
    const pair = pairs.find((p) => p.left.id === selectedLeft);
    if (pair && pair.right.id === rightId) {
      const newMatched = new Set(matched);
      newMatched.add(selectedLeft);
      newMatched.add(rightId);
      setMatched(newMatched);
      setSelectedLeft(null);
      if (newMatched.size === pairs.length * 2) {
        setTimeout(onComplete, 500);
      }
    } else {
      setWrong(true);
      setTimeout(() => { setWrong(false); setSelectedLeft(null); }, 800);
    }
  };

  return (
    <div>
      <p className="text-sm text-gray-400 mb-4 text-center">Tap a left card, then match it with the right card!</p>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-3">
          {pairs.map((pair) => {
            const isMatched = matched.has(pair.left.id);
            const isSelected = selectedLeft === pair.left.id;
            return (
              <button
                key={pair.left.id}
                onClick={() => handleLeftClick(pair.left.id)}
                disabled={isMatched}
                className={`w-full p-4 rounded-2xl border-2 flex items-center gap-3 transition-all ${
                  isMatched ? 'bg-nest-green-50 border-nest-green-300 opacity-60'
                  : isSelected ? 'bg-nest-blue-50 border-nest-blue-400 scale-105'
                  : wrong ? 'bg-nest-peach-50 border-nest-peach-300'
                  : 'bg-white border-gray-200 hover:border-nest-blue-300'
                }`}
              >
                <span className="text-4xl">{pair.left.emoji}</span>
                <span className="font-semibold text-gray-700">{pair.left.label}</span>
                {isMatched && <CheckCircle2 className="w-5 h-5 text-nest-green-500 ml-auto" />}
              </button>
            );
          })}
        </div>
        <div className="space-y-3">
          {shuffledRight.map((pair) => {
            const isMatched = matched.has(pair.right.id);
            return (
              <button
                key={pair.right.id}
                onClick={() => handleRightClick(pair.right.id)}
                disabled={isMatched}
                className={`w-full p-4 rounded-2xl border-2 flex items-center gap-3 transition-all ${
                  isMatched ? 'bg-nest-green-50 border-nest-green-300 opacity-60'
                  : wrong ? 'bg-nest-peach-50 border-nest-peach-300 animate-wiggle'
                  : 'bg-white border-gray-200 hover:border-nest-lavender-300'
                }`}
              >
                <span className="text-4xl">{pair.right.emoji}</span>
                <span className="font-semibold text-gray-700">{pair.right.label}</span>
                {isMatched && <CheckCircle2 className="w-5 h-5 text-nest-green-500 ml-auto" />}
              </button>
            );
          })}
        </div>
      </div>
      {matched.size === pairs.length * 2 && (
        <div className="mt-4 p-4 bg-nest-green-50 rounded-xl text-center">
          <Star className="w-10 h-10 text-nest-yellow-400 mx-auto mb-2 fill-nest-yellow-400" />
          <p className="font-bold text-gray-700">All matched! Great job!</p>
        </div>
      )}
    </div>
  );
}

// ============ Word Recognition ============
function WordRecognitionActivity({ words, onComplete }: { words: { word: string; correct: boolean; emoji: string }[]; onComplete: () => void }) {
  const [current, setCurrent] = useState(0);
  const [result, setResult] = useState<'correct' | 'wrong' | null>(null);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);
  const w = words[current];

  const handleAnswer = (answer: boolean) => {
    const isCorrect = answer === w.correct;
    setResult(isCorrect ? 'correct' : 'wrong');
    if (isCorrect) setScore(score + 1);
    setTimeout(() => {
      if (current === words.length - 1) {
        setFinished(true);
        onComplete();
      } else {
        setCurrent(current + 1);
        setResult(null);
      }
    }, 1200);
  };

  if (finished) {
    return (
      <div className="text-center py-6">
        <Star className="w-16 h-16 text-nest-yellow-400 mx-auto mb-3 fill-nest-yellow-400" />
        <h3 className="text-2xl font-bold text-gray-800">All Done!</h3>
        <p className="text-lg text-gray-500 mt-2">You got {score} out of {words.length} right!</p>
      </div>
    );
  }

  return (
    <div className="text-center">
      <div className="flex justify-between items-center mb-4">
        <span className="text-sm font-semibold text-gray-400">Word {current + 1} of {words.length}</span>
        <Badge className="bg-nest-blue-100 text-nest-blue-700">Score: {score}</Badge>
      </div>
      <div className={`py-12 rounded-2xl transition-all ${
        result === 'correct' ? 'bg-nest-green-100' : result === 'wrong' ? 'bg-nest-peach-100' : 'bg-nest-lavender-50'
      }`}>
        <span className="text-6xl block mb-3">{w.emoji}</span>
        <p className="text-3xl font-bold text-gray-800">{w.word}</p>
        {result && (
          <p className={`text-lg font-bold mt-3 ${result === 'correct' ? 'text-nest-green-600' : 'text-nest-peach-600'}`}>
            {result === 'correct' ? 'Correct!' : 'Oops! Try the next one!'}
          </p>
        )}
      </div>
      <p className="text-gray-500 mt-4 mb-4">Is this word spelled correctly?</p>
      <div className="flex gap-3 justify-center">
        <Button variant="success" onClick={() => handleAnswer(true)} disabled={result !== null} icon={<CheckCircle2 className="w-5 h-5" />}>
          Yes, Correct!
        </Button>
        <Button variant="warning" onClick={() => handleAnswer(false)} disabled={result !== null} icon={<X className="w-5 h-5" />}>
          No, Wrong!
        </Button>
      </div>
    </div>
  );
}
