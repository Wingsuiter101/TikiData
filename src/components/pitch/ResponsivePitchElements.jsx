import React, { useRef, useState, useCallback, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import _ from 'lodash';

const ARROW_STYLES = {
    pass: {
      stroke: 'rgba(255, 255, 255, 1)',
      strokeDasharray: '1,0.2',
      strokeWidth: 0.3
    },
    run: {
      stroke: 'rgba(255, 255, 0, 1)',
      strokeDasharray: 'none',
      strokeWidth: 0.4
    }
  };
  
  const screenToSvgCoords = (svgElement, clientX, clientY) => {
    if (!svgElement) return { x: 0, y: 0 };
    
    const rect = svgElement.getBoundingClientRect();
    const viewBoxWidth = 100;
    const viewBoxHeight = 56.25; // 16:9 aspect ratio
    
    // Calculate the scaling factors for the container
    const containerAspectRatio = rect.width / rect.height;
    const viewBoxAspectRatio = viewBoxWidth / viewBoxHeight;
    
    let x, y;
    
    if (containerAspectRatio > viewBoxAspectRatio) {
      // Container is wider than viewBox
      const effectiveWidth = rect.height * viewBoxAspectRatio;
      const xOffset = (rect.width - effectiveWidth) / 2;
      x = ((clientX - rect.left - xOffset) / effectiveWidth) * viewBoxWidth;
      y = ((clientY - rect.top) / rect.height) * viewBoxHeight;
    } else {
      // Container is taller than viewBox
      const effectiveHeight = rect.width / viewBoxAspectRatio;
      const yOffset = (rect.height - effectiveHeight) / 2;
      x = ((clientX - rect.left) / rect.width) * viewBoxWidth;
      y = ((clientY - rect.top - yOffset) / effectiveHeight) * viewBoxHeight;
    }
    
    return {
      x: Math.max(0, Math.min(viewBoxWidth, x)),
      y: Math.max(0, Math.min(viewBoxHeight, y))
    };
  };
  
// Enhanced SVG Arrow Component with glow effect
const SvgArrow = ({ start, end, type = 'pass' }) => {
    const style = ARROW_STYLES[type];
    const id = `arrow-${Math.random()}`; // Unique ID for marker
    // Calculate angle
    const dx = end.x - start.x;
    const dy = end.y - start.y;
    const angle = Math.atan2(dy, dx);
  
    return (
      <>
        <defs>
          <marker
            id={id}
            viewBox="0 0 8 8"
            refX="5"
            refY="4"
            markerWidth="4"
            markerHeight="4"
            orient="auto-start-reverse"
          >
            <path 
              d="M 0 0 L 8 4 L 0 8 L 2.5 4 Z" 
              fill={style.stroke}
            />
          </marker>
        </defs>
        
        {/* Arrow line */}
        <line
          x1={start.x}
          y1={start.y}
          x2={end.x}
          y2={end.y}
          stroke={style.stroke}
          strokeWidth={style.strokeWidth}
          strokeDasharray={style.strokeDasharray}
          markerEnd={`url(#${id})`}
        />
      </>
    );
  };

  const SvgZone = ({ start, end }) => {
    // Calculate the rectangle's position and size
    const x = Math.floor(Math.min(start.x, end.x)); // Align to nearest pixel
    const y = Math.floor(Math.min(start.y, end.y)); // Align to nearest pixel
    const width = Math.ceil(Math.abs(end.x - start.x)); // Ensure integer size
    const height = Math.ceil(Math.abs(end.y - start.y)); // Ensure integer size
  
    return (
      <rect
        x={x}
        y={y}
        width={width}
        height={height}
        fill="rgba(255, 255, 0, 0.2)"
        stroke="rgba(255, 255, 0, 0.8)" // Slightly higher opacity for better visibility
        strokeWidth="1"
        vectorEffect="non-scaling-stroke" // Ensures stroke remains consistent
      />
    );
  };
  
const SvgMeasurement = ({ start, end }) => {
  const dx = end.x - start.x;
  const dy = end.y - start.y;
  const distance = Math.sqrt(dx * dx + dy * dy).toFixed(1);
  const midPoint = {
    x: start.x + dx / 2,
    y: start.y + dy / 2,
  };

  // Calculate angle for text rotation
  const angle = Math.atan2(dy, dx) * (180 / Math.PI);
  const textRotation = angle > 90 || angle < -90 ? angle + 180 : angle;

  // Dynamic font size based on distance
  const baseFontSize = 3.5;
  const minFontSize = 2.5;
  const maxFontSize = 4;
  const dynamicFontSize = Math.max(
    minFontSize,
    Math.min(maxFontSize, baseFontSize - distance / 100)
  );

  return (
    <g>
      {/* Measurement line */}
      <line
        x1={start.x}
        y1={start.y}
        x2={end.x}
        y2={end.y}
        stroke="#333"
        strokeWidth="1"
        strokeLinecap="round"
      />

      {/* Label Background */}
      <g
        transform={`translate(${midPoint.x}, ${midPoint.y}) rotate(${textRotation})`}
      >
        <rect
          x="-10"
          y="-5"
          width="20"
          height="10"
          rx="5"
          ry="5"
          fill="rgba(255, 255, 255, 0.8)"
          stroke="#ddd"
          strokeWidth="0.5"
        />

        {/* Distance Text */}
        <text
          x="0"
          y="0"
          textAnchor="middle"
          dominantBaseline="middle"
          fill="#333"
          style={{
            fontSize: `${dynamicFontSize}px`,
            fontFamily: 'Arial, sans-serif',
            fontWeight: '500',
          }}
        >
          {distance}m
        </text>
      </g>
    </g>
  );
};



const ResponsivePitchElements = ({ 
    elements = [], 
    currentElement = null,
    onElementComplete = () => {},
    showTeamShape = false,
    showHeatmap = false,
    players = [] 
  }) => {
    const svgRef = useRef(null);
  
    // Team Shape Lines with normalized coordinates
    const TeamShape = () => {
      if (!showTeamShape) return null;
  
      // Normalize player positions to match SVG viewport coordinates
      const normalizePlayerPosition = (position) => ({
        x: position.x, // x is already in correct scale (0-100)
        y: (position.y / 100) * 56.25 // Convert y from percentage to viewport scale
      });
  
      const lines = [
        players.filter(p => p.position.y > 65),  // Top third
        players.filter(p => p.position.y <= 65 && p.position.y > 35),  // Middle third
        players.filter(p => p.position.y <= 35)  // Bottom third
      ];
  
      return (
        <>
          {lines.map((line, lineIndex) => {
            if (line.length < 2) return null;
            const sortedPlayers = [...line].sort((a, b) => a.position.x - b.position.x);
  
            return sortedPlayers.slice(1).map((player, idx) => {
              const startPos = normalizePlayerPosition(sortedPlayers[idx].position);
              const endPos = normalizePlayerPosition(player.position);
              
              return (
                <motion.line
                  key={`shape-${lineIndex}-${idx}`}
                  x1={startPos.x}
                  y1={startPos.y}
                  x2={endPos.x}
                  y2={endPos.y}
                  stroke="white"
                  strokeOpacity="0.25"
                  strokeWidth="0.5"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                />
              );
            });
          })}
        </>
      );
    };
  
    return (
      <svg
        ref={svgRef}
        className="absolute inset-0 w-full h-full pointer-events-none"
        viewBox="0 0 100 56.25"
        preserveAspectRatio="xMidYMid slice"
      >
        {/* Existing element rendering */}
        <AnimatePresence onExitComplete={() => onElementComplete(currentElement)}>
          {elements.map((element, index) => (
            <motion.g
              key={`element-${index}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              {element.type === 'zone' && <SvgZone {...element} />}
              {element.type === 'measure' && <SvgMeasurement {...element} />}
              {(element.type === 'pass' || element.type === 'run') && (
                <SvgArrow {...element} type={element.type} />
              )}
            </motion.g>
          ))}
        </AnimatePresence>
  
        {/* Current element being drawn */}
        {currentElement && (
          <>
            {currentElement.type === 'zone' && <SvgZone {...currentElement} />}
            {currentElement.type === 'measure' && <SvgMeasurement {...currentElement} />}
            {(currentElement.type === 'pass' || currentElement.type === 'run') && (
              <SvgArrow {...currentElement} type={currentElement.type} />
            )}
          </>
        )}
  
        {/* Team shape overlay with normalized coordinates */}
        <TeamShape />
  
      </svg>
    );
  };
  
  export { ResponsivePitchElements, screenToSvgCoords };