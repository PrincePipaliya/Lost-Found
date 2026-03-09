import { GoogleMap, LoadScript, Marker } from "@react-google-maps/api";
import { useState } from "react";

export default function LocationPicker({ onLocationSelect }) {

  const apiKey = process.env.REACT_APP_GOOGLE_MAPS_KEY;

  const mapContainerStyle = {
    width: "100%",
    height: "300px"
  };

  const defaultCenter = {
    lat: 22.3039,
    lng: 70.8022
  };

  const [marker, setMarker] = useState(null);
  const [center, setCenter] = useState(defaultCenter);

  const handleMapClick = (e) => {

    const lat = e.latLng.lat();
    const lng = e.latLng.lng();

    const location = { lat, lng };

    setMarker(location);

    if (onLocationSelect) {
      onLocationSelect(location);
    }

  };

  /* AUTO LOCATION */

  const detectLocation = () => {

    if (!navigator.geolocation) {
      alert("Geolocation not supported");
      return;
    }

    navigator.geolocation.getCurrentPosition(

      (position) => {

        const lat = position.coords.latitude;
        const lng = position.coords.longitude;

        const location = { lat, lng };

        setCenter(location);
        setMarker(location);

        if (onLocationSelect) {
          onLocationSelect(location);
        }

      },

      () => {
        alert("Unable to retrieve location");
      }

    );

  };

  return (

    <div>

      <button
        type="button"
        onClick={detectLocation}
        className="mb-3 bg-green-600 text-white px-3 py-1 rounded"
      >
        Use My Location
      </button>

      <LoadScript googleMapsApiKey={apiKey}>

        <GoogleMap
          mapContainerStyle={mapContainerStyle}
          zoom={13}
          center={center}
          onClick={handleMapClick}
        >

          {marker && <Marker position={marker} />}

        </GoogleMap>

      </LoadScript>

    </div>

  );

}