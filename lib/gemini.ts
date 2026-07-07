import { GoogleGenerativeAI } from "@google/generative-ai";

export async function askHRAgent(
  userMessage: string,
  context: {
    role: string;
    name: string;
    module: string;
    data?: unknown;
  }
) {
  const apiKey = process.env.GOOGLE_AI_API_KEY;
  if (!apiKey || apiKey.trim() === "") {
    throw new Error("GOOGLE_AI_API_KEY environment variable is missing or empty.");
  }
  const genAI = new GoogleGenerativeAI(apiKey);

  const modelName = process.env.GEMINI_MODEL || "gemini-2.5-flash";
  const appName = process.env.NEXT_PUBLIC_APP_NAME || "Nexora HRMS";
  const companyName = process.env.NEXT_PUBLIC_COMPANY_NAME || "Nexora Solutions Pvt. Ltd.";

  const systemPrompt = `
You are an intelligent HR assistant for ${companyName}'s ${appName} platform.
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

  const model = genAI.getGenerativeModel({ 
    model: modelName,
    systemInstruction: systemPrompt 
  });

  const chat = model.startChat();

  const result = await chat.sendMessage(userMessage);
  return result.response.text();
}
