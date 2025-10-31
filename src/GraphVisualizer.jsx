import React, { useState } from "react";
import { dijkstra } from "./dijkstra";

const pastel = {
  yellow: "#ffe066",
  pink: "#fad1e6",
  blue: "#99c9ef",
  green: "#c2efd4",
  border: "#d2b4f4",
  dot: "#212121"
};

const graph = {};
function addEdge(a, b, weight) {
  if (!graph[a]) graph[a] = [];
  if (!graph[b]) graph[b] = [];
  graph[a].push([b, weight]);
  graph[b].push([a, weight]);
}

addEdge("Main Gate", "SP1", 180);
addEdge("Main Gate", "Admin/Library", 120);
addEdge("Main Gate", "Mgr Statue", 190);
addEdge("Main Gate", "Ab1", 400);

addEdge("SP1", "Guest House", 90);
addEdge("SP1", "Mgr", 90);
addEdge("SP1", "Ab1", 300);

addEdge("Admin/Library", "Clock Court", 110);
addEdge("Admin/Library", "Gazebo", 130);
addEdge("Admin/Library", "Mg Auditorium", 200);

addEdge("Mgr Statue", "Clock Court", 110);
addEdge("Mgr Statue", "Gazebo", 110);
addEdge("Mgr Statue", "Ab1", 280);

addEdge("Ab1", "Gym", 150);
addEdge("Ab1", "Ab3", 90);
addEdge("Ab1", "Vmart", 100);
addEdge("Ab1", "Block A", 90);
addEdge("Ab1", "North Square", 90);

addEdge("Guest House", "Gym", 100);

addEdge("Clock Court", "Delta Block", 120);
addEdge("Clock Court", "SP2", 70);

addEdge("Gazebo", "Delta Block", 120);
addEdge("Gazebo", "SP2", 70);

addEdge("Gym", "Block D1", 80);
addEdge("Gym", "Block A", 70);

addEdge("Block D1", "Block D2", 50);

addEdge("Ab3", "North Square", 30);
addEdge("Ab3", "Ab2", 400);
addEdge("Ab3", "Ab4", 140);
addEdge("Ab3", "Vmart", 160);

addEdge("Vmart", "North Square", 110);
addEdge("Vmart", "Sigma Block", 20);

addEdge("Block A", "Sigma Block", 100);

addEdge("Delta Block", "Health", 120);
addEdge("Delta Block", "Ab2", 180);
addEdge("Delta Block", "Block B", 130);

addEdge("SP2", "Mg Auditorium", 210);
addEdge("SP2", "Delta Block", 50);

addEdge("Ab2", "Ab4", 120);
addEdge("Ab2", "Block B", 180);

addEdge("Health", "Ab2", 180);
addEdge("Health", "Block B", 90);
addEdge("Health", "Block C", 120);

addEdge("Block B", "Block C", 220);

const locations = Object.keys(graph);

function GraphVisualizer() {
  const [source, setSource] = useState("Main");
  const [destination, setDestination] = useState("Gym");
  const [path, setPath] = useState([]);
  const [distance, setDistance] = useState(null);

  const handleFindPath = () => {
    const { path: shortestPath, distance: totalDistance } = dijkstra(graph, source, destination);
    setPath(shortestPath);
    setDistance(totalDistance);
  };

  return (
    <div
      className="relative w-full max-w-xl mx-auto p-6"
      style={{
        background: "#fff",
        borderRadius: "17px",
        border: `3.5px solid ${pastel.blue}`,
        boxShadow: "4px 4px 0 #212121, 0 8px 24px 0px rgba(0,0,0,0.08)"
      }}
    >
      {/* Dotted border - inside */}
      <div
        style={{
          position: "absolute",
          top: 14,
          left: 14,
          right: 14,
          bottom: 14,
          borderRadius: "12px",
          border: `1px solid ${pastel.dot}`,
          zIndex: 0
        }}
      />
      <div className="relative z-10 flex flex-col items-center">
        {/* Dropdowns Row */}
        <div className="flex flex-col md:flex-row gap-5 mb-6 w-full justify-center">
          <label className="flex flex-col items-center w-full md:w-1/2 text-base font-bold" style={{ color: pastel.blue }}>
            From
            <select
              value={source}
              onChange={e => setSource(e.target.value)}
              className="mt-1 p-2 rounded-md border-2 border-[#99c9ef] font-semibold text-[#212121] bg-white shadow"
            >
              {locations.map(loc => (
                <option key={loc} value={loc}>
                  {loc}
                </option>
              ))}
            </select>
          </label>
          <label className="flex flex-col items-center w-full md:w-1/2 text-base font-bold" style={{ color: pastel.pink }}>
            To
            <select
              value={destination}
              onChange={e => setDestination(e.target.value)}
              className="mt-1 p-2 rounded-md border-2 border-[#fad1e6] font-semibold text-[#212121] bg-white shadow"
            >
              {locations.map(loc => (
                <option key={loc} value={loc}>
                  {loc}
                </option>
              ))}
            </select>
          </label>
        </div>
        {/* Button */}
        <button
          onClick={handleFindPath}
          className="uppercase tracking-wider mt-3 px-7 py-3 rounded-lg font-bold text-lg shadow"
          style={{
            background: pastel.yellow,
            color: "#222",
            boxShadow: "2px 2px 0 #212121"
          }}
        >
          Find Route
        </button>

        {/* Result display */}
        {path.length > 1 && (
          <div className="mt-10 w-full flex flex-col items-center">
            <div className="flex flex-wrap gap-2 justify-center items-center text-lg font-bold">
              {path.map((node, idx) => (
                <span
                  key={node}
                  style={{
                    background: idx % 2 === 0 ? pastel.blue : pastel.pink,
                    color: "#212121",
                    borderRadius: "7px",
                    padding: "6px 16px",
                    border: "2px solid #212121",
                    boxShadow: "1.5px 1.5px 0 #212121"
                  }}
                  className="mx-1"
                >
                  {node}
                  {idx < path.length - 1 && (
                    <span style={{ color: 212121, marginLeft: 8, marginRight: 0 }}>&#10140;</span>
                  )}
                </span>
              ))}
            </div>
            <div className="mt-5 rounded-md px-5 py-2 text-[#23395d] font-bold text-base border border-[#99c9ef] bg-[#a9d6e558] shadow-sm" style={{ letterSpacing: "1px" }}>
              Distance: <span className="font-black">{distance} metres</span>
            </div>
          </div>
        )}
        {path.length === 1 && (
          <div className="mt-8 text-center text-[#f72585] font-semibold">
            Start and destination are the same!
          </div>
        )}
      </div>
    </div>
  );
}
export default GraphVisualizer;
