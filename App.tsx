
import React, { useState, useEffect } from 'react';
import { AppMode, Exam, StudentInfo } from './types';
import LoginForm from './components/LoginForm';
import TeacherDashboard from './components/TeacherDashboard';
import StudentExam from './components/StudentExam';
import { Trophy, LogOut, Loader2, AlertCircle, Cloud, Search, RefreshCw } from 'lucide-react';

// API KEY đã được cung cấp
const DRIVE_API_KEY = "AIzaSyBhaFTi4gXNBtjStP7unXXa0PzuI9R41xY";

const DEFAULT_EXAM: Exam = {
  id: 'default-exam',
  title: 'Hệ thống đang quét đề thi...',
  durationMinutes: 90,
  questions: []
};

// Folder ID Drive Master của giáo viên
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

  // Tự động tìm đề thi mới nhất khi khởi động ứng dụng
  useEffect(() => {
    findAndLoadClosestExam();
  }, []);

  const findAndLoadClosestExam = async () => {
    setLoading(true);
    setError(null);
    try {
      // 1. Quét danh sách các file JSON trong folder Master Drive
      // Sử dụng DRIVE_API_KEY trực tiếp để tránh lỗi thiếu biến môi trường trên Vercel
      const listUrl = `https://www.googleapis.com/drive/v3/files?q='${MASTER_DRIVE_FOLDER}'+in+parents+and+trashed=false+and+mimeType='application/json'&fields=files(id,name,modifiedTime,createdTime)&orderBy=modifiedTime+desc&key=${DRIVE_API_KEY}`;
      
      const response = await fetch(listUrl);
      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error?.message || 'Không thể truy cập Google Drive API.');
      }
      
      const data = await response.json();
      const files = data.files || [];
      
      if (files.length === 0) {
        setError('Thư mục đề thi trống hoặc không có file JSON hợp lệ.');
        setIsExamLoaded(exam.questions.length > 0);
        return;
      }

      const now = new Date();
      let bestFile = null;
      let minDiff = Infinity;

      // 2. Logic tìm đề thi gần nhất: 
      // Ưu tiên ngày dd-mm-yyyy trong tên file. Nếu không có, dùng thời gian upload (modifiedTime).
      files.forEach((file: any) => {
        const dateMatch = file.name.match(/(\d{2})-(\d{2})-(\d{4})/);
        let fileTimeRef: number;

        if (dateMatch) {
          const [_, d, m, y] = dateMatch;
          fileTimeRef = new Date(parseInt(y), parseInt(m) - 1, parseInt(d)).getTime();
        } else {
          fileTimeRef = new Date(file.modifiedTime).getTime();
        }

        const diff = Math.abs(now.getTime() - fileTimeRef);
        if (diff < minDiff) {
          minDiff = diff;
          bestFile = file;
        }
      });

      // Nếu không tìm được qua so sánh ngày, lấy file mới nhất theo modifiedTime (đã được API sắp xếp)
      if (!bestFile && files.length > 0) bestFile = files[0];

      if (bestFile) {
        console.log("Exam Discovered:", bestFile.name);
        await loadExamContent(bestFile.id, DRIVE_API_KEY);
      }
    } catch (err: any) {
      console.error("Discovery Error:", err);
      setError(`Lỗi đồng bộ: ${err.message}`);
      setIsExamLoaded(exam.questions.length > 0);
    } finally {
      setLoading(false);
    }
  };

  const loadExamContent = async (fileId: string, apiKey: string) => {
    try {
      // Tải nội dung file bằng API Key
      const driveUrl = `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media&key=${apiKey}`;
      const response = await fetch(driveUrl);
      if (!response.ok) throw new Error('Không thể tải nội dung đề thi từ Cloud.');
      
      const data = await response.json();
      if (data && data.questions && Array.isArray(data.questions)) {
        setExam(data);
        setIsExamLoaded(true);
        localStorage.setItem('igcse_exam', JSON.stringify(data));
      } else {
        throw new Error('Nội dung đề thi không hợp lệ.');
      }
    } catch (err: any) {
      console.error("Content Load Error:", err);
      setError('Lỗi xử lý nội dung đề thi.');
    }
  };

  const handleLogin = (name: string, className: string, isTeacher: boolean) => {
    if (isTeacher) {
      setMode(AppMode.TEACHER_DASHBOARD);
    } else {
      if (!isExamLoaded || exam.questions.length === 0) {
        alert('Đề thi chưa sẵn sàng. Vui lòng tải lại trang hoặc kiểm tra kết nối mạng.');
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
      <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 text-center">
        <div className="relative mb-8">
          <div className="absolute inset-0 bg-blue-100 rounded-full scale-150 blur-3xl opacity-30 animate-pulse"></div>
          <Loader2 className="w-16 h-16 text-blue-600 animate-spin relative z-10" />
          <Search className="w-6 h-6 text-blue-400 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10" />
        </div>
        <h2 className="text-2xl font-black text-slate-800 mb-2 italic uppercase tracking-tight">Auto-fetching Exam...</h2>
        <p className="text-slate-400 font-bold max-w-sm">Hệ thống đang tự động tìm kiếm bài kiểm tra mới nhất cho bạn trên Cloud.</p>
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
            <span className="text-[10px] text-blue-600 font-black uppercase tracking-widest">Portal 3.1</span>
          </div>
        </div>

        {mode !== AppMode.LOGIN ? (
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
        ) : (
          <button 
            onClick={findAndLoadClosestExam}
            className="p-2 text-slate-400 hover:text-blue-600 transition-colors"
            title="Làm mới đề thi"
          >
            <RefreshCw className="w-5 h-5" />
          </button>
        )}
      </nav>

      {error && (
        <div className="max-w-4xl mx-auto mt-6 w-full px-6">
          <div className="bg-red-50 border-2 border-red-200 p-4 rounded-2xl flex items-center gap-3 text-red-700 shadow-lg shadow-red-100/50">
            <AlertCircle className="w-6 h-6 flex-shrink-0" />
            <div className="flex-1">
              <p className="font-black text-[10px] uppercase tracking-widest mb-0.5">Lỗi hệ thống</p>
              <p className="text-sm font-medium">{error}</p>
            </div>
            <button onClick={() => setError(null)} className="p-2 hover:bg-red-100 rounded-full font-bold text-xl leading-none">&times;</button>
          </div>
        </div>
      )}

      <main className="flex-1 flex flex-col">
        {mode === AppMode.LOGIN && (
          <LoginForm 
            onLogin={handleLogin} 
            onFetchDrive={() => {}} 
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

      <footer className="py-6 text-center bg-white border-t border-slate-100">
        <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em]">IGCSE Mathematics Portal - Designed for Excellence</p>
      </footer>
    </div>
  );
};

export default App;