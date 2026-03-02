import React, { useState } from 'react';
import { User, Mail, Phone, MapPin, Plus, Trash2, Edit2, Save, X, Star, Clock, Package } from 'lucide-react';
import { User as UserType } from '../types';

interface Address {
  id: string;
  label: string;
  fullAddress: string;
  isDefault: boolean;
}

interface ProfileProps {
  user: UserType;
  addresses: Address[];
  onAddAddress: (address: Address) => void;
  onDeleteAddress: (id: string) => void;
  onSetDefaultAddress: (id: string) => void;
  onUpdateProfile: (user: Partial<UserType>) => void;
  onNavigate: (page: string) => void;
}

const Profile: React.FC<ProfileProps> = ({ 
  user, 
  addresses, 
  onAddAddress, 
  onDeleteAddress, 
  onSetDefaultAddress,
  onUpdateProfile,
  onNavigate 
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState(user.name);
  const [editedEmail, setEditedEmail] = useState(user.email);
  const [editedPhone, setEditedPhone] = useState('+1 (555) 123-4567');
  const [showAddAddress, setShowAddAddress] = useState(false);
  const [newAddress, setNewAddress] = useState({ label: 'Home', fullAddress: '' });

  const handleSave = () => {
    onUpdateProfile({ name: editedName, email: editedEmail });
    setIsEditing(false);
  };

  const handleAddAddress = () => {
    if (newAddress.fullAddress.trim()) {
      onAddAddress({
        id: Math.random().toString(36).substr(2, 9),
        ...newAddress,
        isDefault: addresses.length === 0
      });
      setNewAddress({ label: 'Home', fullAddress: '' });
      setShowAddAddress(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-black tracking-tight mb-10">My Profile</h1>

      {/* Profile Card */}
      <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm p-8 mb-8">
        <div className="flex items-start justify-between mb-8">
          <div className="flex items-center gap-6">
            <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center">
              <User className="h-10 w-10 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-900">{user.name}</h2>
              <p className="text-slate-500 font-medium">{user.email}</p>
              <span className="inline-block mt-2 bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-black uppercase">
                {user.role}
              </span>
            </div>
          </div>
          {!isEditing ? (
            <button 
              onClick={() => setIsEditing(true)}
              className="flex items-center gap-2 text-blue-600 font-bold text-sm hover:bg-blue-50 px-4 py-2 rounded-xl transition-colors"
            >
              <Edit2 className="h-4 w-4" /> Edit
            </button>
          ) : (
            <div className="flex gap-2">
              <button onClick={handleSave} className="flex items-center gap-2 bg-green-600 text-white font-bold text-sm px-4 py-2 rounded-xl hover:bg-green-700 transition-colors">
                <Save className="h-4 w-4" /> Save
              </button>
              <button onClick={() => setIsEditing(false)} className="flex items-center gap-2 bg-slate-100 text-slate-600 font-bold text-sm px-4 py-2 rounded-xl hover:bg-slate-200 transition-colors">
                <X className="h-4 w-4" /> Cancel
              </button>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl">
            <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm">
              <User className="h-5 w-5 text-slate-400" />
            </div>
            <div className="flex-1">
              <p className="text-xs font-black text-slate-400 uppercase mb-1">Full Name</p>
              {isEditing ? (
                <input 
                  value={editedName} 
                  onChange={(e) => setEditedName(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1 font-bold text-sm focus:outline-none focus:border-blue-500"
                />
              ) : (
                <p className="font-bold text-slate-900">{user.name}</p>
              )}
            </div>
          </div>
          
          <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl">
            <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm">
              <Mail className="h-5 w-5 text-slate-400" />
            </div>
            <div className="flex-1">
              <p className="text-xs font-black text-slate-400 uppercase mb-1">Email</p>
              {isEditing ? (
                <input 
                  value={editedEmail} 
                  onChange={(e) => setEditedEmail(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1 font-bold text-sm focus:outline-none focus:border-blue-500"
                />
              ) : (
                <p className="font-bold text-slate-900">{user.email}</p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl">
            <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm">
              <Phone className="h-5 w-5 text-slate-400" />
            </div>
            <div className="flex-1">
              <p className="text-xs font-black text-slate-400 uppercase mb-1">Phone</p>
              {isEditing ? (
                <input 
                  value={editedPhone} 
                  onChange={(e) => setEditedPhone(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1 font-bold text-sm focus:outline-none focus:border-blue-500"
                />
              ) : (
                <p className="font-bold text-slate-900">{editedPhone}</p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl">
            <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm">
              <Star className="h-5 w-5 text-slate-400" />
            </div>
            <div className="flex-1">
              <p className="text-xs font-black text-slate-400 uppercase mb-1">Member Since</p>
              <p className="font-bold text-slate-900">January 2024</p>
            </div>
          </div>
        </div>
      </div>

      {/* Addresses Card */}
      <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm p-8">
        <div className="flex items-center justify-between mb-8">
          <h3 className="text-lg font-black text-slate-900 flex items-center gap-3">
            <MapPin className="h-5 w-5 text-blue-600" />
            Saved Addresses
          </h3>
          <button 
            onClick={() => setShowAddAddress(!showAddAddress)}
            className="flex items-center gap-2 bg-blue-600 text-white font-bold text-sm px-4 py-2 rounded-xl hover:bg-blue-700 transition-colors"
          >
            <Plus className="h-4 w-4" /> Add New
          </button>
        </div>

        {showAddAddress && (
          <div className="mb-6 p-6 bg-slate-50 rounded-2xl">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
              <select 
                value={newAddress.label}
                onChange={(e) => setNewAddress({...newAddress, label: e.target.value})}
                className="p-3 bg-white border border-slate-200 rounded-xl font-bold text-sm focus:outline-none focus:border-blue-500"
              >
                <option>Home</option>
                <option>Office</option>
                <option>Friend's Place</option>
                <option>Other</option>
              </select>
              <input 
                placeholder="Full address"
                value={newAddress.fullAddress}
                onChange={(e) => setNewAddress({...newAddress, fullAddress: e.target.value})}
                className="p-3 bg-white border border-slate-200 rounded-xl font-bold text-sm focus:outline-none focus:border-blue-500"
              />
            </div>
            <div className="flex gap-2">
              <button onClick={handleAddAddress} className="bg-blue-900 text-white px-6 py-2 rounded-xl font-bold text-sm hover:bg-black transition-colors">
                Save Address
              </button>
              <button onClick={() => setShowAddAddress(false)} className="bg-slate-200 text-slate-600 px-6 py-2 rounded-xl font-bold text-sm hover:bg-slate-300 transition-colors">
                Cancel
              </button>
            </div>
          </div>
        )}

        <div className="space-y-4">
          {addresses.length === 0 ? (
            <p className="text-slate-500 font-medium text-center py-8">No saved addresses yet</p>
          ) : (
            addresses.map((address) => (
              <div 
                key={address.id} 
                className={`p-5 rounded-2xl border-2 transition-all ${address.isDefault ? 'border-blue-500 bg-blue-50' : 'border-slate-100'}`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${address.isDefault ? 'bg-blue-500 text-white' : 'bg-slate-200 text-slate-500'}`}>
                      <MapPin className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-black text-slate-900">{address.label}</p>
                        {address.isDefault && (
                          <span className="bg-blue-500 text-white px-2 py-0.5 rounded-full text-[8px] font-black uppercase">Default</span>
                        )}
                      </div>
                      <p className="text-slate-500 font-medium text-sm">{address.fullAddress}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {!address.isDefault && (
                      <button 
                        onClick={() => onSetDefaultAddress(address.id)}
                        className="text-blue-600 font-bold text-xs hover:underline"
                      >
                        Set as Default
                      </button>
                    )}
                    <button 
                      onClick={() => onDeleteAddress(address.id)}
                      className="text-red-400 hover:text-red-600 p-2 transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;
