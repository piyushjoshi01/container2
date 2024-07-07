const express = require("express");
const fs = require("fs");

function isValidCSVLine(line) {
  const parts = line.split(",");
  const isValid = parts.length === 2 && /^\d+$/.test(parts[1].trim());

  return isValid;
}

const app = express();

app.use(express.json());

const PORT = 6000;

app.post("/calculate", (req, res) => {
  const { file, product } = req.body;

  const filePath = `../Container-1/${file}`;

  const data = [];

  fs.readFile(filePath, "utf8", (err, datData) => {
    if (err) {
      console.error("Error reading file:", err);
      return res.status(404).json({ file, error: "File not found." });
    }
    const lines = datData.trim().split("\n");

    if (lines.length < 2) {
      console.log("File does not have enough lines to process.");
      return res.status(400).json({
        file,
        error: "Input file not in CSV format.",
      });
    }

    const dataLines = lines.slice(1);
    const allLinesAreValid = dataLines.every(isValidCSVLine);

    if (!allLinesAreValid) {
      return res
        .status(400)
        .json({ file, error: "Input file not in CSV format." });
    }

    dataLines
      .map((line) => line.split(","))
      .forEach((row) => {
        const [product, amount] = row;
        data.push({ product, amount });
      });

    let count = 0;

    data.forEach((item) => {
      if (item.product === product) {
        count += parseInt(item.amount);
      }
    });
    res.status(201).json({ file, sum: count });
  });
});

app.listen(PORT, () => {
  console.log(`Example app listening at http://localhost:${PORT}`);
});
