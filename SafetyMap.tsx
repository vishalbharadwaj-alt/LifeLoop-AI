
import React, { useState, useEffect, useRef } from 'react';
import { CAMPUS_PINS, CAMPUS_PATHS } from '../constants';
import { SafetyPin, Severity, CampusPath } from '../types';

declare const L: any;

const SafetyMap: React.FC = () => {
  const [selectedPin, setSelectedPin] = useState<SafetyPin | null>(null);
  const [selectedPath, setSelectedPath] = useState<CampusPath | null>(null);
  const [activeRoute, setActiveRoute] = useState<[number, number][] | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const routeLayerRef = useRef<any>(null);

  const getSeverityColor = (severity: Severity) => {
    switch (severity) {
      case 'Danger': return '#ef4444';
      case 'Warning': return '#f59e0b';
      case 'Safe': return '#10b981';
      default: return '#6366f1';
    }
  };

  const getPathColor = (risk: 'Low' | 'Moderate' | 'High') => {
    switch (risk) {
      case 'High': return '#ef4444';
      case 'Moderate': return '#f59e0b';
      case 'Low': return '#10b981';
      default: return '#6366f1';
    }
  };

  // Basic "Route Finder" logic using existing path segments
  const findRouteFromGate = (destCoord: { x: number, y: number }) => {
    const gateCoord = { x: 92.0310, y: 26.4305 };
    
    // Logic: Every path eventually links back to p1 (Main Entry)
    const gateToSports = [26.4305, 92.0310];
    const sports = [26.4325, 92.0335];
    const cafe = [26.4350, 92.0330];
    const science = [26.4355, 92.0345];
    const tech = [26.4345, 92.0360];
    const highway = [26.4361, 92.0347];
    const hostel = [26.4380, 92.0360];
    const forest = [26.4375, 92.0385];

    if (!selectedPin) return null;

    switch(selectedPin.id) {
      case '4': // Gate
        return [[gateToSports[0], gateToSports[1]]];
      case '7': // Sports
        return [gateToSports, sports];
      case '3': // Cafe
        return [gateToSports, sports, cafe];
      case '5': // Science
        return [gateToSports, sports, cafe, science];
      case '1': // Highway
        return [gateToSports, sports, cafe, science, highway];
      case '8': // Tech
        return [gateToSports, sports, cafe, science, tech];
      case '2': // Hostel
        return [gateToSports, sports, cafe, science, tech, hostel];
      case '6': // Forest
        return [gateToSports, sports, cafe, science, tech, hostel, forest];
      default:
        return null;
    }
  };

  useEffect(() => {
    if (selectedPin) {
      const route = findRouteFromGate(selectedPin.coordinates);
      setActiveRoute(route as [number, number][]);
    } else {
      setActiveRoute(null);
    }
  }, [selectedPin]);

  useEffect(() => {
    if (!mapRef.current || !L) return;

    if (routeLayerRef.current) {
      mapRef.current.removeLayer(routeLayerRef.current);
      routeLayerRef.current = null;
    }

    if (activeRoute && activeRoute.length > 0) {
      const accentRGB = getComputedStyle(document.documentElement).getPropertyValue('--accent').trim() || '79, 70, 229';
      routeLayerRef.current = L.polyline(activeRoute, {
        color: `rgb(${accentRGB})`,
        weight: 8,
        opacity: 0.9,
        lineJoin: 'round',
        className: 'active-nav-route'
      }).addTo(mapRef.current);
    }
  }, [activeRoute]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (!mapContainerRef.current || mapRef.current || typeof L === 'undefined') return;

      const center: [number, number] = [26.4361, 92.0347];
      
      mapRef.current = L.map(mapContainerRef.current, {
        zoomControl: false,
        attributionControl: false,
        maxBounds: [[26.42, 92.02], [26.45, 92.05]]
      }).setView(center, 17);

      L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
        maxZoom: 19,
        attribution: 'Esri'
      }).addTo(mapRef.current);

      L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}', {
        maxZoom: 19,
        opacity: 0.5
      }).addTo(mapRef.current);

      // Render Pins
      CAMPUS_PINS.forEach(pin => {
        const color = getSeverityColor(pin.severity);
        const customIcon = L.divIcon({
          className: 'custom-icon',
          html: `
            <div class="marker-wrapper">
              <div class="marker-pulse" style="background-color: ${color}"></div>
              <div class="marker-pin" style="background-color: ${color}; border-color: white;"></div>
            </div>
          `,
          iconSize: [30, 30],
          iconAnchor: [15, 15]
        });

        const marker = L.marker([pin.coordinates.y, pin.coordinates.x], { icon: customIcon }).addTo(mapRef.current);
        marker.on('click', () => {
          setSelectedPath(null);
          setSelectedPin(pin);
          mapRef.current.flyTo([pin.coordinates.y, pin.coordinates.x], 18, { duration: 1.5 });
        });
      });

      // Render Static Pathways
      CAMPUS_PATHS.forEach(path => {
        const color = getPathColor(path.riskLevel);
        const polyline = L.polyline(path.points, {
          color: color,
          weight: 4,
          opacity: 0.4,
          dashArray: '5, 10',
          lineJoin: 'round',
          className: 'base-path-element'
        }).addTo(mapRef.current);

        polyline.on('click', (e: any) => {
          L.DomEvent.stopPropagation(e);
          setSelectedPin(null);
          setSelectedPath(path);
          mapRef.current.flyTo(e.latlng, 18, { duration: 1.2 });
        });
      });

    }, 150);

    return () => {
      clearTimeout(timer);
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  return (
    <div className="flex flex-col gap-5 animate-in fade-in duration-700">
      <div className="relative h-[calc(100vh-320px)] rounded-[2.5rem] overflow-hidden border border-white/5 shadow-2xl bg-slate-950">
        <div ref={mapContainerRef} className="absolute inset-0 z-0" />

        <div className="absolute top-6 left-6 z-10 pointer-events-none flex flex-col gap-2">
          <div className="bg-black/60 backdrop-blur-xl px-4 py-2 rounded-2xl border border-white/10 flex items-center gap-3 shadow-2xl">
            <div className={`w-2 h-2 rounded-full ${activeRoute ? 'bg-emerald-400 animate-pulse' : 'bg-indigo-400'}`} />
            <span className="text-[10px] font-bold uppercase tracking-widest text-white">
              {activeRoute ? 'Navigation Active' : 'Live Campus Map'}
            </span>
          </div>
        </div>

        {selectedPin && (
          <div className="absolute bottom-6 left-6 right-6 bg-slate-900/95 backdrop-blur-2xl p-6 rounded-[2.5rem] border border-white/10 shadow-2xl z-30 animate-in slide-in-from-bottom-10 duration-500 max-h-[60%] overflow-y-auto no-scrollbar">
            <div className="flex justify-between items-start mb-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className={`text-[8px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest text-white`} style={{ backgroundColor: getSeverityColor(selectedPin.severity) }}>
                    {selectedPin.severity}
                  </span>
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{selectedPin.riskType}</span>
                </div>
                <h3 className="text-xl font-black text-white leading-tight">{selectedPin.name}</h3>
              </div>
              <button onClick={() => setSelectedPin(null)} className="p-2 bg-white/10 rounded-full hover:bg-white/20 transition-all text-white">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            
            <div className="bg-white/5 p-4 rounded-2xl border border-white/10 mb-4">
               <p className="text-[8px] font-black text-emerald-400 uppercase tracking-widest mb-1">Navigation Route</p>
               <p className="text-xs font-bold text-white leading-relaxed">Route from Main Entrance Gate calculated and highlighted in blue.</p>
            </div>

            <p className="text-sm text-slate-300 mb-5 leading-relaxed">{selectedPin.description}</p>
            <div className="flex gap-3">
              <a href={`tel:${selectedPin.contact}`} className="flex-1 py-4 bg-red-600 rounded-2xl text-center text-xs font-black text-white uppercase tracking-widest shadow-xl active:scale-95 transition-all">SOS Contact</a>
              <button onClick={() => setSelectedPin(null)} className="flex-1 py-4 bg-white/10 rounded-2xl text-center text-xs font-black text-white uppercase tracking-widest hover:bg-white/20 transition-all">Dismiss</button>
            </div>
          </div>
        )}

        {selectedPath && (
          <div className="absolute bottom-6 left-6 right-6 bg-slate-900/95 backdrop-blur-2xl p-6 rounded-[2.5rem] border border-white/10 shadow-2xl z-30 animate-in slide-in-from-bottom-10 duration-500">
            <div className="flex justify-between items-start mb-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className={`text-[8px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest text-white`} style={{ backgroundColor: getPathColor(selectedPath.riskLevel) }}>
                    {selectedPath.riskLevel} Risk
                  </span>
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{selectedPath.type}</span>
                </div>
                <h3 className="text-xl font-black text-white leading-tight">{selectedPath.name}</h3>
              </div>
              <button onClick={() => setSelectedPath(null)} className="p-2 bg-white/10 rounded-full hover:bg-white/20 transition-all text-white">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white/5 p-4 rounded-2xl border border-white/10">
                <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-1">Live Status</p>
                <p className="text-xs font-bold text-white">{selectedPath.status}</p>
              </div>
              <div className="bg-white/5 p-4 rounded-2xl border border-white/10">
                <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-1">Travel Mode</p>
                <p className="text-xs font-bold text-white">{selectedPath.type}</p>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="bg-slate-900/60 backdrop-blur-2xl rounded-[2.5rem] p-6 border border-white/5 shadow-2xl space-y-4">
        <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] border-b border-white/5 pb-2">Navigation Key</h4>
        <div className="grid grid-cols-2 gap-y-4 gap-x-6">
          <div className="flex items-center gap-3">
             <div className="w-4 h-4 rounded-full bg-red-500" />
             <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">Hazard</span>
          </div>
          <div className="flex items-center gap-3">
             <div className="w-4 h-4 rounded-full bg-indigo-500" />
             <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">Entry Point</span>
          </div>
          <div className="col-span-2 flex flex-col gap-3 pt-2 border-t border-white/5 mt-1">
             <div className="flex items-center gap-3">
               <div className="w-10 h-1.5 rounded-full bg-indigo-500 shadow-[0_0_10px_rgba(79,70,229,0.8)]" />
               <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Active Navigation Path</span>
             </div>
             <div className="flex items-center gap-3">
               <div className="w-10 h-0.5 rounded-full bg-slate-700 border-t border-dashed border-white/20" />
               <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Alternate Route</span>
             </div>
          </div>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .marker-wrapper { position: relative; width: 30px; height: 30px; display: flex; align-items: center; justify-content: center; }
        .marker-pin { width: 14px; height: 14px; border-radius: 50%; border: 2px solid white; z-index: 2; box-shadow: 0 0 10px rgba(0,0,0,0.5); }
        .marker-pulse { position: absolute; width: 100%; height: 100%; border-radius: 50%; opacity: 0.6; animation: marker-pulse 2s infinite ease-out; z-index: 1; }
        @keyframes marker-pulse { 0% { transform: scale(0.3); opacity: 0.8; } 100% { transform: scale(1.6); opacity: 0; } }
        
        .active-nav-route {
          filter: drop-shadow(0 0 4px currentColor);
          animation: nav-glow 2s ease-in-out infinite;
        }

        @keyframes nav-glow {
          0%, 100% { opacity: 0.9; stroke-width: 8; }
          50% { opacity: 1; stroke-width: 10; }
        }
        
        .base-path-element {
          cursor: pointer;
        }
        
        .base-path-element:hover {
          stroke-width: 6;
          opacity: 0.8;
          transition: all 0.3s ease;
        }
      `}} />
    </div>
  );
};

export default SafetyMap;
