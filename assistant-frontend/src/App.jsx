import React, { useState, useEffect } from "react";
import EmailCard from "../components/EmailCard";
import JobCard from "../components/JobCard";

function App() {
  return (
    <div style={styles.dashboardContainer}>
      <header style={styles.header}>
        <h1 style={styles.title}>🤖 Local AI Assistant Dashboard</h1>
        <p style={styles.subtitle}>Powered by FastAPI, Ollama & Qwen 2.5</p>
      </header>

      <main style={styles.grid}>
        {/* Email Component Wrapper Card */}
        <EmailCard />

        {/* Job Tracking Card Placeholder */}
        {/* <JobCard /> */}
      </main>
    </div>
  );
}

const styles = {
  dashboardContainer: {
    fontFamily:
      '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
    backgroundColor: "#0f172a",
    color: "#f8fafc",
    minHeight: "100vh",
    padding: "2rem",
  },
  header: {
    borderBottom: "1px solid #334155",
    paddingBottom: "1rem",
    marginBottom: "2rem",
  },
  title: { fontSize: "2rem", margin: 0, color: "#38bdf8" },
  subtitle: { fontSize: "1rem", color: "#94a3b8", margin: "0.5rem 0 0 0" },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(450px, 1fr))",
    gap: "2rem",
  },
  card: {
    backgroundColor: "#1e293b",
    borderRadius: "12px",
    padding: "1.5rem",
    border: "1px solid #334155",
  },
  cardHeader: {
    display: "flex",
    justifyContent: "space-between",
    align_items: "center",
    marginBottom: "1.5rem",
    borderBottom: "1px solid #334155",
    paddingBottom: "0.75rem",
  },
  cardTitle: { fontSize: "1.25rem", margin: 0, color: "#f1f5f9" },
  refreshButton: {
    backgroundColor: "#0284c7",
    color: "#ffffff",
    border: "none",
    padding: "0.5rem 1rem",
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
  },
  loadingText: { color: "#38bdf8", textAlign: "center", padding: "2rem" },
  emptyState: {
    color: "#64748b",
    textAlign: "center",
    padding: "3rem 1rem",
    fontStyle: "italic",
  },
  // Find this exact block in your styles object and update it:
  listContainer: {
    display: "flex",
    flexDirection: "column",
    gap: "1rem",
    maxHeight: "450px", // <-- FIX: Stops the card from growing infinitely vertically
    overflowY: "auto", // <-- FIX: Generates a scrolling track if emails overflow
    paddingRight: "0.5rem", // Adds room for the scrollbar track line
  },

  // listContainer: { display: "flex", flexDirection: "column", gap: "1rem" },
  itemRow: {
    backgroundColor: "#0f172a",
    padding: "1rem",
    borderRadius: "8px",
    borderLeft: "4px solid #38bdf8",
  },
  itemMainLayout: {
    display: "flex",
    justifyContent: "space-between",
    align_items: "flex-start",
    gap: "1rem",
  },
  itemMeta: {
    display: "flex",
    flexDirection: "column",
    gap: "0.25rem",
    flex: 1,
  },
  itemSender: { fontSize: "0.85rem", color: "#94a3b8", fontWeight: "bold" },
  itemSubject: { fontSize: "1rem", color: "#f1f5f9", fontWeight: "500" },
  itemSummary: { fontSize: "0.9rem", color: "#cbd5e1", margin: "0.5rem 0" },
  badgeContainer: { marginTop: "0.5rem" },
  priorityBadge: {
    backgroundColor: "#991b1b",
    color: "#fca5a5",
    padding: "0.25rem 0.5rem",
    borderRadius: "4px",
    fontSize: "0.75rem",
    fontWeight: "bold",
  },
  standardBadge: {
    backgroundColor: "#1e293b",
    color: "#94a3b8",
    padding: "0.25rem 0.5rem",
    borderRadius: "4px",
    fontSize: "0.75rem",
    border: "1px solid #334155",
  },
  comingSoonBadge: {
    backgroundColor: "#334155",
    color: "#94a3b8",
    padding: "0.25rem 0.5rem",
    borderRadius: "4px",
    fontSize: "0.75rem",
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
    transition: "background-color 0.2s",
  },
};

export default App;
