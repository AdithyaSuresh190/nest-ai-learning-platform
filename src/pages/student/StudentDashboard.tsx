import { useNavigate } from 'react-router-dom';
import { Card, Badge, ProgressBar, Button } from '@/components/ui/Card';
import { useAuth } from '@/context/AuthContext';
import { mockLessons, mockProgress, mockInsights, subjectColors, difficultyLabels } from '@/services/mockData';
import { BookOpen, Lightbulb, BarChart3, Star, Clock, TrendingUp, ArrowRight, Sparkles, Mic } from 'lucide-react';

export function StudentDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  if (!user) return null;

  const myLessons = mockLessons.filter((l) => l.assignedTo.includes(user.id));
  const inProgress = myLessons.filter((l) => l.status === 'in-progress');
  const notStarted = myLessons.filter((l) => l.status === 'not-started');
  const completed = myLessons.filter((l) => l.status === 'completed');
  const myProgress = mockProgress.filter((p) => p.studentId === user.id);
  const recommendations = mockInsights.filter((i) => i.type === 'recommendation');
  const avgScore = myProgress.length > 0
    ? Math.round(myProgress.reduce((sum, p) => sum + p.score, 0) / myProgress.length)
    : 0;

  const stats = [
    { label: 'Lessons Done', value: completed.length, emoji: '✅', color: 'bg-nest-green-100 text-nest-green-700' },
    { label: 'In Progress', value: inProgress.length, emoji: '📖', color: 'bg-nest-blue-100 text-nest-blue-700' },
    { label: 'Activities Done', value: myProgress.reduce((sum, p) => sum + p.activitiesCompleted, 0), emoji: '🎮', color: 'bg-nest-lavender-100 text-nest-lavender-700' },
    { label: 'Average Score', value: `${avgScore}%`, emoji: '⭐', color: 'bg-nest-yellow-100 text-nest-yellow-700' },
  ];

  return (
    <div className="space-y-6 animate-slide-up">
      {/* Hero greeting */}
      <div className="bg-gradient-to-r from-nest-blue-400 via-nest-blue-300 to-nest-lavender-300 rounded-3xl p-6 lg:p-8 text-white shadow-card relative overflow-hidden">
        <div className="absolute top-0 right-0 text-9xl opacity-20 -mr-4 -mt-4">🪺</div>
        <div className="relative z-10">
          <h1 className="text-2xl lg:text-3xl font-bold mb-2">Hello, {user.name}! Let's learn something amazing today!</h1>
          <p className="text-white/80 text-lg">You have {inProgress.length} lessons to continue and {notStarted.length} new adventures waiting!</p>
          <div className="flex flex-wrap gap-3 mt-4">
            <Button variant="warning" onClick={() => navigate('/student/lessons')} icon={<BookOpen className="w-5 h-5" />}>
              Continue Learning
            </Button>
            <Button variant="secondary" onClick={() => navigate('/student/explain')} icon={<Sparkles className="w-5 h-5" />}>
              Explain It My Way
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

      {/* Continue Learning */}
      {inProgress.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
              <BookOpen className="w-6 h-6 text-nest-blue-500" />
              Continue Learning
            </h2>
            <button onClick={() => navigate('/student/lessons')} className="text-nest-blue-500 font-semibold text-sm flex items-center gap-1 hover:underline">
              See all <ArrowRight className="w-4 h-4" />
            </button>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {inProgress.map((lesson) => {
              const sc = subjectColors[lesson.subject] || subjectColors.Science;
              return (
                <Card key={lesson.id} hover onClick={() => navigate(`/student/lesson/${lesson.id}`)} className="flex flex-col gap-3">
                  <div className={`w-full h-24 rounded-xl ${sc.bg} flex items-center justify-center text-5xl`}>
                    {lesson.thumbnail}
                  </div>
                  <div>
                    <Badge className={`${sc.bg} ${sc.text} mb-2`}>{sc.emoji} {lesson.subject}</Badge>
                    <h3 className="font-bold text-gray-800 text-lg leading-tight">{lesson.title}</h3>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm text-gray-400 mb-1">
                      <span>{lesson.progress}% complete</span>
                      <span><Clock className="w-3 h-3 inline" /> {lesson.estimatedTime}min</span>
                    </div>
                    <ProgressBar value={lesson.progress} color={sc.text.replace('text-', 'bg-').replace('-700', '-400')} />
                  </div>
                  <Button size="sm" className="w-full" icon={<ArrowRight className="w-4 h-4" />}>
                    Continue
                  </Button>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* New Adventures */}
      {notStarted.length > 0 && (
        <div>
          <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-nest-lavender-500" />
            New Adventures Waiting!
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {notStarted.map((lesson) => {
              const sc = subjectColors[lesson.subject] || subjectColors.Science;
              return (
                <Card key={lesson.id} hover onClick={() => navigate(`/student/lesson/${lesson.id}`)} className="flex flex-col gap-3">
                  <div className={`w-full h-24 rounded-xl ${sc.bg} flex items-center justify-center text-5xl relative`}>
                    {lesson.thumbnail}
                    <span className="absolute top-2 right-2 text-xs bg-white/80 px-2 py-1 rounded-full font-semibold text-gray-600">NEW</span>
                  </div>
                  <div>
                    <Badge className={`${sc.bg} ${sc.text} mb-2`}>{sc.emoji} {lesson.subject}</Badge>
                    <h3 className="font-bold text-gray-800 text-lg leading-tight">{lesson.title}</h3>
                    <p className="text-sm text-gray-400 mt-1">{lesson.description}</p>
                  </div>
                  <div className="flex items-center justify-between">
                    <Badge className={difficultyLabels[lesson.difficulty].color}>{difficultyLabels[lesson.difficulty].label}</Badge>
                    <span className="text-sm text-gray-400"><Clock className="w-3 h-3 inline" /> {lesson.estimatedTime}min</span>
                  </div>
                  <Button size="sm" variant="success" className="w-full" icon={<ArrowRight className="w-4 h-4" />}>
                    Start Learning
                  </Button>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* AI Recommendations */}
      <div>
        <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
          <Lightbulb className="w-6 h-6 text-nest-yellow-500" />
          AI Recommendations For You
        </h2>
        <div className="grid sm:grid-cols-2 gap-4">
          {recommendations.map((rec) => (
            <Card key={rec.id} className="flex items-start gap-3 bg-gradient-to-r from-nest-yellow-50 to-nest-peach-50 border-nest-yellow-200">
              <div className="w-10 h-10 rounded-xl bg-nest-yellow-200 flex items-center justify-center flex-shrink-0">
                <Lightbulb className="w-5 h-5 text-nest-yellow-700" />
              </div>
              <div>
                <h3 className="font-bold text-gray-700">{rec.title}</h3>
                <p className="text-sm text-gray-500 mt-1">{rec.description}</p>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Quick actions */}
      <div className="grid sm:grid-cols-3 gap-4">
        <Card hover onClick={() => navigate('/student/explain')} className="bg-gradient-to-br from-nest-lavender-50 to-nest-blue-50 border-nest-lavender-200 text-center">
          <Sparkles className="w-10 h-10 text-nest-lavender-500 mx-auto mb-2" />
          <h3 className="font-bold text-gray-700">Explain It My Way</h3>
          <p className="text-sm text-gray-400 mt-1">Get a simpler explanation of any topic</p>
        </Card>
        <Card hover onClick={() => navigate('/student/teach-back')} className="bg-gradient-to-br from-nest-green-50 to-nest-blue-50 border-nest-green-200 text-center">
          <Mic className="w-10 h-10 text-nest-green-500 mx-auto mb-2" />
          <h3 className="font-bold text-gray-700">Teach-Back</h3>
          <p className="text-sm text-gray-400 mt-1">Explain what you learned and get AI feedback</p>
        </Card>
        <Card hover onClick={() => navigate('/student/progress')} className="bg-gradient-to-br from-nest-peach-50 to-nest-yellow-50 border-nest-peach-200 text-center">
          <BarChart3 className="w-10 h-10 text-nest-peach-500 mx-auto mb-2" />
          <h3 className="font-bold text-gray-700">My Progress</h3>
          <p className="text-sm text-gray-400 mt-1">See how much you've learned and your stars</p>
        </Card>
      </div>
    </div>
  );
}
