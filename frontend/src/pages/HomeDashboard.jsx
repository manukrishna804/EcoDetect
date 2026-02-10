export default function HomeDashboard() {
  return <h1>Home Dashboard</h1>;
}
import React from "react";
import "./EcoDetectHome.css";

const features = [
  { icon: "📷", title: "Detect", sub: "Scanner" },
  { icon: "🐍", title: "Snake", sub: "First Aid" },
  { icon: "🦟", title: "Mosquito", sub: "Safety" },
  { icon: "🐸", title: "Frog", sub: "Species Info" },
  { icon: "🕷️", title: "Spider", sub: "Awareness" },
  { icon: "📘", title: "Learn", sub: "Forest Library" }
];

function Sighting({ name, time, img }) {
  return (
    <div className="eco-sighting">
      <img src={img} alt={name} />
      <div>
        <strong>{name}</strong>
        <p>{time}</p>
      </div>
    </div>
  );
}

export default function HomeDashboard() {
  return (
    <div className="eco-container">
      {/* HEADER */}
      <header className="eco-header">
        <h1>EcoDetect</h1>
        <div className="eco-profile">Hello, Alex</div>
      </header>

      {/* FEATURE GRID */}
      <section className="eco-grid">
        {features.map((item, index) => (
          <div className="eco-card" key={index}>
            <span>{item.icon}</span>
            <strong>{item.title}</strong>
            <p>{item.sub}</p>
          </div>
        ))}
      </section>

      {/* EMERGENCY */}
      <section className="eco-emergency">
        <div>
          <strong>SOS EMERGENCY</strong>
          <p>Connect to forest officials or ambulance immediately</p>
        </div>
        <button>📞</button>
      </section>

      {/* RECENT SIGHTINGS */}
      <section className="eco-section">
        <span>Recent Wildlife Sightings</span>
        <span className="eco-link">View all</span>
      </section>

      <section className="eco-sightings">
        <Sighting
          name="King Cobra"
          time="North Reserve • 2h ago"
          img="https://images.unsplash.com/photo-1531386816431-984525eb880b?auto=format&fit=crop&w=150&q=80"
        />

        <Sighting
          name="Funnel Web Spider"
          time="Backyard • 5h ago"
          img="https://images.unsplash.com/photo-1546182990-dffeafbe841d?auto=format&fit=crop&w=150&q=80"
        />
      </section>

      {/* NAVIGATION */}
      <nav className="eco-nav">
        <span className="active">Home</span>
        <span>Map</span>
        <span>Scan</span>
        <span>Alerts</span>
        <span>Profile</span>
      </nav>
    </div>
  );
}
