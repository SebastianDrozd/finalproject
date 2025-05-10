"use client"
import { useState } from 'react';
import dynamic from 'next/dynamic';
import styles from '../components/UI.module.css';

const samples = [
  {
    name: 'Poland Polygon',
    data: {
      type: 'FeatureCollection',
      features: [
        {
          type: 'Feature',
          properties: { name: 'Kraków Area' },
          geometry: {
            type: 'Polygon',
            coordinates: [[
              [19.908, 50.059],
              [19.908, 50.07],
              [19.938, 50.07],
              [19.938, 50.059],
              [19.908, 50.059]
            ]]
          }
        }
      ]
    }
  },
  {
    name: 'Germany Cities',
    data: {
      type: 'FeatureCollection',
      features: [
        {
          type: 'Feature',
          properties: { name: 'Berlin', population: 3769000 },
          geometry: { type: 'Point', coordinates: [13.405, 52.52] }
        },
        {
          type: 'Feature',
          properties: { name: 'Munich', population: 1472000 },
          geometry: { type: 'Point', coordinates: [11.581, 48.1351] }
        }
      ]
    }
  },
  {
    name: 'Chicago Loop',
    data: {
      type: 'FeatureCollection',
      features: [
        {
          type: 'Feature',
          properties: { name: 'Chicago Loop' },
          geometry: {
            type: 'Polygon',
            coordinates: [[
              [-87.6314, 41.8785],
              [-87.6314, 41.8865],
              [-87.6214, 41.8865],
              [-87.6214, 41.8785],
              [-87.6314, 41.8785]
            ]]
          }
        }
      ]
    }
  },
  {
    name: 'World Capitals',
    data: {
      type: 'FeatureCollection',
      features: [
        {
          type: 'Feature',
          properties: { name: 'Washington D.C.' },
          geometry: { type: 'Point', coordinates: [-77.0369, 38.9072] }
        },
        {
          type: 'Feature',
          properties: { name: 'London' },
          geometry: { type: 'Point', coordinates: [-0.1276, 51.5072] }
        },
        {
          type: 'Feature',
          properties: { name: 'Tokyo' },
          geometry: { type: 'Point', coordinates: [139.6917, 35.6895] }
        }
      ]
    }
  },
  {
    name: 'Central Park NY',
    data: {
      type: 'FeatureCollection',
      features: [
        {
          type: 'Feature',
          properties: { name: 'Central Park' },
          geometry: {
            type: 'Polygon',
            coordinates: [[
              [-73.9731, 40.7644],
              [-73.9819, 40.7681],
              [-73.9580, 40.8005],
              [-73.9498, 40.7968],
              [-73.9731, 40.7644]
            ]]
          }
        }
      ]
    }
  }
  ,
  {
    name: 'US Cities',
    data: {
      type: 'FeatureCollection',
      features: [
        {
          type: 'Feature',
          properties: { name: 'New York', population: 8419000 },
          geometry: { type: 'Point', coordinates: [-74.006, 40.7128] }
        },
        {
          type: 'Feature',
          properties: { name: 'Los Angeles', population: 3980000 },
          geometry: { type: 'Point', coordinates: [-118.2437, 34.0522] }
        },
        {
          type: 'Feature',
          properties: { name: 'Chicago', population: 2716000 },
          geometry: { type: 'Point', coordinates: [-87.6298, 41.8781] }
        }
      ]
    }
  }
  
  
];

const GeoMap = dynamic(() => import('../components/GeoMap'), { ssr: false });

export default function Home() {
  const [geojsonData, setGeojsonData] = useState(null);
  const [textValue, setTextValue] = useState('');
  const [recentSearches, setRecentSearches] = useState([]);
  const [manualCoords, setManualCoords] = useState('');
  const [displayFeature, setDisplayFeature] = useState(false);
  const addToRecent = (parsed, rawText) => {
    setRecentSearches((prev) => [
      { parsed, rawText },
      ...prev.filter(r => r.rawText !== rawText) // avoid duplicates
    ].slice(0, 5)); // limit to last 5
  };

  const handleUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const text = evt.target.result;
        const parsed = JSON.parse(text);
        setGeojsonData(parsed);
        setTextValue(JSON.stringify(parsed, null, 2));
      } catch (err) {
        alert('Invalid GeoJSON file.');
      }
    };
    reader.readAsText(file);
    setGeojsonData(parsed);
    setTextValue(JSON.stringify(parsed, null, 2));
    addToRecent(parsed, JSON.stringify(parsed, null, 2));

  };

  const handleTextSubmit = () => {
    try {
      const parsed = JSON.parse(textValue);
      setGeojsonData(parsed);
      addToRecent(parsed, textValue);
    } catch (err) {
      alert('Invalid GeoJSON string.');
    }
  };

  const downloadGeoJSON = () => {
    const blob = new Blob([JSON.stringify(geojsonData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'geojson-data.geojson';
    a.click();
  };
  const generateGeoJSONFromCoords = (type) => {
    try {
      const coordPairs = manualCoords.split('|').map(coord => {
        const [lat, lng] = coord.trim().split(',').map(Number);
        if (isNaN(lat) || isNaN(lng)) throw new Error('Invalid coordinate format');
        return [lng, lat]; // GeoJSON expects [lng, lat]
      });

      let geometry;
      if (type === 'Point') {
        if (coordPairs.length !== 1) throw new Error('Point needs exactly one coordinate');
        geometry = { type: 'Point', coordinates: coordPairs[0] };
      } else if (type === 'LineString') {
        if (coordPairs.length < 2) throw new Error('LineString needs at least 2 coordinates');
        geometry = { type: 'LineString', coordinates: coordPairs };
      } else if (type === 'Polygon') {
        if (coordPairs.length < 3) throw new Error('Polygon needs at least 3 coordinates');
        // Polygon coordinates must be wrapped in an array and closed (first point = last point)
        if (coordPairs[0].toString() !== coordPairs[coordPairs.length - 1].toString()) {
          coordPairs.push(coordPairs[0]);
        }
        geometry = { type: 'Polygon', coordinates: [coordPairs] };
      }

      const geojson = {
        type: 'FeatureCollection',
        features: [
          {
            type: 'Feature',
            properties: { source: 'manual' },
            geometry
          }
        ]
      };

      const pretty = JSON.stringify(geojson, null, 2);
      setTextValue(pretty);
      setGeojsonData(geojson);
      addToRecent(geojson, pretty);
    } catch (err) {
      alert(err.message || 'Invalid input.');
    }
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>GeoJSON Visualizer</h1>

      <div className={styles.controls}>
        <label className={styles.label}>Upload GeoJSON File</label>
        <input type="file" accept=".json,.geojson" onChange={handleUpload} className={styles.fileInput} />

        <label className={styles.label}>Or Paste GeoJSON</label>
        <textarea
          className={styles.textarea}
          value={textValue}
          onChange={(e) => setTextValue(e.target.value)}
          placeholder="Paste your GeoJSON here..."
        />
        <div className={styles.buttonRow}>
          <button className={styles.button} onClick={handleTextSubmit}>Submit</button>
          <button className={styles.buttonSecondary} onClick={downloadGeoJSON}>Download</button>
          <button className={styles.buttonThird} onClick={() => setDisplayFeature(true)}>Create new Feature</button>
        </div>
      </div>
      {
        displayFeature &&   <div className={styles.manualInputSection}>
        <h3>Create a Feature from Coordinates</h3>
        <label className={styles.label}>Enter coordinates:</label>
        <textarea
          rows={3}
          className={styles.textarea}
          placeholder="Example: 52.52,13.4050 for a point. Multiple: 52.52,13.4050 | 48.13,11.58"
          value={manualCoords}
          onChange={(e) => setManualCoords(e.target.value)}
        />
        <div className={styles.buttonRow}>
          <button className={styles.button} onClick={() => generateGeoJSONFromCoords('Point')}>Point</button>
          <button className={styles.button} onClick={() => generateGeoJSONFromCoords('LineString')}>Line</button>
          <button className={styles.button} onClick={() => generateGeoJSONFromCoords('Polygon')}>Polygon</button>
        </div>
      </div>

      }
     <div className={styles.sampleSection}>
  <h3>Try Sample Datasets</h3>
  <div className={styles.recentList}>
    {samples.map((sample, index) => {
      const pretty = JSON.stringify(sample.data, null, 2);
      return (
        <button
          key={index}
          className={styles.recentButton}
          onClick={() => {
            setGeojsonData(sample.data);
            setTextValue(pretty);
          }}
        >
          {sample.name}
        </button>
      );
    })}
  </div>
</div>

      {recentSearches.length > 0 && (
        <div className={styles.recentSection}>
          <h3>My Recent Searches</h3>
          <div className={styles.recentList}>
            {recentSearches.map((item, index) => (
              <button
                key={index}
                className={styles.recentButton}
                onClick={() => {
                  setGeojsonData(item.parsed);
                  setTextValue(item.rawText);
                }}
              >
                GeoJSON {index + 1}
              </button>
            ))}
          </div>
        </div>
      )}
      <br />

      <div className={styles.mapContainer}>
        <GeoMap data={geojsonData} />
      </div>
    </div>
  );
}
