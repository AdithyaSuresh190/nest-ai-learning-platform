import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Card } from '@/components/ui/Card';
import { BreathingExercise } from '@/components/calm/BreathingExercise';
import { DrawingCanvas } from '@/components/calm/DrawingCanvas';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/services/supabaseClient';
import {
  Heart, Wind, Palette, Type, Moon, Sparkles, Brush,
  ArrowLeft, Check, Volume2, VolumeX, Smile, Frown, Meh,
  Leaf, RefreshCw, BookOpen,
} from 'lucide-react';

type Mood = 'great' | 'okay' | 'tired' | 'stressed' | 'sad';
type ThemeName = 'meadow' | 'ocean' | 'sunset' | 'twilight';
type TabId = 'breathing' | 'drawing' | 'activities' | 'settings';

interface CalmPrefs {
  theme: ThemeName;
  quietMode: boolean;
  textSize: 'small' | 'medium' | 'large' | 'x-large';
  soundEnabled: boolean;
}

const defaultPrefs: CalmPrefs = {
  theme: 'meadow',
  quietMode: false,
  textSize: 'medium',
  soundEnabled: true,
};

const moodOptions: { value: Mood; label: string; emoji: string; icon: typeof Smile; color: string }[] = [
  { value: 'great', label: 'Great', emoji: '😊', icon: Smile, color: 'bg-nest-green-100 text-nest-green-700 border-nest-green-300' },
  { value: 'okay', label: 'Okay', emoji: '🙂', icon: Meh, color: 'bg-nest-blue-100 text-nest-blue-700 border-nest-blue-300' },
  { value: 'tired', label: 'Tired', emoji: '😴', icon: Meh, color: 'bg-nest-lavender-100 text-nest-lavender-700 border-nest-lavender-300' },
  { value: 'stressed', label: 'Stressed', emoji: '😣', icon: Frown, color: 'bg-nest-peach-100 text-nest-peach-700 border-nest-peach-300' },
  { value: 'sad', label: 'Sad', emoji: '😢', icon: Frown, color: 'bg-nest-yellow-100 text-nest-yellow-700 border-nest-yellow-300' },
];

const themes: { value: ThemeName; label: string; preview: string; emoji: string }[] = [
  { value: 'meadow', label: 'Meadow', preview: 'from-nest-green-200 to-nest-blue-200', emoji: '🌿' },
  { value: 'ocean', label: 'Ocean', preview: 'from-nest-blue-200 to-nest-lavender-200', emoji: '🌊' },
  { value: 'sunset', label: 'Sunset', preview: 'from-nest-peach-200 to-nest-yellow-200', emoji: '🌅' },
  { value: 'twilight', label: 'Twilight', preview: 'from-nest-lavender-200 to-nest-blue-200', emoji: '🌙' },
];

const themeClasses: Record<ThemeName, string> = {
  meadow: 'calm-theme-meadow',
  ocean: 'calm-theme-ocean',
  sunset: 'calm-theme-sunset',
  twilight: 'calm-theme-twilight',
};

const textSizes: { value: CalmPrefs['textSize']; label: string; sample: string }[] = [
  { value: 'small', label: 'Small', sample: 'text-sm' },
  { value: 'medium', label: 'Medium', sample: 'text-base' },
  { value: 'large', label: 'Large', sample: 'text-lg' },
  { value: 'x-large', label: 'Extra Large', sample: 'text-xl' },
];

const textSizeMap: Record<CalmPrefs['textSize'], { heading: string; body: string; small: string }> = {
  small: { heading: 'text-lg', body: 'text-sm', small: 'text-xs' },
  medium: { heading: 'text-xl', body: 'text-base', small: 'text-sm' },
  large: { heading: 'text-2xl', body: 'text-lg', small: 'text-base' },
  'x-large': { heading: 'text-3xl', body: 'text-xl', small: 'text-lg' },
};

interface CalmingActivity {
  id: string;
  title: string;
  description: string;
  emoji: string;
  steps: string[];
  duration: number;
}

const calmingActivities: CalmingActivity[] = [
  {
    id: '5-4-3-2-1',
    title: '5-4-3-2-1 Senses',
    description: 'Ground yourself by noticing things around you',
    emoji: '🌈',
    duration: 3,
    steps: [
      'Name 5 things you can SEE around you',
      'Name 4 things you can FEEL (like your chair or clothes)',
      'Name 3 things you can HEAR right now',
      'Name 2 things you can SMELL',
      'Name 1 thing you can TASTE',
    ],
  },
  {
    id: 'muscle-relax',
    title: 'Body Scan Relaxation',
    description: 'Tighten and release each muscle group',
    emoji: '💪',
    duration: 5,
    steps: [
      'Squeeze your hands into tight fists for 5 seconds, then release',
      'Tighten your arms for 5 seconds, then let them go floppy',
      'Scrunch up your face for 5 seconds, then relax',
      'Tighten your shoulders up to your ears for 5 seconds, then drop them',
      'Tighten your whole body for 5 seconds, then let it all go soft',
    ],
  },
  {
    id: 'happy-memory',
    title: 'Happy Memory',
    description: 'Visit a favorite memory in your mind',
    emoji: '☀️',
    duration: 2,
    steps: [
      'Close your eyes and think of a time you felt really happy',
      'Picture where you were — what did it look like?',
      'Remember the sounds and smells from that moment',
      'Notice how your body feels thinking about this memory',
      'Take 3 slow breaths and hold onto that warm feeling',
    ],
  },
  {
    id: 'counting-stars',
    title: 'Star Counting',
    description: 'A gentle counting meditation',
    emoji: '⭐',
    duration: 2,
    steps: [
      'Sit comfortably and look at a blank wall or close your eyes',
      'Slowly count from 1 to 10 in your mind',
      'If you lose track, just start again from 1 — that is okay!',
      'After reaching 10, count backward from 10 to 1',
      'Notice how your body feels calmer now',
    ],
  },
];

const breakSuggestions: { title: string; emoji: string; description: string }[] = [
  { title: 'Drink some water', emoji: '💧', description: 'Take a few sips of water to refresh yourself.' },
  { title: 'Stretch your body', emoji: '🤸', description: 'Stand up and reach for the sky, then touch your toes.' },
  { title: 'Look out a window', emoji: '🪟', description: 'Look at something far away for 20 seconds to rest your eyes.' },
  { title: 'Give yourself a hug', emoji: '🤗', description: 'Wrap your arms around yourself and squeeze gently for 10 seconds.' },
  { title: 'Wiggle it out', emoji: '🙌', description: 'Shake your hands and arms for 15 seconds to let go of tension.' },
  { title: 'Close your eyes', emoji: '😌', description: 'Close your eyes for 30 seconds and just listen to the sounds around you.' },
];

function loadLocalPrefs(): CalmPrefs {
  try {
    const raw = localStorage.getItem('nest-calm-prefs');
    if (raw) {
      const parsed = JSON.parse(raw);
      return { ...defaultPrefs, ...parsed };
    }
  } catch {
    // ignore parse errors
  }
  return defaultPrefs;
}

function saveLocalPrefs(prefs: CalmPrefs) {
  try {
    localStorage.setItem('nest-calm-prefs', JSON.stringify(prefs));
  } catch {
    // ignore storage errors
  }
}

export function CalmSpace() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [prefs, setPrefs] = useState<CalmPrefs>(loadLocalPrefs);
  const [currentMood, setCurrentMood] = useState<Mood | null>(null);
  const [moodHistory, setMoodHistory] = useState<{ mood: Mood; created_at: string }[]>([]);
  const [activeTab, setActiveTab] = useState<TabId>('breathing');
  const [activeActivity, setActiveActivity] = useState<string | null>(null);
  const [activityStep, setActivityStep] = useState(0);
  const [breakIndex, setBreakIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const breakTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const lastMoodLoggedRef = useRef<Mood | null>(null);

  // Load prefs and mood history from Supabase on mount
  useEffect(() => {
    if (!user) return;
    let mounted = true;

    (async () => {
      // Load prefs
      const { data: prefsData } = await supabase
        .from('calm_space_prefs')
        .select('theme, text_size, quiet_mode, sound_enabled')
        .eq('user_id', user.id)
        .maybeSingle();

      if (mounted && prefsData) {
        const dbPrefs: CalmPrefs = {
          theme: prefsData.theme as ThemeName,
          textSize: prefsData.text_size as CalmPrefs['textSize'],
          quietMode: prefsData.quiet_mode as boolean,
          soundEnabled: prefsData.sound_enabled as boolean,
        };
        setPrefs(dbPrefs);
        saveLocalPrefs(dbPrefs);
      }

      // Load recent mood history (last 7 entries)
      const { data: moodData } = await supabase
        .from('calm_mood_logs')
        .select('mood, created_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(7);

      if (mounted && moodData && moodData.length > 0) {
        setMoodHistory(moodData as { mood: Mood; created_at: string }[]);
        setCurrentMood(moodData[0].mood as Mood);
        lastMoodLoggedRef.current = moodData[0].mood as Mood;
      }

      if (mounted) setLoading(false);
    })();

    return () => { mounted = false; };
  }, [user]);

  // Save prefs to localStorage + Supabase whenever they change
  useEffect(() => {
    saveLocalPrefs(prefs);
    if (!user || loading) return;

    supabase
      .from('calm_space_prefs')
      .upsert({
        user_id: user.id,
        theme: prefs.theme,
        text_size: prefs.textSize,
        quiet_mode: prefs.quietMode,
        sound_enabled: prefs.soundEnabled,
        updated_at: new Date().toISOString(),
      })
      .then(({ error }) => {
        if (error) console.error('Failed to save calm prefs:', error.message);
      });
  }, [prefs, user, loading]);

  // Toggle quiet mode on the document body
  useEffect(() => {
    document.body.classList.toggle('calm-quiet-mode', prefs.quietMode);
    return () => {
      document.body.classList.remove('calm-quiet-mode');
    };
  }, [prefs.quietMode]);

  // Cycle break suggestions every 30 seconds on the activities tab
  useEffect(() => {
    if (activeTab !== 'activities') return;
    breakTimerRef.current = setInterval(() => {
      setBreakIndex((i) => (i + 1) % breakSuggestions.length);
    }, 30000);
    return () => {
      if (breakTimerRef.current) clearInterval(breakTimerRef.current);
    };
  }, [activeTab]);

  const update = (updates: Partial<CalmPrefs>) => {
    setPrefs((prev) => ({ ...prev, ...updates }));
  };

  const handleMoodSelect = useCallback((mood: Mood) => {
    setCurrentMood(mood);

    // Only log to DB if the mood changed (avoid duplicate entries for same mood)
    if (lastMoodLoggedRef.current !== mood && user) {
      lastMoodLoggedRef.current = mood;
      supabase
        .from('calm_mood_logs')
        .insert({ user_id: user.id, mood })
        .then(({ error }) => {
          if (error) {
            console.error('Failed to log mood:', error.message);
          } else {
            setMoodHistory((prev) => [{ mood, created_at: new Date().toISOString() }, ...prev].slice(0, 7));
          }
        });
    }
  }, [user]);

  const ts = textSizeMap[prefs.textSize];
  const themeClass = themeClasses[prefs.theme];
  const currentActivity = calmingActivities.find((a) => a.id === activeActivity);
  const currentBreak = breakSuggestions[breakIndex];

  const tabs: { id: TabId; label: string; icon: typeof Wind }[] = [
    { id: 'breathing', label: 'Breathing', icon: Wind },
    { id: 'drawing', label: 'Drawing', icon: Brush },
    { id: 'activities', label: 'Activities', icon: Sparkles },
    { id: 'settings', label: 'Settings', icon: Palette },
  ];

  const themeAccentColors: Record<ThemeName, { bg: string; text: string; border: string }> = {
    meadow: { bg: 'bg-nest-green-100', text: 'text-nest-green-700', border: 'border-nest-green-300' },
    ocean: { bg: 'bg-nest-blue-100', text: 'text-nest-blue-700', border: 'border-nest-blue-300' },
    sunset: { bg: 'bg-nest-peach-100', text: 'text-nest-peach-700', border: 'border-nest-peach-300' },
    twilight: { bg: 'bg-nest-lavender-100', text: 'text-nest-lavender-700', border: 'border-nest-lavender-300' },
  };

  const accent = themeAccentColors[prefs.theme];

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-10 h-10 border-4 border-nest-green-200 border-t-nest-green-400 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className={`${themeClass} rounded-3xl p-4 lg:p-6 space-y-6 animate-slide-up`} style={{ background: 'var(--calm-bg)' }}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className={`${ts.heading} font-bold text-gray-800 flex items-center gap-2`}>
            <span className="text-3xl">🌿</span>
            CalmSpace
          </h1>
          <p className={`${ts.small} text-gray-500`}>A peaceful place to rest, breathe, and recharge</p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate(-1)}
          icon={<ArrowLeft className="w-4 h-4" />}
        >
          Back to Learning
        </Button>
      </div>

      {/* Mood check-in */}
      <Card className={`${accent.bg} ${accent.border} border-2`}>
        <h2 className={`${ts.heading} font-bold text-gray-700 mb-1 flex items-center gap-2`}>
          <Heart className="w-5 h-5" />
          How are you feeling right now?
        </h2>
        <p className={`${ts.small} text-gray-500 mb-4`}>Tap how you feel — there are no wrong answers</p>
        <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
          {moodOptions.map((mood) => {
            const selected = currentMood === mood.value;
            return (
              <button
                key={mood.value}
                onClick={() => handleMoodSelect(mood.value)}
                className={`flex flex-col items-center gap-1 p-3 rounded-2xl border-2 transition-all ${
                  selected ? `${mood.color} shadow-soft scale-105` : 'border-transparent bg-white/60 hover:bg-white'
                }`}
              >
                <span className="text-3xl">{mood.emoji}</span>
                <span className={`${ts.small} font-semibold`}>{mood.label}</span>
                {selected && <Check className="w-4 h-4" />}
              </button>
            );
          })}
        </div>
        {currentMood && (
          <div className="mt-4 px-4 py-3 rounded-xl bg-white/70 animate-fade-in">
            <p className={`${ts.body} text-gray-600`}>
              {currentMood === 'great' && "Wonderful! Keep that positive energy as you learn today."}
              {currentMood === 'okay' && "Good to hear! You're doing just fine. Ready for some calm activities?"}
              {currentMood === 'tired' && "It sounds like you need a gentle break. Try the breathing exercise or a calming activity."}
              {currentMood === 'stressed' && "Let's help you feel calmer. The breathing exercise below can really help — give it a try."}
              {currentMood === 'sad' && "It's okay to feel sad. Try drawing something or doing a happy memory activity — it might bring a small smile."}
            </p>
          </div>
        )}
        {/* Mood history strip */}
        {moodHistory.length > 1 && (
          <div className="mt-3 flex items-center gap-2 flex-wrap">
            <span className={`${ts.small} font-semibold text-gray-400`}>Recent moods:</span>
            {moodHistory.slice(0, 7).map((entry, i) => {
              const moodOpt = moodOptions.find((m) => m.value === entry.mood);
              return (
                <span key={i} className="text-lg" title={`${moodOpt?.label} — ${new Date(entry.created_at).toLocaleDateString()}`}>
                  {moodOpt?.emoji}
                </span>
              );
            })}
          </div>
        )}
      </Card>

      {/* Tab navigation */}
      <div className="flex flex-wrap gap-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`calm-active flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm transition-all ${
                active
                  ? `${accent.bg} ${accent.text} shadow-soft`
                  : 'bg-white/60 text-gray-500 hover:bg-white'
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab content */}
      <div className="animate-fade-in">
        {/* Breathing */}
        {activeTab === 'breathing' && (
          <Card>
            <h2 className={`${ts.heading} font-bold text-gray-700 mb-4 flex items-center gap-2`}>
              <Wind className="w-5 h-5 text-nest-green-400" />
              Guided Breathing
            </h2>
            <BreathingExercise />
          </Card>
        )}

        {/* Drawing */}
        {activeTab === 'drawing' && (
          <Card>
            <h2 className={`${ts.heading} font-bold text-gray-700 mb-1 flex items-center gap-2`}>
              <Brush className="w-5 h-5 text-nest-lavender-400" />
              Calm Drawing Canvas
            </h2>
            <p className={`${ts.small} text-gray-500 mb-4`}>Draw freely — there's no right or wrong. Just let your creativity flow.</p>
            <DrawingCanvas brushColor={accent.text.includes('green') ? '#65cd7c' : accent.text.includes('blue') ? '#36a9f6' : accent.text.includes('peach') ? '#fc9358' : '#b48eff'} />
          </Card>
        )}

        {/* Activities */}
        {activeTab === 'activities' && (
          <div className="space-y-4">
            {/* Calming activities */}
            <Card>
              <h2 className={`${ts.heading} font-bold text-gray-700 mb-4 flex items-center gap-2`}>
                <Sparkles className="w-5 h-5 text-nest-blue-400" />
                Calming Activities
              </h2>
              {currentActivity ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-4xl">{currentActivity.emoji}</span>
                      <div>
                        <h3 className={`${ts.body} font-bold text-gray-700`}>{currentActivity.title}</h3>
                        <p className={`${ts.small} text-gray-400`}>Step {activityStep + 1} of {currentActivity.steps.length}</p>
                      </div>
                    </div>
                    <Button size="sm" variant="ghost" onClick={() => { setActiveActivity(null); setActivityStep(0); }}>
                      Exit
                    </Button>
                  </div>

                  {/* Progress dots */}
                  <div className="flex gap-1.5">
                    {currentActivity.steps.map((_, i) => (
                      <div key={i} className={`h-2 rounded-full transition-all ${i <= activityStep ? 'w-8 bg-nest-blue-400' : 'w-2 bg-gray-200'}`} />
                    ))}
                  </div>

                  {/* Current step */}
                  <div className={`px-6 py-8 rounded-2xl ${accent.bg} text-center animate-fade-in`} key={activityStep}>
                    <p className={`${ts.heading} font-bold text-gray-700`}>{currentActivity.steps[activityStep]}</p>
                  </div>

                  {/* Navigation */}
                  <div className="flex justify-between">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setActivityStep((s) => Math.max(0, s - 1))}
                      disabled={activityStep === 0}
                    >
                      Previous
                    </Button>
                    {activityStep < currentActivity.steps.length - 1 ? (
                      <Button size="sm" onClick={() => setActivityStep((s) => s + 1)}>
                        Next Step
                      </Button>
                    ) : (
                      <Button size="sm" variant="success" onClick={() => { setActiveActivity(null); setActivityStep(0); }} icon={<Check className="w-4 h-4" />}>
                        All Done!
                      </Button>
                    )}
                  </div>
                </div>
              ) : (
                <div className="grid sm:grid-cols-2 gap-3">
                  {calmingActivities.map((activity) => (
                    <button
                      key={activity.id}
                      onClick={() => { setActiveActivity(activity.id); setActivityStep(0); }}
                      className="flex items-start gap-3 p-4 rounded-2xl border-2 border-gray-100 hover:border-nest-blue-300 hover:bg-nest-blue-50 transition-all text-left"
                    >
                      <span className="text-3xl flex-shrink-0">{activity.emoji}</span>
                      <div>
                        <h3 className={`${ts.body} font-bold text-gray-700`}>{activity.title}</h3>
                        <p className={`${ts.small} text-gray-400`}>{activity.description}</p>
                        <p className={`${ts.small} text-gray-400 mt-1`}>~{activity.duration} min</p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </Card>

            {/* Gentle break suggestion */}
            {!currentActivity && (
              <Card className={`${accent.bg} ${accent.border} border-2`}>
                <h3 className={`${ts.body} font-bold text-gray-700 mb-3 flex items-center gap-2`}>
                  <Leaf className="w-5 h-5" />
                  Gentle Break Suggestion
                </h3>
                <div className="flex items-center gap-4">
                  <span className="text-5xl animate-calm-float">{currentBreak.emoji}</span>
                  <div className="flex-1">
                    <p className={`${ts.body} font-bold text-gray-700`}>{currentBreak.title}</p>
                    <p className={`${ts.small} text-gray-500`}>{currentBreak.description}</p>
                  </div>
                </div>
                <div className="flex justify-end mt-3">
                  <Button size="sm" variant="ghost" onClick={() => setBreakIndex((i) => (i + 1) % breakSuggestions.length)} icon={<RefreshCw className="w-4 h-4" />}>
                    Next suggestion
                  </Button>
                </div>
              </Card>
            )}
          </div>
        )}

        {/* Settings */}
        {activeTab === 'settings' && (
          <div className="space-y-4">
            {/* Theme picker */}
            <Card>
              <h2 className={`${ts.heading} font-bold text-gray-700 mb-4 flex items-center gap-2`}>
                <Palette className="w-5 h-5 text-nest-lavender-400" />
                Calm Theme
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {themes.map((theme) => {
                  const selected = prefs.theme === theme.value;
                  return (
                    <button
                      key={theme.value}
                      onClick={() => update({ theme: theme.value })}
                      className={`flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all ${
                        selected ? 'border-gray-400 shadow-soft scale-105' : 'border-gray-100 hover:border-gray-200'
                      }`}
                    >
                      <div className={`w-full h-16 rounded-xl bg-gradient-to-br ${theme.preview} flex items-center justify-center`}>
                        <span className="text-3xl">{theme.emoji}</span>
                      </div>
                      <span className={`${ts.small} font-semibold text-gray-600`}>{theme.label}</span>
                      {selected && <Check className="w-4 h-4 text-nest-green-500" />}
                    </button>
                  );
                })}
              </div>
            </Card>

            {/* Text size */}
            <Card>
              <h2 className={`${ts.heading} font-bold text-gray-700 mb-4 flex items-center gap-2`}>
                <Type className="w-5 h-5 text-nest-blue-400" />
                Text Size
              </h2>
              <div className="grid grid-cols-4 gap-3">
                {textSizes.map((size) => {
                  const selected = prefs.textSize === size.value;
                  return (
                    <button
                      key={size.value}
                      onClick={() => update({ textSize: size.value })}
                      className={`flex flex-col items-center gap-1 p-4 rounded-2xl border-2 transition-all ${
                        selected ? `${accent.bg} ${accent.border} shadow-soft` : 'border-gray-100 hover:border-gray-200'
                      }`}
                    >
                      <span className={`${size.sample} font-bold text-gray-700`}>Aa</span>
                      <span className="text-xs font-semibold text-gray-400">{size.label}</span>
                    </button>
                  );
                })}
              </div>
            </Card>

            {/* Quiet mode */}
            <Card>
              <h2 className={`${ts.heading} font-bold text-gray-700 mb-1 flex items-center gap-2`}>
                <Moon className="w-5 h-5 text-nest-lavender-400" />
                Quiet Mode
              </h2>
              <p className={`${ts.small} text-gray-500 mb-4`}>Reduces visual noise by dimming the sidebar and colors around the app</p>
              <button
                onClick={() => update({ quietMode: !prefs.quietMode })}
                className={`w-full flex items-center justify-between px-5 py-4 rounded-2xl border-2 transition-all ${
                  prefs.quietMode ? `${accent.bg} ${accent.border}` : 'border-gray-100 hover:border-gray-200'
                }`}
              >
                <span className={`${ts.body} font-semibold text-gray-700`}>
                  {prefs.quietMode ? 'Quiet Mode is ON' : 'Quiet Mode is OFF'}
                </span>
                <div className={`w-12 h-7 rounded-full transition-all relative ${prefs.quietMode ? 'bg-nest-green-400' : 'bg-gray-300'}`}>
                  <div className="absolute top-0.5 w-6 h-6 rounded-full bg-white shadow-soft transition-all" style={{ left: prefs.quietMode ? '22px' : '2px' }} />
                </div>
              </button>
            </Card>

            {/* Sound toggle */}
            <Card>
              <h2 className={`${ts.heading} font-bold text-gray-700 mb-1 flex items-center gap-2`}>
                {prefs.soundEnabled ? <Volume2 className="w-5 h-5 text-nest-green-400" /> : <VolumeX className="w-5 h-5 text-gray-400" />}
                Sound Effects
              </h2>
              <p className={`${ts.small} text-gray-500 mb-4`}>Gentle sounds for breathing and activities</p>
              <button
                onClick={() => update({ soundEnabled: !prefs.soundEnabled })}
                className={`w-full flex items-center justify-between px-5 py-4 rounded-2xl border-2 transition-all ${
                  prefs.soundEnabled ? `${accent.bg} ${accent.border}` : 'border-gray-100 hover:border-gray-200'
                }`}
              >
                <span className={`${ts.body} font-semibold text-gray-700`}>
                  {prefs.soundEnabled ? 'Sound is ON' : 'Sound is OFF'}
                </span>
                <div className={`w-12 h-7 rounded-full transition-all relative ${prefs.soundEnabled ? 'bg-nest-green-400' : 'bg-gray-300'}`}>
                  <div className="absolute top-0.5 w-6 h-6 rounded-full bg-white shadow-soft transition-all" style={{ left: prefs.soundEnabled ? '22px' : '2px' }} />
                </div>
              </button>
            </Card>
          </div>
        )}
      </div>

      {/* Return to learning CTA */}
      <Card className="bg-gradient-to-r from-nest-blue-50 to-nest-green-50 border-nest-blue-200 text-center">
        <div className="flex flex-col items-center gap-3 py-2">
          <span className="text-4xl animate-calm-float">🪺</span>
          <h3 className={`${ts.body} font-bold text-gray-700`}>Feeling calmer? Ready to learn?</h3>
          <p className={`${ts.small} text-gray-500 max-w-md`}>You can come back to CalmSpace anytime you need a break. Your learning adventure is waiting!</p>
          <Button onClick={() => navigate('/student')} icon={<BookOpen className="w-5 h-5" />}>
            Back to Learning
          </Button>
        </div>
      </Card>
    </div>
  );
}
