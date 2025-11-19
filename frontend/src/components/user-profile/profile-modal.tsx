import React, { useState, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { X, Camera, Save, User, Mail, Phone, MapPin } from 'lucide-react';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ProfileModal({ isOpen, onClose }: ProfileModalProps) {
  const { user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: '',
    location: '',
    bio: '',
    profileImage: null as string | null,
  });

  const [isEditing, setIsEditing] = useState(false);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setProfileData((prev) => ({
          ...prev,
          profileImage: e.target?.result as string,
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = () => {
    setIsEditing(false);
    // Here you would typically save to backend
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative mx-4 w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl">
        {/* Header */}
        <div className="relative border-b bg-white p-6 text-black">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 rounded-full p-1 transition-colors hover:bg-gray-100"
            aria-label="Close profile dialog"
            title="Close"
          >
            <X className="h-5 w-5" />
          </button>

          {/* Profile Image */}
          <div className="flex flex-col items-center">
            <div className="relative">
              <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-full border-2 border-gray-200 bg-gray-100">
                {profileData.profileImage ? (
                  <img
                    src={profileData.profileImage}
                    alt="Profile"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <span className="text-2xl font-bold">
                    {profileData.name.charAt(0).toUpperCase() || 'U'}
                  </span>
                )}
              </div>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="absolute -right-1 -bottom-1 rounded-full bg-black p-2 text-white shadow-lg transition-colors hover:bg-gray-800"
                aria-label="Upload profile image"
                title="Upload image"
              >
                <Camera className="h-4 w-4" />
              </button>
              <input
                id="profile-image-input"
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
                aria-label="Profile image file input"
              />
            </div>
            <h2 className="mt-4 text-xl font-semibold text-black">
              {profileData.name}
            </h2>
            <p className="text-sm text-gray-600">{profileData.email}</p>
          </div>
        </div>

        {/* Content */}
        <div className="space-y-4 p-6">
          {/* Name */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
              <User className="h-4 w-4" />
              Name
            </label>
            {isEditing ? (
              <Input
                id="profile-name"
                name="name"
                placeholder="Full name"
                value={profileData.name}
                onChange={(e) =>
                  setProfileData((prev) => ({ ...prev, name: e.target.value }))
                }
                className="w-full"
              />
            ) : (
              <div className="rounded-lg bg-gray-50 p-3 text-gray-900">
                {profileData.name}
              </div>
            )}
          </div>

          {/* Email */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
              <Mail className="h-4 w-4" />
              Email
            </label>
            <div className="rounded-lg bg-gray-50 p-3 text-gray-900">
              {profileData.email}
            </div>
          </div>

          {/* Phone */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
              <Phone className="h-4 w-4" />
              Phone
            </label>
            {isEditing ? (
              <Input
                id="profile-phone"
                name="phone"
                value={profileData.phone}
                onChange={(e) =>
                  setProfileData((prev) => ({ ...prev, phone: e.target.value }))
                }
                placeholder="Enter phone number"
                className="w-full"
              />
            ) : (
              <div className="rounded-lg bg-gray-50 p-3 text-gray-900">
                {profileData.phone || 'Not provided'}
              </div>
            )}
          </div>

          {/* Location */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
              <MapPin className="h-4 w-4" />
              Location
            </label>
            {isEditing ? (
              <Input
                id="profile-location"
                name="location"
                value={profileData.location}
                onChange={(e) =>
                  setProfileData((prev) => ({
                    ...prev,
                    location: e.target.value,
                  }))
                }
                placeholder="Enter location"
                className="w-full"
              />
            ) : (
              <div className="rounded-lg bg-gray-50 p-3 text-gray-900">
                {profileData.location || 'Not provided'}
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            {isEditing ? (
              <>
                <Button
                  onClick={handleSave}
                  className="flex-1 bg-black text-white hover:bg-gray-800"
                >
                  <Save className="mr-2 h-4 w-4" />
                  Save Changes
                </Button>
                <Button
                  onClick={() => setIsEditing(false)}
                  variant="outline"
                  className="flex-1"
                >
                  Cancel
                </Button>
              </>
            ) : (
              <Button
                onClick={() => setIsEditing(true)}
                className="w-full bg-black text-white hover:bg-gray-800"
              >
                Edit Profile
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
