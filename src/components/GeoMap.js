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
  style={() => ({
    color: 'red',         // only applies to LineString/Polygon
    weight: 2,
    fillColor: 'orange',
    fillOpacity: 0.5
  })}
  pointToLayer={(feature, latlng) => {
    return L.circleMarker(latlng, {
      radius: 8,
      fillColor: '#0070f3',
      color: '#fff',
      weight: 2,
      opacity: 1,
      fillOpacity: 0.9
    });
  }}
  onEachFeature={(feature, layer) => {
    if (feature.properties?.name) {
      const props = feature.properties;
      layer.bindPopup(`<b>${props.name}</b><br/>Population: ${props.population?.toLocaleString()}`);
    }
  }}
/>

          <FitBoundsGeoJSON data={data} />
        </>
      )}
    </MapContainer>
  );
}
