import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Ruler, Activity, Target, Maximize2, ArrowDownUp, Users, ArrowRight, ArrowUpRight, X } from 'lucide-react';
import { 
    Tooltip, 
    TooltipContent, 
    TooltipProvider, 
    TooltipTrigger 
} from "@/components/ui/tooltip"


const ToolButton = ({ icon: Icon, label, onClick, isActive }) => (
    <TooltipProvider delayDuration={300}>
        <Tooltip>
            <TooltipTrigger asChild>
                <button
                    onClick={onClick}
                    className={`p-4 lg:p-5 gap-2 flex items-center justify-center rounded-lg transition-all
                        ${isActive ? 'bg-blue-500' : 'bg-gray-700 hover:bg-gray-600'}`}
                >
                    <Icon className="w-4 h-4 lg:w-5 lg:h-5 text-white" />
                </button>
            </TooltipTrigger>
            <TooltipContent side="bottom" className="bg-gray-800 text-white px-2 py-1 rounded-lg text-xs">
                {label}
            </TooltipContent>
        </Tooltip>
    </TooltipProvider>
);

const PLAYER_ROLES = {
    1: 'GK',
    2: 'LB',
    3: 'CB',
    4: 'CB',
    5: 'RB',
    6: 'CM',
    7: 'CM',
    8: 'CAM',
    9: 'LW',
    10: 'ST',
    11: 'RW'
};

const PlayerStatCard = ({ player, stats }) => (
    <div className="bg-gray-700 p-2 rounded hover:bg-gray-600 transition-colors">
        <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-full bg-blue-500 border border-white flex items-center justify-center text-white text-xs font-bold">
                {player.id}
            </div>
            <span className="text-gray-200 text-sm font-medium">{PLAYER_ROLES[player.id]}</span>
        </div>
        <div className="mt-2 text-xs text-gray-300">
            <div className="flex justify-between gap-3">
                <div className="flex items-center gap-2">
                    <span className="text-gray-400">Pass:</span>
                    <span className="text-white font-medium">{stats.passes}</span>
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-gray-400">Run:</span>
                    <span className="text-white font-medium">{stats.runs}</span>
                </div>
            </div>
        </div>
    </div>
);

const MetricButton = ({ icon: Icon, label, value }) => (
    <div className="w-full flex items-center gap-2 p-2 lg:p-3 rounded-lg bg-gray-700/50 border border-gray-700">
        <Icon className="w-4 h-4 lg:w-5 lg:h-5 text-gray-400" />
        <div className="text-left flex-1">
            <div className="text-white text-xs lg:text-sm font-medium">{value}</div>
            <div className="text-gray-400 text-[10px] lg:text-xs">{label}</div>
        </div>
    </div>
);

const FloatingPlayerStats = ({ players, getPlayerStats, onClose }) => {
    const [position, setPosition] = useState({ x: 1020, y: 315 });
    const [isDragging, setIsDragging] = useState(false);
    const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

    const handleMouseDown = (e) => {
        setIsDragging(true);
        setDragOffset({
            x: e.clientX - position.x,
            y: e.clientY - position.y
        });
    };

    const handleMouseMove = (e) => {
        if (isDragging) {
            setPosition({
                x: e.clientX - dragOffset.x,
                y: e.clientY - dragOffset.y
            });
        }
    };

    const handleMouseUp = () => {
        setIsDragging(false);
    };

    React.useEffect(() => {
        if (isDragging) {
            window.addEventListener('mousemove', handleMouseMove);
            window.addEventListener('mouseup', handleMouseUp);
        }
        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        };
    }, [isDragging]);

    return (
        <div
            className="fixed bg-gray-800 rounded-xl shadow-lg p-4 min-w-[300px] z-50 select-none"
            style={{
                left: `${position.x}px`,
                top: `${position.y}px`,
                cursor: isDragging ? 'grabbing' : 'grab'
            }}
        >
            <div 
                className="flex items-center justify-between mb-3 cursor-grab"
                onMouseDown={handleMouseDown}
            >
                <h3 className="text-white text-sm font-medium">Player Stats</h3>
                <button 
                    onClick={onClose}
                    className="text-gray-400 hover:text-white"
                >
                    <X className="w-4 h-4" />
                </button>
            </div>
            <div className="grid grid-cols-3 gap-2">
                {players.map(player => (
                    <PlayerStatCard
                        key={player.id}
                        player={player}
                        stats={getPlayerStats(player.id)}
                    />
                ))}
            </div>
        </div>
    );
};

const AnalysisTools = ({
    players,
    tacticalElements,
    onToolSelect,
    TOOLS,
    activeTool,
    onHeatmapToggle,
    onHeatmapClear,
    showHeatmap // Add this prop to sync with parent state
}) => {
    const [showPlayerStats, setShowPlayerStats] = useState(false);

// Inside AnalysisTools component
useEffect(() => {
    const handleWindowResize = () => {
        if (showPlayerStats && window.innerWidth < 1024) {
            setShowPlayerStats(false);
        }
    };
    window.addEventListener('resize', handleWindowResize);
    return () => window.removeEventListener('resize', handleWindowResize);
}, [showPlayerStats]);

// Team metrics calculation
const metrics = useMemo(() => {
    const xPositions = players.map(p => p.position.x);
    const yPositions = players.map(p => p.position.y);
    
    const FIELD_LENGTH = 105;
    const FIELD_WIDTH = 68;
    
    // Replace the width/depth calculations with these scaled versions
    const width = (Math.max(...yPositions) - Math.min(...yPositions)) * (FIELD_WIDTH / 100);
    const depth = (Math.max(...xPositions) - Math.min(...xPositions)) * (FIELD_LENGTH / 100);
    
    const defenders = players.filter(p => p.position.x < 35);
    const midfielders = players.filter(p => p.position.x >= 35 && p.position.x < 65);
    const forwards = players.filter(p => p.position.x >= 65);

    return {
        width: width.toFixed(1),
        depth: depth.toFixed(1),
        formation: `${defenders.length}-${midfielders.length}-${forwards.length}`
    };
}, [players]);

const getPlayerStats = useCallback((playerId) => {
    const player = players.find(p => p.id === playerId);
    if (!player) return { passes: 0, runs: 0 };

    const isStartingFromPlayer = (element) => {
        if (!element.start) return false;
        
        // Convert player's y-coordinate from percentage to SVG viewport scale
        const normalizedPlayerY = (player.position.y / 100) * 56.25;
        
        // Get distances using normalized coordinates
        const deltaX = Math.abs(element.start.x - player.position.x);
        const deltaY = Math.abs(element.start.y - normalizedPlayerY);

        // Adjusted thresholds based on coordinate systems
        const thresholdX = 3; // For x-axis (already in same scale)
        const thresholdY = 1.7; // For y-axis (adjusted for aspect ratio)

        return deltaX <= thresholdX && deltaY <= thresholdY;
    };

    return tacticalElements.reduce((acc, element) => {
        if (isStartingFromPlayer(element)) {
            if (element.type === 'pass') {
                acc.passes += 1;
            } else if (element.type === 'run') {
                acc.runs += 1;
            }
        }
        return acc;
    }, { passes: 0, runs: 0 });
}, [players, tacticalElements]);

return (
    <>
        <div className="p-2 lg:p-3 bg-gray-800 rounded-xl shadow-lg space-y-2 lg:space-y-4">
            {/* Quick Tips Section */}
            <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg px-2 py-1.5 lg:px-3 lg:py-2">
                <div className="flex flex-wrap lg:flex-col text-[10px] lg:text-xs text-blue-200/80">
                    <span className="font-semibold mr-1 lg:mr-0 lg:mb-1">Tips:</span>
                    <div className="flex flex-wrap lg:flex-col lg:space-y-1">
                        <span>V: Select</span>
                        <span className="ml-2 lg:ml-0">P: Pass</span>
                        <span className="ml-2 lg:ml-0">R: Run</span>
                        <span className="ml-2 lg:ml-0">Z: Zone</span>
                        <span className="ml-2 lg:ml-0">S: Shape</span>
                        <span className="ml-2 lg:ml-0">M: Measure</span>
                    </div>
                </div>
            </div>

            {/* Tools Grid */}
            <div className="grid grid-cols-3 lg:grid-cols-1 gap-1.5 lg:gap-2">
                <ToolButton
                    icon={Ruler}
                    label="Measure Tool"
                    onClick={() => onToolSelect(activeTool === TOOLS.MEASURE ? TOOLS.SELECT : TOOLS.MEASURE)}
                    isActive={activeTool === TOOLS.MEASURE}
                />
                <ToolButton
                    icon={Activity}
                    label="Player Stats"
                    onClick={() => setShowPlayerStats(!showPlayerStats)}
                    isActive={showPlayerStats}
                />
                <ToolButton
                    icon={Target}
                    label="Movement Heatmap"
                    onClick={() => onHeatmapToggle()}
                    isActive={showHeatmap}
                />
            </div>

            {/* Team Metrics */}
            <div className="grid grid-cols-3 lg:grid-cols-1 gap-1.5 lg:gap-2">
                <MetricButton
                    icon={Maximize2}
                    label="Team Width"
                    value={`${metrics.width}m`}
                />
                <MetricButton
                    icon={ArrowDownUp}
                    label="Team Depth"
                    value={`${metrics.depth}m`}
                />
                <MetricButton
                    icon={Users}
                    label="Formation"
                    value={metrics.formation}
                />
            </div>

            {/* Mobile player stats */}
            <div className="lg:hidden">
                {showPlayerStats && (
                    <div className="mt-3 pt-3 border-t border-gray-700">
                        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-1.5">
                            {players.map(player => (
                                <PlayerStatCard
                                    key={player.id}
                                    player={player}
                                    stats={getPlayerStats(player.id)}
                                />
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>

        {/* Desktop floating stats window */}
        {showPlayerStats && window.innerWidth >= 1024 && (
            <FloatingPlayerStats
                players={players}
                getPlayerStats={getPlayerStats}
                onClose={() => setShowPlayerStats(false)}
            />
        )}
    </>
);
};

export default AnalysisTools;