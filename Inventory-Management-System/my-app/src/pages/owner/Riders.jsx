import { useState, useEffect } from "react";
import OwnerNavbar from "../../components/ownerNavbar";
import api from "../../utils/api";

export default function Riders() {
  const [riders, setRiders] = useState([]);
  const [name, setName] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editingName, setEditingName] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchRiders();
  }, []);

  // GET RIDERS
  const fetchRiders = async () => {
    try {
      const res = await api.get("/riders");
      setRiders(res.data.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  // ADD RIDER
  const addRider = async () => {
    if (!name.trim()) {
      alert("Enter rider name");
      return;
    }

    setLoading(true);

    try {
      const res = await api.post("/riders", { name });

      const { credentials } = res.data;
      alert(
        `✅ Rider Created!\n\nUsername: ${credentials.username}\nPassword: ${credentials.password}\n\n⚠️ ${credentials.note}`
      );

      setName("");
      fetchRiders();

    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Failed to add rider");
    } finally {
      setLoading(false);
    }
  };

  // DELETE RIDER
  const deleteRider = async (id) => {
    if (!window.confirm("Delete this rider?")) return;

    try {
      await api.delete(`/riders/${id}`);
      fetchRiders();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Failed to delete rider");
    }
  };

  // START EDIT
  const startEdit = (rider) => {
    setEditingId(rider.id);
    setEditingName(rider.name);
  };

  // UPDATE RIDER
  const updateRider = async () => {
    if (!editingName.trim()) {
      alert("Name cannot be empty");
      return;
    }

    try {
      await api.put(`/riders/${editingId}`, { name: editingName });
      setEditingId(null);
      setEditingName("");
      fetchRiders();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Failed to update rider");
    }
  };

  // REGENERATE CREDENTIALS
  const regenerateCredentials = async (id) => {
    if (!window.confirm("Regenerate credentials for this rider? Their old password will stop working.")) return;

    try {
      const res = await api.post(`/riders/${id}/regenerate`);
      const { credentials } = res.data;
      alert(
        `🔑 New Credentials\n\nUsername: ${credentials.username}\nPassword: ${credentials.password}\n\n⚠️ ${credentials.note}`
      );
      fetchRiders();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Failed to regenerate credentials");
    }
  };

  return (
    <div style={styles.root}>
      <OwnerNavbar />

      <div style={styles.container}>
        <h1 style={styles.heading}>🚴 Rider Management</h1>

        {/* ADD RIDER FORM */}
        <div style={styles.formCard}>
          <div style={styles.sectionTitle}>Add New Rider</div>
          <div style={styles.formRow}>
            <input
              type="text"
              placeholder="Enter rider full name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addRider()}
              style={styles.input}
              onFocus={e => e.target.style.borderColor = "#3b82f6"}
              onBlur={e => e.target.style.borderColor = "rgba(255,255,255,0.1)"}
            />
            <button
              onClick={addRider}
              disabled={loading}
              style={{
                ...styles.addBtn,
                opacity: loading ? 0.7 : 1,
                cursor: loading ? "not-allowed" : "pointer",
              }}
              onMouseEnter={e => { if (!loading) e.target.style.background = "#2563eb"; }}
              onMouseLeave={e => e.target.style.background = "#3b82f6"}
            >
              {loading ? "Adding..." : "+ Add Rider"}
            </button>
          </div>
          <p style={styles.hint}>
            💡 Username and password will be auto-generated and shown once after creation.
          </p>
        </div>

        {/* RIDERS TABLE */}
        <div style={styles.sectionTitle}>All Riders ({riders.length})</div>
        <div style={styles.tableCard}>
          <table style={styles.table}>
            <thead>
              <tr style={styles.thead}>
                <th style={styles.th}>Rider Name</th>
                <th style={styles.th}>Username</th>
                <th style={styles.th}>Joined</th>
                <th style={styles.th}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {riders.map((rider) => (
                <tr key={rider.id} style={styles.tr}>

                  {/* NAME */}
                  <td style={styles.td}>
                    {editingId === rider.id ? (
                      <input
                        value={editingName}
                        onChange={(e) => setEditingName(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && updateRider()}
                        style={styles.editInput}
                        autoFocus
                        onFocus={e => e.target.style.borderColor = "#3b82f6"}
                        onBlur={e => e.target.style.borderColor = "rgba(255,255,255,0.1)"}
                      />
                    ) : (
                      <div style={styles.riderName}>{rider.name}</div>
                    )}
                  </td>

                  {/* USERNAME */}
                  <td style={styles.td}>
                    <span style={styles.usernameBadge}>
                      @{rider.username}
                    </span>
                  </td>

                  {/* CREATED */}
                  <td style={styles.td}>
                    <span style={styles.dateText}>
                      {new Date(rider.created_at).toLocaleDateString()}
                    </span>
                  </td>

                  {/* ACTIONS */}
                  <td style={styles.td}>
                    <div style={styles.actionRow}>
                      {editingId === rider.id ? (
                        <>
                          <button
                            onClick={updateRider}
                            style={styles.saveBtn}
                            onMouseEnter={e => e.target.style.background = "rgba(34,197,94,0.2)"}
                            onMouseLeave={e => e.target.style.background = "rgba(34,197,94,0.1)"}
                          >
                            Save
                          </button>
                          <button
                            onClick={() => setEditingId(null)}
                            style={styles.cancelBtn}
                            onMouseEnter={e => e.target.style.background = "rgba(255,255,255,0.08)"}
                            onMouseLeave={e => e.target.style.background = "rgba(255,255,255,0.04)"}
                          >
                            Cancel
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={() => startEdit(rider)}
                            style={styles.editBtn}
                            onMouseEnter={e => e.target.style.background = "rgba(59,130,246,0.2)"}
                            onMouseLeave={e => e.target.style.background = "rgba(59,130,246,0.1)"}
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => regenerateCredentials(rider.id)}
                            style={styles.regenBtn}
                            onMouseEnter={e => e.target.style.background = "rgba(245,158,11,0.2)"}
                            onMouseLeave={e => e.target.style.background = "rgba(245,158,11,0.1)"}
                          >
                            🔑 Reset
                          </button>
                          <button
                            onClick={() => deleteRider(rider.id)}
                            style={styles.deleteBtn}
                            onMouseEnter={e => e.target.style.background = "rgba(239,68,68,0.2)"}
                            onMouseLeave={e => e.target.style.background = "rgba(239,68,68,0.1)"}
                          >
                            Delete
                          </button>
                        </>
                      )}
                    </div>
                  </td>

                </tr>
              ))}

              {riders.length === 0 && (
                <tr>
                  <td colSpan={4} style={styles.emptyRow}>
                    No riders added yet. Add your first rider above.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

      </div>
    </div>
  );
}

const styles = {
  root: {
    minHeight: "100vh",
    background: "#080e1a",
    fontFamily: "'Georgia', 'Times New Roman', serif",
  },
  container: {
    padding: "24px",
    maxWidth: 1000,
    margin: "0 auto",
  },
  heading: {
    color: "#f0f6ff",
    fontSize: 24,
    fontWeight: 700,
    marginBottom: 24,
    letterSpacing: "-0.01em",
  },
  formCard: {
    background: "rgba(255,255,255,0.03)",
    border: "1px solid rgba(255,255,255,0.07)",
    borderRadius: 14,
    padding: "20px 24px",
    marginBottom: 24,
  },
  sectionTitle: {
    color: "#64748b",
    fontSize: 12,
    fontFamily: "'Courier New', monospace",
    letterSpacing: "0.08em",
    textTransform: "uppercase",
    marginBottom: 10,
    fontWeight: 600,
  },
  formRow: {
    display: "flex",
    gap: 12,
  },
  input: {
    flex: 1,
    background: "rgba(255,255,255,0.05)",
    border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: 8,
    padding: "10px 14px",
    color: "#f0f6ff",
    fontSize: 14,
    outline: "none",
    transition: "border-color 0.2s",
    fontFamily: "'Courier New', monospace",
  },
  addBtn: {
    background: "#3b82f6",
    color: "#fff",
    border: "none",
    borderRadius: 8,
    padding: "10px 20px",
    fontSize: 14,
    fontWeight: 600,
    cursor: "pointer",
    transition: "background 0.2s",
    fontFamily: "inherit",
    whiteSpace: "nowrap",
  },
  hint: {
    color: "#475569",
    fontSize: 12,
    fontFamily: "'Courier New', monospace",
    marginTop: 10,
    margin: "10px 0 0",
  },
  tableCard: {
    background: "rgba(255,255,255,0.03)",
    border: "1px solid rgba(255,255,255,0.07)",
    borderRadius: 14,
    overflow: "hidden",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
  },
  thead: {
    background: "rgba(255,255,255,0.05)",
  },
  th: {
    padding: "12px 16px",
    textAlign: "left",
    color: "#64748b",
    fontSize: 12,
    fontFamily: "'Courier New', monospace",
    letterSpacing: "0.05em",
    textTransform: "uppercase",
    fontWeight: 600,
  },
  tr: {
    borderTop: "1px solid rgba(255,255,255,0.05)",
  },
  td: {
    padding: "12px 16px",
    color: "#e2e8f0",
    fontSize: 14,
  },
  riderName: {
    color: "#f0f6ff",
    fontWeight: 600,
    fontSize: 14,
  },
  usernameBadge: {
    background: "rgba(59,130,246,0.1)",
    border: "1px solid rgba(59,130,246,0.2)",
    color: "#93c5fd",
    borderRadius: 20,
    padding: "3px 10px",
    fontSize: 12,
    fontFamily: "'Courier New', monospace",
  },
  dateText: {
    color: "#475569",
    fontSize: 12,
    fontFamily: "'Courier New', monospace",
  },
  actionRow: {
    display: "flex",
    gap: 8,
    flexWrap: "wrap",
  },
  editBtn: {
    background: "rgba(59,130,246,0.1)",
    color: "#93c5fd",
    border: "1px solid rgba(59,130,246,0.2)",
    borderRadius: 6,
    padding: "4px 12px",
    fontSize: 12,
    cursor: "pointer",
    transition: "background 0.2s",
    fontFamily: "inherit",
  },
  regenBtn: {
    background: "rgba(245,158,11,0.1)",
    color: "#fbbf24",
    border: "1px solid rgba(245,158,11,0.2)",
    borderRadius: 6,
    padding: "4px 12px",
    fontSize: 12,
    cursor: "pointer",
    transition: "background 0.2s",
    fontFamily: "inherit",
  },
  deleteBtn: {
    background: "rgba(239,68,68,0.1)",
    color: "#f87171",
    border: "1px solid rgba(239,68,68,0.2)",
    borderRadius: 6,
    padding: "4px 12px",
    fontSize: 12,
    cursor: "pointer",
    transition: "background 0.2s",
    fontFamily: "inherit",
  },
  saveBtn: {
    background: "rgba(34,197,94,0.1)",
    color: "#4ade80",
    border: "1px solid rgba(34,197,94,0.2)",
    borderRadius: 6,
    padding: "4px 12px",
    fontSize: 12,
    cursor: "pointer",
    transition: "background 0.2s",
    fontFamily: "inherit",
  },
  cancelBtn: {
    background: "rgba(255,255,255,0.04)",
    color: "#64748b",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: 6,
    padding: "4px 12px",
    fontSize: 12,
    cursor: "pointer",
    transition: "background 0.2s",
    fontFamily: "inherit",
  },
  editInput: {
    background: "rgba(255,255,255,0.05)",
    border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: 6,
    padding: "6px 10px",
    color: "#f0f6ff",
    fontSize: 13,
    outline: "none",
    fontFamily: "'Courier New', monospace",
    transition: "border-color 0.2s",
  },
  emptyRow: {
    textAlign: "center",
    padding: "40px",
    color: "#334155",
    fontSize: 14,
    fontFamily: "'Courier New', monospace",
  },
};