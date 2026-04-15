'use client';

import { useEffect, useMemo } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet';
import { DELHI_CENTER, PRIORITY_COLORS, CATEGORY_ICONS } from '@/lib/constants';
import 'leaflet/dist/leaflet.css';

interface Complaint {
  _id?: string;
  complaintId?: string;
  description: string;
  category: string;
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  status: string;
  location: { 
    lat?: number; 
    lng?: number; 
    coordinates?: [number, number];
    area?: string; 
    district?: string 
  };
}

const markerColors: Record<string, string> = {
  HIGH: '#f43f5e',
  MEDIUM: '#f59e0b',
  LOW: '#10b981',
};

export default function CityMap({ complaints }: { complaints: Complaint[] }) {
  const markers = useMemo(() => {
    return (complaints || []).filter(
      (c) => c && c.location && typeof c.location.lat === 'number' && typeof c.location.lng === 'number'
    );
  }, [complaints]);

  return (
    <div className="glass-card overflow-hidden h-full min-h-[400px]">
      <div className="flex items-center justify-between px-5 py-3 border-b border-white/5">
        <div>
          <h3 className="text-sm font-semibold text-white">Live Complaint Map</h3>
          <p className="text-xs text-white/40">Delhi NCR Region • Real-time tracking</p>
        </div>
        <div className="flex items-center gap-4">
          {(['HIGH', 'MEDIUM', 'LOW'] as const).map((p) => (
            <div key={p} className="flex items-center gap-1.5">
              <div
                className="w-2.5 h-2.5 rounded-full"
                style={{ backgroundColor: markerColors[p] }}
              />
              <span className="text-[10px] text-white/50 uppercase">{p}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="h-[calc(100%-52px)]">
        <MapContainer
          center={[DELHI_CENTER.lat, DELHI_CENTER.lng]}
          zoom={11}
          className="h-full w-full"
          zoomControl={true}
          attributionControl={false}
        >
          <TileLayer
            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          />
          {markers.map((c, idx) => {
            let position: [number, number] = [DELHI_CENTER.lat, DELHI_CENTER.lng];
            
            if (c.location && typeof c.location === 'object') {
              if (typeof c.location.lat === 'number' && typeof c.location.lng === 'number') {
                position = [c.location.lat, c.location.lng];
              } else if (Array.isArray(c.location.coordinates) && c.location.coordinates.length === 2) {
                // GeoJSON is [lng, lat]
                position = [c.location.coordinates[1], c.location.coordinates[0]];
              }
            }

            return (
              <CircleMarker
                key={c._id || c.complaintId || idx}
                center={position}
                radius={c.priority === 'HIGH' ? 10 : c.priority === 'MEDIUM' ? 7 : 5}
                pathOptions={{
                  color: markerColors[c.priority] || markerColors.MEDIUM,
                  fillColor: markerColors[c.priority] || markerColors.MEDIUM,
                  fillOpacity: 0.6,
                  weight: 2,
                }}
              >
                <Popup>
                  <div className="text-sm min-w-[200px] p-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-lg">{CATEGORY_ICONS[c.category] || '📋'}</span>
                      <span className="font-semibold text-white">{c.category}</span>
                    </div>
                    <p className="text-white/70 text-xs mb-2 line-clamp-2">{c.description}</p>
                    <div className="flex items-center justify-between text-xs pt-1 border-t border-white/5">
                      <span className="text-white/50">
                        📍 {typeof c.location === 'object' ? c.location.area : (c.location || 'Unknown Area')}
                      </span>
                      <span
                        className={`px-1.5 py-0.5 rounded text-[10px] font-semibold ${
                          (PRIORITY_COLORS[c.priority] || PRIORITY_COLORS.LOW).bg
                        } ${(PRIORITY_COLORS[c.priority] || PRIORITY_COLORS.LOW).text}`}
                      >
                        {c.priority}
                      </span>
                    </div>
                  </div>
                </Popup>
              </CircleMarker>
            );
          })}
        </MapContainer>
      </div>
    </div>
  );
}
