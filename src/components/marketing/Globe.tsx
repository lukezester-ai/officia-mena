'use client';
import React, { useEffect, useRef } from 'react';
import createGlobe from 'cobe';

export function Globe() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    let phi = 0;
    if (!canvasRef.current) return;
    
    // We use a fixed large resolution (1000x1000) and scale it down with CSS.
    // This avoids race conditions with offsetWidth being 0 on initial mount.
    const size = 1000;
    
    const globe = createGlobe(canvasRef.current, {
      devicePixelRatio: 2,
      width: size,
      height: size,
      phi: 0,
      theta: 0.3,
      dark: 1,
      diffuse: 1.2,
      mapSamples: 16000,
      mapBrightness: 6,
      baseColor: [0.1, 0.1, 0.1],
      markerColor: [0.96, 0.77, 0.09], // Gold for MENA
      glowColor: [0.06, 0.72, 0.5], // Emerald glow
      markers: [
        // Riyadh
        { location: [24.7136, 46.6753], size: 0.1 },
        // Dubai
        { location: [25.2048, 55.2708], size: 0.08 },
        // Doha
        { location: [25.2854, 51.5310], size: 0.07 },
      ],
      // @ts-expect-error - onRender is missing in typings
      onRender: (state: Record<string, unknown>) => {
        state.phi = phi;
        phi += 0.005;
      },
    });

    return () => {
      globe.destroy();
    };
  }, []);

  return (
    <div className="relative w-full max-w-[500px] aspect-square mx-auto flex items-center justify-center">
      <canvas
        ref={canvasRef}
        style={{ 
          width: '100%', 
          height: '100%', 
          contain: 'layout paint size', 
          opacity: 1 
        }}
      />
    </div>
  );
}
