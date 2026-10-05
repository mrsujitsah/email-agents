import React, { useState, useEffect } from "react";

export default function EmailCard() {
  const [emails, setEmails] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchEmails = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("http://127.0.0.1:8000/api/emails");
      if (!response.ok) {
        throw new Error("Failed to reach local assistant backend.");
      }
      const data = await response.json();
      setEmails(data.emails || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const deleteEmail = async (emailId) => {
    try {
      const response = await fetch(
        `http://127.0.0.1:8000/api/emails/${emailId}`,
        {
          method: "DELETE",
        },
      );
      if (!response.ok) {
        throw new Error("Failed to delete item from local database.");
      }
      setEmails(emails.filter((email) => email.id !== emailId));
    } catch (err) {
      alert(`Error: ${err.message}`);
    }
  };

  useEffect(() => {
    fetchEmails();
  }, []);

  return (
    <section style={styles.card}>
      <div style={styles.cardHeader}>
        <h2 style={styles.cardTitle}>📩 Recent Emails Workspace</h2>
        <button
          onClick={fetchEmails}
          disabled={loading}
          style={styles.refreshButton}
        >
          {loading ? "Processing..." : "🔄 Refresh Inbox"}
        </button>
      </div>

      {error && <div style={styles.errorBox}>❌ Connection Error: {error}</div>}

      {loading ? (
        <div style={styles.loadingText}>
          Reading inbox & compiling AI updates...
        </div>
      ) : emails.length === 0 ? (
        <div style={styles.emptyState}>
          No stored emails found on your dashboard layout!
        </div>
      ) : (
        <div style={styles.listContainer} className="custom-scrollbar">
          {emails.map((email) => (
            <div key={email.id} style={styles.itemRow}>
              <div style={styles.itemMainLayout}>
                <div style={styles.itemMeta}>
                  <span style={styles.itemSender}>From: {email.from}</span>
                  <span style={styles.itemSubject}>
                    Subject: {email.subject}
                  </span>
                  <p style={styles.itemSummary}>
                    <strong>Summary:</strong> {email.summary}
                  </p>
                  <div style={styles.badgeContainer}>
                    <span
                      style={
                        email.action === "HIGH PRIORITY"
                          ? styles.priorityBadge
                          : styles.standardBadge
                      }
                    >
                      {email.action}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => deleteEmail(email.id)}
                  style={styles.deleteButton}
                  title="Remove from list"
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
  listContainer: {
    display: "flex",
    flexDirection: "column",
    gap: "1rem",
    maxHeight: "450px",
    overflowY: "auto",
    paddingRight: "0.5rem",
  },
  itemRow: {
    backgroundColor: "#0f172a",
    padding: "1rem",
    borderRadius: "8px",
    borderLeft: "4px solid #38bdf8",
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
