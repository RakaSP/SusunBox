import React, { useState, useEffect } from "react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { RotatingLines } from "react-loader-spinner";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faXmark, faCheck, faMinus } from "@fortawesome/free-solid-svg-icons";
import logo from "../assets/susunbox_logo.png";
const Index = () => {
  // Styles
  const labelStyle =
    "absolute text-dimBlack font-semibold transition-all duration-200 z-[0]";
  const sizeFormStyle =
    "max-w-[140px] pt-3 pb-1 px-3 border border-gray-300 rounded text-[16px] h-full ";
  const headerContainerStyle =
    "flex-1 flex items-center justify-center border-b-2";
  const headerStyle = "text-[20px] font-poppins font-semibold ";
  const itemContainerStyle =
    "border-2 border-dimBlack rounded-md w-full p-4 mb-4 bg-white";

  const navigate = useNavigate();
  // Data States
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState([]);

  const [containerData, setContainerData] = useState({});

  const [newItem, setNewItem] = useState({
    ID: null,
  });

  // Form State
  const [showForm, setShowForm] = useState(false);

  // Label Animation State
  const [focusedInputs, setFocusedInputs] = useState({
    inputId: false,
    inputName: false,
    inputPriority: false,
    inputSize: {
      SizeX: false,
      SizeY: false,
      SizeZ: false,
    },
    inputMW: false,
    inputWeight: false,
  });

  const [lifoActive, setLifoActive] = useState(false);

  // Storage

  const isStorageExist = () => {
    if (typeof Storage === undefined) {
      alert("Your browser does not support storage");
      return false;
    }
    return true;
  };

  const saveData = () => {
    if (isStorageExist) {
      const parsedData = data;
      if (!newItem.Priority) {
        const highestPriority = parsedData.reduce((max, obj) => {
          return obj.Priority > max ? obj.Priority : max;
        }, 0);
        newItem.Priority = Number(highestPriority, 10) + 1;
      }
      parsedData.push(newItem);
      sessionStorage.setItem("SUSUNBOX_API", JSON.stringify(data));
    }
  };

  const saveVehicleData = () => {
    if (isStorageExist) {
      const parsed = JSON.stringify(containerData);
      sessionStorage.setItem("ContainerData", parsed);
    }
  };

  useEffect(() => {
    const handleBeforeUnload = (e) => {
      saveVehicleData();
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [containerData]);

  const loadDataFromStorage = () => {
    const serializedResources = sessionStorage.getItem("SUSUNBOX_API");
    let resources = JSON.parse(serializedResources);
    const serializedContainerData = sessionStorage.getItem("ContainerData");

    if (serializedContainerData === null) {
      const defaultContainerData = {
        ID: "1",
        SizeX: 50,
        SizeY: 50,
        SizeZ: 50,
        MaxWeight: 15,
        ItemList: [],
      };
      sessionStorage.setItem(
        "ContainerData",
        JSON.stringify(defaultContainerData)
      );
      setContainerData(defaultContainerData);
    } else {
      const parsedContainerData = JSON.parse(serializedContainerData);
      setContainerData(parsedContainerData);
    }

    if (resources !== null) {
      setData(resources);
    }
  };

  // Reset Focus State Function
  const resetResourcesStates = () => {
    setFocusedInputs({
      inputId: false,
      inputName: false,
      inputPriority: false,
      inputSize: {
        SizeX: false,
        SizeY: false,
        SizeZ: false,
      },
      inputMW: false,
      inputWeight: false,
    });
    setNewItem({});
  };

  // Handlers
  // Swap data on drag and drop event
  const handleDragEnd = async (result) => {
    if (result.destination !== null) {
      if (result.destination.index === result.source.index) {
        return;
      }

      const updatedData = Array.from(data);
      const [reorderedItem] = updatedData.splice(result.source.index, 1);
      let destinationIndex = result.destination.index;
      if (destinationIndex > result.source.index) destinationIndex--;
      const destinationItem = updatedData[destinationIndex];

      const tempPriority = reorderedItem.Priority;
      reorderedItem.Priority = destinationItem.Priority;
      destinationItem.Priority = tempPriority;

      updatedData.splice(result.destination.index, 0, reorderedItem);

      setData(updatedData);
      try {
        await axios.put("http://localhost:3001/DND", updatedData);
      } catch (error) {
        console.error("Error updating data in backend:", error);
      }
    }
  };

  useEffect(() => {
    if (isStorageExist()) {
      loadDataFromStorage();
    }
  }, []);

  useEffect(() => {
    const handleBeforeUnload = () => {
      sessionStorage.setItem("ContainerData", JSON.stringify(containerData));
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [containerData]);

  const closeFormClickHandler = () => {
    resetResourcesStates();
    setShowForm(false);
  };

  const createResource = async () => {
    try {
      saveData();
      saveVehicleData();
      loadDataFromStorage();
      setShowForm(false);
      resetResourcesStates();
    } catch (error) {
      console.error("Error creating resource", error);
    }
  };

  const deleteResource = async (ID) => {
    const updatedData = data.filter((item) => !(item.ID === ID));
    sessionStorage.setItem("SUSUNBOX_API", JSON.stringify(updatedData));
    loadDataFromStorage();
  };

  const processData = async () => {
    try {
      const finalData = containerData;
      finalData.ItemList = data;
      sessionStorage.setItem("ContainerData", JSON.stringify(containerData));
      await axios.post("http://localhost:3001/save-json", finalData);
      navigate("/animation");
      alert("JSON file saved on server");
    } catch (error) {
      console.error("Error saving JSON file on server", error);
    }
  };

  // Render Functions

  const renderInputId = () => {
    return (
      <React.Fragment>
        <div className="relative h-[48px] mb-4">
          <label
            htmlFor="ID"
            className={`${labelStyle} ${
              focusedInputs.inputId
                ? "text-[12px] left-[8px] top-[2px]"
                : "left-2 top-3"
            }`}
            style={{ pointerEvents: "none" }}
          >
            ID
          </label>
          <input
            id="ID"
            className={`block w-full pt-3 pb-1 px-3 border border-gray-300 rounded text-base h-full text-[16px]`}
            type="number"
            value={newItem.ID}
            onFocus={() =>
              setFocusedInputs((prevState) => ({
                ...prevState,
                inputId: true,
              }))
            }
            onBlur={(e) =>
              e.target.value.trim() === "" &&
              setFocusedInputs((prevState) => ({
                ...prevState,
                inputId: false,
              }))
            }
            onChange={(e) => setNewItem({ ...newItem, ID: e.target.value })}
          />
        </div>
      </React.Fragment>
    );
  };

  const renderSelectOrder = () => {
    return (
      <React.Fragment>
        <div className={`relative h-[48px] mb-4`}>
          <label
            htmlFor="item"
            className={`${labelStyle} text-[12px] left-[8px] top-[2px]`}
          >
            Order ID
          </label>
          <input
            type="text"
            className="block w-full px-3 pt-3 pb-1 border border-gray-300 rounded bg-[#A7AABD]"
            disabled
            value={newItem.OrderID}
            onChange={(e) =>
              setNewItem({ ...newItem, OrderID: e.target.value })
            }
          />
        </div>
      </React.Fragment>
    );
  };

  const renderInputName = () => {
    return (
      <React.Fragment>
        <div className={`relative h-[48px] mb-4`}>
          <label
            htmlFor="Name"
            className={`${labelStyle} ${
              focusedInputs.inputName
                ? "text-[12px] left-[8px] top-[2px]"
                : "left-2 top-3"
            }`}
            style={{ pointerEvents: "none" }}
          >
            Item Name
          </label>
          <input
            className={` w-full px-3 h-[48px] pt-3 pb-1 mb-4 border border-gray-300 rounded`}
            type="text"
            onFocus={() =>
              setFocusedInputs((prevState) => ({
                ...prevState,
                inputName: true,
              }))
            }
            onBlur={(e) =>
              e.target.value.trim() === "" &&
              setFocusedInputs((prevState) => ({
                ...prevState,
                inputName: false,
              }))
            }
            value={newItem.Name}
            onChange={(e) => setNewItem({ ...newItem, Name: e.target.value })}
          />
        </div>
      </React.Fragment>
    );
  };

  const renderInputPriority = () => {
    return (
      <React.Fragment>
        <div className="relative h-[48px] mb-4">
          <label
            htmlFor="Priority"
            className={`${labelStyle} ${
              focusedInputs.inputPriority
                ? "text-[12px] left-[8px] top-[2px]"
                : "left-2 top-3"
            }`}
            style={{ pointerEvents: "none" }}
          >
            Priority
          </label>
          <input
            className={`w-full pt-3 pb-1 px-3 border border-gray-300 rounded text-base h-full text-[16px]`}
            type="number"
            value={newItem.Priority}
            onFocus={() =>
              setFocusedInputs((prevState) => ({
                ...prevState,
                inputPriority: true,
              }))
            }
            onBlur={(e) =>
              e.target.value.trim() === "" &&
              setFocusedInputs((prevState) => ({
                ...prevState,
                inputPriority: false,
              }))
            }
            onChange={(e) =>
              setNewItem({ ...newItem, Priority: e.target.value })
            }
          />
        </div>
      </React.Fragment>
    );
  };

  const renderInputSize = () => {
    return (
      <div className="flex flex-row justify-between h-[48px] mb-4">
        <div className="relative h-full">
          <label
            htmlFor="SizeX"
            className={`${labelStyle} ${
              focusedInputs.inputSize.SizeX || newItem.SizeX
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
              focusedInputs.inputSize.SizeX ? "border-blue-500" : ""
            }`}
            type="number"
            value={newItem.SizeX}
            onFocus={() =>
              setFocusedInputs((prevState) => ({
                ...prevState,
                inputSize: {
                  ...prevState.inputSize,
                  SizeX: true,
                },
              }))
            }
            onBlur={(e) =>
              e.target.value.trim() === "" &&
              setFocusedInputs((prevState) => ({
                ...prevState,
                inputSize: {
                  ...prevState.inputSize,
                  SizeX: false,
                },
              }))
            }
            onChange={(e) => setNewItem({ ...newItem, SizeX: e.target.value })}
          />
        </div>
        <div className="relative">
          <label
            htmlFor="SizeY"
            className={`${labelStyle} ${
              focusedInputs.inputSize.SizeY
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
              focusedInputs.inputSize.SizeY ? "border-blue-500" : ""
            }`}
            type="number"
            value={newItem.SizeY}
            onFocus={() =>
              setFocusedInputs((prevState) => ({
                ...prevState,
                inputSize: {
                  ...prevState.inputSize,
                  SizeY: true,
                },
              }))
            }
            onBlur={(e) =>
              e.target.value.trim() === "" &&
              setFocusedInputs((prevState) => ({
                ...prevState,
                inputSize: {
                  ...prevState.inputSize,
                  SizeY: false,
                },
              }))
            }
            onChange={(e) => setNewItem({ ...newItem, SizeY: e.target.value })}
          />
        </div>
        <div className="relative">
          <label
            htmlFor="SizeZ"
            className={`${labelStyle} ${
              focusedInputs.inputSize.SizeZ
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
              focusedInputs.inputSize.SizeZ ? "border-blue-500" : ""
            } text-base`}
            type="number"
            value={newItem.SizeZ}
            onFocus={() =>
              setFocusedInputs((prevState) => ({
                ...prevState,
                inputSize: {
                  ...prevState.inputSize,
                  SizeZ: true,
                },
              }))
            }
            onBlur={(e) =>
              e.target.value.trim() === "" &&
              setFocusedInputs((prevState) => ({
                ...prevState,
                inputSize: {
                  ...prevState.inputSize,
                  SizeZ: false,
                },
              }))
            }
            onChange={(e) => setNewItem({ ...newItem, SizeZ: e.target.value })}
          />
        </div>
      </div>
    );
  };

  const renderInputMaxWeight = () => {
    return (
      <React.Fragment>
        <div className="relative h-[48px] mb-4">
          <label
            htmlFor="MaxWeight"
            className={`${labelStyle} ${
              focusedInputs.inputMW
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
            value={newItem.MaxWeight}
            onFocus={() =>
              setFocusedInputs((prevState) => ({
                ...prevState,
                inputMW: true,
              }))
            }
            onBlur={(e) =>
              e.target.value.trim() === "" &&
              setFocusedInputs((prevState) => ({
                ...prevState,
                inputMW: false,
              }))
            }
            onChange={(e) =>
              setNewItem({ ...newItem, MaxWeight: e.target.value })
            }
          />
        </div>
      </React.Fragment>
    );
  };

  const renderInputWeight = () => {
    return (
      <React.Fragment>
        <div className="h-[48px] relative mb-4">
          <label
            htmlFor="Weight"
            className={`${labelStyle} ${
              focusedInputs.inputWeight
                ? "text-[12px] left-[8px] top-[2px]"
                : "left-2 top-3"
            }`}
          >
            Weight (Kg)
          </label>
          <input
            className="w-full pt-3 pb-1 px-3 border border-gray-300 rounded text-base h-full text-[16px]"
            type="number"
            value={newItem.Weight}
            onFocus={() =>
              setFocusedInputs((prevState) => ({
                ...prevState,
                inputWeight: true,
              }))
            }
            onBlur={(e) =>
              e.target.value.trim() === "" &&
              setFocusedInputs((prevState) => ({
                ...prevState,
                inputWeight: false,
              }))
            }
            onChange={(e) => setNewItem({ ...newItem, Weight: e.target.value })}
          />
        </div>
      </React.Fragment>
    );
  };

  const renderResources = () => {
    return (
      <React.Fragment>
        <div className="w-[480px] border-2 border-dimBlack rounded-lg mt-4 bg-white">
          <div className="w-full flex flex-row h-[64px]">
            <div
              className={`${headerContainerStyle} border-black relative cursor-pointer`}
            >
              <p className={`${headerStyle} text-black`}>Items</p>
            </div>
          </div>

          <hr className="w-full" />

          <div className="w-full p-[20px]">
            <div
              className="border-dashed border-2 mb-4 border-[#067C89] flex items-center justify-center rounded-md text-[22px] text-[#067C89] cursor-pointer hover:bg-[#067C89] hover:text-[#fff]"
              onClick={() => {
                setShowForm(!showForm);
              }}
            >
              +
            </div>

            <DragDropContext onDragEnd={handleDragEnd}>
              <Droppable droppableId="resources">
                {(provided) => (
                  <div {...provided.droppableProps} ref={provided.innerRef}>
                    {data.map((item, index) => (
                      <Draggable
                        key={item.ID}
                        draggableId={"Order-" + item.ID}
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
                            <div className="flex flex-row justify-between items-center text-[#0e2040] font-semibold">
                              <div className="flex flex-col">
                                <div className="">
                                  {item.Name}#{item.ID}
                                  <span
                                    className={`${
                                      !lifoActive && "hidden"
                                    } text-dimBlack text-[12px] ml-2`}
                                  >
                                    Priority: {item.Priority}
                                  </span>
                                </div>
                              </div>
                              <div className="flex flex-row gap-2">
                                <div
                                  className="w-[32px] h-[32px] rounded-md flex items-center justify-center font-[24px] bg-[#FF5159] text-[#fff] cursor-pointer"
                                  onClick={() => deleteResource(item.ID)}
                                >
                                  <FontAwesomeIcon
                                    className="h-[42%] w-[42%]"
                                    icon={faMinus}
                                  />
                                </div>
                              </div>
                            </div>
                            <div>
                              <div className="">
                                Size: {item.SizeX}, {item.SizeY}, {item.SizeZ}
                              </div>
                              <data>Weight: {item.Weight}</data>
                            </div>
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
    return (
      <React.Fragment>
        <div className="w-full h-full fixed bg-[#000] bg-opacity-40 flex justify-center items-center text-black z-10">
          <div className="border-2 border-blue-200 p-4 rounded-lg shadow-md bg-white w-[480px] relative">
            <h2 className="text-lg font-semibold mb-4">Create Resource</h2>
            <FontAwesomeIcon
              className="w-[24px] h-[24px] text-black absolute right-4 top-4 hover:text-[#558EF8]"
              icon={faXmark}
              onClick={() => closeFormClickHandler()}
            />
            <form>
              {renderSelectOrder()}
              {renderInputId()}
              {renderInputName()}
              {lifoActive && renderInputPriority()}
              {renderInputSize()}
              {renderInputWeight()}
              <button
                className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600 transition duration-200"
                onClick={(e) => {
                  createResource();
                  e.preventDefault();
                }}
              >
                Create
              </button>
            </form>
          </div>
        </div>
      </React.Fragment>
    );
  };

  const renderContainerForm = () => {
    return (
      <div className="border-2 border-dimBlack rounded bg-white px-4 py-2 mt-4">
        <h2 className="text-[#0e2040] font-semibold my-2">Container</h2>
        <form action="">
          <div className="relative h-[48px] mb-4">
            <label
              htmlFor=""
              className={`${labelStyle} text-[12px] left-[8px] top-[2px]`}
            >
              Size X
            </label>
            <input
              type="number"
              className="w-full pt-3 pb-1 px-3 border border-gray-300 rounded text-base h-full text-[16px]"
              value={containerData.SizeX}
              onChange={(e) =>
                setContainerData({ ...containerData, SizeX: e.target.value })
              }
            />
          </div>
          <div className="relative h-[48px] mb-4">
            <label
              htmlFor=""
              className={`${labelStyle} text-[12px] left-[8px] top-[2px]`}
              onChange={(e) =>
                setContainerData({ ...containerData, SizeY: e.target.value })
              }
            >
              Size Y
            </label>
            <input
              type="number"
              className="w-full pt-3 pb-1 px-3 border border-gray-300 rounded text-base h-full text-[16px]"
              value={containerData.SizeY}
              onChange={(e) =>
                setContainerData({ ...containerData, SizeY: e.target.value })
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
              type="number"
              className="w-full pt-3 pb-1 px-3 border border-gray-300 rounded text-base h-full text-[16px]"
              value={containerData.SizeZ}
              onChange={(e) =>
                setContainerData({ ...containerData, SizeZ: e.target.value })
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
              type="number"
              className="w-full pt-3 pb-1 px-3 border border-gray-300 rounded text-base h-full text-[16px]"
              value={containerData.MaxWeight}
              onChange={(e) =>
                setContainerData({
                  ...containerData,
                  MaxWeight: e.target.value,
                })
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
                className="py-2 w-[240px] bg-[#82B2CA] font-poppins text-white font-semibold border-2 border-[#5A9BB5] mt-4 rounded-md shadow-lg hover:bg-[#0059A6] hover:border-[#003F6D] hover:shadow-xl transition-all duration-300"
                onClick={processData}
              >
                Process Data
              </button>
              {renderContainerForm()}
            </div>
          </div>
          {showForm && renderForm()}
        </>
      )}
    </div>
  );
};

export default Index;
