import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY!);

export async function askHRAgent(
  userMessage: string,
  context: {
    role: string;
    name: string;
    module: string;
    data?: any;
  }
) {
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });

  const systemPrompt = `
You are an intelligent HR assistant for ABC Company's HRMS platform.
Current user: ${context.name} (Role: ${context.role})
Current module: ${context.module}

You can help with:
- Answering HR policy questions
- Explaining payslip calculations
- Leave balance queries
- Attendance summaries
- Employee information (based on role access)
- Generating reports summaries
- Recruitment advice
- Performance feedback suggestions

Always respond in a professional, helpful tone.
If asked about data, reference the context provided.
Never share data the user's role shouldn't access.

Context data: ${JSON.stringify(context.data || {})}
  `;

  const chat = model.startChat({
    history: [{ role: "user", parts: [{ text: systemPrompt }] }],
  });

  const result = await chat.sendMessage(userMessage);
  return result.response.text();
}
