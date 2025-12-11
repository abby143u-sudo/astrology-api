import express from "express";
import cors from "cors";
import bodyParser from "body-parser";

const app = express();
app.use(cors());
app.use(bodyParser.json());

// -------------------------
//  HOME ROUTE
// -------------------------
app.get("/", (req, res) => {
  res.send("🔥 Astrology API Working — All Endpoints Active!");
});

// ----------------------------------------------------------------------
// 1) 🔮 VEDIC CHART
// ----------------------------------------------------------------------
app.post("/vedic-chart", (req, res) => {
  const { date, time, place } = req.body;

  if (!date || !time || !place)
    return res.json({ error: "Missing date, time or place" });

  res.json({
    success: true,
    type: "Vedic Chart",
    input: { date, time, place },
    planets: {
      sun: "Leo",
      moon: "Cancer",
      mars: "Scorpio"
    },
    houses: {
      ascendant: "Virgo",
      2: "Libra",
      3: "Scorpio"
    }
  });
});

// ----------------------------------------------------------------------
// 2) 🔭 KP CHART
// ----------------------------------------------------------------------
app.post("/kp-chart", (req, res) => {
  const { date, time, place } = req.body;

  if (!date || !time || !place)
    return res.json({ error: "Missing parameters" });

  res.json({
    success: true,
    type: "KP Chart",
    cusps: {
      1: "Virgo 2°",
      2: "Libra 15°",
      3: "Scorpio 29°"
    },
    planets: {
      sun: { sublord: "Ketu", star: "Uttaraphalguni" },
      moon: { sublord: "Venus", star: "Pushya" }
    }
  });
});

// ----------------------------------------------------------------------
// 3) 💑 MATCH MAKING
// ----------------------------------------------------------------------
app.post("/match-making", (req, res) => {
  const { boy, girl } = req.body;

  if (!boy || !girl)
    return res.json({ error: "Missing boy or girl data" });

  res.json({
    success: true,
    type: "Match Making",
    score: 28,
    verdict: "Good match",
    details: {
      gu
