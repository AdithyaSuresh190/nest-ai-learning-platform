import { Card, Badge, ProgressBar, Button } from '@/components/ui/Card';
import { useAuth } from '@/context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { mockProgress, mockInsights, mockTeachBacks, mockLessons, subjectColors } from '@/services/mockData';
import { Activity, TrendingUp, Clock, Brain, Zap, BarChart3, Mic, MessageSquare, ArrowRight, Eye } from 'lucide-react';

export function TherapistDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  if (!user) return null;

  const childId = user.linkedStudents?.[0] || 's1';
  const childProgress = mockProgress.filter((p) => p.studentId === childId);
  const childInsights = mockInsights.filter((i) => i.studentId === childId);
  const childTeachBacks = mockTeachBacks.filter((t) => t.studentId === childId);
  const childLessons = mockLessons.filter((l) => l.assignedTo.includes(childId));

  const avgScore = childProgress.length > 0
    ? Math.round(childProgress.reduce((sum, p) => sum + p.score, 0) / childProgress.length)
    : 0;
  const totalTime = childProgress.reduce((sum, p) => sum + p.timeSpent, 0);
  const totalActivities = childProgress.reduce((sum, p) => sum + p.activitiesCompleted, 0);

  const engagement = childInsights.filter((i) => i.type === 'engagement');
  const strengths = childInsights.filter((i) => i.type === 'strength');
  const needsPractice = childInsights.filter((i) => i.type === 'needs-practice');

  // Activity type performance
  const activityTypes: Record<string, { total: number; completed: number }> = {
    'memory-game': { total: 0, completed: 0 },
    'quiz': { total: 0, completed: 0 },
    'flashcards': { total: 0, completed: 0 },
    'picture-matching': { total: 0, completed: 0 },
    'word-recognition': { total: 0, completed: 0 },
  };
  childLessons.forEach((l) => {
    l.activities.forEach((a) => {
      if (activityTypes[a.type]) activityTypes[a.type].total++;
    });
  });
  childProgress.forEach((p) => {
    // Approximate completion
  });

  return (
    <div className="space-y-6 animate-slide-up">
      {/* Hero */}
      <div className="bg-gradient-to-r from-nest-green-400 via-nest-green-300 to-nest-blue-300 rounded-3xl p-6 lg:p-8 text-white shadow-card relative overflow-hidden">
        <div className="absolute top-0 right-0 text-9xl opacity-20 -mr-4 -mt-4">👩‍⚕️</div>
        <div className="relative z-10">
          <h1 className="text-2xl lg:text-3xl font-bold mb-2">Welcome, {user.name}!</h1>
          <p className="text-white/80 text-lg">Learning insights and educational patterns for Maya.</p>
        </div>
      </div>

      {/* Student overview */}
      <Card className="flex items-center gap-4 bg-gradient-to-r from-nest-green-50 to-nest-blue-50 border-nest-green-200">
        <div className="w-16 h-16 rounded-2xl bg-nest-blue-100 flex items-center justify-center text-4xl">🦊</div>
        <div className="flex-1">
          <h2 className="text-xl font-bold text-gray-800">Maya</h2>
          <p className="text-gray-400">Grade 3 • Educational learning profile</p>
        </div>
        <div className="flex gap-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-800">{avgScore}%</p>
            <p className="text-sm text-gray-400">Avg Score</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-800">{totalActivities}</p>
            <p className="text-sm text-gray-400">Activities</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-800">{totalTime}m</p>
            <p className="text-sm text-gray-400">Total Time</p>
          </div>
        </div>
      </Card>

      {/* Learning patterns */}
      <div>
        <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
          <Brain className="w-6 h-6 text-nest-lavender-500" />
          Learning Patterns
        </h2>
        <div className="grid sm:grid-cols-2 gap-4">
          {engagement.map((e) => (
            <Card key={e.id} className="bg-gradient-to-r from-nest-lavender-50 to-nest-blue-50 border-nest-lavender-200">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-nest-lavender-200 flex items-center justify-center flex-shrink-0">
                  <Eye className="w-5 h-5 text-nest-lavender-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-gray-700">{e.title}</h3>
                  <p className="text-sm text-gray-500 mt-1">{e.description}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <ProgressBar value={e.value} className="flex-1" color="bg-nest-lavender-400" />
                    <span className="text-sm font-bold text-gray-600">{e.value}%</span>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Activity performance */}
      <div>
        <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
          <Activity className="w-6 h-6 text-nest-green-500" />
          Activity Performance
        </h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Object.entries({
            'Memory Games': { emoji: '🧠', value: 90, color: 'bg-nest-lavender-400' },
            'Quizzes': { emoji: '❓', value: 85, color: 'bg-nest-green-400' },
            'Flashcards': { emoji: '📇', value: 75, color: 'bg-nest-yellow-400' },
            'Picture Matching': { emoji: '🔗', value: 80, color: 'bg-nest-blue-400' },
            'Word Recognition': { emoji: '🔤', value: 60, color: 'bg-nest-peach-400' },
          }).map(([name, data]) => (
            <Card key={name} className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="text-3xl">{data.emoji}</span>
                <span className="text-2xl font-bold text-gray-800">{data.value}%</span>
              </div>
              <p className="font-semibold text-gray-600">{name}</p>
              <ProgressBar value={data.value} color={data.color} />
            </Card>
          ))}
        </div>
      </div>

      {/* Strengths and areas */}
      <div className="grid lg:grid-cols-2 gap-4">
        <Card className="bg-gradient-to-br from-nest-green-50 to-nest-blue-50 border-nest-green-200">
          <h3 className="font-bold text-gray-700 mb-3 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-nest-green-500" /> Learning Strengths
          </h3>
          <ul className="space-y-2">
            {strengths.map((s) => (
              <li key={s.id} className="flex items-start gap-2 text-gray-600">
                <span className="text-nest-green-500 mt-0.5">✓</span>
                <div>
                  <p className="font-semibold">{s.title}</p>
                  <p className="text-sm text-gray-400">{s.description}</p>
                </div>
              </li>
            ))}
          </ul>
        </Card>
        <Card className="bg-gradient-to-br from-nest-peach-50 to-nest-yellow-50 border-nest-peach-200">
          <h3 className="font-bold text-gray-700 mb-3 flex items-center gap-2">
            <Zap className="w-5 h-5 text-nest-peach-500" /> Areas Needing Support
          </h3>
          <ul className="space-y-2">
            {needsPractice.map((s) => (
              <li key={s.id} className="flex items-start gap-2 text-gray-600">
                <span className="text-nest-peach-500 mt-0.5">!</span>
                <div>
                  <p className="font-semibold">{s.title}</p>
                  <p className="text-sm text-gray-400">{s.description}</p>
                </div>
              </li>
            ))}
          </ul>
        </Card>
      </div>

      {/* Teach-back analysis */}
      {childTeachBacks.length > 0 && (
        <div>
          <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            <MessageSquare className="w-6 h-6 text-nest-blue-500" />
            Teach-Back Analysis
          </h2>
          <div className="space-y-3">
            {childTeachBacks.map((tb) => (
              <Card key={tb.id} className="flex items-start gap-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${
                  tb.aiEvaluation.understandingScore >= 85 ? 'bg-nest-green-100' : 'bg-nest-yellow-100'
                }`}>
                  {tb.mode === 'voice' ? <Mic className="w-5 h-5 text-gray-600" /> : <MessageSquare className="w-5 h-5 text-gray-600" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge className="bg-nest-lavender-100 text-nest-lavender-700">{tb.mode === 'voice' ? 'Voice' : 'Text'}</Badge>
                    <Badge className="bg-nest-blue-100 text-nest-blue-700">Score: {tb.aiEvaluation.understandingScore}</Badge>
                    <span className="text-sm text-gray-400">{tb.date}</span>
                  </div>
                  <h3 className="font-bold text-gray-700">{tb.lessonTitle}</h3>
                  <p className="text-sm text-gray-500 mt-1">{tb.content}</p>
                  <div className="mt-2 p-2 bg-gray-50 rounded-lg">
                    <p className="text-xs text-gray-400">AI Evaluation:</p>
                    <p className="text-sm text-gray-600">{tb.aiEvaluation.feedback}</p>
                    {tb.aiEvaluation.weakAreas.length > 0 && (
                      <p className="text-xs text-nest-peach-600 mt-1">Weak areas: {tb.aiEvaluation.weakAreas.join(', ')}</p>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Quick links */}
      <div className="grid sm:grid-cols-3 gap-4">
        <Card hover onClick={() => navigate('/therapist/patterns')} className="bg-gradient-to-br from-nest-lavender-50 to-nest-blue-50 border-nest-lavender-200 text-center">
          <Brain className="w-10 h-10 text-nest-lavender-500 mx-auto mb-2" />
          <h3 className="font-bold text-gray-700">Learning Patterns</h3>
        </Card>
        <Card hover onClick={() => navigate('/therapist/activities')} className="bg-gradient-to-br from-nest-green-50 to-nest-blue-50 border-nest-green-200 text-center">
          <Activity className="w-10 h-10 text-nest-green-500 mx-auto mb-2" />
          <h3 className="font-bold text-gray-700">Activity Performance</h3>
        </Card>
        <Card hover onClick={() => navigate('/therapist/reports')} className="bg-gradient-to-br from-nest-peach-50 to-nest-yellow-50 border-nest-peach-200 text-center">
          <BarChart3 className="w-10 h-10 text-nest-peach-500 mx-auto mb-2" />
          <h3 className="font-bold text-gray-700">Progress Reports</h3>
        </Card>
      </div>
    </div>
  );
}
