import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin, Clock, Shield, Users, School, Plus, Phone, ArrowRight, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Index = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: MapPin,
      title: "Live Bus Tracking",
      description: "See your bus location in real-time on an interactive map with precision accuracy",
      color: "bg-gradient-to-br from-blue-100 to-cyan-100 text-blue-600",
      glow: "group-hover:shadow-blue-200"
    },
    {
      icon: Clock,
      title: "Smart Route Planning", 
      description: "AI-powered route optimization with real-time traffic updates and timing",
      color: "bg-gradient-to-br from-green-100 to-emerald-100 text-green-600",
      glow: "group-hover:shadow-green-200"
    },
    {
      icon: Shield,
      title: "Enterprise Security",
      description: "Military-grade encryption with role-based access control and audit trails",
      color: "bg-gradient-to-br from-purple-100 to-violet-100 text-purple-600",
      glow: "group-hover:shadow-purple-200"
    },
    {
      icon: Users,
      title: "Multi-Stakeholder Hub",
      description: "Unified platform connecting parents, students, drivers, and administrators",
      color: "bg-gradient-to-br from-orange-100 to-amber-100 text-orange-600",
      glow: "group-hover:shadow-orange-200"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 overflow-x-hidden relative">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-purple-600/20 rounded-full mix-blend-multiply filter blur-xl animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-purple-400/20 to-pink-600/20 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-2000"></div>
        <div className="absolute top-40 left-40 w-80 h-80 bg-gradient-to-br from-cyan-400/20 to-blue-600/20 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-4000"></div>
      </div>

      {/* Header */}
      <header className="bg-white/70 backdrop-blur-xl shadow-lg border-b border-white/20 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center space-x-3 animate-fade-in">
              <div className="relative w-12 h-12 bg-gradient-to-br from-blue-600 via-purple-600 to-cyan-600 rounded-2xl flex items-center justify-center shadow-2xl transform hover:scale-110 transition-all duration-300">
                <MapPin className="w-7 h-7 text-white" />
                <div className="absolute inset-0 bg-gradient-to-br from-blue-400/50 to-purple-400/50 rounded-2xl blur animate-pulse"></div>
              </div>
              <div>
                <h1 className="text-3xl font-black bg-gradient-to-r from-blue-600 via-purple-600 to-cyan-600 bg-clip-text text-transparent">
                  TrackMyBus
                </h1>
                <p className="text-xs font-medium text-gray-500 -mt-1">Smart Transportation</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Button 
                onClick={() => navigate('/admin')}
                variant="outline"
                className="border-2 border-purple-200/50 text-purple-600 hover:bg-purple-50 backdrop-blur-sm bg-white/50 font-semibold transition-all duration-300 hover:scale-105 hover:shadow-lg"
              >
                <Shield className="w-4 h-4 mr-2" />
                Admin
              </Button>
              <Button 
                onClick={() => navigate('/login')}
                className="bg-gradient-to-r from-blue-600 via-purple-600 to-cyan-600 hover:from-blue-700 hover:via-purple-700 hover:to-cyan-700 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 font-semibold px-6"
              >
                <Sparkles className="w-4 h-4 mr-2" />
                Get Started
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div className="animate-fade-in space-y-8">
            <div className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full text-sm font-semibold text-blue-700 border border-blue-200/50 backdrop-blur-sm">
              <Sparkles className="w-4 h-4 mr-2" />
              Next-Gen School Transportation
            </div>
            <h2 className="text-6xl md:text-7xl font-black text-gray-900 leading-tight">
              Never Miss Your
              <span className="block bg-gradient-to-r from-blue-600 via-purple-600 to-cyan-600 bg-clip-text text-transparent">
                School Bus
              </span> 
              <span className="block text-5xl md:text-6xl">Again</span>
            </h2>
            <p className="text-xl text-gray-600 leading-relaxed max-w-xl">
              Revolutionary real-time school bus tracking powered by AI. 
              Connect parents, students, and drivers with military-grade precision and enterprise security.
            </p>
            <div className="flex flex-col sm:flex-row gap-6">
              <Button 
                size="lg"
                onClick={() => navigate('/login')}
                className="bg-gradient-to-r from-blue-600 via-purple-600 to-cyan-600 hover:from-blue-700 hover:via-purple-700 hover:to-cyan-700 shadow-2xl hover:shadow-blue-500/25 transition-all duration-500 hover:scale-105 text-lg px-10 py-7 rounded-2xl font-bold"
              >
                <Sparkles className="w-5 h-5 mr-3" />
                Launch Experience
                <ArrowRight className="w-5 h-5 ml-3" />
              </Button>
              <Button 
                size="lg"
                variant="outline"
                onClick={() => navigate('/demo')}
                className="border-2 border-gray-200 hover:bg-white/80 text-lg px-10 py-7 rounded-2xl font-semibold backdrop-blur-sm bg-white/50 hover:shadow-xl transition-all duration-300 hover:scale-105"
              >
                <MapPin className="w-5 h-5 mr-3" />
                View Live Demo
              </Button>
            </div>
          </div>
          
          {/* Enhanced School Bus Image */}
          <div className="animate-slide-up">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-400 via-purple-400 to-cyan-400 rounded-3xl blur-3xl opacity-30 transform rotate-6 animate-pulse"></div>
              <div className="relative bg-gradient-to-br from-white to-gray-50 rounded-3xl p-8 shadow-2xl backdrop-blur-xl border border-white/20">
                <img 
                  src="https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2069&q=80"
                  alt="Smart School Bus"
                  className="relative rounded-2xl shadow-xl w-full h-auto transform hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute -bottom-6 -right-6 w-28 h-28 bg-gradient-to-br from-yellow-400 via-orange-400 to-red-400 rounded-full flex items-center justify-center shadow-2xl animate-bounce border-4 border-white">
                  <MapPin className="w-14 h-14 text-white" />
                </div>
                <div className="absolute -top-4 -left-4 w-20 h-20 bg-gradient-to-br from-green-400 to-blue-400 rounded-full flex items-center justify-center shadow-xl animate-pulse border-4 border-white">
                  <Shield className="w-10 h-10 text-white" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Enhanced Features Grid */}
      <section className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="text-center mb-20">
          <div className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-purple-100 to-blue-100 rounded-full text-sm font-semibold text-purple-700 border border-purple-200/50 backdrop-blur-sm mb-6">
            <Sparkles className="w-4 h-4 mr-2" />
            Advanced Features
          </div>
          <h3 className="text-5xl font-black text-gray-900 mb-6">
            Everything You Need for
            <span className="block bg-gradient-to-r from-blue-600 via-purple-600 to-cyan-600 bg-clip-text text-transparent">
              Safe Transportation
            </span>
          </h3>
          <p className="text-xl text-gray-600 max-w-4xl mx-auto leading-relaxed">
            Our AI-powered comprehensive tracking system provides unparalleled peace of mind for parents 
            and revolutionary efficiency for educational institutions.
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <Card 
              key={index}
              className={`group hover:shadow-2xl ${feature.glow} transition-all duration-500 hover:-translate-y-4 border-0 bg-white/80 backdrop-blur-xl animate-fade-in relative overflow-hidden`}
              style={{ animationDelay: `${index * 0.15}s` }}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-white/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <CardHeader className="text-center pb-6 relative z-10">
                <div className={`w-20 h-20 mx-auto rounded-2xl ${feature.color} flex items-center justify-center mb-6 group-hover:scale-110 transition-all duration-500 shadow-xl`}>
                  <feature.icon className="w-10 h-10" />
                </div>
                <CardTitle className="text-xl font-bold text-gray-900 group-hover:text-gray-800 transition-colors duration-300">
                  {feature.title}
                </CardTitle>
              </CardHeader>
              <CardContent className="relative z-10">
                <CardDescription className="text-gray-600 text-center leading-relaxed">
                  {feature.description}
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Enhanced For Schools Section */}
      <section className="relative bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 py-24 overflow-hidden">
        <div className="absolute inset-0 opacity-20" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='7' cy='7' r='1'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
        }}></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center text-white mb-20">
            <div className="inline-flex items-center px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full text-sm font-semibold text-white border border-white/20 mb-6">
              <School className="w-4 h-4 mr-2" />
              For Educational Leaders
            </div>
            <h3 className="text-5xl font-black mb-6">Administrative Excellence</h3>
            <p className="text-xl opacity-90 max-w-4xl mx-auto leading-relaxed">
              Comprehensive management suite designed to revolutionize your entire school transportation ecosystem 
              with enterprise-grade tools and insights.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { icon: School, title: "Multi-School Management", desc: "Unified dashboard for entire district operations with real-time analytics" },
              { icon: Plus, title: "Fleet Intelligence", desc: "AI-powered bus management with predictive maintenance and optimization" },
              { icon: Phone, title: "Smart Driver Hub", desc: "Advanced driver assignment with performance metrics and communication tools" },
              { icon: MapPin, title: "Route Optimization", desc: "Machine learning route planning with traffic analysis and efficiency insights" }
            ].map((item, index) => (
              <div 
                key={index}
                className="bg-white/10 backdrop-blur-xl rounded-2xl p-8 text-white hover:bg-white/20 transition-all duration-500 border border-white/10 hover:scale-105 hover:shadow-2xl group"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="w-16 h-16 bg-gradient-to-br from-white/20 to-white/10 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <item.icon className="w-8 h-8" />
                </div>
                <h4 className="text-xl font-bold mb-4">{item.title}</h4>
                <p className="opacity-90 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
          
          <div className="text-center mt-16">
            <Button 
              size="lg"
              onClick={() => navigate('/admin')}
              className="bg-white text-blue-900 hover:bg-gray-100 shadow-2xl hover:shadow-white/20 transition-all duration-500 hover:scale-105 text-lg px-10 py-7 rounded-2xl font-bold"
            >
              <Shield className="w-5 h-5 mr-3" />
              Access Admin Portal
              <ArrowRight className="w-5 h-5 ml-3" />
            </Button>
          </div>
        </div>
      </section>

      {/* Enhanced Footer */}
      <footer className="bg-gradient-to-br from-gray-900 via-slate-800 to-gray-900 text-white py-16 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-purple-600/10"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex items-center justify-center space-x-3 mb-6">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-600 via-purple-600 to-cyan-600 rounded-2xl flex items-center justify-center shadow-xl">
              <MapPin className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-black bg-gradient-to-r from-blue-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
                TrackMyBus
              </h1>
              <p className="text-xs text-gray-400 -mt-1">Smart Transportation Platform</p>
            </div>
          </div>
          <p className="text-gray-400 text-lg">Making school transportation safer, smarter, and more efficient than ever before.</p>
          <div className="mt-8 text-sm text-gray-500">
            © 2024 TrackMyBus. Powered by next-generation technology.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
