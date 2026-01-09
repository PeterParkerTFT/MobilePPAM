import React, { useState, useMemo, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

// Fix for Leaflet default marker icon missing assets in React
let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

interface Location {
    lat: number;
    lng: number;
}

interface LocationPickerProps {
    initialLocation?: Location;
    onLocationSelect: (location: Location) => void;
    height?: string;
    readOnly?: boolean;
    color?: string; // [NEW] Custom color support
}

function DraggableMarker({
    position,
    setPosition,
    readOnly,
    color = '59, 130, 246' // Default blue
}: {
    position: Location;
    setPosition: (pos: Location) => void;
    readOnly?: boolean;
    color?: string;
}) {
    const markerRef = useRef<any>(null);

    const eventHandlers = useMemo(
        () => ({
            dragend() {
                if (readOnly) return;
                const marker = markerRef.current;
                if (marker != null) {
                    const latlng = marker.getLatLng();
                    setPosition(latlng);
                }
            },
        }),
        [readOnly, setPosition],
    );

    // [NEW] Dynamic SVG Icon with custom color
    const customIcon = L.divIcon({
        className: 'custom-div-icon',
        html: `
        <div style="
          background-color: rgb(${color});
          width: 24px;
          height: 24px;
          border-radius: 50% 50% 50% 0;
          transform: rotate(-45deg);
          border: 2px solid white;
          box-shadow: 0 2px 4px rgba(0,0,0,0.3);
          display: flex;
          align-items: center;
          justify-content: center;
        ">
          <div style="
            width: 8px;
            height: 8px;
            background-color: white;
            border-radius: 50%;
            transform: rotate(45deg);
          "></div>
        </div>
      `,
        iconSize: [24, 24],
        iconAnchor: [12, 24], // Bottom point
        popupAnchor: [0, -24]
    });

    return (
        <Marker
            draggable={!readOnly}
            eventHandlers={eventHandlers}
            position={position}
            ref={markerRef}
            icon={customIcon} // Use custom icon
        >
            <Popup minWidth={90}>
                {readOnly ? 'Ubicación seleccionada' : 'Arrastrame para ajustar'}
            </Popup>
        </Marker>
    );
}

// [NEW] Helper to force map view update when props change
function MapUpdater({ position }: { position: Location }) {
    const map = useMapEvents({});
    React.useEffect(() => {
        map.setView(position, map.getZoom());
    }, [position, map]);
    return null;
}

export function LocationPicker({
    initialLocation = { lat: 19.4326, lng: -99.1332 }, // Default: CDMX (Center)
    onLocationSelect,
    height = '300px',
    readOnly = false,
    color
}: LocationPickerProps) {
    const [position, setPosition] = useState<Location>(initialLocation);

    // [FIX] Update internal state when prop changes (Solving "Wrong Map Location" bug)
    React.useEffect(() => {
        setPosition(initialLocation);
    }, [initialLocation]);

    const handleSetPosition = (newPos: Location) => {
        setPosition(newPos);
        onLocationSelect(newPos);
    };

    return (
        <div className="rounded-xl overflow-hidden shadow-sm border border-gray-200 z-0" style={{ height }}>
            <MapContainer
                center={position}
                zoom={13}
                scrollWheelZoom={!readOnly}
                style={{ height: '100%', width: '100%' }}
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <MapUpdater position={position} />
                <DraggableMarker
                    position={position}
                    setPosition={handleSetPosition}
                    readOnly={readOnly}
                    color={color}
                />
            </MapContainer>
        </div>
    );
}
