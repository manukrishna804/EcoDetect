import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './SeasonalAlerts.css';

// ─── Static seasonal data (Kerala / India context) ───────────────────────────
const MONTHLY_DATA = [
    {
        month: 'January',
        risk: 'Low',
        reason: 'Cooler weather reduces snake movement and activity.',
        details:
            'In January, lower temperatures cause snakes to become sluggish and they rarely venture far from their shelters. Human encounters are uncommon. Ideal time to clear overgrown vegetation safely.',
        tips: [
            'Clear dead leaves and debris from around your home.',
            'Inspect storage areas and sheds before reaching inside.',
            'Stay alert near rocks and stone walls during warmer afternoons.',
        ],
    },
    {
        month: 'February',
        risk: 'Low',
        reason: 'Cool conditions keep snakes mostly inactive.',
        details:
            'February remains cool across Kerala. Snakes are largely inactive, sheltering underground or in crevices. However, isolated warming spells can trigger brief activity, especially near midday.',
        tips: [
            'Wear boots or closed footwear when walking on trails.',
            'Check corners and dark areas before gardening.',
            'Keep the area around your home clear of clutter.',
        ],
    },
    {
        month: 'March',
        risk: 'Moderate',
        reason: 'Rising heat increases snake movement toward water sources.',
        details:
            'As temperatures climb in March, snakes become more active searching for food and water. Encounters increase near irrigation canals, ponds, and paddy fields. Evening and early morning hours see the most activity.',
        tips: [
            'Be cautious near water bodies and farmland edges.',
            'Avoid walking barefoot in grass or on muddy paths.',
            'Use a torch when moving after dark.',
        ],
    },
    {
        month: 'April',
        risk: 'Moderate',
        reason: 'Peak summer warmth drives snakes to seek cool, shaded areas.',
        details:
            'April marks peak summer in Kerala. Snakes seek shade near homes, under vehicles, and inside godowns. Activity is highest during early morning and late evening. Viper and cobra sightings increase near residential areas.',
        tips: [
            'Check under vehicles and inside sheds before entering.',
            'Seal gaps in walls and doors to prevent entry.',
            'Keep children away from overgrown or cluttered areas.',
        ],
    },
    {
        month: 'May',
        risk: 'Moderate',
        reason: 'Pre-monsoon heat keeps snakes active; mating season peaks.',
        details:
            'May sees continued high temperatures. It is also the mating season for several species, making snakes more territorial and defensive. Pre-monsoon rain showers begin to drive snakes to higher, drier ground near human habitation.',
        tips: [
            'Do not provoke or corner any snake; back away slowly.',
            'Wear gumboots when working in fields or gardens.',
            'Educate children to never approach or touch unknown animals.',
        ],
    },
    {
        month: 'June',
        risk: 'High',
        reason: 'Monsoon onset displaces snakes from flooded burrows into homes.',
        details:
            'June marks the official monsoon onset in Kerala. Heavy rainfall floods snake burrows and ground shelters, forcing them into homes, roads, and elevated areas. This is statistically the highest-risk month for snake encounters across the state.',
        tips: [
            'Keep all ground-level openings of your home sealed.',
            'Do not reach into piles of debris or waterlogged vegetation.',
            'Save the local snake rescue helpline number for emergencies.',
        ],
    },
    {
        month: 'July',
        risk: 'High',
        reason: 'Continuous flooding keeps snakes displaced; visibility is poor.',
        details:
            'July experiences the heaviest rainfall in Kerala. Flooding continues to displace large numbers of snakes. Poor visibility due to rain and overgrown vegetation makes encounters unpredictable. Night movement is especially dangerous near paddy fields.',
        tips: [
            'Always use a torch at night; never step in puddles without looking.',
            'Wear rubber boots when outdoors during rain.',
            'Do not walk through flooded fields or roads unnecessarily.',
        ],
    },
    {
        month: 'August',
        risk: 'High',
        reason: 'Flood-displaced snakes remain active; high humidity sustains movement.',
        details:
            'August continues to pose high risk as flood effects persist. High humidity keeps snakes active throughout the day and night. Rescue teams report the greatest number of calls during July–August in Kerala.',
        tips: [
            'Check your toilet, bathroom corners, and kitchen before use in flood-prone areas.',
            'Cooperate with local snake rescue volunteers.',
            'Avoid storing water containers near entrances — they attract prey and snakes.',
        ],
    },
    {
        month: 'September',
        risk: 'High',
        reason: 'Late monsoon continues to sustain displacement and encounters.',
        details:
            'September sees gradually reducing but still significant rainfall. Snake activity remains elevated. As waters recede, snakes begin returning to natural habitats but may still shelter in homes and outbuildings during the transition.',
        tips: [
            'Inspect all rooms and storage areas after floodwater recedes.',
            'Wear boots when clearing post-flood debris.',
            'Report sightings to local forest department rather than attempting removal.',
        ],
    },
    {
        month: 'October',
        risk: 'Moderate',
        reason: 'Post-monsoon vegetation growth increases prey and predator activity.',
        details:
            'October marks the end of the southwest monsoon. Lush vegetation fuels a surge in rodent populations, which in turn attracts snakes. Encounters in farmland and forest edges are common as snakes actively hunt.',
        tips: [
            'Keep rice fields and plantation edges clear of dense vegetation closest to homes.',
            'Use gloves and boots when harvesting or clearing post-monsoon growth.',
            'Stay vigilant during evening walks near paddy fields.',
        ],
    },
    {
        month: 'November',
        risk: 'Moderate',
        reason: 'Prey abundance sustains snake activity; northeast monsoon begins.',
        details:
            'November brings the northeast monsoon to parts of Kerala. Snake activity remains elevated due to abundant prey. Cooler evenings start encouraging snakes to bask during daytime. Cobra activity in particular remains notable.',
        tips: [
            'Keep footpaths around homes well-lit in the evenings.',
            'Do not leave food scraps outside — rodent control reduces snake attraction.',
            'Be cautious near compost heaps and woodpiles.',
        ],
    },
    {
        month: 'December',
        risk: 'Low',
        reason: 'Cooler temperatures reduce activity; snakes return to shelters.',
        details:
            'December brings lower temperatures across Kerala. Snake activity reduces significantly. Most species retreat to sheltered microclimates. The risk of chance encounters drops to its annual minimum, though complete vigilance should be maintained year-round.',
        tips: [
            'Even in low-risk months, always wear footwear outdoors.',
            'Inspect stored items and firewood before handling.',
            'Use this quieter period to clear overgrown areas around your property.',
        ],
    },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────
const RISK_CONFIG = {
    Low: {
        color: '#16a34a',
        bg: '#dcfce7',
        border: '#bbf7d0',
        heroBg: 'linear-gradient(135deg, #16a34a 0%, #15803d 100%)',
        emoji: '🟢',
        label: 'Low Risk',
    },
    Moderate: {
        color: '#b45309',
        bg: '#fef9c3',
        border: '#fde68a',
        heroBg: 'linear-gradient(135deg, #d97706 0%, #b45309 100%)',
        emoji: '🟡',
        label: 'Moderate Risk',
    },
    High: {
        color: '#b91c1c',
        bg: '#fee2e2',
        border: '#fca5a5',
        heroBg: 'linear-gradient(135deg, #ef4444 0%, #b91c1c 100%)',
        emoji: '🔴',
        label: 'High Risk',
    },
};

export default function SeasonalAlerts() {
    const navigate = useNavigate();
    const currentMonthIndex = new Date().getMonth(); // 0-based
    const currentData = MONTHLY_DATA[currentMonthIndex];
    const riskCfg = (risk) => RISK_CONFIG[risk] || RISK_CONFIG.Low;

    const [expandedMonth, setExpandedMonth] = useState(null);

    const toggleMonth = (monthName) => {
        setExpandedMonth(prev => (prev === monthName ? null : monthName));
    };

    return (
        <div className="sa2-page">
            {/* ── Header ── */}
            <header className="sa2-header">
                <button className="eco-back-btn" onClick={() => navigate(-1)}>
                    <span className="material-symbols-outlined">arrow_back</span>
                </button>
                <div>
                    <h1 className="sa2-title">Seasonal Alerts</h1>
                    <span className="sa2-subtitle">Snake activity risk · Kerala, India</span>
                </div>
            </header>

            <div className="sa2-body">

                {/* ── Current Risk Hero Card ── */}
                <section
                    className="sa2-hero-card"
                    style={{ background: riskCfg(currentData.risk).heroBg }}
                >
                    <div className="sa2-hero-top">
                        <div>
                            <div className="sa2-hero-label">CURRENT MONTH</div>
                            <div className="sa2-hero-month">{currentData.month}</div>
                        </div>
                        <span className="sa2-hero-badge">{riskCfg(currentData.risk).label}</span>
                    </div>
                    <p className="sa2-hero-reason">📋 {currentData.reason}</p>
                    <div className="sa2-hero-tip">
                        <span className="sa2-hero-tip-icon">💡</span>
                        <span className="sa2-hero-tip-text">{currentData.tips[0]}</span>
                    </div>
                </section>

                {/* ── Legend ── */}
                <div className="sa2-legend">
                    {Object.entries(RISK_CONFIG).map(([level, cfg]) => (
                        <span key={level} className="sa2-legend-item" style={{ color: cfg.color }}>
                            {cfg.emoji} {level}
                        </span>
                    ))}
                </div>

                {/* ── All 12 Months ── */}
                <section>
                    <h2 className="sa2-section-title">Monthly Risk Overview</h2>
                    <div className="sa2-month-list">
                        {MONTHLY_DATA.map((item) => {
                            const cfg = riskCfg(item.risk);
                            const isExpanded = expandedMonth === item.month;
                            const isCurrent = item.month === currentData.month;

                            return (
                                <div
                                    key={item.month}
                                    className={`sa2-month-card ${isCurrent ? 'sa2-month-card--current' : ''}`}
                                    onClick={() => toggleMonth(item.month)}
                                >
                                    {/* Card Header Row */}
                                    <div className="sa2-month-row">
                                        <div className="sa2-month-left">
                                            <span className="sa2-month-name">
                                                {item.month}
                                                {isCurrent && <span className="sa2-now-chip">NOW</span>}
                                            </span>
                                            {!isExpanded && (
                                                <span className="sa2-month-reason">{item.reason}</span>
                                            )}
                                        </div>
                                        <div className="sa2-month-right">
                                            <span
                                                className="sa2-risk-badge"
                                                style={{ color: cfg.color, background: cfg.bg, borderColor: cfg.border }}
                                            >
                                                {cfg.emoji} {item.risk}
                                            </span>
                                            <span className="sa2-chevron">{isExpanded ? '▲' : '▼'}</span>
                                        </div>
                                    </div>

                                    {/* Expanded Details */}
                                    {isExpanded && (
                                        <div className="sa2-expand-body">
                                            <p className="sa2-expand-details">{item.details}</p>
                                            <div className="sa2-tips-label">Safety Recommendations</div>
                                            <ul className="sa2-tips-list">
                                                {item.tips.map((tip, i) => (
                                                    <li key={i} className="sa2-tip-item">
                                                        <span
                                                            className="sa2-tip-dot"
                                                            style={{ background: cfg.color }}
                                                        />
                                                        {tip}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </section>

                {/* ── Disclaimer ── */}
                <div className="sa2-disclaimer">
                    <span className="sa2-disclaimer-icon">ℹ️</span>
                    <p>
                        This is a seasonal awareness guide. Always exercise caution regardless of risk level.
                    </p>
                </div>

            </div>
        </div>
    );
}
