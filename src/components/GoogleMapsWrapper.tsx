import React from 'react';
import MapContainer from './MapContainer';

interface GoogleMapsWrapperProps {
  route: any;
  userType: 'driver' | 'parent' | 'admin';
  onStartTrip?: () => void;
  onStopTrip?: () => void;
  isTracking?: boolean;
  onMapClick?: (lat: number, lng: number) => void;
  driverLocation?: {lat: number, lng: number} | null;
  onBusLocationUpdate?: (location: { lat: number; lng: number }) => void;
}

const GoogleMapsWrapper: React.FC<GoogleMapsWrapperProps> = (props) => {
  // For now, we'll use a simple fallback without Google Maps wrapper
  // This allows the app to work without requiring immediate Google Maps API setup
  
  return (
    <div className="w-full h-full">
      <MapContainer {...props} />
    </div>
  );
};

export default GoogleMapsWrapper;
