import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MapPin, Plus, Trash2, School, Users, ArrowLeft, Save } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import GoogleMapsWrapper from "@/components/GoogleMapsWrapper";
import { set, ref, database } from '@/lib/firebase';
import { remove } from 'firebase/database';

interface BusStop {
  id: string;
  name: string;
  lat: number;
  lng: number;
}

interface BusRoute {
  id: string;
  schoolName: string;
  busName: string;
  tripNumber: string;
  driverName: string;
  driverPhone: string;
  stops: BusStop[];
  routePath: { lat: number; lng: number }[];
}

const Admin = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [formData, setFormData] = useState({
    schoolName: '',
    busName: '',
    tripNumber: '',
    driverName: '',
    driverPhone: ''
  });
  
  const [stops, setStops] = useState<BusStop[]>([]);
  const [routes, setRoutes] = useState<BusRoute[]>([]);
  const [showMapSelection, setShowMapSelection] = useState(false);
  const [editingStopId, setEditingStopId] = useState<string | null>(null);
  const [editingStopName, setEditingStopName] = useState('');

  React.useEffect(() => {
    // Load existing routes from localStorage
    const savedRoutes = JSON.parse(localStorage.getItem('busRoutes') || '[]');
    setRoutes(savedRoutes);
  }, []);

  const handleFormSubmit = () => {
    if (!formData.schoolName || !formData.busName || !formData.tripNumber || 
        !formData.driverName || !formData.driverPhone) {
      toast({
        title: "Missing information",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    setShowMapSelection(true);
    toast({
      title: "Bus details saved",
      description: "Now click on the map to add bus stops"
    });
  };

  const handleMapClick = (lat: number, lng: number) => {
    const stopName = `Stop ${stops.length + 1}`;
    const newStop: BusStop = {
      id: Date.now().toString(),
      name: stopName,
      lat,
      lng
    };

    setStops([...stops, newStop]);
    toast({
      title: "Stop added",
      description: `${stopName} added at coordinates (${lat.toFixed(4)}, ${lng.toFixed(4)})`
    });
  };

  const handleRemoveStop = (stopId: string) => {
    setStops(stops.filter(stop => stop.id !== stopId));
    toast({
      title: "Stop removed",
      description: "Bus stop has been removed"
    });
  };

  const handleEditStopName = (stopId: string, currentName: string) => {
    setEditingStopId(stopId);
    setEditingStopName(currentName);
  };

  const handleSaveStopName = () => {
    if (!editingStopName.trim()) return;
    
    setStops(stops.map(stop => 
      stop.id === editingStopId 
        ? { ...stop, name: editingStopName }
        : stop
    ));
    setEditingStopId(null);
    setEditingStopName('');
  };

  const handleSaveRoute = () => {
    if (stops.length < 2) {
      toast({
        title: "Insufficient stops",
        description: "Please add at least 2 bus stops",
        variant: "destructive"
      });
      return;
    }

    // Create route path from stops
    const routePath = stops.map(stop => ({ lat: stop.lat, lng: stop.lng }));

    const newRoute: BusRoute = {
      id: crypto.randomUUID(),
      ...formData,
      stops,
      routePath
    };

    const updatedRoutes = [...routes, newRoute];
    setRoutes(updatedRoutes);
    localStorage.setItem('busRoutes', JSON.stringify(updatedRoutes));

    // Reset form
    setFormData({
      schoolName: '',
      busName: '',
      tripNumber: '',
      driverName: '',
      driverPhone: ''
    });
    setStops([]);
    setShowMapSelection(false);

    toast({
      title: "Route saved successfully",
      description: `Bus ${formData.busName} for ${formData.schoolName} has been added with ${stops.length} stops`
    });

    // Update Firebase
    set(ref(database, `/routes/${newRoute.id}`), {
      driverName: newRoute.driverName,
      driverPhone: newRoute.driverPhone,
      stops: newRoute.stops.map(stop => ({
        id: stop.id,
        name: stop.name,
        lat: stop.lat,
        lng: stop.lng
      })),
      routePath: newRoute.routePath
    });

    // Create a bus entry with the same id as the route
    set(ref(database, `/buses/${newRoute.id}`), {
      busName: newRoute.busName,
      location: { latitude: newRoute.stops[0].lat, longitude: newRoute.stops[0].lng, timestamp: 0 },
      isActive: false,
      path: []
    });
  };

  const handleDeleteRoute = (routeId: string) => {
    const updatedRoutes = routes.filter(route => route.id !== routeId);
    setRoutes(updatedRoutes);
    localStorage.setItem('busRoutes', JSON.stringify(updatedRoutes));
    
    toast({
      title: "Route deleted",
      description: "The bus route has been removed"
    });

    // Update Firebase
    remove(ref(database, `/routes/${routeId}`));
    // Also remove the corresponding bus entry
    remove(ref(database, `/buses/${routeId}`));
  };

  const handleCancelMapSelection = () => {
    setShowMapSelection(false);
    setStops([]);
  };

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
                Back to Home
              </Button>
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <School className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-xl font-bold text-gray-900">Admin Panel</h1>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {!showMapSelection ? (
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Add New Bus Route Form */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Plus className="w-5 h-5" />
                    <span>Add New Bus Route</span>
                  </CardTitle>
                  <CardDescription>Enter bus details and then select stops on the map</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="schoolName">School Name</Label>
                    <Input
                      id="schoolName"
                      value={formData.schoolName}
                      onChange={(e) => setFormData({...formData, schoolName: e.target.value})}
                      placeholder="Enter school name"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="busName">Bus Name/Number</Label>
                      <Input
                        id="busName"
                        value={formData.busName}
                        onChange={(e) => setFormData({...formData, busName: e.target.value})}
                        placeholder="e.g., Bus A-123"
                      />
                    </div>
                    <div>
                      <Label htmlFor="tripNumber">Trip Number</Label>
                      <Select value={formData.tripNumber} onValueChange={(value) => setFormData({...formData, tripNumber: value})}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select trip" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1st-trip">1st Trip</SelectItem>
                          <SelectItem value="2nd-trip">2nd Trip</SelectItem>
                          <SelectItem value="3rd-trip">3rd Trip</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="driverName">Driver Name</Label>
                      <Input
                        id="driverName"
                        value={formData.driverName}
                        onChange={(e) => setFormData({...formData, driverName: e.target.value})}
                        placeholder="Enter driver name"
                      />
                    </div>
                    <div>
                      <Label htmlFor="driverPhone">Driver Phone</Label>
                      <Input
                        id="driverPhone"
                        value={formData.driverPhone}
                        onChange={(e) => setFormData({...formData, driverPhone: e.target.value})}
                        placeholder="Enter phone number"
                      />
                    </div>
                  </div>

                  <Button 
                    onClick={handleFormSubmit}
                    className="w-full bg-blue-600 hover:bg-blue-700"
                  >
                    Continue to Map Selection
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Existing Routes */}
            <div>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Users className="w-5 h-5" />
                    <span>Existing Bus Routes</span>
                  </CardTitle>
                  <CardDescription>Manage all registered buses and routes</CardDescription>
                </CardHeader>
                <CardContent>
                  {routes.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <School className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                      <p>No bus routes added yet</p>
                      <p className="text-sm">Create your first route using the form on the left</p>
                    </div>
                  ) : (
                    <div className="space-y-4 max-h-96 overflow-y-auto">
                      {routes.map((route) => (
                        <div key={route.id} className="border border-gray-200 rounded-lg p-4">
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <h3 className="font-bold text-lg">{route.busName}</h3>
                              <p className="text-gray-600">{route.schoolName}</p>
                              <p className="text-sm text-gray-500">{route.tripNumber}</p>
                            </div>
                            <Button 
                              variant="destructive" 
                              size="sm"
                              onClick={() => handleDeleteRoute(route.id)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                          <div className="text-sm space-y-1">
                            <p><span className="font-medium">Driver:</span> {route.driverName}</p>
                            <p><span className="font-medium">Phone:</span> {route.driverPhone}</p>
                            <p><span className="font-medium">Stops:</span> {route.stops.length}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        ) : (
          /* Map Selection View */
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <MapPin className="w-5 h-5" />
                    <span>Select Bus Stops for {formData.busName}</span>
                  </div>
                  <Button 
                    variant="outline" 
                    onClick={handleCancelMapSelection}
                  >
                    Cancel
                  </Button>
                </CardTitle>
                <CardDescription>
                  Click on the map to add bus stops. You need at least 2 stops to create a route.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid lg:grid-cols-3 gap-6">
                  {/* Map */}
                  <div className="lg:col-span-2">
                    <div className="h-96 border rounded-lg overflow-hidden">
                      <GoogleMapsWrapper
                        route={{
                          schoolName: formData.schoolName,
                          busName: formData.busName,
                          tripNumber: formData.tripNumber,
                          driverName: formData.driverName,
                          driverPhone: formData.driverPhone,
                          stops,
                          routePath: []
                        }}
                        userType="admin"
                        onMapClick={handleMapClick}
                      />
                    </div>
                  </div>

                  {/* Stops List */}
                  <div>
                    <h3 className="font-medium mb-4">Added Stops ({stops.length})</h3>
                    {stops.length === 0 ? (
                      <p className="text-gray-500 text-sm">Click on the map to add stops</p>
                    ) : (
                      <div className="space-y-2 max-h-64 overflow-y-auto">
                        {stops.map((stop, index) => (
                          <div key={stop.id} className="border rounded-lg p-3">
                            <div className="flex items-center justify-between mb-2">
                              <span className="w-6 h-6 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                                {index + 1}
                              </span>
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => handleRemoveStop(stop.id)}
                              >
                                <Trash2 className="w-3 h-3 text-red-500" />
                              </Button>
                            </div>
                            {editingStopId === stop.id ? (
                              <div className="space-y-2">
                                <Input
                                  value={editingStopName}
                                  onChange={(e) => setEditingStopName(e.target.value)}
                                  onKeyPress={(e) => e.key === 'Enter' && handleSaveStopName()}
                                  className="text-xs"
                                />
                                <div className="flex space-x-1">
                                  <Button size="sm" onClick={handleSaveStopName} className="text-xs">
                                    Save
                                  </Button>
                                  <Button 
                                    size="sm" 
                                    variant="outline" 
                                    onClick={() => setEditingStopId(null)}
                                    className="text-xs"
                                  >
                                    Cancel
                                  </Button>
                                </div>
                              </div>
                            ) : (
                              <div>
                                <p 
                                  className="font-medium text-sm cursor-pointer hover:text-blue-600"
                                  onClick={() => handleEditStopName(stop.id, stop.name)}
                                >
                                  {stop.name}
                                </p>
                                <p className="text-xs text-gray-500">
                                  {stop.lat.toFixed(4)}, {stop.lng.toFixed(4)}
                                </p>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}

                    {stops.length >= 2 && (
                      <Button 
                        onClick={handleSaveRoute}
                        className="w-full mt-4 bg-green-600 hover:bg-green-700"
                      >
                        <Save className="w-4 h-4 mr-2" />
                        Save Route ({stops.length} stops)
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default Admin;
