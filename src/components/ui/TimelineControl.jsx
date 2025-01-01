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
    <div className="w-full bg-gray-900 p-1 rounded-lg mt-2">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-white text-lg font-semibold">Timeline Control</h2>
        
        <select
          value={playbackSpeed}
          onChange={(e) => setPlaybackSpeed(Number(e.target.value))}
          className="bg-gray-800 text-white py-1 px-2 rounded text-sm"
          disabled={frames.length === 0}
        >
          <option value={0.5}>0.5x</option>
          <option value={1}>1x</option>
          <option value={2}>2x</option>
        </select>
      </div>

<div className="flex gap-2 mb-3 overflow-x-auto px-2 py-1.5 -mx-2 snap-x snap-mandatory scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800">
    {frames.map((frame, index) => (
        <button
            key={index}
            onClick={() => handleFrameClick(index)}
            className={`flex-shrink-0 w-14 h-14 rounded border snap-start
                ${currentFrame === index ? 'border-blue-500' : 'border-gray-700'}
                bg-gray-800 hover:bg-gray-700 transition-colors touch-manipulation`}
        >
            <div className="text-white text-center mt-2 text-sm">
                {index + 1}
            </div>
        </button>
    ))}
    
    <button
        onClick={() => {
            setIsPlaying(false);
            onAddFrame();
        }}
        className="flex-shrink-0 w-14 h-14 rounded border border-gray-700
                   bg-gray-800 hover:bg-gray-700 transition-colors
                   flex items-center justify-center snap-start touch-manipulation"
    >
        <Plus className="w-6 h-6 text-white" />
    </button>
</div>

      <div className="flex items-center justify-start gap-2">
        <button
          onClick={handleSkipBack}
          className={`p-4 rounded transition-colors ${
            frames.length === 0 
              ? 'bg-gray-800 cursor-not-allowed' 
              : 'bg-gray-800 hover:bg-gray-700'
          }`}
          disabled={frames.length === 0}
        >
          <SkipBack className="w-4 h-4 text-white" />
        </button>
        
        <button
          onClick={handlePlayPause}
          className={`p-4 rounded transition-colors ${
            frames.length === 0 
              ? 'bg-gray-800 cursor-not-allowed' 
              : 'bg-gray-800 hover:bg-gray-700'
          }`}
          disabled={frames.length === 0}
        >
          {isPlaying ? 
            <Pause className="w-4 h-4 text-white" /> : 
            <Play className="w-4 h-4 text-white" />
          }
        </button>
        
        <button
          onClick={handleSkipForward}
          className={`p-4 rounded transition-colors ${
            frames.length === 0 
              ? 'bg-gray-800 cursor-not-allowed' 
              : 'bg-gray-800 hover:bg-gray-700'
          }`}
          disabled={frames.length === 0}
        >
          <SkipForward className="w-4 h-4 text-white" />
        </button>
      </div>
    </div>
  );
};

export default TimelineControl;