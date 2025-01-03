import React, { useMemo } from 'react';
import _ from 'lodash';

const Heatmap = ({ players, show, blurRadius = 10 }) => {
  
  const heatmapData = useMemo(() => {
    if (!show || !players?.length) return [];

    // Create a 40x40 grid for higher resolution
    const gridSize = 40;
    const grid = Array(gridSize).fill().map(() => Array(gridSize).fill(0));

    // Track time spent in each cell
    players.forEach(player => {
      if (!player.positionHistory?.length) return;

      player.positionHistory.forEach((pos, index) => {
        const nextPos = player.positionHistory[index + 1];
        const timeSpent = nextPos ? nextPos.timestamp - pos.timestamp : 100; // Default 100ms
    
        // Apply a decay factor based on the age of the data
        const decayFactor = Math.pow(0.95, player.positionHistory.length - index); // Reduce older points
        const weightedTimeSpent = timeSpent * decayFactor;
    
        const gridX = Math.floor((pos.x / 100) * gridSize);
        const gridY = Math.floor((pos.y / 100) * gridSize);
    
        if (gridX >= 0 && gridX < gridSize && gridY >= 0 && gridY < gridSize) {
            grid[gridY][gridX] += weightedTimeSpent; // Increment based on weighted time
        }
    });
    
    });

    const maxValue = Math.max(...grid.flat()) || 1; // Avoid division by zero
    const minValue = 0.05 * maxValue; // Only normalize cells with at least 10% of max value
    const cells = [];
    
    grid.forEach((row, y) => {
      row.forEach((value, x) => {
          if (value >= minValue) { // Ignore low-value cells
              const intensity = value / maxValue; // Normalize intensity
              cells.push({
                  x: (x / gridSize) * 100,
                  y: (y / gridSize) * 100,
                  width: 100 / gridSize,
                  height: 100 / gridSize,
                  intensity
              });
          }
      });
  });

    return cells;
  }, [players, show]);

  if (!show) return null;

  // Helper function to generate color based on intensity
  const getHeatColor = (intensity) => {
    const colors = [
      { pos: 0, color: 'rgba(255, 255, 0, 0.8)' }, // Yellow
      { pos: 0.3, color: 'rgba(255, 165, 0, 0.9)' }, // Orange
      { pos: 0.6, color: 'rgba(255, 69, 0, 0.95)' }, // Darker orange
      { pos: 1, color: 'rgba(255, 0, 0, 1)' } // Bright red
    ];
  
    let start = colors[0], end = colors[1];
    for (let i = 0; i < colors.length - 1; i++) {
      if (intensity >= colors[i].pos && intensity <= colors[i + 1].pos) {
        start = colors[i];
        end = colors[i + 1];
        break;
      }
    }
  
    const rangeIntensity = (intensity - start.pos) / (end.pos - start.pos);
    const startColor = start.color.match(/\d+/g).map(Number);
    const endColor = end.color.match(/\d+/g).map(Number);
  
    const r = Math.round(startColor[0] + (endColor[0] - startColor[0]) * rangeIntensity);
    const g = Math.round(startColor[1] + (endColor[1] - startColor[1]) * rangeIntensity);
    const b = Math.round(startColor[2] + (endColor[2] - startColor[2]) * rangeIntensity);
    const a = (startColor[3] / 255 || 0) + ((endColor[3] / 255 || 1) - (startColor[3] / 255 || 0)) * rangeIntensity;
  
    return `rgba(${r}, ${g}, ${b}, ${a})`;
  };

  return (
    <div className="absolute inset-0 pointer-events-none">
      <div 
        className="absolute inset-0"
        style={{
          filter: `blur(${blurRadius}px)`,
          transition: 'filter 0.3s ease-in-out'
        }}
      >
        {heatmapData.map((cell, index) => (
          <div
            key={`heat-${index}`}
            className="absolute"
            style={{
              left: `${cell.x}%`,
              top: `${cell.y}%`,
              width: `${cell.width}%`,
              height: `${cell.height}%`,
              backgroundColor: getHeatColor(cell.intensity),
              transition: 'background-color 0.5s ease-out, left 0.5s ease-out, top 0.5s ease-out',
              mixBlendMode: 'hard-light'
          }}
          />
        ))}
      </div>
    </div>
  );
};

export default Heatmap;