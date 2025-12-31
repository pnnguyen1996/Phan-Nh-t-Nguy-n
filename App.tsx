
import React, { useState, useEffect } from 'react';
import { AppMode, Exam, StudentInfo, Question } from './types';
import LoginForm from './components/LoginForm';
import TeacherDashboard from './components/TeacherDashboard';
import StudentExam from './components/StudentExam';
import { Trophy, LogOut, Settings } from 'lucide-react';

const DEFAULT_EXAM: Exam = {
  id: 'default-exam',
  title: 'IGCSE Mathematics Mock Exam 01',
  durationMinutes: 90,
  questions: [
    {
      id: 'q1',
      number: 1,
      mainText: 'Solve the following linear equations.',
      subQuestions: [
        { id: 'q1a', part: 'a', text: '3x + 5 = 20', points: 2, correctAnswer: '5' },
        { id: 'q1b', part: 'b', text: '2(x - 4) = 10', points: 3, correctAnswer: '9' }
      ]
    },
    {
      id: 'q2',
      number: 2,
      mainText: 'Calculate the area of a circle with radius 7cm. Give your answer in terms of π.',
      subQuestions: [
        { id: 'q2a', part: 'a', text: 'Area of the circle', points: 2, correctAnswer: '49pi' }
      ]
    }
  ]
};

const App: React.FC = () => {
  const [mode, setMode] = useState<AppMode>(AppMode.LOGIN);
  const [studentInfo, setStudentInfo] = useState<StudentInfo | null>(null);
  const [exam, setExam] = useState<Exam>(() => {
    const saved = localStorage.getItem('igcse_exam');
    return saved ? JSON.parse(saved) : DEFAULT_EXAM;
  });

  const handleLogin = (name: string, className: string, isTeacher: boolean) => {
    if (isTeacher) {
      setMode(AppMode.TEACHER_DASHBOARD);
    } else {
      setStudentInfo({ name, className });
      setMode(AppMode.STUDENT_EXAM);
    }
  };

  const updateExam = (newExam: Exam) => {
    setExam(newExam);
    localStorage.setItem('igcse_exam', JSON.stringify(newExam));
  };

  const handleLogout = () => {
    setMode(AppMode.LOGIN);
    setStudentInfo(null);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Navigation Bar */}
      <nav className="bg-white border-b border-slate-200 px-6 py-4 flex justify-between items-center sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <div className="bg-blue-600 p-2 rounded-lg">
            <Trophy className="text-white w-6 h-6" />
          </div>
          <h1 className="text-xl font-bold text-slate-800 tracking-tight">STAGE 9 MONTHLY TEST</h1>
        </div>

        {mode !== AppMode.LOGIN && (
          <div className="flex items-center gap-4">
            {studentInfo && (
              <div className="hidden md:flex flex-col items-end">
                <span className="text-sm font-semibold text-slate-700">{studentInfo.name}</span>
                <span className="text-xs text-slate-500">Class: {studentInfo.className}</span>
              </div>
            )}
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </div>
        )}
      </nav>

      {/* Main Content */}
      <main className="flex-1 flex flex-col">
        {mode === AppMode.LOGIN && (
          <LoginForm onLogin={handleLogin} />
        )}
        {mode === AppMode.TEACHER_DASHBOARD && (
          <TeacherDashboard exam={exam} onUpdateExam={updateExam} />
        )}
        {mode === AppMode.STUDENT_EXAM && studentInfo && (
          <StudentExam 
            exam={exam} 
            studentInfo={studentInfo} 
            onFinish={() => setMode(AppMode.LOGIN)} 
          />
        )}
      </main>

      {/* Footer */}
      <footer className="py-6 text-center text-slate-400 text-sm border-t border-slate-200 bg-white">
        &copy; {new Date().getFullYear()} IGCSE Math Testing Platform. For Educational Purposes Only.
      </footer>
    </div>
  );
};

export default App;
