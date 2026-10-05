import React, { useState, useEffect } from "react";

export default function JobCard() {
  const [jobs, setJobs] = useState([]);
  const [roleInput, setRoleInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch all saved jobs from the database
  const fetchSavedJobs = async () => {
    setError(null);
    try {
      const response = await fetch("http://127.0.0.1:8000/api/jobs");
      if (!response.ok) throw new Error("Failed to load tracked jobs.");
      const data = await response.json();
      setJobs(data.jobs || []);
    } catch (err) {
      setError(err.message);
    }
  };

  // Trigger backend LinkedIn scraping and local AI screening
  const handleSearchJobs = async (e) => {
    e.preventDefault();
    if (!roleInput.trim()) return;

    setLoading(true);
    setError(null);
    try {
      const response = await fetch("http://127.0.0.1:8000/api/jobs/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: roleInput, location: "Remote" }),
      });
      if (!response.ok)
        throw new Error("Failed to run LinkedIn background search.");
      const data = await response.json();
      setJobs(data.jobs || []);
      setRoleInput(""); // Clear input box on success
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Remove a specific job card tracking entry
  const deleteJob = async (jobId) => {
    try {
      const response = await fetch(`http://127.0.0.1:8000/api/jobs/${jobId}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Failed to remove job from database.");
      setJobs(jobs.filter((job) => job.id !== jobId));
    } catch (err) {
      alert(`Error: ${err.message}`);
    }
  };

  // Load existing records when dashboard mounts
  useEffect(() => {
    fetchSavedJobs();
  }, []);

  return (
    <section style={styles.card}>
      <div style={styles.cardHeader}>
        <h2 style={styles.cardTitle}>💼 Job Search Tracker</h2>
      </div>

      {/* Input Control Box Form */}
      <form onSubmit={handleSearchJobs} style={styles.searchForm}>
        <input
          type="text"
          placeholder="Enter target role (e.g., AI Engineer)..."
          value={roleInput}
          onChange={(e) => setRoleInput(e.target.value)}
          disabled={loading}
          style={styles.inputBox}
        />
        <button
          type="submit"
          disabled={loading || !roleInput.trim()}
          style={styles.searchButton}
        >
          {loading ? "Scraping..." : "🔍 Search"}
        </button>
      </form>

      {error && <div style={styles.errorBox}>❌ {error}</div>}

      {loading ? (
        <div style={styles.loadingText}>
          Fetching LinkedIn cards & running Qwen analysis...
        </div>
      ) : jobs.length === 0 ? (
        <div style={styles.emptyState}>
          Type an target role title above to find screened openings!
        </div>
      ) : (
        <div style={styles.listContainer} className="custom-scrollbar">
          {jobs.map((job) => (
            <div key={job.id} style={styles.itemRow}>
              <div style={styles.itemMainLayout}>
                <div style={styles.itemMeta}>
                  <span style={styles.itemRoleBadge}>
                    Target: {job.role_input}
                  </span>
                  <span style={styles.itemTitle}>{job.title}</span>
                  <span style={styles.itemCompany}>
                    {job.company} — <small>{job.location}</small>
                  </span>
                  <p style={styles.itemAnalysis}>
                    <strong>Qwen Fit Check:</strong> {job.ai_analysis}
                  </p>
                  <a
                    href={job.link}
                    target="_blank"
                    rel="noreferrer"
                    style={styles.applyLink}
                  >
                    🌐 View Post on LinkedIn ↗
                  </a>
                </div>
                <button
                  onClick={() => deleteJob(job.id)}
                  style={styles.deleteButton}
                  title="Remove listing"
                >
                  🗑️ Clear
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

const styles = {
  card: {
    backgroundColor: "#1e293b",
    borderRadius: "12px",
    padding: "1.5rem",
    border: "1px solid #334155",
  },
  cardHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "1.25rem",
    borderBottom: "1px solid #334155",
    paddingBottom: "0.75rem",
  },
  cardTitle: { fontSize: "1.25rem", margin: 0, color: "#f1f5f9" },
  searchForm: { display: "flex", gap: "0.5rem", marginBottom: "1.25rem" },
  inputBox: {
    flex: 1,
    backgroundColor: "#0f172a",
    border: "1px solid #334155",
    borderRadius: "6px",
    padding: "0.6rem 0.75rem",
    color: "#f8fafc",
    fontSize: "0.9rem",
  },
  searchButton: {
    backgroundColor: "#0284c7",
    color: "#ffffff",
    border: "none",
    padding: "0.6rem 1.2rem",
    borderRadius: "6px",
    cursor: "pointer",
    fontWeight: "bold",
  },
  errorBox: {
    backgroundColor: "#7f1d1d",
    color: "#fca5a5",
    padding: "0.75rem",
    borderRadius: "6px",
    marginBottom: "1rem",
    fontSize: "0.9rem",
  },
  loadingText: {
    color: "#38bdf8",
    textAlign: "center",
    padding: "2rem",
    fontSize: "0.95rem",
  },
  emptyState: {
    color: "#64748b",
    textAlign: "center",
    padding: "3.5rem 1rem",
    fontStyle: "italic",
  },
  listContainer: {
    display: "flex",
    flexDirection: "column",
    gap: "1rem",
    maxHeight: "420px",
    overflowY: "auto",
    paddingRight: "0.5rem",
  },
  itemRow: {
    backgroundColor: "#0f172a",
    padding: "1rem",
    borderRadius: "8px",
    borderLeft: "4px solid #10b981",
  },
  itemMainLayout: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: "1rem",
  },
  itemMeta: {
    display: "flex",
    flexDirection: "column",
    gap: "0.25rem",
    flex: 1,
  },
  itemRoleBadge: {
    alignSelf: "flex-start",
    backgroundColor: "#064e3b",
    color: "#a7f3d0",
    fontSize: "0.75rem",
    padding: "0.15rem 0.4rem",
    borderRadius: "4px",
    fontWeight: "bold",
    marginBottom: "0.25rem",
  },
  itemTitle: { fontSize: "1.05rem", color: "#f1f5f9", fontWeight: "600" },
  itemCompany: { fontSize: "0.85rem", color: "#94a3b8", fontWeight: "500" },
  itemAnalysis: {
    fontSize: "0.9rem",
    color: "#cbd5e1",
    margin: "0.5rem 0",
    lineHeight: "1.4",
  },
  applyLink: {
    display: "inline-block",
    fontSize: "0.85rem",
    color: "#38bdf8",
    textDecoration: "none",
    marginTop: "0.25rem",
    fontWeight: "500",
  },
  deleteButton: {
    backgroundColor: "#dc2626",
    color: "#ffffff",
    border: "none",
    padding: "0.4rem 0.75rem",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "0.85rem",
    fontWeight: "bold",
    alignSelf: "center",
  },
};
