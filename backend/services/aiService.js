const OpenAI = require("openai");

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

/* ===============================
   Generate Verification Questions
================================= */
async function generateQuestions(item) {
  try {
    const prompt = `
You are helping verify ownership of a lost or found item.

Item details:
Title: ${item.title}
Description: ${item.description}
Type: ${item.type}

Generate exactly 3 short, specific verification questions 
that only the real owner would know.
Do NOT repeat obvious info from the description.
Return only questions.
    `;

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7
    });

    const text = response.choices[0].message.content;

    return text
      .split("\n")
      .filter(line => line.trim().length > 5)
      .slice(0, 3)
      .map(q => ({
        question: q.replace(/^\d+\.?\s*/, "").trim()
      }));

  } catch (error) {
    console.error("AI QUESTION ERROR:", error.message);

    // fallback if AI fails
    return [
      { question: "What color is the item?" },
      { question: "Where was it lost/found?" },
      { question: "Describe a unique feature." }
    ];
  }
}

/* ===============================
   Score Claim Answers
================================= */
async function scoreClaim(item, claimAnswers) {
  try {
    const prompt = `
You are evaluating if a person is the real owner of an item.

Item:
Title: ${item.title}
Description: ${item.description}

Verification Questions:
${item.verificationQuestions.map((q, i) =>
      `${i + 1}. ${q.question}`
    ).join("\n")}

User Answers:
${claimAnswers.map((a, i) =>
      `${i + 1}. ${a}`
    ).join("\n")}

Score ownership confidence from 0 to 100.
Return ONLY a number.
    `;

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.3
    });

    const score = parseInt(
      response.choices[0].message.content.trim()
    );

    return isNaN(score) ? 0 : score;

  } catch (error) {
    console.error("AI SCORING ERROR:", error.message);
    return 0;
  }
}

module.exports = {
  generateQuestions,
  scoreClaim
};
