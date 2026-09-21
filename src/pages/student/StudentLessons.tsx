import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Badge, ProgressBar, Button } from '@/components/ui/Card';
import { useAuth } from '@/context/AuthContext';
import { mockLessons, subjectColors, difficultyLabels } from '@/services/mockData';
import { Clock, Search, Filter } from 'lucide-react';

export function StudentLessons() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [filterSubject, setFilterSubject] = useState('all');
  if (!user) return null;

  const myLessons = mockLessons.filter((l) => l.assignedTo.includes(user.id));
  const subjects = ['all', ...Array.from(new Set(myLessons.map((l) => l.subject)))];

  const filtered = myLessons.filter((l) => {
    const matchesSearch = l.title.toLowerCase().includes(search.toLowerCase()) || l.description.toLowerCase().includes(search.toLowerCase());
    const matchesSubject = filterSubject === 'all' || l.subject === filterSubject;
    return matchesSearch && matchesSubject;
  });

  return (
    <div className="space-y-6 animate-slide-up">
      <div>
        <h1 className="text-2xl lg:text-3xl font-bold text-gray-800 mb-2">My Lessons</h1>
        <p className="text-gray-400">Pick a lesson to start your learning adventure!</p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search lessons..."
            className="w-full pl-12 pr-4 py-3 rounded-xl border-2 border-gray-200 focus:border-nest-blue-400 outline-none font-medium text-gray-700"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="w-5 h-5 text-gray-400" />
          <select
            value={filterSubject}
            onChange={(e) => setFilterSubject(e.target.value)}
            className="px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-nest-blue-400 outline-none font-medium text-gray-700 bg-white cursor-pointer"
          >
            {subjects.map((s) => (
              <option key={s} value={s}>{s === 'all' ? 'All Subjects' : s}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Lessons grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((lesson) => {
          const sc = subjectColors[lesson.subject] || subjectColors.Science;
          return (
            <Card key={lesson.id} hover onClick={() => navigate(`/student/lesson/${lesson.id}`)} className="flex flex-col gap-3">
              <div className={`w-full h-28 rounded-xl ${sc.bg} flex items-center justify-center text-6xl relative`}>
                {lesson.thumbnail}
                {lesson.status === 'completed' && (
                  <span className="absolute top-2 right-2 bg-nest-green-400 text-white text-xs px-2 py-1 rounded-full font-bold">DONE</span>
                )}
                {lesson.status === 'in-progress' && (
                  <span className="absolute top-2 right-2 bg-nest-blue-400 text-white text-xs px-2 py-1 rounded-full font-bold">IN PROGRESS</span>
                )}
              </div>
              <div>
                <Badge className={`${sc.bg} ${sc.text} mb-2`}>{sc.emoji} {lesson.subject}</Badge>
                <h3 className="font-bold text-gray-800 text-lg leading-tight">{lesson.title}</h3>
                <p className="text-sm text-gray-400 mt-1">{lesson.description}</p>
              </div>
              {lesson.status === 'in-progress' && (
                <ProgressBar value={lesson.progress} color={sc.text.replace('text-', 'bg-').replace('-700', '-400')} />
              )}
              <div className="flex items-center justify-between">
                <Badge className={difficultyLabels[lesson.difficulty].color}>{difficultyLabels[lesson.difficulty].label}</Badge>
                <span className="text-sm text-gray-400 flex items-center gap-1"><Clock className="w-3 h-3" /> {lesson.estimatedTime}min</span>
              </div>
              <Button size="sm" className="w-full">
                {lesson.status === 'completed' ? 'Review' : lesson.status === 'in-progress' ? 'Continue' : 'Start'}
              </Button>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
