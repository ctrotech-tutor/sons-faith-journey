// dev-tools/gemini.cjs

require("dotenv").config(); // Load environment variables
const { GoogleGenerativeAI } = require("@google/generative-ai");

// Securely retrieve API key
const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  console.error("❌ GEMINI_API_KEY not found in your .env file.");
  process.exit(1);
}

// Initialize Gemini client
const genAI = new GoogleGenerativeAI(apiKey);
const model = genAI.getGenerativeModel({ model: "gemini-pro" });

/**
 * Generate a commit message based on a git diff summary.
 * @param {string} diffSummary - The output of git diff --cached --shortstat
 * @returns {Promise<string>} - Suggested commit message
 */
async function generateCommitMessage(diffSummary) {
  const prompt = `
You are an AI assistant helping a developer write a Git commit message.

The code changes are:
${diffSummary}

Respond with a short, meaningful Git commit message.
Do NOT include any quotes, explanations, or greetings.
  `.trim();

  try {
    const result = await model.generateContent(prompt);
    const message = result.response.text().trim();

    // Clean up any extra quotes from response
    return message.replace(/^["']|["']$/g, "");
  } catch (error) {
    console.error("❌ Gemini error:", error.message || error);
    return "Update project files";
  }
}

module.exports = { generateCommitMessage };