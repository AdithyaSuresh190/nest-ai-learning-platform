import { useEffect, useMemo, useState } from 'react';
import { Button, Card, Modal, Spinner } from '@/components/ui/Card';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/services/supabaseClient';
import { ArrowLeft, Bell, BellOff, BookOpen, Check, Clock3, Coffee, Edit3, Heart, Home, Music, Plus, Sparkles, Sun, Trash2, Utensils, Move } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface RoutineActivity {
  id: string;
  title: string;
  start_time: string;
  duration_minutes: number;
  icon: IconKey;
  is_break: boolean;
  reminder_enabled: boolean;
}

type IconKey = 'sun' | 'book' | 'utensils' | 'heart' | 'star' | 'music' | 'home' | 'walk' | 'break';

type ActivityForm = Omit<RoutineActivity, 'id'>;

const iconOptions: { key: IconKey; label: string; icon: typeof Sun }[] = [
  { key: 'sun', label: 'Morning', icon: Sun },
  { key: 'book', label: 'Learning', icon: BookOpen },
  { key: 'utensils', label: 'Meal', icon: Utensils },
  { key: 'heart', label: 'Care', icon: Heart },
  { key: 'star', label: 'Special', icon: Sparkles },
  { key: 'music', label: 'Music', icon: Music },
  { key: 'home', label: 'Home', icon: Home },
  { key: 'walk', label: 'Movement', icon: Move },
  { key: 'break', label: 'Break', icon: Coffee },
];

const suggestions: ActivityForm[] = [
  { title: 'Morning stretch', start_time: '07:30', duration_minutes: 10, icon: 'walk', is_break: false, reminder_enabled: true },
  { title: 'Reading time', start_time: '09:00', duration_minutes: 25, icon: 'book', is_break: false, reminder_enabled: true },
  { title: 'Quiet break', start_time: '10:00', duration_minutes: 10, icon: 'break', is_break: true, reminder_enabled: true },
];

const emptyForm: ActivityForm = {
  title: '', start_time: '09:00', duration_minutes: 15, icon: 'star', is_break: false, reminder_enabled: true,
};

function formatTime(value: string) {
  const [hour, minute] = value.slice(0, 5).split(':').map(Number);
  const date = new Date();
  date.setHours(hour, minute, 0, 0);
  return date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
}

function IconFor({ name, className = 'w-5 h-5' }: { name: IconKey; className?: string }) {
  const option = iconOptions.find((item) => item.key === name) || iconOptions[4];
  const Icon = option.icon;
  return <Icon className={className} />;
}

export function DailyRoutine() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activities, setActivities] = useState<RoutineActivity[]>([]);
  const [form, setForm] = useState<ActivityForm>(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState('');

  useEffect(() => {
    if (!user) return;
    let mounted = true;
    supabase.from('routine_activities').select('id, title, start_time, duration_minutes, icon, is_break, reminder_enabled').eq('user_id', user.id).order('start_time').then(({ data, error }) => {
      if (!mounted) return;
      if (error) setNotice('Your routine could not be loaded yet.');
      setActivities((data || []) as RoutineActivity[]);
      setLoading(false);
    });
    return () => { mounted = false; };
  }, [user]);

  useEffect(() => {
    if (!user || activities.length === 0) return;
    const checkReminder = () => {
      const now = new Date();
      const current = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
      const match = activities.find((activity) => activity.reminder_enabled && activity.start_time.slice(0, 5) === current);
      if (match) setNotice(`It is time for ${match.title}. You are doing great.`);
    };
    checkReminder();
    const timer = window.setInterval(checkReminder, 30000);
    return () => window.clearInterval(timer);
  }, [activities, user]);

  const nextActivity = useMemo(() => {
    const now = new Date();
    const current = now.getHours() * 60 + now.getMinutes();
    return activities.find((activity) => {
      const [hour, minute] = activity.start_time.slice(0, 5).split(':').map(Number);
      return hour * 60 + minute >= current;
    });
  }, [activities]);

  const openNew = () => { setEditingId(null); setForm(emptyForm); setModalOpen(true); };
  const openEdit = (activity: RoutineActivity) => {
    setEditingId(activity.id);
    setForm({ title: activity.title, start_time: activity.start_time.slice(0, 5), duration_minutes: activity.duration_minutes, icon: activity.icon, is_break: activity.is_break, reminder_enabled: activity.reminder_enabled });
    setModalOpen(true);
  };

  const saveActivity = async () => {
    if (!user || !form.title.trim()) return;
    setSaving(true);
    const payload = { ...form, title: form.title.trim(), updated_at: new Date().toISOString() };
    const result = editingId
      ? await supabase.from('routine_activities').update(payload).eq('id', editingId).eq('user_id', user.id).select('id, title, start_time, duration_minutes, icon, is_break, reminder_enabled').maybeSingle()
      : await supabase.from('routine_activities').insert({ ...payload, user_id: user.id }).select('id, title, start_time, duration_minutes, icon, is_break, reminder_enabled').maybeSingle();
    const savedActivity = result.data as RoutineActivity | null;
    if (result.error || !savedActivity) setNotice('We could not save that activity. Please try again.');
    else {
      setActivities((previous) => [...previous.filter((item) => item.id !== savedActivity.id), savedActivity].sort((a, b) => a.start_time.localeCompare(b.start_time)));
      setModalOpen(false);
    }
    setSaving(false);
  };

  const deleteActivity = async (id: string) => {
    if (!user) return;
    const { error } = await supabase.from('routine_activities').delete().eq('id', id).eq('user_id', user.id);
    if (error) setNotice('That activity could not be removed.');
    else setActivities((previous) => previous.filter((item) => item.id !== id));
  };

  const addSuggestion = async (suggestion: ActivityForm) => {
    setForm(suggestion);
    setModalOpen(true);
  };

  if (loading) return <Spinner label="Loading your routine..." className="py-20" />;

  return (
    <div className="space-y-6 animate-slide-up">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <button onClick={() => navigate(-1)} className="text-sm text-nest-blue-600 font-semibold flex items-center gap-1 mb-2"><ArrowLeft className="w-4 h-4" /> Back</button>
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-800">My Daily Routine</h1>
          <p className="text-gray-500 mt-1">A gentle plan for your day, one step at a time.</p>
        </div>
        <Button onClick={openNew} icon={<Plus className="w-5 h-5" />}>Add activity</Button>
      </div>

      {notice && <div className="rounded-xl bg-nest-yellow-50 border border-nest-yellow-200 px-4 py-3 text-nest-yellow-800 flex items-center gap-2"><Bell className="w-5 h-5" />{notice}<button onClick={() => setNotice('')} className="ml-auto font-bold">×</button></div>}

      {nextActivity && <Card className="bg-gradient-to-r from-nest-blue-50 to-nest-green-50 border-nest-blue-200"><p className="text-sm font-semibold text-nest-blue-700">Coming up next</p><div className="flex items-center gap-3 mt-2"><div className="w-11 h-11 rounded-2xl bg-white flex items-center justify-center text-nest-blue-500"><IconFor name={nextActivity.icon} /></div><div><h2 className="font-bold text-gray-800">{nextActivity.title}</h2><p className="text-sm text-gray-500">{formatTime(nextActivity.start_time)} · {nextActivity.duration_minutes} minutes</p></div></div></Card>}

      <Card>
        <div className="flex items-center justify-between mb-4"><div><h2 className="text-xl font-bold text-gray-800">Today’s timetable</h2><p className="text-sm text-gray-400">Add learning, meals, movement, and restful breaks.</p></div><Clock3 className="w-6 h-6 text-nest-blue-400" /></div>
        {activities.length === 0 ? <div className="py-10 text-center"><div className="text-5xl mb-3">🗓️</div><h3 className="font-bold text-gray-700">Your day is ready to plan</h3><p className="text-gray-500 text-sm mt-1 mb-4">Start with one activity or try a suggestion below.</p><Button onClick={openNew} size="sm">Create my first activity</Button></div> : <div className="space-y-3">{activities.map((activity) => <div key={activity.id} className={`flex items-center gap-3 p-3 rounded-2xl border ${activity.is_break ? 'bg-nest-green-50 border-nest-green-200' : 'bg-gray-50 border-gray-100'}`}><div className="w-11 h-11 rounded-xl bg-white flex items-center justify-center text-nest-blue-500"><IconFor name={activity.icon} /></div><div className="w-20 text-sm font-bold text-gray-600">{formatTime(activity.start_time)}</div><div className="flex-1 min-w-0"><h3 className="font-bold text-gray-700 truncate">{activity.title}</h3><p className="text-xs text-gray-400">{activity.duration_minutes} min {activity.is_break ? '· Break' : ''}</p></div>{activity.reminder_enabled ? <Bell className="w-4 h-4 text-nest-green-500" /> : <BellOff className="w-4 h-4 text-gray-300" />}<button onClick={() => openEdit(activity)} className="p-2 rounded-lg text-gray-400 hover:bg-white hover:text-nest-blue-600" aria-label={`Edit ${activity.title}`}><Edit3 className="w-4 h-4" /></button><button onClick={() => deleteActivity(activity.id)} className="p-2 rounded-lg text-gray-400 hover:bg-nest-peach-50 hover:text-nest-peach-600" aria-label={`Delete ${activity.title}`}><Trash2 className="w-4 h-4" /></button></div>)}</div>}
      </Card>

      <Card className="bg-nest-yellow-50 border-nest-yellow-200"><div className="flex items-start gap-3"><Sparkles className="w-6 h-6 text-nest-yellow-600 flex-shrink-0" /><div><h2 className="font-bold text-gray-800">Simple ideas for your day</h2><p className="text-sm text-gray-600 mt-1">Choose a starting point, then change it to fit you.</p><div className="flex flex-wrap gap-2 mt-3">{suggestions.map((suggestion) => <button key={suggestion.title} onClick={() => addSuggestion(suggestion)} className="px-3 py-2 rounded-xl bg-white text-sm font-semibold text-gray-600 hover:text-nest-blue-600 border border-white hover:border-nest-blue-200">+ {suggestion.title}</button>)}</div></div></div></Card>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editingId ? 'Edit activity' : 'Add activity'}>
        <div className="space-y-4">
          <label className="block"><span className="text-sm font-semibold text-gray-600">What are you doing?</span><input value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} className="mt-1 w-full rounded-xl border-2 border-gray-200 px-4 py-3 text-gray-700 outline-none focus:border-nest-blue-400" placeholder="For example, Reading time" autoFocus /></label>
          <div className="grid grid-cols-2 gap-3"><label className="block"><span className="text-sm font-semibold text-gray-600">Start time</span><input type="time" value={form.start_time} onChange={(event) => setForm({ ...form, start_time: event.target.value })} className="mt-1 w-full rounded-xl border-2 border-gray-200 px-3 py-3 text-gray-700" /></label><label className="block"><span className="text-sm font-semibold text-gray-600">Minutes</span><input type="number" min="1" max="480" value={form.duration_minutes} onChange={(event) => setForm({ ...form, duration_minutes: Number(event.target.value) })} className="mt-1 w-full rounded-xl border-2 border-gray-200 px-3 py-3 text-gray-700" /></label></div>
          <div><span className="text-sm font-semibold text-gray-600">Choose an icon</span><div className="grid grid-cols-5 gap-2 mt-2">{iconOptions.map((option) => <button type="button" key={option.key} onClick={() => setForm({ ...form, icon: option.key })} className={`flex flex-col items-center gap-1 p-2 rounded-xl border-2 text-xs ${form.icon === option.key ? 'border-nest-blue-400 bg-nest-blue-50 text-nest-blue-700' : 'border-gray-100 text-gray-500'}`}><option.icon className="w-5 h-5" />{option.label}</button>)}</div></div>
          <label className="flex items-center justify-between rounded-xl bg-gray-50 px-4 py-3"><span className="font-semibold text-gray-700">This is a break</span><input type="checkbox" checked={form.is_break} onChange={(event) => setForm({ ...form, is_break: event.target.checked, icon: event.target.checked ? 'break' : form.icon })} className="h-5 w-5 accent-nest-green-500" /></label>
          <label className="flex items-center justify-between rounded-xl bg-gray-50 px-4 py-3"><span className="font-semibold text-gray-700">Gentle reminder</span><input type="checkbox" checked={form.reminder_enabled} onChange={(event) => setForm({ ...form, reminder_enabled: event.target.checked })} className="h-5 w-5 accent-nest-blue-500" /></label>
          <div className="flex justify-end gap-2 pt-2"><Button variant="ghost" onClick={() => setModalOpen(false)}>Cancel</Button><Button onClick={saveActivity} disabled={saving || !form.title.trim()} icon={<Check className="w-4 h-4" />}>{saving ? 'Saving...' : 'Save activity'}</Button></div>
        </div>
      </Modal>
    </div>
  );
}
