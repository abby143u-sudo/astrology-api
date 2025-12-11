import SwissEph from "swisseph-wasm";
import express from "express";

const app = express();
app.use(express.json());

const swe = new SwissEph();

// Helper: convert to Julian day
function getJulianDay(year, month, day, hour) {
  return swe.julday(year, month, day, hour);
}

// Nakshatra calculation
const nakshatras = [
  "Ashwini", "Bharani", "Krittika", "Rohini", "Mrigashira", "Ardra",
  "Punarvasu", "Pushya", "Ashlesha", "Magha", "Purva Phalguni", "Uttara Phalguni",
  "Hasta", "Chitra", "Swati", "Vishakha", "Anuradha", "Jyeshtha",
  "Mula", "Purva Ashadha", "Uttara Ashadha", "Shravana", "Dhanishtha",
  "Shatabhisha", "Purva Bhadrapada", "Uttara Bhadrapada", "Revati"
];

function computeNakshatra(lon) {
  const degPerNak = 360 / 27;
  const idx = Math.floor(lon / degPerNak);
  const within = lon - idx * degPerNak;
  const pada = Math.floor(within / (degPerNak / 4)) + 1;
  return { nakshatra: nakshatras[idx], pada };
}

app.get("/vedic-simple", async (req, res) => {
  await swe.initSwissEph();
  const { date, time, lat, lon } = req.query;
  if (!date || !time || !lat || !lon)
    return res.status(400).json({ error: "date, time, lat, lon required" });

  const [Y, M, D] = date.split("-").map(Number);
  const [h, m] = time.split(":").map(Number);
  const hourDecimal = h + m / 60;

  const jd = getJulianDay(Y, M, D, hourDecimal);

  const planetsToCalc = [
    swe.SE_SUN, swe.SE_MOON, swe.SE_MARS, swe.SE_MERCURY,
    swe.SE_JUPITER, swe.SE_VENUS, swe.SE_SATURN
  ];

  const results = {};
  for (let p of planetsToCalc) {
    const arr = swe.calc_ut(jd, p, swe.SEFLG_SWIEPH | swe.SEFLG_SIDEREAL);
    results[swe.get_planet_name(p)] = {
      longitude: arr[0],
      ...computeNakshatra(arr[0])
    };
  }

  res.json({
    input: { date, time, lat, lon },
    julian_day: jd,
    planets: results
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Astrology API live on ${PORT}`));
