"use client";

import { useEffect, useRef } from 'react';

interface TerminalProps {
  connectionUrl: string;
  onDisconnect?: () => void;
}

const Guacamole = require('guacamole-common-js');

export default function Terminall({ connectionUrl, onDisconnect }: TerminalProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const clientRef = useRef<any>(null);

  useEffect(() => {
    if (!containerRef.current || !connectionUrl) return;

    // Clear any previous content
    containerRef.current.innerHTML = '';

    // Create tunnel using WebSocket
    const tunnel = new Guacamole.WebSocketTunnel(connectionUrl);

    // Create client using tunnel
    const client = new Guacamole.Client(tunnel);
    clientRef.current = client;

    // Add client display to container
    const display = client.getDisplay().getElement();
    containerRef.current.appendChild(display);

    // Connect
    client.connect();

    // Set up event handlers
    const keyboard = new Guacamole.Keyboard(document);
    const mouse = new Guacamole.Mouse(display);

    keyboard.onkeydown = function(keysym : Number) {
      client.sendKeyEvent(1, keysym);
    };

    keyboard.onkeyup = function(keysym : Number) {
      client.sendKeyEvent(0, keysym);
    };

    mouse.onmousedown = mouse.onmouseup = mouse.onmousemove = function(mouseState: any) {
      client.sendMouseState(mouseState);
    };

    // Handle disconnect
    client.onerror = function(error : Error) {
      console.error("Guacamole error:", error);
      if (onDisconnect) onDisconnect();
    };

    client.onstatechange = function(state : Number) {
      if (state === 5) { // Disconnected
        if (onDisconnect) onDisconnect();
      }
    };

    // Clean up on unmount
    return () => {
      keyboard.onkeydown = null;
      keyboard.onkeyup = null;
      mouse.onmousedown = mouse.onmouseup = mouse.onmousemove = null;
      client.disconnect();
    };
  }, [connectionUrl, onDisconnect]);

  return (
    <div 
      ref={containerRef} 
      className="w-full h-full bg-black"
      tabIndex={0}
    />
  );
}
