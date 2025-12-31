
import React, { useState, useEffect, useRef } from 'react';
import { Exam, StudentInfo, AnswerState, SubmittedAnswers } from '../types';
import { Clock, CheckCircle, Send, ChevronLeft, ChevronRight, FileText, AlertTriangle } from 'lucide-react';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

interface StudentExamProps {
  exam: Exam;
  studentInfo: StudentInfo;
  onFinish: () => void;
}

const StudentExam: React.FC<StudentExamProps> = ({ exam, studentInfo, onFinish }) => {
  const [timeLeft, setTimeLeft] = useState(exam.durationMinutes * 60);
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [answers, setAnswers] = useState<AnswerState>({});
  const [submittedQuestions, setSubmittedQuestions] = useState<SubmittedAnswers>({});
  const [isExamFinished, setIsExamFinished] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          handleFinishExam();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleAnswerChange = (sqId: string, value: string) => {
    setAnswers(prev => ({ ...prev, [sqId]: value }));
  };

  const submitQuestion = (qId: string) => {
    setSubmittedQuestions(prev => ({ ...prev, [qId]: true }));
  };

  const handleFinishExam = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setIsExamFinished(true);
  };

  const calculateScore = () => {
    let totalScore = 0;
    let maxScore = 0;
    exam.questions.forEach(q => {
      q.subQuestions.forEach(sq => {
        maxScore += sq.points;
        const studentAns = (answers[sq.id] || '').trim().toLowerCase();
        const correctAns = sq.correctAnswer.trim().toLowerCase();
        if (studentAns === correctAns && studentAns !== '') {
          totalScore += sq.points;
        }
      });
    });
    return { totalScore, maxScore };
  };

  const generatePDF = () => {
    const doc = new jsPDF();
    const { totalScore, maxScore } = calculateScore();

    // Header
    doc.setFontSize(22);
    doc.setTextColor(40);
    doc.text('IGCSE MATHEMATICS REPORT', 105, 20, { align: 'center' });
    
    // Student Info
    doc.setFontSize(12);
    doc.setTextColor(60);
    doc.text(`Student: ${studentInfo.name}`, 20, 40);
    doc.text(`Class: ${studentInfo.className}`, 20, 48);
    doc.text(`Date: ${new Date().toLocaleDateString()}`, 20, 56);
    doc.text(`Exam: ${exam.title}`, 20, 64);

    // Score Section
    doc.setFillColor(30, 41, 59);
    doc.rect(20, 75, 170, 25, 'F');
    doc.setTextColor(255);
    doc.setFontSize(16);
    doc.text(`TOTAL MARKS: ${totalScore} / ${maxScore}`, 105, 91, { align: 'center' });

    // Table
    const tableData = exam.questions.flatMap(q => 
      q.subQuestions.map(sq => {
        const studentAns = answers[sq.id] || '(Blank)';
        const isCorrect = studentAns.trim().toLowerCase() === sq.correctAnswer.trim().toLowerCase();
        return [
          `Q${q.number}(${sq.part})`,
          sq.text,
          studentAns,
          sq.correctAnswer,
          isCorrect ? sq.points : 0,
          sq.points
        ];
      })
    );

    autoTable(doc, {
      startY: 110,
      head: [['Ref', 'Task', 'Student Ans', 'Correct Ans', 'Marks', 'Max']],
      body: tableData,
      theme: 'grid',
      headStyles: { fillColor: [51, 65, 85] },
      styles: { fontSize: 9 }
    });

    doc.save(`${studentInfo.name}_${studentInfo.className}_Result.pdf`);
  };

  const currentQuestion = exam.questions[currentQuestionIdx];

  if (isExamFinished) {
    const { totalScore, maxScore } = calculateScore();
    return (
      <div className="flex-1 flex items-center justify-center p-6 bg-slate-100">
        <div className="bg-white max-w-2xl w-full p-12 rounded-[2.5rem] shadow-2xl border border-slate-200 text-center animate-in zoom-in duration-500">
          <div className="bg-green-100 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-8 text-green-600">
            <CheckCircle className="w-14 h-14" />
          </div>
          <h2 className="text-4xl font-black text-slate-800 mb-2">Exam Completed!</h2>
          <p className="text-slate-400 font-bold mb-10 text-lg uppercase tracking-widest">Hệ thống đã ghi nhận bài làm</p>
          
          <div className="grid grid-cols-2 gap-8 mb-12">
            <div className="bg-slate-50 p-8 rounded-3xl border border-slate-100 shadow-inner">
              <span className="block text-slate-400 text-xs font-black uppercase mb-2 tracking-widest">Earned Marks</span>
              <span className="text-5xl font-black text-blue-600">{totalScore} <span className="text-slate-200 text-xl">/ {maxScore}</span></span>
            </div>
            <div className="bg-slate-50 p-8 rounded-3xl border border-slate-100 shadow-inner">
              <span className="block text-slate-400 text-xs font-black uppercase mb-2 tracking-widest">Efficiency</span>
              <span className="text-5xl font-black text-slate-700">{maxScore > 0 ? Math.round((totalScore / maxScore) * 100) : 0}%</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={generatePDF}
              className="px-10 py-5 bg-blue-600 text-white rounded-2xl font-black flex items-center justify-center gap-3 hover:bg-blue-700 transition-all shadow-xl shadow-blue-100 transform hover:-translate-y-1"
            >
              <FileText className="w-6 h-6" />
              Download PDF Report
            </button>
            <button
              onClick={onFinish}
              className="px-10 py-5 bg-slate-900 text-white rounded-2xl font-black hover:bg-slate-800 transition-all shadow-xl"
            >
              Return to Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col md:flex-row h-[calc(100vh-64px)] overflow-hidden">
      {/* Sidebar Navigation */}
      <aside className="w-full md:w-80 bg-white border-r border-slate-200 flex flex-col shadow-sm">
        <div className="p-8 border-b border-slate-100">
          <div className="flex items-center gap-4 text-red-500 font-black mb-6 bg-red-50 p-5 rounded-2xl border border-red-100 shadow-sm">
            <Clock className="w-7 h-7" />
            <span className="text-3xl tabular-nums leading-none tracking-tight">{formatTime(timeLeft)}</span>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between items-end">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Tiến độ làm bài</p>
              <p className="text-[10px] font-black text-blue-600 uppercase">
                {Object.keys(submittedQuestions).length} / {exam.questions.length} Đã xong
              </p>
            </div>
            <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden shadow-inner">
              <div 
                className="bg-blue-600 h-full transition-all duration-1000 ease-out shadow-[0_0_10px_rgba(37,99,235,0.4)]"
                style={{ width: `${(Object.keys(submittedQuestions).length / exam.questions.length) * 100}%` }}
              ></div>
            </div>
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto p-8">
          <h3 className="text-[10px] font-black text-slate-300 mb-5 uppercase tracking-[0.2em]">Navigation Panel</h3>
          <div className="grid grid-cols-4 gap-4">
            {exam.questions.map((q, idx) => {
              const isSubmitted = submittedQuestions[q.id];
              const isCurrent = currentQuestionIdx === idx;
              
              return (
                <button
                  key={q.id}
                  onClick={() => setCurrentQuestionIdx(idx)}
                  className={`
                    h-14 w-full rounded-2xl font-black flex items-center justify-center transition-all border-2 text-base
                    ${isCurrent 
                      ? 'border-blue-600 bg-blue-50 text-blue-600 shadow-lg scale-110 z-10' 
                      : isSubmitted
                        ? 'border-green-600 bg-green-600 text-white shadow-md'
                        : 'border-slate-100 bg-white text-slate-400 hover:border-slate-300'
                    }
                  `}
                >
                  {q.number}
                </button>
              );
            })}
          </div>
        </div>

        <div className="p-8 border-t border-slate-100 bg-slate-50/50">
          <button
            onClick={() => {
              if (confirm('Xác nhận nộp bài thi? Vui lòng đảm bảo các câu hỏi đã được nhấn "Submit" để lưu bài.')) {
                handleFinishExam();
              }
            }}
            className="w-full bg-slate-900 text-white py-5 rounded-2xl font-black hover:bg-blue-600 transition-all flex items-center justify-center gap-3 shadow-2xl shadow-slate-300 active:scale-95"
          >
            <Send className="w-5 h-5" />
            Nộp bài thi
          </button>
        </div>
      </aside>

      {/* Question Canvas */}
      <section className="flex-1 bg-slate-50 overflow-y-auto p-6 md:p-12">
        <div className="max-w-4xl mx-auto space-y-10 pb-32">
          {/* Main Question Card */}
          <div className="bg-white rounded-[3rem] shadow-xl border border-slate-200 overflow-hidden animate-in fade-in slide-in-from-bottom-6 duration-700">
            <div className="p-12">
              <div className="flex items-center justify-between mb-10">
                <span className="bg-slate-100 text-slate-500 px-5 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest">
                  Question {currentQuestion.number} / {exam.questions.length}
                </span>
                {submittedQuestions[currentQuestion.id] && (
                  <div className="flex items-center gap-2 bg-green-100 text-green-700 px-5 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest border border-green-200">
                    <CheckCircle className="w-4 h-4" /> Đã lưu bài làm
                  </div>
                )}
              </div>
              
              <div className="text-3xl text-slate-800 mb-16 leading-relaxed font-bold tracking-tight">
                {currentQuestion.mainText}
              </div>

              <div className="space-y-16">
                {currentQuestion.subQuestions.map((sq) => (
                  <div key={sq.id} className="relative pl-12 border-l-4 border-slate-100 hover:border-blue-400 transition-colors duration-300">
                    <span className="absolute -left-4 top-0 bg-blue-600 text-white font-black px-2.5 py-1 rounded shadow-md text-xs italic">
                      {sq.part}
                    </span>
                    <div className="mb-8 text-xl text-slate-700 font-semibold leading-relaxed">
                      {sq.text} 
                      <span className="text-slate-400 ml-4 text-xs font-black uppercase tracking-[0.2em] border-l-2 border-slate-100 pl-4">
                        [{sq.points} Marks]
                      </span>
                    </div>
                    
                    <div className="space-y-3">
                      <label className="text-[10px] font-black text-slate-300 uppercase tracking-widest ml-1">Student Answer</label>
                      <input
                        type="text"
                        value={answers[sq.id] || ''}
                        onChange={(e) => handleAnswerChange(sq.id, e.target.value)}
                        className="w-full md:w-4/5 px-8 py-6 rounded-3xl border-2 border-slate-100 bg-white text-slate-900 focus:border-blue-600 focus:ring-8 focus:ring-blue-50 outline-none transition-all math-font text-3xl shadow-inner placeholder:text-slate-200"
                        placeholder="Type answer here..."
                        disabled={submittedQuestions[currentQuestion.id]}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-slate-50/50 px-12 py-10 border-t border-slate-100 flex flex-col sm:flex-row justify-between items-center gap-8">
              <button
                disabled={currentQuestionIdx === 0}
                onClick={() => setCurrentQuestionIdx(prev => prev - 1)}
                className="flex items-center gap-2 text-slate-400 font-black hover:text-blue-600 disabled:opacity-20 transition-all uppercase text-[10px] tracking-widest order-2 sm:order-1"
              >
                <ChevronLeft className="w-5 h-5" />
                Previous
              </button>

              <button
                onClick={() => submitQuestion(currentQuestion.id)}
                className={`
                  px-16 py-6 rounded-[2.5rem] font-black flex items-center justify-center gap-4 transition-all shadow-2xl order-1 sm:order-2 w-full sm:w-auto text-lg
                  ${submittedQuestions[currentQuestion.id]
                    ? 'bg-green-600 text-white shadow-green-100 scale-105'
                    : 'bg-blue-600 text-white hover:bg-blue-700 shadow-blue-200 transform hover:-translate-y-1 active:scale-95'
                  }
                `}
              >
                {submittedQuestions[currentQuestion.id] ? (
                  <>
                    <CheckCircle className="w-7 h-7" />
                    Đã lưu bài (Sửa lại)
                  </>
                ) : (
                  <>
                    <Send className="w-7 h-7" />
                    Submit Question {currentQuestion.number}
                  </>
                )}
              </button>

              <button
                disabled={currentQuestionIdx === exam.questions.length - 1}
                onClick={() => setCurrentQuestionIdx(prev => prev + 1)}
                className="flex items-center gap-2 text-slate-400 font-black hover:text-blue-600 disabled:opacity-20 transition-all uppercase text-[10px] tracking-widest order-3"
              >
                Next
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="flex items-start gap-6 bg-blue-50 border-2 border-blue-100 p-8 rounded-[3rem] shadow-sm">
            <AlertTriangle className="text-blue-500 w-8 h-8 mt-1 flex-shrink-0" />
            <div className="space-y-2">
              <p className="text-blue-900 text-xs font-black uppercase tracking-widest">Exam Guidelines</p>
              <p className="text-blue-700/80 text-sm font-medium leading-relaxed italic">
                Hãy nhấn nút <b>"Submit Question"</b> sau khi trả lời xong từng câu hỏi. Hệ thống sẽ lưu bài làm và đánh dấu <b>MÀU XANH</b> trên bảng điều khiển bên trái để bạn dễ dàng theo dõi.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default StudentExam;
