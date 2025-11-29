import React, { useState, useEffect } from 'react';
import { EmailSimulator } from './components/EmailSimulator';
import { Certificate } from './components/Certificate';
import { Assistant } from './components/Assistant';
import { Button } from './components/Button';
import { GameStage, Contact } from './types';
import { generateMysteryReply } from './services/geminiService';
import { Quiz } from './components/Quiz';
import { MissionModal } from './components/MissionModal';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { ScormService } from './services/scormService';

function App() {
  const [stage, setStage] = useState<GameStage>(GameStage.INTRO);
  const [score, setScore] = useState(0);
  const [studentName, setStudentName] = useState('');
  const [showMissionModal, setShowMissionModal] = useState(false);
  const [contacts, setContacts] = useState<Contact[]>([
      { id: '1', name: 'أحمد (زميل الدراسة)', email: 'ahmed@school.com', avatar: 'https://picsum.photos/seed/ahmed/50/50', isFavorite: false },
      { id: '2', name: 'الأستاذ أسعد الذهلي', email: 'asaad4059@moe.om', avatar: 'https://ui-avatars.com/api/?name=Asaad+Al+Dhahli&background=4F46E5&color=fff', isFavorite: true }
  ]);
  const [mysteryReply, setMysteryReply] = useState<{subject: string, body: string} | null>(null);

  // Initialize SCORM on load
  useEffect(() => {
    ScormService.init();
    
    // Cleanup on unmount
    return () => {
      ScormService.terminate();
    };
  }, []);

  // Lesson content based on the provided text
  const lessonContent: Record<string, string> = {
    [GameStage.BASICS]: "لإنشاء رسالة، نبدأ بـ 'بريد جديد'. املأ حقل 'إلى' للمستلم، وحقل 'الموضوع' لعنوان مختصر، ثم اكتب رسالتك. تذكر: الوضوح مهم!",
    [GameStage.SPELL_CHECK]: "الخط الأحمر المموج يعني وجود خطأ إملائي. انقر عليه بزر الفأرة الأيمن لتصحيحه. الرسالة الخالية من الأخطاء تعكس احترامك للمستلم.",
    [GameStage.FORMATTING_IMAGES]: "اجعل رسالتك جذابة! استخدم تبويب 'تنسيق' لتغيير الخط، و'إدراج' لإضافة صور. يمكنك تعديل الصور (قص، ظل) من 'تنسيق الصورة'.",
    [GameStage.CONTACTS_MANAGEMENT]: "بدلاً من كتابة العناوين كل مرة، احفظ أصدقاءك في 'الأشخاص' (Contacts). يمكنك إضافتهم للمفضلة للوصول السريع.",
    [GameStage.ADVANCED_CC_BCC]: "استخدم (Cc) للشفافية (الكل يرى المستلمين)، و(Bcc) للخصوصية (لا أحد يرى القائمة). احذر من رسائل الغرباء!",
    [GameStage.QUIZ]: "الآن حان وقت التحدي! أجب عن الأسئلة لتحصل على الشهادة.",
  };

  const handleNextStage = () => {
    let nextStage = stage;
    switch (stage) {
      case GameStage.INTRO: 
        nextStage = GameStage.BASICS;
        setShowMissionModal(true);
        break;
      case GameStage.BASICS: 
        generateMysteryReply(studentName || "صديقي").then(setMysteryReply);
        setScore(s => s + 50);
        nextStage = GameStage.SPELL_CHECK; 
        setShowMissionModal(true);
        break;
      case GameStage.SPELL_CHECK: 
        nextStage = GameStage.FORMATTING_IMAGES; 
        setScore(s => s + 50); 
        setShowMissionModal(true);
        break;
      case GameStage.FORMATTING_IMAGES: 
        nextStage = GameStage.CONTACTS_MANAGEMENT; 
        setScore(s => s + 50); 
        setShowMissionModal(true);
        break;
      case GameStage.CONTACTS_MANAGEMENT: 
        nextStage = GameStage.ADVANCED_CC_BCC; 
        setScore(s => s + 50); 
        setShowMissionModal(true);
        break;
      case GameStage.ADVANCED_CC_BCC: 
        nextStage = GameStage.QUIZ;
        setScore(s => s + 50); 
        setShowMissionModal(false); // No mission modal for quiz
        break;
      case GameStage.QUIZ:
        nextStage = GameStage.CERTIFICATE;
        setScore(s => s + 100);
        // SCORM: Mark as passed when quiz is done and moving to certificate
        ScormService.setCompletionStatus("passed");
        // Calculate a rough score percentage (Total points possible is roughly 350-400)
        // Sending raw score to LMS
        ScormService.setScore(Math.min(score + 100, 100), 100); 
        break;
      default: break;
    }
    setStage(nextStage);
  };

  const scoreData = [
    { name: 'الإنشاء', value: score * 0.3 },
    { name: 'التنسيق', value: score * 0.4 },
    { name: 'الإدارة والأمان', value: score * 0.3 },
  ];

  if (stage === GameStage.CERTIFICATE) {
    return <Certificate studentName={studentName || "المتعلم الذكي"} onRestart={() => { setStage(GameStage.INTRO); setScore(0); ScormService.init(); }} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-100 text-gray-800 font-sans flex flex-col">
      {/* Mission Modal Overlay */}
      {showMissionModal && (
        <MissionModal stage={stage} onStart={() => setShowMissionModal(false)} />
      )}

      <div className="flex-grow pb-8">
        {/* Top Bar */}
        <div className="bg-white shadow-sm p-4 flex justify-between items-center px-4 md:px-8">
          <h1 className="text-lg md:text-2xl font-black text-brand-blue flex items-center gap-2">
              📧 درس تنسيق وإدارة البريد الإلكتروني
          </h1>
          <div className="flex items-center gap-4">
              <div className="bg-brand-yellow px-4 py-1 rounded-full font-bold text-white shadow-sm hidden md:block">
                  النقاط: {score}
              </div>
               {/* Progress Bar */}
               <div className="w-24 md:w-32 h-3 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                      className="h-full bg-brand-green transition-all duration-500" 
                      style={{ width: `${(Object.keys(GameStage).indexOf(stage) / 7) * 100}%` }}
                  ></div>
              </div>
          </div>
        </div>

        {/* Intro Screen */}
        {stage === GameStage.INTRO && (
          <div className="flex flex-col items-center justify-center min-h-[80vh] text-center p-4">
              <div className="bg-white p-10 rounded-3xl shadow-2xl max-w-2xl w-full border-b-8 border-brand-blue">
                  <div className="mb-6 bg-blue-100 w-32 h-32 rounded-full flex items-center justify-center mx-auto text-6xl animate-bounce">
                      🚀
                  </div>
                  <h2 className="text-3xl font-bold mb-4 text-brand-blue">تنسيق وإدارة البريد الإلكتروني</h2>
                  <p className="text-gray-600 mb-8 text-lg leading-relaxed">
                      أهلاً بك! البريد الإلكتروني ليس مجرد رسائل، بل هو هويتك الرقمية.
                      <br/>
                      سنتعلم اليوم كيفية تنسيق الرسائل، تصحيح الأخطاء، وإدارة جهات الاتصال باحترافية وأمان.
                  </p>
                  <div className="mb-6 bg-red-50 p-4 rounded-lg border border-red-200 text-sm text-red-700 font-bold">
                      ⚠️ تحذير أمني هام: لا تفتح أبداً رسائل أو مرفقات من غرباء لتجنب الفيروسات!
                  </div>
                  <input 
                      type="text"
                      placeholder="اكتب اسمك لتبدأ المهمة"
                      className="border-2 border-gray-300 rounded-xl px-4 py-3 text-xl w-full mb-6 focus:border-brand-blue outline-none text-center"
                      value={studentName}
                      onChange={(e) => setStudentName(e.target.value)}
                  />
                  <Button 
                      size="lg" 
                      onClick={handleNextStage} 
                      disabled={!studentName}
                      className="w-full"
                  >
                      ابدأ الدرس
                  </Button>
              </div>
          </div>
        )}

        {/* Quiz Stage */}
        {stage === GameStage.QUIZ && (
          <div className="container mx-auto px-4 py-8">
            <Quiz onComplete={handleNextStage} addPoints={(p) => setScore(s => s + p)} />
          </div>
        )}

        {/* Main Game Loop */}
        {stage !== GameStage.INTRO && stage !== GameStage.QUIZ && (
            <div className={`container mx-auto px-2 md:px-4 py-8 ${showMissionModal ? 'blur-sm pointer-events-none' : ''}`}>
                
                {/* Mystery Reply Notification */}
                {mysteryReply && stage === GameStage.SPELL_CHECK && (
                    <div className="mb-6 bg-white border-l-4 border-brand-green p-4 rounded shadow-md animate-fade-in flex items-start gap-4">
                        <div className="bg-green-100 p-2 rounded-full">📬</div>
                        <div>
                          <h4 className="font-bold text-brand-green mb-1">وصلك رد جديد!</h4>
                          <p className="font-bold text-sm">{mysteryReply.subject}</p>
                          <p className="text-gray-600 text-sm">{mysteryReply.body}</p>
                        </div>
                    </div>
                )}

                <EmailSimulator 
                  stage={stage} 
                  onCompleteStage={handleNextStage}
                  addPoints={(p) => setScore(prev => prev + p)}
                  contacts={contacts}
                  onAddContact={(c) => setContacts(prev => [...prev, c])}
                />
                
                <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Stats */}
                    <div className="bg-white p-4 rounded-xl shadow-sm h-48 md:col-span-1">
                        <h3 className="text-sm font-bold text-gray-500 mb-2">إحصائيات المهارة</h3>
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={scoreData}>
                              <XAxis dataKey="name" fontSize={10} tick={{fill: '#666'}} />
                              <YAxis hide />
                              <Tooltip cursor={{fill: 'transparent'}} />
                              <Bar dataKey="value" radius={[10, 10, 0, 0]}>
                                  {scoreData.map((entry, index) => (
                                      <Cell key={`cell-${index}`} fill={['#4F46E5', '#FBBF24', '#10B981'][index % 3]} />
                                  ))}
                              </Bar>
                          </BarChart>
                        </ResponsiveContainer>
                    </div>
                    
                    {/* Tips Box */}
                    <div className="bg-white p-6 rounded-xl shadow-sm md:col-span-2 flex items-center gap-4 border-r-4 border-brand-yellow">
                         <div className="text-4xl">💡</div>
                         <div>
                             <h3 className="font-bold text-brand-blue mb-2">هل تعلم؟</h3>
                             <p className="text-sm text-gray-600 leading-relaxed">
                                 {stage === GameStage.FORMATTING_IMAGES && "يمكنك إدراج صور متعددة بالضغط على زر Ctrl أثناء الاختيار."}
                                 {stage === GameStage.CONTACTS_MANAGEMENT && "زر 'الأشخاص' يتيح لك تنظيم دفتر العناوين وإضافة الأصدقاء للمفضلة."}
                                 {stage === GameStage.ADVANCED_CC_BCC && "الفرق الجوهري: Bcc تحافظ على خصوصية المستلمين، بينما Cc تجعل الجميع يرى بعضهم."}
                                 {stage === GameStage.BASICS && "الموضوع الجيد (Subject) يساعد المستلم على فهم محتوى الرسالة قبل فتحها."}
                                 {stage === GameStage.SPELL_CHECK && "التدقيق الإملائي ليس مجرد تصحيح، بل هو احترام لوقت القارئ."}
                             </p>
                         </div>
                    </div>
                </div>

                <Assistant message={lessonContent[stage] || "أنت تبلي بلاءً حسناً!"} />
            </div>
        )}
      </div>

      <footer className="w-full py-4 text-center text-gray-500 text-sm font-bold bg-white border-t mt-auto print:hidden">
        مطور الموقع: أ. أسعد الذهلي
      </footer>
    </div>
  );
}

export default App;