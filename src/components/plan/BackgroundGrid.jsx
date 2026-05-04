// ── my-login-app/src/components/plan/BackgroundGrid.jsx ──

import React, { useState, useEffect, useCallback } from 'react';
import { api } from '../../api';

// ── Reusable field ────────────────────────────────────────────────────────────
const TextField = ({ label, name, value, onChange, multiline = false }) => (
  <div className="flex items-start gap-4 py-1">
    <label className="text-sm font-bold text-gray-600 w-28 shrink-0 pt-2">{label}</label>
    {multiline ? (
      <textarea
        name={name}
        value={value}
        onChange={onChange}
        rows={3}
        className="flex-1 border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 resize-y"
      />
    ) : (
      <input
        type="text"
        name={name}
        value={value}
        onChange={onChange}
        className="flex-1 border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
      />
    )}
  </div>
);

// ── Constants ─────────────────────────────────────────────────────────────────
const BLANK = { subscriber_id: '', topic: null, summary: null, details: null };

// ── Component ─────────────────────────────────────────────────────────────────
const BackgroundGrid = ({ subscriberId }) => {
  const [rows, setRows]           = useState([]);
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState(null);
  const [editIndex, setEditIndex] = useState(null); // null=closed, -1=new
  const [draft, setDraft]         = useState(BLANK);
  const [saving, setSaving]       = useState(false);

  // ── Fetch ──────────────────────────────────────────────────────────────────
  const load = useCallback(async () => {
    if (!subscriberId) return;
    setLoading(true);
    setError(null);
    try {
      const res = await api.post('/api/v1/subscriber/backgrounds', { id: subscriberId });
      setRows(res?.data ?? res ?? []);
    } catch {
      setError('Failed to load background records.');
    } finally {
      setLoading(false);
    }
  }, [subscriberId]);

  useEffect(() => { load(); }, [load]);

  // ── Draft helpers ──────────────────────────────────────────────────────────
  const handleDraftChange = (e) => {
    const { name, value } = e.target;
    setDraft(prev => ({ ...prev, [name]: value === '' ? null : value }));
  };

  const openAdd  = () => { setDraft({ ...BLANK, subscriber_id: subscriberId }); setEditIndex(-1); };
  const openEdit = async (i) => {
    try {
      const res = await api.post('/api/v1/subscriber/background/g', { id: rows[i].id, subscriber_id: rows[i].subscriber_id });
      setDraft(res?.data ?? res ?? rows[i]);
    } catch {
      setDraft({ ...rows[i] });
    }
    setEditIndex(i);
  };
  const cancel = () => setEditIndex(null);

  // ── Save (create or update) ────────────────────────────────────────────────
  const save = async () => {
    setSaving(true);
    try {
      if (editIndex === -1) {
        await api.post('/api/v1/subscriber/background', draft);
      } else {
        await api.put('/api/v1/subscriber/background', draft);
      }
      setEditIndex(null);
      await load();
    } catch {
      setError('Failed to save record.');
    } finally {
      setSaving(false);
    }
  };

  // ── Delete ─────────────────────────────────────────────────────────────────
  const remove = async (i) => {
    const row = rows[i];
    if (!window.confirm(`Delete "${row.topic}"?`)) return;
    try {
      await api.delete(`/api/v1/subscriber/background/d/${row.subscriber_id}/${row.id}`);
      if (editIndex === i) setEditIndex(null);
      await load();
    } catch {
      setError('Failed to delete record.');
    }
  };

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col gap-3">

      {error && (
        <p className="text-sm text-red-500">{error}</p>
      )}

      {/* Grid */}
      <div className="overflow-x-auto rounded-lg border border-gray-200">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr style={{ background: 'var(--color-primary)' }}>
              {['Topic', 'Summary', 'Details', ''].map(h => (
                <th key={h} className="text-left px-3 py-2 text-xs font-semibold text-white whitespace-nowrap">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr>
                <td colSpan={4} className="text-center text-gray-400 py-6 text-sm">Loading…</td>
              </tr>
            )}
            {!loading && rows.length === 0 && (
              <tr>
                <td colSpan={4} className="text-center text-gray-400 py-6 text-sm">No background records yet</td>
              </tr>
            )}
            {!loading && rows.map((row, i) => (
              <tr
                key={row.id ?? i}
                className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}
              >
                <td className="px-3 py-2 font-medium whitespace-nowrap">{row.topic}</td>
                <td className="px-3 py-2 max-w-xs truncate">{row.summary}</td>
                <td className="px-3 py-2 max-w-sm truncate text-gray-500">{row.details}</td>
                <td className="px-3 py-2 whitespace-nowrap">
                  <button
                    onClick={() => openEdit(i)}
                    className="text-blue-500 hover:text-blue-700 mr-3 text-xs"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => remove(i)}
                    className="text-red-400 hover:text-red-600 text-xs"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <button
        onClick={openAdd}
        className="self-start px-4 py-1.5 rounded-lg text-sm font-medium text-white"
        style={{ background: 'var(--color-primary)' }}
      >
        + Add Background
      </button>

      {/* Inline add / edit form */}
      {editIndex !== null && (
        <div
          className="border rounded-xl p-4 flex flex-col gap-2 mt-1"
          style={{ background: '#f8fafc' }}
        >
          <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1">
            {editIndex === -1 ? 'New Background' : 'Edit Background'}
          </p>

          <TextField label="Topic"   name="topic"   value={draft.topic ?? ''}   onChange={handleDraftChange} />
          <TextField label="Summary" name="summary" value={draft.summary ?? ''} onChange={handleDraftChange} multiline />
          <TextField label="Details" name="details" value={draft.details ?? ''} onChange={handleDraftChange} multiline />

          <div className="flex gap-2 mt-2">
            <button
              onClick={save}
              disabled={saving}
              className="px-4 py-1.5 rounded-lg text-sm font-medium text-white transition-opacity"
              style={{ background: 'var(--color-primary)', opacity: saving ? 0.6 : 1 }}
            >
              {saving ? 'Saving…' : 'Save'}
            </button>
            <button
              onClick={cancel}
              className="px-4 py-1.5 rounded-lg text-sm font-medium text-gray-600 border"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default BackgroundGrid;