import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    ArrowRight,
    ArrowUpRight,
    Circle,
    Square,
    Move,
    RotateCcw,
    Trash2,
    LineChart
} from 'lucide-react'
import { FORMATIONS } from '../../data/formations'
import TimelineControl from '../ui/TimelineControl';
import { FormationSelector, SaveFormation, SavedFormations } from "../ui/FormationControl"
import AnalysisTools from '../ui/AnalysisTools';

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

const TOOLS = {
    PASS: 'pass',
    RUN: 'run',
    ZONE: 'zone',
    SHAPE: 'shape',
    SELECT: 'select',
    MEASURE: 'measure'  // Add this new tool type
};

const ARROW_STYLES = {
    pass: {
        color: '#ffffff',
        strokeDasharray: '5,5',
        className: 'h-0.5'
    },
    run: {
        color: '#ffff00',
        strokeDasharray: 'none',
        className: 'h-1'
    }
};

const DEFAULT_FORMATION = [
    { id: 1, position: { x: 10, y: 50 }, positionHistory: [] },
    { id: 2, position: { x: 25, y: 25 }, positionHistory: [] },
    { id: 3, position: { x: 25, y: 45 }, positionHistory: [] },
    { id: 4, position: { x: 25, y: 55 }, positionHistory: [] },
    { id: 5, position: { x: 25, y: 75 }, positionHistory: [] },
    { id: 6, position: { x: 45, y: 35 }, positionHistory: [] },
    { id: 7, position: { x: 45, y: 65 }, positionHistory: [] },
    { id: 8, position: { x: 60, y: 50 }, positionHistory: [] },
    { id: 9, position: { x: 75, y: 25 }, positionHistory: [] },
    { id: 10, position: { x: 75, y: 50 }, positionHistory: [] },
    { id: 11, position: { x: 75, y: 75 }, positionHistory: [] }
];
const Player = ({ id, position, onDragStart, isSelectable }) => {
    const handleMouseDown = (e) => {
        e.preventDefault(); // Prevent default browser behavior
        e.stopPropagation(); // Stop event from bubbling to pitch
        if (isSelectable) {
            onDragStart(id);
        }
    };

    return (
        <motion.div
            className={`absolute w-12 h-12 flex flex-col items-center justify-center select-none
                   ${isSelectable ? 'cursor-move' : 'cursor-default'}`}
            style={{
                left: `${position.x}%`,
                top: `${position.y}%`,
                transform: 'translate(-50%, -50%)',
                userSelect: 'none',
                WebkitUserSelect: 'none',
                msUserSelect: 'none',
                // Only enable pointer-events when the SELECT tool is active
                pointerEvents: isSelectable ? 'auto' : 'none'
            }}
            animate={{
                left: `${position.x}%`,
                top: `${position.y}%`
            }}
            transition={{
                type: "spring",
                stiffness: 120,
                damping: 20,
                mass: 1
            }}
            onMouseDown={handleMouseDown}
        >
            <div className={`w-8 h-8 rounded-full bg-blue-500 border-2 border-white 
                      flex items-center justify-center text-white font-bold
                      ${isSelectable ? 'hover:bg-blue-600' : ''}`}>
                {id}
            </div>
            <div className="text-white text-xs font-medium mt-1 bg-black/50 px-1 rounded">
                {PLAYER_ROLES[id]}
            </div>
        </motion.div>
    );
};

const TacticalArrow = ({ start, end, type = 'pass' }) => {
    const dx = end.x - start.x;
    const dy = end.y - start.y;
    const angle = Math.atan2(dy, dx) * 180 / Math.PI;
    const length = Math.sqrt(dx * dx + dy * dy);
    const style = ARROW_STYLES[type];

    return (
        <div
            className={`absolute origin-left ${style.className}`}
            style={{
                left: `${start.x}%`,
                top: `${start.y}%`,
                width: `${length}%`,
                backgroundColor: style.color,
                transform: `rotate(${angle}deg)`,
                strokeDasharray: style.strokeDasharray
            }}
        >
            <div
                className="absolute right-0 top-1/2 -translate-y-1/2"
                style={{ color: style.color }}
            >
                <ArrowRight className="w-4 h-4" />
            </div>
        </div>
    );
};

const DistanceMeasurement = ({ start, end }) => {
    const dx = end.x - start.x;
    const dy = end.y - start.y;
    const distance = Math.sqrt(dx * dx + dy * dy).toFixed(1);
    const angle = Math.atan2(dy, dx) * 180 / Math.PI;
    const midPoint = {
        x: start.x + dx / 2,
        y: start.y + dy / 2
    };

    return (
        <>
            <div
                className="absolute origin-left h-0.5 bg-white"
                style={{
                    left: `${start.x}%`,
                    top: `${start.y}%`,
                    width: `${Math.sqrt(dx * dx + dy * dy)}%`,
                    transform: `rotate(${angle}deg)`,
                }}
            />
            <div
                className="absolute bg-black/50 px-2 py-1 rounded text-white text-xs transform -translate-x-1/2 -translate-y-1/2"
                style={{
                    left: `${midPoint.x}%`,
                    top: `${midPoint.y}%`,
                }}
            >
                {distance}m
            </div>
        </>
    );
};

const Zone = ({ start, end, color = "rgba(255, 255, 0, 0.2)" }) => {
    const width = Math.abs(end.x - start.x);
    const height = Math.abs(end.y - start.y);
    const left = Math.min(start.x, end.x);
    const top = Math.min(start.y, end.y);

    return (
        <div
            className="absolute border-2 border-yellow-400 rounded"
            style={{
                left: `${left}%`,
                top: `${top}%`,
                width: `${width}%`,
                height: `${height}%`,
                backgroundColor: color
            }}
        />
    );
};

const TeamShape = ({ players }) => {
    const lines = [
        players.filter(p => p.position.y > 65),
        players.filter(p => p.position.y <= 65 && p.position.y > 35),
        players.filter(p => p.position.y <= 35)
    ];

    return (
        <>
            {lines.map((line, index) => {
                if (line.length < 2) return null;

                const sortedPlayers = [...line].sort((a, b) => a.position.x - b.position.x);

                return sortedPlayers.slice(1).map((player, idx) => {
                    const start = sortedPlayers[idx].position;
                    const end = player.position;

                    return (
                        <div
                            key={`shape-${index}-${idx}`}
                            className="absolute h-0.5 origin-left"
                            style={{
                                left: `${start.x}%`,
                                top: `${start.y}%`,
                                width: `${Math.sqrt(
                                    Math.pow(end.x - start.x, 2) +
                                    Math.pow(end.y - start.y, 2)
                                )}%`,
                                backgroundColor: '#ffffff40',
                                transform: `rotate(${Math.atan2(end.y - start.y, end.x - start.x) * 180 / Math.PI
                                    }deg)`
                            }}
                        />
                    );
                });
            })}
        </>
    );
};

const Toolbar = ({ activeTool, onToolSelect, onUndo, onClear }) => {
    return (
        <div className="flex gap-2 mb-4 p-2 bg-gray-800 rounded-lg">
            <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => onToolSelect(TOOLS.SELECT)}
                className={`p-2 rounded ${activeTool === TOOLS.SELECT ? 'bg-blue-500' : 'bg-gray-700'}`}
            >
                <Move className="w-5 h-5 text-white" />
            </motion.button>
            <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => onToolSelect(TOOLS.PASS)}
                className={`p-2 rounded ${activeTool === TOOLS.PASS ? 'bg-blue-500' : 'bg-gray-700'}`}
            >
                <ArrowRight className="w-5 h-5 text-white" />
            </motion.button>
            <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => onToolSelect(TOOLS.RUN)}
                className={`p-2 rounded ${activeTool === TOOLS.RUN ? 'bg-blue-500' : 'bg-gray-700'}`}
            >
                <ArrowUpRight className="w-5 h-5 text-white" />
            </motion.button>
            <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => onToolSelect(TOOLS.ZONE)}
                className={`p-2 rounded ${activeTool === TOOLS.ZONE ? 'bg-blue-500' : 'bg-gray-700'}`}
            >
                <Square className="w-5 h-5 text-white" />
            </motion.button>
            <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => onToolSelect(TOOLS.SHAPE)}
                className={`p-2 rounded ${activeTool === TOOLS.SHAPE ? 'bg-blue-500' : 'bg-gray-700'}`}
            >
                <LineChart className="w-5 h-5 text-white" />
            </motion.button>
            <div className="w-px bg-gray-600 mx-2" />
            <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={onUndo}
                className="p-2 rounded bg-gray-700"
            >
                <RotateCcw className="w-5 h-5 text-white" />
            </motion.button>
            <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={onClear}
                className="p-2 rounded bg-gray-700"
            >
                <Trash2 className="w-5 h-5 text-white" />
            </motion.button>
        </div>
    );
};

const Heatmap = ({ players }) => {
    if (!players) return null;
  
    const getHeatColor = (frequency) => {
      if (frequency > 0.3) {
        return 'rgba(255, 0, 0, 0.3)';
      } else if (frequency > 0.15) {
        return 'rgba(255, 251, 0, 0.5)';
      } else {
        return 'rgba(0, 255, 0, 0.2)';
      }
    };
  
    const getPositionFrequencies = (player) => {
      if (!player.positionHistory?.length) return [];
  
      const grid = {};
      const gridSize = 2; // Made even smaller for more precise areas
  
      player.positionHistory.forEach(pos => {
        const gridX = Math.floor(pos.x / gridSize) * gridSize;
        const gridY = Math.floor(pos.y / gridSize) * gridSize;
        const key = `${gridX},${gridY}`;
        grid[key] = (grid[key] || 0) + 1;
      });
  
      const maxFreq = Math.max(...Object.values(grid), 1);
  
      return Object.entries(grid).map(([pos, freq]) => {
        const [x, y] = pos.split(',').map(Number);
        return {
          x,
          y,
          frequency: freq / maxFreq
        };
      });
    };
  
    return (
      <div className="absolute inset-0 pointer-events-none">
        {/* Heat map layer */}
        {players.map(player => {
          const frequencies = getPositionFrequencies(player);
          return frequencies.map((pos, index) => (
            <div
              key={`${player.id}-heat-${index}`}
              className="absolute inset-0"
              style={{
                background: `radial-gradient(circle at ${pos.x}% ${pos.y}%, 
                  ${getHeatColor(pos.frequency)} 0%, 
                  transparent 8%)`,  // Reduced from 12% to 8% for smaller heat areas
                mixBlendMode: 'overlay'
              }}
            />
          ));
        })}
  
        {/* Current positions */}
        {players.map((player) => (
          player.position && (
            <div
              key={`current-${player.id}`}
              className="absolute inset-0"
              style={{
                background: `radial-gradient(circle at ${player.position.x}% ${player.position.y}%, 
                  rgba(255, 255, 255, 0.2) 0%, 
                  transparent 5%)`,  // Reduced from 8% to 5%
                mixBlendMode: 'multiply'
              }}
            />
          )
        ))}
      </div>
    );
  };
const FootballPitch = () => {
    const pitchRef = useRef(null);
    const [players, setPlayers] = useState(DEFAULT_FORMATION);
    const [draggedPlayer, setDraggedPlayer] = useState(null);
    const [activeTool, setActiveTool] = useState(TOOLS.SELECT);
    const [tacticalElements, setTacticalElements] = useState([]);
    const [currentElement, setCurrentElement] = useState(null);
    const [showTeamShape, setShowTeamShape] = useState(false);
    const [savedFormations, setSavedFormations] = useState([]);
    const [currentFormation, setCurrentFormation] = useState('4-3-3');
    const [frames, setFrames] = useState([]);
    const [currentFrame, setCurrentFrame] = useState(0);
    const [showHeatmap, setShowHeatmap] = useState(false);
    const [positionHistory, setPositionHistory] = useState([]);



    // Formation handling
    const handleFormationSelect = (formation) => {
        setPlayers(formation);
        // Find the formation name by comparing the formation data
        const formationName = Object.entries(FORMATIONS).find(
            ([_, value]) => JSON.stringify(value) === JSON.stringify(formation)
        )?.[0] || '4-3-3';
        setCurrentFormation(formationName);
    };

    const handleSaveFormation = (formation) => {
        setSavedFormations([...savedFormations, formation]);
    };

    const getMousePosition = (e) => {
        const pitch = pitchRef.current.getBoundingClientRect();
        return {
            x: ((e.clientX - pitch.left) / pitch.width) * 100,
            y: ((e.clientY - pitch.top) / pitch.height) * 100
        };
    };

    const handleDragStart = (id) => {
        if (activeTool === TOOLS.SELECT) {
            setDraggedPlayer(id);
        }
    };

    const handleMouseDown = (e) => {
        if (!pitchRef.current) return;

        const position = getMousePosition(e);

        if (activeTool === TOOLS.ZONE ||
            activeTool === TOOLS.RUN ||
            activeTool === TOOLS.PASS ||
            activeTool === TOOLS.MEASURE) {  // Add measure tool
            setCurrentElement({
                type: activeTool,
                start: position,
                end: position
            });
        }
    };

    const handleMouseMove = (e) => {
        if (!pitchRef.current) return;

        const position = getMousePosition(e);

        if (draggedPlayer !== null && activeTool === TOOLS.SELECT) {
            // Track the position for the dragged player
            const updatedPlayers = players.map(player =>
                player.id === draggedPlayer
                    ? {
                        ...player,
                        position,
                        positionHistory: [
                            ...(player.positionHistory || []),
                            { x: position.x, y: position.y, timestamp: Date.now() }
                        ]
                    }
                    : player
            );

            setPlayers(updatedPlayers);

            // Update the current frame if we're editing an existing frame
            if (currentFrame < frames.length) {
                updateCurrentFrame();
            }
        }

        if (currentElement) {
            setCurrentElement({
                ...currentElement,
                end: position
            });
        }
    };

    const handleMouseUp = () => {
        if (currentElement) {
            const newTacticalElements = [...tacticalElements, currentElement];
            setTacticalElements(newTacticalElements);
            setCurrentElement(null);

            // Update the current frame if we're editing an existing frame
            if (currentFrame < frames.length) {
                const updatedFrames = [...frames];
                updatedFrames[currentFrame] = {
                    players: [...players],
                    tacticalElements: newTacticalElements
                };
                setFrames(updatedFrames);
            }
        }
        setDraggedPlayer(null);
    };

    const handleToolSelect = (tool) => {
        setActiveTool(tool);
        if (tool === TOOLS.SHAPE) {
            setShowTeamShape(!showTeamShape);
        }
        if (tool === TOOLS.MEASURE) {
            // Clear any existing measurements when toggling off the measure tool
            if (activeTool === TOOLS.MEASURE) {
                setTacticalElements(elements =>
                    elements.filter(el => el.type !== 'measure')
                );
            }
        }
    };

    const handleUndo = () => {
        setTacticalElements(elements => elements.slice(0, -1));
    };

    const handleClear = () => {
        setTacticalElements([]);
        setShowTeamShape(false);
        setFrames([]);
        setCurrentFrame(0);
        setPositionHistory([]); // Clear heatmap data
    };
    const handleAddFrame = () => {
        // Save current state as a new frame
        const newFrame = {
            players: [...players],
            tacticalElements: [...tacticalElements]
        };
        setFrames([...frames, newFrame]);
    };

    const handlePlaybackFrame = (frameIndex) => {
        if (frames[frameIndex]) {
            const frame = frames[frameIndex];
            setPlayers([...frame.players]);  // Make sure we create new arrays
            setTacticalElements([...frame.tacticalElements]);
            setCurrentFrame(frameIndex);
        }
    };

    const updateCurrentFrame = () => {
        if (currentFrame < frames.length) {
            const updatedFrames = [...frames];
            updatedFrames[currentFrame] = {
                players: [...players],
                tacticalElements: [...tacticalElements]
            };
            setFrames(updatedFrames);
        }
    };

    return (
        <div className="w-full max-w-6xl mx-auto p-4">
            <FormationSelector
                onFormationSelect={handleFormationSelect}
                currentFormation={currentFormation}
            />

            <SaveFormation
                players={players}
                onSave={handleSaveFormation}
            />

            <SavedFormations
                formations={savedFormations}
                onLoad={setPlayers}
            />

            <Toolbar
                activeTool={activeTool}
                onToolSelect={handleToolSelect}
                onUndo={handleUndo}
                onClear={handleClear}
            />

            <TimelineControl
                onAddFrame={handleAddFrame}
                onPlayback={handlePlaybackFrame}
                currentFrame={currentFrame}
                frames={frames}
            />

            <div className="mb-4">
                <AnalysisTools
                    players={players}
                    tacticalElements={tacticalElements}
                    onToolSelect={handleToolSelect}
                    TOOLS={TOOLS}
                    activeTool={activeTool}
                    onHeatmapToggle={() => setShowHeatmap(!showHeatmap)}
                />
            </div>

            <div
                ref={pitchRef}
                className="relative w-full bg-green-600 border-2 border-white rounded-lg shadow-xl select-none"
                style={{
                    paddingTop: '56.25%',
                    userSelect: 'none',
                    WebkitUserSelect: 'none',
                    msUserSelect: 'none'
                }}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={(e) => {
                    handleMouseUp(e);
                    setDraggedPlayer(null);
                    setCurrentElement(null);
                }}
            >
                {/* Pitch markings */}
                <div className="absolute inset-0">
                    {/* Center circle */}
                    <div className="absolute left-1/2 top-1/2 w-32 h-32 border-2 border-white rounded-full transform -translate-x-1/2 -translate-y-1/2" />

                    {/* Center line */}
                    <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-white transform -translate-x-1/2" />

                    {/* Left penalty area */}
                    <div className="absolute left-0 top-1/2 h-48 w-32 border-2 border-white transform -translate-y-1/2" />
                    <div className="absolute left-0 top-1/2 h-24 w-12 border-2 border-white transform -translate-y-1/2" />

                    {/* Right penalty area */}
                    <div className="absolute right-0 top-1/2 h-48 w-32 border-2 border-white transform -translate-y-1/2" />
                    <div className="absolute right-0 top-1/2 h-24 w-12 border-2 border-white transform -translate-y-1/2" />

                    {/* Corner arcs */}
                    <div className="absolute left-0 top-0 w-8 h-8 border-r-2 border-white rounded-br-full" />
                    <div className="absolute right-0 top-0 w-8 h-8 border-l-2 border-white rounded-bl-full" />
                    <div className="absolute left-0 bottom-0 w-8 h-8 border-r-2 border-white rounded-tr-full" />
                    <div className="absolute right-0 bottom-0 w-8 h-8 border-l-2 border-white rounded-tl-full" />
                </div>

                {/* Tactical Elements */}
                
                <AnimatePresence>
                    {tacticalElements.map((element, index) => {
                        if (element.type === TOOLS.ZONE) {
                            return (
                                <motion.div
                                    key={`zone-${index}`}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                >
                                    <Zone start={element.start} end={element.end} />
                                </motion.div>
                            );
                        }
                        if (element.type === TOOLS.MEASURE) {
                            return (
                                <motion.div
                                    key={`measure-${index}`}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                >
                                    <DistanceMeasurement start={element.start} end={element.end} />
                                </motion.div>
                            );
                        }
                        return (
                            <motion.div
                                key={`arrow-${index}`}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                            >
                                <TacticalArrow
                                    start={element.start}
                                    end={element.end}
                                    type={element.type}
                                />
                            </motion.div>
                        );
                    })}
                </AnimatePresence>

                {/* Current Element Preview */}
                {currentElement && (
                    currentElement.type === TOOLS.ZONE ? (
                        <Zone start={currentElement.start} end={currentElement.end} />
                    ) : currentElement.type === TOOLS.MEASURE ? (
                        <DistanceMeasurement start={currentElement.start} end={currentElement.end} />
                    ) : (
                        <TacticalArrow
                            start={currentElement.start}
                            end={currentElement.end}
                            type={currentElement.type}
                        />
                    )
                )}

                {/* Team Shape */}
                {showTeamShape && <TeamShape players={players} />}
                {/* Heatmap Layer */}
                {showHeatmap && <Heatmap players={players} />}
                {/* Players */}
                <AnimatePresence>
                    {players.map(player => (
                        <Player
                            key={player.id}
                            id={player.id}
                            position={player.position}
                            onDragStart={handleDragStart}
                            isSelectable={activeTool === TOOLS.SELECT}
                        />
                    ))}
                </AnimatePresence>
            </div>
        </div>
    );

}

export default FootballPitch