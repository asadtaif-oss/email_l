import { GoogleGenAI } from "@google/genai";

const getClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    console.warn("API_KEY not found in environment variables. Features requiring AI will utilize mock data or fail.");
    return null;
  }
  return new GoogleGenAI({ apiKey });
};

export const checkEmailPoliteness = async (subject: string, body: string): Promise<string> => {
  const client = getClient();
  if (!client) return "أحسنت! رسالتك تبدو رائعة.";

  try {
    const response = await client.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `
        You are a friendly teacher for a 10-year-old student.
        Evaluate this email draft written by the student in Arabic.
        Subject: ${subject}
        Body: ${body}

        If the email is polite and clear, praise them in Arabic.
        If it's rude or unclear, give a gentle tip in Arabic on how to improve.
        Keep the response short (max 2 sentences).
        Tone: Encouraging, fun.
      `,
    });
    return response.text || "رسالة ممتازة! واصل العمل الجيد.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "رسالة جميلة! (تعذر الاتصال بالمعلم الآلي حالياً)";
  }
};

export const generateMysteryReply = async (studentName: string): Promise<{subject: string, body: string}> => {
    const client = getClient();
    // Fallback if no API key
    if (!client) {
        return {
            subject: "رد: مرحباً!",
            body: `أهلاً بك يا ${studentName}! أنا سعيد جداً باستلام رسالتك الأولى. أنت تتعلم بسرعة!`
        };
    }

    try {
        const response = await client.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: `Write a short, fun email reply in Arabic to a student named ${studentName} who just learned how to send emails. 
            Pretend you are "Robot 7", the email assistant. 
            The subject should be "رد: تهانينا!". 
            The body should be encouraging and mention that they are now an "Email Explorer".
            Return as JSON: { "subject": "...", "body": "..." }`,
            config: {
                responseMimeType: "application/json"
            }
        });
        
        const text = response.text || "{}";
        return JSON.parse(text);
    } catch (error) {
         return {
            subject: "رد: تهانينا!",
            body: `أهلاً بك يا ${studentName}! أنا "روبوت 7". سعيد جداً بنجاحك في إرسال أول رسالة!`
        };
    }
}