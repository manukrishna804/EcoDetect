import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from '../styles/DetectSpecies.module.css';


export default function DetectSpecies() {
  const navigate = useNavigate();
  const [image, setImage] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
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

  const triggerCamera = () => {
    cameraInputRef.current.click();
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
      {/* Hidden Inputs */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileSelect}
        accept="image/*"
        style={{ display: 'none' }}
      />
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

          {/* Camera Button */}
          <button className={styles.cameraButton} onClick={triggerCamera}>
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
