
import React from 'react';
import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowRight } from 'lucide-react'
import { FORMATIONS } from '../../data/formations'
import TimelineControl from '../ui/TimelineControl';
import { FormationSelector, SaveFormation, SavedFormations } from "../ui/FormationControl"
import AnalysisTools from '../ui/AnalysisTools';
import { Toolbar, TOOLS } from '../ui/Toolbar';
import ActivityGuide from '../ui/ActivityGuide';

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

const getCursorStyle = (tool) => {
    switch (tool) {
        case TOOLS.SELECT:
            return "cursor-default";
        case TOOLS.PASS:
        case TOOLS.RUN:
            return "cursor-crosshair";
        case TOOLS.ZONE:
            return "cursor-crosshair";
        case TOOLS.MEASURE:
            return "cursor-crosshair";
        case TOOLS.SHAPE:
            return "cursor-pointer";
        default:
            return "cursor-default";
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
        e.preventDefault();
        e.stopPropagation();
        if (isSelectable) {
            onDragStart(id);
        }
    };

    const handleTouchStart = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (isSelectable) {
            const touch = e.touches[0];
            onDragStart(id, { clientX: touch.clientX, clientY: touch.clientY });
        }
    };

    return (
        <motion.div
            className={`absolute flex items-center gap-1.5 select-none
                   ${isSelectable ? 'cursor-move' : 'cursor-default'}`}
            style={{
                left: `${position.x}%`,
                top: `${position.y}%`,
                transform: 'translate(-50%, -50%)',
                userSelect: 'none',
                WebkitUserSelect: 'none',
                msUserSelect: 'none',
                pointerEvents: isSelectable ? 'auto' : 'none',
                touchAction: 'none' // Add this to prevent scrolling while dragging
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
            onTouchStart={handleTouchStart}
        >
            <div className={`w-5 h-5 sm:w-8 sm:h-8 rounded-full bg-blue-500 border-[1.5px] sm:border-2 border-white 
                      flex items-center justify-center text-white text-[10px] sm:text-base font-bold
                      ${isSelectable ? 'hover:bg-blue-600' : ''}`}>
                {id}
            </div>
            <div className="text-white text-[8px] sm:text-xs font-medium bg-black/50 px-1 rounded">
                {PLAYER_ROLES[id]}
            </div>
        </motion.div>
    );
};

const TacticalArrow = ({ start, end, type = 'pass' }) => {
    const dx = end.x - start.x;
    const dy = end.y - start.y;
    const angle = Math.atan2(dy, dx) * (180 / Math.PI);
    const length = Math.sqrt(dx * dx + dy * dy);

    const defaultStyle = { className: '', color: 'black', strokeDasharray: '' };
    const style = ARROW_STYLES[type] || defaultStyle;

    return (
        <div
            className={`absolute ${style.className}`}
            style={{
                position: 'absolute',
                left: `${start.x}%`,
                top: `${start.y}%`,
                transform: `rotate(${angle}deg)`, // Arrow line rotation
                transformOrigin: 'left center',
                width: `${length}%`,
                height: '2px',
                backgroundColor: style.color,
            }}
        >
            {/* Arrowhead */}
            <div
                className="absolute"
                style={{
                    position: 'absolute',
                    right: '-2%',
                    top: '48%',
                    transform: 'translateY(-50%) rotate(0deg)', // Rotate only the arrowhead
                    color: style.color,
                }}
            >
                <ArrowRight className="w-6 h-6" />
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

const DrawingIndicator = ({ type, isDrawing }) => {
    if (!isDrawing) return null;

    const messages = {
        [TOOLS.PASS]: 'Drawing Pass...',
        [TOOLS.RUN]: 'Drawing Run...',
        [TOOLS.ZONE]: 'Creating Zone...',
        [TOOLS.MEASURE]: 'Measuring Distance...'
    };

    return (
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-black/50 text-white px-3 py-1 rounded-full text-sm">
            {messages[type] || 'Drawing...'}
        </div>
    );
};

const Heatmap = ({
    players = [],
    gridSize = 4,
    lookbackMinutes = 3,
  }) => {
    if (!players.length) return null;
  
    /**
     * Adjusted color scale with slightly lower alpha
     */
    const getHeatColor = (frequency) => {
      if (frequency > 0.7) {
        return 'rgba(255, 0, 0, 0.6)';
      } else if (frequency > 0.5) {
        return 'rgba(255, 69, 0, 0.5)';
      } else if (frequency > 0.3) {
        return 'rgba(255, 165, 0, 0.4)';
      } else if (frequency > 0.1) {
        return 'rgba(255, 255, 0, 0.25)';
      } else {
        return 'rgba(255, 255, 0, 0.15)';
      }
    };
  
    /**
     * Get frequencies of recent positions for each player
     */
    const getPositionFrequencies = (player) => {
      if (!Array.isArray(player.positionHistory) || player.positionHistory.length === 0) {
        return [];
      }
  
      const grid = {};
      const cutoffTime = Date.now() - lookbackMinutes * 60 * 1000;
  
      const recentPositions = player.positionHistory.filter(
        (pos) => pos.timestamp > cutoffTime
      );
  
      recentPositions.forEach((pos) => {
        const gridX = Math.floor(pos.x / gridSize) * gridSize;
        const gridY = Math.floor(pos.y / gridSize) * gridSize;
        const key = `${gridX},${gridY}`;
        grid[key] = (grid[key] || 0) + 1;
      });
  
      const maxFreq = Math.max(...Object.values(grid), 1);
  
      return Object.entries(grid).map(([coords, freq]) => {
        const [x, y] = coords.split(',').map(Number);
        return {
          x,
          y,
          frequency: freq / maxFreq,
        };
      });
    };
  
    return (
      <div className="absolute inset-0 pointer-events-none">
        {players.map((player) => {
          const frequencies = getPositionFrequencies(player);
  
          return frequencies.map((pos, index) => (
            <div
              key={`${player.id}-heat-${index}`}
              className="absolute"
              style={{
                left: 0,
                top: 0,
                width: '100%',
                height: '100%',
                // Make the radial gradient smaller (fades out by 15-20%)
                background: `
                  radial-gradient(
                    circle at ${pos.x}% ${pos.y}%,
                    ${getHeatColor(pos.frequency)} 0%,
                    rgba(255, 255, 255, 0) 7%
                  )
                `,
                mixBlendMode: 'hard-light',
              }}
            />
          ));
        })}
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

    const handleSaveFormation = async (formation) => {
        // Simulate a brief delay to show the saving state
        await new Promise(resolve => setTimeout(resolve, 500));
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

    const handleTouchStart = (e) => {
        e.preventDefault();
        if (activeTool === TOOLS.MEASURE) {
            const touch = e.touches[0];
            const position = getMousePosition(touch);
            setCurrentElement({
                type: activeTool,
                start: position,
                end: position
            });
        } else {
            handleMouseDown(e.touches[0]);
        }
    };
    
    const handleTouchMove = (e) => {
        e.preventDefault();
        if (activeTool === TOOLS.MEASURE && currentElement) {
            const touch = e.touches[0];
            const position = getMousePosition(touch);
            setCurrentElement({
                ...currentElement,
                end: position
            });
        } else {
            handleMouseMove(e.touches[0]);
        }
    };
    
    const handleTouchEnd = (e) => {
        e.preventDefault();
        if (activeTool === TOOLS.MEASURE && currentElement) {
            setTacticalElements([...tacticalElements, currentElement]);
            setCurrentElement(null);
        } else {
            handleMouseUp(e);
        }
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

    const handleHeatmapClear = () => {
        // Reset position history for all players
        const updatedPlayers = players.map(player => ({
            ...player,
            positionHistory: []
        }));
        setPlayers(updatedPlayers);
    };
    return (
        <div className="w-full max-w-[1920px] mx-auto p-2 sm:p-4">
            {/* Top Formation Controls - Always Full Width */}
            <div className="max-w-5xl mx-auto grid grid-cols-1 sm:grid-cols-2 gap-">
  <div>
    <FormationSelector
      onFormationSelect={handleFormationSelect}
      currentFormation={currentFormation}
    />
        <SavedFormations
      formations={savedFormations}
      onLoad={setPlayers}
    />
  </div>
  <div>
    <SaveFormation
      players={players}
      onSave={handleSaveFormation}
    />

  </div>
</div>

    {/* Main Content Area with Sidebars */}
    <div className="mt-6 grid grid-cols-1 lg:grid-cols-[280px_1fr_280px] gap-4">
      {/* Left Sidebar - Toolbar */}
      <div className="order-1 lg:order-1">
      <div className="lg:sticky lg:top-4 lg:ml-auto lg:w-[150px]">
      <Toolbar
      activeTool={activeTool}
      onToolSelect={handleToolSelect}
      onUndo={handleUndo}
      onClear={handleClear}
    />
    <div className="mt-2">
      <ActivityGuide />
    </div>
  </div>
</div>
           {/* Center - Football Pitch */}
           <div className="order-1 lg:order-2">
               {/* Your existing pitch div with all its content */}
               <div
                   ref={pitchRef}
                   className={`relative w-full bg-green-600 border-2 border-white rounded-lg shadow-xl select-none ${getCursorStyle(activeTool)}`}
                   style={{
                       paddingTop: '56.25%',
                       userSelect: 'none',
                       WebkitUserSelect: 'none',
                       msUserSelect: 'none',
                       touchAction: 'none'
                   }}
                   onMouseDown={handleMouseDown}
                   onMouseMove={handleMouseMove}
                   onMouseUp={handleMouseUp}
                   onMouseLeave={(e) => {
                       handleMouseUp(e);
                       setDraggedPlayer(null);
                       setCurrentElement(null);
                   }}
   // For TouchStart, add touch-specific drawing initialization:
   onTouchStart={(e) => {
    e.preventDefault();
    const touch = e.touches[0];
    if ([TOOLS.PASS, TOOLS.RUN, TOOLS.ZONE].includes(activeTool)) {
        const position = getMousePosition(touch);
        setCurrentElement({
            type: activeTool,
            start: position,
            end: position
        });
    } else if (activeTool === TOOLS.MEASURE) {
        const position = getMousePosition(touch);
        setCurrentElement({
            type: activeTool,
            start: position,
            end: position
        });
    } else {
        handleMouseDown(touch);
    }
}}
// For TouchMove, add smooth drawing updates:
onTouchMove={(e) => {
    e.preventDefault();
    const touch = e.touches[0];
    if ([TOOLS.PASS, TOOLS.RUN, TOOLS.ZONE, TOOLS.MEASURE].includes(activeTool) && currentElement) {
        const position = getMousePosition(touch);
        setCurrentElement({
            ...currentElement,
            end: position
        });
    } else {
        handleMouseMove(touch);
    }
}}
// For TouchEnd, ensure proper completion of drawings:
onTouchEnd={(e) => {
    e.preventDefault();
    if ([TOOLS.PASS, TOOLS.RUN, TOOLS.ZONE, TOOLS.MEASURE].includes(activeTool) && currentElement) {
        setTacticalElements([...tacticalElements, currentElement]);
        setCurrentElement(null);
    }
    handleMouseUp(e);
    setDraggedPlayer(null);
}}
>
                {/* Pitch Markings */}
                <div className="absolute inset-0">
                    {/* Center Circle */}
<div className="absolute left-1/2 top-1/2 w-[20vmin] h-[20vmin] border-2 border-white rounded-full transform -translate-x-1/2 -translate-y-1/2" />

{/* Left Penalty Area */}
<div className="absolute left-0 top-1/2 h-[30vmin] w-[20vmin] border-2 border-white transform -translate-y-1/2" />
<div className="absolute left-0 top-1/2 h-[15vmin] w-[10vmin] border-2 border-white transform -translate-y-1/2" />

{/* Right Penalty Area */}
<div className="absolute right-0 top-1/2 h-[30vmin] w-[20vmin] border-2 border-white transform -translate-y-1/2" />
<div className="absolute right-0 top-1/2 h-[15vmin] w-[10vmin] border-2 border-white transform -translate-y-1/2" />

{/* Corner Arcs */}
<div className="absolute left-0 top-0 w-[5vmin] h-[5vmin] border-r-2 border-white rounded-br-full" />
<div className="absolute right-0 top-0 w-[5vmin] h-[5vmin] border-l-2 border-white rounded-bl-full" />
<div className="absolute left-0 bottom-0 w-[5vmin] h-[5vmin] border-r-2 border-white rounded-tr-full" />
<div className="absolute right-0 bottom-0 w-[5vmin] h-[5vmin] border-l-2 border-white rounded-tl-full" />
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

                {/* Drawing Indicator */}
                <DrawingIndicator
                    type={currentElement?.type}
                    isDrawing={Boolean(currentElement)}
                />
            </div>

           </div>

           {/* Right Sidebar - Analysis Tools */}
           <div className="order-3">
           <div className="lg:sticky lg:top-4 mr-auto lg:w-[150px]">
           <AnalysisTools 
            players={players} 
            tacticalElements={tacticalElements} 
            onToolSelect={handleToolSelect} 
            TOOLS={TOOLS} 
            activeTool={activeTool} 
            onHeatmapToggle={() => setShowHeatmap(!showHeatmap)} 
            onHeatmapClear={handleHeatmapClear} 
        /> 
    </div> 
           </div>
       </div>

       <div className=" mt-3 max-w-5xl mx-auto bg-gray-900 rounded-xl p-2 sm:p-3 lg:p-4 lg:mt-0">
       <TimelineControl
                    onAddFrame={handleAddFrame}
                    onPlayback={handlePlaybackFrame}
                    currentFrame={currentFrame}
                    frames={frames}
                />
            </div>
        </div>
    );
};

export default FootballPitch