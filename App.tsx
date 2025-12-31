
import React, { useState, useEffect } from 'react';
import { AppMode, Exam, StudentInfo } from './types';
import LoginForm from './components/LoginForm';
import TeacherDashboard from './components/TeacherDashboard';
import StudentExam from './components/StudentExam';
import { Trophy, LogOut, Loader2, AlertCircle, Cloud } from 'lucide-react';

const DEFAULT_EXAM: Exam = {
  id: 'default-exam',
  title: 'IGCSE Mathematics Mock Exam 01',
  durationMinutes: 90,
  questions: []
};

// Folder ID bạn cung cấp: 14FZ2CQ0sNmXrKWWqZgoI3x5iWZzBNoTI
const MASTER_DRIVE_FOLDER = "14FZ2CQ0sNmXrKWWqZgoI3x5iWZzBNoTI";

const App: React.FC = () => {
  const [mode, setMode] = useState<AppMode>(AppMode.LOGIN);
  const [studentInfo, setStudentInfo] = useState<StudentInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isExamLoaded, setIsExamLoaded] = useState(false);
  const [exam, setExam] = useState<Exam>(() => {
    const saved = localStorage.getItem('igcse_exam');
    return saved ? JSON.parse(saved) : DEFAULT_EXAM;
  });

  // Tự động kiểm tra URL hoặc bộ nhớ để tải đề
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const examId = params.get('examId');
    
    if (examId) {
      loadExamFromDrive(examId);
    } else {
      // Nếu đã có đề trong bộ nhớ, đánh dấu là đã sẵn sàng
      if (exam.questions.length > 0) {
        setIsExamLoaded(true);
      }
    }
  }, []);

  const loadExamFromDrive = async (fileId: string) => {
    setLoading(true);
    setError(null);
    try {
      const driveUrl = `https://docs.google.com/uc?export=download&id=${fileId}`;
      const response = await fetch(driveUrl);
      if (!response.ok) throw new Error('Không thể tải file từ Google Drive. Vui lòng kiểm tra quyền chia sẻ của file.');
      const data = await response.json();
      
      if (data.questions && Array.isArray(data.questions)) {
        setExam(data);
        setIsExamLoaded(true);
        localStorage.setItem('igcse_exam', JSON.stringify(data));
      } else {
        throw new Error('Định dạng file đề thi không hợp lệ.');
      }
    } catch (err: any) {
      setError('Lỗi tải đề từ Cloud: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = (name: string, className: string, isTeacher: boolean) => {
    if (isTeacher) {
      setMode(AppMode.TEACHER_DASHBOARD);
    } else {
      if (!isExamLoaded || exam.questions.length === 0) {
        alert('Chưa có đề thi nào được tải. Vui lòng liên hệ giáo viên!');
        return;
      }
      setStudentInfo({ name, className });
      setMode(AppMode.STUDENT_EXAM);
    }
  };

  const updateExam = (newExam: Exam) => {
    setExam(newExam);
    setIsExamLoaded(true);
    localStorage.setItem('igcse_exam', JSON.stringify(newExam));
  };

  const handleLogout = () => {
    setMode(AppMode.LOGIN);
    setStudentInfo(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6">
        <div className="relative">
          <Loader2 className="w-16 h-16 text-blue-600 animate-spin" />
          <Cloud className="w-6 h-6 text-blue-400 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
        </div>
        <h2 className="text-2xl font-bold text-slate-800 mt-6">Đang đồng bộ đề thi...</h2>
        <p className="text-slate-500 mt-2">Vui lòng đợi trong giây lát</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Navigation Bar */}
      <nav className="bg-white border-b border-slate-200 px-6 py-4 flex justify-between items-center sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <div className="bg-blue-600 p-2 rounded-lg">
            <Trophy className="text-white w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-800 tracking-tight leading-none uppercase">IGCSE Math</h1>
            <span className="text-[10px] text-blue-600 font-black uppercase tracking-widest">Portal 2.0</span>
          </div>
        </div>

        {mode !== AppMode.LOGIN && (
          <div className="flex items-center gap-4">
            {studentInfo && (
              <div className="hidden md:flex flex-col items-end">
                <span className="text-sm font-bold text-slate-700">{studentInfo.name}</span>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Lớp: {studentInfo.className}</span>
              </div>
            )}
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all border border-slate-100"
            >
              <LogOut className="w-4 h-4" />
              Thoát
            </button>
          </div>
        )}
      </nav>

      {/* Alert Error */}
      {error && (
        <div className="max-w-4xl mx-auto mt-6 w-full px-6 animate-bounce">
          <div className="bg-red-50 border-2 border-red-200 p-4 rounded-2xl flex items-center gap-3 text-red-700 shadow-lg">
            <AlertCircle className="w-6 h-6 flex-shrink-0" />
            <div className="flex-1">
              <p className="font-bold">Thông báo lỗi</p>
              <p className="text-sm">{error}</p>
            </div>
            <button onClick={() => setError(null)} className="p-2 hover:bg-red-100 rounded-full transition-colors font-bold">&times;</button>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 flex flex-col">
        {mode === AppMode.LOGIN && (
          <LoginForm 
            onLogin={handleLogin} 
            onFetchDrive={loadExamFromDrive} 
            currentExamTitle={exam.title}
            isExamLoaded={isExamLoaded}
          />
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
      <footer className="py-8 text-center bg-white border-t border-slate-200">
        <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">IGCSE Mathematics Assessment Platform</p>
        <p className="text-slate-300 text-[10px] mt-2">Đã được tối ưu hóa cho giáo viên Việt Nam</p>
      </footer>
    </div>
  );
};

export default App;
