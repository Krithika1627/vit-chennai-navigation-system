// src/dijkstra.js

export function dijkstra(graph, start, end) {
    const distances = {};
    const previous = {};
    const visited = {};
    const pq = []; // min heap emulation
  
    Object.keys(graph).forEach(node => {
      distances[node] = Infinity;
      previous[node] = null;
    });
    distances[start] = 0;
    pq.push({ node: start, distance: 0 });
  
    while (pq.length > 0) {
      pq.sort((a, b) => a.distance - b.distance);
      const { node } = pq.shift();
      if (visited[node]) continue;
      visited[node] = true;
      for (const [neighbor, weight] of graph[node]) {
        const alt = distances[node] + weight;
        if (alt < distances[neighbor]) {
          distances[neighbor] = alt;
          previous[neighbor] = node;
          pq.push({ node: neighbor, distance: alt });
        }
      }
    }
  
    // Build shortest path
    const path = [];
    let curr = end;
    while (curr && previous[curr] !== null) {
      path.unshift(curr);
      curr = previous[curr];
    }
    if (curr === start) path.unshift(start);
    else if (start === end) path.push(start);
  
    return {
      path,
      distance: distances[end] !== Infinity ? distances[end] : "unreachable"
    };
  }
  