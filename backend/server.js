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
  ID: "1",
  Name: "Truck",
  Type: "VehicleContainer",
  SizeX: 150,
  SizeY: 150,
  SizeZ: 150,
  MaxWeight: 30,
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
  { ID, Type, Name, OrderID, SizeX, SizeY, SizeZ, Weight }
) => {
  data.map((item) => {
    if (item.ID === OrderID && item.Type === "Order") {
      item.ItemList.push({
        ID,
        Name,
        Type,
        OrderID,
        SizeX,
        SizeY,
        SizeZ,
        Weight,
      });
    }
  });
};

app.post("/container", (req, res) => {
  const { ID, Type, SizeX, SizeY, SizeZ, MaxWeight } = req.body;
  data.push({ ID, Type, SizeX, SizeY, SizeZ, MaxWeight });
  res.status(201).json({ message: "Container Created" });
});

app.post("/order", (req, res) => {
  const { ID, Type, Name, Priority } = req.body;
  let effectivePriority = Priority;
  if (effectivePriority === undefined) {
    let highestPriority = 0;
    for (const item of data) {
      console.log("here", item);
      if (item.Type === "Order" && item.Priority > highestPriority) {
        highestPriority = item.Priority;
      }
    }
    effectivePriority = highestPriority + 1;
  }
  if (typeof effectivePriority === "string")
    effectivePriority = parseInt(effectivePriority, 10);
  const ItemList = [];
  data.push({ ID, Type, Name, Priority: effectivePriority, ItemList });
  data.sort((a, b) => a.Priority - b.Priority);
  res.status(201).json({ message: "Order Created" });
});

app.post("/item", (req, res) => {
  const { ID, Type, Name, OrderID, SizeX, SizeY, SizeZ, Weight } = req.body;
  pushItemList(data, {
    ID,
    Name,
    Type,
    OrderID,
    SizeX,
    SizeY,
    SizeZ,
    Weight,
  });

  res.status(201).json({ message: "Item Added" });
});

app.put("/DND", (req, res) => {
  const updatedOrders = req.body;

  data = data.filter((item) => item.Type !== "Order");
  console.log(updatedOrders);
  console.log(data);
  updatedOrders.forEach((order) => {
    data.push({
      ID: order.ID,
      Type: "Order",
      Name: order.Name,
      Priority: order.Priority,
      ItemList: order.ItemList,
    });
  });

  res.json({ message: "Orders updated successfully" });
});

app.delete("/orders/:OrderID", (req, res) => {
  const OrderID = req.params.OrderID;

  const initialLength = data.length;
  data = data.filter((item) => !(item.ID === OrderID && item.Type === "Order"));

  if (data.length < initialLength) {
    res.json({ message: "Order deleted from data" });
  } else {
    res.status(404).json({ message: "Order not found" });
  }
});

app.delete("/containers/:containerId", (req, res) => {
  const containerId = req.params.containerId;

  const initialLength = data.length;
  data = data.filter(
    (item) => !(item.ID === containerId && item.Type === "Container")
  );

  if (data.length < initialLength) {
    res.json({ message: "Container deleted from data" });
  } else {
    res.status(404).json({ message: "Container not found" });
  }
});

app.delete("/orders/:OrderID/items/:itemId", (req, res) => {
  const OrderID = req.params.OrderID;
  const itemId = req.params.itemId;
  let orderFound = false;
  data.forEach((item) => {
    if (item.Type === "Order" && item.ID === OrderID) {
      item.ItemList = item.ItemList.filter((item) => item.ID !== itemId);
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
  const newData = data.filter((item) => item.Type !== "VehicleContainer");
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
