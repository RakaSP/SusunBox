const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const fs = require("fs");
const path = require("path");
const { exec } = require("child_process");

const ItemListMap = require("./DataMapper/ItemListMap");

const app = express();
const port = 3001;

app.use(bodyParser.json());
app.use(cors());

let processedData = [];

app.get("/processedResource", (req, res) => {
  res.json(processedData);
});

app.post("/save-json", (req, res) => {
  const jsonData = req.body;
  jsonData.ItemList.map((item) => {
    item.SizeX = Number(item.SizeX);
    item.SizeY = Number(item.SizeY);
    item.SizeZ = Number(item.SizeZ);
    item.Weight = Number(item.Weight);
  });

  const mappedData = {
    box: {
      id: jsonData.ID,
      size_x: Number(jsonData.SizeX),
      size_y: Number(jsonData.SizeY),
      size_z: Number(jsonData.SizeZ),
      max_weight: Number(jsonData.MaxWeight),
    },
    items: jsonData.ItemList.map(ItemListMap),
  };

  const filePath = path.join(__dirname, "solver/instances", "example.json");
  const outputFilePath = path.join(
    __dirname,
    "solver/results",
    "data_out.json"
  );

  fs.writeFile(filePath, JSON.stringify(mappedData, null, 2), (err) => {
    if (err) {
      console.error("Error saving JSON file", err);
      return res.status(500).json({ error: "Failed to save JSON file" });
    }

    exec(
      "cd solver && .\\susunbox_venv\\Scripts\\activate.bat && python main.py --filename=../instances/example.json",
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
            processedData = processedJsonData;
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
