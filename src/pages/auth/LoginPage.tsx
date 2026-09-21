import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/Card';
import { GraduationCap, BookOpen, Heart, Stethoscope, Mail, Lock, Sparkles } from 'lucide-react';
import type { UserRole } from '@/types';

const roles: { value: UserRole; label: string; icon: typeof GraduationCap; color: string; emoji: string }[] = [
  { value: 'student', label: 'Student', icon: GraduationCap, color: 'nest-blue', emoji: '🧒' },
  { value: 'teacher', label: 'Teacher', icon: BookOpen, color: 'nest-lavender', emoji: '👩‍🏫' },
  { value: 'parent', label: 'Parent', icon: Heart, color: 'nest-peach', emoji: '👨' },
  { value: 'therapist', label: 'Therapist', icon: Stethoscope, color: 'nest-green', emoji: '👩‍⚕️' },
];

export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [selectedRole, setSelectedRole] = useState<UserRole>('student');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const success = login(email || `${selectedRole}@nest.edu`, password || 'demo');
    if (success) {
      navigate(`/${selectedRole}`);
    } else {
      setError('Could not log in. Try the demo accounts below!');
    }
  };

  const quickLogin = (role: UserRole) => {
    const emails: Record<UserRole, string> = {
      student: 'maya@nest.edu',
      teacher: 'sarah@nest.edu',
      parent: 'john@nest.edu',
      therapist: 'emily@nest.edu',
    };
    login(emails[role], 'demo');
    navigate(`/${role}`);
  };

  return (
    <div className="min-h-screen bg-mesh-warm flex items-center justify-center p-4">
      {/* Floating decorations */}
      <div className="fixed top-10 left-10 text-6xl animate-float opacity-20">🪺</div>
      <div className="fixed top-20 right-20 text-5xl animate-bounce-soft opacity-20">📚</div>
      <div className="fixed bottom-20 left-20 text-5xl animate-pulse-soft opacity-20">🌈</div>
      <div className="fixed bottom-10 right-10 text-6xl animate-float opacity-20">🧩</div>

      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-gradient-to-br from-nest-blue-400 via-nest-green-400 to-nest-lavender-400 shadow-card mb-4">
            <span className="text-5xl">🪺</span>
          </div>
          <h1 className="text-4xl font-bold text-gray-800">NEST</h1>
          <p className="text-gray-500 mt-2">AI-Powered Learning for Every Mind</p>
        </div>

        <div className="bg-white rounded-3xl shadow-card p-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Welcome Back!</h2>
          <p className="text-gray-400 mb-6">Choose your role and sign in</p>

          {/* Role selection */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            {roles.map((role) => {
              const Icon = role.icon;
              const active = selectedRole === role.value;
              return (
                <button
                  key={role.value}
                  onClick={() => setSelectedRole(role.value)}
                  className={`flex flex-col items-center gap-1 py-4 rounded-2xl border-2 transition-all ${
                    active
                      ? `border-${role.color}-400 bg-${role.color}-50 shadow-soft`
                      : 'border-gray-100 hover:border-gray-200'
                  }`}
                >
                  <span className="text-3xl">{role.emoji}</span>
                  <span className={`font-semibold text-sm ${active ? `text-${role.color}-700` : 'text-gray-500'}`}>
                    {role.label}
                  </span>
                </button>
              );
            })}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-600 mb-1.5">Email</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={`${selectedRole}@nest.edu`}
                  className="w-full pl-12 pr-4 py-3 rounded-xl border-2 border-gray-200 focus:border-nest-blue-400 outline-none font-medium text-gray-700"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-600 mb-1.5">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter any password"
                  className="w-full pl-12 pr-4 py-3 rounded-xl border-2 border-gray-200 focus:border-nest-blue-400 outline-none font-medium text-gray-700"
                />
              </div>
            </div>

            {error && <p className="text-sm text-nest-peach-600 font-medium">{error}</p>}

            <Button type="submit" size="lg" className="w-full" icon={<Sparkles className="w-5 h-5" />}>
              Sign In
            </Button>
          </form>

          <div className="mt-6 pt-6 border-t border-gray-100">
            <p className="text-center text-sm text-gray-400 mb-3">Quick demo login:</p>
            <div className="flex flex-wrap gap-2 justify-center">
              {roles.map((role) => (
                <button
                  key={role.value}
                  onClick={() => quickLogin(role.value)}
                  className="px-3 py-1.5 rounded-lg bg-gray-50 hover:bg-gray-100 text-sm font-medium text-gray-600 transition-all"
                >
                  {role.emoji} {role.label}
                </button>
              ))}
            </div>
          </div>

          <p className="text-center mt-6 text-sm text-gray-400">
            New here?{' '}
            <Link to="/register" className="text-nest-blue-500 font-semibold hover:underline">
              Create an account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
