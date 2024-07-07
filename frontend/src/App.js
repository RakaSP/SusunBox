import React, { useState, useEffect } from "react";
import axios from "axios";
import { saveAs } from "file-saver";

function App() {
  const [data, setData] = useState([]);
  const [newResource, setNewResource] = useState({
    id: "",
    name: "",
    category: "",
    containerId: "",
  });

  const [updateResource, setUpdateResource] = useState({
    id: "",
    name: "",
    category: "",
  });

  const fetchData = async () => {
    try {
      const response = await axios.get("http://localhost:3001/resource");
      setData(response.data);
    } catch (error) {
      console.error("Error fetching data", error);
    }
  };

  const createResource = async () => {
    if (
      newResource.category === "" ||
      newResource.id === "" ||
      newResource.name === "" ||
      (newResource.category === "Item" && newResource.containerId === "")
    ) {
      alert("Input Data Properly");
    } else {
      console.log(newResource);
      try {
        if (newResource.category === "Item") {
          await axios.post("http://localhost:3001/item", newResource);
          fetchData();
        } else {
          await axios.post("http://localhost:3001/container", newResource);
          fetchData();
        }
      } catch (error) {
        console.error("Error creating resource", error);
      }
    }
  };

  const updateResourceHandler = async () => {
    try {
      await axios.put(
        `http://localhost:3001/resource/${updateResource.id}`,
        updateResource
      );
      fetchData();
    } catch (error) {
      console.error("Error updating resource", error);
    }
  };

  const deleteResource = async (id, category) => {
    try {
      if (category === "Container") {
        await axios.delete(`http://localhost:3001/resource/${id}`);
      } else if (category === "Item") {
        const updatedData = data.map((item) => {
          if (item.category === "Container") {
            item.itemList = item.itemList.filter((it) => it.id !== id);
          }
          return item;
        });
        await axios.put(`http://localhost:3001/resource/${id}`, updatedData);
        setData(updatedData);
      }
      fetchData();
    } catch (error) {
      console.error("Error deleting resource", error);
    }
  };

  const downloadJson = async () => {
    try {
      await axios.post("http://localhost:3001/save-json", data);
      alert("JSON file saved on server");
    } catch (error) {
      console.error("Error saving JSON file on server", error);
    }
  };

  const renderOptions = (data) => {
    return data
      .filter((item) => item.category === "Container")
      .map((item) => (
        <React.Fragment key={item.id}>
          <option value={item.id}>
            {item.id}: {item.name}
          </option>
          {item.itemList &&
            item.itemList.length > 0 &&
            renderOptions(item.itemList)}
        </React.Fragment>
      ));
  };
  const renderList = (data) => {
    return data.map((item) => (
      <React.Fragment key={item.id}>
        {item.category === "Container" ? (
          <>
            <h4>{item.id}</h4>
            <ul>
              {item.itemList.map((item) => (
                <li key={item.id}>
                  <p>
                    {item.id} {item.name}
                  </p>
                  {item.category === "Container" && renderList(item.itemList)}
                </li>
              ))}
            </ul>
          </>
        ) : (
          <>
            <p>
              {item.id} {item.name}
            </p>
          </>
        )}
      </React.Fragment>
    ));
  };
  useEffect(() => {
    fetchData();
  }, []);
  return (
    <div className="App">
      <h1>Resource Manager</h1>
      <div>
        <h2>Create Resource</h2>
        <select
          value={newResource.category}
          onChange={(e) =>
            setNewResource({ ...newResource, category: e.target.value })
          }
        >
          <option value="">Select Category</option>
          <option value="Container">Container</option>
          <option value="Item">Item</option>
        </select>
        <div>
          <label>Select Container ID:</label>
          <select
            value={newResource.containerId}
            onChange={(e) =>
              setNewResource({
                ...newResource,
                containerId: e.target.value,
              })
            }
          >
            <option value="">Select Container ID</option>
            {renderOptions(data)}
          </select>
        </div>

        <input
          type="text"
          placeholder="ID"
          value={newResource.id}
          onChange={(e) =>
            setNewResource({ ...newResource, id: e.target.value })
          }
        />
        <input
          type="text"
          placeholder="Name"
          value={newResource.name}
          onChange={(e) =>
            setNewResource({ ...newResource, name: e.target.value })
          }
        />
        <button onClick={createResource}>Create</button>
      </div>
      <div>
        <h2>Update Resource</h2>
        <input
          type="text"
          placeholder="ID"
          value={updateResource.id}
          onChange={(e) =>
            setUpdateResource({ ...updateResource, id: e.target.value })
          }
        />
        <input
          type="text"
          placeholder="Name"
          value={updateResource.name}
          onChange={(e) =>
            setUpdateResource({ ...updateResource, name: e.target.value })
          }
        />
        <button onClick={updateResourceHandler}>Update</button>
      </div>
      <div>
        <h2>Resources</h2>
        <ul>{renderList(data)}</ul>
      </div>
      <button onClick={downloadJson}>Download JSON</button>
    </div>
  );
}

export default App;
