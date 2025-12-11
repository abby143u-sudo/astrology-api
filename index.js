const express = require("express");
const Astronomy = require("astronomy-engine");

const app = express();
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Astrology API is running!");
});
app.get("/vedic-chart", (req, res) => {
  const { date, time, lat, lon } = req.query;

  if (!date || !time || !lat || !lon) {
    return res.json({
      error: "Missing parameters: date, time, lat, lon"
    });
  }

  // Combine date + time → JS Date
  const dateTime = new Date(`${date}T${time}:00`);

  // List of planets to calculate
  const planets = ["Sun", "Moon", "Mercury", "Venus", "Mars", "Jupiter", "Saturn"];

  let results = {};

  planets.forEach(p => {
    let body = Astronomy.Body[p];
    let pos = Astronomy.Equatorial(body, dateTime, lat, lon);

    // Convert RA (Right Ascension) to long
    results[p] = {
      RA: pos.ra,
      Dec: pos.dec,
      Distance: pos.dist
    };
  });

  return res.json({
    message: "Vedic chart computed",
    date,
    time,
    location: { lat, lon },
    planets: results
  });
});

// PORT
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("API running at", PORT));
