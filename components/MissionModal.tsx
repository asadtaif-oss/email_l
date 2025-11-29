import React from 'react';
import { GameStage } from '../types';
import { Button } from './Button';

interface MissionModalProps {
  stage: GameStage;
  onStart: () => void;
}

export const MissionModal: React.FC<MissionModalProps> = ({ stage, onStart }) => {
  const getMissionDetails = () => {
    switch (stage) {
      case GameStage.BASICS:
        return {
          title: "المهمة الأولى: إرسال رسالة",
          icon: "✉️",
          steps: [
            "اضغط على زر نموذج جاهز أو اكتب بنفسك.",
            "تأكد أنك كتبت عنوان المستلم (إلى).",
            "تأكد أنك كتبت عنوان الموضوع.",
            "اضغط زر إرسال."
          ],
          color: "bg-blue-100 text-brand-blue"
        };
      case GameStage.SPELL_CHECK:
        return {
          title: "المهمة الثانية: صائد الأخطاء",
          icon: "🔍",
          steps: [
            "ابحث عن الكلمات التي تحتها خط أحمر متعرج.",
            "اضغط عليها (أو انقر بالزر الأيمن) لتظهر القائمة.",
            "اختر الكلمة الصحيحة.",
            "اضغط زر إرسال بعد تصحيح كل الأخطاء."
          ],
          color: "bg-red-100 text-red-600"
        };
      case GameStage.FORMATTING_IMAGES:
        return {
          title: "المهمة الثالثة: فنان التنسيق",
          icon: "🎨",
          steps: [
            "استخدم أزرار التنسيق (B, I, U) لتغيير شكل النص.",
            "اذهب لتبويب 'إدراج' وأضف صورة.",
            "بعد إضافة الصورة، اذهب لتبويب 'تنسيق الصورة' وأضف لها ظلاً أو إطاراً.",
            "اضغط زر التحقق من التنسيق."
          ],
          color: "bg-yellow-100 text-yellow-700"
        };
      case GameStage.CONTACTS_MANAGEMENT:
        return {
          title: "المهمة الرابعة: مدير العلاقات",
          icon: "👥",
          steps: [
            "انتقل إلى شاشة 'الأشخاص' من القائمة الجانبية.",
            "اكتب اسم صديق وبريده الإلكتروني واضغط حفظ.",
            "أضف شخصين على الأقل.",
            "يمكنك تمييز أصدقائك بنجمة المفضلة."
          ],
          color: "bg-green-100 text-green-700"
        };
      case GameStage.ADVANCED_CC_BCC:
        return {
          title: "المهمة الخامسة: المحترف",
          icon: "🕶️",
          steps: [
            "تعلم الفرق بين Cc و Bcc.",
            "جرب كتابة بريد إلكتروني في حقل Bcc (النسخة المخفية).",
            "هذا يحافظ على خصوصية أصدقائك.",
            "اضغط إرسال لإنهاء التدريب."
          ],
          color: "bg-purple-100 text-purple-700"
        };
      default:
        return null;
    }
  };

  const mission = getMissionDetails();

  if (!mission) return null;

  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-3xl max-w-lg w-full p-8 shadow-2xl relative border-4 border-white">
        <div className={`absolute -top-12 left-1/2 transform -translate-x-1/2 w-24 h-24 rounded-full flex items-center justify-center text-5xl shadow-lg border-4 border-white ${mission.color}`}>
          {mission.icon}
        </div>
        
        <div className="mt-10 text-center">
          <h2 className="text-2xl font-black text-gray-800 mb-2">{mission.title}</h2>
          <div className="w-16 h-1 bg-gray-200 mx-auto rounded mb-6"></div>
          
          <div className="bg-gray-50 rounded-xl p-6 text-right space-y-4 mb-8">
            <h3 className="font-bold text-gray-500 mb-2 text-sm">خطوات النجاح:</h3>
            {mission.steps.map((step, idx) => (
              <div key={idx} className="flex items-start gap-3">
                <span className="bg-brand-blue text-white w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 mt-0.5">
                  {idx + 1}
                </span>
                <p className="text-gray-700 font-medium">{step}</p>
              </div>
            ))}
          </div>

          <Button size="lg" onClick={onStart} className="w-full shadow-xl animate-pulse">
            أنا مستعد! ابدأ المهمة
          </Button>
        </div>
      </div>
    </div>
  );
};