const { GoogleGenAI } = require("@google/genai");

const DEFAULT_MODEL = process.env.GEMINI_MODEL || "gemini-2.5-flash";

const SYSTEM_INSTRUCTIONS = `You are an role based AI assistant for a blood bank management system.

You must follow these rules:
- Answer only from the provided application context.
- If the provided data is incomplete, say exactly what is missing.
- Do not invent blood availability, transaction details, approvals, or payment status.
- Do not perform or imply any system action.
- Do not provide diagnosis or emergency medical advice.
- Keep answers concise, clear, and role-appropriate.
- When useful, structure the answer as short bullets.
- If the user asks about requests, transactions, inventory, analytics, donors, hospitals, or organizations, rely strictly on the supplied JSON context.
- Do not dump raw JSON fields back to the user unless they explicitly ask for raw data.
- For transaction questions, summarize each item in one short bullet with date, blood group, quantity, status, payment method, amount, and organization or hospital name when available.
- Prefer human-readable dates exactly as provided in the context.
- If there are many records, summarize the most relevant ones briefly instead of listing every field of every record.`;

const getClient = () => {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY is not configured");
  }

  return new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
  });
};

const generateAssistantReply = async ({ role, question, context, history = [] }) => {
  const client = getClient();
  const sanitizedHistory = Array.isArray(history)
    ? history
        .filter(
          (item) =>
            item &&
            ["user", "assistant"].includes(item.role) &&
            typeof item.content === "string" &&
            item.content.trim()
        )
        .slice(-6)
        .map((item) => ({
          role: item.role === "assistant" ? "model" : "user",
          parts: [{ text: item.content.trim() }],
        }))
    : [];

  const promptContext = JSON.stringify(context, null, 2);
  const contents = [
    ...sanitizedHistory,
    {
      role: "user",
      parts: [
        {
          text: `User role: ${role}\nUser question: ${question}\n\nApplication context:\n${promptContext}`,
        },
      ],
    },
  ];

  const response = await client.models.generateContent({
    model: DEFAULT_MODEL,
    contents,
    config: {
      systemInstruction: SYSTEM_INSTRUCTIONS,
      maxOutputTokens: 800,
    },
  });

  return {
    model: DEFAULT_MODEL,
    reply: response.text?.trim() || "",
  };
};

module.exports = {
  generateAssistantReply,
  DEFAULT_MODEL,
};
