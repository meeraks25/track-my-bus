import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MapPin, Users, Car, School, AlertCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

const Login = () => {
  const [userType, setUserType] = useState<'parent' | 'driver' | ''>('');
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    schoolName: '',
    busName: '',
    trip: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    if (!userType) {
      toast({
        title: "Please select user type",
        description: "Choose whether you're a parent or driver",
        variant: "destructive"
      });
      setIsLoading(false);
      return;
    }

    if (!formData.name || !formData.phone || !formData.schoolName || !formData.busName || !formData.trip) {
      toast({
        title: "Please fill all fields",
        description: "All fields are required to continue",
        variant: "destructive"
      });
      setIsLoading(false);
      return;
    }

    // Get saved routes from localStorage
    const savedRoutes = JSON.parse(localStorage.getItem('busRoutes') || '[]');
    
    // Find matching route
    const matchingRoute = savedRoutes.find((route: any) => 
      route.schoolName.toLowerCase() === formData.schoolName.toLowerCase() &&
      route.busName.toLowerCase() === formData.busName.toLowerCase() &&
      route.tripNumber === formData.trip
    );

    if (!matchingRoute) {
      toast({
        title: "Route not found",
        description: `No route found for ${formData.busName} (${formData.trip}) at ${formData.schoolName}. Please check with your school administrator.`,
        variant: "destructive"
      });
      setIsLoading(false);
      return;
    }

    // For drivers, verify name and phone match
    if (userType === 'driver') {
      if (matchingRoute.driverName.toLowerCase() !== formData.name.toLowerCase() || 
          matchingRoute.driverPhone !== formData.phone) {
        toast({
          title: "Driver verification failed",
          description: "Name or phone number doesn't match our records. Only authorized drivers can access this bus.",
          variant: "destructive"
        });
        setIsLoading(false);
        return;
      }
    }

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Store user info and route data
    localStorage.setItem('userType', userType);
    localStorage.setItem('userInfo', JSON.stringify(formData));
    localStorage.setItem('currentRoute', JSON.stringify(matchingRoute));

    toast({
      title: "Login successful!",
      description: `Welcome ${formData.name}! Redirecting to your dashboard...`,
    });

    // Navigate based on user type
    setTimeout(() => {
      if (userType === 'driver') {
        navigate('/driver-dashboard');
      } else {
        navigate('/parent-dashboard');
      }
    }, 1000);

    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-blue-100 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated Background */}
      <div 
        className="absolute inset-0 opacity-50"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%236366f1' fill-opacity='0.05'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
        }}
      />
      
      {/* Header */}
      <div className="absolute top-4 left-4">
        <Button 
          variant="ghost" 
          onClick={() => navigate('/')}
          className="text-blue-600 hover:text-blue-700 hover:bg-white/50 backdrop-blur-sm"
        >
          ← Back to Home
        </Button>
      </div>

      <div className="w-full max-w-md relative z-10">
        <Card className="shadow-2xl border-0 bg-white/90 backdrop-blur-sm animate-fade-in">
          <CardHeader className="text-center pb-4">
            <div className="flex items-center justify-center space-x-2 mb-6">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                <MapPin className="w-7 h-7 text-white" />
              </div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">TrackMyBus</h1>
            </div>
            <CardTitle className="text-2xl text-gray-900">Login to Your Account</CardTitle>
            <CardDescription className="text-gray-600">Choose your role and enter your details</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* User Type Selection */}
              <div className="space-y-3">
                <Label htmlFor="userType" className="text-base font-medium">I am a:</Label>
                <div className="grid grid-cols-2 gap-3">
                  <Button
                    type="button"
                    variant={userType === 'parent' ? 'default' : 'outline'}
                    onClick={() => setUserType('parent')}
                    className={`h-24 flex-col space-y-2 transition-all duration-300 ${
                      userType === 'parent' 
                        ? 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg scale-105' 
                        : 'border-blue-200 hover:bg-blue-50 hover:border-blue-300'
                    }`}
                  >
                    <Users className="w-7 h-7" />
                    <span className="font-medium">Parent</span>
                  </Button>
                  <Button
                    type="button"
                    variant={userType === 'driver' ? 'default' : 'outline'}
                    onClick={() => setUserType('driver')}
                    className={`h-24 flex-col space-y-2 transition-all duration-300 ${
                      userType === 'driver' 
                        ? 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg scale-105' 
                        : 'border-blue-200 hover:bg-blue-50 hover:border-blue-300'
                    }`}
                  >
                    <Car className="w-7 h-7" />
                    <span className="font-medium">Driver</span>
                  </Button>
                </div>
              </div>

              {/* Form Fields */}
              <div className="space-y-5">
                <div>
                  <Label htmlFor="name" className="text-base font-medium">Full Name</Label>
                  <Input
                    id="name"
                    type="text"
                    placeholder="Enter your full name"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="mt-2 h-12 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <Label htmlFor="phone" className="text-base font-medium">Phone Number</Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="Enter your phone number"
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    className="mt-2 h-12 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <Label htmlFor="school" className="text-base font-medium flex items-center space-x-2">
                    <School className="w-4 h-4" />
                    <span>School Name</span>
                  </Label>
                  <Input
                    id="school"
                    type="text"
                    placeholder="Enter school name"
                    value={formData.schoolName}
                    onChange={(e) => setFormData({...formData, schoolName: e.target.value})}
                    className="mt-2 h-12 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <Label htmlFor="bus" className="text-base font-medium">Bus Name/Number</Label>
                  <Input
                    id="bus"
                    type="text"
                    placeholder="Enter bus name or number"
                    value={formData.busName}
                    onChange={(e) => setFormData({...formData, busName: e.target.value})}
                    className="mt-2 h-12 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <Label htmlFor="trip" className="text-base font-medium">Trip</Label>
                  <Select value={formData.trip} onValueChange={(value) => setFormData({...formData, trip: value})}>
                    <SelectTrigger className="mt-2 h-12 border-gray-300 focus:border-blue-500 focus:ring-blue-500">
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

              {userType === 'driver' && (
                <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <div className="flex items-start space-x-2">
                    <AlertCircle className="w-4 h-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                    <div className="text-sm text-yellow-700">
                      <p className="font-medium mb-1">Driver Verification Required</p>
                      <p className="text-xs">Your name and phone number must match our records for this bus route.</p>
                    </div>
                  </div>
                </div>
              )}

              <Button 
                type="submit"
                disabled={isLoading}
                className="w-full h-14 text-lg font-bold bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all duration-300"
              >
                {isLoading ? 'Verifying...' : 'Login to Dashboard'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Login;
