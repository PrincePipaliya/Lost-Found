import { GoogleMap, LoadScript, Marker } from "@react-google-maps/api";

export default function MapView({ items = [] }) {

  const mapContainerStyle = {
    width: "100%",
    height: "500px"
  };

  const center = {
    lat: 22.3039,   // Rajkot default center
    lng: 70.8022
  };

  const apiKey = process.env.REACT_APP_GOOGLE_MAPS_KEY;

  return (
    <LoadScript googleMapsApiKey={apiKey}>
      <GoogleMap
        mapContainerStyle={mapContainerStyle}
        zoom={12}
        center={center}
      >

        {items.map((item) => {

          if (!item.location || !item.location.coordinates) return null;

          const [lng, lat] = item.location.coordinates;

          return (
            <Marker
              key={item._id}
              position={{ lat, lng }}
              title={item.title}
            />
          );

        })}

      </GoogleMap>
    </LoadScript>
  );
}