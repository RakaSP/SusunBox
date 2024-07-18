import React, { useState, useEffect } from "react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { RotatingLines } from "react-loader-spinner";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { fakedata } from "../constants/fakedata";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faXmark,
  faPlus,
  faTrash,
  faCheck,
  faMinus,
} from "@fortawesome/free-solid-svg-icons";
import logo from "../assets/susunbox_logo.png";
const Index = () => {
  // Styles
  const labelStyle =
    "absolute text-[#0E2040] opacity-[0.72] font-semibold transition-all duration-200 z-[0]";
  const sizeFormStyle =
    "max-w-[140px] pt-3 pb-1 px-3 border border-gray-300 rounded text-[16px] h-full ";
  const headerContainerStyle =
    "flex-1 flex items-center justify-center border-b-2";
  const headerStyle = "text-[20px] font-poppins font-semibold ";
  const itemContainerStyle =
    "border-2 border-[#6F6F70] rounded-md w-full p-4 mb-4";

  const navigate = useNavigate();
  // Data States
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState([]);

  const [containersData, setContainersData] = useState([]);
  const [vehicleData, setVehicleData] = useState([]);
  const [ordersData, setOrdersData] = useState([]);
  const [newResource, setNewResource] = useState({
    ID: null,
    Type: "Container",
  });

  // Form State
  const [showForm, setShowForm] = useState(false);
  const [selectedResource, setSelectedResource] = useState("Container");

  // Label Animation State
  const [inputIdFocused, setInputIdFocused] = useState(false);
  const [inputNameFocused, setinputNameFocused] = useState(false);
  const [inputPriorityFocused, setInputPriorityFocused] = useState(false);
  const [inputSizeFocused, setInputSizeFocused] = useState({
    SizeX: false,
    SizeY: false,
    SizeZ: false,
  });
  const [inputMWFocused, setInputMWFocused] = useState(false);
  const [inputWeightFocused, setInputWeightFocused] = useState(false);
  const [lifoActive, setLifoActive] = useState(false);

  // Handlers

  // Swap data on drag and drop event
  const handleDragEnd = async (result) => {
    if (result.destination !== null) {
      if (result.destination.index === result.source.index) {
        return;
      }

      const updatedData = Array.from(ordersData);
      const [reorderedItem] = updatedData.splice(result.source.index, 1);
      let destinationIndex = result.destination.index;
      if (destinationIndex > result.source.index) destinationIndex--;
      const destinationItem = updatedData[destinationIndex];

      const tempPriority = reorderedItem.Priority;
      reorderedItem.Priority = destinationItem.Priority;
      destinationItem.Priority = tempPriority;

      updatedData.splice(result.destination.index, 0, reorderedItem);

      setOrdersData(updatedData);
      try {
        await axios.put("http://localhost:3001/DND", updatedData);
        console.log("Data sorted and updated in backend");
      } catch (error) {
        console.error("Error updating data in backend:", error);
      }
    }
  };

  const resourceHeaderClickHandler = (Type) => {
    setSelectedResource(Type);
    setNewResource({ ...newResource, Type: Type });
  };

  const addItemClickHandler = (selectedOrderId) => {
    setSelectedResource("Item");
    setNewResource({ ...newResource, Type: "Item", OrderID: selectedOrderId });
    setShowForm(true);
  };

  const closeFormClickHandler = () => {
    setShowForm(false);
    if (selectedResource === "Item") {
      setSelectedResource("Order");
      setNewResource({ ...newResource, Type: "Order" });
    }
  };

  const batchSetState = (resData) => {
    const getVehicleData = resData.filter(
      (item) => item.Type === "VehicleContainer"
    );
    setData(resData);
    if (vehicleData.length === 0) {
      setVehicleData(getVehicleData[0]);
    }
    setContainersData(resData.filter((item) => item.Type === "Container"));
    setOrdersData(resData.filter((item) => item.Type === "Order"));
    setLoading(false);
  };

  // Axios API calls
  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await axios.get("http://localhost:3001/resource");
      console.log(response.data);
      batchSetState(response.data);
    } catch (error) {
      console.error("Error fetching data", error);
    }
  };

  useEffect(() => {
    if (data.length === 0) fetchData();
  }, []);

  const createResource = async () => {
    if (showForm) {
      setShowForm(false);
    }

    try {
      if (newResource.Type === "Item") {
        await axios.post("http://localhost:3001/item", newResource);
      } else if (newResource.Type === "Order") {
        await axios.post("http://localhost:3001/order", newResource);
      } else {
        await axios.post("http://localhost:3001/container", newResource);
      }
      setNewResource({ ID: null, Type: newResource.Type });
      fetchData();
      console.log(data);
    } catch (error) {
      console.error("Error creating resource", error);
    }
  };

  const deleteResource = async (ID, itemId) => {
    try {
      await axios.delete(`http://localhost:3001/orders/${ID}/items/${itemId}`);
      fetchData();
    } catch (error) {
      console.error("Error deleting resource", error);
    }
  };

  const deleteOrder = async (ID) => {
    try {
      await axios.delete(`http://localhost:3001/orders/${ID}`);
      fetchData();
    } catch (error) {
      console.error("Error deleting order", error);
    }
  };

  const deleteContainer = async (ID) => {
    try {
      await axios.delete(`http://localhost:3001/containers/${ID}`);
      fetchData();
    } catch (error) {
      console.error("Error deleting order", error);
    }
  };

  const downloadJson = async () => {
    try {
      await axios.post("http://localhost:3001/save-json", vehicleData);
      navigate("/animation");
      alert("JSON file saved on server");
    } catch (error) {
      console.error("Error saving JSON file on server", error);
    }
  };

  // Render Functions
  const renderSelectType = (Type) => {
    return (
      <React.Fragment>
        <input
          Type="text"
          className="block w-full p-2 mb-4 border border-gray-300 rounded bg-[#A7AABD]"
          value={Type}
          onChange={(e) =>
            setNewResource({ ...newResource, Type: e.target.value })
          }
          disabled
        />
      </React.Fragment>
    );
  };

  const renderInputId = (Type) => {
    return (
      <React.Fragment>
        <div className="relative h-[48px] mb-4">
          <label
            htmlFor="ID"
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
            id="ID"
            className={`${
              Type ? "block" : "hidden"
            } w-full pt-3 pb-1 px-3 border border-gray-300 rounded text-base h-full text-[16px]`}
            Type="number"
            value={newResource.ID}
            onFocus={() => setInputIdFocused(true)}
            onBlur={(e) =>
              e.target.value.trim() === "" && setInputIdFocused(false)
            }
            onChange={(e) =>
              setNewResource({ ...newResource, ID: e.target.value })
            }
          />
        </div>
      </React.Fragment>
    );
  };

  const renderOrderOptions = (data) => {
    return data
      .filter((item) => item.Type === "Order")
      .map((item) => (
        <React.Fragment key={"Order-" + item.ID}>
          <option value={item.ID}>
            {item.ID}: {item.Name}
          </option>
          {item.ItemList &&
            item.ItemList.length > 0 &&
            renderOrderOptions(item.ItemList)}
        </React.Fragment>
      ));
  };

  const renderSelectOrder = (selectedType) => {
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
            Type="text"
            className="block w-full px-3 pt-3 pb-1 border border-gray-300 rounded bg-[#A7AABD]"
            disabled
            value={newResource.OrderID}
            onChange={(e) =>
              setNewResource({ ...newResource, OrderID: e.target.value })
            }
          />
        </div>
      </React.Fragment>
    );
  };

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
            htmlFor="Name"
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
            Type="text"
            onFocus={() => setinputNameFocused(true)}
            onBlur={(e) =>
              e.target.value.trim() === "" && setinputNameFocused(false)
            }
            value={newResource.Name}
            onChange={(e) =>
              setNewResource({ ...newResource, Name: e.target.value })
            }
          />
        </div>
      </React.Fragment>
    );
  };

  const renderInputPriority = (selectedType) => {
    if (selectedType === "Order") {
      return (
        <React.Fragment>
          <div className="relative h-[48px] mb-4">
            <label
              htmlFor="Priority"
              className={`${labelStyle} ${
                inputPriorityFocused
                  ? "text-[12px] left-[8px] top-[2px]"
                  : "left-2 top-3"
              }`}
              style={{ pointerEvents: "none" }}
            >
              Priority
            </label>
            <input
              className={`w-full pt-3 pb-1 px-3 border border-gray-300 rounded text-base h-full text-[16px]`}
              Type="number"
              value={newResource.Priority}
              onFocus={() => setInputPriorityFocused(true)}
              onBlur={(e) =>
                e.target.value.trim() === "" && setInputPriorityFocused(false)
              }
              onChange={(e) =>
                setNewResource({ ...newResource, Priority: e.target.value })
              }
            />
          </div>
        </React.Fragment>
      );
    }
  };

  const renderInputSize = (selectedType) => {
    if (selectedType === "Item" || selectedType === "Container") {
      return (
        <div className="flex flex-row justify-between h-[48px] mb-4">
          <div className="relative h-full">
            <label
              htmlFor="SizeX"
              className={`${labelStyle} ${
                inputSizeFocused.SizeX || newResource.SizeX
                  ? "text-[12px] left-[8px] top-[2px]"
                  : "left-2 top-3"
              }`}
              style={{ pointerEvents: "none" }}
            >
              Size X
            </label>
            <input
              id="SizeX"
              className={`${sizeFormStyle} ${
                inputSizeFocused.SizeX ? "border-blue-500" : ""
              }`}
              Type="number"
              value={newResource.SizeX}
              onFocus={() =>
                setInputSizeFocused({ ...inputSizeFocused, SizeX: true })
              }
              onBlur={(e) =>
                e.target.value.trim() === "" &&
                setInputSizeFocused({ ...inputSizeFocused, SizeX: false })
              }
              onChange={(e) =>
                setNewResource({ ...newResource, SizeX: e.target.value })
              }
            />
          </div>
          <div className="relative">
            <label
              htmlFor="SizeY"
              className={`${labelStyle} ${
                inputSizeFocused.SizeY
                  ? "text-[12px] left-[8px] top-[2px]"
                  : "left-2 top-3"
              }`}
              style={{ pointerEvents: "none" }}
            >
              Size Y
            </label>
            <input
              id="SizeY"
              className={`${sizeFormStyle} ${
                inputSizeFocused.SizeY ? "border-blue-500" : ""
              }`}
              Type="number"
              value={newResource.SizeY}
              onFocus={() =>
                setInputSizeFocused({ ...inputSizeFocused, SizeY: true })
              }
              onBlur={(e) =>
                e.target.value.trim() === "" &&
                setInputSizeFocused({ ...inputSizeFocused, SizeY: false })
              }
              onChange={(e) =>
                setNewResource({ ...newResource, SizeY: e.target.value })
              }
            />
          </div>
          <div className="relative">
            <label
              htmlFor="SizeZ"
              className={`${labelStyle} ${
                inputSizeFocused.SizeZ
                  ? "text-[12px] left-[8px] top-[2px]"
                  : "left-2 top-3"
              }`}
              style={{ pointerEvents: "none" }}
            >
              Size Z
            </label>
            <input
              id="SizeZ"
              className={`${sizeFormStyle} ${
                inputSizeFocused.SizeZ ? "border-blue-500" : ""
              } text-base`}
              Type="number"
              value={newResource.SizeZ}
              onFocus={() =>
                setInputSizeFocused({ ...inputSizeFocused, SizeZ: true })
              }
              onBlur={(e) =>
                e.target.value.trim() === "" &&
                setInputSizeFocused({ ...inputSizeFocused, SizeZ: false })
              }
              onChange={(e) =>
                setNewResource({ ...newResource, SizeZ: e.target.value })
              }
            />
          </div>
        </div>
      );
    }
    return null;
  };

  const renderInputMaxWeight = (selectedType) => {
    if (selectedType === "Container") {
      return (
        <React.Fragment>
          <div className="relative h-[48px] mb-4">
            <label
              htmlFor="MaxWeight"
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
              Type="number"
              value={newResource.MaxWeight}
              onFocus={() => setInputMWFocused(true)}
              onBlur={(e) =>
                e.target.value.trim() === "" && setInputMWFocused(false)
              }
              onChange={(e) =>
                setNewResource({ ...newResource, MaxWeight: e.target.value })
              }
            />
          </div>
        </React.Fragment>
      );
    }
  };

  const renderInputWeight = (selectedType) => {
    if (selectedType === "Item") {
      return (
        <React.Fragment>
          <div className="h-[48px] relative mb-4">
            <label
              htmlFor="Weight"
              className={`${labelStyle} ${
                inputWeightFocused
                  ? "text-[12px] left-[8px] top-[2px]"
                  : "left-2 top-3"
              }`}
            >
              Weight (Kg)
            </label>
            <input
              className="w-full pt-3 pb-1 px-3 border border-gray-300 rounded text-base h-full text-[16px]"
              Type="number"
              value={newResource.Weight}
              onFocus={() => setInputWeightFocused(true)}
              onBlur={(e) =>
                e.target.value.trim === "" && setInputWeightFocused(false)
              }
              onChange={(e) =>
                setNewResource({ ...newResource, Weight: e.target.value })
              }
            />
          </div>
        </React.Fragment>
      );
    }
  };

  const renderResources = () => {
    const activeColor = "#6F6F70";
    const inactiveColor = "#0E2040";
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

            <DragDropContext onDragEnd={handleDragEnd}>
              <Droppable droppableId="resources">
                {(provided) => (
                  <div {...provided.droppableProps} ref={provided.innerRef}>
                    {selectedResource === "Container" &&
                      containersData.map((container) => {
                        if (!container.Weight) container.Weight = 0;
                        return (
                          <div
                            key={"Con-" + container.ID}
                            className={`${itemContainerStyle} relative`}
                          >
                            <div className={`text-[#0e2040] font-semibold `}>
                              Container #{container.ID}
                            </div>
                            <div
                              className={`text-sm text-[#0e2040] opacity-[0.72]`}
                            >
                              Size: {container.SizeX}, {container.SizeY},{" "}
                              {container.SizeZ}
                            </div>
                            <div className="flex flex-row">
                              <p className="flex-1 text-sm text-[#0e2040] opacity-[0.72]">
                                Max Weight: {container.MaxWeight}
                                <span>Kg</span>
                              </p>
                            </div>
                            <div
                              className="absolute bottom-4 right-4 w-[32px] h-[32px] rounded-md flex items-center justify-center font-[24px] bg-[#FF5159] text-[#fff] cursor-pointer"
                              onClick={() => deleteContainer(container.ID)}
                            >
                              <FontAwesomeIcon
                                className="h-[42%] w-[42%]"
                                icon={faMinus}
                              />
                            </div>
                          </div>
                        );
                      })}

                    {(selectedResource === "Order" ||
                      selectedResource === "Item") &&
                      ordersData.map((order, index) => (
                        <Draggable
                          key={order.ID}
                          draggableId={"Order-" + order.ID}
                          index={index}
                          isDragDisabled={lifoActive === false}
                        >
                          {(provided) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              className={`${itemContainerStyle}`}
                            >
                              <div className="flex flex-row justify-between mb-4 items-center text-[#0e2040] font-semibold">
                                <div className="">
                                  Order#{order.ID}{" "}
                                  <span
                                    className={`${
                                      !lifoActive && "hidden"
                                    } opacity-[0.72] text-[12px]`}
                                  >
                                    Priority: {order.Priority}
                                  </span>
                                </div>
                                <div className="flex flex-row gap-2">
                                  <div
                                    className="w-[32px] h-[32px] rounded-md flex items-center justify-center font-[24px] bg-[#378EFF] text-white cursor-pointer"
                                    onClick={() =>
                                      addItemClickHandler(order.ID)
                                    }
                                  >
                                    <FontAwesomeIcon
                                      className="h-[42%] w-[42%]"
                                      icon={faPlus}
                                    />
                                  </div>
                                  <div
                                    className="w-[32px] h-[32px] rounded-md flex items-center justify-center font-[24px] bg-[#FF5159] text-[#fff] cursor-pointer"
                                    onClick={() => deleteOrder(order.ID)}
                                  >
                                    <FontAwesomeIcon
                                      className="h-[42%] w-[42%]"
                                      icon={faMinus}
                                    />
                                  </div>
                                </div>
                              </div>

                              {order.ItemList.map((item) => (
                                <div
                                  key={"Item-" + item.ID}
                                  className={`${itemContainerStyle} relative`}
                                >
                                  <div
                                    className={`text-[#0e2040] font-semibold`}
                                  >
                                    Item#{item.ID}
                                  </div>
                                  <div
                                    className={`text-sm text-[#0e2040] opacity-[0.72]`}
                                  >
                                    Item Name: {item.Name}
                                  </div>
                                  <div
                                    className={`text-sm text-[#0e2040] opacity-[0.72]`}
                                  >
                                    Size: {item.SizeX}, {item.SizeY},{" "}
                                    {item.SizeZ}
                                  </div>
                                  <div
                                    className={`text-sm text-[#0e2040] opacity-[0.72]`}
                                  >
                                    Weight: {item.Weight}
                                  </div>
                                  <div
                                    className="absolute bottom-4 right-4 w-[32px] h-[32px] rounded-md flex items-center justify-center font-[24px] bg-[#FF5159] text-[#fff] cursor-pointer"
                                    onClick={() =>
                                      deleteResource(order.ID, item.ID)
                                    }
                                  >
                                    <FontAwesomeIcon
                                      className="h-[42%] w-[42%]"
                                      icon={faMinus}
                                    />
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </Draggable>
                      ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </DragDropContext>
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
              onClick={() => closeFormClickHandler()}
            />
            <form>
              {renderSelectType(selectedResource)}
              {renderSelectOrder(newResource.Type)}
              {renderInputId(newResource.Type)}
              {renderInputName(newResource.Type)}
              {lifoActive && renderInputPriority(newResource.Type)}
              {renderInputSize(newResource.Type)}
              {renderInputMaxWeight(newResource.Type)}
              {renderInputWeight(newResource.Type)}
              <button
                className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600 transition duration-200"
                onClick={createResource}
              >
                Create
              </button>
            </form>
          </div>
        </div>
      </React.Fragment>
    );
  };

  const renderVehicleForm = () => {
    console.log(vehicleData);
    return (
      <div className="border-2 border-[#6F6F70] rounded bg-white px-4 py-2 mt-4">
        <h2 className="text-[#0e2040] font-semibold mb-2">Vehicle</h2>
        <form action="">
          <div className="relative h-[48px] mb-4">
            <label
              htmlFor=""
              className={`${labelStyle} text-[12px] left-[8px] top-[2px]`}
            >
              Vehicle Name
            </label>
            <input
              Type="text"
              className="w-full pt-3 pb-1 px-3 border border-gray-300 rounded text-base h-full text-[16px]"
              value={vehicleData.Name}
              onChange={(e) =>
                setVehicleData({ ...vehicleData, Name: e.target.value })
              }
            />
          </div>
          <div className="relative h-[48px] mb-4">
            <label
              htmlFor=""
              className={`${labelStyle} text-[12px] left-[8px] top-[2px]`}
            >
              Size X
            </label>
            <input
              Type="number"
              className="w-full pt-3 pb-1 px-3 border border-gray-300 rounded text-base h-full text-[16px]"
              value={vehicleData.SizeX}
              onChange={(e) =>
                setVehicleData({ ...vehicleData, SizeX: e.target.value })
              }
            />
          </div>
          <div className="relative h-[48px] mb-4">
            <label
              htmlFor=""
              className={`${labelStyle} text-[12px] left-[8px] top-[2px]`}
              onChange={(e) =>
                setVehicleData({ ...vehicleData, SizeY: e.target.value })
              }
            >
              Size Y
            </label>
            <input
              Type="number"
              className="w-full pt-3 pb-1 px-3 border border-gray-300 rounded text-base h-full text-[16px]"
              value={vehicleData.SizeY}
              onChange={(e) =>
                setVehicleData({ ...vehicleData, SizeY: e.target.value })
              }
            />
          </div>
          <div className="relative h-[48px] mb-4">
            <label
              htmlFor=""
              className={`${labelStyle} text-[12px] left-[8px] top-[2px]`}
            >
              Size Z
            </label>
            <input
              Type="number"
              className="w-full pt-3 pb-1 px-3 border border-gray-300 rounded text-base h-full text-[16px]"
              value={vehicleData.SizeZ}
              onChange={(e) =>
                setVehicleData({ ...vehicleData, SizeZ: e.target.value })
              }
            />
          </div>
          <div className="relative h-[48px] mb-4">
            <label
              htmlFor=""
              className={`${labelStyle} text-[12px] left-[8px] top-[2px]`}
            >
              Max Weight
            </label>
            <input
              Type="number"
              className="w-full pt-3 pb-1 px-3 border border-gray-300 rounded text-base h-full text-[16px]"
              value={vehicleData.MaxWeight}
              onChange={(e) =>
                setVehicleData({ ...vehicleData, MaxWeight: e.target.value })
              }
            />
          </div>
        </form>
      </div>
    );
  };

  return (
    <div className="w-full min-h-[100vh] flex items-center flex-col font-poppins bg-[#f4fbff]">
      {loading ? (
        <div className="flex justify-center items-center h-full absolute top-0 left-0 right-0 bottom-0">
          <RotatingLines color="#00BFFF" height={120} width={120} />
        </div>
      ) : (
        <>
          <div className="absolute top-5 left-8 flex flex-row items-center space-x-3 p-2">
            <img src={logo} alt="SusunBox Logo" className="h-14 w-14" />
            <span className="text-2xl font-poppins font-semibold logo-text-gradient">
              SusunBox
            </span>
          </div>

          <h1 className="text-[26px] font-bold mt-10">Resource Manager</h1>
          <div className="w-[480px] relative">
            {renderResources()}
            <div className="absolute -left-[280px] top-5 flex flex-col w-[240px] ">
              <button
                className={`${
                  lifoActive
                    ? "bg-[#0059A6] border-[#003F6D]"
                    : "bg-[#82B2CA] border-[#5A9BB5]"
                } relative py-2 w-[240px] font-poppins text-white font-semibold border-2  mt-4 rounded-md hover:bg-[#0059A6] hover:border-[#003F6D]`}
                onClick={() => setLifoActive(!lifoActive)}
              >
                LIFO
                <FontAwesomeIcon
                  icon={faCheck}
                  className={`${
                    !lifoActive && "hidden"
                  } absolute top-0 right-2 h-6 w-6`}
                />
              </button>
              <button
                className="py-2 w-[240px] bg-[#82B2CA] font-poppins text-white font-semibold border-2 border-[#5A9BB5] mt-4 rounded-md hover:bg-[#0059A6] hover:border-[#003F6D]"
                onClick={downloadJson}
              >
                Download JSON
              </button>
              {renderVehicleForm()}
            </div>
          </div>
          {showForm && renderForm()}
        </>
      )}
    </div>
  );
};

export default Index;
