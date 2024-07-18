import React, { useState, useEffect } from "react";
import { RotatingLines } from "react-loader-spinner";
import axios from "axios";
import logo from "../assets/susunbox_logo.png";
import RenderPlotly from "./components/RenderPlotly";

const Animation = () => {
  const [data, setData] = useState([]); // Start with null to handle loading
  const [loading, setLoading] = useState(true);
  const [containerList, setContainerList] = useState([]);
  const [selectedContainer, setSelectedContainer] = useState();

  const handleSelectChange = (e) => {
    const selectedId = e.target.value;
    console.log(containerList);
    console.log(selectedId);
    console.log(typeof selectedId);
    const selectedItem = containerList.find(
      (item) => String(item.ID) === selectedId
    );
    setSelectedContainer(selectedItem);
  };

  const renderResources = () => {
    return (
      <React.Fragment>
        <div className="border-2 border-[#6F6F70] rounded-lg mt-4 bg-white p-[20px]">
          <h2 className="font-semibold text-[#0e2040] mb-4">
            {/* {selectedContainer.name} */}
          </h2>
          {selectedContainer.ItemList.map((item) => (
            <div
              key={
                (item.ID,
                {
                  /*item.name*/
                })
              }
              className="border-2 border-[#6F6F70] rounded-md w-full p-4 mb-4"
            >
              <h3>
                {/* {item.name}:*/} {item.ID}
              </h3>
              <div>
                Pos X: {item.PosX} Pos Y: {item.PosX} Pos Z: {item.PosZ}
              </div>
              <div>
                Size X: {item.SizeX} Size Y: {item.SizeY} Size Z: {item.SizeZ}
              </div>
            </div>
          ))}
        </div>
      </React.Fragment>
    );
  };

  useEffect(() => {
    setLoading(true);
    const fetchData = async () => {
      try {
        const response = await axios.get(
          "http://localhost:3001/processedResource"
        );
        const result = response.data;
        setData(result);

        const containers = [];
        containers.push(result);

        result.ItemList.forEach((item) => {
          if (item.Type === "Container") containers.push(item);
        });
        console.log(containers);
        setSelectedContainer(result);
        setContainerList(containers);
      } catch (err) {
        console.log(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="w-full min-h-[100vh] flex flex-col items-center font-poppins bg-[#f4fbff]">
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

          <h1 className="text-[26px] font-bold mt-10">Result</h1>

          <div className="flex flex-row mt-8">
            <div className="w-[320px] mr-4">
              <div className="flex flex-col">
                <select
                  onChange={handleSelectChange}
                  className="border border-gray-300 rounded-md p-2 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-300"
                >
                  {containerList.map((item) => (
                    <option key={item.ID} value={item.ID}>
                      {/* {item.name}: */}
                      {item.Type}: {item.ID}
                    </option>
                  ))}
                </select>
                {renderResources()}
              </div>
            </div>
            <div className="ml-4">
              <RenderPlotly selectedContainer={selectedContainer} />
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Animation;
