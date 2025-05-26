import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from '@/components/ui/use-toast';
import { User, Mail, Key, Save, ArrowLeft } from "lucide-react";
import { Link } from 'react-router-dom';

export default function Profile() {
  const { user, logout } = useAuth();
  const { toast } = useToast();
  
  const [formData, setFormData] = useState({
    name: user?.name || 'Lugano Abel',
    email: user?.email || 'lugano.ngulwa@gmail.com',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [isEditing, setIsEditing] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Password validation
    if (formData.newPassword) {
      if (formData.newPassword !== formData.confirmPassword) {
        toast({
          title: "Error",
          description: "New passwords don't match",
          variant: "destructive"
        });
        return;
      }
      
      if (!formData.currentPassword) {
        toast({
          title: "Error",
          description: "Current password is required",
          variant: "destructive"
        });
        return;
      }
    }
    
    try {
      // Prepare the request payload according to the expected structure
      const payload: any = {};
      
      // Only include fields that have changed
      if (formData.name !== user?.name) {
        payload.name = formData.name;
      }
      
      // Only include password fields if user is changing password
      if (formData.newPassword) {
        payload.current_password = formData.currentPassword;
        payload.new_password = formData.newPassword;
      }
      
      // Only proceed if there are changes to submit
      if (Object.keys(payload).length === 0) {
        toast({
          title: "Info",
          description: "No changes to update"
        });
        setIsEditing(false);
        return;
      }
      
      // Make the API call to update profile
      const response = await fetch('http://localhost:5055/auth/users/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user?.token}`
        },
        body: JSON.stringify(payload)
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update profile');
      }
      
      // Update local user data if name was changed
      if (payload.name && user) {
        const updatedUser = {
          ...user,
          name: payload.name
        };
        localStorage.setItem('kuku_user', JSON.stringify(updatedUser));
      }
      
      toast({
        title: "Success",
        description: "Profile updated successfully"
      });
      
      // Clear password fields
      setFormData(prev => ({
        ...prev,
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      }));
      
      setIsEditing(false);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || 'Failed to update profile',
        variant: "destructive"
      });
      console.error('Error updating profile:', error);
    }
  };

  // Calculate initials for the avatar
  const getInitials = () => {
    const nameParts = formData.name.split(' ');
    return `${nameParts[0][0]}${nameParts[1]?.[0] || ''}`;
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-white shadow-sm py-5 border-b border-gray-200 sticky top-0 z-10">
        <div className="container mx-auto px-4 sm:px-6 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900 flex items-center">
            <img src="/chicken.png" alt="Kuku Farm Logo" className="h-8 w-8 mr-3" />
            Kuku Farm
          </h1>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={logout}
            className="border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Logout
          </Button>
        </div>
      </header>

      <main className="container mx-auto py-8 sm:py-10 px-4 sm:px-6 flex-grow">
        <div className="mb-6">
          <Link to="/">
            <Button variant="ghost" className="pl-0 text-gray-600 hover:text-gray-900">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Dashboard
            </Button>
          </Link>
        </div>
        
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Profile Settings</h2>
          
          <div className="flex flex-col md:flex-row gap-6">
            {/* Profile Avatar */}
            <div className="w-full md:w-1/3">
              <Card className="border border-gray-200 shadow-md bg-white rounded-xl overflow-hidden">
                <CardContent className="pt-6 flex flex-col items-center">
                  <div className="h-32 w-32 rounded-full bg-gray-300 text-gray-700 flex items-center justify-center mb-4">
                    <span className="text-4xl font-medium">{getInitials()}</span>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">{formData.name}</h3>
                  <p className="text-sm text-gray-500">{formData.email}</p>
                  
                  <Button 
                    variant="outline" 
                    className="mt-6 w-full border-gray-300"
                    onClick={() => setIsEditing(!isEditing)}
                  >
                    {isEditing ? 'Cancel Editing' : 'Edit Profile'}
                  </Button>
                </CardContent>
              </Card>
            </div>
            
            {/* Profile Form */}
            <div className="w-full md:w-2/3">
              <Card className="border border-gray-200 shadow-md bg-white rounded-xl overflow-hidden">
                <CardHeader className="pb-4 bg-gray-50 border-b border-gray-200">
                  <CardTitle className="text-xl font-bold text-gray-900">Account Information</CardTitle>
                  <CardDescription>
                    Update your account details and password
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-6">
                  <form onSubmit={handleSubmit}>
                    <div className="space-y-6">
                      <div className="space-y-4">
                        <h3 className="text-sm font-medium text-gray-900 flex items-center">
                          <User className="mr-2 h-4 w-4 text-gray-500" />
                          Personal Information
                        </h3>
                        
                        <div className="grid gap-4">
                          <div className="grid gap-2">
                            <Label htmlFor="name">Full Name</Label>
                            <Input 
                              id="name" 
                              name="name" 
                              value={formData.name} 
                              onChange={handleChange} 
                              disabled={!isEditing}
                              className="bg-white"
                            />
                          </div>
                          
                          <div className="grid gap-2">
                            <Label htmlFor="email">Email Address</Label>
                            <Input 
                              id="email" 
                              name="email" 
                              type="email" 
                              value={formData.email} 
                              disabled={true}
                              className="bg-gray-50 text-gray-500 cursor-not-allowed"
                            />
                            <p className="text-xs text-gray-500 mt-1">Email address cannot be updated</p>
                          </div>
                        </div>
                      </div>
                      
                      {isEditing && (
                        <div className="space-y-4">
                          <h3 className="text-sm font-medium text-gray-900 flex items-center">
                            <Key className="mr-2 h-4 w-4 text-gray-500" />
                            Change Password
                          </h3>
                          
                          <div className="grid gap-4">
                            <div className="grid gap-2">
                              <Label htmlFor="currentPassword">Current Password</Label>
                              <Input 
                                id="currentPassword" 
                                name="currentPassword" 
                                type="password" 
                                value={formData.currentPassword} 
                                onChange={handleChange} 
                                className="bg-white"
                              />
                            </div>
                            
                            <div className="grid gap-2">
                              <Label htmlFor="newPassword">New Password</Label>
                              <Input 
                                id="newPassword" 
                                name="newPassword" 
                                type="password" 
                                value={formData.newPassword} 
                                onChange={handleChange} 
                                className="bg-white"
                              />
                            </div>
                            
                            <div className="grid gap-2">
                              <Label htmlFor="confirmPassword">Confirm New Password</Label>
                              <Input 
                                id="confirmPassword" 
                                name="confirmPassword" 
                                type="password" 
                                value={formData.confirmPassword} 
                                onChange={handleChange} 
                                className="bg-white"
                              />
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                    
                    {isEditing && (
                      <CardFooter className="px-0 pt-6 pb-0 flex justify-end">
                        <Button type="submit" className="bg-gray-900 hover:bg-gray-800 text-white">
                          <Save className="mr-2 h-4 w-4" />
                          Save Changes
                        </Button>
                      </CardFooter>
                    )}
                  </form>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>

      <footer className="mt-auto py-8 border-t border-gray-200 bg-white">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="flex flex-col items-center justify-center text-center">
            <div className="flex items-center mb-4">
              <img src="/chicken.png" alt="Kuku Farm Logo" className="h-6 w-6 mr-2" />
              <span className="font-semibold text-gray-900">Kuku Farm</span>
            </div>
            <p className="text-gray-500 text-sm">© {new Date().getFullYear()} Kuku Farm. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
