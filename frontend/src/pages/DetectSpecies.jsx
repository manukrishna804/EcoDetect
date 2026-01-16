import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from '../styles/DetectSpecies.module.css';
import { saveDetection } from "../services/detectionService";



export default function DetectSpecies() {
  const navigate = useNavigate();
  const [image, setImage] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  // Camera State
  const [showCamera, setShowCamera] = useState(false);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);

  // Location Permission State
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [locationData, setLocationData] = useState({ lat: null, lng: null, allowed: false });

  // Check if location permission has been asked this session
  useEffect(() => {
    if (!localStorage.getItem("tempUserId")) {
      localStorage.setItem(
        "tempUserId",
        "anon_" + Math.random().toString(36).substring(2, 10)
      );
    }

    const hasAsked = sessionStorage.getItem('hasAskedLocation');
    if (!hasAsked) {
      // Small delay for better UX
      const timer = setTimeout(() => setShowLocationModal(true), 500);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAllowLocation = () => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocationData({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            allowed: true
          });
          sessionStorage.setItem('hasAskedLocation', 'true');
          setShowLocationModal(false);
        },
        (error) => {
          console.error("Location access denied or failed:", error);
          // Fail silently as requested, treat as skip
          handleSkipLocation();
        }
      );
    } else {
      handleSkipLocation();
    }
  };

  const handleSkipLocation = () => {
    setLocationData({ lat: null, lng: null, allowed: false });
    sessionStorage.setItem('hasAskedLocation', 'true');
    setShowLocationModal(false);
  };


  const fileInputRef = useRef(null);
  const cameraInputRef = useRef(null);

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setImage(imageUrl);
      setSelectedFile(file);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      const imageUrl = URL.createObjectURL(file);
      setImage(imageUrl);
      setSelectedFile(file);
    }
  };

  const triggerGallery = () => {
    fileInputRef.current.click();
  };

  // Camera Functions
  const startCamera = async () => {
    try {
      setShowCamera(true);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.error("Error accessing camera:", err);
      alert("Could not access camera. Please check permissions.");
      setShowCamera(false);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setShowCamera(false);
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');

      // Set canvas dimensions to match video
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      // Draw video frame to canvas
      context.drawImage(video, 0, 0, canvas.width, canvas.height);

      // Convert to file
      canvas.toBlob((blob) => {
        const file = new File([blob], "camera_capture.jpg", { type: "image/jpeg" });
        const imageUrl = URL.createObjectURL(file);

        setImage(imageUrl);
        setSelectedFile(file);
        stopCamera();
      }, 'image/jpeg');
    }
  };

  const handleDetect = async () => {
    if (!image || !selectedFile) return;

    setIsProcessing(true);
    const formData = new FormData();
    formData.append('image', selectedFile);

    try {
      const response = await fetch('http://127.0.0.1:5000/detect', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Detection failed');
      }

      const result = await response.json();
      console.log("DETECTION RESULT FROM BACKEND:", result);

      const detectionData = {
  tempUserId: localStorage.getItem("tempUserId"),

  location: {
    lat: locationData.lat ?? null,
    lng: locationData.lng ?? null,
    available: locationData.allowed
  },

  // ✅ FIXED FIELD MAPPING
  detected_class: result.species_name || result.common_name || "unknown",

  // ✅ CATEGORY IS NOT FROM BACKEND → SET SAFELY
  category: result.category || "unknown",

  // ✅ SAFE OPTIONAL FIELDS
  scientific_name: result.scientific_name || "unknown",
  venomous: result.venomous ?? false,
  danger_level: result.danger_level || "unknown",
  confidence: result.confidence_score ?? 0
};

      saveDetection(detectionData);
      navigate('/result', { state: { result: result, image: image } });
    } catch (error) {
      console.error('Error detecting species:', error);
      alert('Failed to detect species. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className={styles.page}>

      {/* Location Permission Modal */}
      {showLocationModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <div className={styles.modalIcon}>
              <span className="material-symbols-outlined">location_on</span>
            </div>
            <h3 className={styles.modalTitle}>Enable Location?</h3>
            <p className={styles.modalText}>
              We use your location to provide nearby wildlife safety alerts and hotspots.
            </p>
            <div className={styles.modalActions}>
              <button className={styles.modalAllowBtn} onClick={handleAllowLocation}>
                Allow Location
              </button>
              <button className={styles.modalSkipBtn} onClick={handleSkipLocation}>
                Skip
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Camera Overlay */}
      {showCamera && (
        <div className={styles.cameraOverlay}>
          <button className={styles.closeCameraBtn} onClick={stopCamera}>
            <span className="material-symbols-outlined">close</span>
          </button>
          <div className={styles.cameraView}>
            <video
              ref={videoRef}
              autoPlay
              playsInline
              className={styles.videoFeed}
            />
            <canvas ref={canvasRef} style={{ display: 'none' }} />
          </div>
          <div className={styles.cameraControls}>
            <button className={styles.captureBtn} onClick={capturePhoto}></button>
          </div>
        </div>
      )}

      {/* Hidden Inputs */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileSelect}
        accept="image/*"
        style={{ display: 'none' }}
      />
      {/* Keeping legacy input for fallback if needed, but primary is custom now */}
      <input
        type="file"
        ref={cameraInputRef}
        onChange={handleFileSelect}
        accept="image/*"
        capture="environment"
        style={{ display: 'none' }}
      />

      {/* Header */}
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <button className={styles.iconButton} onClick={() => navigate(-1)}>
            <span className="material-symbols-outlined" style={{ fontSize: '1.5rem' }}>arrow_back_ios_new</span>
          </button>
          <h1 className={styles.title}>Detect Species</h1>
          <button className={styles.iconButton}>
            <span className="material-symbols-outlined" style={{ fontSize: '1.5rem' }}>help</span>
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className={styles.main}>
        {/* Upload Section */}
        <div className={styles.uploadSection}>
          <div className={styles.uploadCard} onClick={triggerGallery}>
            <div
              className={`${styles.uploadBox} ${isDragging ? styles.dragging : ''}`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <div className={styles.uploadIconWrapper}>
                <span className="material-symbols-outlined" style={{ fontSize: '2.25rem' }}>cloud_upload</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.25rem', textAlign: 'center' }}>
                <p className={styles.uploadTextPrimary}>Upload Photo</p>
                <p className={styles.uploadTextSecondary}>Drag & drop or select from gallery</p>
              </div>
              <button className={styles.galleryButton} onClick={(e) => { e.stopPropagation(); triggerGallery(); }}>
                <span className="material-symbols-outlined" style={{ fontSize: '1.125rem', marginRight: '0.5rem' }}>image</span>
                Choose from Gallery
              </button>
            </div>
          </div>

          {/* Divider */}
          <div className={styles.dividerWrapper}>
            <div className={styles.dividerLine}></div>
            <span className={styles.dividerText}>OR</span>
            <div className={styles.dividerLine}></div>
          </div>

          {/* Camera Button - Updated to trigger custom camera */}
          <button className={styles.cameraButton} onClick={startCamera}>
            <div className={styles.cameraIconWrapper}>
              <span className="material-symbols-outlined" style={{ fontSize: '1.25rem' }}>photo_camera</span>
            </div>
            <span className={styles.cameraButtonText}>Open Camera</span>
          </button>
        </div>

        {/* Recent Capture Section */}
        {image && (
          <div className={styles.recentCaptureSection}>
            <div className={styles.sectionHeader}>
              <h3 className={styles.sectionTitle}>Recent Capture</h3>
              <button className={styles.viewAllButton}>View All</button>
            </div>
            <div className={styles.previewCard}>
              <img
                alt="Captured content"
                className={styles.previewImage}
                src={image}
              />
              <div className={styles.imageOverlay}></div>

              {/* Status Badge */}
              <div className={styles.statusBadge}>
                <span className={styles.statusDot}></span>
                <span className={styles.statusText}>Ready to scan</span>
              </div>

              {/* Delete Button */}
              <button className={styles.deleteButton} onClick={() => { setImage(null); setSelectedFile(null); }}>
                <span className="material-symbols-outlined" style={{ fontSize: '1.125rem' }}>close</span>
              </button>

              {/* File Info Overlay */}
              <div className={styles.fileInfo}>
                <p className={styles.fileName}>Selected Image</p>
                <p className={styles.fileMeta}>Ready to process</p>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer Action */}
      <div className={styles.footer}>
        <div className={styles.footerContent}>
          <button
            className={styles.detectButton}
            onClick={handleDetect}
            disabled={!image}
            style={{ opacity: !image ? 0.7 : 1, cursor: !image ? 'not-allowed' : 'pointer' }}
          >
            <span className="material-symbols-outlined">search_check</span>
            {isProcessing ? 'Processing...' : 'Detect Species'}
          </button>
        </div>
      </div>
    </div>
  );
}
