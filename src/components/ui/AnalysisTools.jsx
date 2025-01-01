import React, { useState } from 'react';
import { Ruler, Activity, Target, Maximize2, ArrowDownUp, Users, RefreshCw } from 'lucide-react';
import { 
    Tooltip, 
    TooltipContent, 
    TooltipProvider, 
    TooltipTrigger 
} from "./tooltip"

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

const MetricButton = ({ icon: Icon, label, value, onClick }) => (
    <TooltipProvider delayDuration={300}>
        <Tooltip>
            <TooltipTrigger asChild>
                <button
                    onClick={onClick}
                    className="w-full flex items-center gap-2 p-2 lg:p-3 rounded-lg transition-all bg-gray-700/50 hover:bg-gray-700 border border-gray-700"
                >
                    <Icon className="w-4 h-4 lg:w-5 lg:h-5 text-gray-400" />
                    <div className="text-left flex-1">
                        <div className="text-white text-xs lg:text-sm font-medium">{value}</div>
                        <div className="text-gray-400 text-[10px] lg:text-xs">{label}</div>
                    </div>
                </button>
            </TooltipTrigger>
            <TooltipContent side="bottom" className="bg-gray-800 text-white px-2 py-1 rounded-lg text-xs">
                {label}
            </TooltipContent>
        </Tooltip>
    </TooltipProvider>
);

const AnalysisTools = ({
    players,
    tacticalElements,
    onToolSelect,
    TOOLS,
    activeTool,
    onHeatmapToggle,
    onHeatmapClear
}) => {
    const [showPlayerStats, setShowPlayerStats] = useState(false);
    const [showHeatmap, setShowHeatmap] = useState(false);

    const handleHeatmapToggle = () => {
        setShowHeatmap(!showHeatmap);
        onHeatmapToggle();
    };

    // Calculate team metrics
    const metrics = (() => {
        const xPositions = players.map(p => p.position.x);
        const yPositions = players.map(p => p.position.y);
        
        const width = Math.max(...yPositions) - Math.min(...yPositions);
        const depth = Math.max(...xPositions) - Math.min(...xPositions);
        
        const defenders = players.filter(p => p.position.x < 35);
        const midfielders = players.filter(p => p.position.x >= 35 && p.position.x < 65);
        const forwards = players.filter(p => p.position.x >= 65);

        return {
            width: width.toFixed(1),
            depth: depth.toFixed(1),
            formation: `${defenders.length}-${midfielders.length}-${forwards.length}`
        };
    })();

    return (
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
                    onClick={handleHeatmapToggle}
                    isActive={showHeatmap}
                />
            </div>

            {/* Metrics Grid */}
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

            {/* Player Stats Panel */}
            {showPlayerStats && (
                <div className="mt-2 pt-2 lg:mt-3 lg:pt-3 border-t border-gray-700">
                    <div className="grid grid-cols-3 lg:grid-cols-1 gap-1.5 lg:gap-2">
                        {players.map(player => (
                            <div key={player.id} className="bg-gray-700 p-1.5 lg:p-2 rounded">
                                <div className="flex items-center gap-1">
                                    <div className="w-3 h-3 lg:w-4 lg:h-4 rounded-full bg-blue-500 flex items-center justify-center text-white text-[0.6rem] lg:text-[0.7rem]">
                                        {player.id}
                                    </div>
                                    <span className="text-gray-200 text-[10px] lg:text-xs">
                                        {PLAYER_ROLES[player.id]}
                                    </span>
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