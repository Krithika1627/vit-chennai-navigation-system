import React from "react";
import GraphVisualizer from "./GraphVisualizer";

// Pastel colors
const pastel = {
  yellow: "#ffe066",
  pink: "#fad1e6",
  blue: "#99c9ef",
  green: "#c2efd4",
  border: "#d2b4f4",
  dot: "#212121"
};

function App() {
  return (
    <main className="w-screen h-screen flex flex-col items-center justify-center" style={{
      background: pastel.blue
    }}>
      {/* Border Card */}
      <div className="max-w-2xl w-full my-10 px-4">
        <div className="bg-white rounded-2xl shadow-lg border-b-4 border-r-4 border-[#212121] p-8 relative">

          {/* Dotted border (absolute, pseudo-border effect) */}
          <div style={{
            position: "absolute",
            inset: "12px",
            border: `4px dotted ${pastel.dot}`,
            borderRadius: "16px",
            zIndex: 0
            
          }}></div>
          
          {/* Heading styled similar to image */}
          <div className="relative z-10 flex flex-col items-center">
            <div className="flex gap-3 text-5xl font-black mt-2 mb-4 drop-shadow-lg font-sans uppercase tracking-wide">
                <span className="text-border" style={{ color: pastel.yellow, marginRight: "4px" }}>
                  VIT
                </span>
                <span className="text-border" style={{ color: pastel.pink, marginRight: "4px" }}>
                  CHENNAI
                </span>
            </div>

            <div className="flex gap-2 text-2xl font-semibold mb-4 tracking-wide" style={{ color: pastel.blue }}>
              NAVIGATION SYSTEM
            </div>
          </div>

          {/* Main navigation component */}
          <div className="relative z-10 mt-4">
            <GraphVisualizer />
          </div>
        </div>
      </div>
      
      {/* Simple Footer */}
      <footer className="w-full text-center py-3 text-gray-500 font-medium">
        
      </footer>
    </main>
  );
}

export default App;
