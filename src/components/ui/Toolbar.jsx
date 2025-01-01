import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    ArrowRight,
    ArrowUpRight,
    Square,
    Move,
    RotateCcw,
    Trash2,
    LineChart
} from 'lucide-react';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";

const TOOLS = {
    SELECT: 'select',
    PASS: 'pass',
    RUN: 'run',
    ZONE: 'zone',
    SHAPE: 'shape',
    MEASURE: 'measure'
};

const ToolButton = ({ icon: Icon, label, active, onClick, shortcut }) => (
    <TooltipProvider delayDuration={300}>
        <Tooltip>
            <TooltipTrigger asChild>
                <motion.button
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={onClick}
                    className={`flex-1 lg:w-full p-4 lg:p-4 flex items-center justify-center rounded-lg transition-all relative
                        ${active ? 'bg-blue-500 shadow-lg' : 'bg-gray-700 hover:bg-gray-600'}`}
                >
                    <Icon className="w-4 h-4 lg:w-5 lg:h-5 text-white" />
                    {shortcut && (
                        <span className="absolute bottom-0.5 right-0.5 text-[10px] text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity">
                            {shortcut}
                        </span>
                    )}
                </motion.button>
            </TooltipTrigger>
            <TooltipContent side="bottom" className="bg-gray-800 text-white px-2 py-1 rounded-lg text-xs">
                {label}
            </TooltipContent>
        </Tooltip>
    </TooltipProvider>
);

const Toolbar = ({ activeTool, onToolSelect, onUndo, onClear }) => {
    const tools = [
        {
            icon: Move,
            label: "Select & Move Players",
            type: TOOLS.SELECT,
            shortcut: "V"
        },
        {
            icon: ArrowRight,
            label: "Draw Pass Arrow",
            type: TOOLS.PASS,
            shortcut: "P"
        },
        {
            icon: ArrowUpRight,
            label: "Draw Player Run",
            type: TOOLS.RUN,
            shortcut: "R"
        },
        {
            icon: Square,
            label: "Create Zone/Area",
            type: TOOLS.ZONE,
            shortcut: "Z"
        },
        {
            icon: LineChart,
            label: "Show Team Shape",
            type: TOOLS.SHAPE,
            shortcut: "S"
        }
    ];

    useEffect(() => {
        const handleKeyPress = (e) => {
            if (e.target.tagName === 'INPUT') return;

            const key = e.key.toUpperCase();
            const tool = tools.find(t => t.shortcut === key);
            if (tool) {
                onToolSelect(tool.type);
            }
        };

        window.addEventListener('keypress', handleKeyPress);
        return () => window.removeEventListener('keypress', handleKeyPress);
    }, [onToolSelect, tools]);

    return (
        <div className="bg-gray-800 rounded-xl shadow-lg p-2 lg:p-3">
            <div className="grid grid-cols-7 lg:grid-cols-1 gap-1.5 lg:gap-2">
                {/* Main Tools */}
                {tools.map((tool) => (
                    <ToolButton
                        key={tool.type}
                        icon={tool.icon}
                        label={tool.label}
                        active={activeTool === tool.type}
                        onClick={() => onToolSelect(tool.type)}
                        shortcut={tool.shortcut}
                    />
                ))}
                                {/* Desktop Divider */}
                                <div className="hidden lg:block h-px w-full bg-gray-700 col-span-1" />

                {/* Action Buttons */}
                <ToolButton
                    icon={RotateCcw}
                    label="Undo Last Action"
                    onClick={onUndo}
                    shortcut="⌘Z"
                />
                <ToolButton
                    icon={Trash2}
                    label="Clear All"
                    onClick={onClear}
                    shortcut="⌘⌫"
                />
                

            </div>
        </div>
    );
};

export { Toolbar, ToolButton, TOOLS };