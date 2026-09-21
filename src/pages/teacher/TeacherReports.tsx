import { Card, Badge, Button, ProgressBar } from '@/components/ui/Card';
import { mockProgress, mockInsights, mockLessons, mockTeachBacks, subjectColors } from '@/services/mockData';
import { FileText, Download, Star, TrendingUp, Clock, Calendar } from 'lucide-react';

export function TeacherReports() {
  const studentProgress = mockProgress;
  const studentInsights = mockInsights;
  const studentTeachBacks = mockTeachBacks;
  const completedLessons = mockLessons.filter((l) => l.status === 'completed');

  const avgScore = studentProgress.length > 0
    ? Math.round(studentProgress.reduce((sum, p) => sum + p.score, 0) / studentProgress.length)
    : 0;
  const totalTime = studentProgress.reduce((sum, p) => sum + p.timeSpent, 0);
  const totalActivities = studentProgress.reduce((sum, p) => sum + p.activitiesCompleted, 0);

  // Subject summary
  const subjectSummary: Record<string, { scores: number[]; count: number; time: number }> = {};
  studentProgress.forEach((p) => {
    if (!subjectSummary[p.subject]) subjectSummary[p.subject] = { scores: [], count: 0, time: 0 };
    subjectSummary[p.subject].scores.push(p.score);
    subjectSummary[p.subject].count++;
    subjectSummary[p.subject].time += p.timeSpent;
  });

  return (
    <div className="space-y-6 animate-slide-up">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-800 mb-2">Progress Reports</h1>
          <p className="text-gray-400">Generate and download progress reports for your students</p>
        </div>
        <Button icon={<Download className="w-5 h-5" />}>Download Report</Button>
      </div>

      {/* Student selector card */}
      <Card className="flex items-center gap-4 bg-gradient-to-r from-nest-lavender-50 to-nest-blue-50 border-nest-lavender-200">
        <div className="w-16 h-16 rounded-2xl bg-nest-blue-100 flex items-center justify-center text-4xl">🦊</div>
        <div className="flex-1">
          <h2 className="text-xl font-bold text-gray-800">Maya's Progress Report</h2>
          <p className="text-gray-400">Grade 3 • Report period: Sep 5 - Sep 14, 2026</p>
        </div>
        <Badge className="bg-nest-green-100 text-nest-green-700">Active</Badge>
      </Card>

      {/* Summary stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-nest-yellow-100 flex items-center justify-center text-2xl">⭐</div>
          <div><p className="text-2xl font-bold text-gray-800">{avgScore}%</p><p className="text-sm text-gray-400">Avg Score</p></div>
        </Card>
        <Card className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-nest-green-100 flex items-center justify-center text-2xl">✅</div>
          <div><p className="text-2xl font-bold text-gray-800">{completedLessons.length}</p><p className="text-sm text-gray-400">Lessons Done</p></div>
        </Card>
        <Card className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-nest-blue-100 flex items-center justify-center text-2xl">⏰</div>
          <div><p className="text-2xl font-bold text-gray-800">{totalTime}m</p><p className="text-sm text-gray-400">Time Learning</p></div>
        </Card>
        <Card className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-nest-lavender-100 flex items-center justify-center text-2xl">🎮</div>
          <div><p className="text-2xl font-bold text-gray-800">{totalActivities}</p><p className="text-sm text-gray-400">Activities</p></div>
        </Card>
      </div>

      {/* Subject breakdown */}
      <Card>
        <h3 className="font-bold text-gray-700 mb-4 flex items-center gap-2">
          <FileText className="w-5 h-5 text-nest-lavender-500" /> Subject Performance Summary
        </h3>
        <div className="space-y-4">
          {Object.entries(subjectSummary).map(([subject, data]) => {
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
                <span className="text-sm text-gray-400 w-16 text-right">{data.time}m</span>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Strengths & recommendations */}
      <div className="grid lg:grid-cols-2 gap-4">
        <Card className="bg-gradient-to-br from-nest-green-50 to-nest-blue-50 border-nest-green-200">
          <h3 className="font-bold text-gray-700 mb-3 flex items-center gap-2">
            <Star className="w-5 h-5 text-nest-green-500" /> Strengths
          </h3>
          <ul className="space-y-2">
            {studentInsights.filter((i) => i.type === 'strength').map((s) => (
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
            <TrendingUp className="w-5 h-5 text-nest-peach-500" /> Areas to Improve
          </h3>
          <ul className="space-y-2">
            {studentInsights.filter((i) => i.type === 'needs-practice').map((s) => (
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

      {/* AI Recommendations */}
      <Card className="bg-gradient-to-r from-nest-yellow-50 to-nest-peach-50 border-nest-yellow-200">
        <h3 className="font-bold text-gray-700 mb-3 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-nest-yellow-600" /> AI Recommendations
        </h3>
        <ul className="space-y-2">
          {studentInsights.filter((i) => i.type === 'recommendation').map((r) => (
            <li key={r.id} className="flex items-start gap-2 text-gray-600">
              <span className="text-nest-yellow-600 mt-0.5">→</span>
              <div>
                <p className="font-semibold">{r.title}</p>
                <p className="text-sm text-gray-400">{r.description}</p>
              </div>
            </li>
          ))}
        </ul>
      </Card>

      {/* Activity log */}
      <Card>
        <h3 className="font-bold text-gray-700 mb-4 flex items-center gap-2">
          <Calendar className="w-5 h-5 text-nest-blue-500" /> Activity Log
        </h3>
        <div className="space-y-2">
          {studentProgress.map((p) => {
            const sc = subjectColors[p.subject] || subjectColors.Science;
            return (
              <div key={p.id} className="flex items-center gap-4 py-2 border-b border-gray-100 last:border-0">
                <div className={`w-10 h-10 rounded-xl ${sc.bg} flex items-center justify-center text-xl flex-shrink-0`}>
                  {sc.emoji}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-700">{p.lessonTitle}</p>
                  <p className="text-sm text-gray-400 flex items-center gap-2">
                    <Clock className="w-3 h-3" /> {p.date} • {p.timeSpent}min • {p.activitiesCompleted}/{p.totalActivities} activities
                  </p>
                </div>
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className={`w-4 h-4 ${i < Math.round(p.score / 20) ? 'text-nest-yellow-400 fill-nest-yellow-400' : 'text-gray-200'}`} />
                  ))}
                </div>
                <span className={`text-lg font-bold w-12 text-right ${p.score >= 85 ? 'text-nest-green-600' : p.score >= 70 ? 'text-nest-blue-600' : 'text-nest-peach-600'}`}>
                  {p.score}%
                </span>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Teach-back summary */}
      {studentTeachBacks.length > 0 && (
        <Card>
          <h3 className="font-bold text-gray-700 mb-4 flex items-center gap-2">
            <FileText className="w-5 h-5 text-nest-lavender-500" /> Teach-Back Summary
          </h3>
          <div className="space-y-3">
            {studentTeachBacks.map((tb) => (
              <div key={tb.id} className="p-3 bg-gray-50 rounded-xl">
                <div className="flex items-center justify-between mb-2">
                  <p className="font-semibold text-gray-700">{tb.lessonTitle}</p>
                  <span className={`text-sm font-bold ${tb.aiEvaluation.understandingScore >= 85 ? 'text-nest-green-600' : 'text-nest-yellow-600'}`}>
                    Score: {tb.aiEvaluation.understandingScore}
                  </span>
                </div>
                <p className="text-sm text-gray-500 line-clamp-2">{tb.content}</p>
                <p className="text-xs text-gray-400 mt-1 italic">AI Feedback: {tb.aiEvaluation.feedback}</p>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
