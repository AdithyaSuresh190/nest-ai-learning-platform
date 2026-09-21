import { Card, Badge, ProgressBar } from '@/components/ui/Card';
import { mockProgress, mockLessons, subjectColors } from '@/services/mockData';
import { Activity, Brain, Clock, TrendingUp } from 'lucide-react';

export function TherapistActivities() {
  const progress = mockProgress;
  const lessons = mockLessons.filter((l) => l.assignedTo.includes('s1'));

  // Activity type performance (simulated data based on mock)
  const activityPerformance = [
    { type: 'Memory Games', emoji: '🧠', total: 3, completed: 3, avgScore: 88, color: 'bg-nest-lavender-400', trend: 'up' },
    { type: 'Quizzes', emoji: '❓', total: 5, completed: 4, avgScore: 82, color: 'bg-nest-green-400', trend: 'up' },
    { type: 'Flashcards', emoji: '📇', total: 4, completed: 3, avgScore: 75, color: 'bg-nest-yellow-400', trend: 'stable' },
    { type: 'Picture Matching', emoji: '🔗', total: 2, completed: 1, avgScore: 80, color: 'bg-nest-blue-400', trend: 'up' },
    { type: 'Word Recognition', emoji: '🔤', total: 2, completed: 1, avgScore: 60, color: 'bg-nest-peach-400', trend: 'down' },
  ];

  return (
    <div className="space-y-6 animate-slide-up">
      <div>
        <h1 className="text-2xl lg:text-3xl font-bold text-gray-800 mb-2">Activity Performance</h1>
        <p className="text-gray-400">How Maya performs across different types of learning activities</p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-nest-lavender-100 flex items-center justify-center text-2xl">🎮</div>
          <div><p className="text-2xl font-bold text-gray-800">{activityPerformance.reduce((s, a) => s + a.completed, 0)}</p><p className="text-sm text-gray-400">Completed</p></div>
        </Card>
        <Card className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-nest-green-100 flex items-center justify-center text-2xl">📊</div>
          <div><p className="text-2xl font-bold text-gray-800">{Math.round(activityPerformance.reduce((s, a) => s + a.avgScore, 0) / activityPerformance.length)}%</p><p className="text-sm text-gray-400">Avg Score</p></div>
        </Card>
        <Card className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-nest-blue-100 flex items-center justify-center text-2xl">⏱️</div>
          <div><p className="text-2xl font-bold text-gray-800">{progress.reduce((s, p) => s + p.timeSpent, 0)}m</p><p className="text-sm text-gray-400">Total Time</p></div>
        </Card>
        <Card className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-nest-yellow-100 flex items-center justify-center text-2xl">📈</div>
          <div><p className="text-2xl font-bold text-gray-800">{activityPerformance.filter(a => a.trend === 'up').length}</p><p className="text-sm text-gray-400">Improving</p></div>
        </Card>
      </div>

      {/* Activity type breakdown */}
      <div>
        <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
          <Activity className="w-6 h-6 text-nest-green-500" />
          Performance by Activity Type
        </h2>
        <div className="space-y-4">
          {activityPerformance.map((a) => (
            <Card key={a.type} className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-gray-50 flex items-center justify-center text-3xl flex-shrink-0">
                {a.emoji}
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-bold text-gray-700">{a.type}</h3>
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-gray-400">{a.completed}/{a.total} done</span>
                    <span className="text-lg font-bold text-gray-700">{a.avgScore}%</span>
                    {a.trend === 'up' && <TrendingUp className="w-4 h-4 text-nest-green-500" />}
                  </div>
                </div>
                <ProgressBar value={a.avgScore} color={a.color} />
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Engagement by activity type */}
      <Card className="bg-gradient-to-r from-nest-lavender-50 to-nest-blue-50 border-nest-lavender-200">
        <h3 className="font-bold text-gray-700 mb-3 flex items-center gap-2">
          <Brain className="w-5 h-5 text-nest-lavender-500" /> Engagement Insights
        </h3>
        <div className="space-y-3">
          <div className="flex items-start gap-3 p-3 bg-white rounded-xl">
            <span className="text-2xl">🧠</span>
            <div>
              <p className="font-semibold text-gray-700">Memory Games — High Engagement</p>
              <p className="text-sm text-gray-500">Maya completes 100% of memory games with an average score of 88%. This is her strongest activity type.</p>
            </div>
          </div>
          <div className="flex items-start gap-3 p-3 bg-white rounded-xl">
            <span className="text-2xl">🔤</span>
            <div>
              <p className="font-semibold text-gray-700">Word Recognition — Lower Engagement</p>
              <p className="text-sm text-gray-500">Maya completes only 50% of word recognition activities with a score of 60%. Consider adding more visual supports.</p>
            </div>
          </div>
          <div className="flex items-start gap-3 p-3 bg-white rounded-xl">
            <span className="text-2xl">❓</span>
            <div>
              <p className="font-semibold text-gray-700">Quizzes — Consistent Performance</p>
              <p className="text-sm text-gray-500">Quiz scores are trending upward, showing good retention of learned material.</p>
            </div>
          </div>
        </div>
      </Card>

      {/* Detailed activity log */}
      <Card>
        <h3 className="font-bold text-gray-700 mb-4 flex items-center gap-2">
          <Clock className="w-5 h-5 text-nest-blue-500" /> Activity Log
        </h3>
        <div className="space-y-2">
          {progress.map((p) => {
            const sc = subjectColors[p.subject] || subjectColors.Science;
            return (
              <div key={p.id} className="flex items-center gap-4 py-2 border-b border-gray-100 last:border-0">
                <div className={`w-10 h-10 rounded-xl ${sc.bg} flex items-center justify-center text-lg flex-shrink-0`}>
                  {sc.emoji}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-700">{p.lessonTitle}</p>
                  <p className="text-sm text-gray-400">{p.date} • {p.timeSpent}min • Difficulty {p.difficulty}/5</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-400">{p.activitiesCompleted}/{p.totalActivities} activities</p>
                  <p className={`text-lg font-bold ${p.score >= 85 ? 'text-nest-green-600' : p.score >= 70 ? 'text-nest-blue-600' : 'text-nest-peach-600'}`}>
                    {p.score}%
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}
