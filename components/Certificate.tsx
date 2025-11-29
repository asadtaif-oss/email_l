import React, { useRef, useState, useEffect } from 'react';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

interface CertificateProps {
  studentName: string;
  onRestart: () => void;
}

export const Certificate: React.FC<CertificateProps> = ({ studentName, onRestart }) => {
  const certificateRef = useRef<HTMLDivElement>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [logoBase64, setLogoBase64] = useState<string | null>(null);

  // Robust image fetching strategy
  useEffect(() => {
    const fetchImage = async () => {
      const imageUrl = "https://h.top4top.io/p_3620y9hbd1.png";
      
      const tryFetch = async (url: string) => {
        const response = await fetch(url);
        if (!response.ok) throw new Error(`Failed to fetch from ${url}`);
        return await response.blob();
      };

      try {
        // Try Primary Proxy (corsproxy.io)
        const blob = await tryFetch(`https://corsproxy.io/?${encodeURIComponent(imageUrl)}`);
        const reader = new FileReader();
        reader.onloadend = () => setLogoBase64(reader.result as string);
        reader.readAsDataURL(blob);
      } catch (err1) {
        console.warn("Primary proxy failed, trying backup...", err1);
        try {
          // Try Backup Proxy (allorigins)
          const blob = await tryFetch(`https://api.allorigins.win/raw?url=${encodeURIComponent(imageUrl)}`);
          const reader = new FileReader();
          reader.onloadend = () => setLogoBase64(reader.result as string);
          reader.readAsDataURL(blob);
        } catch (err2) {
           console.error("All logo proxies failed. Using fallback icon.", err2);
           // Fallback to a generic encoded SVG to ensure certificate doesn't look empty
           setLogoBase64("data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjNEY0NkU1IiBzdHJva2Utd2lkdGg9IjIiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCI+PHBhdGggZD0iTTIyIDEwdjZsLTIuNSAyLjUtMi41LTIuNS0yLjUgMi41LTIuNS0yLjUtMi41IDIuNS0yLjUtMi41LTIuNSAyLjVWMTBjMC01LjUgNC0xMCA5LTEwcyA5IDQuNSA5IDEweiIvPjwvc3ZnPg==");
        }
      }
    };
    fetchImage();
  }, []);

  const handleDownload = async () => {
    if (!certificateRef.current) return;
    
    setIsDownloading(true);
    try {
      // Wait a moment for images to ensure rendering
      await new Promise(resolve => setTimeout(resolve, 500));

      const canvas = await html2canvas(certificateRef.current, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        logging: false,
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4',
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      
      const imgProps = pdf.getImageProperties(imgData);
      const ratio = imgProps.width / imgProps.height;
      
      let width = pdfWidth;
      let height = width / ratio;

      // If height exceeds page height, fit by height instead
      if (height > pdfHeight) {
          height = pdfHeight;
          width = height * ratio;
      }
      
      // Center horizontally and vertically
      const x = (pdfWidth - width) / 2;
      const y = (pdfHeight - height) / 2;

      pdf.addImage(imgData, 'PNG', x, y, width, height);
      pdf.save(`شهادة-${studentName.replace(/\s+/g, '-')}.pdf`);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('حدث خطأ أثناء تحميل الشهادة. يرجى المحاولة مرة أخرى.');
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center p-4 min-h-screen bg-gradient-to-br from-indigo-50 to-purple-100">
      
      <div 
        ref={certificateRef}
        className="bg-white border-8 border-brand-yellow p-10 rounded-3xl shadow-2xl max-w-4xl w-full text-center relative overflow-hidden flex flex-col items-center"
        style={{ minHeight: '600px' }} // Ensure nice aspect ratio
      >
        {/* Decorative corners */}
        <div className="absolute top-0 left-0 w-32 h-32 bg-brand-blue rounded-br-full opacity-20"></div>
        <div className="absolute bottom-0 right-0 w-32 h-32 bg-brand-green rounded-tl-full opacity-20"></div>
        
        {/* Logo */}
        <div className="mb-6 h-32 w-full flex justify-center items-center">
            {logoBase64 ? (
                <img 
                    src={logoBase64} 
                    alt="School Logo" 
                    className="h-full object-contain drop-shadow-md"
                />
            ) : (
                <div className="h-32 w-32 bg-gray-100 rounded-full flex items-center justify-center text-gray-400 animate-pulse">
                    ...
                </div>
            )}
        </div>

        <h1 className="text-5xl font-extrabold text-brand-blue mb-4">شهادة إتقان المهارات الرقمية</h1>
        <p className="text-gray-500 text-xl mb-8">درس تنسيق وإدارة البريد الإلكتروني</p>
        
        <div className="border-b-4 border-dashed border-gray-300 pb-4 mb-10 w-3/4">
            <h2 className="text-6xl font-bold text-brand-green font-sans py-4">{studentName}</h2>
        </div>

        <p className="text-gray-700 text-2xl leading-relaxed mb-12 max-w-3xl">
          نشهد بأن الطالب المتميز قد أتم بنجاح درس <br/>
          <span className="font-bold text-brand-blue">"تنسيق وإدارة البريد الإلكتروني"</span> <br/>
          وأظهر براعة في كتابة الرسائل، وتنسيقها، وتأمين حسابه الرقمي.
        </p>

        <div className="flex justify-between items-end mt-auto w-full px-12 pb-8">
           <div className="text-right">
             <div className="w-48 h-1 bg-gray-800 mb-2"></div>
             <p className="text-lg text-gray-500 font-bold mb-1">معلم المادة</p>
             <p className="font-bold text-brand-blue text-2xl font-sans">أ. أسعد الذهلي</p>
           </div>
           
           <div className="text-center transform translate-y-4">
             <div className="w-32 h-32 bg-brand-yellow rounded-full flex items-center justify-center text-white font-bold text-3xl shadow-xl border-4 border-white transform rotate-12">
                ممتاز
             </div>
           </div>

           <div className="text-left">
             <p className="text-lg text-gray-500 font-bold">{new Date().toLocaleDateString('ar-EG')}</p>
             <p className="text-lg text-gray-500">التاريخ</p>
           </div>
        </div>
      </div>

      <div className="mt-8 flex gap-4 print:hidden">
        <button 
            onClick={handleDownload}
            disabled={isDownloading}
            className="bg-gray-800 text-white px-8 py-3 rounded-full font-bold shadow-lg hover:bg-gray-900 transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
             {isDownloading ? (
                <span className="animate-pulse">جاري التحميل...</span>
             ) : (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  تحميل الشهادة (PDF)
                </>
             )}
        </button>
        <button 
            onClick={onRestart}
            className="bg-brand-blue text-white px-8 py-3 rounded-full font-bold shadow-lg hover:bg-indigo-600 transition-all flex items-center gap-2"
        >
            درس جديد
        </button>
      </div>
    </div>
  );
};