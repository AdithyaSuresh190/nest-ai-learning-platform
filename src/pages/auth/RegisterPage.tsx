import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/Card';
import { GraduationCap, BookOpen, Heart, Stethoscope, User, Mail, Lock, Sparkles, Loader2 } from 'lucide-react';
import type { UserRole } from '@/types';

const roles: { value: UserRole; label: string; emoji: string; description: string; color: string }[] = [
  { value: 'student', label: 'Student', emoji: '🧒', description: 'Learn with fun lessons and games', color: 'nest-blue' },
  { value: 'teacher', label: 'Teacher', emoji: '👩‍🏫', description: 'Create lessons and track students', color: 'nest-lavender' },
  { value: 'parent', label: 'Parent', emoji: '👨', description: 'See your child\'s progress', color: 'nest-peach' },
  { value: 'therapist', label: 'Therapist', emoji: '👩‍⚕️', description: 'View learning patterns and insights', color: 'nest-green' },
];

export function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [selectedRole, setSelectedRole] = useState<UserRole>('student');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!name.trim()) {
      setError('Please enter your name');
      return;
    }
    if (!email.trim()) {
      setError('Please enter your email');
      return;
    }
    if (!password.trim() || password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    setLoading(true);
    const result = await register(name, email, password, selectedRole);
    setLoading(false);
    if (result.success) {
      navigate(`/${selectedRole}`);
    } else {
      setError(result.error || 'Could not create account. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-mesh-warm flex items-center justify-center p-4">
      <div className="fixed top-10 left-10 text-6xl animate-float opacity-20">🪺</div>
      <div className="fixed bottom-10 right-10 text-6xl animate-float opacity-20">🌈</div>

      <div className="w-full max-w-lg">
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-gradient-to-br from-nest-blue-400 via-nest-green-400 to-nest-lavender-400 shadow-card mb-4">
            <span className="text-5xl">🪺</span>
          </div>
          <h1 className="text-4xl font-bold text-gray-800">Join NEST</h1>
          <p className="text-gray-500 mt-2">Create your account and start learning</p>
        </div>

        <div className="bg-white rounded-3xl shadow-card p-8">
          <h2 className="text-xl font-bold text-gray-700 mb-4">I am a...</h2>

          {/* Role selection cards */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            {roles.map((role) => {
              const active = selectedRole === role.value;
              return (
                <button
                  key={role.value}
                  onClick={() => setSelectedRole(role.value)}
                  className={`flex flex-col items-center gap-1 p-4 rounded-2xl border-2 transition-all text-center ${
                    active
                      ? `border-${role.color}-400 bg-${role.color}-50 shadow-soft`
                      : 'border-gray-100 hover:border-gray-200'
                  }`}
                >
                  <span className="text-3xl">{role.emoji}</span>
                  <span className={`font-bold ${active ? `text-${role.color}-700` : 'text-gray-600'}`}>{role.label}</span>
                  <span className="text-xs text-gray-400">{role.description}</span>
                </button>
              );
            })}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-600 mb-1.5">Full Name</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your name"
                  className="w-full pl-12 pr-4 py-3 rounded-xl border-2 border-gray-200 focus:border-nest-blue-400 outline-none font-medium text-gray-700"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-600 mb-1.5">Email</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
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
                  placeholder="Create a password"
                  className="w-full pl-12 pr-4 py-3 rounded-xl border-2 border-gray-200 focus:border-nest-blue-400 outline-none font-medium text-gray-700"
                />
              </div>
            </div>

            {error && <p className="text-sm text-nest-peach-600 font-medium">{error}</p>}

            <Button type="submit" size="lg" className="w-full" disabled={loading} icon={loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}>
              {loading ? 'Creating account...' : 'Create Account'}
            </Button>
          </form>

          <p className="text-center mt-6 text-sm text-gray-400">
            Already have an account?{' '}
            <Link to="/login" className="text-nest-blue-500 font-semibold hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
