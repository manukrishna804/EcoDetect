import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function SpeciesLibrary() {
  const [species, setSpecies] = useState([]);
  const [filteredSpecies, setFilteredSpecies] = useState([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const navigate = useNavigate();

  // Fetch species
  useEffect(() => {
    fetch("http://127.0.0.1:5000/species")
      .then((res) => res.json())
      .then((data) => {
        setSpecies(data || []);
        setFilteredSpecies(data || []);
      })
      .catch((err) => console.error("Error fetching species:", err));
  }, []);

  // Search & Filter logic
  useEffect(() => {
    let result = species;

    if (search) {
      result = result.filter(
        (item) =>
          item.name &&
          item.name.toLowerCase().includes(search.toLowerCase())
      );
    }

    if (filter !== "all") {
      result = result.filter(
        (item) =>
          item.danger_level &&
          item.danger_level.toLowerCase() === filter
      );
    }

    setFilteredSpecies(result);
  }, [search, filter, species]);

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <h1 style={styles.title}>🌿 Species Library</h1>
        <p style={styles.subtitle}>
          Explore and identify local wildlife species
        </p>
      </div>

      {/* Search + Filter */}
      <div style={styles.controls}>
        <input
          type="text"
          placeholder="Search species..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={styles.search}
        />

        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          style={styles.select}
        >
          <option value="all">All Danger Levels</option>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>
      </div>

      {/* Species Cards */}
      <div style={styles.grid}>
        {filteredSpecies.map((item) => (
          <div
            key={item.id}
            style={styles.card}
            onClick={() => navigate(`/species/${item.id}`)}
          >
            <div style={styles.imageWrapper}>
              <img
                src={item.image_url || "https://via.placeholder.com/400x300"}
                alt={item.name}
                style={styles.image}
              />

              {/* Danger Badge */}
              {item.danger_level && (
                <div
                  style={{
                    ...styles.badge,
                    backgroundColor:
                      item.danger_level.toLowerCase() === "high"
                        ? "#e53935"
                        : item.danger_level.toLowerCase() === "medium"
                        ? "#fb8c00"
                        : "#43a047",
                  }}
                >
                  {item.danger_level}
                </div>
              )}
            </div>

            <div style={styles.cardContent}>
              <h2 style={styles.cardTitle}>{item.name}</h2>
              <p style={styles.category}>{item.category}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

const styles = {
  container: {
    padding: "40px 20px",
    minHeight: "100vh",
    background: "linear-gradient(to bottom, #eef2f3, #ffffff)",
  },

  header: {
    textAlign: "center",
    marginBottom: "30px",
  },

  title: {
    fontSize: "40px",
    marginBottom: "10px",
    fontWeight: "600",
  },

  subtitle: {
    color: "#666",
    fontSize: "16px",
  },

  controls: {
    display: "flex",
    justifyContent: "center",
    gap: "15px",
    marginBottom: "35px",
    flexWrap: "wrap",
  },

  search: {
    padding: "12px 16px",
    width: "280px",
    borderRadius: "12px",
    border: "1px solid #ddd",
    boxShadow: "0 4px 10px rgba(0,0,0,0.05)",
    fontSize: "14px",
    outline: "none",
  },

  select: {
    padding: "12px 16px",
    borderRadius: "12px",
    border: "1px solid #ddd",
    boxShadow: "0 4px 10px rgba(0,0,0,0.05)",
    fontSize: "14px",
    outline: "none",
  },

  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
    gap: "25px",
  },

  card: {
    background: "white",
    borderRadius: "20px",
    overflow: "hidden",
    boxShadow: "0 10px 25px rgba(0,0,0,0.08)",
    cursor: "pointer",
    transition: "transform 0.3s ease, box-shadow 0.3s ease",
  },

  imageWrapper: {
    position: "relative",
  },

  image: {
    width: "100%",
    height: "200px",
    objectFit: "cover",
  },

  badge: {
    position: "absolute",
    top: "15px",
    right: "15px",
    padding: "6px 12px",
    borderRadius: "20px",
    color: "white",
    fontSize: "12px",
    fontWeight: "bold",
    textTransform: "capitalize",
  },

  cardContent: {
    padding: "20px",
  },

  cardTitle: {
    margin: 0,
    fontSize: "20px",
    fontWeight: "600",
  },

  category: {
    marginTop: "6px",
    color: "#777",
    fontSize: "14px",
  },
};

export default SpeciesLibrary;