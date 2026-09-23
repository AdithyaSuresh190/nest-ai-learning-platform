import { useState, type ReactNode } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Home, BookOpen, BarChart3, Lightbulb, Mic, Settings,
  Upload, Users, FileText, LogOut, Menu, X, Accessibility,
  GraduationCap, Heart, Stethoscope, ChevronRight,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { AccessibilityPanel } from '@/components/ui/AccessibilityPanel';
import { ChatModule } from '@/components/chat/ChatModule';

interface NavItem {
  label: string;
  icon: ReactNode;
  path: string;
}

const roleNav: Record<string, NavItem[]> = {
  student: [
    { label: 'Dashboard', icon: <Home className="w-5 h-5" />, path: '/student' },
    { label: 'My Lessons', icon: <BookOpen className="w-5 h-5" />, path: '/student/lessons' },
    { label: 'Activities', icon: <Lightbulb className="w-5 h-5" />, path: '/student/activities' },
    { label: 'Explain It My Way', icon: <Lightbulb className="w-5 h-5" />, path: '/student/explain' },
    { label: 'Teach-Back', icon: <Mic className="w-5 h-5" />, path: '/student/teach-back' },
    { label: 'My Progress', icon: <BarChart3 className="w-5 h-5" />, path: '/student/progress' },
  ],
  teacher: [
    { label: 'Dashboard', icon: <Home className="w-5 h-5" />, path: '/teacher' },
    { label: 'Generate Content', icon: <Upload className="w-5 h-5" />, path: '/teacher/generate' },
    { label: 'Manage Lessons', icon: <BookOpen className="w-5 h-5" />, path: '/teacher/lessons' },
    { label: 'Student Performance', icon: <Users className="w-5 h-5" />, path: '/teacher/students' },
    { label: 'Reports', icon: <FileText className="w-5 h-5" />, path: '/teacher/reports' },
  ],
  parent: [
    { label: 'Dashboard', icon: <Home className="w-5 h-5" />, path: '/parent' },
    { label: 'Progress', icon: <BarChart3 className="w-5 h-5" />, path: '/parent/progress' },
    { label: 'Recommendations', icon: <Lightbulb className="w-5 h-5" />, path: '/parent/recommendations' },
  ],
  therapist: [
    { label: 'Dashboard', icon: <Home className="w-5 h-5" />, path: '/therapist' },
    { label: 'Learning Patterns', icon: <BarChart3 className="w-5 h-5" />, path: '/therapist/patterns' },
    { label: 'Activity Performance', icon: <Lightbulb className="w-5 h-5" />, path: '/therapist/activities' },
    { label: 'Reports', icon: <FileText className="w-5 h-5" />, path: '/therapist/reports' },
  ],
};

const roleConfig: Record<string, { title: string; icon: ReactNode; gradient: string }> = {
  student: { title: 'Student Hub', icon: <GraduationCap className="w-6 h-6" />, gradient: 'from-nest-blue-400 to-nest-green-400' },
  teacher: { title: 'Teacher Hub', icon: <BookOpen className="w-6 h-6" />, gradient: 'from-nest-lavender-400 to-nest-blue-400' },
  parent: { title: 'Parent Hub', icon: <Heart className="w-6 h-6" />, gradient: 'from-nest-peach-400 to-nest-yellow-400' },
  therapist: { title: 'Therapist Hub', icon: <Stethoscope className="w-6 h-6" />, gradient: 'from-nest-green-400 to-nest-blue-400' },
};

export function AppLayout({ children }: { children: ReactNode }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [accessibilityOpen, setAccessibilityOpen] = useState(false);

  if (!user) return null;

  const nav = roleNav[user.role] || [];
  const config = roleConfig[user.role] || roleConfig.student;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-mesh-warm flex">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/30 z-30 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed lg:sticky top-0 left-0 h-screen w-72 bg-white shadow-card z-40 flex flex-col transition-transform duration-300 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Logo */}
        <div className="px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${config.gradient} flex items-center justify-center text-white shadow-soft`}>
              <span className="text-2xl">🪺</span>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-800 leading-none">NEST</h1>
              <p className="text-xs text-gray-400 font-medium">Learning Together</p>
            </div>
          </div>
          <button className="lg:hidden text-gray-400" onClick={() => setSidebarOpen(false)}>
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Role badge */}
        <div className="px-4 mb-2">
          <div className={`flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r ${config.gradient} text-white`}>
            {config.icon}
            <span className="font-semibold text-sm">{config.title}</span>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-4 py-2 space-y-1 overflow-y-auto">
          {nav.map((item) => {
            const active = location.pathname === item.path || (item.path !== `/${user.role}` && location.pathname.startsWith(item.path));
            return (
              <button
                key={item.path}
                onClick={() => {
                  navigate(item.path);
                  setSidebarOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition-all ${
                  active
                    ? 'bg-nest-blue-100 text-nest-blue-700 shadow-soft'
                    : 'text-gray-500 hover:bg-gray-50'
                }`}
              >
                <span className={active ? 'text-nest-blue-500' : 'text-gray-400'}>{item.icon}</span>
                <span className="flex-1 text-left">{item.label}</span>
                {active && <ChevronRight className="w-4 h-4" />}
              </button>
            );
          })}
        </nav>

        {/* Bottom actions */}
        <div className="px-4 py-4 border-t border-gray-100 space-y-1">
          <button
            onClick={() => setAccessibilityOpen(true)}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl font-semibold text-gray-500 hover:bg-nest-lavender-50 hover:text-nest-lavender-600 transition-all"
          >
            <Accessibility className="w-5 h-5" />
            <span>Accessibility</span>
          </button>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl font-semibold text-gray-500 hover:bg-nest-peach-50 hover:text-nest-peach-600 transition-all"
          >
            <LogOut className="w-5 h-5" />
            <span>Log Out</span>
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="sticky top-0 z-20 bg-white/80 backdrop-blur-md border-b border-gray-100 px-4 lg:px-8 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button className="lg:hidden text-gray-500" onClick={() => setSidebarOpen(true)}>
              <Menu className="w-6 h-6" />
            </button>
            <div className="flex items-center gap-2">
              <span className="text-2xl">{user.avatar}</span>
              <div>
                <p className="font-bold text-gray-700 text-sm lg:text-base">Hi, {user.name}!</p>
                <p className="text-xs text-gray-400">{user.gradeLevel || (user.role.charAt(0).toUpperCase() + user.role.slice(1))}</p>
              </div>
            </div>
          </div>
          <button
            onClick={() => setAccessibilityOpen(true)}
            className="flex items-center gap-2 px-3 lg:px-4 py-2 rounded-xl bg-nest-lavender-50 text-nest-lavender-600 hover:bg-nest-lavender-100 font-semibold text-sm transition-all"
          >
            <Accessibility className="w-4 h-4" />
            <span className="hidden lg:inline">Accessibility</span>
          </button>
        </header>

        {/* Page content */}
        <main className="flex-1 p-4 lg:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>

      <AccessibilityPanel open={accessibilityOpen} onClose={() => setAccessibilityOpen(false)} />
      <ChatModule />
    </div>
  );
}
