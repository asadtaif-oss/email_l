import React from 'react';

interface AssistantProps {
  message: string;
}

export const Assistant: React.FC<AssistantProps> = ({ message }) => {
  return (
    <div className="fixed bottom-4 right-4 flex items-end gap-4 z-40 max-w-md animate-fade-in-up">
       <div className="bg-white p-4 rounded-t-3xl rounded-br-3xl rounded-bl-none shadow-xl border-2 border-brand-blue text-gray-800 relative">
          <p className="font-bold text-lg">{message}</p>
          <div className="absolute -bottom-2 -right-2 w-4 h-4 bg-white border-r-2 border-b-2 border-brand-blue transform rotate-45"></div>
       </div>
       <div className="relative">
           {/* Simple Robot Avatar using Tailwind Shapes */}
           <div className="w-16 h-16 bg-brand-blue rounded-xl flex items-center justify-center relative animate-bounce">
                <div className="w-10 h-8 bg-white rounded-md flex justify-around items-center">
                    <div className="w-2 h-2 bg-black rounded-full"></div>
                    <div className="w-2 h-2 bg-black rounded-full"></div>
                </div>
                <div className="absolute -top-3 w-1 h-3 bg-gray-400"></div>
                <div className="absolute -top-4 w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
           </div>
       </div>
    </div>
  );
};