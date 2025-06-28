import React, { useEffect, useRef, useState } from 'react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapContainer as LeafletMap, TileLayer, Marker, Popup, useMapEvents, Polyline } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { set, ref, database } from '@/lib/firebase';
import { onValue } from 'firebase/database';

interface BusStop {
  id: string;
  name: string;
  lat: number;
  lng: number;
}

interface RouteData {
  schoolName: string;
  busName: string;
  tripNumber: string;
  driverName: string;
  driverPhone: string;
  stops: BusStop[];
  routePath: { lat: number; lng: number }[];
}

interface MapContainerProps {
  route: RouteData;
  userType: 'driver' | 'parent' | 'admin';
  onStartTrip?: () => void;
  onStopTrip?: () => void;
  isTracking?: boolean;
  onMapClick?: (lat: number, lng: number) => void;
  driverLocation?: {lat: number, lng: number} | null;
  onBusLocationUpdate?: (location: { lat: number; lng: number }) => void;
}

const busIcon = new L.DivIcon({
  className: '',
  html: "<span style='font-size: 1.5rem; line-height: 1;'>🚌</span>",
  iconSize: [22, 22],
  iconAnchor: [11, 22],
  popupAnchor: [0, -22],
});

const stopIcon = new L.DivIcon({
  className: '',
  html: `<div style="font-size: 1.7rem; line-height: 1;">📍</div>`,
  iconSize: [28, 28],
  iconAnchor: [14, 28],
  popupAnchor: [0, -28],
});

const MapContainer: React.FC<MapContainerProps> = ({ 
  route, 
  userType, 
  onStartTrip, 
  onStopTrip, 
  isTracking = false,
  onMapClick,
  driverLocation,
  onBusLocationUpdate
}) => {
  const [busPosition, setBusPosition] = useState<{ lat: number; lng: number; stopIndex: number } | null>(null);
  const [animationProgress, setAnimationProgress] = useState(0);

  // Real-time bus movement simulation when tracking
  useEffect(() => {
    if (!isTracking || !route.stops.length) {
      setBusPosition(null);
      setAnimationProgress(0);
      return;
    }

    // Start from first stop when tracking begins
    if (!busPosition) {
      setBusPosition({
        lat: route.stops[0].lat,
        lng: route.stops[0].lng,
        stopIndex: 0
      });
      setAnimationProgress(0);
    }

    const interval = setInterval(() => {
      setAnimationProgress(prev => {
        const newProgress = prev + 0.01; // Slower, more realistic movement
        
        if (newProgress >= 1 && busPosition && busPosition.stopIndex < route.stops.length - 1) {
          // Move to next stop
          const nextStopIndex = busPosition.stopIndex + 1;
          setBusPosition({
            lat: route.stops[nextStopIndex].lat,
            lng: route.stops[nextStopIndex].lng,
            stopIndex: nextStopIndex
          });
          return 0;
        }
        
        return Math.min(newProgress, 1);
      });
    }, 200); // Slower interval for more realistic movement

    return () => clearInterval(interval);
  }, [isTracking, route.stops, busPosition?.stopIndex]);

  // Calculate current bus position for smooth animation
  const getCurrentBusPosition = () => {
    if (!busPosition || !route.stops[busPosition.stopIndex + 1]) return busPosition;
    
    const currentStop = route.stops[busPosition.stopIndex];
    const nextStop = route.stops[busPosition.stopIndex + 1];
    
    return {
      lat: currentStop.lat + (nextStop.lat - currentStop.lat) * animationProgress,
      lng: currentStop.lng + (nextStop.lng - currentStop.lng) * animationProgress,
      stopIndex: busPosition.stopIndex
    };
  };

  const currentPosition = getCurrentBusPosition();

  const handleMapClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (userType !== 'admin' || !onMapClick) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    // Convert screen coordinates to mock lat/lng
    const lat = 40.7128 + (y - 50) * 0.01;
    const lng = -74.0060 + (x - 50) * 0.01;

    onMapClick(lat, lng);
  };

  if (userType === 'driver') {
    // Leaflet map with draggable marker for manual tracking
    const [markerPos, setMarkerPos] = useState<{ lat: number; lng: number }>(driverLocation || { lat: 10.158316, lng: 76.178494 });

    // Update parent with marker position
    useEffect(() => {
      if (driverLocation && (driverLocation.lat !== markerPos.lat || driverLocation.lng !== markerPos.lng)) {
        setMarkerPos(driverLocation);
      }
      // eslint-disable-next-line
    }, [driverLocation]);

    // Push to Firebase on dragend
    const handleMarkerDragEnd = (e: any) => {
      const { lat, lng } = e.target.getLatLng();
      setMarkerPos({ lat, lng });
      set(ref(database, '/buses/bus_1/location'), { latitude: lat, longitude: lng, timestamp: Date.now() });
      // Optionally, call a callback to update parent state
      if (onBusLocationUpdate) onBusLocationUpdate({ lat, lng });
    };

    console.log("Driver map rendering", route, driverLocation);

    return (
      <div className="w-full h-full relative">
        <LeafletMap center={[route.stops[0].lat, route.stops[0].lng]} zoom={15} style={{ width: '100%', height: '100%', borderRadius: '0.5rem' }}>
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution="&copy; OpenStreetMap contributors" />
          {/* Draggable Bus Marker */}
          <Marker
            position={markerPos}
            icon={busIcon}
            draggable={true}
            eventHandlers={{ dragend: handleMarkerDragEnd }}
          >
            <Popup>Drag me to update bus location</Popup>
          </Marker>
          {/* Bus Stops */}
          {route.stops && route.stops.map((stop, idx) => (
            <Marker
              key={stop.id}
              position={{ lat: stop.lat, lng: stop.lng }}
              icon={stopIcon}
            >
              <Popup>{stop.name}</Popup>
            </Marker>
          ))}
          {isTracking && (
            <Marker position={[markerPos.lat, markerPos.lng]} icon={busIcon}>
              <Popup>You are here (Driver)</Popup>
            </Marker>
          )}
        </LeafletMap>
        {/* Driver Controls */}
        <div className="absolute top-4 right-4 bg-white rounded-lg shadow-lg p-4 z-10">
            <div className="flex items-center space-x-4">
              <Badge variant={isTracking ? "default" : "secondary"}>
                {isTracking ? '🟢 Live Tracking' : '🔴 Offline'}
              </Badge>
              {!isTracking ? (
                <Button 
                  onClick={onStartTrip} 
                  className="bg-green-600 hover:bg-green-700"
                  disabled={!onStartTrip}
                >
                  Start Trip
                </Button>
              ) : (
                <Button 
                  onClick={onStopTrip} 
                  variant="destructive"
                  disabled={!onStopTrip}
                >
                  Stop Trip
                </Button>
              )}
            </div>
          </div>
      </div>
    );
  }

  if (userType === 'parent') {
    // Live bus marker and path from Firebase
    const [busPos, setBusPos] = useState<{ lat: number; lng: number } | null>(null);
    const [path, setPath] = useState<{ lat: number; lng: number; timestamp: number }[]>([]);
    useEffect(() => {
      const locRef = ref(database, '/buses/bus_1/location');
      const unsub = onValue(locRef, (snap) => {
        const data = snap.val();
        if (data && typeof data.latitude === 'number' && typeof data.longitude === 'number') {
          setBusPos({ lat: data.latitude, lng: data.longitude });
          if (typeof onBusLocationUpdate === 'function') onBusLocationUpdate({ lat: data.latitude, lng: data.longitude });
        } else {
          setBusPos(null);
        }
      });
      return () => { if (typeof unsub === 'function') unsub(); };
    }, []);

    useEffect(() => {
      const pathRef = ref(database, '/buses/bus_1/path');
      const unsub = onValue(pathRef, (snap) => {
        const data = snap.val();
        if (Array.isArray(data)) {
          setPath(data);
        } else {
          setPath([]);
        }
      });
      return () => { if (typeof unsub === 'function') unsub(); };
    }, []);

    // Blue/white split polyline logic
    const stopsLatLngs = route.stops?.map((s: any) => [s.lat, s.lng]) || [];
    let nearestStopIdx = 0;
    if (busPos && stopsLatLngs.length > 0) {
      let minDist = Infinity;
      stopsLatLngs.forEach(([lat, lng], idx) => {
        const d = Math.sqrt(Math.pow(busPos.lat - lat, 2) + Math.pow(busPos.lng - lng, 2));
        if (d < minDist) {
          minDist = d;
          nearestStopIdx = idx;
        }
      });
    }
    const traveledLatLngs = stopsLatLngs.slice(0, nearestStopIdx + 1);
    const remainingLatLngs = stopsLatLngs.slice(nearestStopIdx);

    console.log("isTracking:", isTracking, "busPos:", busPos);

    return (
      <div className="w-full h-full relative">
        <LeafletMap center={[route.stops[0].lat, route.stops[0].lng]} zoom={15} style={{ width: '100%', height: '100%', borderRadius: '0.5rem' }}>
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution="&copy; OpenStreetMap contributors" />
          {/* Live Bus Marker */}
          {busPos && (
            <Marker position={busPos} icon={busIcon}>
              <Popup>🚌 Bus Location</Popup>
            </Marker>
          )}
          {/* Traveled Route (white, dashed) */}
          {traveledLatLngs.length > 1 && (
            <Polyline positions={traveledLatLngs} pathOptions={{ color: '#fff', weight: 6, opacity: 0.9, dashArray: '6 8' }} />
          )}
          {/* Remaining Route (blue) */}
          {remainingLatLngs.length > 1 && (
            <Polyline positions={remainingLatLngs} pathOptions={{ color: '#2563eb', weight: 6, opacity: 0.9 }} />
          )}
          {/* Bus Stops */}
          {route.stops && route.stops.map((stop, idx) => (
            <Marker
              key={stop.id}
              position={{ lat: stop.lat, lng: stop.lng }}
              icon={stopIcon}
            >
              <Popup>{stop.name}</Popup>
            </Marker>
          ))}
        </LeafletMap>
        {!busPos && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
            <div className="bg-white/90 text-gray-700 px-6 py-3 rounded-lg shadow-lg border text-lg font-semibold">
              Waiting for live bus location...<br/>The bus may be offline or not moving.
            </div>
          </div>
        )}
      </div>
    );
  }

  // Admin: Real Leaflet map for adding stops
  if (userType === 'admin') {
    // Center map on first stop or default location
    const defaultCenter = route.stops.length > 0
      ? { lat: route.stops[0].lat, lng: route.stops[0].lng }
      : { lat: 10.158316, lng: 76.178494 };

    // Handler for map click to add stop
    function AdminMapClicker() {
      useMapEvents({
        click(e) {
          if (onMapClick) {
            onMapClick(e.latlng.lat, e.latlng.lng);
          }
        },
      });
      return null;
    }

    // Simulate bus progress for demo (admin doesn't have live tracking, but we can show the split route if isTracking is true)
    const [progressIdx, setProgressIdx] = useState(0);
    useEffect(() => {
      if (!isTracking || route.stops.length < 2) return;
      setProgressIdx(0);
      const interval = setInterval(() => {
        setProgressIdx((idx) => {
          if (idx < route.stops.length - 1) return idx + 1;
          clearInterval(interval);
          return idx;
        });
      }, 1200);
      return () => clearInterval(interval);
    }, [isTracking, route.stops.length]);

    // Split route for coloring
    const traveled = route.stops.slice(0, progressIdx + 1);
    const remaining = route.stops.slice(progressIdx);

    return (
      <div className="w-full h-full relative">
        <LeafletMap
          center={[defaultCenter.lat, defaultCenter.lng]}
          zoom={15}
          style={{ height: '400px', width: '100%' }}
        >
          <AdminMapClicker />
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          {/* Draw blue line connecting all stops */}
          {route.stops.length > 1 && (
            <Polyline
              positions={route.stops.map(stop => [stop.lat, stop.lng])}
              pathOptions={{ color: '#2563eb', weight: 6, opacity: 0.9 }}
            />
          )}
          {/* Render existing stops */}
          {route.stops.map((stop, idx) => (
            <Marker
              key={stop.id || idx}
              position={[stop.lat, stop.lng]}
              icon={stopIcon}
            >
              <Popup>{stop.name}</Popup>
            </Marker>
          ))}
        </LeafletMap>
        {/* Admin Instructions */}
        <div className="absolute top-4 left-4 bg-blue-50 border border-blue-200 rounded-lg shadow p-3 text-sm max-w-xs z-10">
          <p className="font-medium text-blue-900">🖱️ Click to Add Stops</p>
          <p className="text-blue-700 text-xs mt-1">Click anywhere on the map to add a bus stop</p>
        </div>
        {/* Small Info Panel Top Right */}
        <div className="absolute top-4 right-4 bg-white rounded-lg shadow-lg p-2 z-10 w-48 text-xs">
          <div className="mb-1 text-sm font-bold text-gray-900 truncate">{route.busName || 'Bus Name'}</div>
          <div className="text-[10px] text-gray-500 mb-1 truncate">{route.schoolName || 'School Name'}</div>
          <div className="flex items-center justify-between text-[10px] text-gray-600">
            <span>Stops: <b>{route.stops.length}</b></span>
            <span>Trip: <b>{route.tripNumber || '-'}</b></span>
          </div>
          {isTracking && (
            <div className="mt-1">
              <div className="flex items-center gap-1">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                <span className="text-[10px] text-green-600 font-medium">Simulating Trip...</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-1 mt-1">
                <div 
                  className="bg-blue-600 h-1 rounded-full transition-all duration-200"
                  style={{ width: `${Math.round((progressIdx / Math.max(route.stops.length - 1, 1)) * 100)}%` }}
                ></div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full relative">
      {/* Google Maps Style Container */}
      <div 
        className={`w-full h-full bg-gray-100 rounded-lg relative overflow-hidden ${
          userType === 'admin' ? 'cursor-crosshair' : ''
        }`}
        onClick={handleMapClick}
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23d1d5db' fill-opacity='0.3'%3E%3Crect x='0' y='0' width='30' height='1'/%3E%3Crect x='0' y='0' width='1' height='30'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}
      >
        {/* Street Grid Overlay */}
        <div className="absolute inset-0 opacity-20">
          <svg width="100%" height="100%">
            <defs>
              <pattern id="streets" width="100" height="100" patternUnits="userSpaceOnUse">
                <path d="M 100 0 L 0 0 0 100" fill="none" stroke="#9CA3AF" strokeWidth="1"/>
                <path d="M 50 0 L 50 100" fill="none" stroke="#9CA3AF" strokeWidth="0.5"/>
                <path d="M 0 50 L 100 50" fill="none" stroke="#9CA3AF" strokeWidth="0.5"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#streets)" />
          </svg>
        </div>

        {/* Route Path - Blue Line - Always show if stops exist */}
        {route.stops && route.stops.length > 1 && (
          <svg className="absolute inset-0 w-full h-full" style={{ zIndex: 1 }}>
            <defs>
              <linearGradient id="routeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#3B82F6" />
                <stop offset="100%" stopColor="#1D4ED8" />
              </linearGradient>
            </defs>
            <polyline
              points={route.stops.map((stop, index) => {
                const x = 15 + (index / Math.max(route.stops.length - 1, 1)) * 70;
                const y = 20 + Math.sin(index * 0.8) * 15 + Math.cos(index * 0.3) * 10;
                return `${x}%,${y}%`;
              }).join(' ')}
              fill="none"
              stroke="url(#routeGradient)"
              strokeWidth="4"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="animate-pulse"
            />
          </svg>
        )}

        {/* Bus Stops - Red Numbered Circles */}
        {route.stops && route.stops.map((stop, index) => {
          const x = 15 + (index / Math.max(route.stops.length - 1, 1)) * 70;
          const y = 20 + Math.sin(index * 0.8) * 15 + Math.cos(index * 0.3) * 10;
          
          return (
            <div
              key={stop.id}
              className="absolute transform -translate-x-1/2 -translate-y-1/2"
              style={{ 
                left: `${x}%`, 
                top: `${y}%`,
                zIndex: 3
              }}
            >
              {/* Red Stop Marker */}
              <div className="relative">
                <div className="w-8 h-8 bg-red-500 rounded-full border-3 border-white shadow-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">{index + 1}</span>
                </div>
                {/* Stop Name Tooltip */}
                <div className="absolute top-10 left-1/2 transform -translate-x-1/2 bg-white px-3 py-1 rounded-lg shadow-lg text-xs font-semibold whitespace-nowrap border">
                  {stop.name}
                </div>
              </div>
            </div>
          );
        })}

        {/* Live Bus Icon - Show when tracking */}
        {currentPosition && isTracking && (
          <div
            className="absolute transform -translate-x-1/2 -translate-y-1/2 transition-all duration-200 ease-linear"
            style={{ 
              left: `${15 + (currentPosition.stopIndex + animationProgress) / Math.max(route.stops.length - 1, 1) * 70}%`, 
              top: `${20 + Math.sin((currentPosition.stopIndex + animationProgress) * 0.8) * 15 + Math.cos((currentPosition.stopIndex + animationProgress) * 0.3) * 10}%`,
              zIndex: 4
            }}
          >
            <div className="relative">
              {/* Bus Shadow */}
              <div className="absolute top-2 left-0 w-10 h-6 bg-black/20 rounded-full blur-sm"></div>
              {/* Bus Icon */}
              <div className="w-10 h-6 bg-yellow-400 rounded-lg border-2 border-yellow-600 shadow-lg flex items-center justify-center">
                <span className="text-yellow-800 text-xs font-bold">🚌</span>
              </div>
              {/* Live Indicator */}
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full animate-pulse border border-white"></div>
            </div>
          </div>
        )}

        {/* Bus Information Panel */}
        <div className="absolute bottom-4 left-4 right-4 bg-white rounded-lg shadow-lg p-4 z-10">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-xl text-gray-900">{route.busName}</h3>
              <p className="text-sm text-gray-600">{route.schoolName}</p>
              {currentPosition && isTracking && (
                <div className="flex items-center space-x-2 mt-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-xs text-green-600 font-medium">
                    En route to Stop {Math.min(currentPosition.stopIndex + 1, route.stops.length)} of {route.stops.length}
                  </span>
                </div>
              )}
            </div>
            <div className="text-right">
              <p className="text-lg font-bold text-gray-900">{route.tripNumber}</p>
              <p className="text-xs text-gray-500">Route ID</p>
              {isTracking && (
                <div className="mt-1">
                  <span className="text-xs text-blue-600 font-medium">Live</span>
                </div>
              )}
            </div>
          </div>
          
          {/* Progress Bar */}
          {isTracking && (
            <div className="mt-3">
              <div className="flex justify-between text-xs text-gray-600 mb-1">
                <span>Trip Progress</span>
                <span>{Math.round(((currentPosition?.stopIndex || 0) + animationProgress) / Math.max(route.stops.length - 1, 1) * 100)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-200"
                  style={{ 
                    width: `${((currentPosition?.stopIndex || 0) + animationProgress) / Math.max(route.stops.length - 1, 1) * 100}%` 
                  }}
                ></div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MapContainer;
