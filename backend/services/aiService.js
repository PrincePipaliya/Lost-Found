const OpenAI = require("openai");

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/* ======================================================
   SAFE AI CALL WRAPPER
====================================================== */

async function safeCompletion(messages, temperature = 0.5) {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages,
      temperature,
      max_tokens: 300,
    });

    return response.choices?.[0]?.message?.content?.trim() || null;
  } catch (error) {
    console.error("AI ERROR:", error.message);
    return null;
  }
}

/* ======================================================
   GENERATE VERIFICATION QUESTIONS
====================================================== */

async function generateQuestions(item) {
  const prompt = `
You are generating verification questions for ownership validation.

Item Details:
Title: ${item.title}
Description: ${item.description}
Type: ${item.type}

Generate EXACTLY 3 short, specific questions.
Avoid repeating obvious information.
Return plain text questions only.
`;

  const content = await safeCompletion(
    [{ role: "user", content: prompt }],
    0.7
  );

  if (!content) {
    return fallbackQuestions();
  }

  const questions = content
    .split("\n")
    .map((q) => q.replace(/^\d+\.?\s*/, "").trim())
    .filter((q) => q.length > 5)
    .slice(0, 3)
    .map((q) => ({
      question: q,
    }));

  return questions.length === 3 ? questions : fallbackQuestions();
}

/* ======================================================
   SCORE CLAIM CONFIDENCE
====================================================== */

async function scoreClaim(item, claimAnswers) {
  if (!item.verificationQuestions?.length || !claimAnswers?.length) {
    return 0;
  }

  const prompt = `
Evaluate if the claimant is the true owner.

Item:
Title: ${item.title}
Description: ${item.description}

Verification Questions:
${item.verificationQuestions
    .map((q, i) => `${i + 1}. ${q.question}`)
    .join("\n")}

User Answers:
${claimAnswers
    .map((a, i) => `${i + 1}. ${a}`)
    .join("\n")}

Return a confidence score between 0 and 100.
Return ONLY the number.
`;

  const content = await safeCompletion(
    [{ role: "user", content: prompt }],
    0.3
  );

  if (!content) return 0;

  const score = parseInt(content.replace(/[^\d]/g, ""));

  if (isNaN(score)) return 0;

  return Math.max(0, Math.min(score, 100));
}

/* ======================================================
   FALLBACK
====================================================== */

function fallbackQuestions() {
  return [
    { question: "What unique feature does the item have?" },
    { question: "Where was the item last seen?" },
    { question: "Describe any identifying marks." },
  ];
}

module.exports = {
  generateQuestions,
  scoreClaim,
};