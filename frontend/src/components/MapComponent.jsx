import { useEffect, useMemo, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import axios from 'axios';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

L.Marker.prototype.options.icon = L.icon({ iconUrl: icon, shadowUrl: iconShadow, iconAnchor: [12, 41] });

const FALLBACK = [28.6139, 77.2090];

const MapComponent = ({ address, coordinates }) => {
  const lat = coordinates?.lat;
  const lng = coordinates?.lng;
  const providedPosition = useMemo(() => {
    if (lat && lng) {
      return [lat, lng];
    }

    return null;
  }, [lat, lng]);
  const [geocodedLocation, setGeocodedLocation] = useState(null);

  useEffect(() => {
    if (providedPosition || !address) return;

    let active = true;
    axios.get('https://nominatim.openstreetmap.org/search', {
      params: { q: address, format: 'json', limit: 1 }
    }).then(res => {
      if (!active) return;

      if (res.data?.length > 0) {
        setGeocodedLocation({
          address,
          position: [parseFloat(res.data[0].lat), parseFloat(res.data[0].lon)]
        });
      } else {
        setGeocodedLocation({ address, position: FALLBACK });
      }
    }).catch(() => {
      if (active) setGeocodedLocation({ address, position: FALLBACK });
    });

    return () => {
      active = false;
    };
  }, [address, providedPosition]);

  const position = providedPosition ||
    (geocodedLocation?.address === address ? geocodedLocation.position : null) ||
    (!address ? FALLBACK : null);

  if (!position) return (
    <div style={{ height: '200px', background: '#e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 'var(--radius-md)' }}>
      Loading Map...
    </div>
  );

  return (
    <div style={{ height: '200px', width: '100%', borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
      <MapContainer center={position} zoom={14} style={{ height: '100%', width: '100%' }}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker position={position}>
          <Popup>{address || 'Event Location'}</Popup>
        </Marker>
      </MapContainer>
    </div>
  );
};

export default MapComponent;
