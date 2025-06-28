
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Clock, Navigation, ArrowLeft, Users, Car } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Demo = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <Button 
                variant="ghost" 
                onClick={() => navigate('/')}
                className="text-blue-600 hover:text-blue-700"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <MapPin className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-xl font-bold text-gray-900">TrackMyBus Demo</h1>
            </div>
            <Button 
              onClick={() => navigate('/login')}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Try It Now
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            See TrackMyBus in Action
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Experience how our platform makes school bus tracking simple and reliable for everyone
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 mb-12">
          {/* Parent View Demo */}
          <Card className="bg-white border-blue-200">
            <CardHeader>
              <div className="flex items-center space-x-2 mb-4">
                <Users className="w-6 h-6 text-blue-600" />
                <CardTitle className="text-xl">Parent Dashboard</CardTitle>
              </div>
              <CardDescription>
                See exactly what parents and students see when tracking their bus
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Mock Bus Status */}
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="font-semibold text-gray-900">Bus A-123</h3>
                      <p className="text-sm text-gray-600">Lincoln High School - 1st Trip</p>
                    </div>
                    <Badge className="bg-green-100 text-green-700 border-green-200">
                      On Route
                    </Badge>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3">
                      <MapPin className="w-4 h-4 text-blue-600" />
                      <div>
                        <p className="text-sm font-medium">Current Location</p>
                        <p className="text-xs text-gray-600">Main Street, near City Center</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <Clock className="w-4 h-4 text-orange-600" />
                      <div>
                        <p className="text-sm font-medium">ETA</p>
                        <p className="text-xs text-gray-600">5 minutes</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <Navigation className="w-4 h-4 text-green-600" />
                      <div>
                        <p className="text-sm font-medium">Next Stop</p>
                        <p className="text-xs text-gray-600">Central Park Bus Stop</p>
                      </div>
                    </div>
                  </div>
                  
                  {/* Progress Bar */}
                  <div className="mt-4">
                    <div className="flex justify-between text-xs text-gray-600 mb-1">
                      <span>Route Progress</span>
                      <span>75%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-blue-600 h-2 rounded-full" style={{ width: '75%' }}></div>
                    </div>
                  </div>
                </div>

                {/* Mock Map */}
                <div className="h-40 bg-gradient-to-br from-blue-100 to-green-100 rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <MapPin className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                    <p className="text-sm text-gray-600">Live Map View</p>
                    <p className="text-xs text-gray-500">🚌 Bus • 🔵 Route • 🔴 Stops</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Driver View Demo */}
          <Card className="bg-white border-green-200">
            <CardHeader>
              <div className="flex items-center space-x-2 mb-4">
                <Car className="w-6 h-6 text-green-600" />
                <CardTitle className="text-xl">Driver Dashboard</CardTitle>
              </div>
              <CardDescription>
                See how drivers manage their routes and share live updates
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Trip Control */}
                <div className="bg-green-50 p-4 rounded-lg">
                  <div className="flex justify-between items-center mb-3">
                    <div>
                      <h3 className="font-semibold text-gray-900">Bus A-123</h3>
                      <p className="text-sm text-gray-600">Lincoln High School - 1st Trip</p>
                    </div>
                    <Badge className="bg-green-100 text-green-700 border-green-200">
                      In Progress
                    </Badge>
                  </div>
                  
                  <div className="flex space-x-2">
                    <Button size="sm" className="bg-red-600 hover:bg-red-700 text-xs">
                      Pause Trip
                    </Button>
                    <Button size="sm" variant="outline" className="text-xs">
                      Report Issue
                    </Button>
                  </div>
                </div>

                {/* Route Progress */}
                <div className="space-y-3">
                  <h4 className="font-medium text-gray-900">Route Progress</h4>
                  <div className="space-y-2">
                    {[
                      { name: 'School Main Gate', status: 'completed' },
                      { name: 'Central Park', status: 'current' },
                      { name: 'Shopping Mall', status: 'upcoming' },
                      { name: 'Residential Area', status: 'upcoming' }
                    ].map((stop, index) => (
                      <div key={index} className="flex items-center space-x-3">
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${
                          stop.status === 'completed' 
                            ? 'bg-green-100 text-green-700'
                            : stop.status === 'current'
                            ? 'bg-blue-100 text-blue-700'
                            : 'bg-gray-100 text-gray-500'
                        }`}>
                          {index + 1}
                        </div>
                        <div className="flex-1">
                          <p className={`text-sm ${
                            stop.status === 'current' ? 'text-blue-700 font-medium' : 'text-gray-900'
                          }`}>
                            {stop.name}
                          </p>
                        </div>
                        {stop.status === 'current' && (
                          <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-xs">
                            Arrived
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Features Overview */}
        <div className="grid md:grid-cols-3 gap-8 mb-12">
          <Card className="text-center">
            <CardContent className="p-6">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <MapPin className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Real-Time Tracking</h3>
              <p className="text-sm text-gray-600">
                GPS-based live location updates every few seconds
              </p>
            </CardContent>
          </Card>
          
          <Card className="text-center">
            <CardContent className="p-6">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Multi-User Access</h3>
              <p className="text-sm text-gray-600">
                Separate dashboards for parents and drivers
              </p>
            </CardContent>
          </Card>
          
          <Card className="text-center">
            <CardContent className="p-6">
              <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Navigation className="w-6 h-6 text-orange-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Route Guidance</h3>
              <p className="text-sm text-gray-600">
                Complete route maps for new or backup drivers
              </p>
            </CardContent>
          </Card>
        </div>

        {/* CTA */}
        <div className="text-center bg-blue-600 rounded-xl p-8 text-white">
          <h3 className="text-2xl font-bold mb-4">Ready to Start Tracking?</h3>
          <p className="text-lg mb-6 text-blue-100">
            Join schools across the country using TrackMyBus for reliable transportation
          </p>
          <Button 
            size="lg" 
            onClick={() => navigate('/login')}
            className="bg-white text-blue-600 hover:bg-gray-100 text-lg px-8 py-3"
          >
            Get Started Now
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Demo;
