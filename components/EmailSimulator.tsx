import React, { useState } from 'react';
import { Button } from './Button';
import { Contact, EmailState, GameStage, CorrectionTask } from '../types';
import { checkEmailPoliteness } from '../services/geminiService';

interface EmailSimulatorProps {
  stage: GameStage;
  onCompleteStage: () => void;
  addPoints: (amount: number) => void;
  contacts: Contact[];
  onAddContact: (contact: Contact) => void;
}

// Updated sentence broken into parts
const spellCheckTasks: CorrectionTask[] = [
    { id: 1, preText: "أنا ", wrongWord: "احب", correctWord: "أحب", postText: " ", isFixed: false },
    { id: 2, preText: "", wrongWord: "وطنني", correctWord: "وطني", postText: " ومعلميني ومدرستي، ", isFixed: false },
    { id: 3, preText: "", wrongWord: "واسعى", correctWord: "وأسعى", postText: " ", isFixed: false },
    { id: 4, preText: "", wrongWord: "دايماً", correctWord: "دائماً", postText: " ", isFixed: false },
    { id: 5, preText: "", wrongWord: "لاكون", correctWord: "لأكون", postText: " ", isFixed: false },
    { id: 6, preText: "", wrongWord: "افضل", correctWord: "أفضل", postText: " ", isFixed: false },
    { id: 7, preText: "", wrongWord: "نسخه", correctWord: "نسخة", postText: " مني، ", isFixed: false },
    { id: 8, preText: "", wrongWord: "وان", correctWord: "وأن", postText: " ", isFixed: false },
    { id: 9, preText: "", wrongWord: "ارضي", correctWord: "أرضي", postText: " ربي وأهلي.", isFixed: false },
];

export const EmailSimulator: React.FC<EmailSimulatorProps> = ({ 
  stage, 
  onCompleteStage, 
  addPoints,
  contacts,
  onAddContact
}) => {
  const [activeTab, setActiveTab] = useState<'mail' | 'people'>('mail');
  const [email, setEmail] = useState<EmailState>({
    to: '',
    subject: '',
    body: '',
    cc: '',
    bcc: '',
    hasAttachment: false,
    imageStyle: 'none',
    isFormatted: false,
    isBold: false,
    isItalic: false,
    isUnderline: false,
    textColor: 'black',
  });

  const [corrections, setCorrections] = useState<CorrectionTask[]>(spellCheckTasks);
  const [showSpellMenu, setShowSpellMenu] = useState<{id: number, x: number, y: number} | null>(null);
  const [newContactName, setNewContactName] = useState('');
  const [newContactEmail, setNewContactEmail] = useState('');
  const [showFeedback, setShowFeedback] = useState<string | null>(null);
  const [feedbackLoading, setFeedbackLoading] = useState(false);
  const [toolbarTab, setToolbarTab] = useState<'home' | 'insert' | 'format' | 'picFormat'>('home');
  const [showInsertModal, setShowInsertModal] = useState(false);

  // Sync tab with stage for guidance
  React.useEffect(() => {
    if (stage === GameStage.CONTACTS_MANAGEMENT) setActiveTab('people');
    else setActiveTab('mail');
    
    if (stage === GameStage.FORMATTING_IMAGES) {
        // Only set tab initially, user can switch
        // setToolbarTab('format'); 
    }
  }, [stage]);

  // Handlers
  const handleChange = (field: keyof EmailState, value: string) => {
    setEmail(prev => ({ ...prev, [field]: value }));
  };

  const handleFormatStyle = (style: 'bold' | 'italic' | 'underline') => {
      if (style === 'bold') setEmail(prev => ({ ...prev, isBold: !prev.isBold }));
      if (style === 'italic') setEmail(prev => ({ ...prev, isItalic: !prev.isItalic }));
      if (style === 'underline') setEmail(prev => ({ ...prev, isUnderline: !prev.isUnderline }));
      
      if (!email.isFormatted) {
          setEmail(prev => ({ ...prev, isFormatted: true }));
          addPoints(10);
      }
  };

  const handleColorChange = (color: string) => {
      setEmail(prev => ({ ...prev, textColor: color, isFormatted: true }));
      if (!email.isFormatted) addPoints(10);
  }

  const handleApplyImageStyle = (style: 'shadow' | 'border') => {
      setEmail(prev => ({ ...prev, imageStyle: style }));
      addPoints(10);
  }

  const handleAttach = () => {
    setShowInsertModal(true);
  };

  const confirmAttach = () => {
      setShowInsertModal(false);
      if (!email.hasAttachment) {
        addPoints(20);
        setEmail(prev => ({ ...prev, hasAttachment: true }));
        setToolbarTab('picFormat'); // Auto switch to picture format
        setShowFeedback("ممتاز! الآن اختر نمطاً للصورة (ظل أو إطار)");
        setTimeout(() => setShowFeedback(null), 3000);
      }
  }

  // Template and Clear Logic
  const handleLoadTemplate = () => {
    setEmail(prev => ({
        ...prev,
        to: 'asaad4059@moe.om',
        subject: 'رسالة عن درس الذكاء الاصطناعي',
        body: 'السلام عليكم ورحمة الله، أستاذ أسعد، أشكرك على الدرس القيم، في الحصة الماضية تعلمت عن تطبيقات الذكاء الاصطناعي واستطعت البدأ في محادثة شيقة مع الذكاء الاصطناعي.'
    }));
  };

  const handleClear = () => {
    setEmail({
        to: '', 
        subject: '', 
        body: '', 
        cc: '', 
        bcc: '', 
        hasAttachment: false, 
        imageStyle: 'none', 
        isFormatted: false,
        isBold: false, isItalic: false, isUnderline: false, textColor: 'black'
    });
  };

  // Spell Check Logic
  const handleWordClick = (task: CorrectionTask, e: React.MouseEvent) => {
    if (task.isFixed) return;
    e.preventDefault(); 
    e.stopPropagation();
    // Calculate position relative to viewport or container
    setShowSpellMenu({ id: task.id, x: e.clientX, y: e.clientY });
  };

  const applyCorrection = (id: number) => {
    setCorrections(prev => prev.map(t => t.id === id ? { ...t, isFixed: true } : t));
    setShowSpellMenu(null);
    addPoints(10);
  };

  // Contact Logic
  const handleAddContact = () => {
    if (newContactName && newContactEmail) {
      onAddContact({
        id: Date.now().toString(),
        name: newContactName,
        email: newContactEmail,
        avatar: `https://picsum.photos/seed/${newContactName}/50/50`,
        isFavorite: false
      });
      setNewContactName('');
      setNewContactEmail('');
      addPoints(30);
    }
  };
  
  const toggleFavorite = (id: string) => {
      addPoints(5);
  }

  // Stage Completion Checkers
  const checkBasics = () => {
    if (email.to && email.subject && email.body) {
      onCompleteStage();
    } else {
        setShowFeedback("تأكد من ملء: إلى، الموضوع، والرسالة.");
        setTimeout(() => setShowFeedback(null), 3000);
    }
  };

  const checkSpellCheck = () => {
    if (corrections.every(c => c.isFixed)) {
      onCompleteStage();
    } else {
        setShowFeedback("لا تزال هناك أخطاء إملائية (كلمات حمراء). اضغط عليها لتصحيحها.");
        setTimeout(() => setShowFeedback(null), 3000);
    }
  };

  const checkFormatting = () => {
    const hasTextFormat = email.isBold || email.isItalic || email.isUnderline || email.textColor !== 'black';
    const hasImageFormat = email.hasAttachment && email.imageStyle !== 'none';

    if (hasTextFormat && hasImageFormat) {
      onCompleteStage();
    } else if (hasImageFormat && !hasTextFormat) {
        setShowFeedback("أحسنت في تنسيق الصورة! الآن اذهب لتبويب 'تنسيق النص' وغير لون أو شكل الكتابة.");
        setToolbarTab('format'); // Auto redirect
        setTimeout(() => setShowFeedback(null), 4000);
    } else if (hasTextFormat && !hasImageFormat) {
        setShowFeedback("النص جميل! الآن اذهب لتبويب 'إدراج' وأضف صورة.");
        setToolbarTab('insert');
        setTimeout(() => setShowFeedback(null), 4000);
    } else {
        setShowFeedback("استخدم أدوات التنسيق وإدراج الصور.");
        setTimeout(() => setShowFeedback(null), 3000);
    }
  };
  
  const checkContacts = () => {
      if (contacts.length >= 2) {
          onCompleteStage();
      } else {
           setShowFeedback("أضف جهة اتصال جديدة للحفظ.");
           setTimeout(() => setShowFeedback(null), 3000);
      }
  }

  const checkAdvanced = async () => {
      if (!email.cc && !email.bcc) {
           setShowFeedback("جرب استخدام Cc أو Bcc.");
           setTimeout(() => setShowFeedback(null), 3000);
           return;
      }

      setFeedbackLoading(true);
      const feedback = await checkEmailPoliteness(email.subject, email.body);
      setFeedbackLoading(false);
      setShowFeedback(feedback);
      
      setTimeout(() => {
        setShowFeedback(null);
        onCompleteStage();
      }, 4000);
  };

  return (
    <div className="w-full max-w-5xl mx-auto bg-white rounded-xl shadow-2xl overflow-hidden border border-gray-200 flex h-[600px] animate-fade-in" onClick={() => setShowSpellMenu(null)}>
      
      {/* Side Rail */}
      <div className="w-16 bg-gray-100 border-l border-gray-200 flex flex-col items-center py-4 gap-6">
          <button 
            onClick={() => setActiveTab('mail')}
            className={`p-3 rounded-xl transition ${activeTab === 'mail' ? 'bg-brand-blue text-white shadow-lg' : 'text-gray-500 hover:bg-gray-200'}`}
          >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
             </svg>
          </button>
          <button 
             onClick={() => setActiveTab('people')}
             className={`p-3 rounded-xl transition ${activeTab === 'people' ? 'bg-brand-blue text-white shadow-lg' : 'text-gray-500 hover:bg-gray-200'}`}
          >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
             </svg>
          </button>
      </div>

      <div className="flex-1 flex flex-col relative">
          
          {/* Top Toolbar */}
          {activeTab === 'mail' && (
              <div className="bg-brand-blue text-white">
                  <div className="flex text-xs font-bold px-2 pt-2 gap-1">
                      {['home', 'insert', 'format', 'picFormat'].map((t) => (
                           <button 
                            key={t}
                            onClick={() => setToolbarTab(t as any)}
                            className={`px-4 py-2 rounded-t-lg transition ${toolbarTab === t ? 'bg-white text-brand-blue' : 'text-blue-100 hover:bg-blue-700'}`}
                            disabled={t === 'picFormat' && !email.hasAttachment}
                           >
                               {t === 'home' && 'الشريط الرئيسي'}
                               {t === 'insert' && 'إدراج'}
                               {t === 'format' && 'تنسيق النص'}
                               {t === 'picFormat' && 'تنسيق الصورة'}
                           </button>
                      ))}
                  </div>
                  <div className="bg-white text-gray-800 p-3 shadow-md border-b flex items-center gap-4 h-16">
                      {toolbarTab === 'home' && (
                          <div className="flex items-center gap-4">
                              <button onClick={handleClear} className="flex flex-col items-center gap-1 hover:bg-gray-100 p-1 rounded min-w-[60px]">
                                  <span className="text-xl">📄</span>
                                  <span className="text-[10px]">تفريغ</span>
                              </button>
                              <button onClick={handleLoadTemplate} className="flex flex-col items-center gap-1 hover:bg-gray-100 p-1 rounded min-w-[60px]">
                                  <span className="text-xl">📝</span>
                                  <span className="text-[10px]">نموذج جاهز</span>
                              </button>
                              <div className="h-8 w-px bg-gray-300"></div>
                              <Button size="sm" onClick={() => {
                                  if (stage === GameStage.BASICS) checkBasics();
                                  if (stage === GameStage.SPELL_CHECK) checkSpellCheck();
                                  if (stage === GameStage.ADVANCED_CC_BCC) checkAdvanced();
                              }} disabled={feedbackLoading}>
                                  {feedbackLoading ? 'جاري الإرسال...' : 'إرسال'}
                              </Button>
                          </div>
                      )}
                       {toolbarTab === 'insert' && (
                          <div className="flex items-center gap-4">
                              <button onClick={handleAttach} className="flex flex-col items-center gap-1 hover:bg-gray-100 p-2 rounded border border-transparent hover:border-gray-200">
                                  <span className="text-xl">🖼️</span>
                                  <span className="text-xs font-bold">صور</span>
                              </button>
                              {stage === GameStage.FORMATTING_IMAGES && (
                                   <Button size="sm" variant="success" onClick={checkFormatting}>تحقق من التنسيق</Button>
                              )}
                          </div>
                      )}
                      {toolbarTab === 'format' && (
                           <div className="flex items-center gap-2">
                               <button 
                                onClick={() => handleFormatStyle('bold')} 
                                className={`p-2 rounded font-bold w-8 h-8 flex items-center justify-center ${email.isBold ? 'bg-gray-300 shadow-inner' : 'hover:bg-gray-100'}`}
                               >B</button>
                               <button 
                                onClick={() => handleFormatStyle('italic')} 
                                className={`p-2 rounded italic font-serif w-8 h-8 flex items-center justify-center ${email.isItalic ? 'bg-gray-300 shadow-inner' : 'hover:bg-gray-100'}`}
                               >I</button>
                               <button 
                                onClick={() => handleFormatStyle('underline')} 
                                className={`p-2 rounded underline w-8 h-8 flex items-center justify-center ${email.isUnderline ? 'bg-gray-300 shadow-inner' : 'hover:bg-gray-100'}`}
                               >U</button>
                               
                               <div className="h-6 w-px bg-gray-300 mx-2"></div>
                               
                               <div className="flex gap-1">
                                   <div onClick={() => handleColorChange('black')} className={`w-6 h-6 rounded-full cursor-pointer border bg-black ${email.textColor === 'black' ? 'ring-2 ring-offset-1 ring-black' : ''}`}></div>
                                   <div onClick={() => handleColorChange('#EF4444')} className={`w-6 h-6 rounded-full cursor-pointer border bg-red-500 ${email.textColor === '#EF4444' ? 'ring-2 ring-offset-1 ring-red-500' : ''}`}></div>
                                   <div onClick={() => handleColorChange('#3B82F6')} className={`w-6 h-6 rounded-full cursor-pointer border bg-blue-500 ${email.textColor === '#3B82F6' ? 'ring-2 ring-offset-1 ring-blue-500' : ''}`}></div>
                                   <div onClick={() => handleColorChange('#10B981')} className={`w-6 h-6 rounded-full cursor-pointer border bg-green-500 ${email.textColor === '#10B981' ? 'ring-2 ring-offset-1 ring-green-500' : ''}`}></div>
                               </div>
                               
                               {stage === GameStage.FORMATTING_IMAGES && (
                                   <Button size="sm" variant="success" className="mr-2" onClick={checkFormatting}>تحقق</Button>
                               )}
                           </div>
                      )}
                       {toolbarTab === 'picFormat' && (
                           <div className="flex items-center gap-4">
                               <button onClick={() => handleApplyImageStyle('shadow')} className={`flex flex-col items-center gap-1 hover:bg-gray-100 p-1 rounded ${email.imageStyle === 'shadow' ? 'bg-gray-200' : ''}`}>
                                  <div className="w-6 h-6 bg-gray-300 shadow-lg"></div>
                                  <span className="text-[10px]">ظل</span>
                               </button>
                               <button onClick={() => handleApplyImageStyle('border')} className={`flex flex-col items-center gap-1 hover:bg-gray-100 p-1 rounded ${email.imageStyle === 'border' ? 'bg-gray-200' : ''}`}>
                                  <div className="w-6 h-6 bg-gray-300 border-2 border-black"></div>
                                  <span className="text-[10px]">إطار</span>
                               </button>
                               <Button size="sm" variant="success" onClick={checkFormatting}>تحقق من التنسيق</Button>
                           </div>
                      )}
                  </div>
              </div>
          )}

          {/* MAIN CONTENT AREA */}
          
          {/* 1. PEOPLE VIEW */}
          {activeTab === 'people' && (
              <div className="flex-1 bg-gray-50 p-6 overflow-y-auto">
                  {/* ... Existing People Content ... */}
                  <div className="max-w-2xl mx-auto">
                      <div className="flex justify-between items-center mb-6">
                          <h2 className="text-2xl font-bold text-gray-700">جهات الاتصال</h2>
                          <Button size="sm" onClick={() => stage === GameStage.CONTACTS_MANAGEMENT && checkContacts()}>
                              {stage === GameStage.CONTACTS_MANAGEMENT ? 'تحقق وإنهاء' : 'تم'}
                          </Button>
                      </div>

                      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden mb-6">
                          <div className="p-4 border-b bg-gray-50 font-bold text-gray-500 flex justify-between">
                              <span>إضافة جهة اتصال جديدة</span>
                          </div>
                          <div className="p-4 flex gap-2">
                               <input 
                                type="text" 
                                placeholder="الاسم" 
                                className="flex-1 p-2 border rounded"
                                value={newContactName}
                                onChange={(e) => setNewContactName(e.target.value)}
                               />
                               <input 
                                type="text" 
                                placeholder="البريد الإلكتروني" 
                                className="flex-1 p-2 border rounded"
                                value={newContactEmail}
                                onChange={(e) => setNewContactEmail(e.target.value)}
                               />
                               <button onClick={handleAddContact} className="bg-brand-blue text-white px-4 rounded hover:bg-indigo-600 font-bold">حفظ</button>
                          </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {contacts.map(c => (
                              <div key={c.id} className="bg-white p-4 rounded-lg shadow-sm border flex items-center gap-3 relative group">
                                  <img src={c.avatar} alt={c.name} className="w-12 h-12 rounded-full" />
                                  <div>
                                      <p className="font-bold text-gray-800">{c.name}</p>
                                      <p className="text-sm text-gray-500">{c.email}</p>
                                  </div>
                                  <button onClick={() => toggleFavorite(c.id)} className="absolute top-2 left-2 text-gray-300 hover:text-brand-yellow">
                                      ★
                                  </button>
                              </div>
                          ))}
                      </div>
                  </div>
              </div>
          )}

          {/* 2. MAIL VIEW */}
          {activeTab === 'mail' && (
            <div className="flex-1 p-8 overflow-y-auto bg-white">
                <div className="max-w-3xl mx-auto border shadow-sm min-h-[400px] flex flex-col rounded-sm">
                    {/* Email Header */}
                    <div className="border-b p-4 space-y-3 bg-gray-50">
                        {stage === GameStage.ADVANCED_CC_BCC && (
                            <div className="flex gap-4 animate-fade-in text-sm">
                                <div className="flex-1 flex items-center gap-2 bg-white border rounded px-2 relative group">
                                    <label className="font-bold text-gray-500 cursor-help">Cc:</label>
                                    <input 
                                        type="text" 
                                        className="flex-1 p-1 outline-none"
                                        value={email.cc}
                                        onChange={(e) => handleChange('cc', e.target.value)}
                                        placeholder="نسخة كربونية (علنية)"
                                    />
                                </div>
                                <div className="flex-1 flex items-center gap-2 bg-white border rounded px-2 relative group">
                                    <label className="font-bold text-gray-500 cursor-help">Bcc:</label>
                                    <input 
                                        type="text" 
                                        className="flex-1 p-1 outline-none"
                                        value={email.bcc}
                                        onChange={(e) => handleChange('bcc', e.target.value)}
                                        placeholder="نسخة مخفية (سرية)"
                                    />
                                </div>
                            </div>
                        )}
                        
                        <div className="flex items-center gap-2">
                            <button className="bg-gray-200 text-gray-600 px-3 py-1 rounded text-sm hover:bg-gray-300">إلى</button>
                            <input 
                                type="text" 
                                className="flex-1 bg-transparent outline-none border-b focus:border-brand-blue"
                                value={email.to}
                                onChange={(e) => handleChange('to', e.target.value)}
                            />
                        </div>
                        <div className="flex items-center gap-2">
                             <span className="text-gray-500 text-sm w-10">الموضوع</span>
                            <input 
                                type="text" 
                                className="flex-1 bg-transparent outline-none border-b focus:border-brand-blue font-bold"
                                value={email.subject}
                                onChange={(e) => handleChange('subject', e.target.value)}
                            />
                        </div>
                    </div>

                    {/* Email Body */}
                    <div className="flex-1 p-6 outline-none relative bg-white">
                         {stage === GameStage.SPELL_CHECK ? (
                            <div className="leading-loose text-2xl font-serif p-4" dir="rtl">
                                {corrections.map((task) => (
                                    <React.Fragment key={task.id}>
                                        <span>{task.preText}</span>
                                        <span 
                                            onContextMenu={(e) => handleWordClick(task, e)}
                                            onClick={(e) => handleWordClick(task, e)}
                                            className={
                                                task.isFixed 
                                                ? "text-brand-green font-bold transition-all duration-500" 
                                                : "wavy-underline font-bold text-red-600 relative inline-block cursor-pointer hover:bg-red-50"
                                            }
                                        >
                                            {task.isFixed ? task.correctWord : task.wrongWord}
                                        </span>
                                        <span>{task.postText}</span>
                                    </React.Fragment>
                                ))}
                            </div>
                        ) : (
                            <textarea 
                                className="w-full h-40 bg-transparent resize-none outline-none transition-all duration-300"
                                placeholder="اكتب نص الرسالة هنا..."
                                value={email.body}
                                onChange={(e) => handleChange('body', e.target.value)}
                                style={{
                                    fontWeight: email.isBold ? 'bold' : 'normal',
                                    fontStyle: email.isItalic ? 'italic' : 'normal',
                                    textDecoration: email.isUnderline ? 'underline' : 'none',
                                    color: email.textColor,
                                    fontFamily: 'Cairo, sans-serif'
                                }}
                            />
                        )}

                        {/* Image Attachment Area */}
                        {email.hasAttachment && (
                            <div className="mt-4 inline-block group relative">
                                <img 
                                    src="https://picsum.photos/300/200" 
                                    alt="Attached" 
                                    className={`
                                        rounded transition-all duration-300 transform
                                        ${email.imageStyle === 'shadow' ? 'shadow-2xl' : ''}
                                        ${email.imageStyle === 'border' ? 'border-8 border-gray-800 p-1' : ''}
                                    `} 
                                />
                                {stage === GameStage.FORMATTING_IMAGES && toolbarTab !== 'picFormat' && toolbarTab !== 'format' && (
                                    <div className="absolute -top-4 right-0 bg-brand-yellow text-white text-xs font-bold px-2 py-1 rounded-full animate-bounce shadow-lg">
                                        انقر على الصورة لتعديلها!
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
          )}

           {/* Feedback Overlay */}
           {showFeedback && (
               <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-gray-900/90 text-white px-8 py-6 rounded-2xl shadow-2xl z-50 animate-bounce text-center border-2 border-brand-yellow">
                   <p className="font-bold text-xl">{showFeedback}</p>
               </div>
           )}

           {/* Spell Check Menu */}
           {showSpellMenu && (
               <div 
                className="fixed bg-white shadow-xl border border-gray-200 rounded-lg py-1 z-50 min-w-[180px] animate-fade-in"
                style={{ top: showSpellMenu.y + 10, left: showSpellMenu.x - 90 }} // Adjust positioning
               >
                   <p className="px-3 py-2 text-xs font-bold text-gray-500 border-b bg-gray-50">التدقيق الإملائي</p>
                   <button 
                    className="w-full text-right px-4 py-3 hover:bg-green-50 font-bold text-brand-green text-lg flex justify-between"
                    onClick={() => applyCorrection(showSpellMenu.id)}
                   >
                       {corrections.find(c => c.id === showSpellMenu.id)?.correctWord}
                       <span className="text-gray-300 text-xs font-normal self-center">تصحيح</span>
                   </button>
                   <button 
                    className="w-full text-right px-4 py-2 hover:bg-gray-100 text-gray-500 text-sm"
                    onClick={() => setShowSpellMenu(null)}
                   >
                       تجاهل
                   </button>
               </div>
           )}

           {/* Insert Image Modal */}
           {showInsertModal && (
               <div className="absolute inset-0 bg-black/60 z-50 flex items-center justify-center backdrop-blur-sm animate-fade-in">
                   <div className="bg-white p-6 rounded-2xl w-96 shadow-2xl border-4 border-white">
                       <h3 className="font-bold text-xl mb-4 text-gray-800">إدراج صورة</h3>
                       <p className="text-sm text-gray-500 mb-4">اختر صورة من جهازك (محاكاة):</p>
                       <div className="grid grid-cols-2 gap-4 mb-6">
                           <div className="border-4 border-brand-blue rounded-xl p-2 cursor-pointer bg-blue-50 hover:scale-105 transition-transform" onClick={confirmAttach}>
                               <img src="https://picsum.photos/100/100" className="w-full rounded-lg shadow-sm" />
                               <p className="text-xs font-bold text-center mt-2 text-brand-blue">رحلة_مدرسية.jpg</p>
                           </div>
                           <div className="border-2 border-dashed border-gray-300 rounded-xl p-2 opacity-50 cursor-not-allowed flex items-center justify-center">
                               <span className="text-gray-400 font-bold">ملف تالف</span>
                           </div>
                       </div>
                       <div className="flex justify-end gap-3">
                           <Button size="sm" variant="secondary" onClick={() => setShowInsertModal(false)}>إلغاء</Button>
                           <Button size="sm" onClick={confirmAttach}>فتح (Open)</Button>
                       </div>
                   </div>
               </div>
           )}

      </div>
    </div>
  );
};