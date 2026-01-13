import { useLocation, useNavigate } from 'react-router-dom';
import styles from '../styles/DetectResult.module.css';


export default function DetectResult() {
  const location = useLocation();
  const navigate = useNavigate();

  const stateResult = location.state?.result;

  // Minimal fallback if no result (should logicallly redirect)
  if (!stateResult) {
    return (
      <div className={styles.page}>
        <div className={styles.container} style={{ justifyContent: 'center', alignItems: 'center' }}>
          <p>No result data available.</p>
          <button className={styles.primaryButton} onClick={() => navigate('/detect')} style={{ width: 'auto' }}>
            Return to Detect
          </button>
        </div>
      </div>
    );
  }

  const { common_name, species_name, danger_level, confidence_score, ai_note, risk_info, scientific_name } = stateResult;

  // Danger Level Styling (Strict Rule: High=Red, Medium=Orange, Low=Green, Unknown=Grey)
  const level = danger_level ? danger_level.toLowerCase() : 'unknown';
  let badgeStyle = {};
  let badgeClass = '';
  let iconName = 'help';

  switch (level) {
    case 'extreme':
    case 'high':
      badgeClass = styles.badgeHigh;
      iconName = 'warning';
      break;
    case 'medium':
      badgeClass = styles.badgeMedium;
      iconName = 'info';
      break;
    case 'low':
      badgeClass = styles.badgeLow;
      iconName = 'check_circle';
      break;
    default:
      // Unknown -> Grey (Custom inline since class doesn't exist)
      badgeStyle = {
        backgroundColor: '#f3f4f6',
        border: '1px solid #d1d5db',
        color: '#4b5563'
      };
      badgeClass = styles.badge; // Base class
      iconName = 'help';
      break;
  }

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        {/* Header */}
        <header className={styles.header}>
          <button className={styles.backButton} onClick={() => navigate('/detect')}>
            <span className="material-symbols-outlined" style={{ fontSize: '24px' }}>arrow_back</span>
          </button>
          <h2 className={styles.title}>Detection Result</h2>
          <div style={{ width: '2.5rem' }}></div> {/* Spacer for alignment */}
        </header>

        {/* Main Content */}
        <main className={styles.main}>
          {/* Main Card */}
          <div className={styles.resultCard}>

            {/* Image */}
            <div
              className={styles.cardImage}
              style={{ backgroundImage: `url(${stateResult.image || location.state?.image})` }}
            >
              <div className={styles.imageOverlay}></div>
            </div>

            <div className={styles.cardBody}>

              {/* Header Row: Title & Badge */}
              <div className={styles.headerRow}>
                <div className={styles.speciesMainInfo}>
                  <h3 className={styles.speciesName}>{common_name || 'Unknown Species'}</h3>
                  {scientific_name && (
                    <p className={styles.scientificName}>{scientific_name}</p>
                  )}
                </div>

                <span className={`${styles.badge} ${badgeClass}`}>
                  <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>
                    {iconName}
                  </span>
                  {danger_level || 'Unknown'} Risk
                </span>
              </div>

              {/* Description / AI Note */}
              <p className={styles.descriptionBox}>
                {ai_note || "No specific description available for this species."}
              </p>

              {/* Confidence Score */}
              <div className={styles.confidenceSection}>
                <div className={styles.confidenceHeader}>
                  <p className={styles.confidenceLabel}>Confidence Score</p>
                  <p className={styles.confidenceValue}>{Math.round((confidence_score || 0) * 100)}% Match</p>
                </div>
                <div className={styles.progressBarTrack}>
                  <div
                    className={styles.progressBarFill}
                    style={{ width: `${(confidence_score || 0) * 100}%` }}
                  ></div>
                </div>
              </div>

            </div>
          </div>

          {/* Secondary Card: Community Alert / Possible Effects */}
          {risk_info?.possible_effects && risk_info.possible_effects.length > 0 && (
            <div className={styles.alertCard}>
              <div className={styles.alertIconWrapper}>
                <span className="material-symbols-outlined" style={{ fontSize: '24px' }}>notifications_active</span>
              </div>
              <div className={styles.alertContent}>
                <p className={styles.alertTitle}>Community Alert</p>
                <p className={styles.alertText}>Sightings reported in your area recently.</p>

                <div className={styles.tagsContainer}>
                  {risk_info.possible_effects.map((effect, idx) => (
                    <span key={idx} className={styles.tag}>
                      {effect}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}

        </main>

        {/* Sticky Footer Actions */}
        <div className={styles.footer}>
          <div className={styles.actions}>
            <button
              className={styles.primaryButton}
              onClick={() => navigate('/precaution', {
                state: {
                  result: stateResult,
                  image: stateResult.image || location.state?.image
                }
              })}
            >
              <span className="material-symbols-outlined" style={{ marginRight: '0.5rem' }}>
                shield
              </span>
              View Precautions
            </button>

            <button className={styles.secondaryButton} onClick={() => navigate('/detect')}>
              <span className="material-symbols-outlined" style={{ marginRight: '0.5rem' }}>
                center_focus_weak
              </span>
              Detect Another Image
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
