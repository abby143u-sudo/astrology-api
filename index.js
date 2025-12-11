const express = require("express");
const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3000;

// root
app.get("/", (req, res) => {
  res.send("Astrology API is running…");
});

/*
  SIMPLE STARTER: /basic-chart
  Inputs (query params OR JSON body):
    - date (YYYY-MM-DD)  e.g. 1996-09-26
    - time (HH:mm)       e.g. 09:30   (optional for now)
    - lat, lon           (optional for now)
  Response: sun_sign + simple prediction
*/
function getSunSignFromDate(dateStr) {
  // dateStr = "YYYY-MM-DD"
  const parts = dateStr.split("-");
  const month = Number(parts[1]);
  const day = Number(parts[2]);

  // Zodiac date ranges (sun sign by date, simple)
  const ranges = [
    { sign: "Capricorn", from: { m: 12, d: 22 }, to: { m: 1, d: 19 } },
    { sign: "Aquarius", from: { m: 1, d: 20 }, to: { m: 2, d: 18 } },
    { sign: "Pisces", from: { m: 2, d: 19 }, to: { m: 3, d: 20 } },
    { sign: "Aries", from: { m: 3, d: 21 }, to: { m: 4, d: 19 } },
    { sign: "Taurus", from: { m: 4, d: 20 }, to: { m: 5, d: 20 } },
    { sign: "Gemini", from: { m: 5, d: 21 }, to: { m: 6, d: 20 } },
    { sign: "Cancer", from: { m: 6, d: 21 }, to: { m: 7, d: 22 } },
    { sign: "Leo", from: { m: 7, d: 23 }, to: { m: 8, d: 22 } },
    { sign: "Virgo", from: { m: 8, d: 23 }, to: { m: 9, d: 22 } },
    { sign: "Libra", from: { m: 9, d: 23 }, to: { m: 10, d: 22 } },
    { sign: "Scorpio", from: { m: 10, d: 23 }, to: { m: 11, d: 21 } },
    { sign: "Sagittarius", from: { m: 11, d: 22 }, to: { m: 12, d: 21 } }
  ];

  for (let r of ranges) {
    // range that crosses year end (Capricorn)
    if (r.from.m === 12 && r.to.m === 1) {
      if ((month === 12 && day >= r.from.d) || (month === 1 && day <= r.to.d)) return r.sign;
    } else {
      if ((month === r.from.m && day >= r.from.d) || (month === r.to.m && day <= r.to.d) || (month > r.from.m && month < r.to.m)) {
        return r.sign;
      }
    }
  }
  return "Unknown";
}

function simplePredictionForSign(sign) {
  const map = {
    Aries: "Aaj nayi shuruat ke liye accha din hai. Dhairya rakho.",
    Taurus: "Aaj paisa aur stability pe focus karein.",
    Gemini: "Communication se fayda hoga — baat karo, connect karo.",
    Cancer: "Emotional clarity zaruri hai. Apne parivaar se samay bitayein.",
    Leo: "Apki mehnat notice hogi. Confident rahiye.",
    Virgo: "Planning aur organization se kaam tezi se hoga.",
    Libra: "Balance aur relationships par dhyan dein.",
    Scorpio: "Focus aur determination se aage badhenge.",
    Sagittarius: "Seekhne aur explore karne ka din hai.",
    Capricorn: "Discipline se success milega.",
    Aquarius: "Naye ideas dhyaan mein rakhein; experimentation accha hai.",
    Pisces: "Creativity aur intuition aaj strong rahengi."
  };
  return map[sign] || "Aaj ka din vishesh hai — apna dhyan rakhein.";
}

// Accept both query params and JSON body
app.get("/basic-chart", (req, res) => {
  const date = req.query.date || (req.body && req.body.date);
  const time = req.query.time || (req.body && req.body.time) || "";
  if (!date) return res.status(400).json({ error: "date (YYYY-MM-DD) required" });

  const sunSign = getSunSignFromDate(date);
  const prediction = simplePredictionForSign(sunSign);

  res.json({
    input: { date, time },
    sun_sign: sunSign,
    simple_prediction: prediction,
    note: "Yeh starter endpoint hai. Accurate Lagna/Nakshatra/Dasha ke liye next steps me ephemeris add karenge."
  });
});

// quick POST version
app.post("/basic-chart", (req, res) => {
  // same logic
  const date = req.body.date;
  const time = req.body.time || "";
  if (!date) return res.status(400).json({ error: "date (YYYY-MM-DD) required in JSON body" });

  const sunSign = getSunSignFromDate(date);
  const prediction = simplePredictionForSign(sunSign);

  res.json({
    input: { date, time },
    sun_sign: sunSign,
    simple_prediction: prediction,
    note: "Yeh starter endpoint hai. Accurate Lagna/Nakshatra/Dasha ke liye next steps me ephemeris add karenge."
  });
});

app.listen(PORT, () => {
  console.log(`Astrology API running on port ${PORT}`);
});
const swisseph = require("swisseph");

// Swiss Ephemeris settings
swisseph.swe_set_ephe_path(__dirname); // ephemeris files automatically downloaded in node_modules

// Nakshatra list (27)
const nakshatras = [
  "Ashwini", "Bharani", "Krittika", "Rohini", "Mrigashira", "Ardra",
  "Punarvasu", "Pushya", "Ashlesha", "Magha", "Purva Phalguni",
  "Uttara Phalguni", "Hasta", "Chitra", "Swati", "Vishakha", "Anuradha",
  "Jyeshtha", "Mula", "Purva Ashadha", "Uttara Ashadha", "Shravana",
  "Dhanishtha", "Shatabhisha", "Purva Bhadrapada", "Uttara Bhadrapada",
  "Revati"
];

// Function → find Nakshatra from longitude
function getNakshatra(longitude) {
  const nak = Math.floor(longitude / (360 / 27));
  const pada = Math.floor((longitude % (360 / 27)) / (360 / 108)) + 1;
  return { nakshatra: nakshatras[nak], pada };
}

// Main endpoint
app.get("/vedic-chart", (req, res) => {
  const { date, time, lat, lon } = req.query;

  if (!date || !time || !lat || !lon) {
    return res.status(400).json({
      error: "Please send date, time, lat, lon. Example: ?date=1996-09-26&time=09:30&lat=25.6&lon=85.1"
    });
  }

  // Convert date time → Julian Day
  const [year, month, day] = date.split("-").map(Number);
  const [hour, minute] = time.split(":").map(Number);

  const julianDay = swisseph.swe_julday(year, month, day, hour + minute / 60);

  const planets = {
    sun: swisseph.SE_SUN,
    moon: swisseph.SE_MOON,
    mars: swisseph.SE_MARS,
    mercury: swisseph.SE_MERCURY,
    jupiter: swisseph.SE_JUPITER,
    venus: swisseph.SE_VENUS,
    saturn: swisseph.SE_SATURN,
    rahu: swisseph.SE_TRUE_NODE,
    ketu: null
  };

  let planetResults = {};
  
  Object.keys(planets).forEach(p => {
    if (p === "ketu") {
      planetResults["ketu"] = {
        longitude: (planetResults["rahu"].longitude + 180) % 360
      };
      return;
    }

    const pos = swisseph.swe_calc_ut(julianDay, planets[p], 0);
    planetResults[p] = {
      longitude: pos.longitude,
      nakshatra: getNakshatra(pos.longitude).nakshatra,
      pada: getNakshatra(pos.longitude).pada
    };
  });

  // Ascendant calculation
  const asc = swisseph.swe_houses(julianDay, Number(lat), Number(lon));

  res.json({
    input: { date, time, lat, lon },
    ascendant_degree: asc.ascendant,
    planets: planetResults,
    houses: asc.house,
    moon_nakshatra: planetResults.moon.nakshatra,
    moon_pada: planetResults.moon.pada,
    note: "This is accurate Vedic chart data using Swiss Ephemeris."
  });
});

