import { useLocation, useNavigate } from 'react-router-dom';
import styles from '../styles/DetectResult.module.css';
import snakesData from '../dummy/snakes.json';

export default function DetectResult() {
  const location = useLocation();
  const navigate = useNavigate();

  // TEST PURPOSE: Use 1st snake as default if no state provided
  const testSnake = snakesData[6];
  const stateResult = location.state?.result;
  const stateImage = location.state?.image;

  const result = stateResult || testSnake;
  const image = stateImage || testSnake.image; // Use snake image if no user capture

  // If no data (and no test data), we might want to redirect back or show a placeholder
  if (!result) {
    return (
      <div className={styles.page}>
        <div className={styles.container} style={{ justifyContent: 'center', alignItems: 'center' }}>
          <p>No result data found.</p>
          <button className={styles.primaryButton} onClick={() => navigate('/detect')} style={{ width: 'auto' }}>
            Go back to Detect
          </button>
        </div>
      </div>
    );
  }

  // Determine risk style
  let riskBadgeStyle = styles.badgeLow;
  let riskIcon = 'check_circle'; // Default icon

  if (result.risk === 'High') {
    riskBadgeStyle = styles.badgeHigh;
    riskIcon = 'warning';
  } else if (result.risk === 'Medium') {
    riskBadgeStyle = styles.badgeMedium;
    riskIcon = 'info';
  }

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        {/* Header */}
        <header className={styles.header}>
          <button className={styles.backButton} onClick={() => navigate('/detect')}>
            <span className="material-symbols-outlined">arrow_back</span>
          </button>
          <h2 className={styles.title}>Detection Result</h2>
        </header>

        {/* Main Content (Scrollable) */}
        <main className={styles.main}>
          {/* Result Card */}
          <div className={styles.resultCard}>
            {/* Card Image - Using the species reference image from JSON */}
            <div
              className={styles.cardImage}
              style={{
                backgroundImage: `url("${result.image}")`,
              }}
            >
              {/* Gradient Overlay for visual depth */}
              <div className={styles.imageOverlay}></div>
            </div>

            {/* Card Body */}
            <div className={styles.cardBody}>
              {/* Species & Badge Header */}
              <div className={styles.speciesHeader}>
                <div className={styles.speciesTitleRow}>
                  <h3 className={styles.speciesName}>{result.name}</h3>
                  <span className={`${styles.badge} ${riskBadgeStyle}`}>
                    <span
                      className="material-symbols-outlined"
                      style={{ fontSize: '16px' }}
                    >
                      {riskIcon}
                    </span>
                    {result.risk} Risk
                  </span>
                </div>
                <p className={styles.scientificName}>{result.biological_name}</p>
              </div>

              {/* Description */}
              <p className={styles.description}>
                {result.description}
              </p>

              {/* Divider */}
              <div className={styles.divider}></div>

              {/* Confidence Meter */}
              <div className={styles.confidenceSection}>
                <div className={styles.confidenceHeader}>
                  <p className={styles.confidenceLabel}>Confidence Score</p>
                  <p className={styles.confidenceValue}>{Math.round(result.confidence_score * 100)}% Match</p>
                </div>
                <div className={styles.progressBarTrack}>
                  <div
                    className={styles.progressBarFill}
                    style={{ width: `${result.confidence_score * 100}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>


        </main>

        {/* Sticky Footer Actions */}
        <div className={styles.footer}>
          <div className={styles.actions}>
            {/* Primary Button */}
            <button className={styles.primaryButton} onClick={() => navigate('/precaution')}>
              <span
                className="material-symbols-outlined"
                style={{ marginRight: '0.5rem', fontSize: '20px' }}
              >
                shield
              </span>
              <span className={styles.truncate}>View Precautions</span>
            </button>
            {/* Secondary Button */}
            <button className={styles.secondaryButton} onClick={() => navigate('/detect')}>
              <span
                className="material-symbols-outlined"
                style={{ marginRight: '0.5rem', fontSize: '20px' }}
              >
                center_focus_weak
              </span>
              <span className={styles.truncate}>Detect Another Image</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
