import { Card, Badge, ProgressBar } from '@/components/ui/Card';
import { useAuth } from '@/context/AuthContext';
import { mockProgress, mockInsights, mockLessons, subjectColors } from '@/services/mockData';
import { Star, TrendingUp, TrendingDown, Minus, Clock, Award, Target, Zap } from 'lucide-react';

export function StudentProgress() {
  const { user } = useAuth();
  if (!user) return null;

  const myProgress = mockProgress.filter((p) => p.studentId === user.id);
  const myInsights = mockInsights.filter((i) => i.studentId === user.id);
  const completedLessons = mockLessons.filter((l) => l.assignedTo.includes(user.id) && l.status === 'completed');

  const avgScore = myProgress.length > 0
    ? Math.round(myProgress.reduce((sum, p) => sum + p.score, 0) / myProgress.length)
    : 0;
  const totalTime = myProgress.reduce((sum, p) => sum + p.timeSpent, 0);
  const totalActivities = myProgress.reduce((sum, p) => sum + p.activitiesCompleted, 0);

  const stats = [
    { label: 'Average Score', value: `${avgScore}%`, emoji: '⭐', color: 'bg-nest-yellow-100 text-nest-yellow-700' },
    { label: 'Lessons Done', value: completedLessons.length, emoji: '✅', color: 'bg-nest-green-100 text-nest-green-700' },
    { label: 'Time Learning', value: `${totalTime}min`, emoji: '⏰', color: 'bg-nest-blue-100 text-nest-blue-700' },
    { label: 'Activities', value: totalActivities, emoji: '🎮', color: 'bg-nest-lavender-100 text-nest-lavender-700' },
  ];

  // Subject breakdown
  const subjectStats: Record<string, { scores: number[]; count: number }> = {};
  myProgress.forEach((p) => {
    if (!subjectStats[p.subject]) subjectStats[p.subject] = { scores: [], count: 0 };
    subjectStats[p.subject].scores.push(p.score);
    subjectStats[p.subject].count++;
  });

  const strengths = myInsights.filter((i) => i.type === 'strength');
  const needsPractice = myInsights.filter((i) => i.type === 'needs-practice');
  const engagement = myInsights.filter((i) => i.type === 'engagement');

  const trendIcon = (trend: string) => {
    if (trend === 'up') return <TrendingUp className="w-4 h-4 text-nest-green-500" />;
    if (trend === 'down') return <TrendingDown className="w-4 h-4 text-nest-peach-500" />;
    return <Minus className="w-4 h-4 text-gray-400" />;
  };

  return (
    <div className="space-y-6 animate-slide-up">
      <div>
        <h1 className="text-2xl lg:text-3xl font-bold text-gray-800 mb-2">My Progress</h1>
        <p className="text-gray-400">Look at how much you've learned and grown!</p>
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

      {/* Star achievement */}
      <Card className="bg-gradient-to-r from-nest-yellow-50 to-nest-peach-50 border-nest-yellow-200">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-nest-yellow-200 flex items-center justify-center">
            <Award className="w-8 h-8 text-nest-yellow-600" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-800">You're doing amazing!</h3>
            <p className="text-gray-500">You've completed {completedLessons.length} lessons with an average score of {avgScore}%!</p>
          </div>
        </div>
      </Card>

      {/* Subject breakdown */}
      <div>
        <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
          <Target className="w-5 h-5 text-nest-blue-500" />
          By Subject
        </h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Object.entries(subjectStats).map(([subject, data]) => {
            const avg = Math.round(data.scores.reduce((a, b) => a + b, 0) / data.scores.length);
            const sc = subjectColors[subject] || subjectColors.Science;
            return (
              <Card key={subject} className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <Badge className={`${sc.bg} ${sc.text}`}>{sc.emoji} {subject}</Badge>
                  <span className="text-2xl font-bold text-gray-800">{avg}%</span>
                </div>
                <ProgressBar value={avg} color={sc.text.replace('text-', 'bg-').replace('-700', '-400')} />
                <p className="text-sm text-gray-400">{data.count} lesson{data.count > 1 ? 's' : ''} completed</p>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Strengths */}
      <div>
        <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
          <Star className="w-5 h-5 text-nest-yellow-400 fill-nest-yellow-400" />
          Your Strengths
        </h2>
        <div className="grid sm:grid-cols-2 gap-4">
          {strengths.map((s) => (
            <Card key={s.id} className="bg-gradient-to-r from-nest-green-50 to-nest-blue-50 border-nest-green-200">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-nest-green-200 flex items-center justify-center flex-shrink-0">
                  <Star className="w-5 h-5 text-nest-green-600" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-gray-700">{s.title}</h3>
                    {trendIcon(s.trend)}
                  </div>
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

      {/* Needs practice */}
      <div>
        <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
          <Target className="w-5 h-5 text-nest-peach-500" />
          Areas to Practice
        </h2>
        <div className="grid sm:grid-cols-2 gap-4">
          {needsPractice.map((s) => (
            <Card key={s.id} className="bg-gradient-to-r from-nest-peach-50 to-nest-yellow-50 border-nest-peach-200">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-nest-peach-200 flex items-center justify-center flex-shrink-0">
                  <Target className="w-5 h-5 text-nest-peach-600" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-gray-700">{s.title}</h3>
                    {trendIcon(s.trend)}
                  </div>
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

      {/* Engagement */}
      <div>
        <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
          <Zap className="w-5 h-5 text-nest-lavender-500" />
          How You Learn Best
        </h2>
        <div className="grid sm:grid-cols-2 gap-4">
          {engagement.map((e) => (
            <Card key={e.id} className="bg-gradient-to-r from-nest-lavender-50 to-nest-blue-50 border-nest-lavender-200">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-nest-lavender-200 flex items-center justify-center flex-shrink-0">
                  <Zap className="w-5 h-5 text-nest-lavender-600" />
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

      {/* Recent activity */}
      <div>
        <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
          <Clock className="w-5 h-5 text-nest-blue-500" />
          Recent Learning
        </h2>
        <div className="space-y-3">
          {myProgress.map((p) => {
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
                <div className="text-right">
                  <p className={`text-2xl font-bold ${p.score >= 85 ? 'text-nest-green-600' : p.score >= 70 ? 'text-nest-blue-600' : 'text-nest-peach-600'}`}>{p.score}%</p>
                  <div className="flex items-center gap-0.5 justify-end">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className={`w-3 h-3 ${i < Math.round(p.score / 20) ? 'text-nest-yellow-400 fill-nest-yellow-400' : 'text-gray-200'}`} />
                    ))}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
