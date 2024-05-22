// services/aStar.js
export const aStar = (stations, edges, startId, goalId) => {
    const start = stations.find(station => station.id === startId);
    const goal = stations.find(station => station.id === goalId);
    
    if (!start || !goal) return [];
  
    const openSet = [start];
    const cameFrom = new Map();
    const gScore = new Map();
    const fScore = new Map();
  
    stations.forEach(station => {
      gScore.set(station.id, Infinity);
      fScore.set(station.id, Infinity);
    });
  
    gScore.set(start.id, 0);
    fScore.set(start.id, heuristic(start, goal));
  
    while (openSet.length > 0) {
      const current = openSet.reduce((acc, node) => (fScore.get(node.id) < fScore.get(acc.id) ? node : acc), openSet[0]);
  
      if (current.id === goal.id) {
        return reconstructPath(cameFrom, current);
      }
  
      openSet.splice(openSet.indexOf(current), 1);
  
      edges.filter(edge => edge.source_station_id === current.id).forEach(edge => {
        const neighbor = stations.find(station => station.id === edge.destination_station_id);
        if (!neighbor) return;
  
        const tentativeGScore = gScore.get(current.id) + edge.distance;
  
        if (tentativeGScore < gScore.get(neighbor.id)) {
          cameFrom.set(neighbor.id, current);
          gScore.set(neighbor.id, tentativeGScore);
          fScore.set(neighbor.id, tentativeGScore + heuristic(neighbor, goal));
  
          if (!openSet.includes(neighbor)) {
            openSet.push(neighbor);
          }
        }
      });
    }
  
    return [];
  
    function heuristic(a, b) {
      const dx = a.latitude - b.latitude;
      const dy = a.longitude - b.longitude;
      return Math.sqrt(dx * dx + dy * dy);
    }
  
    function reconstructPath(cameFrom, current) {
      const totalPath = [current];
      while (cameFrom.has(current.id)) {
        current = cameFrom.get(current.id);
        totalPath.unshift(current);
      }
      return totalPath;
    }
  };
  