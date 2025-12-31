
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
  // Fix: Use ReturnType<typeof setInterval> instead of NodeJS.Timeout to avoid missing namespace error in browser environment
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
        if (answers[sq.id]?.trim().toLowerCase() === sq.correctAnswer.trim().toLowerCase()) {
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
    doc.text('EXAM REPORT', 105, 20, { align: 'center' });
    
    // Student Info
    doc.setFontSize(12);
    doc.text(`Student: ${studentInfo.name}`, 20, 40);
    doc.text(`Class: ${studentInfo.className}`, 20, 48);
    doc.text(`Date: ${new Date().toLocaleDateString()}`, 20, 56);
    doc.text(`Exam: ${exam.title}`, 20, 64);

    // Score Banner
    doc.setFillColor(59, 130, 246);
    doc.rect(20, 75, 170, 25, 'F');
    doc.setTextColor(255);
    doc.setFontSize(16);
    doc.text(`TOTAL SCORE: ${totalScore} / ${maxScore}`, 105, 91, { align: 'center' });

    // Table Data
    const tableData = exam.questions.flatMap(q => 
      q.subQuestions.map(sq => [
        `Q${q.number}${sq.part}`,
        sq.text,
        answers[sq.id] || '(No Answer)',
        sq.correctAnswer,
        answers[sq.id]?.trim().toLowerCase() === sq.correctAnswer.trim().toLowerCase() ? sq.points : 0,
        sq.points
      ])
    );

    autoTable(doc, {
      startY: 110,
      head: [['Question', 'Task', 'Your Answer', 'Correct Answer', 'Earned', 'Max']],
      body: tableData,
      theme: 'grid',
      headStyles: { fillColor: [51, 65, 85] }
    });

    doc.save(`${studentInfo.name}_${studentInfo.className}_IGCSE_Result.pdf`);
  };

  const currentQuestion = exam.questions[currentQuestionIdx];

  if (isExamFinished) {
    const { totalScore, maxScore } = calculateScore();
    return (
      <div className="flex-1 flex items-center justify-center p-6 bg-slate-100">
        <div className="bg-white max-w-2xl w-full p-10 rounded-3xl shadow-2xl border border-slate-200 text-center">
          <div className="bg-green-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 text-green-600">
            <CheckCircle className="w-12 h-12" />
          </div>
          <h2 className="text-3xl font-bold text-slate-800 mb-2">Exam Completed!</h2>
          <p className="text-slate-500 mb-8">Well done, {studentInfo.name}. You have finished the exam.</p>
          
          <div className="grid grid-cols-2 gap-6 mb-10">
            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
              <span className="block text-slate-400 text-sm font-bold uppercase mb-1">Total Score</span>
              <span className="text-4xl font-black text-blue-600">{totalScore} <span className="text-slate-300 text-lg">/ {maxScore}</span></span>
            </div>
            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
              <span className="block text-slate-400 text-sm font-bold uppercase mb-1">Percentage</span>
              <span className="text-4xl font-black text-slate-700">{Math.round((totalScore / maxScore) * 100)}%</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={generatePDF}
              className="px-8 py-4 bg-blue-600 text-white rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-blue-700 transition-all shadow-lg shadow-blue-100"
            >
              <FileText className="w-5 h-5" />
              Download PDF Report
            </button>
            <button
              onClick={onFinish}
              className="px-8 py-4 bg-slate-200 text-slate-700 rounded-2xl font-bold hover:bg-slate-300 transition-all"
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
      <aside className="w-full md:w-80 bg-white border-r border-slate-200 flex flex-col">
        <div className="p-6 border-b border-slate-100">
          <div className="flex items-center gap-3 text-red-500 font-bold mb-4 bg-red-50 p-3 rounded-xl border border-red-100">
            <Clock className="w-5 h-5" />
            <span className="text-xl tabular-nums">{formatTime(timeLeft)}</span>
          </div>
          <div className="space-y-1">
            <p className="text-xs font-bold text-slate-400 uppercase">Current Progress</p>
            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
              <div 
                className="bg-blue-600 h-full transition-all duration-500"
                style={{ width: `${(Object.keys(submittedQuestions).length / exam.questions.length) * 100}%` }}
              ></div>
            </div>
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto p-6">
          <h3 className="text-sm font-bold text-slate-700 mb-4 uppercase">Question Navigation</h3>
          <div className="grid grid-cols-4 gap-3">
            {exam.questions.map((q, idx) => (
              <button
                key={q.id}
                onClick={() => setCurrentQuestionIdx(idx)}
                className={`
                  h-12 w-full rounded-xl font-bold flex items-center justify-center transition-all border-2
                  ${currentQuestionIdx === idx 
                    ? 'border-blue-600 bg-blue-50 text-blue-600 ring-2 ring-blue-100' 
                    : submittedQuestions[q.id]
                      ? 'border-green-500 bg-green-50 text-green-600'
                      : 'border-slate-100 bg-white text-slate-400 hover:border-slate-300 hover:text-slate-600'
                  }
                `}
              >
                {q.number}
              </button>
            ))}
          </div>
        </div>

        <div className="p-6 border-t border-slate-100">
          <button
            onClick={() => {
              if (confirm('Are you sure you want to finish the exam? Any unsubmitted questions will not be saved.')) {
                handleFinishExam();
              }
            }}
            className="w-full bg-slate-800 text-white py-4 rounded-2xl font-bold hover:bg-slate-900 transition-all flex items-center justify-center gap-2"
          >
            <Send className="w-5 h-5" />
            Finish & Submit
          </button>
        </div>
      </aside>

      {/* Question Canvas */}
      <section className="flex-1 bg-slate-50 overflow-y-auto p-4 md:p-8">
        <div className="max-w-3xl mx-auto space-y-6 pb-12">
          {/* Main Question Card */}
          <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="p-8">
              <div className="flex items-center gap-2 mb-6">
                <span className="bg-slate-100 text-slate-600 px-3 py-1 rounded-lg text-sm font-bold">
                  Question {currentQuestion.number} of {exam.questions.length}
                </span>
                {submittedQuestions[currentQuestion.id] && (
                  <span className="bg-green-100 text-green-600 px-3 py-1 rounded-lg text-sm font-bold flex items-center gap-1">
                    <CheckCircle className="w-4 h-4" /> Submitted
                  </span>
                )}
              </div>
              
              <div className="text-xl text-slate-800 mb-8 leading-relaxed font-medium">
                {currentQuestion.mainText}
              </div>

              <div className="space-y-10">
                {currentQuestion.subQuestions.map((sq) => (
                  <div key={sq.id} className="relative pl-8 border-l-2 border-slate-100">
                    <span className="absolute -left-2 top-0 bg-white text-blue-600 font-bold pr-2">
                      ({sq.part})
                    </span>
                    <div className="mb-4 text-slate-700">
                      {sq.text} 
                      <span className="text-slate-400 ml-2 font-medium">[{sq.points} marks]</span>
                    </div>
                    
                    <div className="flex flex-col gap-2">
                      <label className="text-xs font-bold text-slate-400 uppercase">Your Answer</label>
                      <input
                        type="text"
                        value={answers[sq.id] || ''}
                        onChange={(e) => handleAnswerChange(sq.id, e.target.value)}
                        className="w-full md:w-2/3 px-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-900 focus:ring-2 focus:ring-blue-500 outline-none transition-all math-font text-lg"
                        placeholder="Type answer here..."
                        disabled={submittedQuestions[currentQuestion.id]}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-slate-50 px-8 py-6 border-t border-slate-100 flex justify-between items-center">
              <button
                disabled={currentQuestionIdx === 0}
                onClick={() => setCurrentQuestionIdx(prev => prev - 1)}
                className="flex items-center gap-2 text-slate-500 font-bold hover:text-blue-600 disabled:opacity-30 transition-all"
              >
                <ChevronLeft className="w-5 h-5" />
                Previous
              </button>

              <button
                onClick={() => submitQuestion(currentQuestion.id)}
                className={`
                  px-8 py-3 rounded-xl font-bold flex items-center gap-2 transition-all shadow-md
                  ${submittedQuestions[currentQuestion.id]
                    ? 'bg-green-100 text-green-700 border border-green-200'
                    : 'bg-blue-600 text-white hover:bg-blue-700 shadow-blue-100'
                  }
                `}
              >
                {submittedQuestions[currentQuestion.id] ? (
                  <>Update Answer</>
                ) : (
                  <>Submit Question {currentQuestion.number}</>
                )}
              </button>

              <button
                disabled={currentQuestionIdx === exam.questions.length - 1}
                onClick={() => setCurrentQuestionIdx(prev => prev + 1)}
                className="flex items-center gap-2 text-slate-500 font-bold hover:text-blue-600 disabled:opacity-30 transition-all"
              >
                Next
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="flex items-start gap-3 bg-amber-50 border border-amber-100 p-4 rounded-2xl">
            <AlertTriangle className="text-amber-500 w-5 h-5 mt-0.5 flex-shrink-0" />
            <p className="text-amber-800 text-sm">
              <span className="font-bold">Important:</span> Make sure to click "Submit Question" for each question after answering. You can change your answers anytime before the final "Finish & Submit" button.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default StudentExam;
