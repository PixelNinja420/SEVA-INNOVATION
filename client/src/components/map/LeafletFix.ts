import L from 'leaflet';

// Fix for default Leaflet icon paths in React bundlers
export function setupLeafletIcons() {
  delete (L.Icon.Default.prototype as any)._getIconUrl;

  L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  });
}

export function createStatusMarkerIcon(status: string, isSelected = false) {
  let color = '#24845B'; // normal green
  if (status === 'CRITICAL') color = '#D94F45'; // critical red
  else if (status === 'WARNING') color = '#E5A23D'; // warning amber
  else if (status === 'WATCH') color = '#368F8A'; // watch teal
  else if (status === 'OFFLINE') color = '#6B7280'; // grey

  const size = isSelected ? 32 : 24;
  const pulseClass = status === 'CRITICAL' ? 'pulse-critical' : '';

  return L.divIcon({
    className: 'custom-leaflet-marker',
    html: `
      <div style="position: relative; width: ${size}px; height: ${size}px;">
        <div class="${pulseClass}" style="
          position: absolute;
          inset: 0;
          border-radius: 9999px;
          background-color: ${color};
          border: ${isSelected ? '3px' : '2px'} solid white;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.3);
          display: flex;
          align-items: center;
          justify-content: center;
        ">
          <svg width="${size * 0.5}" height="${size * 0.5}" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>
          </svg>
        </div>
      </div>
    `,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  });
}
