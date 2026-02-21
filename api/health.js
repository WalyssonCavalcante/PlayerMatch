module.exports = async (req, res) => {
  if (req.method !== "GET") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  res.status(200).json({
    ok: true,
    env: {
      hasRawg: Boolean(process.env.RAWG_API_KEY),
      hasGemini: Boolean(process.env.GEMINI_API_KEY),
    },
  });
};
