import React, { useState, useEffect } from 'react';
import { PlatformProvider, usePlatform } from './context/PlatformContext';
import { AppShell } from './components/layout/AppShell';
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';

// Teacher Screens
import { TeacherDashboard } from './pages/teacher/TeacherDashboard';
import { TeacherCourses } from './pages/teacher/TeacherCourses';
import { LessonBuilder } from './pages/teacher/LessonBuilder';
import { TeacherClassroom } from './pages/teacher/TeacherClassroom';
import { AssessmentViewer } from './pages/teacher/AssessmentViewer';
import { ClassInsights } from './pages/teacher/ClassInsights';
import { TeacherRecommendations } from './pages/teacher/TeacherRecommendations';

// Student Screens
import { StudentDashboard } from './pages/student/StudentDashboard';
import { StudentClassroom } from './pages/student/StudentClassroom';
import { PersonalizedPractice } from './pages/student/PersonalizedPractice';
import { AiTutorPage } from './pages/student/AiTutorPage';
import { SkillPassportPage } from './pages/student/SkillPassportPage';

// Admin Screens
import { AdminOverview } from './pages/admin/AdminOverview';
import { AcademicAnalytics } from './pages/admin/AcademicAnalytics';
import { AiGovernancePage } from './pages/admin/AiGovernancePage';

// Demo & System Screens
import { DemoRunnerPage } from './pages/demo/DemoRunnerPage';
import { ForbiddenPage, NotFoundPage } from './pages/system/ForbiddenPage';

function MainRouter() {
  const { role } = usePlatform();
  const [currentPath, setCurrentPath] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      const path = window.location.pathname;
      return path && path !== '' ? path : '/';
    }
    return '/';
  });

  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname || '/');
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigate = (path: string) => {
    setCurrentPath(path);
    if (typeof window !== 'undefined') {
      window.history.pushState({}, '', path);
    }
  };

  // Role Access Guard check (§5.2)
  const isTeacherRoute = currentPath.startsWith('/teacher');
  const isStudentRoute = currentPath.startsWith('/student');
  const isAdminRoute = currentPath.startsWith('/admin');

  if (isTeacherRoute && role !== 'TEACHER') {
    return (
      <AppShell activePath={currentPath} onNavigate={navigate}>
        <ForbiddenPage targetPath={currentPath} onNavigate={navigate} />
      </AppShell>
    );
  }

  if (isStudentRoute && role !== 'STUDENT') {
    return (
      <AppShell activePath={currentPath} onNavigate={navigate}>
        <ForbiddenPage targetPath={currentPath} onNavigate={navigate} />
      </AppShell>
    );
  }

  if (isAdminRoute && role !== 'ADMIN') {
    return (
      <AppShell activePath={currentPath} onNavigate={navigate}>
        <ForbiddenPage targetPath={currentPath} onNavigate={navigate} />
      </AppShell>
    );
  }

  // Public Screens (no AppShell)
  if (currentPath === '/') {
    return <LandingPage onNavigate={navigate} />;
  }

  if (currentPath === '/login') {
    return <LoginPage onNavigate={navigate} />;
  }

  // Authenticated App Views (within AppShell)
  const renderScreen = () => {
    switch (currentPath) {
      // Teacher Screens (SC03 - SC09)
      case '/teacher':
        return <TeacherDashboard onNavigate={navigate} />;
      case '/teacher/courses':
        return <TeacherCourses onNavigate={navigate} />;
      case '/teacher/lesson-builder':
        return <LessonBuilder onNavigate={navigate} />;
      case '/teacher/classroom':
        return <TeacherClassroom onNavigate={navigate} />;
      case '/teacher/assessment':
        return <AssessmentViewer />;
      case '/teacher/insights':
        return <ClassInsights onNavigate={navigate} />;
      case '/teacher/recommendations':
        return <TeacherRecommendations onNavigate={navigate} />;

      // Student Screens (SC10 - SC14)
      case '/student':
        return <StudentDashboard onNavigate={navigate} />;
      case '/student/classroom':
        return <StudentClassroom onNavigate={navigate} />;
      case '/student/practice':
        return <PersonalizedPractice onNavigate={navigate} />;
      case '/student/tutor':
        return <AiTutorPage />;
      case '/student/skills':
        return <SkillPassportPage />;

      // Admin Screens (SC15 - SC17)
      case '/admin':
        return <AdminOverview onNavigate={navigate} />;
      case '/admin/analytics':
        return <AcademicAnalytics />;
      case '/admin/governance':
        return <AiGovernancePage />;

      // Demo Runner (SC18)
      case '/demo':
        return <DemoRunnerPage onNavigate={navigate} />;

      // 403 / 404
      case '/403':
        return <ForbiddenPage onNavigate={navigate} />;
      default:
        return <NotFoundPage onNavigate={navigate} />;
    }
  };

  return (
    <AppShell activePath={currentPath} onNavigate={navigate}>
      {renderScreen()}
    </AppShell>
  );
}

export default function App() {
  return (
    <PlatformProvider>
      <MainRouter />
    </PlatformProvider>
  );
}
