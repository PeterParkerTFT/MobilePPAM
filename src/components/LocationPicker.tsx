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
}

function DraggableMarker({
    position,
    setPosition,
    readOnly
}: {
    position: Location;
    setPosition: (pos: Location) => void;
    readOnly?: boolean;
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

    return (
        <Marker
            draggable={!readOnly}
            eventHandlers={eventHandlers}
            position={position}
            ref={markerRef}
        >
            <Popup minWidth={90}>
                {readOnly ? 'Ubicación seleccionada' : 'Arrastrame para ajustar'}
            </Popup>
        </Marker>
    );
}

export function LocationPicker({
    initialLocation = { lat: 19.4326, lng: -99.1332 }, // Default: CDMX (Center)
    onLocationSelect,
    height = '300px',
    readOnly = false
}: LocationPickerProps) {
    const [position, setPosition] = useState<Location>(initialLocation);

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
                <DraggableMarker
                    position={position}
                    setPosition={handleSetPosition}
                    readOnly={readOnly}
                />
            </MapContainer>
        </div>
    );
}
