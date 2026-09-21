import { Card, Badge, ProgressBar, Button } from '@/components/ui/Card';
import { mockProgress, mockInsights, mockLessons, mockTeachBacks, subjectColors } from '@/services/mockData';
import { TrendingUp, TrendingDown, Minus, Star, Clock, Mic, MessageSquare, ArrowRight } from 'lucide-react';

export function StudentPerformance() {
  const students = [
    { id: 's1', name: 'Maya', avatar: '🦊', grade: 'Grade 3' },
  ];

  return (
    <div className="space-y-6 animate-slide-up">
      <div>
        <h1 className="text-2xl lg:text-3xl font-bold text-gray-800 mb-2">Student Performance</h1>
        <p className="text-gray-400">Track how your students are learning and growing</p>
      </div>

      {students.map((student) => {
        const studentProgress = mockProgress.filter((p) => p.studentId === student.id);
        const studentInsights = mockInsights.filter((i) => i.studentId === student.id);
        const studentTeachBacks = mockTeachBacks.filter((t) => t.studentId === student.id);
        const avgScore = studentProgress.length > 0
          ? Math.round(studentProgress.reduce((sum, p) => sum + p.score, 0) / studentProgress.length)
          : 0;
        const totalTime = studentProgress.reduce((sum, p) => sum + p.timeSpent, 0);

        const strengths = studentInsights.filter((i) => i.type === 'strength');
        const needsPractice = studentInsights.filter((i) => i.type === 'needs-practice');
        const engagement = studentInsights.filter((i) => i.type === 'engagement');

        const trendIcon = (trend: string) => {
          if (trend === 'up') return <TrendingUp className="w-4 h-4 text-nest-green-500" />;
          if (trend === 'down') return <TrendingDown className="w-4 h-4 text-nest-peach-500" />;
          return <Minus className="w-4 h-4 text-gray-400" />;
        };

        return (
          <div key={student.id} className="space-y-6">
            {/* Student header */}
            <Card className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-nest-blue-100 flex items-center justify-center text-4xl">
                {student.avatar}
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-bold text-gray-800">{student.name}</h2>
                <p className="text-gray-400">{student.grade}</p>
              </div>
              <div className="flex gap-6">
                <div className="text-center">
                  <p className="text-2xl font-bold text-gray-800">{avgScore}%</p>
                  <p className="text-sm text-gray-400">Avg Score</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-gray-800">{studentProgress.length}</p>
                  <p className="text-sm text-gray-400">Lessons</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-gray-800">{totalTime}m</p>
                  <p className="text-sm text-gray-400">Time</p>
                </div>
              </div>
            </Card>

            {/* Subject performance */}
            <div>
              <h3 className="text-lg font-bold text-gray-700 mb-3">Performance by Subject</h3>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {Object.entries(
                  studentProgress.reduce((acc, p) => {
                    if (!acc[p.subject]) acc[p.subject] = { scores: [], count: 0 };
                    acc[p.subject].scores.push(p.score);
                    acc[p.subject].count++;
                    return acc;
                  }, {} as Record<string, { scores: number[]; count: number }>)
                ).map(([subject, data]) => {
                  const avg = Math.round(data.scores.reduce((a, b) => a + b, 0) / data.scores.length);
                  const sc = subjectColors[subject] || subjectColors.Science;
                  return (
                    <Card key={subject} className="flex flex-col gap-2">
                      <div className="flex items-center justify-between">
                        <Badge className={`${sc.bg} ${sc.text}`}>{sc.emoji} {subject}</Badge>
                        <span className="text-2xl font-bold text-gray-800">{avg}%</span>
                      </div>
                      <ProgressBar value={avg} color={sc.text.replace('text-', 'bg-').replace('-700', '-400')} />
                      <p className="text-sm text-gray-400">{data.count} lesson{data.count > 1 ? 's' : ''}</p>
                    </Card>
                  );
                })}
              </div>
            </div>

            {/* Strengths */}
            <div>
              <h3 className="text-lg font-bold text-gray-700 mb-3">Strengths</h3>
              <div className="grid sm:grid-cols-2 gap-4">
                {strengths.map((s) => (
                  <Card key={s.id} className="bg-gradient-to-r from-nest-green-50 to-nest-blue-50 border-nest-green-200">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-xl bg-nest-green-200 flex items-center justify-center flex-shrink-0">
                        <Star className="w-5 h-5 text-nest-green-600" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h4 className="font-bold text-gray-700">{s.title}</h4>
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
              <h3 className="text-lg font-bold text-gray-700 mb-3">Areas Needing Practice</h3>
              <div className="grid sm:grid-cols-2 gap-4">
                {needsPractice.map((s) => (
                  <Card key={s.id} className="bg-gradient-to-r from-nest-peach-50 to-nest-yellow-50 border-nest-peach-200">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-xl bg-nest-peach-200 flex items-center justify-center flex-shrink-0">
                        <Clock className="w-5 h-5 text-nest-peach-600" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h4 className="font-bold text-gray-700">{s.title}</h4>
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

            {/* Engagement patterns */}
            <div>
              <h3 className="text-lg font-bold text-gray-700 mb-3">Engagement Patterns</h3>
              <div className="grid sm:grid-cols-2 gap-4">
                {engagement.map((e) => (
                  <Card key={e.id} className="bg-gradient-to-r from-nest-lavender-50 to-nest-blue-50 border-nest-lavender-200">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-xl bg-nest-lavender-200 flex items-center justify-center flex-shrink-0">
                        <TrendingUp className="w-5 h-5 text-nest-lavender-600" />
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-700">{e.title}</h4>
                        <p className="text-sm text-gray-500 mt-1">{e.description}</p>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>

            {/* Teach-back submissions */}
            {studentTeachBacks.length > 0 && (
              <div>
                <h3 className="text-lg font-bold text-gray-700 mb-3">Teach-Back Submissions</h3>
                <div className="space-y-3">
                  {studentTeachBacks.map((tb) => (
                    <Card key={tb.id} className="flex items-start gap-4">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${
                        tb.aiEvaluation.understandingScore >= 85 ? 'bg-nest-green-100' : 'bg-nest-yellow-100'
                      }`}>
                        {tb.mode === 'voice' ? <Mic className="w-5 h-5 text-gray-600" /> : <MessageSquare className="w-5 h-5 text-gray-600" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge className="bg-nest-lavender-100 text-nest-lavender-700">{tb.mode === 'voice' ? 'Voice' : 'Text'}</Badge>
                          <span className="text-sm text-gray-400">{tb.date}</span>
                          <span className={`text-sm font-bold ${tb.aiEvaluation.understandingScore >= 85 ? 'text-nest-green-600' : 'text-nest-yellow-600'}`}>
                            Score: {tb.aiEvaluation.understandingScore}
                          </span>
                        </div>
                        <h4 className="font-bold text-gray-700">{tb.lessonTitle}</h4>
                        <p className="text-sm text-gray-500 mt-1 line-clamp-2">{tb.content}</p>
                        <p className="text-xs text-gray-400 mt-1 italic">AI: {tb.aiEvaluation.feedback}</p>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* Recent activity */}
            <div>
              <h3 className="text-lg font-bold text-gray-700 mb-3">Recent Activity</h3>
              <div className="space-y-2">
                {studentProgress.map((p) => {
                  const sc = subjectColors[p.subject] || subjectColors.Science;
                  return (
                    <Card key={p.id} className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-xl ${sc.bg} flex items-center justify-center text-xl flex-shrink-0`}>
                        {sc.emoji}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-gray-700">{p.lessonTitle}</p>
                        <p className="text-sm text-gray-400">{p.date} • {p.timeSpent}min • {p.activitiesCompleted}/{p.totalActivities} activities</p>
                      </div>
                      <span className={`text-xl font-bold ${p.score >= 85 ? 'text-nest-green-600' : p.score >= 70 ? 'text-nest-blue-600' : 'text-nest-peach-600'}`}>
                        {p.score}%
                      </span>
                    </Card>
                  );
                })}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
