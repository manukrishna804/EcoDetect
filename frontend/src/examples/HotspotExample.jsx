/**
 * Example component showing how to use the hotspot service
 * This is a reference implementation - integrate this into your actual pages
 */
import React, { useState, useEffect } from 'react';
import { 
  getHotspotsFromFirestore, 
  getHotspotsFromAPI, 
  triggerHotspotAnalysis,
  getAlerts 
} from '../services/hotspotService';

const HotspotExample = () => {
  const [hotspots, setHotspots] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch hotspots on component mount
  useEffect(() => {
    loadHotspots();
    loadAlerts();
  }, []);

  const loadHotspots = async () => {
    setLoading(true);
    setError(null);
    try {
      // Option 1: Fetch directly from Firestore (recommended for real-time updates)
      const data = await getHotspotsFromFirestore();
      setHotspots(data);
      
      // Option 2: Fetch from API (uncomment to use instead)
      // const data = await getHotspotsFromAPI();
      // setHotspots(data);
    } catch (err) {
      setError(err.message);
      console.error('Error loading hotspots:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadAlerts = async () => {
    try {
      const data = await getAlerts(5); // Get latest 5 alerts
      setAlerts(data);
    } catch (err) {
      console.error('Error loading alerts:', err);
    }
  };

  const handleRunAnalysis = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await triggerHotspotAnalysis();
      console.log('Hotspot analysis result:', result);
      
      // Reload hotspots after analysis
      await loadHotspots();
      await loadAlerts();
      
      alert(`Hotspot analysis completed! Created ${result.hotspots_created} hotspot(s).`);
    } catch (err) {
      setError(err.message);
      console.error('Error running hotspot analysis:', err);
      alert('Failed to run hotspot analysis. Check console for details.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <h1>Hotspot Management</h1>
      
      <div style={{ marginBottom: '20px' }}>
        <button 
          onClick={handleRunAnalysis} 
          disabled={loading}
          style={{
            padding: '10px 20px',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: loading ? 'not-allowed' : 'pointer',
            marginRight: '10px'
          }}
        >
          {loading ? 'Running Analysis...' : 'Run Hotspot Analysis'}
        </button>
        <button 
          onClick={loadHotspots} 
          disabled={loading}
          style={{
            padding: '10px 20px',
            backgroundColor: '#28a745',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: loading ? 'not-allowed' : 'pointer'
          }}
        >
          Refresh Hotspots
        </button>
      </div>

      {error && (
        <div style={{ 
          padding: '10px', 
          backgroundColor: '#f8d7da', 
          color: '#721c24', 
          borderRadius: '5px',
          marginBottom: '20px'
        }}>
          Error: {error}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
        {/* Hotspots Section */}
        <div>
          <h2>Hotspots ({hotspots.length})</h2>
          {loading && hotspots.length === 0 ? (
            <p>Loading hotspots...</p>
          ) : hotspots.length === 0 ? (
            <p>No hotspots found. Run hotspot analysis to create hotspots.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              {hotspots.map((hotspot) => (
                <div 
                  key={hotspot.id}
                  style={{
                    border: '1px solid #ddd',
                    borderRadius: '8px',
                    padding: '15px',
                    backgroundColor: '#f9f9f9'
                  }}
                >
                  <h3 style={{ marginTop: 0 }}>
                    {hotspot.species} - {hotspot.danger_level} Risk
                  </h3>
                  <p><strong>Location:</strong> ({hotspot.center?.lat?.toFixed(4)}, {hotspot.center?.lng?.toFixed(4)})</p>
                  <p><strong>Detections:</strong> {hotspot.detection_count}</p>
                  <p><strong>Summary:</strong> {hotspot.species_summary}</p>
                  <p><strong>Radius:</strong> {hotspot.radius_km} km</p>
                  {hotspot.updated_at && (
                    <p style={{ fontSize: '0.9em', color: '#666' }}>
                      Updated: {new Date(hotspot.updated_at?.toDate?.() || hotspot.updated_at).toLocaleString()}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Alerts Section */}
        <div>
          <h2>Recent Alerts ({alerts.length})</h2>
          {alerts.length === 0 ? (
            <p>No alerts found.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {alerts.map((alert) => (
                <div 
                  key={alert.id}
                  style={{
                    border: '1px solid #ffc107',
                    borderRadius: '8px',
                    padding: '12px',
                    backgroundColor: '#fff3cd'
                  }}
                >
                  <p style={{ margin: 0, fontWeight: 'bold' }}>{alert.species}</p>
                  <p style={{ margin: '5px 0', fontSize: '0.9em' }}>{alert.message}</p>
                  {alert.created_at && (
                    <p style={{ margin: 0, fontSize: '0.8em', color: '#666' }}>
                      {new Date(alert.created_at?.toDate?.() || alert.created_at).toLocaleString()}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default HotspotExample;

