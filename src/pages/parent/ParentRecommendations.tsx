import { Card, Badge, ProgressBar, Button } from '@/components/ui/Card';
import { useNavigate } from 'react-router-dom';
import { mockProgress, mockInsights, mockTeachBacks, mockLessons, subjectColors } from '@/services/mockData';
import { Activity, TrendingUp, Clock, Brain, Zap, BarChart3, Mic, MessageSquare, ArrowRight } from 'lucide-react';

export function ParentRecommendations() {
  const navigate = useNavigate();
  const recommendations = mockInsights.filter((i) => i.type === 'recommendation');
  const engagement = mockInsights.filter((i) => i.type === 'engagement');

  return (
    <div className="space-y-6 animate-slide-up">
      <div>
        <h1 className="text-2xl lg:text-3xl font-bold text-gray-800 mb-2">AI Recommendations</h1>
        <p className="text-gray-400">Suggestions to help Maya learn even better</p>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        {recommendations.map((r) => (
          <Card key={r.id} className="bg-gradient-to-r from-nest-yellow-50 to-nest-peach-50 border-nest-yellow-200">
            <div className="flex items-start gap-3">
              <div className="w-12 h-12 rounded-xl bg-nest-yellow-200 flex items-center justify-center flex-shrink-0">
                <Brain className="w-6 h-6 text-nest-yellow-700" />
              </div>
              <div>
                <h3 className="font-bold text-gray-700">{r.title}</h3>
                <p className="text-sm text-gray-500 mt-1">{r.description}</p>
                <div className="flex items-center gap-2 mt-3">
                  <ProgressBar value={r.value} className="flex-1" color="bg-nest-yellow-400" />
                  <span className="text-sm font-bold text-gray-600">{r.value}%</span>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <Card className="bg-gradient-to-r from-nest-lavender-50 to-nest-blue-50 border-nest-lavender-200">
        <h3 className="font-bold text-gray-700 mb-3 flex items-center gap-2">
          <Zap className="w-5 h-5 text-nest-lavender-500" /> How Maya Learns Best
        </h3>
        <div className="space-y-3">
          {engagement.map((e) => (
            <div key={e.id} className="flex items-start gap-3 p-3 bg-white rounded-xl">
              <div className="w-10 h-10 rounded-xl bg-nest-lavender-100 flex items-center justify-center flex-shrink-0">
                <Activity className="w-5 h-5 text-nest-lavender-600" />
              </div>
              <div>
                <h4 className="font-bold text-gray-700">{e.title}</h4>
                <p className="text-sm text-gray-500 mt-1">{e.description}</p>
              </div>
            </div>
          ))}
        </div>
      </Card>

      <Button variant="primary" onClick={() => navigate('/parent/progress')} icon={<BarChart3 className="w-5 h-5" />}>
        View Detailed Progress
      </Button>
    </div>
  );
}
