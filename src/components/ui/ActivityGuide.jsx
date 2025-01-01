import React from 'react';

const ActivityGuide = () => {
    return (
      <div className="bg-gray-800 rounded-lg p-5">
        <div className="flex flex-row lg:flex-col items-start gap-4">
          <div className="flex items-center gap-2">
            <div className="w-4 h-px bg-white"/> 
            <span className="text-xs text-gray-300">Pass</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-px bg-yellow-400"/>
            <span className="text-xs text-gray-300">Run</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 border-2 border-yellow-400 bg-yellow-400/20 rounded"/>
            <span className="text-xs text-gray-300">Zone</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-px bg-gray-400 opacity-40"/>
            <span className="text-xs text-gray-300">Team Shape</span>
          </div>
        </div>
      </div>
    );
};

export default ActivityGuide;