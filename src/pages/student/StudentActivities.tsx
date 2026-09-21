import { useNavigate } from 'react-router-dom';
import { Card, Badge, Button } from '@/components/ui/Card';
import { useAuth } from '@/context/AuthContext';
import { mockLessons, subjectColors, difficultyLabels } from '@/services/mockData';
import { Gamepad2, Brain, Link2, HelpCircle, Layers, Type, ArrowRight } from 'lucide-react';

const activityTypeIcons: Record<string, { icon: typeof Brain; emoji: string; color: string; label: string }> = {
  'memory-game': { icon: Brain, emoji: '🧠', color: 'nest-lavender', label: 'Memory Game' },
  'picture-matching': { icon: Link2, emoji: '🔗', color: 'nest-blue', label: 'Picture Matching' },
  'quiz': { icon: HelpCircle, emoji: '❓', color: 'nest-green', label: 'Quiz' },
  'flashcards': { icon: Layers, emoji: '📇', color: 'nest-yellow', label: 'Flashcards' },
  'word-recognition': { icon: Type, emoji: '🔤', color: 'nest-peach', label: 'Word Recognition' },
};

export function StudentActivities() {
  const { user } = useAuth();
  const navigate = useNavigate();
  if (!user) return null;

  const myLessons = mockLessons.filter((l) => l.assignedTo.includes(user.id));
  const allActivities = myLessons.flatMap((l) => l.activities.map((a) => ({ ...a, lesson: l })));

  // Group by type
  const byType: Record<string, typeof allActivities> = {};
  allActivities.forEach((a) => {
    if (!byType[a.type]) byType[a.type] = [];
    byType[a.type].push(a);
  });

  return (
    <div className="space-y-6 animate-slide-up">
      <div>
        <h1 className="text-2xl lg:text-3xl font-bold text-gray-800 mb-2">Activities</h1>
        <p className="text-gray-400">Pick a fun activity to play and learn!</p>
      </div>

      {/* Activity type cards */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {Object.entries(activityTypeIcons).map(([type, info]) => {
          const Icon = info.icon;
          const count = byType[type]?.length || 0;
          return (
            <Card key={type} className="flex items-center gap-4">
              <div className={`w-14 h-14 rounded-2xl bg-${info.color}-100 flex items-center justify-center text-3xl`}>
                {info.emoji}
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-gray-700">{info.label}</h3>
                <p className="text-sm text-gray-400">{count} activities available</p>
              </div>
              <Icon className={`w-5 h-5 text-${info.color}-400`} />
            </Card>
          );
        })}
      </div>

      {/* All activities list */}
      <div>
        <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
          <Gamepad2 className="w-5 h-5 text-nest-lavender-500" />
          All Activities
        </h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {allActivities.map((activity) => {
            const info = activityTypeIcons[activity.type] || activityTypeIcons.quiz;
            const sc = subjectColors[activity.lesson.subject] || subjectColors.Science;
            return (
              <Card key={activity.id} hover onClick={() => navigate(`/student/lesson/${activity.lesson.id}`)} className="flex flex-col gap-3">
                <div className={`w-full h-20 rounded-xl ${sc.bg} flex items-center justify-center text-4xl`}>
                  {info.emoji}
                </div>
                <div>
                  <Badge className={`${sc.bg} ${sc.text} mb-2`}>{sc.emoji} {activity.lesson.subject}</Badge>
                  <h3 className="font-bold text-gray-800">{activity.title}</h3>
                  <p className="text-sm text-gray-400 mt-1">{activity.description}</p>
                </div>
                <div className="flex items-center justify-between">
                  <Badge className={difficultyLabels[activity.difficulty].color}>{difficultyLabels[activity.difficulty].label}</Badge>
                  <Button size="sm" icon={<ArrowRight className="w-4 h-4" />}>Play</Button>
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
