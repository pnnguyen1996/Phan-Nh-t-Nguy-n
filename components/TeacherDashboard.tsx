
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
    alert('Đã lưu cấu trúc đề thi!');
  };

  const exportToJson = () => {
    const dataStr = JSON.stringify(editExam, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    const exportFileDefaultName = `exam_${editExam.id}.json`;
    
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
    <div className="max-w-5xl mx-auto w-full p-6 space-y-8">
      {/* Thanh công cụ chính */}
      <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-200 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h2 className="text-3xl font-black text-slate-800">Soạn thảo đề thi</h2>
          <p className="text-slate-400 font-bold mt-1">Cấu hình câu hỏi, điểm số và đáp án IGCSE</p>
        </div>
        <div className="flex flex-wrap items-center gap-4">
          <div className="bg-blue-50 px-6 py-3 rounded-2xl border-2 border-blue-100 flex flex-col items-center">
            <span className="text-[10px] font-black text-blue-400 uppercase tracking-widest">Tổng điểm</span>
            <div className="flex items-center gap-1 text-blue-600 font-black text-2xl">
              <Sigma className="w-5 h-5" />
              {totalPoints}
            </div>
          </div>
          <button
            onClick={handleSave}
            className="bg-slate-900 hover:bg-slate-800 text-white px-8 py-4 rounded-2xl flex items-center gap-2 font-black transition-all shadow-xl active:scale-95"
          >
            <Save className="w-5 h-5" />
            Lưu đề
          </button>
        </div>
      </div>

      {/* Quy trình đồng bộ Cloud */}
      <div className="bg-blue-600 rounded-[2.5rem] p-10 text-white shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-10">
          <Share2 className="w-40 h-40" />
        </div>
        
        <div className="relative z-10">
          <div className="flex items-center gap-4 mb-8">
            <div className="bg-white/20 p-4 rounded-3xl">
              <CloudUpload className="w-10 h-10" />
            </div>
            <div>
              <h3 className="text-2xl font-black">Phát hành đề thi lên Cloud</h3>
              <p className="text-blue-100 font-medium">Làm theo 3 bước sau để học sinh tự động nhận đề</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            <div className="bg-white/10 p-6 rounded-3xl border border-white/20">
              <span className="inline-block bg-blue-500 text-[10px] font-black px-2 py-1 rounded-lg mb-4">BƯỚC 1</span>
              <p className="font-bold mb-4">Nhấn nút bên dưới để tải file cấu hình (.json) về máy.</p>
              <button 
                onClick={exportToJson}
                className="w-full bg-white text-blue-600 py-3 rounded-xl font-black text-sm hover:bg-blue-50 transition-colors flex items-center justify-center gap-2"
              >
                <Download className="w-4 h-4" /> Xuất file JSON
              </button>
            </div>
            <div className="bg-white/10 p-6 rounded-3xl border border-white/20">
              <span className="inline-block bg-blue-500 text-[10px] font-black px-2 py-1 rounded-lg mb-4">BƯỚC 2</span>
              <p className="font-bold mb-4">Tải file vừa tải lên thư mục Google Drive của bạn.</p>
              <a 
                href={MASTER_DRIVE_URL} 
                target="_blank" 
                rel="noreferrer"
                className="w-full bg-blue-500 text-white py-3 rounded-xl font-black text-sm hover:bg-blue-400 transition-colors flex items-center justify-center gap-2 border border-white/20"
              >
                <ExternalLink className="w-4 h-4" /> Mở thư mục Drive
              </a>
            </div>
            <div className="bg-white/10 p-6 rounded-3xl border border-white/20">
              <span className="inline-block bg-blue-500 text-[10px] font-black px-2 py-1 rounded-lg mb-4">BƯỚC 3</span>
              <p className="font-bold text-sm">Lấy <b>ID của file</b> đã tải lên và gửi link App kèm <code>?examId=FILE_ID</code> cho học sinh.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Cấu hình chung */}
      <div className="bg-white p-10 rounded-[2.5rem] shadow-sm border border-slate-200 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-2">
            <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Tiêu đề bài kiểm tra</label>
            <input
              type="text"
              value={editExam.title}
              onChange={(e) => setEditExam({ ...editExam, title: e.target.value })}
              className="w-full px-5 py-4 rounded-2xl border-2 border-slate-100 bg-white text-slate-900 font-bold focus:border-blue-500 outline-none"
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Thời gian làm bài (Phút)</label>
            <input
              type="number"
              value={editExam.durationMinutes}
              onChange={(e) => setEditExam({ ...editExam, durationMinutes: parseInt(e.target.value) || 0 })}
              className="w-full px-5 py-4 rounded-2xl border-2 border-slate-100 bg-white text-slate-900 font-bold focus:border-blue-500 outline-none"
            />
          </div>
        </div>
      </div>

      {/* Danh sách câu hỏi */}
      <div className="space-y-8 pb-32">
        {editExam.questions.map((q, qIndex) => (
          <div key={q.id} className="bg-white rounded-[2.5rem] shadow-sm border border-slate-200 overflow-hidden">
            <div className="bg-slate-50/50 px-8 py-5 border-b border-slate-100 flex justify-between items-center">
              <span className="font-black text-slate-800 uppercase tracking-tight">Question {q.number}</span>
              <button
                onClick={() => removeQuestion(q.id)}
                className="text-red-400 hover:text-red-600 p-2 hover:bg-red-50 rounded-xl transition-all"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
            <div className="p-8 space-y-8">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Nội dung chính câu hỏi</label>
                <textarea
                  value={q.mainText}
                  onChange={(e) => {
                    const newQs = [...editExam.questions];
                    newQs[qIndex].mainText = e.target.value;
                    setEditExam({ ...editExam, questions: newQs });
                  }}
                  className="w-full px-6 py-4 rounded-2xl border-2 border-slate-100 bg-white text-slate-900 font-medium focus:border-blue-500 outline-none min-h-[120px] placeholder:text-slate-300"
                  placeholder="Ví dụ: Giải phương trình sau hoặc cho tam giác ABC..."
                />
              </div>

              <div className="space-y-6">
                <div className="flex justify-between items-center border-b border-slate-100 pb-4">
                  <h4 className="font-black text-slate-800 uppercase text-xs tracking-widest">Các ý nhỏ (Sub-parts)</h4>
                  <button
                    onClick={() => addSubQuestion(q.id)}
                    className="bg-blue-50 text-blue-600 px-4 py-2 rounded-xl text-xs font-black hover:bg-blue-600 hover:text-white transition-all flex items-center gap-2"
                  >
                    <Plus className="w-4 h-4" /> Thêm ý
                  </button>
                </div>

                <div className="grid grid-cols-1 gap-4">
                  {q.subQuestions.map((sq, sqIndex) => (
                    <div key={sq.id} className="p-6 bg-slate-50/30 rounded-3xl border border-slate-100 space-y-4">
                      <div className="flex items-start gap-4">
                        <div className="w-16">
                          <label className="block text-[10px] font-black text-slate-400 mb-1 uppercase text-center">Ý</label>
                          <input
                            type="text"
                            value={sq.part}
                            onChange={(e) => {
                              const newQs = [...editExam.questions];
                              newQs[qIndex].subQuestions[sqIndex].part = e.target.value;
                              setEditExam({ ...editExam, questions: newQs });
                            }}
                            className="w-full px-2 py-3 rounded-xl border-2 border-slate-100 bg-white text-slate-900 text-center font-black focus:border-blue-500 outline-none"
                          />
                        </div>
                        <div className="flex-1">
                          <label className="block text-[10px] font-black text-slate-400 mb-1 uppercase">Yêu cầu</label>
                          <input
                            type="text"
                            value={sq.text}
                            onChange={(e) => {
                              const newQs = [...editExam.questions];
                              newQs[qIndex].subQuestions[sqIndex].text = e.target.value;
                              setEditExam({ ...editExam, questions: newQs });
                            }}
                            className="w-full px-4 py-3 rounded-xl border-2 border-slate-100 bg-white text-slate-900 font-medium focus:border-blue-500 outline-none"
                            placeholder="Ví dụ: Tính giá trị của x"
                          />
                        </div>
                        <div className="w-24">
                          <label className="block text-[10px] font-black text-slate-400 mb-1 uppercase text-center">Điểm</label>
                          <input
                            type="number"
                            value={sq.points}
                            onChange={(e) => {
                              const newQs = [...editExam.questions];
                              newQs[qIndex].subQuestions[sqIndex].points = parseInt(e.target.value) || 0;
                              setEditExam({ ...editExam, questions: newQs });
                            }}
                            className="w-full px-2 py-3 rounded-xl border-2 border-slate-100 bg-white text-slate-900 text-center font-black text-blue-600 focus:border-blue-500 outline-none"
                          />
                        </div>
                        <button
                          onClick={() => removeSubQuestion(q.id, sq.id)}
                          className="mt-6 p-3 text-slate-300 hover:text-red-500 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      <div className="space-y-1">
                        <label className="block text-[10px] font-black text-blue-500 uppercase tracking-widest ml-1">Đáp án chính xác (Để tự động chấm điểm)</label>
                        <input
                          type="text"
                          value={sq.correctAnswer}
                          onChange={(e) => {
                            const newQs = [...editExam.questions];
                            newQs[qIndex].subQuestions[sqIndex].correctAnswer = e.target.value;
                            setEditExam({ ...editExam, questions: newQs });
                          }}
                          className="w-full px-5 py-3 rounded-xl border-2 border-blue-100 bg-white text-slate-900 font-bold focus:border-blue-500 outline-none"
                          placeholder="Nhập kết quả cuối cùng (ví dụ: 10.5)"
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
          className="w-full py-12 border-4 border-dashed border-slate-200 rounded-[3rem] flex flex-col items-center justify-center gap-4 text-slate-300 font-black hover:border-blue-400 hover:text-blue-500 hover:bg-blue-50 transition-all group"
        >
          <div className="bg-slate-100 p-6 rounded-full group-hover:bg-blue-100 transition-all group-hover:scale-110">
            <Plus className="w-10 h-10" />
          </div>
          <span className="text-xl uppercase tracking-widest">Thêm câu hỏi mới</span>
        </button>
      </div>
    </div>
  );
};

export default TeacherDashboard;
