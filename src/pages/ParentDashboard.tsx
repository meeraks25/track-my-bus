import { useState, useEffect, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Clock, Phone, LogOut, RefreshCw } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import GoogleMapsWrapper from "@/components/GoogleMapsWrapper";
import { Marker, Popup } from "react-leaflet";
import L from 'leaflet';
import { db } from '@/lib/firebase';
import { doc, onSnapshot, collection, setDoc } from 'firebase/firestore';

const busIcon = new L.DivIcon({
  className: '',
  html: "<span style='font-size: 1.2rem; line-height: 1;'>🚌</span>",
  iconSize: [22, 22],
  iconAnchor: [11, 22],
  popupAnchor: [0, -22],
});

const ParentDashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [userInfo, setUserInfo] = useState<any>(null);
  const [currentRoute, setCurrentRoute] = useState<any>(null);
  const [busStatus, setBusStatus] = useState({
    status: 'On Route',
    currentStop: 0,
    eta: '8 minutes',
    isActive: true
  });
  const [liveBusPos, setLiveBusPos] = useState<{ lat: number, lng: number } | null>(null);
  const [liveBusPlace, setLiveBusPlace] = useState<string>('');
  // Draggable info box state
  const [infoBoxPos, setInfoBoxPos] = useState({ top: 24, left: 24 }); // px from top-left
  const [dragging, setDragging] = useState(false);
  const dragOffset = useRef({ x: 0, y: 0 });
  const [watchId, setWatchId] = useState<number | null>(null);
  const [isActive, setIsActive] = useState<boolean>(false);
  const [loading, setLoading] = useState(true);
  const [path, setPath] = useState<{ lat: number; lng: number; timestamp: number }[]>([]);

  const userType = localStorage.getItem('userType');
  const storedUserInfo = localStorage.getItem('userInfo');
  const storedRoute = localStorage.getItem('currentRoute');

  useEffect(() => {
    if (!userType || userType !== 'parent' || !storedUserInfo || !storedRoute) {
      navigate('/login');
      return;
    }
    setUserInfo(JSON.parse(storedUserInfo));
    setCurrentRoute(JSON.parse(storedRoute));
  }, [navigate]);

  useEffect(() => {
    const unsub = onSnapshot(doc(db, 'buses', 'bus_1'), (docSnap) => {
      const data = docSnap.data();
      if (data && data.location) {
        setLiveBusPos({ lat: data.location.latitude, lng: data.location.longitude });
      }
      if (data && typeof data.isActive === 'boolean') {
        setIsActive(data.isActive);
      }
      setLoading(false);
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    if (liveBusPos) {
      fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${liveBusPos.lat}&lon=${liveBusPos.lng}`)
        .then(res => res.json())
        .then(data => setLiveBusPlace(data.display_name || ''))
        .catch(() => setLiveBusPlace(''));
    }
  }, [liveBusPos]);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, "buses", "bus_1", "path"), (snap) => {
      const pathArr = snap.docs.map(doc => doc.data() as { lat: number; lng: number; timestamp: number });
      setPath(pathArr);
    });
    return () => unsub();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('userType');
    localStorage.removeItem('userInfo');
    localStorage.removeItem('currentRoute');
    toast({
      title: "Logged out successfully",
      description: "See you next time!"
    });
    navigate('/');
  };

  const handleRefresh = () => {
    toast({
      title: "Refreshing location",
      description: "Getting latest bus information..."
    });
  };

  const handleStart = () => {
    if (!navigator.geolocation) {
      alert('Geolocation not supported');
      setBusStatus(prev => ({ ...prev, isActive: false }));
      return;
    }
    setBusStatus(prev => ({ ...prev, isActive: true }));
    const id = navigator.geolocation.watchPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        const timestamp = pos.timestamp;
        setLiveBusPos({ lat: latitude, lng: longitude });
        await setDoc(doc(db, 'buses', 'bus_1'), { location: { latitude, longitude, timestamp } }, { merge: true });
      },
      (err) => {
        console.error("Geolocation error:", err);
        setBusStatus(prev => ({ ...prev, isActive: false }));
        setLiveBusPos(null);
      },
      { enableHighAccuracy: true, maximumAge: 0, timeout: 10000 }
    );
    setWatchId(id);
  };

  const handleStop = () => {
    setBusStatus(prev => ({ ...prev, isActive: false }));
    if (watchId !== null) {
      navigator.geolocation.clearWatch(watchId);
      setWatchId(null);
    }
  };

  // Find nearest stop index to bus position
  const getNearestStopIdx = () => {
    if (!currentRoute || !currentRoute.stops || !liveBusPos) return 0;
    let minDist = Infinity;
    let nearestIdx = 0;
    currentRoute.stops.forEach((stop: any, idx: number) => {
      const d = Math.sqrt(Math.pow(liveBusPos.lat - stop.lat, 2) + Math.pow(liveBusPos.lng - stop.lng, 2));
      if (d < minDist) {
        minDist = d;
        nearestIdx = idx;
      }
    });
    return nearestIdx;
  };
  const nearestStopIdx = getNearestStopIdx();

  if (!userInfo || !currentRoute || !currentRoute.stops || currentRoute.stops.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 font-bold">No route or stops assigned. Please contact admin.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <MapPin className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-xl font-bold text-gray-900">TrackMyBus</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">Welcome, {userInfo.name}</span>
              <Button variant="ghost" onClick={handleLogout} className="text-gray-600">
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Live Map */}
          <div className="lg:col-span-2 relative">
            <Card className="h-[600px]">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="flex items-center space-x-2">
                      <span>Bus {userInfo.busName}</span>
                      <Badge variant={isActive ? "default" : "secondary"}>
                        {loading ? "Loading..." : isActive ? "Live" : "Offline"}
                      </Badge>
                    </CardTitle>
                    <CardDescription>{userInfo.schoolName} - {userInfo.trip}</CardDescription>
                  </div>
                  <Button variant="ghost" onClick={handleRefresh} className="text-blue-600">
                    <RefreshCw className="w-4 h-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="h-full p-4">
                <div className="h-full">
                  <GoogleMapsWrapper
                    route={currentRoute}
                    userType="parent"
                    isTracking={busStatus.isActive}
                    onBusLocationUpdate={setLiveBusPos}
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Bus Status */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Bus Status</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-3">
                  <MapPin className="w-5 h-5 text-blue-600" />
                  <div>
                    <p className="font-medium">Current Stop</p>
                    <p className="text-sm text-gray-600">
                      {currentRoute.stops?.[busStatus.currentStop]?.name || 'Starting route'}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <Clock className="w-5 h-5 text-orange-600" />
                  <div>
                    <p className="font-medium">Next Stop ETA</p>
                    <p className="text-sm text-gray-600">{busStatus.eta}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <span className="font-medium">Total Stops:</span>
                  <span className="text-sm text-gray-700">{currentRoute.stops?.length || 0}</span>
                </div>
                <div className="flex items-center space-x-3">
                  <span className="font-medium">Live Bus Location:</span>
                  <span className="text-sm text-green-700 font-mono">{liveBusPlace || (liveBusPos ? `${liveBusPos.lat.toFixed(5)}, ${liveBusPos.lng.toFixed(5)}` : '...')}</span>
                </div>
              </CardContent>
            </Card>

            {/* Your Details */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Your Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-sm font-medium text-gray-700">School</p>
                  <p className="text-sm text-gray-600">{userInfo.schoolName}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700">Bus</p>
                  <p className="text-sm text-gray-600">{userInfo.busName}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700">Trip</p>
                  <p className="text-sm text-gray-600">{userInfo.trip}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700">Phone</p>
                  <p className="text-sm text-gray-600">{userInfo.phone}</p>
                </div>
              </CardContent>
            </Card>

            {/* Driver Contact */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Driver Contact</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm font-medium text-gray-700">Driver Name</p>
                    <p className="text-sm text-gray-600">{currentRoute.driverName}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-700">Driver Phone</p>
                    <p className="text-sm text-gray-600">{currentRoute.driverPhone}</p>
                  </div>
                  <Button variant="outline" className="w-full mt-4">
                    <Phone className="w-4 h-4 mr-2" />
                    Call Driver
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Route Stops */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Route Stops</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {currentRoute.stops?.map((stop: any, index: number) => (
                    <div key={stop.id} className="flex items-center space-x-3">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${
                        index <= busStatus.currentStop 
                          ? 'bg-green-100 text-green-700'
                          : 'bg-gray-100 text-gray-500'
                      }`}>
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <p className={`text-sm font-medium ${
                          index === busStatus.currentStop ? 'text-blue-700' : 'text-gray-900'
                        }`}>
                          {stop.name}
                        </p>
                      </div>
                      <Badge 
                        variant="outline"
                        className={`text-xs ${
                          index < busStatus.currentStop 
                            ? 'bg-green-50 text-green-700 border-green-200'
                            : index === busStatus.currentStop
                            ? 'bg-blue-50 text-blue-700 border-blue-200'
                            : 'bg-gray-50 text-gray-700 border-gray-200'
                        }`}
                      >
                        {index < busStatus.currentStop ? 'Passed' : 
                         index === busStatus.currentStop ? 'Current' : 'Upcoming'}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ParentDashboard;
