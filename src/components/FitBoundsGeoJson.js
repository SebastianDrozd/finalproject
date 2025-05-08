import { useMap } from 'react-leaflet';
import { useEffect } from 'react';
import L from 'leaflet';

export default function FitBoundsGeoJSON({ data }) {
  const map = useMap();

  useEffect(() => {
    if (!data) return;

    const geojsonLayer = L.geoJSON(data);
    const bounds = geojsonLayer.getBounds();
    if (bounds.isValid()) {
      map.fitBounds(bounds);
    }
  }, [data, map]);

  return null; // no visual element
}
