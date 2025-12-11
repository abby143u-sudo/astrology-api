const express = require("express");
const app = express();

// allow JSON and large input
app.use(express.json());

// PORT
const PORT = process.env.PORT || 3000;

// ROOT
app.get("/", (req, res) => {
  res.send("API is running!");
});

// VEDIC CHART ENDPOINT
app.get("/vedic-chart", (req, res) => {
  const { date, time, lat, lon } = req.query;

  // Missing params
  if (!date || !time || !lat || !lon) {
    return res.status(400).json({
      error: "Please send all query parameters: date, time, lat, lon"
    });
  }

  return res.json({
    message: "Vedic chart endpoint hit successfully!",
    input: { date, time, lat, lon }
  });
});

// Start server
app.listen(PORT, () => {
  console.log("Astrology API running on port", PORT);
});
