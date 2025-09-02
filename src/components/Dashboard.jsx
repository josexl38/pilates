import React, { useState } from 'react';
import { Header } from './Header.jsx';
import { UserBookings } from './UserBookings.jsx';
import { BookingForm } from './BookingForm.jsx';
import { InstructorPanel } from './InstructorPanel.jsx';
import { AdminPanel } from './AdminPanel.jsx';

export function Dashboard({ user, onLogout, onReload }) {
  const [activeTab, setActiveTab] = useState('book');

  const getTabs = () => {
    const baseTabs = [
      { id: 'book', label: '📅 Reservar', icon: '📅' },
      { id: 'bookings', label: '📋 Mis Reservas', icon: '📋' }
    ];

    if (user.role === 'instructor') {
      return [
        ...baseTabs,
        { id: 'attendance', label: '✅ Asistencia', icon: '✅' }
      ];
    }

    if (user.role === 'admin') {
      return [
        ...baseTabs,
        { id: 'attendance', label: '✅ Asistencia', icon: '✅' },
        { id: 'admin', label: '⚙️ Administrar', icon: '⚙️' }
      ];
    }

    return baseTabs;
  };

  const tabs = getTabs();

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      <Header user={user} onLogout={onLogout} />
      
      <div className="max-w-6xl mx-auto p-6">
        {/* Navigation Tabs */}
        <div className="flex space-x-1 mb-8 bg-white/60 backdrop-blur-sm rounded-2xl p-2 shadow-lg border border-white/20">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex items-center justify-center space-x-2 py-3 px-4 rounded-xl font-medium transition-all duration-200 ${
                activeTab === tab.id
                  ? 'bg-white text-indigo-600 shadow-md transform scale-105'
                  : 'text-gray-600 hover:text-indigo-600 hover:bg-white/50'
              }`}
            >
              <span>{tab.icon}</span>
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="space-y-6">
          {activeTab === 'book' && <BookingForm user={user} onReload={onReload} />}
          {activeTab === 'bookings' && <UserBookings user={user} onReload={onReload} />}
          {activeTab === 'attendance' && <InstructorPanel user={user} onReload={onReload} />}
          {activeTab === 'admin' && user.role === 'admin' && <AdminPanel onReload={onReload} />}
        </div>
      </div>
    </div>
  );
}