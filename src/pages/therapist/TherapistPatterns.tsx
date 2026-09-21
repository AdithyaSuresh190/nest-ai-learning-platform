import { Card, Badge, ProgressBar } from '@/components/ui/Card';
import { mockInsights, mockProgress, mockTeachBacks, subjectColors } from '@/services/mockData';
import { Brain, Eye, TrendingUp, TrendingDown, Minus, Clock, Mic, MessageSquare } from 'lucide-react';

export function TherapistPatterns() {
  const insights = mockInsights;
  const progress = mockProgress;
  const teachBacks = mockTeachBacks;

  const engagement = insights.filter((i) => i.type === 'engagement');
  const strengths = insights.filter((i) => i.type === 'strength');
  const needsPractice = insights.filter((i) => i.type === 'needs-practice');

  const trendIcon = (trend: string) => {
    if (trend === 'up') return <TrendingUp className="w-4 h-4 text-nest-green-500" />;
    if (trend === 'down') return <TrendingDown className="w-4 h-4 text-nest-peach-500" />;
    return <Minus className="w-4 h-4 text-gray-400" />;
  };

  // Session data (simulated)
  const sessions = [
    { date: 'Sep 14', duration: 12, score: 60, subject: 'Science', activity: 'Animal Habitats' },
    { date: 'Sep 13', duration: 5, score: 60, subject: 'Science', activity: 'Animal Habitats' },
    { date: 'Sep 11', duration: 8, score: 75, subject: 'Science', activity: 'Water Cycle' },
    { date: 'Sep 9', duration: 10, score: 95, subject: 'Art', activity: 'Magic of Colors' },
    { date: 'Sep 6', duration: 12, score: 90, subject: 'Math', activity: 'Numbers Are Friends' },
  ];

  return (
    <div className="space-y-6 animate-slide-up">
      <div>
        <h1 className="text-2xl lg:text-3xl font-bold text-gray-800 mb-2">Learning Patterns</h1>
        <p className="text-gray-400">Educational insights into Maya's learning behaviors and preferences</p>
      </div>

      {/* Engagement patterns */}
      <div>
        <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
          <Eye className="w-6 h-6 text-nest-lavender-500" />
          Engagement Patterns
        </h2>
        <div className="grid sm:grid-cols-2 gap-4">
          {engagement.map((e) => (
            <Card key={e.id} className="bg-gradient-to-r from-nest-lavender-50 to-nest-blue-50 border-nest-lavender-200">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-nest-lavender-200 flex items-center justify-center flex-shrink-0">
                  <Eye className="w-5 h-5 text-nest-lavender-600" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-gray-700">{e.title}</h3>
                    {trendIcon(e.trend)}
                  </div>
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

      {/* Learning session timeline */}
      <Card>
        <h3 className="font-bold text-gray-700 mb-4 flex items-center gap-2">
          <Clock className="w-5 h-5 text-nest-blue-500" /> Learning Session History
        </h3>
        <div className="space-y-3">
          {sessions.map((s, i) => {
            const sc = subjectColors[s.subject] || subjectColors.Science;
            return (
              <div key={i} className="flex items-center gap-4 py-2 border-b border-gray-100 last:border-0">
                <div className={`w-10 h-10 rounded-xl ${sc.bg} flex items-center justify-center text-lg flex-shrink-0`}>
                  {sc.emoji}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-700">{s.activity}</p>
                  <p className="text-sm text-gray-400">{s.date} • {s.duration}min • {s.subject}</p>
                </div>
                <div className="text-right">
                  <p className={`text-lg font-bold ${s.score >= 85 ? 'text-nest-green-600' : s.score >= 70 ? 'text-nest-blue-600' : 'text-nest-peach-600'}`}>
                    {s.score}%
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Strengths and areas */}
      <div className="grid lg:grid-cols-2 gap-4">
        <Card className="bg-gradient-to-br from-nest-green-50 to-nest-blue-50 border-nest-green-200">
          <h3 className="font-bold text-gray-700 mb-3 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-nest-green-500" /> Learning Strengths
          </h3>
          <ul className="space-y-3">
            {strengths.map((s) => (
              <li key={s.id} className="flex items-start gap-2">
                <span className="text-nest-green-500 mt-0.5">✓</span>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <p className="font-semibold text-gray-700">{s.title}</p>
                    {trendIcon(s.trend)}
                  </div>
                  <p className="text-sm text-gray-400">{s.description}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <ProgressBar value={s.value} className="flex-1" color="bg-nest-green-400" />
                    <span className="text-sm font-bold text-gray-600">{s.value}%</span>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </Card>
        <Card className="bg-gradient-to-br from-nest-peach-50 to-nest-yellow-50 border-nest-peach-200">
          <h3 className="font-bold text-gray-700 mb-3 flex items-center gap-2">
            <Brain className="w-5 h-5 text-nest-peach-500" /> Areas Needing Support
          </h3>
          <ul className="space-y-3">
            {needsPractice.map((s) => (
              <li key={s.id} className="flex items-start gap-2">
                <span className="text-nest-peach-500 mt-0.5">!</span>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <p className="font-semibold text-gray-700">{s.title}</p>
                    {trendIcon(s.trend)}
                  </div>
                  <p className="text-sm text-gray-400">{s.description}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <ProgressBar value={s.value} className="flex-1" color="bg-nest-peach-400" />
                    <span className="text-sm font-bold text-gray-600">{s.value}%</span>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </Card>
      </div>

      {/* Teach-back analysis */}
      <div>
        <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
          <MessageSquare className="w-6 h-6 text-nest-blue-500" />
          Teach-Back Understanding Analysis
        </h2>
        <div className="space-y-3">
          {teachBacks.map((tb) => (
            <Card key={tb.id} className="flex items-start gap-4">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${
                tb.aiEvaluation.understandingScore >= 85 ? 'bg-nest-green-100' : 'bg-nest-yellow-100'
              }`}>
                {tb.mode === 'voice' ? <Mic className="w-5 h-5 text-gray-600" /> : <MessageSquare className="w-5 h-5 text-gray-600" />}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <Badge className="bg-nest-lavender-100 text-nest-lavender-700">{tb.mode === 'voice' ? 'Voice' : 'Text'}</Badge>
                  <Badge className="bg-nest-blue-100 text-nest-blue-700">Understanding: {tb.aiEvaluation.understandingScore}%</Badge>
                  <span className="text-sm text-gray-400">{tb.date}</span>
                </div>
                <h3 className="font-bold text-gray-700">{tb.lessonTitle}</h3>
                <p className="text-sm text-gray-500 mt-1">{tb.content}</p>
                <div className="mt-2 grid sm:grid-cols-2 gap-2">
                  <div className="p-2 bg-nest-green-50 rounded-lg">
                    <p className="text-xs font-bold text-nest-green-700">Identified Strengths:</p>
                    <ul className="text-xs text-gray-500 mt-1">
                      {tb.aiEvaluation.strengths.map((s, i) => <li key={i}>• {s}</li>)}
                    </ul>
                  </div>
                  {tb.aiEvaluation.weakAreas.length > 0 && (
                    <div className="p-2 bg-nest-peach-50 rounded-lg">
                      <p className="text-xs font-bold text-nest-peach-700">Weak Areas:</p>
                      <ul className="text-xs text-gray-500 mt-1">
                        {tb.aiEvaluation.weakAreas.map((w, i) => <li key={i}>• {w}</li>)}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
