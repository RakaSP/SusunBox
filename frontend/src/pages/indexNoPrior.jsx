import React, { useState, useEffect } from "react";
import axios from "axios";
import { fakedata } from "../constants/fakedata";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faXmark, faPlus } from "@fortawesome/free-solid-svg-icons";
const Index = () => {
  const labelStyle =
    "absolute text-[#0E2040] opacity-72 font-semibold transition-all duration-200 z-[0]";
  const sizeFormStyle =
    "max-w-[140px] pt-3 pb-1 px-3 border border-gray-300 rounded text-[16px] h-full ";
  const headerContainerStyle =
    "flex-1 flex items-center justify-center border-b-2";
  const headerStyle = "text-[20px] font-poppins font-semibold ";
  const itemContainerStyle =
    "border-2 border-[#6F6F70] rounded-md w-full p-4 mb-4";
  const [data, setData] = useState([]);
  const [newResource, setNewResource] = useState({
    id: null,
    type: "Container",
  });

  const [updateResource, setUpdateResource] = useState({
    id: "",
    name: "",
    type: "",
  });

  const [selectedResource, setSelectedResource] = useState("Container");

  const resourceHeaderClickHandler = (type) => {
    setSelectedResource(type);
    setNewResource({ ...newResource, type: type });
  };

  const addItemClickHandler = (selectedOrderId) => {
    setSelectedResource("Item");
    setNewResource({ ...newResource, type: "Item", orderId: selectedOrderId });
    setShowForm(true);
  };

  const [showForm, setShowForm] = useState(false);

  const fetchData = async () => {
    try {
      setData(fakedata);
      // const response = await axios.get("http://localhost:3001/resource");
      // await setData(response.data);
      console.log(data);
    } catch (error) {
      console.error("Error fetching data", error);
    }
  };

  const createResource = async () => {
    try {
      if (newResource.type === "Item") {
        await axios.post("http://localhost:3001/item", newResource);
      } else if (newResource.type === "Order") {
        await axios.post("http://localhost:3001/order", newResource);
      } else {
        await axios.post("http://localhost:3001/container", newResource);
      }
      fetchData();
      console.log(data);
    } catch (error) {
      console.error("Error creating resource", error);
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

  const deleteResource = async (id, type) => {
    try {
      if (type === "Container") {
        await axios.delete(`http://localhost:3001/resource/${id}`);
      } else if (type === "Item") {
        const updatedData = data.map((item) => {
          if (item.type === "Container") {
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

  const renderSelectType = (type) => {
    return (
      <React.Fragment>
        <input
          type="text"
          className="block w-full p-2 mb-4 border border-gray-300 rounded bg-[#A7AABD]"
          value={type}
          onChange={(e) =>
            setNewResource({ ...newResource, type: e.target.value })
          }
          disabled
        />
      </React.Fragment>
    );
  };
  const [inputIdFocused, setInputIdFocused] = useState(false);
  const renderInputId = (type) => {
    return (
      <React.Fragment>
        <div className="relative h-[48px] mb-4">
          <label
            htmlFor="id"
            className={`${labelStyle} ${
              inputIdFocused
                ? "text-[12px] left-[8px] top-[2px]"
                : "left-2 top-3"
            }`}
            style={{ pointerEvents: "none" }}
          >
            {selectedResource === "Item" ? "Item ID" : "ID"}
          </label>
          <input
            id="id"
            className={`${
              type ? "block" : "hidden"
            } w-full pt-3 pb-1 px-3 border border-gray-300 rounded text-base h-full text-[16px]`}
            type="number"
            value={newResource.id}
            onFocus={() => setInputIdFocused(true)}
            onBlur={(e) =>
              e.target.value.trim() === "" && setInputIdFocused(false)
            }
            onChange={(e) =>
              setNewResource({ ...newResource, id: e.target.value })
            }
          />
        </div>
      </React.Fragment>
    );
  };

  const renderOrderOptions = (data) => {
    return data
      .filter((item) => item.type === "Order")
      .map((item) => (
        <React.Fragment key={"Order-" + item.id}>
          <option value={item.id}>
            {item.id}: {item.name}
          </option>
          {item.itemList &&
            item.itemList.length > 0 &&
            renderOrderOptions(item.itemList)}
        </React.Fragment>
      ));
  };

  const renderSelectOrder = (selectedType) => {
    console.log(newResource.orderId);
    return (
      <React.Fragment>
        <div
          className={`${
            selectedType === "Item" ? "mb-4" : "hidden"
          } relative h-[48px] mb-4`}
        >
          <label
            htmlFor="order"
            className={`${labelStyle} text-[12px] left-[8px] top-[2px]`}
          >
            Order ID
          </label>
          <input
            type="text"
            className="block w-full px-3 pt-3 pb-1 border border-gray-300 rounded"
            disabled
            value={newResource.orderId}
          />
        </div>
      </React.Fragment>
    );
  };

  const [inputNameFocused, setinputNameFocused] = useState(false);

  const renderInputName = (selectedType) => {
    return (
      <React.Fragment>
        <div
          className={`${
            selectedType === "Item" || selectedType === "Order"
              ? "block"
              : "hidden"
          } relative h-[48px] mb-4`}
        >
          <label
            htmlFor="name"
            className={`${labelStyle} ${
              inputNameFocused
                ? "text-[12px] left-[8px] top-[2px]"
                : "left-2 top-3"
            }`}
            style={{ pointerEvents: "none" }}
          >
            {selectedType === "Item" ? "Item Name" : "Customer Name"}
          </label>
          <input
            className={` w-full px-3 h-[48px] pt-3 pb-1 mb-4 border border-gray-300 rounded`}
            type="text"
            onFocus={() => setinputNameFocused(true)}
            onBlur={(e) =>
              e.target.value.trim() === "" && setinputNameFocused(false)
            }
            value={newResource.name}
            onChange={(e) =>
              setNewResource({ ...newResource, name: e.target.value })
            }
          />
        </div>
      </React.Fragment>
    );
  };

  const [inputPriorityFocused, setInputPriorityFocused] = useState(false);
  const renderInputPriority = (selectedType) => {
    if (selectedType === "Order") {
      return (
        <React.Fragment>
          <div className="relative h-[48px] mb-4">
            <label
              htmlFor="priority"
              className={`${labelStyle} ${
                inputPriorityFocused
                  ? "text-[12px] left-[8px] top-[2px]"
                  : "left-2 top-3"
              }`}
            >
              Priority
            </label>
            <input
              className="block w-full p-2 mb-4 border border-gray-300 rounded"
              type="number"
              value={newResource.priority}
              onFocus={() => setInputPriorityFocused(true)}
              onBlur={(e) =>
                e.target.value.trim() === "" && setInputPriorityFocused(false)
              }
              onChange={(e) =>
                setNewResource({ ...newResource, priority: e.target.value })
              }
            />
          </div>
        </React.Fragment>
      );
    }
  };

  const [inputSizeFocused, setInputSizeFocused] = useState({
    size_x: false,
    size_y: false,
    size_z: false,
  });

  const renderInputSize = (selectedType) => {
    console.log(selectedType);
    if (selectedType === "Item" || selectedType === "Container") {
      return (
        <div className="flex flex-row justify-between h-[48px] mb-4">
          <div className="relative h-full">
            <label
              htmlFor="size_x"
              className={`${labelStyle} ${
                inputSizeFocused.size_x || newResource.size_x
                  ? "text-[12px] left-[8px] top-[2px]"
                  : "left-2 top-3"
              }`}
              style={{ pointerEvents: "none" }}
            >
              Size X
            </label>
            <input
              id="size_x"
              className={`${sizeFormStyle} ${
                inputSizeFocused.size_x ? "border-blue-500" : ""
              }`}
              type="number"
              value={newResource.size_x}
              onFocus={() =>
                setInputSizeFocused({ ...inputSizeFocused, size_x: true })
              }
              onBlur={(e) =>
                e.target.value.trim() === "" &&
                setInputSizeFocused({ ...inputSizeFocused, size_x: false })
              }
              onChange={(e) =>
                setNewResource({ ...newResource, size_x: e.target.value })
              }
            />
          </div>
          <div className="relative">
            <label
              htmlFor="size_y"
              className={`${labelStyle} ${
                inputSizeFocused.size_y
                  ? "text-[12px] left-[8px] top-[2px]"
                  : "left-2 top-3"
              }`}
              style={{ pointerEvents: "none" }}
            >
              Size Y
            </label>
            <input
              id="size_y"
              className={`${sizeFormStyle} ${
                inputSizeFocused.size_y ? "border-blue-500" : ""
              }`}
              type="number"
              value={newResource.size_y}
              onFocus={() =>
                setInputSizeFocused({ ...inputSizeFocused, size_y: true })
              }
              onBlur={(e) =>
                e.target.value.trim() === "" &&
                setInputSizeFocused({ ...inputSizeFocused, size_y: false })
              }
              onChange={(e) =>
                setNewResource({ ...newResource, size_y: e.target.value })
              }
            />
          </div>
          <div className="relative">
            <label
              htmlFor="size_z"
              className={`${labelStyle} ${
                inputSizeFocused.size_z
                  ? "text-[12px] left-[8px] top-[2px]"
                  : "left-2 top-3"
              }`}
              style={{ pointerEvents: "none" }}
            >
              Size Z
            </label>
            <input
              id="size_z"
              className={`${sizeFormStyle} ${
                inputSizeFocused.size_z ? "border-blue-500" : ""
              } text-base`}
              type="number"
              value={newResource.size_z}
              onFocus={() =>
                setInputSizeFocused({ ...inputSizeFocused, size_z: true })
              }
              onBlur={(e) =>
                e.target.value.trim() === "" &&
                setInputSizeFocused({ ...inputSizeFocused, size_z: false })
              }
              onChange={(e) =>
                setNewResource({ ...newResource, size_z: e.target.value })
              }
            />
          </div>
        </div>
      );
    }
    return null;
  };
  const [inputMWFocused, setInputMWFocused] = useState(false);
  const renderInputMaxWeight = (selectedType) => {
    if (selectedType === "Container") {
      return (
        <React.Fragment>
          <div className="relative h-[48px] mb-4">
            <label
              htmlFor="max_weight"
              className={`${labelStyle} ${
                inputMWFocused
                  ? "text-[12px] left-[8px] top-[2px]"
                  : "left-2 top-3"
              }`}
              style={{ pointerEvents: "none" }}
            >
              Max Weight (Kg)
            </label>
            <input
              className="w-full h-full pt-3 pb-1 px-3 border border-gray-300 rounded text-base  text-[16px]"
              type="number"
              value={newResource.max_weight}
              onFocus={() => setInputMWFocused(true)}
              onBlur={(e) =>
                e.target.value.trim() === "" && setInputMWFocused(false)
              }
              onChange={(e) =>
                setNewResource({ ...newResource, max_weight: e.target.value })
              }
            />
          </div>
        </React.Fragment>
      );
    }
  };

  const [inputWeightFocused, setInputWeightFocused] = useState(false);
  const renderInputWeight = (selectedType) => {
    if (selectedType === "Item") {
      return (
        <React.Fragment>
          <div className="h-[48px] relative mb-4">
            <label
              htmlFor="weight"
              className={`${labelStyle} ${
                inputWeightFocused
                  ? "text-[12px] left-[8px] top-[2px]"
                  : "left-2 top-3"
              }`}
            >
              Weight (Kg)
            </label>
            <input
              className="block w-full p-2 mb-4 border border-gray-300 rounded"
              type="number"
              value={newResource.weight}
              onFocus={() => setInputWeightFocused(true)}
              onBlur={(e) =>
                e.target.value.trim === "" && setInputWeightFocused(false)
              }
              onChange={(e) =>
                setNewResource({ ...newResource, weight: e.target.value })
              }
            />
          </div>
        </React.Fragment>
      );
    }
  };

  const renderResources = (data) => {
    console.log(data);

    const activeColor = "#6F6F70";
    const inactiveColor = "#0E2040";
    console.log(selectedResource);
    return (
      <React.Fragment>
        <div className="w-[480px] border-2 border-[#6F6F70] rounded-lg mt-4 bg-white">
          <div className="w-full flex flex-row h-[64px]">
            <div
              className={`${headerContainerStyle} border-[${
                selectedResource === "Container" ? activeColor : inactiveColor
              }]`}
              onClick={() => resourceHeaderClickHandler("Container")}
            >
              <p
                className={`${headerStyle} text-[${
                  selectedResource === "Container" ? activeColor : inactiveColor
                }]`}
              >
                Containers
              </p>
            </div>
            <div
              className={`${headerContainerStyle} border-[${
                selectedResource === "Order" ? activeColor : inactiveColor
              }]`}
              onClick={() => resourceHeaderClickHandler("Order")}
            >
              <p
                className={`${headerStyle} text-[${
                  selectedResource === "Order" ? activeColor : inactiveColor
                }]`}
              >
                Orders
              </p>
            </div>
          </div>
          <hr className="w-full" />

          <div className="w-full p-[20px]">
            <div
              className="border-dashed border-2 mb-4 border-[#067C89] flex items-center justify-center rounded-md text-[22px] text-[#067C89] cursor-pointer hover:bg-[#067C89] hover:text-[#fff]"
              onClick={() => setShowForm(!showForm)}
            >
              +
            </div>
            {selectedResource === "Container" &&
              data
                .filter((item) => item.type === "Container")
                .map((container) => {
                  if (!container.weight) container.weight = 0;
                  container.capacity =
                    (container.weight / container.max_weight) * 100;
                  let capacityLabelColor = "#008000";
                  if (container.capacity > 72) {
                    capacityLabelColor = "#8B0000";
                  } else if (container.capacity > 38) {
                    capacityLabelColor = "#FF8C00";
                  }

                  return (
                    <div
                      key={"Con-" + container.id}
                      className={`${itemContainerStyle}`}
                    >
                      <div className={`text-[#0e2040] font-semibold `}>
                        Container #{container.id}
                      </div>
                      <div className={`text-sm text-[#0e2040] opacity-[0.72]`}>
                        Size: {container.size_x}, {container.size_y},{" "}
                        {container.size_z}
                      </div>
                      <div className="flex flex-row">
                        <p className="flex-1 text-sm text-[#0e2040] opacity-[0.72]">
                          Max Weight: {container.max_weight}
                          <span>Kg</span>
                        </p>
                        {}
                        <p className="flex-1 text-sm text-[#0e2040] opacity-[0.72]">
                          Weight: {container.weight}
                          <span>Kg</span>
                        </p>
                      </div>
                      <div
                        className={`text-sm opacity-[0.72]`}
                        style={{ color: capacityLabelColor }}
                      >
                        Capacity: {container.capacity}%
                      </div>
                    </div>
                  );
                })}
            {selectedResource === "Order" &&
              data
                .filter((item) => item.type === "Order")
                .map((order) => (
                  <div
                    key={"Order-" + order.id}
                    className={`${itemContainerStyle}`}
                  >
                    <div className="flex flex-row justify-between mb-4 items-center text-[#0e2040] font-semibold">
                      <div className="">Order#{order.id}</div>
                      <div
                        className="w-[40px] h-[40px] rounded-md flex items-center justify-center font-[24px] bg-[#378EFF] cursor-pointer"
                        onClick={() => addItemClickHandler(order.id)}
                      >
                        <FontAwesomeIcon
                          className="h-[42%] w-[42%]"
                          icon={faPlus}
                        />
                      </div>
                    </div>

                    {order.itemList.map((item) => (
                      <div
                        key={"Item-" + item.id}
                        className={`${itemContainerStyle}`}
                      >
                        <div>Item#{item.id}</div>
                        <div>Item Name: {item.name}</div>
                        <div>
                          Size: {item.size_x}, {item.size_y}, {item.size_z}
                        </div>
                        <div>Weight: {item.weight}</div>
                      </div>
                    ))}
                  </div>
                ))}
          </div>
        </div>
      </React.Fragment>
    );
  };

  const renderForm = () => {
    console.log(selectedResource);
    return (
      <React.Fragment>
        <div className="w-full h-full fixed bg-black bg-opacity-40 flex justify-center items-center text-[#0E2040] z-10">
          <div className="border-2 border-blue-200 p-4 rounded-lg shadow-md bg-white w-[480px] relative">
            <h2 className="text-lg font-semibold mb-4">Create Resource</h2>
            <FontAwesomeIcon
              className="w-[24px] h-[24px] text-[#0E2040] absolute right-4 top-4 hover:text-[#558EF8]"
              icon={faXmark}
              onClick={() => setShowForm(false)}
            />
            {renderSelectType(selectedResource)}
            {renderSelectOrder(newResource.type)}
            {renderInputId(newResource.type)}
            {renderInputName(newResource.type)}
            {renderInputPriority(newResource.type)}
            {renderInputSize(newResource.type)}
            {renderInputMaxWeight(newResource.type)}
            {renderInputWeight(newResource.type)}
            <button
              className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600 transition duration-200"
              onClick={createResource}
            >
              Create
            </button>
          </div>
        </div>
      </React.Fragment>
    );
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className="w-full min-h-[100vh] flex items-center flex-col font-poppins bg-[#f4fbff]">
      {showForm && renderForm(selectedResource)}
      <h1 className="text-[26px] font-bold">Resource Manager</h1>
      <div className="w-[480px]">{renderResources(data)}</div>
      <button onClick={downloadJson}>Download JSON</button>
    </div>
  );
};

export default Index;
