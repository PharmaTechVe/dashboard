'use client';

import { useState } from 'react';
import {
  GoogleMap,
  useJsApiLoader,
  Marker,
  InfoWindow,
} from '@react-google-maps/api';
import { GOOGLE_MAPS_OPTIONS } from '@/lib/helpers/googleMapsConfig';

export interface BranchMarker {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  address: string;
}

interface GoogleMapsProps {
  markers?: BranchMarker[];
  draggable?: boolean;
  center?: { lat: number; lng: number };
  onCoordinateChange?: (lat: number, lng: number) => void;
  onAddressChange?: (address: string) => void;
  mapHeight?: string;
  mapWidth?: string;
}

const GoogleMaps = ({
  markers = [],
  draggable = false,
  center = { lat: 10.063, lng: -69.323 },
  onCoordinateChange,
  onAddressChange,
  mapHeight = '500px',
  mapWidth = '100%',
}: GoogleMapsProps) => {
  const { isLoaded } = useJsApiLoader(GOOGLE_MAPS_OPTIONS);
  const [activeMarker, setActiveMarker] = useState<string | null>(null);
  const [selectedPosition, setSelectedPosition] = useState(center);

  const handleMapClick = async (e: google.maps.MapMouseEvent) => {
    if (!draggable || !e.latLng) return;
    const lat = e.latLng.lat();
    const lng = e.latLng.lng();
    setSelectedPosition({ lat, lng });
    onCoordinateChange?.(lat, lng);
    reverseGeocode(lat, lng);
  };

  const reverseGeocode = (lat: number, lng: number) => {
    if (!window.google?.maps?.Geocoder) return;

    const geocoder = new window.google.maps.Geocoder();
    const latLng = new window.google.maps.LatLng(lat, lng);

    geocoder.geocode({ location: latLng }, (results, status) => {
      if (status === 'OK' && results?.length) {
        onAddressChange?.(results[0].formatted_address);
      } else {
        onAddressChange?.('Dirección no encontrada');
      }
    });
  };

  if (!isLoaded) return <div>Cargando mapa...</div>;

  return (
    <GoogleMap
      mapContainerStyle={{ width: mapWidth, height: mapHeight }}
      center={selectedPosition}
      zoom={12}
      onClick={handleMapClick}
    >
      {/* Pines múltiples para sucursales */}
      {markers.map((branch) => (
        <Marker
          key={branch.id}
          position={{ lat: branch.latitude, lng: branch.longitude }}
          onMouseOver={() => setActiveMarker(branch.id)}
          onMouseOut={() => setActiveMarker(null)}
          icon={{
            url: 'http://maps.google.com/mapfiles/ms/icons/red-dot.png',
            scaledSize: new google.maps.Size(40, 40),
          }}
        >
          {activeMarker === branch.id && (
            <InfoWindow
              position={{ lat: branch.latitude, lng: branch.longitude }}
              onCloseClick={() => setActiveMarker(null)}
            >
              <div className="text-sm">
                <strong>{branch.name}</strong>
                <p>{branch.address}</p>
              </div>
            </InfoWindow>
          )}
        </Marker>
      ))}

      {/* Pin único y draggable para selección de ubicación */}
      {draggable && (
        <Marker
          position={selectedPosition}
          draggable
          onDragEnd={(e) => {
            if (!e.latLng) return;
            const lat = e.latLng.lat();
            const lng = e.latLng.lng();
            setSelectedPosition({ lat, lng });
            onCoordinateChange?.(lat, lng);
            reverseGeocode(lat, lng);
          }}
        />
      )}
    </GoogleMap>
  );
};

export default GoogleMaps;
