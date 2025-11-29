import React, { useState, useCallback, useEffect } from 'react';
import { GoogleMap, useJsApiLoader, Marker, InfoWindow } from '@react-google-maps/api';

const containerStyle = {
  width: '100%',
  height: '100%',
  minHeight: '400px',
  borderRadius: '1rem'
};

// Fallback center (New York) - used only if no data is available
const defaultCenter = {
  lat: 40.7128,
  lng: -74.0060
};

const MapComponent = ({ listings = [], onMapClick, newListingLocation }) => {
  const { isLoaded, loadError } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY
  });

  const [map, setMap] = useState(null);
  const [selectedListing, setSelectedListing] = useState(null);

  const onLoad = useCallback(function callback(map) {
    setMap(map);
  }, []);

  const onUnmount = useCallback(function callback(map) {
    setMap(null);
  }, []);

  // Automatically adjust map bounds when listings change
  useEffect(() => {
    if (map && listings.length > 0) {
      const bounds = new window.google.maps.LatLngBounds();
      let hasValidLocation = false;

      listings.forEach(listing => {
        if (listing.location && typeof listing.location.lat === 'number' && typeof listing.location.lng === 'number') {
          bounds.extend({ lat: listing.location.lat, lng: listing.location.lng });
          hasValidLocation = true;
        }
      });

      if (hasValidLocation) {
        map.fitBounds(bounds);
      }
    }
  }, [map, listings]);

  if (loadError) return <div style={{height: '400px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f3f4f6', borderRadius: '1rem'}}>Error loading maps</div>;

  if (!isLoaded) return <div style={{height: '400px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f3f4f6', borderRadius: '1rem'}}>Loading Maps...</div>;

  return (
    <GoogleMap
      mapContainerStyle={containerStyle}
      center={defaultCenter}
      zoom={12}
      onLoad={onLoad}
      onUnmount={onUnmount}
      onClick={onMapClick} // Enable clicking on the map
    >
      {/* Render Markers for each listing */}
      {listings.map((listing) => (
        listing.location && listing.location.lat && (
            <Marker
                key={listing._id}
                position={{ lat: listing.location.lat, lng: listing.location.lng }}
                onClick={() => setSelectedListing(listing)}
            />
        )
      ))}

      {/* Temporary Marker for New Listing being created */}
      {newListingLocation && newListingLocation.lat && (
          <Marker 
            position={newListingLocation} 
            label="New"
          />
      )}

      {/* InfoWindow for selected listing details */}
      {selectedListing && (
        <InfoWindow
          position={{ lat: selectedListing.location.lat, lng: selectedListing.location.lng }}
          onCloseClick={() => setSelectedListing(null)}
        >
          <div style={{ padding: '5px', color: '#333', maxWidth: '200px' }}>
            <h3 style={{ margin: '0 0 5px 0', fontSize: '1rem', fontWeight: '600' }}>{selectedListing.itemName}</h3>
            <p style={{ margin: 0, fontSize: '0.9rem' }}><strong>Qty:</strong> {selectedListing.quantity}</p>
            <p style={{ fontSize: '0.8rem', color: '#666', marginTop: '4px' }}>
                {selectedListing.donorId?.organizationName}
            </p>
             <p style={{ fontSize: '0.8rem', color: '#666', marginTop: '2px', fontStyle: 'italic' }}>
                {selectedListing.location.address || 'Location pinned'}
            </p>
          </div>
        </InfoWindow>
      )}
    </GoogleMap>
  );
};

export default MapComponent;