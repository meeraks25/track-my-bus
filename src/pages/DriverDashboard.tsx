import { useEffect, useState } from 'react';
import { set, ref as dbRef, onValue, database } from '@/lib/firebase';
import { MapPin, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import 'leaflet/dist/leaflet.css';
import '@/App.css';
import GoogleMapsWrapper from '@/components/GoogleMapsWrapper';
import { MapContainer, TileLayer } from 'react-leaflet';
import { Polyline, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';

const DEFAULT_CENTER = { lat: 10.158316, lng: 76.178494 };

// Custom emoji SVG icons
const busSVG = `<svg width="36" height="36" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg"><text x="50%" y="60%" text-anchor="middle" dominant-baseline="middle" font-size="28">🚌</text></svg>`;
const stopSVG = `<svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg"><text x="50%" y="60%" text-anchor="middle" dominant-baseline="middle" font-size="24">📍</text></svg>`;

export const busIcon = new L.DivIcon({
  className: '',
  html: "<span style='font-size: 1.5rem; line-height: 1;'>🚌</span>",
  iconSize: [22, 22],
  iconAnchor: [11, 22],
  popupAnchor: [0, -22],
});
const stopIcon = new L.DivIcon({
  html: "<span style='font-size: 2rem; line-height: 1;'>📍</span>",
  className: "",
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32],
});

const DriverDashboard = () => {
  const navigate = useNavigate();
  const [userInfo, setUserInfo] = useState<any>(null);
  const [currentRoute, setCurrentRoute] = useState<any>(null);
  const [busPos, setBusPos] = useState<{ lat: number; lng: number }>({ ...DEFAULT_CENTER });
  const [isTracking, setIsTracking] = useState(false);
  const [path, setPath] = useState<{ lat: number; lng: number; timestamp: number }[]>([]);
  // Draggable info box state
  const [infoBoxPos, setInfoBoxPos] = useState({ top: 24, left: 24 }); // px from top-left
  const [dragging, setDragging] = useState(false);
  const dragOffset = { x: 0, y: 0 };
  // Add state for location warning
  const [showLocationWarning, setShowLocationWarning] = useState(false);
  const [watchId, setWatchId] = useState<number | null>(null);

  // Auth & route load
  useEffect(() => {
    const userType = localStorage.getItem('userType');
    const storedUserInfo = localStorage.getItem('userInfo');
    const storedRoute = localStorage.getItem('currentRoute');
    if (!userType || userType !== 'driver' || !storedUserInfo || !storedRoute) {
      navigate('/login');
      return;
    }
    setUserInfo(JSON.parse(storedUserInfo));
    setCurrentRoute(JSON.parse(storedRoute));
  }, [navigate]);

  // Listen for live bus location from Firebase
  useEffect(() => {
    const locRef = dbRef(database, '/buses/bus_1/location');
    const unsub = onValue(locRef, (snap) => {
      const data = snap.val();
      if (data && typeof data.latitude === 'number' && typeof data.longitude === 'number') {
        setBusPos({ lat: data.latitude, lng: data.longitude });
      }
    });
    return () => { if (typeof unsub === 'function') unsub(); };
  }, []);

  // Load path from Firebase on mount
  useEffect(() => {
    const pathRef = dbRef(database, '/buses/bus_1/path');
    const unsub = onValue(pathRef, (snap) => {
      const data = snap.val();
      if (Array.isArray(data)) {
        setPath(data);
      }
    });
    return () => { if (typeof unsub === 'function') unsub(); };
  }, []);

  // Start tracking
  const handleStart = () => {
    if (!navigator.geolocation) {
      alert('Geolocation not supported');
      setIsTracking(false);
      return;
    }
    setIsTracking(true);
    set(dbRef(database, '/buses/bus_1/isActive'), true);
    const id = navigator.geolocation.watchPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        const timestamp = pos.timestamp;
        const newPoint = { lat: latitude, lng: longitude, timestamp };
        setBusPos({ lat: latitude, lng: longitude });
        setPath(prev => {
          const updated = [...prev, newPoint];
          set(dbRef(database, '/buses/bus_1/path'), updated);
          set(dbRef(database, '/buses/bus_1/location'), { latitude, longitude, timestamp });
          return updated;
        });
      },
      (err) => {
        console.error("Geolocation error:", err);
        setIsTracking(false);
        setBusPos(DEFAULT_CENTER);
        setShowLocationWarning(true);
      },
      { enableHighAccuracy: true, maximumAge: 0, timeout: 10000 }
    );
    setWatchId(id);
  };

  // Stop tracking
  const handleStop = () => {
    setIsTracking(false);
    set(dbRef(database, '/buses/bus_1/isActive'), false);
    if (watchId !== null) {
      navigator.geolocation.clearWatch(watchId);
      setWatchId(null);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('userType');
    localStorage.removeItem('userInfo');
    localStorage.removeItem('currentRoute');
    localStorage.removeItem('driverLocation');
    navigate('/');
  };

  const userType = localStorage.getItem('userType');
  const storedUserInfo = localStorage.getItem('userInfo');
  const storedRoute = localStorage.getItem('currentRoute');

  // Fetch route and stops from Firebase
  useEffect(() => {
    const routeRef = dbRef(database, '/routes/driver_1'); // Adjust path as needed
    const unsub = onValue(routeRef, (snap) => {
      const data = snap.val();
      if (data && data.stops) {
        setCurrentRoute(data);
      }
    });
    return () => { if (typeof unsub === 'function') unsub(); };
  }, []);

  useEffect(() => {
    if (navigator.geolocation) {
      const watchId = navigator.geolocation.watchPosition(
        (pos) => {
          const { latitude, longitude } = pos.coords;
          setBusPos({ lat: latitude, lng: longitude });
          // Always update Firebase with the latest location
          set(dbRef(database, '/buses/bus_1/location'), { latitude, longitude, timestamp: Date.now() });
        }
      );
      return () => navigator.geolocation.clearWatch(watchId);
    }
  }, []);

  if (!userInfo || !currentRoute || !currentRoute.stops || currentRoute.stops.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center">
        <div className="text-center mb-6">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 font-bold">No route or stops assigned. Please contact admin.</p>
        </div>
        {/* Debug Panel */}
        <div className="bg-white border border-gray-300 rounded-lg p-4 shadow max-w-lg w-full text-left">
          <h2 className="font-bold mb-2 text-red-600">Debug Info</h2>
          <div><b>userType:</b> <code>{String(userType)}</code></div>
          <div><b>userInfo:</b> <code>{String(storedUserInfo)}</code></div>
          <div><b>currentRoute:</b> <code>{String(storedRoute)}</code></div>
        </div>
      </div>
    );
  }

  // Find current/next stop (nearest)
  const getCurrentStop = () => {
    if (!currentRoute.stops) return null;
    let minDist = Infinity;
    let nearest = null;
    for (const stop of currentRoute.stops) {
      const d = Math.sqrt(Math.pow(busPos.lat - stop.lat, 2) + Math.pow(busPos.lng - stop.lng, 2));
      if (d < minDist) {
        minDist = d;
        nearest = stop;
      }
    }
    return nearest;
  };
  const currentStop = getCurrentStop();

  // Find nearest stop index to bus position
  const getNearestStopIndex = () => {
    if (!currentRoute.stops) return 0;
    let minDist = Infinity;
    let nearestIdx = 0;
    currentRoute.stops.forEach((stop: any, idx: number) => {
      const d = Math.sqrt(Math.pow(busPos.lat - stop.lat, 2) + Math.pow(busPos.lng - stop.lng, 2));
      if (d < minDist) {
        minDist = d;
        nearestIdx = idx;
      }
    });
    return nearestIdx;
  };
  const nearestStopIdx = getNearestStopIndex();

  // Prepare polyline segments
  const stopsLatLngs = currentRoute.stops?.map((s: any) => [s.lat, s.lng]) || [];
  const traveledLatLngs = stopsLatLngs.slice(0, nearestStopIdx + 1);
  const remainingLatLngs = stopsLatLngs.slice(nearestStopIdx);

  console.log("isTracking:", isTracking, "busPos:", busPos);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <MapPin className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-xl font-bold text-gray-900">Driver Dashboard</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">Driver: {userInfo.name}</span>
              <Button variant="ghost" onClick={handleLogout} className="text-gray-600">
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>
      {/* Start/Stop Controls */}
      <div className="flex justify-end items-center max-w-7xl w-full mx-auto px-4 pt-4 gap-4">
        {!isTracking ? (
          <Button onClick={handleStart} className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 py-2 rounded-lg shadow">
            Start Trip
          </Button>
        ) : (
          <Button onClick={handleStop} className="bg-red-600 hover:bg-red-700 text-white font-bold px-6 py-2 rounded-lg shadow">
            Stop Trip
          </Button>
        )}
      </div>
      {/* Map Section */}
      <div className="flex-1 relative px-4 py-4 flex flex-col gap-4 max-w-7xl w-full mx-auto">
        {showLocationWarning && (
          <div className="mb-4 p-3 bg-yellow-100 border-l-4 border-yellow-500 text-yellow-800 rounded">
            Location access denied or unavailable. Map is shown, but live tracking is disabled.
          </div>
        )}
        <div className="flex flex-col md:flex-row gap-4 h-full">
          <div className="flex-1">
            <div className="w-full h-full relative">
              <div style={{ width: '100vw', height: '80vh' }}>
                <MapContainer
                  center={[currentRoute.stops[0].lat, currentRoute.stops[0].lng]}
                  zoom={15}
                  style={{ width: '100%', height: '100%' }}
                >
                  <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                  {/* Draw the route as a blue line */}
                  {currentRoute.stops.length > 1 && (
                    <Polyline
                      positions={currentRoute.stops.map(stop => [stop.lat, stop.lng])}
                      pathOptions={{ color: '#2563eb', weight: 6, opacity: 0.9 }}
                    />
                  )}
                  {/* Render stop markers */}
                  {currentRoute.stops.map((stop, idx) => (
                    <Marker
                      key={stop.id || idx}
                      position={[stop.lat, stop.lng]}
                      icon={stopIcon}
                    >
                      <Popup>{stop.name}</Popup>
                    </Marker>
                  ))}
                  {/* Live bus location marker */}
                  {isTracking && (
                    <Marker position={[busPos.lat, busPos.lng]} icon={busIcon}>
                      <Popup>You are here (Driver)</Popup>
                    </Marker>
                  )}
                </MapContainer>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DriverDashboard;
