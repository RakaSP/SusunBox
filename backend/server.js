const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const fs = require("fs");
const path = require("path");

const app = express();
const port = 3001;

app.use(bodyParser.json());
app.use(cors());

let data = [];

app.get("/resource", (req, res) => {
  console.log(data);
  res.json(data);
});

const pushItemList = (data, { id, name, category, containerId }) => {
  data.map((item) => {
    console.log("22: ", item);
    if (item.id === containerId) {
      if (category === "Container") {
        const itemList = [];
        item.itemList.push({ id, name, category, itemList });
      } else if (category === "Item") {
        item.itemList.push({ id, name, category });
      }
    } else {
      if (item.category === "Container") {
        console.log("34:", item.itemList);
        pushItemList(item.itemList, { id, name, category, containerId });
      }
    }
  });
};

app.post("/container", (req, res) => {
  const { id, name, category, containerId } = req.body;
  const itemList = [];
  if (containerId !== "") {
    pushItemList(data, { id, name, category, containerId });
  } else {
    data.push({ id, name, category, itemList });
  }

  res.status(201).json({ message: "Container Created" });
});

app.post("/item", (req, res) => {
  console.log("testing");
  const { id, name, category, containerId } = req.body;
  pushItemList(data, { id, name, category, containerId });

  res.status(201).json({ message: "Item Added" });
});

// app.get("/resource/:resourceId", (req, res) => {
//   const resourceId = req.params.resourceId;
//   if (data[resourceId]) {
//     res.json({ id: resourceId, ...data[resourceId] });
//   } else {
//     res.status(404).json({ error: "Resource not found" });
//   }
// });

// app.post("/resource", (req, res) => {
//   const { id, name, category } = req.body;
//   const itemList = [];

//   if (category === "Container") {
//     data.push({ id, name, category, itemList });
//   } else {
//     data.push({ id, name, category });
//   }
//   res.status(201).json({ message: "Resource created" });
// });

// app.put("/resource/:resourceId", (req, res) => {
//   const resourceId = req.params.resourceId;
//   const { name, category } = req.body;
//   if (data[resourceId]) {
//     data[resourceId] = { name, category };
//     res.json({ message: "Resource updated" });
//   }
// });

// app.delete("/resource/:resourceId", (req, res) => {
//   const resourceId = req.params.resourceId;
//   if (data[resourceId]) {
//     delete data[resourceId];
//     res.json({ message: "Resource deleted" });
//   } else {
//     res.status(404).json({ error: "Resource not found" });
//   }
// });

app.post("/save-json", (req, res) => {
  const jsonData = data;
  const filePath = path.join(__dirname, "data", "data.json");

  fs.writeFile(filePath, JSON.stringify(jsonData, null, 2), (err) => {
    if (err) {
      console.error("Error saving JSON file", err);
      res.status(500).json({ error: "Failed to save JSON file" });
    } else {
      res.json({ message: "JSON file saved successfully" });
    }
  });
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}/`);
});
