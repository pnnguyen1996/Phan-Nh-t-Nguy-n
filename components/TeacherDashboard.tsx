
import React, { useState } from 'react';
import { Exam, Question } from '../types';
import { Plus, Trash2, Save, Download, Sigma, Share2, ExternalLink, CloudUpload } from 'lucide-react';

interface TeacherDashboardProps {
  exam: Exam;
  onUpdateExam: (exam: Exam) => void;
}

const MASTER_DRIVE_URL = "https://drive.google.com/drive/u/0/folders/14FZ2CQ0sNmXrKWWqZgoI3x5iWZzBNoTI";

const TeacherDashboard: React.FC<TeacherDashboardProps> = ({ exam, onUpdateExam }) => {
  const [editExam, setEditExam] = useState<Exam>(exam);

  const handleSave = () => {
    onUpdateExam(editExam);
    alert('Đã lưu nội dung đề thi vào hệ thống!');
  };

  const exportToJson = () => {
    // Luôn lấy ngày hiện tại để làm mốc định danh cho đề thi mới nhất
    const now = new Date();
    const d = String(now.getDate()).padStart(2, '0');
    const m = String(now.getMonth() + 1).padStart(2, '0');
    const y = now.getFullYear();
    const dateStr = `${d}-${m}-${y}`;
    
    const dataStr = JSON.stringify(editExam, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    const exportFileDefaultName = `${dateStr}_monthly test.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const totalPoints = editExam.questions.reduce((acc, q) => 
    acc + q.subQuestions.reduce((sqAcc, sq) => sqAcc + sq.points, 0), 0
  );

  const addQuestion = () => {
    const newQuestion: Question = {
      id: Date.now().toString(),
      number: editExam.questions.length + 1,
      mainText: '',
      subQuestions: [
        { id: `sq-${Date.now()}-a`, part: 'a', text: '', points: 1, correctAnswer: '' }
      ]
    };
    setEditExam({ ...editExam, questions: [...editExam.questions, newQuestion] });
  };

  const addSubQuestion = (qId: string) => {
    setEditExam({
      ...editExam,
      questions: editExam.questions.map(q => {
        if (q.id === qId) {
          const nextPartChar = String.fromCharCode(97 + q.subQuestions.length);
          return {
            ...q,
            subQuestions: [
              ...q.subQuestions,
              { id: `sq-${Date.now()}-${nextPartChar}`, part: nextPartChar, text: '', points: 1, correctAnswer: '' }
            ]
          };
        }
        return q;
      })
    });
  };

  const removeQuestion = (qId: string) => {
    setEditExam({
      ...editExam,
      questions: editExam.questions.filter(q => q.id !== qId).map((q, idx) => ({ ...q, number: idx + 1 }))
    });
  };

  const removeSubQuestion = (qId: string, sqId: string) => {
    setEditExam({
      ...editExam,
      questions: editExam.questions.map(q => {
        if (q.id === qId) {
          return {
            ...q,
            subQuestions: q.subQuestions.filter(sq => sq.id !== sqId)
          };
        }
        return q;
      })
    });
  };

  return (
    <div className="max-w-5xl mx-auto w-full p-6 space-y-8 animate-in fade-in duration-700">
      <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-200 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h2 className="text-3xl font-black text-slate-800">Quản lý đề thi</h2>
          <p className="text-slate-400 font-bold mt-1">Cấu hình bài tập và đáp án tự động</p>
        </div>
        <div className="flex flex-wrap items-center gap-4">
          <div className="bg-blue-50 px-6 py-3 rounded-2xl border-2 border-blue-100 flex flex-col items-center">
            <span className="text-[10px] font-black text-blue-400 uppercase tracking-widest">Marks</span>
            <div className="flex items-center gap-1 text-blue-600 font-black text-2xl">
              <Sigma className="w-5 h-5" />
              {totalPoints}
            </div>
          </div>
          <button
            onClick={handleSave}
            className="bg-slate-900 hover:bg-blue-600 text-white px-8 py-4 rounded-2xl flex items-center gap-2 font-black transition-all shadow-xl shadow-slate-200 active:scale-95"
          >
            <Save className="w-5 h-5" />
            Lưu đề
          </button>
        </div>
      </div>

      <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-[3rem] p-10 text-white shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-10">
          <CloudUpload className="w-48 h-48" />
        </div>
        
        <div className="relative z-10">
          <div className="flex items-center gap-4 mb-10">
            <div className="bg-white/20 p-5 rounded-[2rem]">
              <Share2 className="w-10 h-10" />
            </div>
            <div>
              <h3 className="text-2xl font-black">Xuất bản lên Cloud Drive</h3>
              <p className="text-blue-100 font-bold">Quy trình bắt buộc để học sinh nhận đề tự động</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white/10 p-8 rounded-[2rem] border border-white/20 backdrop-blur-sm">
              <span className="inline-block bg-white/20 text-[10px] font-black px-3 py-1.5 rounded-full mb-6 uppercase tracking-widest">Bước 1</span>
              <p className="font-bold mb-6 text-sm leading-relaxed">Nhấn Xuất file JSON. App sẽ đặt tên file có ngày hiện tại để học sinh dễ tìm.</p>
              <button 
                onClick={exportToJson}
                className="w-full bg-white text-blue-600 py-4 rounded-2xl font-black text-sm hover:shadow-xl transition-all flex items-center justify-center gap-2"
              >
                <Download className="w-4 h-4" /> Xuất JSON
              </button>
            </div>
            <div className="bg-white/10 p-8 rounded-[2rem] border border-white/20 backdrop-blur-sm">
              <span className="inline-block bg-white/20 text-[10px] font-black px-3 py-1.5 rounded-full mb-6 uppercase tracking-widest">Bước 2</span>
              <p className="font-bold mb-6 text-sm leading-relaxed">Tải file vừa có lên Folder Drive Master (Nút bên dưới).</p>
              <a 
                href={MASTER_DRIVE_URL} 
                target="_blank" 
                rel="noreferrer"
                className="w-full bg-blue-500 text-white py-4 rounded-2xl font-black text-sm hover:bg-blue-400 transition-all flex items-center justify-center gap-2 border border-white/20 shadow-lg"
              >
                <ExternalLink className="w-4 h-4" /> Mở Folder Drive
              </a>
            </div>
            <div className="bg-white/10 p-8 rounded-[2rem] border border-white/20 backdrop-blur-sm flex flex-col justify-center">
              <span className="inline-block bg-white/20 text-[10px] font-black px-3 py-1.5 rounded-full mb-6 uppercase tracking-widest">Bước 3</span>
              <p className="font-bold text-sm leading-relaxed italic text-blue-50">Học sinh khi vào App sẽ tự động quét folder này, đọc ngày tháng trong tên file và thời gian upload để chọn đề thi mới nhất cho hôm nay.</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white p-10 rounded-[2.5rem] shadow-sm border border-slate-200 space-y-8">
        <h3 className="font-black text-slate-800 uppercase tracking-widest text-xs border-b border-slate-100 pb-4">Thông tin bài thi</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          <div className="space-y-3">
            <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Tiêu đề (Hiện trên PDF)</label>
            <input
              type="text"
              value={editExam.title}
              onChange={(e) => setEditExam({ ...editExam, title: e.target.value })}
              className="w-full px-6 py-5 rounded-2xl border-2 border-slate-100 bg-white text-slate-900 font-bold focus:border-blue-500 outline-none transition-all"
            />
          </div>
          <div className="space-y-3">
            <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Thời gian (Phút)</label>
            <input
              type="number"
              value={editExam.durationMinutes}
              onChange={(e) => setEditExam({ ...editExam, durationMinutes: parseInt(e.target.value) || 0 })}
              className="w-full px-6 py-5 rounded-2xl border-2 border-slate-100 bg-white text-slate-900 font-bold focus:border-blue-500 outline-none transition-all"
            />
          </div>
        </div>
      </div>

      <div className="space-y-8 pb-40">
        {editExam.questions.map((q, qIndex) => (
          <div key={q.id} className="bg-white rounded-[2.5rem] shadow-sm border border-slate-200 overflow-hidden group">
            <div className="bg-slate-50/50 px-10 py-6 border-b border-slate-100 flex justify-between items-center group-hover:bg-slate-100/50 transition-colors">
              <span className="font-black text-slate-800 uppercase tracking-tight text-lg">Question {q.number}</span>
              <button
                onClick={() => removeQuestion(q.id)}
                className="text-slate-300 hover:text-red-500 p-3 hover:bg-red-50 rounded-2xl transition-all"
              >
                <Trash2 className="w-6 h-6" />
              </button>
            </div>
            <div className="p-10 space-y-10">
              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Nội dung câu hỏi chính</label>
                <textarea
                  value={q.mainText}
                  onChange={(e) => {
                    const newQs = [...editExam.questions];
                    newQs[qIndex].mainText = e.target.value;
                    setEditExam({ ...editExam, questions: newQs });
                  }}
                  className="w-full px-8 py-6 rounded-[2rem] border-2 border-slate-100 bg-white text-slate-900 font-medium focus:border-blue-500 outline-none min-h-[140px] placeholder:text-slate-300 transition-all text-lg"
                  placeholder="Ví dụ: Solve the following equations for x..."
                />
              </div>

              <div className="space-y-8">
                <div className="flex justify-between items-center">
                  <h4 className="font-black text-slate-800 uppercase text-xs tracking-[0.2em] ml-1">Sub-parts</h4>
                  <button
                    onClick={() => addSubQuestion(q.id)}
                    className="bg-blue-50 text-blue-600 px-6 py-2.5 rounded-2xl text-xs font-black hover:bg-blue-600 hover:text-white transition-all flex items-center gap-2 shadow-sm"
                  >
                    <Plus className="w-4 h-4" /> Thêm ý nhỏ
                  </button>
                </div>

                <div className="grid grid-cols-1 gap-6">
                  {q.subQuestions.map((sq, sqIndex) => (
                    <div key={sq.id} className="p-8 bg-slate-50/30 rounded-[2rem] border border-slate-100 space-y-6 hover:shadow-md transition-all">
                      <div className="flex items-start gap-6">
                        <div className="w-20">
                          <label className="block text-[10px] font-black text-slate-400 mb-2 uppercase text-center">Part</label>
                          <input
                            type="text"
                            value={sq.part}
                            onChange={(e) => {
                              const newQs = [...editExam.questions];
                              newQs[qIndex].subQuestions[sqIndex].part = e.target.value;
                              setEditExam({ ...editExam, questions: newQs });
                            }}
                            className="w-full px-2 py-4 rounded-2xl border-2 border-slate-100 bg-white text-slate-900 text-center font-black focus:border-blue-500 outline-none"
                          />
                        </div>
                        <div className="flex-1">
                          <label className="block text-[10px] font-black text-slate-400 mb-2 uppercase ml-1">Yêu cầu cụ thể</label>
                          <input
                            type="text"
                            value={sq.text}
                            onChange={(e) => {
                              const newQs = [...editExam.questions];
                              newQs[qIndex].subQuestions[sqIndex].text = e.target.value;
                              setEditExam({ ...editExam, questions: newQs });
                            }}
                            className="w-full px-6 py-4 rounded-2xl border-2 border-slate-100 bg-white text-slate-900 font-bold focus:border-blue-500 outline-none"
                          />
                        </div>
                        <div className="w-28">
                          <label className="block text-[10px] font-black text-slate-400 mb-2 uppercase text-center">Marks</label>
                          <input
                            type="number"
                            value={sq.points}
                            onChange={(e) => {
                              const newQs = [...editExam.questions];
                              newQs[qIndex].subQuestions[sqIndex].points = parseInt(e.target.value) || 0;
                              setEditExam({ ...editExam, questions: newQs });
                            }}
                            className="w-full px-2 py-4 rounded-2xl border-2 border-slate-100 bg-white text-slate-900 text-center font-black text-blue-600 focus:border-blue-500 outline-none"
                          />
                        </div>
                        <button
                          onClick={() => removeSubQuestion(q.id, sq.id)}
                          className="mt-8 p-3 text-slate-300 hover:text-red-500 transition-colors"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                      <div className="space-y-2">
                        <label className="block text-[10px] font-black text-blue-500 uppercase tracking-widest ml-1">Đáp án chính xác (Auto-grade)</label>
                        <input
                          type="text"
                          value={sq.correctAnswer}
                          onChange={(e) => {
                            const newQs = [...editExam.questions];
                            newQs[qIndex].subQuestions[sqIndex].correctAnswer = e.target.value;
                            setEditExam({ ...editExam, questions: newQs });
                          }}
                          className="w-full px-8 py-4 rounded-2xl border-2 border-blue-100 bg-white text-slate-900 font-bold focus:border-blue-500 outline-none"
                          placeholder="e.g. 5.5 or 3/4"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ))}

        <button
          onClick={addQuestion}
          className="w-full py-16 border-4 border-dashed border-slate-200 rounded-[3.5rem] flex flex-col items-center justify-center gap-5 text-slate-300 font-black hover:border-blue-400 hover:text-blue-500 hover:bg-blue-50 transition-all group shadow-sm active:scale-95"
        >
          <div className="bg-slate-100 p-8 rounded-full group-hover:bg-blue-100 transition-all group-hover:scale-110 shadow-inner">
            <Plus className="w-12 h-12" />
          </div>
          <span className="text-2xl uppercase tracking-[0.3em]">Thêm câu hỏi mới</span>
        </button>
      </div>
    </div>
  );
};

export default TeacherDashboard;
