import React, { useEffect, useRef } from 'react';
import { Terminal as XTerm } from 'xterm';
import { FitAddon } from 'xterm-addon-fit';
import 'xterm/css/xterm.css';

interface TerminalProps {
  onReady?: (terminal: XTerm) => void;
  className?: string;
}

export function Terminal({ onReady, className = '' }: TerminalProps) {
  const terminalRef = useRef<HTMLDivElement>(null);
  const xtermRef = useRef<XTerm | null>(null);

  useEffect(() => {
    if (!terminalRef.current) return;

    // Initialize xterm.js
    const terminal = new XTerm({
      cursorBlink: true,
      fontSize: 14,
      fontFamily: 'Menlo, Monaco, "Courier New", monospace',
      theme: {
        background: '#1a1b26',
        foreground: '#a9b1d6',
        cursor: '#c0caf5',
        black: '#414868',
        red: '#f7768e',
        green: '#9ece6a',
        yellow: '#e0af68',
        blue: '#7aa2f7',
        magenta: '#bb9af7',
        cyan: '#7dcfff',
        white: '#c0caf5',
        brightBlack: '#414868',
        brightRed: '#f7768e',
        brightGreen: '#9ece6a',
        brightYellow: '#e0af68',
        brightBlue: '#7aa2f7',
        brightMagenta: '#bb9af7',
        brightCyan: '#7dcfff',
        brightWhite: '#c0caf5'
      }
    });

    // Add the fit addon
    const fitAddon = new FitAddon();
    terminal.loadAddon(fitAddon);

    // Open terminal in the container
    terminal.open(terminalRef.current);
    
    // Initial fit
    try {
      fitAddon.fit();
    } catch (error) {
      console.warn('Error fitting terminal:', error);
    }

    // Store the terminal instance
    xtermRef.current = terminal;

    // Call onReady callback with the terminal instance
    if (onReady) {
      onReady(terminal);
    }

    // Handle window resize
    const handleResize = () => {
      try {
        fitAddon.fit();
      } catch (error) {
        console.warn('Error fitting terminal on resize:', error);
      }
    };
    
    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      terminal.dispose();
    };
  }, [onReady]);

  return (
    <div 
      ref={terminalRef}
      className={`min-h-[300px] bg-gray-900 rounded-lg overflow-hidden ${className}`}
      style={{ padding: '0.5rem' }}
    />
  );
}
