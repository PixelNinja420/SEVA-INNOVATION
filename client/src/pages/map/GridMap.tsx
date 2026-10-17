import React, { useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { Link } from 'react-router-dom';
import { useSimulationStore } from '@/stores/simulationStore';
import { useRegionStore } from '@/stores/regionStore';
import { Transformer } from '@/types';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { setupLeafletIcons, createStatusMarkerIcon } from '@/components/map/LeafletFix';
import {
  MapPin,
  Zap,
  Thermometer,
  Users,
  Activity,
  ArrowRight,
  Filter,
  Layers,
  ChevronRight,
} from 'lucide-react';

setupLeafletIcons();

// Sub-component to re-center map smoothly
function ChangeView({ center, zoom }: { center: [number, number]; zoom: number }) {
  const map = useMap();
  map.setView(center, zoom);
  return null;
}

export const GridMap: React.FC = () => {
  const { transformers } = useSimulationStore();
  const { selectedRegion, regions } = useRegionStore();

  const [selectedTransformer, setSelectedTransformer] = useState<Transformer | null>(
    transformers[0]
  );
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [mapCenter, setMapCenter] = useState<[number, number]>([15.4909, 73.8278]);
  const [mapZoom, setMapZoom] = useState<number>(13);

  const filteredTransformers = transformers.filter((tr) => {
    if (statusFilter === 'ALL') return true;
    return tr.status === statusFilter;
  });

  const quickZoomLocations: { name: string; coords: [number, number]; zoom: number }[] = [
    { name: 'Panaji Urban', coords: [15.4909, 73.8278], zoom: 14 },
    { name: 'Miramar Beach', coords: [15.4815, 73.811], zoom: 14 },
    { name: 'Margao South', coords: [15.273, 73.958], zoom: 13 },
    { name: 'Porvorim Hub', coords: [15.525, 73.829], zoom: 14 },
    { name: 'Calangute Coast', coords: [15.542, 73.765], zoom: 13 },
  ];

  return (
    <div className="space-y-4">
      {/* Filter and Quick Navigation Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3.5 rounded-xl border border-[#E3DED2] shadow-xs">
        {/* Status Filters */}
        <div className="flex items-center space-x-2">
          <Filter className="w-4 h-4 text-[#7F9565]" />
          <span className="text-xs font-bold text-[#191919]">Filter Status:</span>
          {['ALL', 'CRITICAL', 'WARNING', 'WATCH', 'NORMAL', 'OFFLINE'].map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`text-xs px-2.5 py-1 rounded-lg font-semibold transition-all ${
                statusFilter === status
                  ? 'bg-[#7F9565] text-white shadow-xs'
                  : 'bg-[#F5F2E9] text-[#6B7280] hover:text-[#191919]'
              }`}
            >
              {status}
            </button>
          ))}
        </div>

        {/* Quick Zoom Buttons */}
        <div className="flex items-center space-x-1.5 overflow-x-auto">
          <span className="text-xs font-semibold text-[#6B7280] mr-1">Sector Zoom:</span>
          {quickZoomLocations.map((loc) => (
            <Button
              key={loc.name}
              variant="outline"
              size="sm"
              onClick={() => {
                setMapCenter(loc.coords);
                setMapZoom(loc.zoom);
              }}
              className="text-xs h-7 px-2"
            >
              {loc.name}
            </Button>
          ))}
        </div>
      </div>

      {/* Main Map Viewport + Side Details Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[640px]">
        {/* Leaflet Map Area */}
        <div className="lg:col-span-8 relative h-full rounded-2xl overflow-hidden border border-[#E3DED2] shadow-sm">
          <MapContainer
            center={mapCenter}
            zoom={mapZoom}
            scrollWheelZoom={true}
            className="w-full h-full"
          >
            <ChangeView center={mapCenter} zoom={mapZoom} />
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            {filteredTransformers.map((tr) => (
              <Marker
                key={tr.id}
                position={tr.coordinates}
                icon={createStatusMarkerIcon(tr.status, selectedTransformer?.id === tr.id)}
                eventHandlers={{
                  click: () => setSelectedTransformer(tr),
                }}
              >
                <Popup>
                  <div className="p-1 space-y-1 text-xs">
                    <p className="font-bold text-[#191919]">{tr.name}</p>
                    <p className="text-gray-500">{tr.code} • {tr.capacityKVA} kVA</p>
                    <p>Load: <strong>{tr.currentLoadKW} kW ({tr.loadingPercentage}%)</strong></p>
                    <p>Temp: <strong>{tr.oilTemperature}°C</strong></p>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>

          {/* Floating Map Legend */}
          <div className="absolute bottom-4 left-4 z-20 bg-white/95 backdrop-blur-md p-3 rounded-xl border border-[#E3DED2] shadow-md text-xs space-y-1.5 pointer-events-auto">
            <p className="font-bold text-[#191919] text-[11px] uppercase tracking-wider mb-1">
              Transformer Status
            </p>
            <div className="flex items-center space-x-2">
              <span className="w-3 h-3 rounded-full bg-[#24845B]" />
              <span className="text-gray-700">Normal (&lt;70%)</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="w-3 h-3 rounded-full bg-[#368F8A]" />
              <span className="text-gray-700">Watch (70-84%)</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="w-3 h-3 rounded-full bg-[#E5A23D]" />
              <span className="text-gray-700">Warning (85-99%)</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="w-3 h-3 rounded-full bg-[#D94F45]" />
              <span className="text-gray-700">Critical (&gt;=100%)</span>
            </div>
          </div>
        </div>

        {/* Selected Transformer Inspector Panel */}
        <div className="lg:col-span-4 h-full">
          {selectedTransformer ? (
            <Card className="h-full p-5 bg-white flex flex-col justify-between overflow-y-auto">
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[10px] font-mono uppercase text-[#6B7280]">
                      {selectedTransformer.code}
                    </span>
                    <h3 className="text-lg font-bold text-[#191919] leading-tight mt-0.5">
                      {selectedTransformer.name}
                    </h3>
                    <p className="text-xs text-[#6B7280]">{selectedTransformer.regionName}</p>
                  </div>
                  <StatusBadge status={selectedTransformer.status} />
                </div>

                {/* Key Gauges */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 bg-[#F5F2E9] rounded-xl border border-[#E3DED2]">
                    <span className="text-[10px] font-bold text-[#6B7280] uppercase">
                      Current Loading
                    </span>
                    <div className="flex items-baseline space-x-1.5 mt-1">
                      <span className="text-2xl font-bold font-mono text-[#191919]">
                        {selectedTransformer.loadingPercentage}%
                      </span>
                    </div>
                    <p className="text-[11px] text-gray-500 font-mono mt-0.5">
                      {selectedTransformer.currentLoadKW} / {selectedTransformer.capacityKVA} kVA
                    </p>
                  </div>

                  <div className="p-3 bg-[#F5F2E9] rounded-xl border border-[#E3DED2]">
                    <span className="text-[10px] font-bold text-[#6B7280] uppercase">
                      Top-Oil Temp
                    </span>
                    <div className="flex items-baseline space-x-1.5 mt-1">
                      <span className="text-2xl font-bold font-mono text-[#191919]">
                        {selectedTransformer.oilTemperature}°C
                      </span>
                    </div>
                    <p className="text-[11px] text-gray-500 font-mono mt-0.5">
                      Winding: {selectedTransformer.windingTemperature}°C
                    </p>
                  </div>
                </div>

                {/* Transformer Specs */}
                <div className="space-y-2 text-xs border-t border-[#E3DED2] pt-3">
                  <div className="flex justify-between py-1">
                    <span className="text-[#6B7280]">Feeder:</span>
                    <span className="font-semibold text-[#191919]">{selectedTransformer.feederName}</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-[#6B7280]">Connected Consumers:</span>
                    <span className="font-semibold text-[#191919]">{selectedTransformer.connectedConsumersCount} Meters</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-[#6B7280]">Health Index:</span>
                    <span className="font-semibold text-[#191919]">{selectedTransformer.healthIndex}/100</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-[#6B7280]">Make & Model:</span>
                    <span className="font-semibold text-[#191919] truncate max-w-[180px]">{selectedTransformer.makeModel}</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-[#6B7280]">Last Telemetry:</span>
                    <span className="font-mono text-gray-500">Just now</span>
                  </div>
                </div>
              </div>

              {/* Navigation Actions */}
              <div className="pt-4 border-t border-[#E3DED2] space-y-2">
                <Link to={`/transformers/${selectedTransformer.id}`} className="block">
                  <Button variant="primary" size="sm" className="w-full justify-between">
                    <span>View Full Diagnostics</span>
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </Link>

                <Link to={`/optimization?transformerId=${selectedTransformer.id}`} className="block">
                  <Button variant="teal" size="sm" className="w-full justify-between">
                    <span>Run Knapsack DR Solver</span>
                    <Zap className="w-4 h-4" />
                  </Button>
                </Link>
              </div>
            </Card>
          ) : (
            <Card className="h-full p-8 flex items-center justify-center text-center text-[#6B7280]">
              Select a transformer pin on the map to view live telemetry.
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};
