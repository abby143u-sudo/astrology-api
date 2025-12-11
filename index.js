const express = require("express");
const Astronomy = require("astronomy-engine");

const app = express();
app.use(express.json());

// ROOT ROUTE
app.get("/", (req, res) => {
  res.send("Astrology API is running!");
});

// VEDIC CHART ROUTE
app.get("/vedic-chart", (req, res) => {
  const { date, time, lat, lon } = req.query;

  // Validation
  if (!date || !time || !lat || !lon) {
    return res.status(400).json({
      error: "Missing parameters. Please send: date, time, lat, lon"
    });
  }

  // DateTime merge
  let dateTime;
  try {
    dateTime = new Date(`${date}T${time}:00`);
  } catch (err) {
    return res.status(400).json({ error: "Invalid date or time format" });
  }

  // Planets to calculate
  const planetList = ["Sun", "Moon", "Mercury", "Venus", "Mars", "Jupiter", "Saturn"];

  let planetResults = {};

  try {
    planetList.forEach((planet) => {
      const body = Astronomy.Body[planet];
      const position = Astronomy.Equatorial(body, dateTime, Number(lat), Number(lon));

      planetResults[planet] = {
        RightAscension: position.ra,
        Declination: position.dec,
        DistanceAU: position.dist
      };
    });
  } catch (err) {
    return res.status(500).json({
      error: "Error calculating planet positions",
      details: err.message
    });
  }

  // Response
  return res.json({
    message: "Vedic chart calculated successfully",
    input: { date, time, lat, lon },
    planets: planetResults
  });
});

// SERVER START
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Astrology API running on port ${PORT}`);
});
