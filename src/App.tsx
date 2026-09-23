import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import { AccessibilityProvider } from '@/context/AccessibilityContext';
import { AppLayout } from '@/components/layout/AppLayout';
import { Spinner } from '@/components/ui/Card';

// Auth pages
import { LoginPage } from '@/pages/auth/LoginPage';
import { RegisterPage } from '@/pages/auth/RegisterPage';

// Student pages
import { StudentDashboard } from '@/pages/student/StudentDashboard';
import { StudentLessons } from '@/pages/student/StudentLessons';
import { LessonView } from '@/pages/student/LessonView';
import { StudentActivities } from '@/pages/student/StudentActivities';
import { ExplainItMyWay } from '@/pages/student/ExplainItMyWay';
import { TeachBack } from '@/pages/student/TeachBack';
import { StudentProgress } from '@/pages/student/StudentProgress';

// Teacher pages
import { TeacherDashboard } from '@/pages/teacher/TeacherDashboard';
import { GenerateContent } from '@/pages/teacher/GenerateContent';
import { ManageLessons } from '@/pages/teacher/ManageLessons';
import { StudentPerformance } from '@/pages/teacher/StudentPerformance';
import { TeacherReports } from '@/pages/teacher/TeacherReports';

// Parent pages
import { ParentDashboard } from '@/pages/parent/ParentDashboard';
import { ParentProgress } from '@/pages/parent/ParentProgress';
import { ParentRecommendations } from '@/pages/parent/ParentRecommendations';

// Therapist pages
import { TherapistDashboard } from '@/pages/therapist/TherapistDashboard';
import { TherapistPatterns } from '@/pages/therapist/TherapistPatterns';
import { TherapistActivities } from '@/pages/therapist/TherapistActivities';
import { TherapistReports } from '@/pages/therapist/TherapistReports';

// Shared pages
import { ProfilePage } from '@/pages/Profile';

import type { UserRole } from '@/types';

function ProtectedRoute({ children, role }: { children: React.ReactNode; role?: UserRole }) {
  const { user, isLoading } = useAuth();
  if (isLoading) {
    return (
      <div className="min-h-screen bg-mesh-warm flex items-center justify-center">
        <Spinner label="Loading NEST..." />
      </div>
    );
  }
  if (!user) return <Navigate to="/login" replace />;
  if (role && user.role !== role) return <Navigate to={`/${user.role}`} replace />;
  return <>{children}</>;
}

function RoleLayout({ role, children }: { role: UserRole; children: React.ReactNode }) {
  return (
    <ProtectedRoute role={role}>
      <AppLayout>{children}</AppLayout>
    </ProtectedRoute>
  );
}

function AppRoutes() {
  return (
    <Routes>
      {/* Auth */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      {/* Student */}
      <Route path="/student" element={<RoleLayout role="student"><StudentDashboard /></RoleLayout>} />
      <Route path="/student/lessons" element={<RoleLayout role="student"><StudentLessons /></RoleLayout>} />
      <Route path="/student/lesson/:lessonId" element={<RoleLayout role="student"><LessonView /></RoleLayout>} />
      <Route path="/student/activities" element={<RoleLayout role="student"><StudentActivities /></RoleLayout>} />
      <Route path="/student/explain" element={<RoleLayout role="student"><ExplainItMyWay /></RoleLayout>} />
      <Route path="/student/teach-back" element={<RoleLayout role="student"><TeachBack /></RoleLayout>} />
      <Route path="/student/progress" element={<RoleLayout role="student"><StudentProgress /></RoleLayout>} />

      {/* Teacher */}
      <Route path="/teacher" element={<RoleLayout role="teacher"><TeacherDashboard /></RoleLayout>} />
      <Route path="/teacher/generate" element={<RoleLayout role="teacher"><GenerateContent /></RoleLayout>} />
      <Route path="/teacher/lessons" element={<RoleLayout role="teacher"><ManageLessons /></RoleLayout>} />
      <Route path="/teacher/students" element={<RoleLayout role="teacher"><StudentPerformance /></RoleLayout>} />
      <Route path="/teacher/reports" element={<RoleLayout role="teacher"><TeacherReports /></RoleLayout>} />

      {/* Parent */}
      <Route path="/parent" element={<RoleLayout role="parent"><ParentDashboard /></RoleLayout>} />
      <Route path="/parent/progress" element={<RoleLayout role="parent"><ParentProgress /></RoleLayout>} />
      <Route path="/parent/recommendations" element={<RoleLayout role="parent"><ParentRecommendations /></RoleLayout>} />

      {/* Therapist */}
      <Route path="/therapist" element={<RoleLayout role="therapist"><TherapistDashboard /></RoleLayout>} />
      <Route path="/therapist/patterns" element={<RoleLayout role="therapist"><TherapistPatterns /></RoleLayout>} />
      <Route path="/therapist/activities" element={<RoleLayout role="therapist"><TherapistActivities /></RoleLayout>} />
      <Route path="/therapist/reports" element={<RoleLayout role="therapist"><TherapistReports /></RoleLayout>} />

      {/* Profile (shared across all roles) */}
      <Route path="/profile" element={<ProtectedRoute><AppLayout><ProfilePage /></AppLayout></ProtectedRoute>} />

      {/* Default redirect */}
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <AccessibilityProvider>
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </AccessibilityProvider>
    </AuthProvider>
  );
}

export default App;
