import React, { useState, useEffect, useCallback } from 'react';
import { Play, Pause, SkipBack, SkipForward, Plus } from 'lucide-react';

const TimelineControl = ({ onAddFrame, onPlayback, currentFrame, frames }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);

  const advanceFrame = useCallback(() => {
    const nextFrame = (currentFrame + 1) % frames.length;
    onPlayback(nextFrame);
    
    // Stop playing when we reach the end
    if (nextFrame === 0) {
      setIsPlaying(false);
    }
  }, [currentFrame, frames.length, onPlayback]);

  useEffect(() => {
    let intervalId = null;

    if (isPlaying && frames.length > 0) {
      intervalId = setInterval(advanceFrame, 1000 / playbackSpeed);
    }

    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [isPlaying, playbackSpeed, frames.length, advanceFrame]);

  const handlePlayPause = () => {
    if (frames.length === 0) return;
    setIsPlaying(!isPlaying);
  };

  const handleSkipBack = () => {
    setIsPlaying(false);
    onPlayback(0);
  };

  const handleSkipForward = () => {
    setIsPlaying(false);
    onPlayback(Math.max(0, frames.length - 1));
  };

  const handleFrameClick = (index) => {
    setIsPlaying(false);
    onPlayback(index);
  };

  return (
    <div className="w-full bg-gray-800 p-4 rounded-lg mt-4">
      {/* Timeline frames */}
      <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
        {frames.map((frame, index) => (
          <button
            key={index}
            onClick={() => handleFrameClick(index)}
            className={`flex-shrink-0 w-16 h-16 rounded border-2 
              ${currentFrame === index ? 'border-blue-500' : 'border-gray-600'}
              bg-gray-700 hover:bg-gray-600 transition-colors`}
          >
            <div className="text-white text-center mt-2">
              {index + 1}
            </div>
          </button>
        ))}
        
        <button
          onClick={() => {
            setIsPlaying(false);
            onAddFrame();
          }}
          className="flex-shrink-0 w-16 h-16 rounded border-2 border-gray-600
                     bg-gray-700 hover:bg-gray-600 transition-colors
                     flex items-center justify-center"
        >
          <Plus className="w-6 h-6 text-white" />
        </button>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          <button
            onClick={handleSkipBack}
            className={`p-2 rounded transition-colors ${
              frames.length === 0 
                ? 'bg-gray-600 cursor-not-allowed' 
                : 'bg-gray-700 hover:bg-gray-600'
            }`}
            disabled={frames.length === 0}
          >
            <SkipBack className="w-5 h-5 text-white" />
          </button>
          
          <button
            onClick={handlePlayPause}
            className={`p-2 rounded transition-colors ${
              frames.length === 0 
                ? 'bg-gray-600 cursor-not-allowed' 
                : 'bg-gray-700 hover:bg-gray-600'
            }`}
            disabled={frames.length === 0}
          >
            {isPlaying ? 
              <Pause className="w-5 h-5 text-white" /> : 
              <Play className="w-5 h-5 text-white" />
            }
          </button>
          
          <button
            onClick={handleSkipForward}
            className={`p-2 rounded transition-colors ${
              frames.length === 0 
                ? 'bg-gray-600 cursor-not-allowed' 
                : 'bg-gray-700 hover:bg-gray-600'
            }`}
            disabled={frames.length === 0}
          >
            <SkipForward className="w-5 h-5 text-white" />
          </button>
        </div>

        {/* Playback speed control */}
        <select
          value={playbackSpeed}
          onChange={(e) => setPlaybackSpeed(Number(e.target.value))}
          className="bg-gray-700 text-white p-2 rounded"
          disabled={frames.length === 0}
        >
          <option value={0.5}>0.5x</option>
          <option value={1}>1x</option>
          <option value={2}>2x</option>
        </select>
      </div>
    </div>
  );
};

export default TimelineControl;