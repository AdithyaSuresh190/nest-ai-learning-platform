import { Card, Badge, Button, ProgressBar } from '@/components/ui/Card';
import { mockProgress, mockInsights, mockTeachBacks, subjectColors } from '@/services/mockData';
import { FileText, Download, TrendingUp, Star, Clock, Calendar, Brain, Activity, Eye } from 'lucide-react';

export function TherapistReports() {
  const progress = mockProgress;
  const insights = mockInsights;
  const teachBacks = mockTeachBacks;

  const avgScore = progress.length > 0
    ? Math.round(progress.reduce((sum, p) => sum + p.score, 0) / progress.length)
    : 0;
  const totalTime = progress.reduce((sum, p) => sum + p.timeSpent, 0);

  // Subject summary
  const subjectSummary: Record<string, { scores: number[]; count: number; time: number }> = {};
  progress.forEach((p) => {
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
          <p className="text-gray-400">Educational learning insights and progress documentation</p>
        </div>
        <Button icon={<Download className="w-5 h-5" />}>Download Report</Button>
      </div>

      {/* Disclaimer */}
      <Card className="bg-nest-blue-50 border-nest-blue-200">
        <div className="flex items-start gap-3">
          <Eye className="w-5 h-5 text-nest-blue-500 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-gray-600">
            <span className="font-bold">Note:</span> This report presents educational learning insights only. It does not constitute a medical diagnosis or clinical assessment. For clinical evaluation, please consult a qualified professional.
          </p>
        </div>
      </Card>

      {/* Student header */}
      <Card className="flex items-center gap-4 bg-gradient-to-r from-nest-green-50 to-nest-blue-50 border-nest-green-200">
        <div className="w-16 h-16 rounded-2xl bg-nest-blue-100 flex items-center justify-center text-4xl">🦊</div>
        <div className="flex-1">
          <h2 className="text-xl font-bold text-gray-800">Maya — Learning Profile Report</h2>
          <p className="text-gray-400">Grade 3 • Report period: Sep 5 - Sep 14, 2026</p>
        </div>
        <Badge className="bg-nest-green-100 text-nest-green-700">Active Learner</Badge>
      </Card>

      {/* Summary stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-nest-yellow-100 flex items-center justify-center text-2xl">⭐</div>
          <div><p className="text-2xl font-bold text-gray-800">{avgScore}%</p><p className="text-sm text-gray-400">Avg Score</p></div>
        </Card>
        <Card className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-nest-green-100 flex items-center justify-center text-2xl">✅</div>
          <div><p className="text-2xl font-bold text-gray-800">{progress.length}</p><p className="text-sm text-gray-400">Sessions</p></div>
        </Card>
        <Card className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-nest-blue-100 flex items-center justify-center text-2xl">⏰</div>
          <div><p className="text-2xl font-bold text-gray-800">{totalTime}m</p><p className="text-sm text-gray-400">Total Time</p></div>
        </Card>
        <Card className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-nest-lavender-100 flex items-center justify-center text-2xl">📝</div>
          <div><p className="text-2xl font-bold text-gray-800">{teachBacks.length}</p><p className="text-sm text-gray-400">Teach-Backs</p></div>
        </Card>
      </div>

      {/* Subject performance */}
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
                <span className="text-sm text-gray-400 w-20 text-right">{data.count} sessions</span>
                <span className="text-sm text-gray-400 w-16 text-right">{data.time}m</span>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Learning patterns summary */}
      <Card>
        <h3 className="font-bold text-gray-700 mb-4 flex items-center gap-2">
          <Brain className="w-5 h-5 text-nest-lavender-500" /> Learning Pattern Summary
        </h3>
        <div className="space-y-3">
          {insights.filter((i) => i.type === 'engagement').map((e) => (
            <div key={e.id} className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
              <div className="w-10 h-10 rounded-xl bg-nest-lavender-100 flex items-center justify-center flex-shrink-0">
                <Activity className="w-5 h-5 text-nest-lavender-600" />
              </div>
              <div className="flex-1">
                <h4 className="font-bold text-gray-700">{e.title}</h4>
                <p className="text-sm text-gray-500 mt-1">{e.description}</p>
                <div className="flex items-center gap-2 mt-2">
                  <ProgressBar value={e.value} className="flex-1" color="bg-nest-lavender-400" />
                  <span className="text-sm font-bold text-gray-600">{e.value}%</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Strengths and areas */}
      <div className="grid lg:grid-cols-2 gap-4">
        <Card className="bg-gradient-to-br from-nest-green-50 to-nest-blue-50 border-nest-green-200">
          <h3 className="font-bold text-gray-700 mb-3 flex items-center gap-2">
            <Star className="w-5 h-5 text-nest-green-500" /> Learning Strengths
          </h3>
          <ul className="space-y-2">
            {insights.filter((i) => i.type === 'strength').map((s) => (
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
            <TrendingUp className="w-5 h-5 text-nest-peach-500" /> Areas Needing Support
          </h3>
          <ul className="space-y-2">
            {insights.filter((i) => i.type === 'needs-practice').map((s) => (
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

      {/* Teach-back summary */}
      {teachBacks.length > 0 && (
        <Card>
          <h3 className="font-bold text-gray-700 mb-4 flex items-center gap-2">
            <FileText className="w-5 h-5 text-nest-blue-500" /> Teach-Back Understanding Summary
          </h3>
          <div className="space-y-3">
            {teachBacks.map((tb) => (
              <div key={tb.id} className="p-3 bg-gray-50 rounded-xl">
                <div className="flex items-center justify-between mb-2">
                  <p className="font-semibold text-gray-700">{tb.lessonTitle}</p>
                  <span className={`text-sm font-bold ${tb.aiEvaluation.understandingScore >= 85 ? 'text-nest-green-600' : 'text-nest-yellow-600'}`}>
                    Understanding: {tb.aiEvaluation.understandingScore}%
                  </span>
                </div>
                <p className="text-sm text-gray-500">{tb.content}</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {tb.aiEvaluation.strengths.map((s, i) => (
                    <Badge key={i} className="bg-nest-green-100 text-nest-green-700 text-xs">✓ {s}</Badge>
                  ))}
                  {tb.aiEvaluation.weakAreas.map((w, i) => (
                    <Badge key={i} className="bg-nest-peach-100 text-nest-peach-700 text-xs">! {w}</Badge>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Session log */}
      <Card>
        <h3 className="font-bold text-gray-700 mb-4 flex items-center gap-2">
          <Calendar className="w-5 h-5 text-nest-blue-500" /> Session Log
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
                  <p className="text-sm text-gray-400 flex items-center gap-2">
                    <Clock className="w-3 h-3" /> {p.date} • {p.timeSpent}min • Difficulty {p.difficulty}/5
                  </p>
                </div>
                <span className={`text-lg font-bold ${p.score >= 85 ? 'text-nest-green-600' : p.score >= 70 ? 'text-nest-blue-600' : 'text-nest-peach-600'}`}>
                  {p.score}%
                </span>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}
