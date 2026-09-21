import { Card, Badge, ProgressBar } from '@/components/ui/Card';
import { mockProgress, mockInsights, subjectColors } from '@/services/mockData';
import { Star, TrendingUp, Clock, Award, Calendar } from 'lucide-react';

export function ParentProgress() {
  const childProgress = mockProgress;
  const childInsights = mockInsights;

  const avgScore = childProgress.length > 0
    ? Math.round(childProgress.reduce((sum, p) => sum + p.score, 0) / childProgress.length)
    : 0;
  const totalTime = childProgress.reduce((sum, p) => sum + p.timeSpent, 0);

  // Subject breakdown
  const subjectStats: Record<string, { scores: number[]; count: number; time: number }> = {};
  childProgress.forEach((p) => {
    if (!subjectStats[p.subject]) subjectStats[p.subject] = { scores: [], count: 0, time: 0 };
    subjectStats[p.subject].scores.push(p.score);
    subjectStats[p.subject].count++;
    subjectStats[p.subject].time += p.timeSpent;
  });

  return (
    <div className="space-y-6 animate-slide-up">
      <div>
        <h1 className="text-2xl lg:text-3xl font-bold text-gray-800 mb-2">Maya's Detailed Progress</h1>
        <p className="text-gray-400">A closer look at how Maya is learning and growing</p>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-nest-yellow-100 flex items-center justify-center text-2xl">⭐</div>
          <div><p className="text-2xl font-bold text-gray-800">{avgScore}%</p><p className="text-sm text-gray-400">Avg Score</p></div>
        </Card>
        <Card className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-nest-green-100 flex items-center justify-center text-2xl">✅</div>
          <div><p className="text-2xl font-bold text-gray-800">{childProgress.length}</p><p className="text-sm text-gray-400">Lessons Done</p></div>
        </Card>
        <Card className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-nest-blue-100 flex items-center justify-center text-2xl">⏰</div>
          <div><p className="text-2xl font-bold text-gray-800">{totalTime}m</p><p className="text-sm text-gray-400">Time Learning</p></div>
        </Card>
        <Card className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-nest-lavender-100 flex items-center justify-center text-2xl">🎮</div>
          <div><p className="text-2xl font-bold text-gray-800">{childProgress.reduce((s, p) => s + p.activitiesCompleted, 0)}</p><p className="text-sm text-gray-400">Activities</p></div>
        </Card>
      </div>

      {/* Subject breakdown */}
      <Card>
        <h3 className="font-bold text-gray-700 mb-4 flex items-center gap-2">
          <Award className="w-5 h-5 text-nest-blue-500" /> Performance by Subject
        </h3>
        <div className="space-y-4">
          {Object.entries(subjectStats).map(([subject, data]) => {
            const avg = Math.round(data.scores.reduce((a, b) => a + b, 0) / data.scores.length);
            const sc = subjectColors[subject] || subjectColors.Science;
            return (
              <div key={subject} className="flex items-center gap-4">
                <Badge className={`${sc.bg} ${sc.text} w-32 justify-center`}>{sc.emoji} {subject}</Badge>
                <div className="flex-1">
                  <ProgressBar value={avg} color={sc.text.replace('text-', 'bg-').replace('-700', '-400')} />
                </div>
                <span className="font-bold text-gray-700 w-12 text-right">{avg}%</span>
                <span className="text-sm text-gray-400 w-20 text-right">{data.count} lessons</span>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Activity timeline */}
      <Card>
        <h3 className="font-bold text-gray-700 mb-4 flex items-center gap-2">
          <Calendar className="w-5 h-5 text-nest-lavender-500" /> Learning Timeline
        </h3>
        <div className="space-y-3">
          {childProgress.map((p, i) => {
            const sc = subjectColors[p.subject] || subjectColors.Science;
            return (
              <div key={p.id} className="flex gap-4">
                {/* Timeline dot */}
                <div className="flex flex-col items-center">
                  <div className={`w-10 h-10 rounded-full ${sc.bg} flex items-center justify-center text-lg flex-shrink-0`}>
                    {sc.emoji}
                  </div>
                  {i < childProgress.length - 1 && <div className="w-0.5 flex-1 bg-gray-200 my-1" />}
                </div>
                {/* Content */}
                <div className="flex-1 pb-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-gray-700">{p.lessonTitle}</h4>
                      <p className="text-sm text-gray-400 flex items-center gap-2">
                        <Clock className="w-3 h-3" /> {p.date} • {p.timeSpent}min
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-0.5">
                        {[...Array(5)].map((_, si) => (
                          <Star key={si} className={`w-4 h-4 ${si < Math.round(p.score / 20) ? 'text-nest-yellow-400 fill-nest-yellow-400' : 'text-gray-200'}`} />
                        ))}
                      </div>
                      <span className={`text-lg font-bold ${p.score >= 85 ? 'text-nest-green-600' : p.score >= 70 ? 'text-nest-blue-600' : 'text-nest-peach-600'}`}>
                        {p.score}%
                      </span>
                    </div>
                  </div>
                  <div className="mt-2">
                    <ProgressBar value={p.activitiesCompleted} max={p.totalActivities} color="bg-nest-lavender-400" />
                    <p className="text-xs text-gray-400 mt-1">{p.activitiesCompleted} of {p.totalActivities} activities completed</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Insights summary */}
      <div className="grid lg:grid-cols-2 gap-4">
        <Card className="bg-gradient-to-br from-nest-green-50 to-nest-blue-50 border-nest-green-200">
          <h3 className="font-bold text-gray-700 mb-3 flex items-center gap-2">
            <Star className="w-5 h-5 text-nest-green-500" /> What Maya Does Well
          </h3>
          <ul className="space-y-2">
            {childInsights.filter((i) => i.type === 'strength').map((s) => (
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
            <TrendingUp className="w-5 h-5 text-nest-peach-500" /> What to Practice at Home
          </h3>
          <ul className="space-y-2">
            {childInsights.filter((i) => i.type === 'needs-practice').map((s) => (
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
    </div>
  );
}
