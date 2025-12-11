import express from "express";
import SwissEPH from "swiss-ephemeris-wasm";

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3000;

// initialize Swiss Ephemeris once
let swe;
async function initSwiss() {
  if (!swe) {
    swe = await SwissEPH.init(); 
    await swe.swe_set_ephe_path();
  }
}

// convert date + time to Julian day
function toJulian(year, month, day, hour) {
  return swe.swe_julday(year, month, day, hour, swe.SE_GREG_CAL);
}

// Nakshatra list
const nakshatras = [
  "Ashwini","Bharani","Krittika","Rohini","Mrigashira","Ardra",
  "Punarvasu","Pushya","Ashlesha","Magha","Purva Phalguni",
  "Uttara Phalguni","Hasta","Chitra","Swati","Vishakha",
  "Anuradha","Jyeshtha","Mula","Purva Ashadha","Uttara Ashadha",
  "Shravana","Dhanishtha","Shatabhisha","Purva Bhadrapada",
  "Uttara Bhadrapada","Revati"
];

// calculate nakshatra + pada
function getNakshatra(lon) {
  const degPer = 360 / 27;
  const idx = Math.floor(lon / degPer);
  const within = lon - idx * degPer;
  const pada = Math.floor(within / (degPer / 4)) + 1;

  return {
    nakshatra: nakshatras[idx],
    pada
  };
}

// ⭐ ENDPOINT — yahi tumhara main API endpoint hai
app.get("/vedic-chart", async (req, res) => {
  await initSwiss();

  const { date, time, lat, lon } = req.query;

  // check all required inputs
  if (!date || !time || !lat || !lon) {
    return res.status(400).json({
      error: "Required: date, time, lat, lon"
    });
  }

  // split date & time
  const [Y, M, D] = date.split("-").map(Number);
  const [h, m] = time.split(":").map(Number);
  const hour = h + m / 60;

  // Julian day
  const jd = toJulian(Y, M, D, hour);

  // planets list
  const planetsList = [
    swe.SE_SUN, swe.SE_MOON, swe.SE_MERCURY,
    swe.SE_VENUS, swe.SE_MARS, swe.SE_JUPITER,
    swe.SE_SATURN
  ];

  const result = {};

  // calculate each planet
  for (const p of planetsList) {
    const arr = swe.swe_calc_ut(jd, p, swe.SEFLG_SWIEPH);
    const lonDeg = arr[0];

    result[swe.get_planet_name(p)] = {
      longitude: lonDeg,
      ...getNakshatra(lonDeg)
    };
  }

  res.json({
    input: { date, time, lat, lon },
    julian_day: jd,
    planets: result
  });
});

// start server
app.listen(PORT, () => {
  console.log(`Astrology API running on port ${PORT}`);
});












