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

let data = [];
let processedData = [];
data.push({
  id: "1",
  name: "Truck",
  type: "VehicleContainer",
  size_x: 150,
  size_y: 150,
  size_z: 150,
  max_weight: 30,
});

app.get("/resource", (req, res) => {
  console.log(data);
  res.json(data);
});
app.get("/processedResource", (req, res) => {
  console.log(processedData);
  res.json(processedData);
});

const pushItemList = (
  data,
  { id, type, name, orderId, size_x, size_y, size_z, weight }
) => {
  data.map((item) => {
    if (item.id === orderId && item.type === "Order") {
      item.itemList.push({
        id,
        name,
        type,
        orderId,
        size_x,
        size_y,
        size_z,
        weight,
      });
    }
  });
};

app.post("/container", (req, res) => {
  const { id, type, size_x, size_y, size_z, max_weight } = req.body;
  data.push({ id, type, size_x, size_y, size_z, max_weight });
  res.status(201).json({ message: "Container Created" });
});

app.post("/order", (req, res) => {
  const { id, type, name, priority } = req.body;
  let effectivePriority = priority;
  if (effectivePriority === undefined) {
    let highestPriority = 0;
    for (const item of data) {
      console.log("here", item);
      if (item.type === "Order" && item.priority > highestPriority) {
        highestPriority = item.priority;
      }
    }
    effectivePriority = highestPriority + 1;
  }
  if (typeof effectivePriority === "string")
    effectivePriority = parseInt(effectivePriority, 10);
  const itemList = [];
  data.push({ id, type, name, priority: effectivePriority, itemList });
  data.sort((a, b) => a.priority - b.priority);
  res.status(201).json({ message: "Order Created" });
});

app.post("/item", (req, res) => {
  const { id, type, name, orderId, size_x, size_y, size_z, weight } = req.body;
  pushItemList(data, {
    id,
    name,
    type,
    orderId,
    size_x,
    size_y,
    size_z,
    weight,
  });

  res.status(201).json({ message: "Item Added" });
});

app.put("/DND", (req, res) => {
  const updatedOrders = req.body;

  data = data.filter((item) => item.type !== "Order");
  console.log(updatedOrders);
  console.log(data);
  updatedOrders.forEach((order) => {
    data.push({
      id: order.id,
      type: "Order",
      name: order.name,
      priority: order.priority,
      itemList: order.itemList,
    });
  });

  res.json({ message: "Orders updated successfully" });
});

app.delete("/orders/:orderId/items/:itemId", (req, res) => {
  const orderId = req.params.orderId;
  const itemId = req.params.itemId;
  console.log("order id:", orderId);
  console.log("id:", itemId);
  let orderFound = false;
  data.forEach((item) => {
    if (item.type === "Order" && item.id === orderId) {
      item.itemList = item.itemList.filter((item) => item.id !== itemId);
      orderFound = true;
    }
  });
  if (orderFound) {
    res.json({ message: "Item deleted from order" });
  } else {
    res.status(404).json({ error: "Order not found" });
  }
});

app.post("/save-json", (req, res) => {
  const newData = data.filter((item) => item.type !== "VehicleContainer");
  newData.push(req.body);
  const jsonData = newData;
  // const jsonData = req.body;
  console.log(jsonData);
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
