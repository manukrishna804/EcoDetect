import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import styles from '../styles/PrecautionFirstAid.module.css';
import { protocols } from '../data/protocols';

export default function PrecautionFirstAid() {
  const location = useLocation();
  const navigate = useNavigate();

  // Expect state to contain the full result object from the previous page
  const stateResult = location.state?.result;
  const common_name = stateResult?.common_name || "Unknown Species";
  const image = stateResult?.image || location.state?.image;
  const danger_level = stateResult?.danger_level || "Unknown";

  // Determine the protocol key to use.
  // Ideally, the backend should return a 'protocol_id' (e.g. 'snakebite_neuro').
  // Since we only have 'danger_level', 'type' (sometimes), or need to guess based on species name,
  // we might need a fallback logic if the explicit key isn't passed.
  // For now, let's assume 'risk_info.protocol_id' might exist OR we map based on 'danger_level' + name.

  // FIX: Using the detected class name from `species.json` would be best if `risk_info` has it.
  // Let's assume the previous `species.json` refactor didn't explicitly add `protocol_id`.
  // We will try to fuzzy match or use a default based on danger.

  // HARDCODED MAPPING (Simulating backend logic based on the user's "Black Widow" example)
  // If the common name contains specific keywords, we map to our protocols.
  let protocolKey = "snakebite_non_venomous"; // Default
  const nameLower = common_name.toLowerCase();

  if (nameLower.includes("cobra") || nameLower.includes("krait") || nameLower.includes("mamba")) {
    protocolKey = "snakebite_neuro";
  } else if (nameLower.includes("viper") || nameLower.includes("rattlesnake") || nameLower.includes("adder")) {
    protocolKey = "snakebite_hemo";
  } else if (nameLower.includes("widow") || nameLower.includes("recluse")) {
    protocolKey = "spider_bite_mild"; // Or severe if we had it
  } else if (nameLower.includes("frog") || nameLower.includes("toad")) {
    protocolKey = nameLower.includes("dart") ? "frog_toxic" : "frog_bite";
  } else if (nameLower.includes("mosquito")) {
    protocolKey = "mosquito_bite_firstaid";
  }

  // Override if risk_info has explicit type (if we added that to backend)
  if (stateResult?.risk_info?.protocol_id && protocols[stateResult.risk_info.protocol_id]) {
    protocolKey = stateResult.risk_info.protocol_id;
  }

  const data = protocols[protocolKey] || protocols["snakebite_non_venomous"];

  // Scroll to top on mount
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const isHighRisk = danger_level.toLowerCase() === 'high' || danger_level.toLowerCase() === 'extreme';

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        {/* Header */}
        <header className={styles.header}>
          <button className={styles.backButton} onClick={() => navigate(-1)}>
            <span className="material-symbols-outlined">arrow_back_ios_new</span>
          </button>
          <h1 className={styles.title}>Precaution & First-Aid</h1>
          <span className="material-symbols-outlined" style={{ color: '#1f2937' }}>share</span>
        </header>

        {/* Hero Image */}
        <div
          className={styles.heroImageContainer}
          style={{ backgroundImage: `url(${image || 'https://via.placeholder.com/400'})` }}
        >
          {/* Gradient Overlay if needed */}
        </div>

        {/* Main Content */}
        <main className={styles.main}>

          {/* Species Info */}
          <div>
            <h2 className={styles.speciesTitle}>{common_name}</h2>
            <div className={styles.badgeRow}>
              {isHighRisk && (
                <span className={`${styles.badge} ${styles.badgeDanger}`}>
                  <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>warning</span>
                  High Danger
                </span>
              )}
              {/* Heuristic for venomous badge */}
              {(isHighRisk || nameLower.includes("venom")) && (
                <span className={`${styles.badge} ${styles.badgeVenom}`}>
                  <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>science</span>
                  Venomous
                </span>
              )}
              {!isHighRisk && (
                <span className={`${styles.badge} ${styles.badgeSafe}`}>
                  <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>check_circle</span>
                  Relatively Safe
                </span>
              )}
            </div>
          </div>

          {/* What To Do */}
          <section>
            <div className={styles.sectionHeader}>
              <span className="material-symbols-outlined" style={{ color: '#22c55e' }}>check_circle</span>
              What To Do
            </div>
            <div className={styles.listContainer}>
              {data.what_to_do.map((item, index) => (
                <div key={index} className={styles.listItem}>
                  <div className={`${styles.listItemIcon} ${styles.iconSuccess}`}>
                    <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>check</span>
                  </div>
                  <p className={styles.listItemText}>{item}</p>
                </div>
              ))}
            </div>
          </section>

          {/* What Not To Do (High Risk Only or Always?) - Reference shows Red Cross section */}
          {/* SOS Actions Block */}
          <div className={styles.actionButtons} style={{ marginBottom: '1.5rem', marginTop: '0.5rem' }}>
            <button className={styles.sosButton} onClick={() => window.location.href = 'tel:911'}>
              SOS Call <span style={{ fontSize: '0.8em', opacity: 0.8 }}>911</span>
            </button>
            <button className={styles.hospitalButton} onClick={() => window.open('https://www.google.com/maps/search/hospital+near+me', '_blank')}>
              <span className="material-symbols-outlined">local_hospital</span>
              Find Hospital
            </button>
          </div>

          {/* What Not To Do */}
          <section>
            <div className={styles.sectionHeader}>
              <span className="material-symbols-outlined" style={{ color: '#ef4444' }}>cancel</span>
              What Not To Do
            </div>

            <div className={styles.listContainer}>
              {data.what_not_to_do.map((item, index) => (
                <div key={index} className={styles.listItem} style={{ backgroundColor: '#fef2f2' }}>
                  <div className={`${styles.listItemIcon} ${styles.iconError}`}>
                    <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>close</span>
                  </div>
                  <p className={styles.listItemText}>{item}</p>
                </div>
              ))}
            </div>
          </section>

          {/* First Aid Steps Timeline */}
          <section>
            <div className={styles.sectionHeader}>
              <span className="material-symbols-outlined">medical_services</span>
              First-Aid Steps
            </div>
            <div className={styles.timeline}>
              {data.steps.map((step, index) => (
                <div key={index} className={styles.timelineItem}>
                  <div className={styles.stepNumber}>{index + 1}</div>
                  <div className={styles.stepContent}>
                    <h4 className={styles.stepTitle}>{step.title}</h4>
                    <p className={styles.stepDesc}>{step.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Symptoms */}
          <section>
            <div className={styles.sectionHeader}>
              <span className="material-symbols-outlined" style={{ color: '#f97316' }}>coronavirus</span>
              Symptoms
            </div>
            <div className={styles.symptomsGrid}>
              {data.symptoms.map((symptom, idx) => (
                <div key={idx} className={styles.symptomCard}>
                  {symptom}
                </div>
              ))}
            </div>
          </section>

        </main>
      </div>
    </div>
  );
}
