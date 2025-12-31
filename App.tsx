
import React, { useState, useEffect } from 'react';
import { AppMode, Exam, StudentInfo } from './types';
import LoginForm from './components/LoginForm';
import TeacherDashboard from './components/TeacherDashboard';
import StudentExam from './components/StudentExam';
import { Trophy, LogOut, Loader2, AlertCircle, Cloud, Search } from 'lucide-react';

const DEFAULT_EXAM: Exam = {
  id: 'default-exam',
  title: 'IGCSE Mathematics Mock Exam 01',
  durationMinutes: 90,
  questions: []
};

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

  // Tự động tìm kiếm đề thi gần nhất khi app khởi chạy
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const examId = params.get('examId');
    
    if (examId) {
      loadExamFromDrive(examId);
    } else {
      findAndLoadClosestExam();
    }
  }, []);

  const findAndLoadClosestExam = async () => {
    setLoading(true);
    setError(null);
    try {
      // Sử dụng Google Drive API để list files trong folder
      // Lưu ý: Folder phải được set Public hoặc API Key có quyền truy cập
      const apiKey = process.env.API_KEY;
      const listUrl = `https://www.googleapis.com/drive/v3/files?q='${MASTER_DRIVE_FOLDER}'+in+parents+and+trashed=false&fields=files(id,name,createdTime)&key=${apiKey}`;
      
      const response = await fetch(listUrl);
      if (!response.ok) throw new Error('Không thể kết nối với Google Drive API.');
      
      const data = await response.json();
      const files = data.files || [];
      
      if (files.length === 0) {
        setIsExamLoaded(exam.questions.length > 0);
        return;
      }

      // Tìm file có ngày dd-mm-yyyy gần nhất với hiện tại
      const now = new Date();
      let closestFile = null;
      let minDiff = Infinity;

      files.forEach((file: any) => {
        // Regex tìm dd-mm-yyyy trong tên file
        const dateMatch = file.name.match(/(\d{2})-(\d{2})-(\d{4})/);
        if (dateMatch) {
          const [_, d, m, y] = dateMatch;
          const fileDate = new Date(parseInt(y), parseInt(m) - 1, parseInt(d));
          const diff = Math.abs(now.getTime() - fileDate.getTime());
          
          if (diff < minDiff) {
            minDiff = diff;
            closestFile = file;
          }
        }
      });

      // Nếu không tìm thấy file theo định dạng ngày, lấy file mới nhất theo createdTime
      if (!closestFile) {
        closestFile = files.sort((a: any, b: any) => 
          new Date(b.createdTime).getTime() - new Date(a.createdTime).getTime()
        )[0];
      }

      if (closestFile) {
        console.log("Loading closest exam:", closestFile.name);
        await loadExamFromDrive(closestFile.id);
      }
    } catch (err: any) {
      console.error("Smart Search Error:", err);
      // Fallback: Kiểm tra xem trong localStorage có đề cũ không
      setIsExamLoaded(exam.questions.length > 0);
    } finally {
      setLoading(false);
    }
  };

  const loadExamFromDrive = async (fileId: string) => {
    setLoading(true);
    try {
      const driveUrl = `https://docs.google.com/uc?export=download&id=${fileId}`;
      const response = await fetch(driveUrl);
      if (!response.ok) throw new Error('File không hỗ trợ tải trực tiếp hoặc sai quyền.');
      const data = await response.json();
      
      if (data.questions && Array.isArray(data.questions)) {
        setExam(data);
        setIsExamLoaded(true);
        localStorage.setItem('igcse_exam', JSON.stringify(data));
      }
    } catch (err: any) {
      setError('Tải đề thất bại. Vui lòng kiểm tra lại link Drive.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = (name: string, className: string, isTeacher: boolean) => {
    if (isTeacher) {
      setMode(AppMode.TEACHER_DASHBOARD);
    } else {
      if (!isExamLoaded || exam.questions.length === 0) {
        alert('Hiện tại chưa có đề thi nào khả dụng trên hệ thống Cloud!');
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

  if (loading && mode === AppMode.LOGIN) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6">
        <div className="relative">
          <Loader2 className="w-16 h-16 text-blue-600 animate-spin" />
          <Search className="w-6 h-6 text-blue-400 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
        </div>
        <h2 className="text-2xl font-bold text-slate-800 mt-6 italic">Đang tìm kiếm đề thi mới nhất...</h2>
        <p className="text-slate-400 mt-2 font-medium">Hệ thống đang quét folder Google Drive</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <nav className="bg-white border-b border-slate-200 px-6 py-4 flex justify-between items-center sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <div className="bg-blue-600 p-2 rounded-lg">
            <Trophy className="text-white w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-800 tracking-tight leading-none uppercase">IGCSE Math</h1>
            <span className="text-[10px] text-blue-600 font-black uppercase tracking-widest">Master Portal</span>
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

      {error && (
        <div className="max-w-4xl mx-auto mt-6 w-full px-6">
          <div className="bg-red-50 border-2 border-red-200 p-4 rounded-2xl flex items-center gap-3 text-red-700 shadow-lg">
            <AlertCircle className="w-6 h-6 flex-shrink-0" />
            <div className="flex-1">
              <p className="font-bold text-sm">{error}</p>
            </div>
            <button onClick={() => setError(null)} className="p-2 hover:bg-red-100 rounded-full font-bold">&times;</button>
          </div>
        </div>
      )}

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

      <footer className="py-8 text-center bg-white border-t border-slate-200">
        <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">IGCSE Mathematics Assessment Platform</p>
      </footer>
    </div>
  );
};

export default App;
