import { useEffect, useRef, useState } from 'react';
import { Button, Card, Spinner } from '@/components/ui/Card';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/services/supabaseClient';
import { ArrowLeft, Bell, BellOff, Check, CloudRain, Leaf, Moon, Pause, Play, Plus, RotateCcw, Settings2, Square, Volume2, Waves } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

type SoundOption = 'rain' | 'ocean' | 'nature' | 'music' | 'silence';
type ColorMode = 'soft' | 'blue' | 'green' | 'warm';
interface SleepSettings { bedtime: string; wake_time: string; reminder_enabled: boolean; sound_option: SoundOption; volume: number; reduced_motion: boolean; color_mode: ColorMode; }
interface RoutineStep { id: string; title: string; position: number; enabled: boolean; }

const defaultSettings: SleepSettings = { bedtime: '20:30', wake_time: '07:00', reminder_enabled: true, sound_option: 'silence', volume: 45, reduced_motion: false, color_mode: 'soft' };
const sounds: { key: SoundOption; label: string; description: string; icon: typeof CloudRain }[] = [
  { key: 'rain', label: 'Rain', description: 'A steady gentle shower', icon: CloudRain },
  { key: 'ocean', label: 'Ocean waves', description: 'Slow waves by the shore', icon: Waves },
  { key: 'nature', label: 'Nature', description: 'Soft woodland sounds', icon: Leaf },
  { key: 'music', label: 'Soft music', description: 'A simple calming tone', icon: Moon },
  { key: 'silence', label: 'Silence', description: 'A quiet space for rest', icon: Moon },
];
const starterSteps = ['Put on cozy pajamas', 'Brush your teeth', 'Read or listen quietly', 'Take three slow breaths'];

function formatTime(value: string) { const [hour, minute] = value.slice(0, 5).split(':').map(Number); const date = new Date(); date.setHours(hour, minute, 0, 0); return date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }); }

export function SleepCompanion() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [settings, setSettings] = useState(defaultSettings);
  const [steps, setSteps] = useState<RoutineStep[]>([]);
  const [newStep, setNewStep] = useState('');
  const [loading, setLoading] = useState(true);
  const [playing, setPlaying] = useState(false);
  const [notice, setNotice] = useState('');
  const audioContextRef = useRef<AudioContext | null>(null);
  const sourceRef = useRef<AudioNode | null>(null);
  const gainRef = useRef<GainNode | null>(null);

  useEffect(() => {
    if (!user) return;
    let mounted = true;
    Promise.all([
      supabase.from('sleep_companion_settings').select('bedtime, wake_time, reminder_enabled, sound_option, volume, reduced_motion, color_mode').eq('user_id', user.id).maybeSingle(),
      supabase.from('sleep_routine_steps').select('id, title, position, enabled').eq('user_id', user.id).order('position'),
    ]).then(([settingsResult, stepsResult]) => {
      if (!mounted) return;
      if (settingsResult.data) setSettings(settingsResult.data as SleepSettings);
      if (stepsResult.data && stepsResult.data.length > 0) setSteps(stepsResult.data as RoutineStep[]);
      setLoading(false);
    });
    return () => { mounted = false; };
  }, [user]);

  useEffect(() => () => { sourceRef.current?.disconnect(); gainRef.current?.disconnect(); audioContextRef.current?.close(); }, []);

  useEffect(() => {
    if (!user || loading) return;
    const timer = window.setTimeout(() => {
      supabase.from('sleep_companion_settings').upsert({ user_id: user.id, ...settings, updated_at: new Date().toISOString() }, { onConflict: 'user_id' }).then(({ error }) => { if (error) setNotice('Your sleep settings could not be saved yet.'); });
    }, 350);
    return () => window.clearTimeout(timer);
  }, [settings, user, loading]);

  const createSound = () => {
    if (settings.sound_option === 'silence') return;
    const AudioContextClass = window.AudioContext || (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) { setNotice('Sound controls are not available in this browser.'); return; }
    const context = audioContextRef.current || new AudioContextClass();
    audioContextRef.current = context;
    const gain = context.createGain();
    gain.gain.value = settings.volume / 100 * 0.08;
    gain.connect(context.destination);
    if (settings.sound_option === 'music') {
      const oscillator = context.createOscillator();
      oscillator.type = 'sine'; oscillator.frequency.value = 220; oscillator.connect(gain); oscillator.start(); sourceRef.current = oscillator;
    } else {
      const buffer = context.createBuffer(1, context.sampleRate * 2, context.sampleRate);
      const data = buffer.getChannelData(0);
      for (let index = 0; index < data.length; index += 1) data[index] = (Math.random() * 2 - 1) * (settings.sound_option === 'ocean' ? 0.5 + Math.sin(index / 9000) * 0.5 : 0.7);
      const source = context.createBufferSource(); source.buffer = buffer; source.loop = true; source.connect(gain); source.start(); sourceRef.current = source;
    }
    gainRef.current = gain; setPlaying(true);
  };
  const playSound = async () => { if (settings.sound_option === 'silence') { setPlaying(false); return; } if (audioContextRef.current?.state === 'suspended') await audioContextRef.current.resume(); if (!sourceRef.current) createSound(); else setPlaying(true); };
  const pauseSound = async () => { if (audioContextRef.current?.state === 'running') await audioContextRef.current.suspend(); setPlaying(false); };
  const stopSound = () => { sourceRef.current?.disconnect(); sourceRef.current = null; setPlaying(false); };
  const changeSound = (sound: SoundOption) => { stopSound(); setSettings({ ...settings, sound_option: sound }); };

  const addStep = async () => {
    if (!user || !newStep.trim()) return;
    const { data, error } = await supabase.from('sleep_routine_steps').insert({ user_id: user.id, title: newStep.trim(), position: steps.length }).select('id, title, position, enabled').maybeSingle();
    if (error || !data) setNotice('That bedtime step could not be added.'); else { setSteps([...steps, data as RoutineStep]); setNewStep(''); }
  };
  const toggleStep = async (step: RoutineStep) => { const enabled = !step.enabled; await supabase.from('sleep_routine_steps').update({ enabled }).eq('id', step.id).eq('user_id', user?.id); setSteps(steps.map((item) => item.id === step.id ? { ...item, enabled } : item)); };
  const deleteStep = async (id: string) => { await supabase.from('sleep_routine_steps').delete().eq('id', id).eq('user_id', user?.id); setSteps(steps.filter((step) => step.id !== id)); };
  const useStarterSteps = async () => { for (const [position, title] of starterSteps.entries()) { if (user) await supabase.from('sleep_routine_steps').insert({ user_id: user.id, title, position }); } if (user) { const { data } = await supabase.from('sleep_routine_steps').select('id, title, position, enabled').eq('user_id', user.id).order('position'); setSteps((data || []) as RoutineStep[]); } };

  if (loading) return <Spinner label="Preparing your sleep companion..." className="py-20" />;
  const modeClass = `sleep-mode-${settings.color_mode}${settings.reduced_motion ? ' sleep-reduced-motion' : ''}`;

  return <div className={`${modeClass} max-w-5xl mx-auto space-y-6 animate-slide-up`}>
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"><div><button onClick={() => navigate(-1)} className="text-sm text-nest-blue-600 font-semibold flex items-center gap-1 mb-2"><ArrowLeft className="w-4 h-4" /> Back</button><h1 className="text-2xl lg:text-3xl font-bold text-gray-800">Calm Corner & Sleep Companion</h1><p className="text-gray-500 mt-1">Make your evening feel predictable, peaceful, and yours.</p></div><div className="rounded-2xl bg-white px-4 py-3 shadow-soft"><p className="text-xs text-gray-400">Tonight’s bedtime</p><p className="font-bold text-gray-700">{formatTime(settings.bedtime)}</p></div></div>
    {notice && <div className="rounded-xl bg-nest-yellow-50 border border-nest-yellow-200 px-4 py-3 text-nest-yellow-800">{notice}</div>}
    <Card className="bg-white/90"><div className="flex items-center justify-between mb-4"><div><h2 className="text-xl font-bold text-gray-800">Calming sounds</h2><p className="text-sm text-gray-500">Choose a gentle background for your calm corner.</p></div><Volume2 className="w-6 h-6 text-nest-blue-400" /></div><div className="grid grid-cols-2 md:grid-cols-5 gap-3">{sounds.map((sound) => <button key={sound.key} onClick={() => changeSound(sound.key)} className={`text-left rounded-2xl border-2 p-3 ${settings.sound_option === sound.key ? 'border-nest-blue-400 bg-nest-blue-50' : 'border-gray-100 hover:border-nest-blue-200'}`}><sound.icon className="w-6 h-6 text-nest-blue-500 mb-2" /><span className="block font-bold text-gray-700 text-sm">{sound.label}</span><span className="block text-xs text-gray-400 mt-1">{sound.description}</span></button>)}</div><div className="flex flex-wrap items-center gap-2 mt-5"><Button size="sm" onClick={playSound} disabled={settings.sound_option === 'silence'} icon={<Play className="w-4 h-4" />}>Play</Button><Button size="sm" variant="outline" onClick={pauseSound} disabled={!playing} icon={<Pause className="w-4 h-4" />}>Pause</Button><Button size="sm" variant="ghost" onClick={stopSound} icon={<Square className="w-4 h-4" />}>Stop</Button><label className="flex items-center gap-2 text-sm font-semibold text-gray-600 ml-auto">Volume<input type="range" min="0" max="100" value={settings.volume} onChange={(event) => { const volume = Number(event.target.value); setSettings({ ...settings, volume }); if (gainRef.current) gainRef.current.gain.value = volume / 100 * 0.08; }} className="accent-nest-blue-500" /></label></div></Card>
    <div className="grid lg:grid-cols-2 gap-6"><Card><div className="flex items-center gap-2 mb-4"><Moon className="w-6 h-6 text-nest-lavender-500" /><div><h2 className="text-xl font-bold text-gray-800">Bedtime plan</h2><p className="text-sm text-gray-500">A predictable rhythm can make rest easier.</p></div></div><div className="grid grid-cols-2 gap-3"><label className="text-sm font-semibold text-gray-600">Bedtime<input type="time" value={settings.bedtime} onChange={(event) => setSettings({ ...settings, bedtime: event.target.value })} className="mt-1 w-full rounded-xl border-2 border-gray-200 px-3 py-2.5 text-gray-700" /></label><label className="text-sm font-semibold text-gray-600">Wake up<input type="time" value={settings.wake_time} onChange={(event) => setSettings({ ...settings, wake_time: event.target.value })} className="mt-1 w-full rounded-xl border-2 border-gray-200 px-3 py-2.5 text-gray-700" /></label></div><button onClick={() => setSettings({ ...settings, reminder_enabled: !settings.reminder_enabled })} className={`mt-4 w-full flex items-center justify-between rounded-xl border-2 px-4 py-3 ${settings.reminder_enabled ? 'bg-nest-green-50 border-nest-green-200' : 'border-gray-100'}`}><span className="font-semibold text-gray-700">Bedtime reminder</span>{settings.reminder_enabled ? <Bell className="w-5 h-5 text-nest-green-500" /> : <BellOff className="w-5 h-5 text-gray-400" />}</button></Card>
      <Card><div className="flex items-center gap-2 mb-4"><Settings2 className="w-6 h-6 text-nest-green-500" /><div><h2 className="text-xl font-bold text-gray-800">Sensory settings</h2><p className="text-sm text-gray-500">Make the space feel comfortable.</p></div></div><div className="grid grid-cols-2 gap-2">{(['soft', 'blue', 'green', 'warm'] as ColorMode[]).map((mode) => <button key={mode} onClick={() => setSettings({ ...settings, color_mode: mode })} className={`rounded-xl p-3 border-2 text-sm font-semibold capitalize ${settings.color_mode === mode ? 'border-nest-green-400 bg-nest-green-50 text-nest-green-700' : 'border-gray-100 text-gray-500'}`}>{mode}</button>)}</div><button onClick={() => setSettings({ ...settings, reduced_motion: !settings.reduced_motion })} className="mt-4 w-full flex items-center justify-between rounded-xl border-2 border-gray-100 px-4 py-3"><span className="font-semibold text-gray-700">Reduce animations</span><span className={`w-11 h-6 rounded-full ${settings.reduced_motion ? 'bg-nest-green-400' : 'bg-gray-300'} relative`}><span className="absolute top-0.5 w-5 h-5 bg-white rounded-full" style={{ left: settings.reduced_motion ? '22px' : '2px' }} /></span></button></Card></div>
    <Card><div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4"><div><h2 className="text-xl font-bold text-gray-800">My bedtime routine</h2><p className="text-sm text-gray-500">Keep the same comforting steps, or make your own.</p></div>{steps.length === 0 && <Button size="sm" variant="outline" onClick={useStarterSteps} icon={<RotateCcw className="w-4 h-4" />}>Use starter routine</Button>}</div>{steps.length === 0 ? <p className="text-center text-gray-400 py-5">No steps yet. Add one below.</p> : <div className="space-y-2 mb-4">{steps.map((step, index) => <div key={step.id} className={`flex items-center gap-3 rounded-xl border px-3 py-2.5 ${step.enabled ? 'border-gray-100' : 'border-gray-100 opacity-50'}`}><span className="w-7 h-7 rounded-full bg-nest-lavender-100 text-nest-lavender-700 flex items-center justify-center font-bold text-sm">{index + 1}</span><span className="flex-1 font-semibold text-gray-700">{step.title}</span><button onClick={() => toggleStep(step)} aria-label={`Mark ${step.title} ${step.enabled ? 'inactive' : 'active'}`}><Check className={`w-5 h-5 ${step.enabled ? 'text-nest-green-500' : 'text-gray-300'}`} /></button><button onClick={() => deleteStep(step.id)} className="text-gray-300 hover:text-nest-peach-600" aria-label={`Delete ${step.title}`}>×</button></div>)}</div>}<div className="flex gap-2"><input value={newStep} onChange={(event) => setNewStep(event.target.value)} onKeyDown={(event) => { if (event.key === 'Enter') addStep(); }} className="flex-1 rounded-xl border-2 border-gray-200 px-4 py-2.5 text-gray-700 outline-none focus:border-nest-blue-400" placeholder="Add a bedtime step" /><Button onClick={addStep} icon={<Plus className="w-4 h-4" />}>Add</Button></div></Card>
  </div>;
}
