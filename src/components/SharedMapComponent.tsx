import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L, { Icon } from 'leaflet';

// Fix for default marker icon in React Leaflet
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

delete (Icon.Default.prototype as any)._getIconUrl;
Icon.Default.mergeOptions({
    iconUrl: markerIcon,
    iconRetinaUrl: markerIcon2x,
    shadowUrl: markerShadow,
});

export interface MapMarker {
    id: string;
    position: [number, number];
    title: string;
    description?: string;
    color?: string; // [NEW] Hex color string (e.g., "#FF5733")
}

interface SharedMapComponentProps {
    markers: MapMarker[];
    centerCoordinates?: [number, number];
    zoom?: number;
    interactionMode?: 'read-only' | 'interactive';
    height?: string;
    className?: string;
}

// Function to create a colored marker icon
const createColoredIcon = (color: string) => {
    const svgIcon = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="${color}" width="36px" height="36px">
      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
    </svg>`;

    return new L.DivIcon({
        className: "custom-marker",
        html: svgIcon,
        iconSize: [36, 36],
        iconAnchor: [18, 36],
        popupAnchor: [0, -36]
    });
};

export function SharedMapComponent({
    markers,
    centerCoordinates = [20.659698, -103.349609], // Default: Guadalajara
    zoom = 13,
    // interactionMode = 'read-only', // Currently unused but good for future extensibility (e.g. disabling dragging)
    height = '400px',
    className = ''
}: SharedMapComponentProps) {

    return (
        <div className={`w-full rounded-lg overflow-hidden shadow-md ${className}`} style={{ height }}>
            <MapContainer
                center={centerCoordinates}
                zoom={zoom}
                style={{ height: '100%', width: '100%' }}
                scrollWheelZoom={true}
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                {markers.map((marker) => (
                    <Marker
                        key={marker.id}
                        position={marker.position}
                        icon={marker.color ? createColoredIcon(marker.color) : undefined}
                    >
                        <Popup>
                            <div className="text-sm">
                                <strong className="block text-[#594396] mb-1">{marker.title}</strong>
                                {marker.description && <p className="m-0 text-gray-600">{marker.description}</p>}
                            </div>
                        </Popup>
                    </Marker>
                ))}
            </MapContainer>
        </div>
    );
}
