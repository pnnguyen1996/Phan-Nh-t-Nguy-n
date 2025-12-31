
import React, { useState } from 'react';
import { User, School, Lock, ChevronRight, CloudCheck, CloudOff, Info, ArrowRight } from 'lucide-react';

interface LoginFormProps {
  onLogin: (name: string, className: string, isTeacher: boolean) => void;
  onFetchDrive: (fileId: string) => void;
  currentExamTitle: string;
  isExamLoaded: boolean;
}

const LoginForm: React.FC<LoginFormProps> = ({ onLogin, onFetchDrive, currentExamTitle, isExamLoaded }) => {
  const [name, setName] = useState('');
  const [className, setClassName] = useState('');
  const [isTeacherMode, setIsTeacherMode] = useState(false);
  const [teacherCode, setTeacherCode] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isTeacherMode) {
      if (teacherCode === 'Nhatnguyen10a') {
        onLogin('Teacher', 'Admin', true);
      } else {
        alert('Mã truy cập giáo viên không đúng!');
      }
    } else {
      if (name.trim() && className.trim()) {
        onLogin(name, className, false);
      } else {
        alert('Vui lòng điền đầy đủ Họ tên và Lớp');
      }
    }
  };

  return (
    <div className="flex-1 flex flex-col lg:flex-row bg-slate-50">
      {/* Cột trái: Thông tin bài thi */}
      <div className="flex-1 bg-blue-600 p-8 lg:p-16 flex flex-col justify-center text-white">
        <div className="max-w-md mx-auto lg:mx-0">
          <div className="inline-flex items-center gap-2 bg-blue-500/50 px-4 py-2 rounded-full border border-blue-400/30 mb-8">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
            </span>
            <span className="text-xs font-bold uppercase tracking-widest">Hệ thống đang hoạt động</span>
          </div>
          
          <h2 className="text-4xl lg:text-5xl font-black mb-6 leading-tight">IGCSE Math Portal</h2>
          <p className="text-blue-100 text-lg mb-12 font-medium">
            Học sinh vui lòng nhập thông tin cá nhân để bắt đầu bài thi. Đề thi sẽ được tự động tải về từ hệ thống Cloud.
          </p>

          <div className="space-y-4">
            <div className={`p-6 rounded-3xl border-2 transition-all duration-500 ${isExamLoaded ? 'bg-white/10 border-white/20' : 'bg-red-500/10 border-red-400/20'}`}>
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-2xl ${isExamLoaded ? 'bg-green-500' : 'bg-red-500'}`}>
                  {isExamLoaded ? <CloudCheck className="w-6 h-6" /> : <CloudOff className="w-6 h-6" />}
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-blue-200">Trạng thái đề thi</p>
                  <p className="font-bold text-lg truncate">
                    {isExamLoaded ? currentExamTitle : "Chưa có đề thi nào"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Cột phải: Form đăng nhập */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12">
        <div className="bg-white w-full max-w-md p-10 rounded-[2.5rem] shadow-2xl border border-slate-200">
          <div className="mb-10 text-center">
            <h3 className="text-3xl font-black text-slate-800 mb-2">
              {isTeacherMode ? 'Giáo viên' : 'Đăng nhập'}
            </h3>
            <p className="text-slate-400 font-medium">Vui lòng điền thông tin dưới đây</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {!isTeacherMode ? (
              <>
                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Họ và Tên</label>
                  <div className="relative group">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5 group-focus-within:text-blue-500 transition-colors" />
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Ví dụ: Nguyễn Văn A"
                      className="w-full pl-12 pr-4 py-4 rounded-2xl border-2 border-slate-100 bg-white text-slate-900 font-bold focus:border-blue-500 outline-none transition-all placeholder:text-slate-300"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Lớp / Trường</label>
                  <div className="relative group">
                    <School className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5 group-focus-within:text-blue-500 transition-colors" />
                    <input
                      type="text"
                      required
                      value={className}
                      onChange={(e) => setClassName(e.target.value)}
                      placeholder="Ví dụ: 10A1 - Vinschool"
                      className="w-full pl-12 pr-4 py-4 rounded-2xl border-2 border-slate-100 bg-white text-slate-900 font-bold focus:border-blue-500 outline-none transition-all placeholder:text-slate-300"
                    />
                  </div>
                </div>
              </>
            ) : (
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Mã xác thực</label>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5 group-focus-within:text-blue-500 transition-colors" />
                  <input
                    type="password"
                    required
                    value={teacherCode}
                    onChange={(e) => setTeacherCode(e.target.value)}
                    placeholder="Nhập mã bí mật"
                    className="w-full pl-12 pr-4 py-4 rounded-2xl border-2 border-slate-100 bg-white text-slate-900 font-bold focus:border-blue-500 outline-none transition-all"
                  />
                </div>
              </div>
            )}

            <button
              type="submit"
              className="w-full bg-slate-900 hover:bg-blue-600 text-white font-black py-5 rounded-2xl flex items-center justify-center gap-3 shadow-xl hover:shadow-blue-200 transition-all transform hover:-translate-y-1 active:scale-95"
            >
              {isTeacherMode ? 'Vào Dashboard' : 'Bắt đầu làm bài'}
              <ArrowRight className="w-5 h-5" />
            </button>
          </form>

          <div className="mt-10 pt-8 border-t border-slate-50 text-center">
            <button
              onClick={() => setIsTeacherMode(!isTeacherMode)}
              className="text-slate-400 text-sm font-bold hover:text-blue-600 transition-colors uppercase tracking-widest"
            >
              {isTeacherMode ? 'Học sinh đăng nhập' : 'Truy cập giáo viên'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;
