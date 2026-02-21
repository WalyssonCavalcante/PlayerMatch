const { GoogleGenerativeAI } = require("@google/generative-ai");

async function listGenerateContentModels(apiKey) {
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`
  );

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`ListModels failed (${response.status}): ${text}`);
  }

  const data = await response.json();
  return (data.models || [])
    .filter(
      (model) =>
        Array.isArray(model.supportedGenerationMethods) &&
        model.supportedGenerationMethods.includes("generateContent")
    )
    .map((model) => String(model.name || "").replace(/^models\//, ""))
    .filter(Boolean);
}

async function resolveModelName(apiKey, preferredModel) {
  if (preferredModel) return preferredModel;

  const available = await listGenerateContentModels(apiKey);
  const priority = [
    "gemini-2.5-flash",
    "gemini-2.0-flash",
    "gemini-1.5-flash",
    "gemini-1.5-pro",
  ];

  for (const candidate of priority) {
    if (available.includes(candidate)) return candidate;
  }

  const firstFlash = available.find((name) => name.includes("flash"));
  if (firstFlash) return firstFlash;
  if (available.length > 0) return available[0];

  throw new Error("No models with generateContent are available for this key");
}

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
    const preferredModel = process.env.GEMINI_MODEL;
    const modelName = await resolveModelName(apiKey, preferredModel);
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
