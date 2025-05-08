import { MapContainer, TileLayer, GeoJSON } from 'react-leaflet';
import FitBoundsGeoJSON from './FitBoundsGeoJson';
import 'leaflet/dist/leaflet.css';
export default function GeoMap({ data }) {
  const geoJSONStyle = {
    color: 'red',
    weight: 2,
    fillColor: 'orange',
    fillOpacity: 0.5
  };

  return (
    <MapContainer center={[50.0647, 19.945]} zoom={13} style={{ height: '600px', width: '100%' }}>
      <TileLayer
        attribution="&copy; OpenStreetMap contributors"
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {data && (
        <>
          <GeoJSON
            key={JSON.stringify(data)}
            data={data}
            style={() => geoJSONStyle}
            onEachFeature={(feature, layer) => {
              if (feature.properties?.name) {
                layer.bindPopup(`<b>${feature.properties.name}</b>`);
              }
            }}
          />
          <FitBoundsGeoJSON data={data} />
        </>
      )}
    </MapContainer>
  );
}
