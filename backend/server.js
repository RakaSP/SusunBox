const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const fs = require("fs");
const path = require("path");
const { exec } = require("child_process");

const app = express();
const port = 3001;

app.use(bodyParser.json());
app.use(cors());

let processedData = [];

app.get("/processedResource", (req, res) => {
  console.log(processedData);
  res.json(processedData);
});

app.post("/save-json", (req, res) => {
  const jsonData = req.body;
  const filePath = path.join(
    __dirname,
    "obatexpress_vrp3d-main",
    "data (5).json"
  );
  const outputFilePath = path.join(
    __dirname,
    "obatexpress_vrp3d-main",
    "data_out.json"
  );

  fs.writeFile(filePath, JSON.stringify(jsonData, null, 2), (err) => {
    if (err) {
      console.error("Error saving JSON file", err);
      return res.status(500).json({ error: "Failed to save JSON file" });
    }

    exec(
      "cd obatexpress_vrp3d-main && python susunbox_main.py",
      (execErr, stdout, stderr) => {
        if (execErr) {
          console.error("Error executing susunbox_main.py", stderr);
          return res
            .status(500)
            .json({ error: "Failed to execute susunbox_main.py" });
        }

        fs.readFile(outputFilePath, "utf8", (err, outData) => {
          if (err) {
            console.error("Error reading processed JSON file", err);
            return res
              .status(500)
              .json({ error: "Failed to read processed JSON file" });
          }

          try {
            const processedJsonData = JSON.parse(outData);
            console.log("out data: ", outData);
            console.log("processed json data: ", processedJsonData);
            processedData = processedJsonData;
            console.log("processed data:", processedData);
            res.json({
              message: "JSON file saved and data updated successfully",
            });
          } catch (parseErr) {
            console.error("Error parsing processed JSON data", parseErr);
            res
              .status(500)
              .json({ error: "Failed to parse processed JSON data" });
          }
        });
      }
    );
  });
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}/`);
});
