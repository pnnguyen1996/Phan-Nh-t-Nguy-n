
import React, { useState } from 'react';
import { User, School, Lock, ChevronRight } from 'lucide-react';

interface LoginFormProps {
  onLogin: (name: string, className: string, isTeacher: boolean) => void;
}

const LoginForm: React.FC<LoginFormProps> = ({ onLogin }) => {
  const [name, setName] = useState('');
  const [className, setClassName] = useState('');
  const [isTeacherMode, setIsTeacherMode] = useState(false);
  const [teacherCode, setTeacherCode] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isTeacherMode) {
      if (teacherCode === 'Nhatnguyen10a') { // Mock teacher code
        onLogin('Teacher', 'Admin', true);
      } else {
        alert('Invalid Teacher Access Code!');
      }
    } else {
      if (name.trim() && className.trim()) {
        onLogin(name, className, false);
      } else {
        alert('Please fill in Name and Class');
      }
    }
  };

  return (
    <div className="flex-1 flex items-center justify-center p-6 bg-[url('https://www.transparenttextures.com/patterns/graphy.png')]">
      <div className="bg-white w-full max-w-md p-8 rounded-2xl shadow-xl border border-slate-200">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-extrabold text-slate-800">Welcome Back</h2>
          <p className="text-slate-500 mt-2">Enter your details to access the exam</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {!isTeacherMode ? (
            <>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Student Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Nguyen Van A"
                    className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Class</label>
                <div className="relative">
                  <School className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                  <input
                    type="text"
                    required
                    value={className}
                    onChange={(e) => setClassName(e.target.value)}
                    placeholder="e.g. 10A1"
                    className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                  />
                </div>
              </div>
            </>
          ) : (
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Teacher Access Code</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                <input
                  type="password"
                  required
                  value={teacherCode}
                  onChange={(e) => setTeacherCode(e.target.value)}
                  placeholder="Enter secret code"
                  className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                />
              </div>
              <p className="text-xs text-slate-400 mt-2 italic"></p>
            </div>
          )}

          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-blue-200 transition-all transform hover:-translate-y-1"
          >
            {isTeacherMode ? 'Enter Admin Panel' : 'Start My Exam'}
            <ChevronRight className="w-5 h-5" />
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-slate-100">
          <button
            onClick={() => setIsTeacherMode(!isTeacherMode)}
            className="w-full text-blue-600 text-sm font-semibold hover:underline"
          >
            {isTeacherMode ? 'Back to Student Login' : 'Are you a teacher? Click here'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;
