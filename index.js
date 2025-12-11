const express = require("express");
const Astronomy = require("astronomy-engine");

const app = express();
app.use(express.json());

const nakshatras = [
  "Ashwini","Bharani","Krittika","Rohini","Mrigashira","Ardra",
  "Punarvasu","Pushya","Ashlesha","Magha","Purva Phalguni","Uttara Phalguni",
  "Hasta","Chitra","Swati","Vishakha","Anuradha","Jyeshtha",
  "Mula","Purva Ashadha","Uttara Ashadha","Shravana","Dhanishta",
  "Shatabhisha","Purva Bhadrapada","Uttara Bhadrapada","Revati"
];

const rashis = [
  "Aries","Taurus","Gemini","Cancer","Leo","Virgo",
  "Libra","Scorpio","Sagittarius","Capricorn","Aquarius","Pisces"
];

app.get("/", (req, res) => {
  res.send("Astrology API Running with Rashi, Nakshatra, Lagna & Houses");
});

app.get("/vedic-chart", (req, res) => {
  const { date, time, lat, lon } = req.query;

  if (!date || !time || !lat || !lon) {
    return res.status(400).json({ error: "Send date, time, lat, lon" });
  }

  const dateTime = new Date(`${date}T${time}:00`);
  const planetList = ["Sun", "Moon", "Mercury", "Venus", "Mars", "Jupiter", "Saturn"];
  let planetResults = {};

  planetList.forEach((planet) => {
    const body = Astronomy.Body[planet];
    const eclip = Astronomy.EclipticLongitude(body, dateTime);

    const longitude = eclip; // degrees

    // Rashi
    const rashiIndex = Math.floor(longitude / 30);

    // Nakshatra
    const nakIndex = Math.floor(longitude / 13.333);
    const pada = Math.floor((longitude % 13.333) / 3.333) + 1;

    planetResults[planet] = {
      longitude,
      rashi: rashis[rashiIndex],
      nakshatra: nakshatras[nakIndex],
      pada
    };
  });

  // LAGNA
  const gst = Astronomy.SiderealTime(dateTime);
  const lst = gst + Number(lon) / 15;
  const lagnaDegree = (lst * 15) % 360;
  const lagnaRashi = rashis[Math.floor(lagnaDegree / 30)];

  // HOUSES
  let houses = {};
  for (let i = 1; i <= 12; i++) {
    houses[`house${i}`] = (lagnaDegree + (i - 1) * 30) % 360;
  }

  return res.json({
    message: "Full Vedic Chart Generated",
    input: { date, time, lat, lon },
    lagnaDegree,
    lagnaRashi,
    houses,
    planets: planetResults
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("API running on port", PORT));
