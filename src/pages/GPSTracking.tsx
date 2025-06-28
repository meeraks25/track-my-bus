
import React, { useState, useEffect, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Navigation, Square } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import L from 'leaflet';

// Fix for default markers in Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const GPSTracking = () => {
  const { toast } = useToast();
  const mapRef = useRef<L.Map | null>(null);
  const busMarkerRef = useRef<L.Marker | null>(null);
  const watchIdRef = useRef<number | null>(null);
  
  const [isTracking, setIsTracking] = useState(false);
  const [currentLocation, setCurrentLocation] = useState<{lat: number, lng: number} | null>(null);
  const [accuracy, setAccuracy] = useState<number | null>(null);

  // Initialize map
  useEffect(() => {
    // Import Leaflet CSS
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://unpkg.com/leaflet@1.7.1/dist/leaflet.css';
    document.head.appendChild(link);

    // Initialize map with a default location
    const map = L.map('map', {
      center: [40.7128, -74.0060], // Default to NYC
      zoom: 15,
      zoomControl: true,
    });

    // Add tile layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(map);

    mapRef.current = map;

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
      }
      if (link.parentNode) {
        link.parentNode.removeChild(link);
      }
    };
  }, []);

  // Create custom bus icon
  const createBusIcon = () => {
    return L.divIcon({
      html: `
        <div style="
          background: #fbbf24;
          border: 3px solid #f59e0b;
          border-radius: 8px;
          width: 40px;
          height: 30px;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 8px rgba(0,0,0,0.3);
          position: relative;
        ">
          <span style="font-size: 16px;">🚌</span>
          <div style="
            position: absolute;
            top: -2px;
            right: -2px;
            width: 8px;
            height: 8px;
            background: #10b981;
            border-radius: 50%;
            border: 2px solid white;
          "></div>
        </div>
      `,
      className: 'custom-bus-icon',
      iconSize: [40, 30],
      iconAnchor: [20, 15],
    });
  };

  // Start GPS tracking
  const startTracking = () => {
    if (!navigator.geolocation) {
      toast({
        title: "GPS not supported",
        description: "Your browser doesn't support geolocation",
        variant: "destructive",
      });
      return;
    }

    setIsTracking(true);
    
    watchIdRef.current = navigator.geolocation.watchPosition(
      (position) => {
        const { latitude, longitude, accuracy: posAccuracy } = position.coords;
        console.log("📍 GPS Update:", latitude, longitude, "Accuracy:", posAccuracy);
        
        const newLocation = { lat: latitude, lng: longitude };
        setCurrentLocation(newLocation);
        setAccuracy(posAccuracy);

        if (mapRef.current) {
          // Update or create bus marker
          if (busMarkerRef.current) {
            busMarkerRef.current.setLatLng([latitude, longitude]);
          } else {
            busMarkerRef.current = L.marker([latitude, longitude], {
              icon: createBusIcon()
            }).addTo(mapRef.current);
          }

          // Auto-center map on bus location
          mapRef.current.setView([latitude, longitude], 16, {
            animate: true,
            duration: 1
          });
        }

        toast({
          title: "📡 GPS Updated",
          description: `Location: ${latitude.toFixed(6)}, ${longitude.toFixed(6)}`,
          duration: 2000,
        });
      },
      (error) => {
        console.error("GPS Error:", error);
        toast({
          title: "GPS Error",
          description: error.message,
          variant: "destructive",
        });
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 1000
      }
    );

    toast({
      title: "🚌 Tracking Started",
      description: "GPS tracking is now active",
    });
  };

  // Stop GPS tracking
  const stopTracking = () => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }

    setIsTracking(false);
    
    // Remove bus marker
    if (busMarkerRef.current && mapRef.current) {
      mapRef.current.removeLayer(busMarkerRef.current);
      busMarkerRef.current = null;
    }

    toast({
      title: "🛑 Tracking Stopped",
      description: "GPS tracking has been disabled",
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center">
            <MapPin className="mr-3 text-blue-600" />
            GPS Bus Tracking
          </h1>
          <p className="text-gray-600">Real-time location tracking with live map updates</p>
        </div>

        {/* Controls */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Tracking Controls</span>
              <Badge variant={isTracking ? "default" : "secondary"}>
                {isTracking ? '🟢 Active' : '🔴 Inactive'}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex space-x-4">
              {!isTracking ? (
                <Button 
                  onClick={startTracking}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <Navigation className="w-4 h-4 mr-2" />
                  Start Trip
                </Button>
              ) : (
                <Button 
                  onClick={stopTracking}
                  variant="destructive"
                >
                  <Square className="w-4 h-4 mr-2" />
                  Stop Trip
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Map Container */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Live GPS Map</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div 
              id="map" 
              className="w-full h-[500px] md:h-[600px] rounded-b-lg"
              style={{ minHeight: '400px' }}
            ></div>
          </CardContent>
        </Card>

        {/* Location Info */}
        {currentLocation && (
          <Card>
            <CardHeader>
              <CardTitle>Current Location</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-blue-900 mb-2">Latitude</h3>
                  <p className="text-2xl font-mono text-blue-700">
                    {currentLocation.lat.toFixed(6)}
                  </p>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-green-900 mb-2">Longitude</h3>
                  <p className="text-2xl font-mono text-green-700">
                    {currentLocation.lng.toFixed(6)}
                  </p>
                </div>
                <div className="bg-orange-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-orange-900 mb-2">Accuracy</h3>
                  <p className="text-2xl font-mono text-orange-700">
                    {accuracy ? `±${accuracy.toFixed(0)}m` : 'N/A'}
                  </p>
                </div>
              </div>
              <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600">
                  <strong>Last Updated:</strong> {new Date().toLocaleTimeString()}
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default GPSTracking;
