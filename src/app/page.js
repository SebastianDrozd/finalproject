"use client"
import { useState } from 'react';
import dynamic from 'next/dynamic';
import styles from '../components/UI.module.css';

const GeoMap = dynamic(() => import('../components/GeoMap'), { ssr: false });

export default function Home() {
  const [geojsonData, setGeojsonData] = useState(null);
  const [textValue, setTextValue] = useState('');
  const [recentSearches, setRecentSearches] = useState([]);

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
<br/>

      <div className={styles.mapContainer}>
        <GeoMap data={geojsonData} />
      </div>
    </div>
  );
}
