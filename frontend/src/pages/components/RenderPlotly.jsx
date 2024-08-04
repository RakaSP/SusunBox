import React, { useEffect, useState } from "react";
import Plot from "react-plotly.js";

const RenderPlotly = ({ selectedContainer }) => {
  const [plotData, setPlotData] = useState([]);
  const [layout, setLayout] = useState({});
  const [itemCount, setItemCount] = useState(1);

  useEffect(() => {
    const containerSize = [
      {
        SizeX: selectedContainer.SizeX,
        SizeY: selectedContainer.SizeY,
        SizeZ: selectedContainer.SizeZ,
      },
    ];

    const packData = selectedContainer.ItemList.slice(0, itemCount);

    const boxPos = [0, 0, 0];
    const boxSize = [
      containerSize[0].SizeX,
      containerSize[0].SizeY,
      containerSize[0].SizeZ,
    ];

    let itemPosList = [];
    let itemSizeList = [];
    let productCodeList = [];
    packData.forEach((item) => {
      itemPosList.push([item.PosX, item.PosY, item.PosZ]);
      itemSizeList.push([item.SizeX, item.SizeY, item.SizeZ]);
      productCodeList.push(item.product_code);
    });

    function getCubeEdges(pos, size) {
      const x1 = [pos[0], pos[0] + size[0], pos[0] + size[0], pos[0]];
      const y1 = [pos[1], pos[1], pos[1] + size[1], pos[1] + size[1]];
      const z1 = [pos[2], pos[2], pos[2], pos[2]];

      const x2 = [pos[0], pos[0], pos[0], pos[0]];
      const y2 = [pos[1], pos[1], pos[1] + size[1], pos[1] + size[1]];
      const z2 = [pos[2], pos[2] + size[2], pos[2] + size[2], pos[2]];

      const x3 = [pos[0], pos[0] + size[0], pos[0] + size[0]];
      const y3 = [pos[1] + size[1], pos[1] + size[1], pos[1] + size[1]];
      const z3 = [pos[2] + size[2], pos[2] + size[2], pos[2]];

      const x4 = [pos[0] + size[0], pos[0] + size[0], pos[0] + size[0]];
      const y4 = [pos[1] + size[1], pos[1], pos[1]];
      const z4 = [pos[2] + size[2], pos[2] + size[2], pos[2]];

      const x5 = [pos[0] + size[0], pos[0]];
      const y5 = [pos[1], pos[1]];
      const z5 = [pos[2] + size[2], pos[2] + size[2]];

      return [
        x1.concat(x2, x3, x4, x5),
        y1.concat(y2, y3, y4, y5),
        z1.concat(z2, z3, z4, z5),
      ];
    }

    function getEdgesImg(pos, size, color) {
      const [boxX, boxY, boxZ] = getCubeEdges(pos, size);
      return {
        type: "scatter3d",
        mode: "lines",
        x: boxX,
        y: boxY,
        z: boxZ,
        line: {
          width: 6,
          color: color,
          reversescale: false,
        },
      };
    }

    function getCubeMesh(pos, size) {
      const meshX = [
        pos[0],
        pos[0],
        pos[0] + size[0],
        pos[0] + size[0],
        pos[0],
        pos[0],
        pos[0] + size[0],
        pos[0] + size[0],
      ];
      const meshY = [
        pos[1],
        pos[1] + size[1],
        pos[1] + size[1],
        pos[1],
        pos[1],
        pos[1] + size[1],
        pos[1] + size[1],
        pos[1],
      ];
      const meshZ = [
        pos[2],
        pos[2],
        pos[2],
        pos[2],
        pos[2] + size[2],
        pos[2] + size[2],
        pos[2] + size[2],
        pos[2] + size[2],
      ];
      return [meshX, meshY, meshZ];
    }

    function getMeshImg(pos, size, color) {
      const [meshX, meshY, meshZ] = getCubeMesh(pos, size);
      return {
        type: "mesh3d",
        x: meshX,
        y: meshY,
        z: meshZ,
        i: [7, 0, 0, 0, 4, 4, 6, 6, 4, 0, 3, 2],
        j: [3, 4, 1, 2, 5, 6, 5, 2, 0, 1, 6, 3],
        k: [0, 7, 2, 3, 6, 7, 1, 1, 5, 5, 7, 6],
        color: color,
      };
    }

    function generatePlotData() {
      const plotData = [];
      plotData.push(getEdgesImg(boxPos, boxSize, "red"));

      for (let i = 0; i < itemPosList.length; i++) {
        const color = i === itemPosList.length - 1 ? "lightblue" : "grey";
        const item_img = getMeshImg(itemPosList[i], itemSizeList[i], color);
        const item_edge_img = getEdgesImg(
          itemPosList[i],
          itemSizeList[i],
          "black"
        );
        plotData.push(item_img, item_edge_img);
      }

      return plotData;
    }

    setPlotData(generatePlotData());
    setLayout({
      scene: {
        camera: {
          eye: { x: 1.5, y: 1.5, z: 1.5 },
        },
      },
    });
  }, [selectedContainer, itemCount]);

  return (
    <>
      <div className="p-[20px] w-[100vh]">
        <Plot
          data={plotData}
          layout={layout}
          style={{ width: "100%", height: "70vh" }}
        />
      </div>
      <div className="flex justify-center mt-4">
        <button
          onClick={() => setItemCount((prev) => Math.max(1, prev - 1))}
          className="mx-2 px-4 py-2 bg-blue-500 text-white rounded"
        >
          -
        </button>
        <button
          onClick={() =>
            setItemCount((prev) =>
              Math.min(selectedContainer.ItemList.length, prev + 1)
            )
          }
          className="mx-2 px-4 py-2 bg-blue-500 text-white rounded"
        >
          +
        </button>
      </div>
    </>
  );
};

export default RenderPlotly;
