import React, { useState } from 'react';
import { Button } from './Button';

interface QuizProps {
  onComplete: () => void;
  addPoints: (amount: number) => void;
}

export const Quiz: React.FC<QuizProps> = ({ onComplete, addPoints }) => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);
  
  // New state for feedback
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const questions = [
    {
      question: "ما هو الزر الذي نضغطه للبدء بكتابة رسالة جديدة؟",
      options: ["حذف الرسالة", "بريد جديد (New Mail)", "الإعدادات"],
      correct: 1
    },
    {
      question: "ماذا يعني الخط الأحمر المتعرج تحت الكلمة؟",
      options: ["الكلمة صحيحة وممتازة", "تنسيق جميل", "يوجد خطأ إملائي يجب تصحيحه"],
      correct: 2
    },
    {
      question: "لإرسال نسخة مخفية من الرسالة لا يراها الآخرون نستخدم:",
      options: ["To (إلى)", "Cc (نسخة)", "Bcc (نسخة مخفية)"],
      correct: 2
    },
    {
      question: "وصلتك رسالة من شخص غريب تحتوي على رابط، ماذا تفعل؟",
      options: ["أفتح الرابط فوراً", "لا أفتحها وأخبر والدي أو المعلم", "أرسلها لأصدقائي"],
      correct: 1
    },
    {
      question: "لإضافة صورة جميلة إلى رسالتك، نذهب إلى تبويب:",
      options: ["إدراج (Insert)", "ملف (File)", "عرض (View)"],
      correct: 0
    }
  ];

  const handleAnswer = (index: number) => {
    if (isProcessing) return; // Prevent double clicks
    
    setIsProcessing(true);
    setSelectedOption(index);
    
    const isCorrect = index === questions[currentQuestion].correct;
    if (isCorrect) {
      setScore(s => s + 1);
      addPoints(20);
    }

    // Delay to show feedback
    setTimeout(() => {
        setIsProcessing(false);
        setSelectedOption(null);
        if (currentQuestion < questions.length - 1) {
          setCurrentQuestion(prev => prev + 1);
        } else {
          setShowResult(true);
        }
    }, 1500); // 1.5 second delay
  };

  const getButtonColor = (index: number) => {
      if (selectedOption === null) return "border-gray-200 hover:border-brand-blue hover:bg-blue-50"; // Default
      
      const correctIndex = questions[currentQuestion].correct;
      
      if (index === correctIndex) {
          return "bg-green-100 border-green-500 text-green-700 font-bold"; // Correct Answer (always show green if selected or revealed)
      }
      
      if (index === selectedOption && index !== correctIndex) {
          return "bg-red-100 border-red-500 text-red-700"; // Wrong selected
      }
      
      return "border-gray-200 opacity-50"; // Other options faded
  };

  if (showResult) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center animate-fade-in bg-white rounded-3xl shadow-xl max-w-2xl mx-auto border-4 border-brand-yellow">
        <div className="text-6xl mb-4">🏆</div>
        <h2 className="text-3xl font-bold text-brand-blue mb-4">انتهى الاختبار!</h2>
        <p className="text-xl mb-6">
          لقد أجبت بشكل صحيح على <span className="font-bold text-brand-green">{score}</span> من <span className="font-bold">{questions.length}</span> أسئلة.
        </p>
        <Button size="lg" onClick={onComplete}>استلام الشهادة</Button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto bg-white p-8 rounded-3xl shadow-xl border-t-8 border-brand-blue animate-fade-in">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-2xl font-bold text-gray-700">اختبار سريع: السؤال {currentQuestion + 1} من {questions.length}</h2>
        <span className="bg-blue-100 text-brand-blue px-3 py-1 rounded-full text-sm font-bold">ركز جيداً يا بطل</span>
      </div>

      <div className="mb-8">
        <h3 className="text-2xl font-bold text-gray-800 mb-6 leading-relaxed">
          {questions[currentQuestion].question}
        </h3>
        
        <div className="space-y-4">
          {questions[currentQuestion].options.map((option, idx) => (
            <button
              key={idx}
              onClick={() => handleAnswer(idx)}
              disabled={isProcessing}
              className={`w-full text-right p-4 rounded-xl border-2 transition-all text-lg font-medium flex items-center gap-3 ${getButtonColor(idx)}`}
            >
              <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${selectedOption !== null && idx === questions[currentQuestion].correct ? 'bg-green-500 text-white' : 'bg-gray-100 text-gray-500'}`}>
                {idx + 1}
              </span>
              {option}
              {selectedOption !== null && idx === questions[currentQuestion].correct && (
                  <span className="mr-auto text-green-600 text-2xl">✓</span>
              )}
              {selectedOption !== null && idx === selectedOption && idx !== questions[currentQuestion].correct && (
                  <span className="mr-auto text-red-600 text-2xl">✗</span>
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};