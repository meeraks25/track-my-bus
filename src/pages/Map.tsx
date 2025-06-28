
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin, ArrowLeft, Navigation, Maximize2 } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Map = () => {
  const navigate = useNavigate();
  const userType = localStorage.getItem('userType');

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <Button 
                variant="ghost" 
                onClick={() => navigate(userType === 'driver' ? '/driver-dashboard' : '/parent-dashboard')}
                className="text-blue-600 hover:text-blue-700"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
              </Button>
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <MapPin className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-xl font-bold text-gray-900">Live Map</h1>
            </div>
            <Button variant="outline" className="text-gray-600">
              <Maximize2 className="w-4 h-4 mr-2" />
              Fullscreen
            </Button>
          </div>
        </div>
      </header>

      <div className="flex-1 p-4">
        <div className="max-w-7xl mx-auto">
          <Card className="h-[calc(100vh-120px)]">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center justify-between">
                <span>Bus Route & Live Location</span>
                <div className="flex items-center space-x-4 text-sm">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                    <span>Bus Location</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                    <span>Route</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                    <span>Bus Stops</span>
                  </div>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="h-full pb-6">
              <div className="h-full bg-gradient-to-br from-blue-100 via-green-100 to-yellow-100 rounded-lg relative overflow-hidden">
                {/* Map Placeholder with Interactive Demo */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <Navigation className="w-16 h-16 text-blue-600 mx-auto mb-6" />
                    <h3 className="text-2xl font-bold text-gray-900 mb-4">Interactive Map View</h3>
                    <p className="text-gray-600 mb-6 max-w-md">
                      This is where the live Google Maps integration would show:<br/>
                      • Real-time bus location (🚌)<br/>
                      • Complete route path (blue line)<br/>
                      • All bus stops (red dots)<br/>
                      • Turn-by-turn navigation for drivers
                    </p>
                    <div className="bg-white/80 backdrop-blur-sm rounded-lg p-4 max-w-sm mx-auto">
                      <p className="text-sm text-gray-700 mb-3">
                        <strong>Technical Implementation:</strong>
                      </p>
                      <ul className="text-xs text-gray-600 text-left space-y-1">
                        <li>• Google Maps JavaScript API</li>
                        <li>• Real-time GPS tracking</li>
                        <li>• WebSocket connections</li>
                        <li>• Geolocation API</li>
                        <li>• Firebase for live updates</li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Simulated Map Elements */}
                <div className="absolute top-4 left-4 bg-white rounded-lg p-3 shadow-lg">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-yellow-500 rounded-full animate-pulse"></div>
                    <span className="text-sm font-medium">Bus A-123</span>
                  </div>
                  <p className="text-xs text-gray-600 mt-1">Speed: 25 mph</p>
                </div>

                <div className="absolute top-4 right-4 bg-white rounded-lg p-3 shadow-lg">
                  <div className="text-sm">
                    <p className="font-medium">Next Stop</p>
                    <p className="text-gray-600">Central Park</p>
                    <p className="text-xs text-gray-500">ETA: 5 mins</p>
                  </div>
                </div>

                <div className="absolute bottom-4 left-4 bg-white rounded-lg p-3 shadow-lg">
                  <div className="text-sm">
                    <p className="font-medium">Route Progress</p>
                    <div className="w-32 bg-gray-200 rounded-full h-2 mt-2">
                      <div className="bg-blue-600 h-2 rounded-full" style={{ width: '65%' }}></div>
                    </div>
                    <p className="text-xs text-gray-600 mt-1">65% Complete</p>
                  </div>
                </div>

                {/* Simulated route line */}
                <svg className="absolute inset-0 w-full h-full pointer-events-none">
                  <defs>
                    <linearGradient id="routeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.8" />
                      <stop offset="100%" stopColor="#1D4ED8" stopOpacity="0.8" />
                    </linearGradient>
                  </defs>
                  <path
                    d="M 100 200 Q 200 100 300 150 Q 400 200 500 180 Q 600 160 700 200"
                    stroke="url(#routeGradient)"
                    strokeWidth="4"
                    fill="none"
                    strokeDasharray="10,5"
                    className="animate-pulse"
                  />
                  {/* Bus stops */}
                  <circle cx="100" cy="200" r="6" fill="#EF4444" />
                  <circle cx="300" cy="150" r="6" fill="#EF4444" />
                  <circle cx="500" cy="180" r="6" fill="#EF4444" />
                  <circle cx="700" cy="200" r="6" fill="#EF4444" />
                  {/* Bus location */}
                  <circle cx="400" cy="200" r="8" fill="#EAB308" className="animate-pulse" />
                </svg>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Map;
