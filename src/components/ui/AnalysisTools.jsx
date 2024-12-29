import React, { useState, useEffect } from 'react';
import { Ruler, Activity, Target } from 'lucide-react'; // Add back Target icon

const AnalysisTools = ({ 
  players, 
  tacticalElements, 
  onToolSelect, 
  TOOLS,
  activeTool,
  onHeatmapToggle  // Add this prop back
}) => {
  const [showDistances, setShowDistances] = useState(false);
  const [showPlayerStats, setShowPlayerStats] = useState(false);
  const [showHeatmap, setShowHeatmap] = useState(false); 
  const [playerStats, setPlayerStats] = useState({});
  // Add state for heatmap

  // Calculate player statistics based on their movements and actions
  useEffect(() => {
    const stats = players.reduce((acc, player) => {
      // Count passes and runs involving this player
      const passesMade = tacticalElements.filter(
        el => el.type === 'pass' && 
        isPlayerNearPoint(player.position, el.start)
      ).length;

      const runsCount = tacticalElements.filter(
        el => el.type === 'run' && 
        isPlayerNearPoint(player.position, el.start)
      ).length;

      acc[player.id] = {
        passesMade,
        runsCount,
        avgPosition: player.position,
      };
      return acc;
    }, {});

    setPlayerStats(stats);
  }, [players, tacticalElements]);

  // Helper function to check if a player is near a point
  const isPlayerNearPoint = (playerPos, point) => {
    const dx = playerPos.x - point.x;
    const dy = playerPos.y - point.y;
    return Math.sqrt(dx * dx + dy * dy) < 5; // 5% of pitch size as threshold
  };

  // Calculate team shape metrics
  const calculateTeamShape = () => {
    const xPositions = players.map(p => p.position.x);
    const yPositions = players.map(p => p.position.y);
    
    return {
      width: (Math.max(...yPositions) - Math.min(...yPositions)).toFixed(1),
      depth: (Math.max(...xPositions) - Math.min(...xPositions)).toFixed(1),
      compactness: calculateCompactness()
    };
  };

  const calculateCompactness = () => {
    let totalDistance = 0;
    let count = 0;
    
    for (let i = 0; i < players.length; i++) {
      for (let j = i + 1; j < players.length; j++) {
        const dx = players[i].position.x - players[j].position.x;
        const dy = players[i].position.y - players[j].position.y;
        totalDistance += Math.sqrt(dx * dx + dy * dy);
        count++;
      }
    }
    
    return (totalDistance / count).toFixed(1);
  };

  const handleRulerClick = () => {
    onToolSelect(activeTool === TOOLS.MEASURE ? TOOLS.SELECT : TOOLS.MEASURE);
  };

  const shape = calculateTeamShape();

  const handleHeatmapToggle = () => {
    setShowHeatmap(!showHeatmap);
    onHeatmapToggle();
  };

  return (
    <div className="flex flex-col gap-4 bg-gray-800 p-4 rounded-lg">
      <div className="flex gap-2">
        <button
          onClick={handleRulerClick}
          className={`p-2 rounded ${activeTool === TOOLS.MEASURE ? 'bg-blue-500' : 'bg-gray-700'}`}
          title="Measure Distance"
        >
          <Ruler className="w-5 h-5 text-white" />
        </button>
        <button
          onClick={() => setShowPlayerStats(!showPlayerStats)}
          className={`p-2 rounded ${showPlayerStats ? 'bg-blue-500' : 'bg-gray-700'}`}
          title="Show Player Stats"
        >
          <Activity className="w-5 h-5 text-white" />
        </button>
        <button
          onClick={handleHeatmapToggle}
          className={`p-2 rounded ${showHeatmap ? 'bg-blue-500' : 'bg-gray-700'}`}
          title="Toggle Heatmap"
        >
          <Target className="w-5 h-5 text-white" />
        </button>
      </div>

      {/* Formation Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-gray-700 p-3 rounded">
          <div className="text-xs text-gray-400">Width</div>
          <div className="text-white font-medium">{shape.width}m</div>
        </div>
        <div className="bg-gray-700 p-3 rounded">
          <div className="text-xs text-gray-400">Depth</div>
          <div className="text-white font-medium">{shape.depth}m</div>
        </div>
        <div className="bg-gray-700 p-3 rounded">
          <div className="text-xs text-gray-400">Compactness</div>
          <div className="text-white font-medium">{shape.compactness}</div>
        </div>
      </div>

      {/* Player Stats Panel */}
      {showPlayerStats && (
        <div className="bg-gray-700 p-3 rounded mt-2">
          <h3 className="text-white font-medium mb-2">Player Actions</h3>
          <div className="grid grid-cols-2 gap-2">
            {Object.entries(playerStats).map(([playerId, stats]) => (
              <div key={playerId} className="text-sm text-gray-200">
                Player {playerId}:
                <div className="text-xs text-gray-400">
                  Passes: {stats.passesMade}
                  <br />
                  Runs: {stats.runsCount}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AnalysisTools;