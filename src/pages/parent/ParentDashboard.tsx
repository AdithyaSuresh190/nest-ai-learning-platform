import { Card, Badge, ProgressBar, Button } from '@/components/ui/Card';
import { useAuth } from '@/context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { mockProgress, mockInsights, mockLessons, subjectColors } from '@/services/mockData';
import { Star, TrendingUp, Clock, CheckCircle2, Heart, Lightbulb, Award, BookOpen } from 'lucide-react';

export function ParentDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  if (!user) return null;

  const childId = user.linkedStudents?.[0] || 's1';
  const childProgress = mockProgress.filter((p) => p.studentId === childId);
  const childInsights = mockInsights.filter((i) => i.studentId === childId);
  const childLessons = mockLessons.filter((l) => l.assignedTo.includes(childId));
  const completedLessons = childLessons.filter((l) => l.status === 'completed');

  const avgScore = childProgress.length > 0
    ? Math.round(childProgress.reduce((sum, p) => sum + p.score, 0) / childProgress.length)
    : 0;
  const totalTime = childProgress.reduce((sum, p) => sum + p.timeSpent, 0);

  const strengths = childInsights.filter((i) => i.type === 'strength');
  const needsPractice = childInsights.filter((i) => i.type === 'needs-practice');
  const recommendations = childInsights.filter((i) => i.type === 'recommendation');
  const engagement = childInsights.filter((i) => i.type === 'engagement');

  return (
    <div className="space-y-6 animate-slide-up">
      {/* Hero */}
      <div className="bg-gradient-to-r from-nest-peach-400 via-nest-peach-300 to-nest-yellow-300 rounded-3xl p-6 lg:p-8 text-white shadow-card relative overflow-hidden">
        <div className="absolute top-0 right-0 text-9xl opacity-20 -mr-4 -mt-4">👨</div>
        <div className="relative z-10">
          <h1 className="text-2xl lg:text-3xl font-bold mb-2">Hello, {user.name}!</h1>
          <p className="text-white/80 text-lg">Here's how Maya is doing in her learning journey.</p>
        </div>
      </div>

      {/* Child overview */}
      <Card className="flex items-center gap-4 bg-gradient-to-r from-nest-peach-50 to-nest-yellow-50 border-nest-peach-200">
        <div className="w-16 h-16 rounded-2xl bg-nest-blue-100 flex items-center justify-center text-4xl">🦊</div>
        <div className="flex-1">
          <h2 className="text-xl font-bold text-gray-800">Maya</h2>
          <p className="text-gray-400">Grade 3 • Learning since Sep 2026</p>
        </div>
        <div className="flex gap-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-800">{avgScore}%</p>
            <p className="text-sm text-gray-400">Avg Score</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-800">{completedLessons.length}</p>
            <p className="text-sm text-gray-400">Lessons Done</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-800">{totalTime}m</p>
            <p className="text-sm text-gray-400">Time</p>
          </div>
        </div>
      </Card>

      {/* Achievement banner */}
      <Card className="bg-gradient-to-r from-nest-yellow-50 to-nest-peach-50 border-nest-yellow-200">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-nest-yellow-200 flex items-center justify-center">
            <Award className="w-8 h-8 text-nest-yellow-600" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-800">Maya is doing great!</h3>
            <p className="text-gray-500">She has completed {completedLessons.length} lessons with an average score of {avgScore}% and is showing improvement in Math and Art.</p>
          </div>
        </div>
      </Card>

      {/* Strengths */}
      <div>
        <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
          <Star className="w-6 h-6 text-nest-green-500 fill-nest-green-500" />
          Maya's Strengths
        </h2>
        <div className="grid sm:grid-cols-2 gap-4">
          {strengths.map((s) => (
            <Card key={s.id} className="bg-gradient-to-r from-nest-green-50 to-nest-blue-50 border-nest-green-200">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-nest-green-200 flex items-center justify-center flex-shrink-0">
                  <CheckCircle2 className="w-5 h-5 text-nest-green-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-gray-700">{s.title}</h3>
                  <p className="text-sm text-gray-500 mt-1">{s.description}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <ProgressBar value={s.value} className="flex-1" color="bg-nest-green-400" />
                    <span className="text-sm font-bold text-gray-600">{s.value}%</span>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Areas needing practice */}
      <div>
        <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
          <TrendingUp className="w-6 h-6 text-nest-peach-500" />
          Areas That Need Practice
        </h2>
        <div className="grid sm:grid-cols-2 gap-4">
          {needsPractice.map((s) => (
            <Card key={s.id} className="bg-gradient-to-r from-nest-peach-50 to-nest-yellow-50 border-nest-peach-200">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-nest-peach-200 flex items-center justify-center flex-shrink-0">
                  <Clock className="w-5 h-5 text-nest-peach-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-gray-700">{s.title}</h3>
                  <p className="text-sm text-gray-500 mt-1">{s.description}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <ProgressBar value={s.value} className="flex-1" color="bg-nest-peach-400" />
                    <span className="text-sm font-bold text-gray-600">{s.value}%</span>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* AI recommendations */}
      <div>
        <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
          <Lightbulb className="w-6 h-6 text-nest-yellow-500" />
          AI Recommendations for Maya
        </h2>
        <div className="grid sm:grid-cols-2 gap-4">
          {recommendations.map((r) => (
            <Card key={r.id} className="bg-gradient-to-r from-nest-yellow-50 to-nest-peach-50 border-nest-yellow-200">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-nest-yellow-200 flex items-center justify-center flex-shrink-0">
                  <Lightbulb className="w-5 h-5 text-nest-yellow-700" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-700">{r.title}</h3>
                  <p className="text-sm text-gray-500 mt-1">{r.description}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Completed lessons */}
      <div>
        <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
          <BookOpen className="w-6 h-6 text-nest-blue-500" />
          Completed Lessons
        </h2>
        <div className="space-y-3">
          {childProgress.map((p) => {
            const sc = subjectColors[p.subject] || subjectColors.Science;
            return (
              <Card key={p.id} className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-xl ${sc.bg} flex items-center justify-center text-2xl flex-shrink-0`}>
                  {sc.emoji}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-gray-700">{p.lessonTitle}</h3>
                  <p className="text-sm text-gray-400">{p.date} • {p.timeSpent}min • {p.activitiesCompleted}/{p.totalActivities} activities</p>
                </div>
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className={`w-4 h-4 ${i < Math.round(p.score / 20) ? 'text-nest-yellow-400 fill-nest-yellow-400' : 'text-gray-200'}`} />
                  ))}
                </div>
                <span className={`text-xl font-bold ${p.score >= 85 ? 'text-nest-green-600' : p.score >= 70 ? 'text-nest-blue-600' : 'text-nest-peach-600'}`}>
                  {p.score}%
                </span>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Engagement insights */}
      <div>
        <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
          <Heart className="w-6 h-6 text-nest-lavender-500" />
          How Maya Learns Best
        </h2>
        <div className="grid sm:grid-cols-2 gap-4">
          {engagement.map((e) => (
            <Card key={e.id} className="bg-gradient-to-r from-nest-lavender-50 to-nest-blue-50 border-nest-lavender-200">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-nest-lavender-200 flex items-center justify-center flex-shrink-0">
                  <Heart className="w-5 h-5 text-nest-lavender-600" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-700">{e.title}</h3>
                  <p className="text-sm text-gray-500 mt-1">{e.description}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>

      <Button variant="primary" onClick={() => navigate('/parent/progress')} icon={<TrendingUp className="w-5 h-5" />}>
        View Detailed Progress
      </Button>
    </div>
  );
}
