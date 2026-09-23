import { useState, useRef, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Button, Card } from '@/components/ui/Card';
import {
  User as UserIcon, Mail, Phone, MapPin, Calendar, Camera, Image,
  Upload, Loader2, Save, Check, X, Edit3, Sparkles,
} from 'lucide-react';
import { supabase } from '@/services/supabaseClient';
import type { UserRole } from '@/types';

const roleLabels: Record<UserRole, string> = {
  student: 'Student',
  teacher: 'Teacher',
  parent: 'Parent',
  therapist: 'Therapist',
};

export function ProfilePage() {
  const { user, updateProfile } = useAuth();
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [avatarModalOpen, setAvatarModalOpen] = useState(false);
  const [error, setError] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  // Form state
  const [name, setName] = useState(user?.name || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [dateOfBirth, setDateOfBirth] = useState(user?.dateOfBirth || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [address, setAddress] = useState(user?.address || '');

  const handleSave = async () => {
    if (!user) return;
    setError('');
    setSaving(true);
    const result = await updateProfile({
      name: name.trim(),
      bio: bio.trim(),
      dateOfBirth: dateOfBirth || undefined,
      phone: phone.trim(),
      address: address.trim(),
    });
    setSaving(false);
    if (result.success) {
      setSaved(true);
      setEditing(false);
      setTimeout(() => setSaved(false), 2500);
    } else {
      setError(result.error || 'Could not save your profile.');
    }
  };

  const handleCancel = () => {
    setEditing(false);
    setName(user?.name || '');
    setBio(user?.bio || '');
    setDateOfBirth(user?.dateOfBirth || '');
    setPhone(user?.phone || '');
    setAddress(user?.address || '');
    setError('');
  };

  const handleAvatarUpload = useCallback(async (file: File) => {
    if (!user) return;
    setAvatarModalOpen(false);
    setError('');
    setUploadingAvatar(true);

    const fileExt = file.name.split('.').pop()?.toLowerCase() || 'jpg';
    const fileName = `${user.id}/avatar-${Date.now()}.${fileExt}`;
    const filePath = fileName;

    // Delete old avatars in the user's folder first (best effort)
    try {
      const { data: oldFiles } = await supabase.storage
        .from('avatars')
        .list(user.id);
      if (oldFiles && oldFiles.length > 0) {
        const pathsToRemove = oldFiles.map((f) => `${user.id}/${f.name}`);
        await supabase.storage.from('avatars').remove(pathsToRemove);
      }
    } catch {
      // ignore cleanup errors
    }

    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(filePath, file, { cacheControl: '3600', upsert: true });

    if (uploadError) {
      setUploadingAvatar(false);
      setError('Could not upload your photo. Please try again.');
      return;
    }

    const { data: { publicUrl } } = supabase.storage
      .from('avatars')
      .getPublicUrl(filePath);

    // Add cache-buster so the new image loads immediately
    const avatarUrl = `${publicUrl}?t=${Date.now()}`;

    const result = await updateProfile({ avatarUrl });
    setUploadingAvatar(false);
    if (!result.success) {
      setError(result.error || 'Could not update your avatar.');
    }
  }, [user, updateProfile]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleAvatarUpload(file);
    e.target.value = '';
  };

  if (!user) return null;

  const roleLabel = roleLabels[user.role] || 'User';

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-800">My Profile</h1>
          <p className="text-gray-500 mt-1">View and manage your personal details</p>
        </div>
        {!editing ? (
          <Button onClick={() => setEditing(true)} icon={<Edit3 className="w-4 h-4" />} size="sm">
            Edit Profile
          </Button>
        ) : (
          <div className="flex gap-2">
            <Button onClick={handleCancel} variant="ghost" size="sm" icon={<X className="w-4 h-4" />}>
              Cancel
            </Button>
            <Button onClick={handleSave} size="sm" disabled={saving} icon={saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}>
              {saving ? 'Saving...' : 'Save'}
            </Button>
          </div>
        )}
      </div>

      {saved && (
        <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-nest-green-50 text-nest-green-700 font-medium text-sm animate-fade-in">
          <Check className="w-5 h-5" />
          Your profile has been updated!
        </div>
      )}
      {error && (
        <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-nest-peach-50 text-nest-peach-700 font-medium text-sm">
          <X className="w-5 h-5" />
          {error}
        </div>
      )}

      {/* Avatar + Name Card */}
      <Card className="flex flex-col sm:flex-row items-center gap-6">
        {/* Avatar display */}
        <div className="relative group">
          <div className="w-28 h-28 rounded-full overflow-hidden bg-gradient-to-br from-nest-blue-100 to-nest-lavender-100 flex items-center justify-center shadow-soft border-4 border-white">
            {uploadingAvatar ? (
              <Loader2 className="w-10 h-10 animate-spin text-nest-blue-400" />
            ) : user.avatarUrl ? (
              <img src={user.avatarUrl} alt={user.name} className="w-full h-full object-cover" />
            ) : (
              <span className="text-5xl">{user.avatar}</span>
            )}
          </div>
          {/* Upload button overlay */}
          <button
            onClick={() => setAvatarModalOpen(true)}
            disabled={uploadingAvatar}
            className="absolute bottom-0 right-0 w-9 h-9 rounded-full bg-nest-blue-400 text-white flex items-center justify-center shadow-card hover:bg-nest-blue-500 transition-all disabled:opacity-50"
            title="Change avatar"
          >
            <Camera className="w-4 h-4" />
          </button>
        </div>

        <div className="text-center sm:text-left flex-1">
          <h2 className="text-xl font-bold text-gray-800">{user.name}</h2>
          <p className="text-gray-500 text-sm">{user.email}</p>
          <div className="inline-flex items-center gap-1.5 mt-2 px-3 py-1 rounded-full bg-nest-blue-50 text-nest-blue-700 text-sm font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            {roleLabel}
          </div>
        </div>
      </Card>

      {/* Personal Details Card */}
      <Card>
        <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
          <UserIcon className="w-5 h-5 text-nest-blue-400" />
          Personal Details
        </h3>
        <div className="space-y-4">
          {/* Name */}
          <div>
            <label className="block text-sm font-semibold text-gray-600 mb-1.5">Full Name</label>
            {editing ? (
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-nest-blue-400 outline-none font-medium text-gray-700"
              />
            ) : (
              <p className="px-4 py-3 rounded-xl bg-gray-50 text-gray-700 font-medium">{user.name}</p>
            )}
          </div>

          {/* Email (read-only) */}
          <div>
            <label className="block text-sm font-semibold text-gray-600 mb-1.5">Email</label>
            <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-gray-50">
              <Mail className="w-4 h-4 text-gray-400" />
              <p className="text-gray-700 font-medium">{user.email}</p>
            </div>
          </div>

          {/* Role (read-only) */}
          <div>
            <label className="block text-sm font-semibold text-gray-600 mb-1.5">Role</label>
            <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-gray-50">
              <Sparkles className="w-4 h-4 text-gray-400" />
              <p className="text-gray-700 font-medium">{roleLabel}</p>
            </div>
          </div>

          {/* Date of Birth */}
          <div>
            <label className="block text-sm font-semibold text-gray-600 mb-1.5">Date of Birth</label>
            {editing ? (
              <input
                type="date"
                value={dateOfBirth}
                onChange={(e) => setDateOfBirth(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-nest-blue-400 outline-none font-medium text-gray-700"
              />
            ) : (
              <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-gray-50">
                <Calendar className="w-4 h-4 text-gray-400" />
                <p className="text-gray-700 font-medium">
                  {user.dateOfBirth
                    ? new Date(user.dateOfBirth).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
                    : 'Not provided'}
                </p>
              </div>
            )}
          </div>

          {/* Phone */}
          <div>
            <label className="block text-sm font-semibold text-gray-600 mb-1.5">Phone Number</label>
            {editing ? (
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Enter your phone number"
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-nest-blue-400 outline-none font-medium text-gray-700"
              />
            ) : (
              <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-gray-50">
                <Phone className="w-4 h-4 text-gray-400" />
                <p className="text-gray-700 font-medium">{user.phone || 'Not provided'}</p>
              </div>
            )}
          </div>

          {/* Address */}
          <div>
            <label className="block text-sm font-semibold text-gray-600 mb-1.5">Address</label>
            {editing ? (
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Enter your address"
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-nest-blue-400 outline-none font-medium text-gray-700"
              />
            ) : (
              <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-gray-50">
                <MapPin className="w-4 h-4 text-gray-400" />
                <p className="text-gray-700 font-medium">{user.address || 'Not provided'}</p>
              </div>
            )}
          </div>

          {/* Bio */}
          <div>
            <label className="block text-sm font-semibold text-gray-600 mb-1.5">About Me</label>
            {editing ? (
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Write a short bio about yourself..."
                rows={3}
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-nest-blue-400 outline-none font-medium text-gray-700 resize-none"
              />
            ) : (
              <p className="px-4 py-3 rounded-xl bg-gray-50 text-gray-700 font-medium min-h-[3rem]">
                {user.bio || 'Not provided'}
              </p>
            )}
          </div>
        </div>
      </Card>

      {/* Avatar upload modal */}
      {avatarModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={() => setAvatarModalOpen(false)} />
          <div className="relative bg-white rounded-3xl shadow-card max-w-sm w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-800">Change Avatar</h3>
              <button onClick={() => setAvatarModalOpen(false)} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">
                &times;
              </button>
            </div>
            <p className="text-gray-500 text-sm mb-5">Choose how you'd like to upload your photo.</p>
            <div className="space-y-3">
              <button
                onClick={() => cameraInputRef.current?.click()}
                className="w-full flex items-center gap-3 px-4 py-4 rounded-2xl border-2 border-gray-200 hover:border-nest-blue-400 hover:bg-nest-blue-50 transition-all"
              >
                <div className="w-12 h-12 rounded-xl bg-nest-blue-100 flex items-center justify-center">
                  <Camera className="w-6 h-6 text-nest-blue-500" />
                </div>
                <div className="text-left">
                  <p className="font-bold text-gray-700">Take a Photo</p>
                  <p className="text-sm text-gray-400">Use your camera to capture a new photo</p>
                </div>
              </button>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-full flex items-center gap-3 px-4 py-4 rounded-2xl border-2 border-gray-200 hover:border-nest-green-400 hover:bg-nest-green-50 transition-all"
              >
                <div className="w-12 h-12 rounded-xl bg-nest-green-100 flex items-center justify-center">
                  <Image className="w-6 h-6 text-nest-green-500" />
                </div>
                <div className="text-left">
                  <p className="font-bold text-gray-700">Upload from Gallery</p>
                  <p className="text-sm text-gray-400">Choose an existing photo from your device</p>
                </div>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Hidden file inputs */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileSelect}
      />
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="user"
        className="hidden"
        onChange={handleFileSelect}
      />
    </div>
  );
}
