import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const API_BASE_URL = "http://127.0.0.1:5000";

function SpeciesLibrary() {
  const [species, setSpecies] = useState([]);
  const [filteredSpecies, setFilteredSpecies] = useState([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const navigate = useNavigate();

  // Fetch species
  useEffect(() => {
    setLoading(true);
    fetch(`${API_BASE_URL}/species`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch species data");
        return res.json();
      })
      .then((data) => {
        setSpecies(data || []);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching species:", err);
        setError("Could not load species library. Please try again later.");
        setLoading(false);
      });
  }, []);

  // Filter logic
  useEffect(() => {
    let result = species;

    // Filter by category if one is selected
    if (selectedCategory) {
      result = result.filter(item => item.category === selectedCategory);
    }

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
  }, [search, filter, species, selectedCategory]);

  // Grouped Categories
  const categories = Array.from(new Set(species.map(s => s.category))).filter(Boolean);

  const getCategoryImage = (cat) => {
    const normalizedCat = (cat || "").toLowerCase();
    const images = {
      "snake": "/Images/King cobra.jpg",
      "snakes": "/Images/pit viper.jpg",
      "mosquito": "/Images/Aedes.jpg",
      "frog": "/Images/red-eyed-treefrog.jpg",
      "frogs": "/Images/red-eyed-treefrog.jpg",
      "spider": "/Images/Peacock spider.webp",
      "spiders": "/Images/Peacock spider.webp"
    };
    return images[normalizedCat] || "https://images.unsplash.com/photo-1528158222524-d4d912b2e20a?auto=format&fit=crop&w=400&q=80";
  };

  const handleBack = () => {
    if (selectedCategory) {
      setSelectedCategory(null);
      setSearch("");
    } else {
      navigate(-1);
    }
  };

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <div style={styles.headerTop}>
          <button className="eco-back-btn" onClick={handleBack}>
            <span className="material-symbols-outlined">arrow_back</span>
          </button>
        </div>
        <h1 style={styles.title}>
          {selectedCategory ? `🌿 ${selectedCategory}` : "🌿 Species Library"}
        </h1>
        <p style={styles.subtitle}>
          {selectedCategory
            ? `Exploring species in ${selectedCategory} category`
            : "Explore and identify local wildlife species grouped by category"}
        </p>
      </div>

      {/* Controls - Only show search/filter when in a category or if searching globally */}
      <div style={styles.controls}>
        <div style={styles.searchWrapper}>
          <span className="material-symbols-outlined" style={styles.searchIcon}>search</span>
          <input
            type="text"
            placeholder={selectedCategory ? `Search in ${selectedCategory}...` : "Search all species..."}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={styles.search}
          />
        </div>

        {selectedCategory && (
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            style={styles.select}
          >
            <option value="all">All Danger Levels</option>
            <option value="high">High Risk</option>
            <option value="medium">Medium Risk</option>
            <option value="low">Low Risk</option>
          </select>
        )}
      </div>

      {/* Content */}
      {loading ? (
        <div style={styles.statusContainer}>
          <p style={styles.statusText}>Loading species data...</p>
        </div>
      ) : error ? (
        <div style={styles.statusContainer}>
          <p style={styles.errorText}>{error}</p>
        </div>
      ) : (
        <>
          {/* Category View */}
          {!selectedCategory && !search && (
            <div style={styles.grid}>
              {categories.map((cat) => (
                <div
                  key={cat}
                  style={styles.categoryCard}
                  onClick={() => setSelectedCategory(cat)}
                >
                  <div style={styles.categoryImageWrapper}>
                    <img src={getCategoryImage(cat)} alt={cat} style={styles.categoryImage} />
                    <div style={styles.categoryOverlay}>
                      <h2 style={styles.categoryTitle}>{cat}</h2>
                      <p style={styles.countText}>
                        {species.filter(s => s.category === cat).length} Species
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Species List View (When category is selected or searching) */}
          {(selectedCategory || search) && (
            <>
              {filteredSpecies.length === 0 ? (
                <div style={styles.statusContainer}>
                  <p style={styles.statusText}>No species found matching your criteria.</p>
                </div>
              ) : (
                <div style={styles.grid}>
                  {filteredSpecies.map((item) => (
                    <div
                      key={item.id}
                      style={styles.card}
                      onClick={() => navigate(`/learn/species/${item.id}`)}
                    >
                      <div style={styles.imageWrapper}>
                        <img
                          src={item.image_url || "https://images.unsplash.com/photo-1528158222524-d4d912b2e20a?auto=format&fit=crop&w=400&q=80"}
                          alt={item.name}
                          style={styles.image}
                          loading="lazy"
                          onError={(e) => {
                            e.target.src = "https://images.unsplash.com/photo-1528158222524-d4d912b2e20a?auto=format&fit=crop&w=400&q=80";
                          }}
                        />

                        {/* Danger Badge */}
                        {item.danger_level && (
                          <div
                            style={{
                              ...styles.badge,
                              backgroundColor:
                                item.danger_level.toLowerCase() === "high" || item.danger_level.toLowerCase() === "extreme"
                                  ? "#ef4444"
                                  : item.danger_level.toLowerCase() === "medium"
                                    ? "#f59e0b"
                                    : "#10b981",
                            }}
                          >
                            {item.danger_level}
                          </div>
                        )}
                      </div>

                      <div style={styles.cardContent}>
                        <h2 style={styles.cardTitle}>{item.name}</h2>
                        <div style={styles.categoryBadge}>{item.category || "Wildlife"}</div>
                        {item.description && (
                          <p style={styles.description}>
                            {item.description.length > 80
                              ? `${item.description.substring(0, 80)}...`
                              : item.description}
                          </p>
                        )}
                        <div style={styles.cardFooter}>
                          <button
                            style={styles.viewButton}
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/learn/species/${item.id}`);
                            }}
                          >
                            <span>View Details</span>
                            <span className="material-symbols-outlined" style={styles.viewButtonIcon}>arrow_forward</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </>
      )}
    </div>
  );
}

const styles = {
  container: {
    padding: "20px 20px 100px 20px",
    minHeight: "100vh",
    backgroundColor: "#f9fafb",
  },

  header: {
    textAlign: "center",
    marginBottom: "30px",
    paddingTop: "10px",
  },

  headerTop: {
    display: "flex",
    justifyContent: "flex-start",
    marginBottom: "10px",
  },

  backButton: {
    background: "white",
    border: "none",
    borderRadius: "12px",
    width: "40px",
    height: "40px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
    cursor: "pointer",
    color: "#16a34a",
  },

  title: {
    fontSize: "32px",
    marginBottom: "8px",
    fontWeight: "700",
    color: "#111827",
  },

  subtitle: {
    color: "#6b7280",
    fontSize: "15px",
  },

  controls: {
    display: "flex",
    flexDirection: "column",
    gap: "15px",
    marginBottom: "35px",
    maxWidth: "600px",
    margin: "0 auto 35px auto",
  },

  searchWrapper: {
    position: "relative",
    display: "flex",
    alignItems: "center",
  },

  searchIcon: {
    position: "absolute",
    left: "12px",
    color: "#9ca3af",
    fontSize: "20px",
  },

  search: {
    padding: "12px 12px 12px 40px",
    width: "100%",
    borderRadius: "12px",
    border: "1px solid #e5e7eb",
    boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
    fontSize: "15px",
    outline: "none",
    transition: "border-color 0.2s",
  },

  select: {
    padding: "12px 16px",
    borderRadius: "12px",
    border: "1px solid #e5e7eb",
    backgroundColor: "white",
    boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
    fontSize: "15px",
    outline: "none",
    cursor: "pointer",
  },

  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
    gap: "24px",
    paddingBottom: "40px",
  },

  categoryCard: {
    position: "relative",
    borderRadius: "24px",
    overflow: "hidden",
    height: "220px",
    cursor: "pointer",
    boxShadow: "0 10px 20px rgba(0,0,0,0.1)",
    transition: "transform 0.3s ease, box-shadow 0.3s ease",
    border: "none",
  },

  categoryImageWrapper: {
    width: "100%",
    height: "100%",
    position: "relative",
  },

  categoryImage: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
    transition: "transform 0.5s ease",
  },

  categoryOverlay: {
    position: "absolute",
    inset: 0,
    background: "linear-gradient(to top, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.2) 60%, transparent 100%)",
    display: "flex",
    flexDirection: "column",
    justifyContent: "flex-end",
    padding: "20px",
    color: "white",
  },

  categoryTitle: {
    fontSize: "24px",
    fontWeight: "800",
    margin: "0 0 4px 0",
    textShadow: "0 2px 4px rgba(0,0,0,0.3)",
  },

  countText: {
    fontSize: "14px",
    opacity: 0.9,
    fontWeight: "500",
    margin: 0,
  },

  card: {
    background: "white",
    borderRadius: "20px",
    overflow: "hidden",
    boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
    transition: "transform 0.2s, box-shadow 0.2s",
    border: "1px solid #f3f4f6",
  },

  imageWrapper: {
    position: "relative",
    height: "180px",
  },

  image: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
  },

  badge: {
    position: "absolute",
    top: "12px",
    right: "12px",
    padding: "4px 10px",
    borderRadius: "8px",
    color: "white",
    fontSize: "11px",
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: "0.05em",
  },

  cardContent: {
    padding: "16px",
  },

  cardTitle: {
    margin: "0 0 8px 0",
    fontSize: "18px",
    fontWeight: "600",
    color: "#111827",
  },

  categoryBadge: {
    display: "inline-block",
    padding: "2px 8px",
    backgroundColor: "#f0fdf4",
    color: "#16a34a",
    borderRadius: "6px",
    fontSize: "12px",
    fontWeight: "500",
    marginBottom: "10px",
  },

  description: {
    margin: "0 0 16px 0",
    color: "#4b5563",
    fontSize: "13px",
    lineHeight: "1.5",
  },

  cardFooter: {
    marginTop: "auto",
    borderTop: "1px solid #f1f5f9",
    paddingTop: "12px",
    display: "flex",
    justifyContent: "flex-end",
  },

  viewButton: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    padding: "8px 16px",
    backgroundColor: "#f0fdf4",
    color: "#16a34a",
    border: "1px solid #dcfce7",
    borderRadius: "10px",
    fontSize: "13px",
    fontWeight: "600",
    cursor: "pointer",
    transition: "all 0.2s ease",
  },

  viewButtonIcon: {
    fontSize: "16px",
  },

  statusContainer: {
    textAlign: "center",
    padding: "60px 20px",
  },

  statusText: {
    color: "#6b7280",
    fontSize: "16px",
  },

  errorText: {
    color: "#ef4444",
    fontSize: "16px",
    fontWeight: "500",
  },
};

export default SpeciesLibrary;
