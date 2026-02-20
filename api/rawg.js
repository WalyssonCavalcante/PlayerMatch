module.exports = async (req, res) => {
  if (req.method !== "GET") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const apiKey = process.env.RAWG_API_KEY;
  if (!apiKey) {
    res.status(500).json({ error: "RAWG_API_KEY is not configured" });
    return;
  }

  const type = req.query.type;
  const baseUrl = "https://api.rawg.io/api/games";
  const params = new URLSearchParams({ key: apiKey });

  if (type === "search") {
    const name = (req.query.name || "").toString().trim();
    if (!name) {
      res.status(400).json({ error: "name is required for search" });
      return;
    }
    params.set("search", name);
  } else if (type === "most-played") {
    params.set("ordering", "-popularity");
    params.set("page_size", "5");
  } else if (type === "random") {
    params.set("page_size", "18");
    params.set("page", (Math.floor(Math.random() * 500) + 1).toString());
  } else {
    res
      .status(400)
      .json({ error: "type must be 'search', 'most-played' or 'random'" });
    return;
  }

  try {
    const response = await fetch(`${baseUrl}?${params.toString()}`);
    if (!response.ok) {
      const errorText = await response.text();
      res
        .status(response.status)
        .json({ error: errorText || "RAWG request failed" });
      return;
    }
    const data = await response.json();
    res.status(200).json(data);
  } catch (error) {
    console.error("RAWG API error:", error);
    res.status(500).json({ error: "Failed to fetch RAWG data" });
  }
};
