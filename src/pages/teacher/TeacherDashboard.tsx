import { useNavigate } from 'react-router-dom';
import { Card, Badge, ProgressBar, Button } from '@/components/ui/Card';
import { useAuth } from '@/context/AuthContext';
import { mockLessons, mockProgress, mockInsights, subjectColors, difficultyLabels } from '@/services/mockData';
import { Upload, BookOpen, Users, FileText, ArrowRight, Plus, TrendingUp, Clock } from 'lucide-react';

export function TeacherDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  if (!user) return null;

  const myLessons = mockLessons.filter((l) => l.createdBy === user.id);
  const totalStudents = 1;
  const allProgress = mockProgress;
  const avgScore = allProgress.length > 0
    ? Math.round(allProgress.reduce((sum, p) => sum + p.score, 0) / allProgress.length)
    : 0;

  const stats = [
    { label: 'Lessons Created', value: myLessons.length, emoji: '📚', color: 'bg-nest-lavender-100 text-nest-lavender-700' },
    { label: 'Students', value: totalStudents, emoji: '🧒', color: 'bg-nest-blue-100 text-nest-blue-700' },
    { label: 'Avg Score', value: `${avgScore}%`, emoji: '⭐', color: 'bg-nest-green-100 text-nest-green-700' },
    { label: 'Activities', value: myLessons.reduce((sum, l) => sum + l.activities.length, 0), emoji: '🎮', color: 'bg-nest-yellow-100 text-nest-yellow-700' },
  ];

  return (
    <div className="space-y-6 animate-slide-up">
      {/* Hero */}
      <div className="bg-gradient-to-r from-nest-lavender-400 via-nest-lavender-300 to-nest-blue-300 rounded-3xl p-6 lg:p-8 text-white shadow-card relative overflow-hidden">
        <div className="absolute top-0 right-0 text-9xl opacity-20 -mr-4 -mt-4">👩‍🏫</div>
        <div className="relative z-10">
          <h1 className="text-2xl lg:text-3xl font-bold mb-2">Welcome, {user.name}!</h1>
          <p className="text-white/80 text-lg">Create amazing learning experiences for your students.</p>
          <div className="flex flex-wrap gap-3 mt-4">
            <Button variant="warning" onClick={() => navigate('/teacher/generate')} icon={<Upload className="w-5 h-5" />}>
              Generate New Content
            </Button>
            <Button variant="secondary" onClick={() => navigate('/teacher/students')} icon={<Users className="w-5 h-5" />}>
              View Students
            </Button>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <Card key={stat.label} className="flex items-center gap-3">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl ${stat.color}`}>
              {stat.emoji}
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-800">{stat.value}</p>
              <p className="text-sm text-gray-400">{stat.label}</p>
            </div>
          </Card>
        ))}
      </div>

      {/* Quick actions */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card hover onClick={() => navigate('/teacher/generate')} className="bg-gradient-to-br from-nest-lavender-50 to-nest-blue-50 border-nest-lavender-200 text-center">
          <Upload className="w-10 h-10 text-nest-lavender-500 mx-auto mb-2" />
          <h3 className="font-bold text-gray-700">Generate Content</h3>
          <p className="text-sm text-gray-400 mt-1">Upload PDF or type a prompt</p>
        </Card>
        <Card hover onClick={() => navigate('/teacher/lessons')} className="bg-gradient-to-br from-nest-blue-50 to-nest-green-50 border-nest-blue-200 text-center">
          <BookOpen className="w-10 h-10 text-nest-blue-500 mx-auto mb-2" />
          <h3 className="font-bold text-gray-700">Manage Lessons</h3>
          <p className="text-sm text-gray-400 mt-1">View and edit lessons</p>
        </Card>
        <Card hover onClick={() => navigate('/teacher/students')} className="bg-gradient-to-br from-nest-green-50 to-nest-yellow-50 border-nest-green-200 text-center">
          <Users className="w-10 h-10 text-nest-green-500 mx-auto mb-2" />
          <h3 className="font-bold text-gray-700">Student Performance</h3>
          <p className="text-sm text-gray-400 mt-1">Track how students are doing</p>
        </Card>
        <Card hover onClick={() => navigate('/teacher/reports')} className="bg-gradient-to-br from-nest-peach-50 to-nest-yellow-50 border-nest-peach-200 text-center">
          <FileText className="w-10 h-10 text-nest-peach-500 mx-auto mb-2" />
          <h3 className="font-bold text-gray-700">Reports</h3>
          <p className="text-sm text-gray-400 mt-1">Generate progress reports</p>
        </Card>
      </div>

      {/* Recent lessons */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-nest-lavender-500" />
            Your Lessons
          </h2>
          <button onClick={() => navigate('/teacher/lessons')} className="text-nest-lavender-500 font-semibold text-sm flex items-center gap-1 hover:underline">
            See all <ArrowRight className="w-4 h-4" />
          </button>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {myLessons.slice(0, 6).map((lesson) => {
            const sc = subjectColors[lesson.subject] || subjectColors.Science;
            return (
              <Card key={lesson.id} hover onClick={() => navigate('/teacher/lessons')} className="flex flex-col gap-3">
                <div className={`w-full h-20 rounded-xl ${sc.bg} flex items-center justify-center text-4xl`}>
                  {lesson.thumbnail}
                </div>
                <div>
                  <Badge className={`${sc.bg} ${sc.text} mb-2`}>{sc.emoji} {lesson.subject}</Badge>
                  <h3 className="font-bold text-gray-800">{lesson.title}</h3>
                  <p className="text-sm text-gray-400 mt-1">{lesson.activities.length} activities</p>
                </div>
                <div className="flex items-center justify-between">
                  <Badge className={difficultyLabels[lesson.difficulty].color}>{difficultyLabels[lesson.difficulty].label}</Badge>
                  <span className="text-sm text-gray-400 capitalize">{lesson.status.replace('-', ' ')}</span>
                </div>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Student performance overview */}
      <div>
        <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
          <TrendingUp className="w-6 h-6 text-nest-green-500" />
          Student Performance Overview
        </h2>
        <Card>
          <div className="flex items-center gap-4 mb-4">
            <div className="w-14 h-14 rounded-2xl bg-nest-blue-100 flex items-center justify-center text-3xl">🦊</div>
            <div className="flex-1">
              <h3 className="font-bold text-gray-700 text-lg">Maya</h3>
              <p className="text-sm text-gray-400">Grade 3 • {allProgress.length} lessons completed</p>
            </div>
            <Button size="sm" onClick={() => navigate('/teacher/students')} icon={<ArrowRight className="w-4 h-4" />}>
              Details
            </Button>
          </div>
          <div className="space-y-3">
            {mockInsights.slice(0, 4).map((insight) => (
              <div key={insight.id} className="flex items-center gap-3">
                <div className="flex-1">
                  <p className="font-semibold text-gray-700 text-sm">{insight.title}</p>
                  <p className="text-xs text-gray-400">{insight.category}</p>
                </div>
                <div className="w-32">
                  <ProgressBar value={insight.value} color={
                    insight.type === 'strength' ? 'bg-nest-green-400' :
                    insight.type === 'needs-practice' ? 'bg-nest-peach-400' :
                    'bg-nest-blue-400'
                  } />
                </div>
                <span className="text-sm font-bold text-gray-600 w-10 text-right">{insight.value}%</span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
