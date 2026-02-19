import express from "express";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());

app.get("/health", (req, res) => {
  res.json({ status: "Greenbag API running" });
});

app.listen(5001, () => {
  console.log("API running on http://localhost:5001");
});