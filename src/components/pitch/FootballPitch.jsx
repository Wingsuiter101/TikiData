import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion'
import { FORMATIONS } from '../../data/formations'
import TimelineControl from '../ui/TimelineControl';
import { FormationSelector, SaveFormation, SavedFormations } from "../ui/FormationControl"
import AnalysisTools from '../ui/AnalysisTools';
import { Toolbar, TOOLS } from '../ui/Toolbar';
import ActivityGuide from '../ui/ActivityGuide';
import { ResponsivePitchElements, screenToSvgCoords } from './ResponsivePitchElements';
import Heatmap from './Heatmap';


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

const isDrawingTool = (tool) => {
    return [TOOLS.PASS, TOOLS.RUN, TOOLS.ZONE, TOOLS.MEASURE].includes(tool);
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
                position: 'absolute',
                transform: 'translate(-50%, -50%)',
                userSelect: 'none',
                WebkitUserSelect: 'none',
                msUserSelect: 'none',
                pointerEvents: isSelectable ? 'auto' : 'none',
                touchAction: 'none'
            }}
            animate={{
                left: `${position.x}%`,
                top: `${position.y}%`
            }}
            transition={{
                type: "tween",
                duration: 0.15,
                ease: "circOut"
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

    const handleUpdateFrame = (frameIndex, frameData) => {
        if (frameIndex >= 0 && frameIndex < frames.length) {
            const updatedFrames = [...frames];
            updatedFrames[frameIndex] = {
                players: frameData.players.map(player => ({
                    ...player,
                    position: { ...player.position },
                    positionHistory: [...(player.positionHistory || [])]
                })),
                tacticalElements: frameData.tacticalElements.map(element => ({
                    ...element,
                    start: { ...element.start },
                    end: { ...element.end }
                }))
            };
            setFrames(updatedFrames);
        }
    };

    const handleAddFrame = () => {
        // Create deep copy of current state for new frame
        const newFrame = {
            players: players.map(player => ({
                ...player,
                position: { ...player.position },
                positionHistory: [...(player.positionHistory || [])]
            })),
            tacticalElements: tacticalElements.map(element => ({
                ...element,
                start: { ...element.start },
                end: { ...element.end }
            }))
        };
        setFrames(prevFrames => [...prevFrames, newFrame]);
        setCurrentFrame(frames.length); // Move to the new frame
    };

    const handlePlaybackFrame = (frameIndex) => {
        if (frames[frameIndex]) {
            const frame = frames[frameIndex];
            // Set state with deep copies to prevent reference issues
            setPlayers(frame.players.map(player => ({
                ...player,
                position: { ...player.position },
                positionHistory: [...(player.positionHistory || [])]
            })));
            setTacticalElements(frame.tacticalElements.map(element => ({
                ...element,
                start: { ...element.start },
                end: { ...element.end }
            })));
            setCurrentFrame(frameIndex);
        }
    };

    // Inside FootballPitch component:
    const getPlayerIdAtPosition = useCallback((position) => {
        const threshold = 5;
        const nearbyPlayer = players.find(player => {
            const dx = Math.abs(player.position.x - position.x);
            const dy = Math.abs(player.position.y - position.y);
            return dx < threshold && dy < threshold;
        });
        return nearbyPlayer?.id;
    }, [players]);

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



    const handleDragStart = (id) => {
        if (activeTool === TOOLS.SELECT) {
            setDraggedPlayer(id);
        }
    };

    function handleMouseDown(e) {
        if (![TOOLS.SELECT, TOOLS.SHAPE].includes(activeTool)) {
            const coords = screenToSvgCoords(pitchRef.current, e.clientX, e.clientY);
            setCurrentElement({
                type: activeTool,
                start: coords,
                end: coords,
            });
        }
    }

    const [dragState, setDragState] = useState({
        isDragging: false,
        startX: 0,
        startY: 0
    });

    const handleMouseMove = useCallback((e) => {
        if (draggedPlayer !== null && activeTool === TOOLS.SELECT) {
            e.preventDefault();
            const rect = pitchRef.current.getBoundingClientRect();
    
            // Use higher precision calculations
            const rawX = e.clientX - rect.left;
            const rawY = e.clientY - rect.top;
    
            // Calculate percentage with higher decimal precision
            const x = (rawX / rect.width) * 100;
            const y = (rawY / rect.height) * 100;
    
            const clampedX = Math.min(Math.max(0, x.toFixed(2)), 100);
            const clampedY = Math.min(Math.max(0, y.toFixed(2)), 100);
            
            // Use precise position tracking with timestamps
            const timestamp = performance.now();
    
            requestAnimationFrame(() => {
                setPlayers((prevPlayers) =>
                    prevPlayers.map((player) =>
                        player.id === draggedPlayer
                            ? {
                                ...player,
                                position: {
                                    x: parseFloat(clampedX.toFixed(3)),
                                    y: parseFloat(clampedY.toFixed(3))
                                },
                                positionHistory: [
                                    ...(player.positionHistory || []), // Increase history size for better tracking
                                    {
                                      x: parseFloat(clampedX.toFixed(2)), // Higher precision
                                      y: parseFloat(clampedY.toFixed(2)),
                                      timestamp: performance.now() // Include precise timestamp
                                    }
                                ]
                            }
                            : player
                    )
                );
            });
        }
    
        if (currentElement) {
            const coords = screenToSvgCoords(pitchRef.current, e.clientX, e.clientY);
            requestAnimationFrame(() => {
                setCurrentElement((prev) => ({ ...prev, end: coords }));
            });
        }
    }, [draggedPlayer, activeTool, currentElement]);


    const handleMouseUp = () => {
        if (currentElement) {
            setTacticalElements(prev => [...prev, currentElement]);
            setCurrentElement(null);
        }
        setDraggedPlayer(null);  // Add this line
    };

    const handleMouseLeave = () => {
        if (currentElement) {
            setTacticalElements(prev => [...prev, currentElement]);
            setCurrentElement(null);
        }
        setDraggedPlayer(null);
    };

    const handleTouchStart = (e) => {
        e.preventDefault();
        const touch = e.touches[0];
        const coords = screenToSvgCoords(pitchRef.current, touch.clientX, touch.clientY);

        if (activeTool === TOOLS.SELECT) {
            const playerId = getPlayerIdAtPosition(coords);
            if (playerId) {
                setDraggedPlayer(playerId);
            }
        } else if (isDrawingTool(activeTool)) {
            setCurrentElement({
                type: activeTool,
                start: coords,
                end: coords
            });
        }
    };

    // Enhanced touch handling for mobile devices
    const handleTouchMove = useCallback((e) => {
        e.preventDefault();
        const touch = e.touches[0];
        const rect = pitchRef.current.getBoundingClientRect();

        if (draggedPlayer !== null && activeTool === TOOLS.SELECT) {
            // Use precise touch coordinates
            const rawX = touch.clientX - rect.left;
            const rawY = touch.clientY - rect.top;

            // Calculate percentage with higher precision
            const x = (rawX / rect.width) * 100;
            const y = (rawY / rect.height) * 100;

            // Implement smooth clamping
            const clampedX = Math.min(Math.max(0, x), 100);
            const clampedY = Math.min(Math.max(0, y), 100);

            const timestamp = performance.now();

            requestAnimationFrame(() => {
                setPlayers(prev =>
                    prev.map(player =>
                        player.id === draggedPlayer
                            ? {
                                ...player,
                                position: {
                                    x: parseFloat(clampedX.toFixed(3)),
                                    y: parseFloat(clampedY.toFixed(3))
                                },
                                positionHistory: [
                                    ...(player.positionHistory || []), // Increase history size for better tracking
                                    {
                                      x: parseFloat(clampedX.toFixed(2)), // Higher precision
                                      y: parseFloat(clampedY.toFixed(2)),
                                      timestamp: performance.now() // Include precise timestamp
                                    }
                                ]
                            }
                            : player
                    )
                );
            });
        }

        if (currentElement) {
            const coords = screenToSvgCoords(pitchRef.current, touch.clientX, touch.clientY);
            requestAnimationFrame(() => {
                setCurrentElement(prev => ({ ...prev, end: coords }));
            });
        }
    }, [draggedPlayer, currentElement, activeTool]);

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
            if (activeTool === TOOLS.MEASURE) {
                setTacticalElements(elements =>
                    elements.filter(el => el.type !== 'measure')
                );
            }
        }
        if (tool === TOOLS.HEATMAP) {
            // Toggle heatmap only when HEATMAP tool is selected
            setShowHeatmap((prev) => !prev);
        } else {
            // Preserve heatmap state when selecting other tools
            setActiveTool(tool);
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
        handleHeatmapClear(); // Add this line

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
                        id="football-pitch"
                        ref={pitchRef}
                        className={`relative w-full aspect-video bg-green-600 border-2 border-white rounded-lg shadow-xl select-none ${getCursorStyle(
                            activeTool
                        )}`}
                        style={{
                            userSelect: 'none',
                            WebkitUserSelect: 'none',
                            msUserSelect: 'none',
                            touchAction: 'none'
                        }}
                        onMouseDown={handleMouseDown}
                        onMouseMove={handleMouseMove}
                        onMouseUp={handleMouseUp}
                        onMouseLeave={handleMouseLeave}
                        onTouchStart={handleTouchStart}
                        onTouchMove={handleTouchMove}
                        onTouchEnd={handleTouchEnd}
                    >
                        {/* Pitch Markings */}
                        <div className="absolute inset-0">
                            {/* Halfway Line */}
                            <div className="absolute left-1/2 top-0 bottom-0 w-[2px] bg-white transform -translate-x-1/2" />

                            {/* Center Circle */}
                            <div className="absolute left-1/2 top-1/2 w-[30%] aspect-square border-2 border-white rounded-full transform -translate-x-1/2 -translate-y-1/2" />
                            <div className="absolute left-1/2 top-1/2 w-[1%] aspect-square bg-white rounded-full transform -translate-x-1/2 -translate-y-1/2" />

                            {/* Left Penalty Area */}
                            <div className="absolute left-0 top-1/2 h-[44%] w-[16.5%] border-2 border-white transform -translate-y-1/2" />
                            <div className="absolute left-0 top-1/2 h-[20%] w-[5.5%] border-2 border-white transform -translate-y-1/2" />
                            <div className="absolute left-[11%] top-1/2 w-[1%] aspect-square bg-white rounded-full transform -translate-y-1/2" />

                            {/* Right Penalty Area */}
                            <div className="absolute right-0 top-1/2 h-[44%] w-[16.5%] border-2 border-white transform -translate-y-1/2" />
                            <div className="absolute right-0 top-1/2 h-[20%] w-[5.5%] border-2 border-white transform -translate-y-1/2" />
                            <div className="absolute right-[11%] top-1/2 w-[1%] aspect-square bg-white rounded-full transform -translate-y-1/2" />


                        </div>

{/* Heatmap Layer */}
<Heatmap 
  players={players} 
  pitchWidth={pitchRef.current?.clientWidth || 0}
  pitchHeight={pitchRef.current?.clientHeight || 0}
  show={showHeatmap} 
/>
                        {/* New SVG Elements */}
                        <ResponsivePitchElements
                            elements={tacticalElements}
                            currentElement={currentElement}
                            onElementComplete={(element) => {
                                setCurrentElement(null);
                            }}
                            showTeamShape={showTeamShape}
                            players={players}
                        />

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
                            onHeatmapToggle={() => setShowHeatmap(prevState => !prevState)}
                            onHeatmapClear={handleHeatmapClear}
                            showHeatmap={showHeatmap}
                        />
                    </div>
                </div>
            </div>

            <div className=" mt-3 max-w-5xl mx-auto bg-gray-900 rounded-xl p-2 sm:p-3 lg:p-4 lg:mt-0">
                <TimelineControl
                    onAddFrame={handleAddFrame}
                    onPlayback={handlePlaybackFrame}
                    onUpdateFrame={handleUpdateFrame}
                    currentFrame={currentFrame}
                    frames={frames}
                    players={players}
                    tacticalElements={tacticalElements}
                />
            </div>
        </div>
    );
};

export default FootballPitch