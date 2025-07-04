'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Terminal as XTerm } from 'xterm';
import { FitAddon } from 'xterm-addon-fit';
import { WebLinksAddon } from 'xterm-addon-web-links';
import { SearchAddon } from 'xterm-addon-search';
import { WebglAddon } from 'xterm-addon-webgl';
import { CanvasAddon } from 'xterm-addon-canvas';
import { AttachAddon } from 'xterm-addon-attach';
import { io, Socket } from 'socket.io-client';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  PlayIcon, 
  StopIcon, 
  CogIcon, 
  CommandLineIcon,
  DocumentDuplicateIcon,
  MagnifyingGlassIcon,
  EyeIcon,
  EyeSlashIcon
} from '@heroicons/react/24/outline';

import 'xterm/css/xterm.css';

interface TerminalProps {
  sandboxId: string;
  onOutput?: (data: string) => void;
  onStateChange?: (state: TerminalState) => void;
  className?: string;
  theme?: TerminalTheme;
  readOnly?: boolean;
  splitView?: boolean;
}

interface TerminalState {
  connected: boolean;
  running: boolean;
  pid?: number;
  cwd: string;
  lastActivity: Date;
}

interface TerminalTheme {
  background: string;
  foreground: string;
  cursor: string;
  selection: string;
  black: string;
  red: string;
  green: string;
  yellow: string;
  blue: string;
  magenta: string;
  cyan: string;
  white: string;
  brightBlack: string;
  brightRed: string;
  brightGreen: string;
  brightYellow: string;
  brightBlue: string;
  brightMagenta: string;
  brightCyan: string;
  brightWhite: string;
}

const DEFAULT_THEME: TerminalTheme = {
  background: '#1a1b26',
  foreground: '#c0caf5',
  cursor: '#c0caf5',
  selection: '#33467c',
  black: '#15161e',
  red: '#f7768e',
  green: '#9ece6a',
  yellow: '#e0af68',
  blue: '#7aa2f7',
  magenta: '#bb9af7',
  cyan: '#7dcfff',
  white: '#a9b1d6',
  brightBlack: '#414868',
  brightRed: '#f7768e',
  brightGreen: '#9ece6a',
  brightYellow: '#e0af68',
  brightBlue: '#7aa2f7',
  brightMagenta: '#bb9af7',
  brightCyan: '#7dcfff',
  brightWhite: '#c0caf5',
};

const TERMINAL_THEMES = {
  'tokyo-night': DEFAULT_THEME,
  'dracula': {
    background: '#282a36',
    foreground: '#f8f8f2',
    cursor: '#f8f8f2',
    selection: '#44475a',
    black: '#000000',
    red: '#ff5555',
    green: '#50fa7b',
    yellow: '#f1fa8c',
    blue: '#bd93f9',
    magenta: '#ff79c6',
    cyan: '#8be9fd',
    white: '#bfbfbf',
    brightBlack: '#4d4d4d',
    brightRed: '#ff6e67',
    brightGreen: '#5af78e',
    brightYellow: '#f4f99d',
    brightBlue: '#caa9fa',
    brightMagenta: '#ff92d0',
    brightCyan: '#9aedfe',
    brightWhite: '#e6e6e6',
  },
  'monokai': {
    background: '#272822',
    foreground: '#f8f8f2',
    cursor: '#f8f8f0',
    selection: '#49483e',
    black: '#272822',
    red: '#f92672',
    green: '#a6e22e',
    yellow: '#f4bf75',
    blue: '#66d9ef',
    magenta: '#ae81ff',
    cyan: '#a1efe4',
    white: '#f8f8f2',
    brightBlack: '#75715e',
    brightRed: '#f92672',
    brightGreen: '#a6e22e',
    brightYellow: '#f4bf75',
    brightBlue: '#66d9ef',
    brightMagenta: '#ae81ff',
    brightCyan: '#a1efe4',
    brightWhite: '#f9f8f5',
  }
};

export default function Terminal({
  sandboxId,
  onOutput,
  onStateChange,
  className = '',
  theme = DEFAULT_THEME,
  readOnly = false,
  splitView = false
}: TerminalProps) {
  const terminalRef = useRef<HTMLDivElement>(null);
  const xtermRef = useRef<XTerm | null>(null);
  const socketRef = useRef<Socket | null>(null);
  const fitAddonRef = useRef<FitAddon | null>(null);
  const searchAddonRef = useRef<SearchAddon | null>(null);
  
  const [state, setState] = useState<TerminalState>({
    connected: false,
    running: false,
    cwd: '/home/user',
    lastActivity: new Date()
  });
  
  const [showControls, setShowControls] = useState(false);
  const [currentTheme, setCurrentTheme] = useState<keyof typeof TERMINAL_THEMES>('tokyo-night');
  const [searchVisible, setSearchVisible] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Initialize terminal
  const initializeTerminal = useCallback(() => {
    if (!terminalRef.current) return;
    
    const terminal = new XTerm({
      theme: theme,
      fontFamily: '"JetBrains Mono", "Fira Code", Consolas, monospace',
      fontSize: 14,
      lineHeight: 1.2,
      letterSpacing: 0,
      cursorBlink: true,
      cursorStyle: 'block',
      allowTransparency: true,
      macOptionIsMeta: true,
      rightClickSelectsWord: true,
      experimentalCharAtlas: 'dynamic',
      scrollback: 10000,
      bellStyle: 'sound',
      disableStdin: readOnly,
    });
    
    // Add addons
    const fitAddon = new FitAddon();
    const webLinksAddon = new WebLinksAddon();
    const searchAddon = new SearchAddon();
    
    terminal.loadAddon(fitAddon);
    terminal.loadAddon(webLinksAddon);
    terminal.loadAddon(searchAddon);
    
    // Try WebGL first, fallback to Canvas
    try {
      const webglAddon = new WebglAddon();
      terminal.loadAddon(webglAddon);
    } catch (e) {
      console.warn('WebGL not supported, falling back to Canvas renderer');
      const canvasAddon = new CanvasAddon();
      terminal.loadAddon(canvasAddon);
    }
    
    terminal.open(terminalRef.current);
    fitAddon.fit();
    
    // Store references
    xtermRef.current = terminal;
    fitAddonRef.current = fitAddon;
    searchAddonRef.current = searchAddon;
    
    // Handle data input from user
    terminal.onData((data) => {
      if (socketRef.current && !readOnly) {
        socketRef.current.emit('terminal:input', {
          sandbox_id: sandboxId,
          data: data
        });
      }
    });
    
    // Handle resize
    terminal.onResize(({ cols, rows }) => {
      if (socketRef.current) {
        socketRef.current.emit('terminal:resize', {
          sandbox_id: sandboxId,
          cols,
          rows
        });
      }
    });
    
    // Window resize handler
    const handleResize = () => {
      if (fitAddonRef.current) {
        fitAddonRef.current.fit();
      }
    };
    
    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
      terminal.dispose();
    };
  }, [sandboxId, theme, readOnly]);
  
  // Initialize WebSocket connection
  const initializeSocket = useCallback(() => {
    const token = localStorage.getItem('authToken');
    if (!token) return;
    
    const socket = io(process.env.NEXT_PUBLIC_WS_URL!, {
      auth: { token },
      transports: ['websocket']
    });
    
    socket.on('connect', () => {
      setState(prev => ({ ...prev, connected: true }));
      
      // Join terminal session
      socket.emit('terminal:join', {
        sandbox_id: sandboxId
      });
    });
    
    socket.on('disconnect', () => {
      setState(prev => ({ ...prev, connected: false }));
    });
    
    // Handle terminal output
    socket.on('terminal:output', (data: { output: string }) => {
      if (xtermRef.current) {
        xtermRef.current.write(data.output);
        onOutput?.(data.output);
        setState(prev => ({ ...prev, lastActivity: new Date() }));
      }
    });
    
    // Handle terminal state changes
    socket.on('terminal:state', (terminalState: Partial<TerminalState>) => {
      setState(prev => {
        const newState = { ...prev, ...terminalState };
        onStateChange?.(newState);
        return newState;
      });
    });
    
    // Handle errors
    socket.on('terminal:error', (error: { message: string }) => {
      if (xtermRef.current) {
        xtermRef.current.write(`\r\n\x1b[31mError: ${error.message}\x1b[0m\r\n`);
      }
    });
    
    socketRef.current = socket;
    
    return () => {
      socket.disconnect();
    };
  }, [sandboxId, onOutput, onStateChange]);
  
  // Initialize terminal and socket
  useEffect(() => {
    const terminalCleanup = initializeTerminal();
    const socketCleanup = initializeSocket();
    
    return () => {
      terminalCleanup?.();
      socketCleanup?.();
    };
  }, [initializeTerminal, initializeSocket]);
  
  // Handle search
  const handleSearch = useCallback((term: string, direction: 'next' | 'prev' = 'next') => {
    if (searchAddonRef.current && term) {
      if (direction === 'next') {
        searchAddonRef.current.findNext(term);
      } else {
        searchAddonRef.current.findPrevious(term);
      }
    }
  }, []);
  
  // Clear terminal
  const clearTerminal = useCallback(() => {
    if (xtermRef.current) {
      xtermRef.current.clear();
    }
  }, []);
  
  // Copy selection
  const copySelection = useCallback(() => {
    if (xtermRef.current) {
      const selection = xtermRef.current.getSelection();
      if (selection) {
        navigator.clipboard.writeText(selection);
      }
    }
  }, []);
  
  // Paste from clipboard
  const pasteFromClipboard = useCallback(async () => {
    if (xtermRef.current && !readOnly) {
      try {
        const text = await navigator.clipboard.readText();
        xtermRef.current.paste(text);
      } catch (err) {
        console.error('Failed to paste:', err);
      }
    }
  }, [readOnly]);
  
  // Change theme
  const changeTheme = useCallback((themeName: keyof typeof TERMINAL_THEMES) => {
    if (xtermRef.current) {
      xtermRef.current.options.theme = TERMINAL_THEMES[themeName];
      setCurrentTheme(themeName);
    }
  }, []);
  
  return (
    <div className={`relative bg-gray-900 rounded-lg overflow-hidden ${className}`}>
      {/* Terminal Controls */}
      <AnimatePresence>
        {showControls && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-2 right-2 z-10 bg-gray-800 rounded-lg p-2 shadow-lg"
          >
            <div className="flex items-center space-x-2">
              {/* Theme Selector */}
              <select
                value={currentTheme}
                onChange={(e) => changeTheme(e.target.value as keyof typeof TERMINAL_THEMES)}
                className="bg-gray-700 text-white text-xs rounded px-2 py-1"
              >
                {Object.keys(TERMINAL_THEMES).map(theme => (
                  <option key={theme} value={theme}>
                    {theme.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </option>
                ))}
              </select>
              
              {/* Controls */}
              <button
                onClick={() => setSearchVisible(!searchVisible)}
                className="p-1 text-gray-300 hover:text-white"
                title="Search"
              >
                <MagnifyingGlassIcon className="w-4 h-4" />
              </button>
              
              <button
                onClick={copySelection}
                className="p-1 text-gray-300 hover:text-white"
                title="Copy Selection"
              >
                <DocumentDuplicateIcon className="w-4 h-4" />
              </button>
              
              <button
                onClick={clearTerminal}
                className="p-1 text-gray-300 hover:text-white"
                title="Clear Terminal"
              >
                <CommandLineIcon className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Search Bar */}
      <AnimatePresence>
        {searchVisible && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-2 left-2 z-10 bg-gray-800 rounded-lg p-2 shadow-lg"
          >
            <div className="flex items-center space-x-2">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleSearch(searchTerm, e.shiftKey ? 'prev' : 'next');
                  } else if (e.key === 'Escape') {
                    setSearchVisible(false);
                  }
                }}
                placeholder="Search..."
                className="bg-gray-700 text-white text-xs rounded px-2 py-1 w-32"
                autoFocus
              />
              <button
                onClick={() => handleSearch(searchTerm, 'next')}
                className="p-1 text-gray-300 hover:text-white text-xs"
              >
                ↓
              </button>
              <button
                onClick={() => handleSearch(searchTerm, 'prev')}
                className="p-1 text-gray-300 hover:text-white text-xs"
              >
                ↑
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Status Bar */}
      <div className="absolute top-0 left-0 right-0 bg-gray-800 px-3 py-1 flex items-center justify-between text-xs text-gray-300">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <div className={`w-2 h-2 rounded-full ${state.connected ? 'bg-green-400' : 'bg-red-400'}`} />
            <span>{state.connected ? 'Connected' : 'Disconnected'}</span>
          </div>
          
          <div className="flex items-center space-x-2">
            {state.running ? (
              <PlayIcon className="w-3 h-3 text-green-400" />
            ) : (
              <StopIcon className="w-3 h-3 text-gray-400" />
            )}
            <span>{state.running ? 'Running' : 'Stopped'}</span>
          </div>
          
          <span className="text-gray-400">
            {state.cwd}
          </span>
          
          {state.pid && (
            <span className="text-gray-400">
              PID: {state.pid}
            </span>
          )}
        </div>
        
        <div className="flex items-center space-x-2">
          {readOnly && (
            <div className="flex items-center space-x-1">
              <EyeIcon className="w-3 h-3" />
              <span>Read Only</span>
            </div>
          )}
          
          <button
            onClick={() => setShowControls(!showControls)}
            className="p-1 hover:bg-gray-700 rounded"
          >
            <CogIcon className="w-3 h-3" />
          </button>
        </div>
      </div>
      
      {/* Terminal Container */}
      <div 
        ref={terminalRef}
        className="w-full h-full pt-8"
        style={{ minHeight: '400px' }}
        onContextMenu={(e) => {
          e.preventDefault();
          // Custom context menu could be added here
        }}
      />
      
      {/* Connection Status Overlay */}
      {!state.connected && (
        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-gray-800 rounded-lg p-4 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400 mx-auto mb-2"></div>
            <div className="text-white text-sm">Connecting to terminal...</div>
          </div>
        </div>
      )}
    </div>
  );
}