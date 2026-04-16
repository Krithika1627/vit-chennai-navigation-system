import React, { useEffect, useMemo, useRef, useState } from "react";
import { dijkstra } from "./dijkstra";

const pastel = {
  yellow: "#ffe066",
  pink: "#fad1e6",
  blue: "#99c9ef",
  green: "#c2efd4",
  edge: "#a7b3bf",
  node: "#1f2937",
  path: "#f94144",
  label: "#0b2239",
  border: "#d2e3f5",
};

// ------------------------------
// GRAPH (your edges; names fixed)
// ------------------------------
const graph = {};
function addEdge(a, b, w) {
  if (!graph[a]) graph[a] = [];
  if (!graph[b]) graph[b] = [];
  graph[a].push([b, w]);
  graph[b].push([a, w]); // undirected
}

// --- your edges (Mgr -> Mgr Statue, MG Auditorium names fixed)
addEdge("Main Gate", "SP1", 180);
addEdge("Main Gate", "Admin/Library", 120);
addEdge("Main Gate", "Mgr Statue", 190);
addEdge("Main Gate", "Ab1", 400);

addEdge("SP1", "Guest House", 90);
addEdge("SP1", "Mgr Statue", 90);
addEdge("SP1", "Ab1", 300);

addEdge("Admin/Library", "Clock Court", 110);
addEdge("Admin/Library", "Gazebo", 130);
addEdge("Admin/Library", "MG Auditorium", 200);

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

addEdge("SP2", "MG Auditorium", 210);
addEdge("SP2", "Delta Block", 50);

addEdge("Ab2", "Ab4", 120);
addEdge("Ab2", "Block B", 180);

addEdge("Health", "Ab2", 180);
addEdge("Health", "Block B", 90);
addEdge("Health", "Block C", 120);

addEdge("Block B", "Block C", 220);

// ------------------------------
// COORDINATES (spread out layout)
// Base design size: 1200 x 750
// ------------------------------
const BASE_W = 1200;
const BASE_H = 750;
const coords = {
  // bottom-left cluster
  "Block D2": { x: 120, y: 650 },
  "Block D1": { x: 180, y: 600 },
  "Gym": { x: 220, y: 560 },
  "Guest House": { x: 250, y: 590 },
  "Sigma Block": { x: 280, y: 500 },
  "Vmart": { x: 210, y: 480 },

  // left-middle
  "SP1": { x: 360, y: 580 },
  "Main Gate": { x: 420, y: 700 },
  "Mgr Statue": { x: 480, y: 560 },
  "Admin/Library": { x: 540, y: 650 },

  // center cluster
  "Ab1": { x: 420, y: 440 },
  "Ab3": { x: 560, y: 250 },
  "North Square": { x: 480, y: 220 },
  "Gazebo": { x: 650, y: 420 },
  "Clock Court": { x: 710, y: 460 },

  // upper-right arc
  "Ab4": { x: 740, y: 180 },
  "Ab2": { x: 880, y: 230 },

  // right cluster
  "SP2": { x: 800, y: 520 },
  "Delta Block": { x: 880, y: 500 },
  "Health": { x: 990, y: 470 },
  "Block B": { x: 930, y: 440 },
  "Block C": { x: 1010, y: 410 },

  // extras
  "Block A": { x: 330, y: 470 },
  "MG Auditorium": { x: 920, y: 700 },
};

// ------------------------------
const NODE_R = 12; // base radius

const locations = Object.keys(graph);

function GraphVisualizer() {
  const [source, setSource] = useState("Block A");
  const [destination, setDestination] = useState("Gym");
  const [path, setPath] = useState([]);
  const [distance, setDistance] = useState(null);

  const canvasRef = useRef(null);
  const wrapRef = useRef(null);
  const tooltipRef = useRef(null);

  // for quick highlight checks
  const pathEdges = useMemo(() => {
    const s = new Set();
    for (let i = 0; i < path.length - 1; i++) {
      const a = path[i], b = path[i + 1];
      s.add(`${a}__${b}`);
      s.add(`${b}__${a}`);
    }
    return s;
  }, [path]);

  // compute neighbors text for tooltip
  const neighborsOf = (u) =>
    (graph[u] || []).map(([v]) => v).sort();

  // resize + draw
  useEffect(() => {
    const canvas = canvasRef.current;
    const tooltip = tooltipRef.current;
    const wrap = wrapRef.current;
    if (!canvas || !wrap) return;

    const draw = () => {
      // responsive size: max width of container, keep aspect
      const w = Math.min(wrap.clientWidth - 24, 1100);
      const h = Math.round((w / BASE_W) * BASE_H);
      canvas.width = w;
      canvas.height = h;

      const ctx = canvas.getContext("2d");
      ctx.clearRect(0, 0, w, h);

      // scale helper
      const sx = w / BASE_W;
      const sy = h / BASE_H;
      const S = (p) => ({ x: p.x * sx, y: p.y * sy });

      // edges (light)
      ctx.lineWidth = Math.max(1.5, 2 * sx);
      ctx.strokeStyle = pastel.edge;
      Object.keys(graph).forEach((u) => {
        if (!coords[u]) return;
        const pu = S(coords[u]);
        graph[u].forEach(([v]) => {
          if (!coords[v]) return;
          const pv = S(coords[v]);
          ctx.beginPath();
          ctx.moveTo(pu.x, pu.y);
          ctx.lineTo(pv.x, pv.y);
          ctx.stroke();
        });
      });

      // path edges (bold colored)
      if (path.length > 1) {
        ctx.lineWidth = Math.max(3.5, 5 * sx);
        ctx.strokeStyle = pastel.path;
        for (let i = 0; i < path.length - 1; i++) {
          const a = path[i], b = path[i + 1];
          if (!coords[a] || !coords[b]) continue;
          const pa = S(coords[a]);
          const pb = S(coords[b]);
          ctx.beginPath();
          ctx.moveTo(pa.x, pa.y);
          ctx.lineTo(pb.x, pb.y);
          ctx.stroke();
        }
      }

      // nodes + labels
      Object.keys(coords).forEach((name) => {
        const p = S(coords[name]);
        const onPath = path.includes(name);

        // node circle
        ctx.beginPath();
        ctx.arc(p.x, p.y, NODE_R * sx, 0, Math.PI * 2);
        ctx.fillStyle = onPath ? pastel.yellow : pastel.node;
        ctx.fill();

        // border
        ctx.lineWidth = 2 * sx;
        ctx.strokeStyle = onPath ? pastel.path : "#ffffff";
        ctx.stroke();

        // label
        ctx.font = `${Math.max(10, 12 * sx)}px ui-sans-serif, system-ui, -apple-system`;
        ctx.fillStyle = pastel.label;
        ctx.textAlign = "center";
        ctx.fillText(name, p.x, p.y - Math.max(16, 18 * sy));
      });
    };

    draw();
    const onResize = () => draw();
    window.addEventListener("resize", onResize);

    // hover tooltip (name + neighbors)
    const hover = (e) => {
      const rect = canvas.getBoundingClientRect();
      const mx = e.clientX - rect.left;
      const my = e.clientY - rect.top;

      const w = canvas.width, h = canvas.height;
      const sx = w / BASE_W, sy = h / BASE_H;
      const S = (p) => ({ x: p.x * sx, y: p.y * sy });

      let found = null;
      Object.keys(coords).some((name) => {
        const p = S(coords[name]);
        const dx = p.x - mx, dy = p.y - my;
        const r = NODE_R * sx * 1.4;
        if (dx * dx + dy * dy <= r * r) {
          found = name;
          return true;
        }
        return false;
      });

      if (found) {
        const nbs = neighborsOf(found);
        tooltip.style.display = "block";
        tooltip.style.left = `${e.clientX + 12}px`;
        tooltip.style.top = `${e.clientY + 12}px`;
        tooltip.innerHTML = `
          <div style="
            background: #ffffffee;
            border: 1px solid ${pastel.border};
            border-radius: 10px;
            padding: 8px 10px;
            font-size: 12px;
            color: ${pastel.label};
            box-shadow: 0 8px 24px rgba(0,0,0,0.08);
            max-width: 260px;
          ">
            <div style="font-weight: 800; margin-bottom: 4px;">${found}</div>
            <div><span style="font-weight:700;">Connected:</span> ${nbs.join(", ") || "—"}</div>
          </div>`;
      } else {
        tooltip.style.display = "none";
      }
    };

    const leave = () => (tooltip.style.display = "none");

    canvas.addEventListener("mousemove", hover);
    canvas.addEventListener("mouseleave", leave);

    return () => {
      window.removeEventListener("resize", onResize);
      canvas.removeEventListener("mousemove", hover);
      canvas.removeEventListener("mouseleave", leave);
    };
  }, [path]);

  const handleFindPath = () => {
    const { path: shortestPath, distance: totalDistance } = dijkstra(
      graph,
      source,
      destination
    );
    setPath(shortestPath || []);
    setDistance(totalDistance);
  };

  return (
    <div
      ref={wrapRef}
      className="w-full mx-auto"
      style={{
        background: "#fff",
        borderRadius: 18,
        border: `3px solid ${pastel.border}`,
        boxShadow: "4px 4px 0 #212121, 0 8px 24px rgba(0,0,0,0.08)",
        padding: 12,
      }}
    >
      {/* Controls */}
      <div className="flex flex-col md:flex-row gap-4 mb-4 w-full justify-center">
        <label className="flex flex-col items-center w-full md:w-1/2 text-base font-bold" style={{ color: pastel.blue }}>
          From
          <select
            value={source}
            onChange={(e) => setSource(e.target.value)}
            className="mt-1 p-2 rounded-md border-2 border-[#99c9ef] font-semibold text-[#212121] bg-white shadow w-full max-w-xs"
          >
            {locations.map((loc) => (
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
            onChange={(e) => setDestination(e.target.value)}
            className="mt-1 p-2 rounded-md border-2 border-[#fad1e6] font-semibold text-[#212121] bg-white shadow w-full max-w-xs"
          >
            {locations.map((loc) => (
              <option key={loc} value={loc}>
                {loc}
              </option>
            ))}
          </select>
        </label>
      </div>

      {/* Canvas */}
      <div
        className="relative rounded-lg"
        style={{
          border: `1px solid ${pastel.border}`,
          background: "#fafcff",
          overflow: "hidden",
        }}
      >
        <canvas
          ref={canvasRef}
          width={BASE_W}
          height={BASE_H}
          style={{ display: "block", width: "100%", height: "auto" }}
        />
        {/* Tooltip (hidden by default) */}
        <div
          ref={tooltipRef}
          style={{ position: "fixed", pointerEvents: "none", display: "none", zIndex: 50 }}
        />
      </div>

      {/* Result */}
      {path?.length > 0 && (
        <div className="mt-4 text-center">
          <div className="flex flex-wrap gap-2 justify-center items-center text-sm md:text-base font-bold">
            {path.map((node, idx) => (
              <span
                key={`${node}-${idx}`}
                style={{
                  background: idx % 2 === 0 ? pastel.blue : pastel.pink,
                  color: "#212121",
                  borderRadius: "7px",
                  padding: "6px 12px",
                  border: "2px solid #212121",
                  boxShadow: "1.5px 1.5px 0 #212121",
                }}
              >
                {node}
                {idx < path.length - 1 && <span style={{ marginLeft: 8 }}>→</span>}
              </span>
            ))}
          </div>
          <div
            className="mt-3 inline-block rounded-md px-5 py-2 text-[#23395d] font-bold text-base border border-[#99c9ef] bg-[#a9d6e558] shadow-sm"
            style={{ letterSpacing: "1px" }}
          >
            Distance: <span className="font-black">{distance}</span> metres
          </div>
        </div>
      )}

      {/* Action */}
      <div className="flex justify-center mt-4">
        <button
          onClick={handleFindPath}
          className="uppercase tracking-wider px-7 py-3 rounded-lg font-bold text-lg shadow"
          style={{ background: pastel.yellow, color: "#222", boxShadow: "2px 2px 0 #212121" }}
        >
          Find Route
        </button>
      </div>
    </div>
  );
}

export default GraphVisualizer;
