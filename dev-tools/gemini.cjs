const { GoogleGenerativeAI } = require('@google/generative-ai');

// Get API Key safely from .env (after dotenv config)
const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  throw new Error("GEMINI_API_KEY not found in environment variables.");
}

const genAI = new GoogleGenerativeAI(apiKey);
const model = genAI.getGenerativeModel({ model: "gemini-pro" });

async function generateCommitMessage(diffSummary) {
  const prompt = `
You are an assistant helping a developer generate a Git commit message.

The code changes are:
${diffSummary}

Suggest a short, meaningful commit message. Do NOT include extra quotes or explanations.
  `;

  try {
    const result = await model.generateContent(prompt);
    const message = result.response.text().trim();

    // Remove leading/trailing quotes if Gemini returns them
    return message.replace(/^["']|["']$/g, "");
  } catch (error) {
    console.error("❌ Gemini error:", error.message);
    return "Update project files";
  }
}

module.exports = { generateCommitMessage };
