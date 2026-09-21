import { useState } from 'react';
import { Card, Badge, Button, ProgressBar, Modal } from '@/components/ui/Card';
import { useAuth } from '@/context/AuthContext';
import { mockLessons, subjectColors, difficultyLabels } from '@/services/mockData';
import { BookOpen, Plus, Edit3, Trash2, Clock, Gamepad2, Search } from 'lucide-react';

export function ManageLessons() {
  const { user } = useAuth();
  const [search, setSearch] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  if (!user) return null;

  const myLessons = mockLessons.filter((l) => l.createdBy === user.id);
  const filtered = myLessons.filter((l) =>
    l.title.toLowerCase().includes(search.toLowerCase()) || l.subject.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-slide-up">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-800 mb-2">Manage Lessons</h1>
          <p className="text-gray-400">View, edit, and manage all your lessons</p>
        </div>
        <Button icon={<Plus className="w-5 h-5" />} onClick={() => setShowCreate(true)}>
          Create New Lesson
        </Button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search lessons..."
          className="w-full pl-12 pr-4 py-3 rounded-xl border-2 border-gray-200 focus:border-nest-lavender-400 outline-none font-medium text-gray-700"
        />
      </div>

      {/* Lessons table */}
      <div className="space-y-3">
        {filtered.map((lesson) => {
          const sc = subjectColors[lesson.subject] || subjectColors.Science;
          return (
            <Card key={lesson.id} className="flex items-center gap-4 flex-wrap">
              <div className={`w-14 h-14 rounded-2xl ${sc.bg} flex items-center justify-center text-3xl flex-shrink-0`}>
                {lesson.thumbnail}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <Badge className={`${sc.bg} ${sc.text}`}>{sc.emoji} {lesson.subject}</Badge>
                  <Badge className={difficultyLabels[lesson.difficulty].color}>{difficultyLabels[lesson.difficulty].label}</Badge>
                </div>
                <h3 className="font-bold text-gray-800">{lesson.title}</h3>
                <p className="text-sm text-gray-400">{lesson.description}</p>
              </div>
              <div className="flex items-center gap-4 text-sm text-gray-400">
                <span className="flex items-center gap-1"><Gamepad2 className="w-4 h-4" /> {lesson.activities.length}</span>
                <span className="flex items-center gap-1"><Clock className="w-4 h-4" /> {lesson.estimatedTime}m</span>
                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                  lesson.status === 'completed' ? 'bg-nest-green-100 text-nest-green-700' :
                  lesson.status === 'in-progress' ? 'bg-nest-blue-100 text-nest-blue-700' :
                  'bg-gray-100 text-gray-500'
                }`}>{lesson.status.replace('-', ' ')}</span>
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" icon={<Edit3 className="w-4 h-4" />}>Edit</Button>
                <Button size="sm" variant="ghost" className="text-nest-peach-500 hover:bg-nest-peach-50" icon={<Trash2 className="w-4 h-4" />}>
                  Delete
                </Button>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Create lesson modal */}
      <Modal open={showCreate} onClose={() => setShowCreate(false)} title="Create New Lesson">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-600 mb-2">Lesson Title</label>
            <input
              type="text"
              placeholder="Enter lesson title..."
              className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-nest-lavender-400 outline-none font-medium text-gray-700"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-600 mb-2">Subject</label>
            <select className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-nest-lavender-400 outline-none font-medium text-gray-700 bg-white cursor-pointer">
              <option>Science</option>
              <option>Math</option>
              <option>Social Studies</option>
              <option>Art</option>
              <option>English</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-600 mb-2">Description</label>
            <textarea
              placeholder="Brief description of the lesson..."
              rows={3}
              className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-nest-lavender-400 outline-none font-medium text-gray-700 resize-none"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-600 mb-2">Difficulty</label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((d) => (
                <button key={d} className="flex-1 py-2 rounded-xl border-2 border-gray-200 hover:border-nest-lavender-400 font-semibold text-gray-600 transition-all">
                  {d}
                </button>
              ))}
            </div>
          </div>
          <div className="flex gap-3 justify-end pt-2">
            <Button variant="ghost" onClick={() => setShowCreate(false)}>Cancel</Button>
            <Button variant="primary" icon={<BookOpen className="w-4 h-4" />}>Create Lesson</Button>
          </div>
          <div className="p-3 bg-nest-lavender-50 rounded-xl text-sm text-gray-500">
            Tip: Use "Generate Content" to let AI create the story, visuals, and activities automatically!
          </div>
        </div>
      </Modal>
    </div>
  );
}
