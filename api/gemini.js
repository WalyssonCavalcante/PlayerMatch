const { GoogleGenerativeAI } = require("@google/generative-ai");

module.exports = async (req, res) => {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    res.status(500).json({ error: "GEMINI_API_KEY is not configured" });
    return;
  }

  const { quizAnswers } = req.body || {};
  if (!Array.isArray(quizAnswers) || quizAnswers.length === 0) {
    res.status(400).json({ error: "quizAnswers must be a non-empty array" });
    return;
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const modelName = process.env.GEMINI_MODEL || "gemini-1.5-flash";
    const model = genAI.getGenerativeModel({ model: modelName });

    const prompt = `Sou um assistente que recomenda jogos. Com base nas respostas do quiz abaixo, sugira apenas 1 jogo ideal no seguinte formato:

Nome: [nome do jogo]
Gênero: [gênero do jogo]
Descrição: [uma breve explicação de por que ele combina com o humor atual]

Respostas do quiz:
${quizAnswers.map((q, i) => `Q${i + 1}: ${q}`).join("\n")}

Não adicione nada além desse formato.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;

    res.status(200).json({ recommendation: response.text(), model: modelName });
  } catch (error) {
    console.error("Gemini API error:", error);
    const status = Number(error?.status || error?.statusCode || 500);
    const message =
      error?.message ||
      error?.errorDetails?.[0]?.reason ||
      "Failed to generate recommendation";
    res.status(status >= 400 && status < 600 ? status : 500).json({
      error: "Gemini request failed",
      details: message,
    });
  }
};
