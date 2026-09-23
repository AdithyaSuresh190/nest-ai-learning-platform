import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/Card';
import { GraduationCap, BookOpen, Heart, Stethoscope, Mail, Lock, Sparkles, Loader2 } from 'lucide-react';
import type { UserRole } from '@/types';

const roles: { value: UserRole; label: string; icon: typeof GraduationCap; color: string; emoji: string }[] = [
  { value: 'student', label: 'Student', icon: GraduationCap, color: 'nest-blue', emoji: '🧒' },
  { value: 'teacher', label: 'Teacher', icon: BookOpen, color: 'nest-lavender', emoji: '👩‍🏫' },
  { value: 'parent', label: 'Parent', icon: Heart, color: 'nest-peach', emoji: '👨' },
  { value: 'therapist', label: 'Therapist', icon: Stethoscope, color: 'nest-green', emoji: '👩‍⚕️' },
];

const demoAccounts: Record<UserRole, { email: string; name: string }> = {
  student: { email: 'maya@nest.edu', name: 'Maya' },
  teacher: { email: 'sarah@nest.edu', name: 'Ms. Sarah' },
  parent: { email: 'john@nest.edu', name: 'John' },
  therapist: { email: 'emily@nest.edu', name: 'Dr. Emily' },
};

const DEMO_PASSWORD = 'nestdemo123';

export function LoginPage() {
  const { login, register } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingRole, setLoadingRole] = useState<UserRole | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!email.trim() || !password.trim()) {
      setError('Please enter your email and password.');
      return;
    }
    setLoading(true);
    const result = await login(email, password);
    setLoading(false);
    if (result.success && result.user) {
      navigate(`/${result.user.role}`);
    } else {
      setError(result.error || 'Could not log in. Please check your credentials.');
    }
  };

  const quickLogin = async (role: UserRole) => {
    setError('');
    setLoadingRole(role);
    const demo = demoAccounts[role];

    // Try to sign in first
    let result = await login(demo.email, DEMO_PASSWORD);

    // If login fails (account doesn't exist), auto-create it
    if (!result.success) {
      result = await register(demo.name, demo.email, DEMO_PASSWORD, role);
    }

    setLoadingRole(null);
    if (result.success && result.user) {
      navigate(`/${result.user.role}`);
    } else {
      setError(`Could not set up demo account: ${result.error}`);
    }
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
          <p className="text-gray-400 mb-6">Sign in to your account</p>

          <form onSubmit={handleSubmit} className="space-y-4">
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
                  placeholder="Your password"
                  className="w-full pl-12 pr-4 py-3 rounded-xl border-2 border-gray-200 focus:border-nest-blue-400 outline-none font-medium text-gray-700"
                />
              </div>
            </div>

            {error && <p className="text-sm text-nest-peach-600 font-medium">{error}</p>}

            <Button type="submit" size="lg" className="w-full" disabled={loading} icon={loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}>
              {loading ? 'Signing in...' : 'Sign In'}
            </Button>
          </form>

          <div className="mt-6 pt-6 border-t border-gray-100">
            <p className="text-center text-sm text-gray-400 mb-3">Try a demo account (auto-creates on first use):</p>
            <div className="grid grid-cols-2 gap-2">
              {roles.map((role) => (
                <button
                  key={role.value}
                  onClick={() => quickLogin(role.value)}
                  disabled={loading || loadingRole !== null}
                  className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-gray-50 hover:bg-gray-100 text-sm font-medium text-gray-600 transition-all disabled:opacity-50 justify-center"
                >
                  {loadingRole === role.value ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <span className="text-lg">{role.emoji}</span>
                  )}
                  {role.label}
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
