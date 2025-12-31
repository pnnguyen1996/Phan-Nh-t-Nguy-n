
import React, { useState } from 'react';
import { Exam, Question, SubQuestion } from '../types';
import { Plus, Trash2, Save, FilePlus, ChevronDown, ChevronUp, Sigma } from 'lucide-react';

interface TeacherDashboardProps {
  exam: Exam;
  onUpdateExam: (exam: Exam) => void;
}

const TeacherDashboard: React.FC<TeacherDashboardProps> = ({ exam, onUpdateExam }) => {
  const [editExam, setEditExam] = useState<Exam>(exam);

  const handleSave = () => {
    onUpdateExam(editExam);
    alert('Exam saved successfully!');
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
    <div className="max-w-4xl mx-auto w-full p-6 space-y-8">
      <div className="flex justify-between items-center bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Teacher Management</h2>
          <p className="text-slate-500">Create and edit IGCSE Math exam questions</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex flex-col items-end mr-2">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Total Marks</span>
            <div className="flex items-center gap-1 text-blue-600">
              <Sigma className="w-4 h-4" />
              <span className="text-2xl font-black">{totalPoints}</span>
            </div>
          </div>
          <button
            onClick={handleSave}
            className="bg-green-600 hover:bg-green-700 text-white px-6 py-2.5 rounded-xl flex items-center gap-2 font-bold transition-all shadow-lg shadow-green-100"
          >
            <Save className="w-5 h-5" />
            Save Changes
          </button>
        </div>
      </div>

      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 space-y-4">
        <label className="block text-sm font-bold text-slate-700">Exam Title</label>
        <input
          type="text"
          value={editExam.title}
          onChange={(e) => setEditExam({ ...editExam, title: e.target.value })}
          className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-900 focus:ring-2 focus:ring-blue-500 outline-none"
        />
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <label className="block text-sm font-bold text-slate-700 mb-2">Duration (Minutes)</label>
            <input
              type="number"
              value={editExam.durationMinutes}
              onChange={(e) => setEditExam({ ...editExam, durationMinutes: parseInt(e.target.value) || 0 })}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-900 focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
        </div>
      </div>

      <div className="space-y-6 pb-20">
        {editExam.questions.map((q, qIndex) => (
          <div key={q.id} className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex justify-between items-center">
              <span className="font-bold text-slate-700">Question {q.number}</span>
              <button
                onClick={() => removeQuestion(q.id)}
                className="text-red-500 hover:text-red-700 p-2 rounded-lg hover:bg-red-50 transition-colors"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-6">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Main Question Description</label>
                <textarea
                  value={q.mainText}
                  onChange={(e) => {
                    const newQs = [...editExam.questions];
                    newQs[qIndex].mainText = e.target.value;
                    setEditExam({ ...editExam, questions: newQs });
                  }}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-900 focus:ring-2 focus:ring-blue-500 outline-none min-h-[100px]"
                  placeholder="Enter the main problem text..."
                />
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h4 className="text-sm font-bold text-slate-700">Sub-questions / Parts</h4>
                  <button
                    onClick={() => addSubQuestion(q.id)}
                    className="text-blue-600 text-xs font-bold hover:bg-blue-50 px-3 py-1.5 rounded-lg flex items-center gap-1 transition-all"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Add Part
                  </button>
                </div>

                {q.subQuestions.map((sq, sqIndex) => (
                  <div key={sq.id} className="p-4 bg-slate-50 rounded-xl border border-slate-100 flex flex-col gap-4">
                    <div className="flex justify-between items-start">
                      <div className="flex-1 grid grid-cols-12 gap-4">
                        <div className="col-span-1">
                          <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">Part</label>
                          <input
                            type="text"
                            value={sq.part}
                            onChange={(e) => {
                              const newQs = [...editExam.questions];
                              newQs[qIndex].subQuestions[sqIndex].part = e.target.value;
                              setEditExam({ ...editExam, questions: newQs });
                            }}
                            className="w-full px-2 py-2 rounded-lg border border-slate-200 bg-white text-slate-900 text-center font-bold"
                          />
                        </div>
                        <div className="col-span-8">
                          <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">Question Text</label>
                          <input
                            type="text"
                            value={sq.text}
                            onChange={(e) => {
                              const newQs = [...editExam.questions];
                              newQs[qIndex].subQuestions[sqIndex].text = e.target.value;
                              setEditExam({ ...editExam, questions: newQs });
                            }}
                            className="w-full px-4 py-2 rounded-lg border border-slate-200 bg-white text-slate-900"
                          />
                        </div>
                        <div className="col-span-3">
                          <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">Points</label>
                          <input
                            type="number"
                            value={sq.points}
                            onChange={(e) => {
                              const newQs = [...editExam.questions];
                              newQs[qIndex].subQuestions[sqIndex].points = parseInt(e.target.value) || 0;
                              setEditExam({ ...editExam, questions: newQs });
                            }}
                            className="w-full px-4 py-2 rounded-lg border border-slate-200 bg-white text-slate-900"
                          />
                        </div>
                      </div>
                      <button
                        onClick={() => removeSubQuestion(q.id, sq.id)}
                        className="ml-4 text-slate-400 hover:text-red-500 p-2"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 mb-1 uppercase text-blue-600">Correct Answer (Auto-grade)</label>
                      <input
                        type="text"
                        value={sq.correctAnswer}
                        onChange={(e) => {
                          const newQs = [...editExam.questions];
                          newQs[qIndex].subQuestions[sqIndex].correctAnswer = e.target.value;
                          setEditExam({ ...editExam, questions: newQs });
                        }}
                        className="w-full px-4 py-2 rounded-lg border border-blue-100 bg-white text-slate-900"
                        placeholder="e.g. 5 or 3/4 or 2.5"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}

        <button
          onClick={addQuestion}
          className="w-full py-6 border-2 border-dashed border-slate-300 rounded-2xl flex items-center justify-center gap-2 text-slate-500 font-bold hover:border-blue-400 hover:text-blue-500 hover:bg-blue-50 transition-all group"
        >
          <div className="bg-slate-100 p-2 rounded-full group-hover:bg-blue-100 transition-all">
            <Plus className="w-6 h-6" />
          </div>
          Add New Question
        </button>
      </div>
    </div>
  );
};

export default TeacherDashboard;
