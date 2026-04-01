// ── my-login-app/src/components/plan/BackgroundForm.jsx ──

import React, { useState, useEffect } from 'react';
import { api } from '../../api';

// ── Options ───────────────────────────────────────────────────────────────────
const TOPIC_OPTIONS = [
  { value: 'history',        label: 'History'        },
  { value: 'focus_area',     label: 'Focus Area'     },
  { value: 'differentiator', label: 'Differentiator' },
  { value: 'strengths',      label: 'Strengths'      },
  { value: 'challenges',     label: 'Challenges'     },
];

const BLANK_TAB = () => ({
  _id:         crypto.randomUUID(),
  id:          '',
  parent_id:   '',
  created_at:  '',
  modified_at: '',
  topic:       'history',
  summary:     '',
  details:     '',
});

// ── Field components ──────────────────────────────────────────────────────────
const DisplayField = ({ label, value }) => (
  <div className="flex items-center gap-4 py-0">
    <label className="text-sm font-bold text-gray-600 w-28 shrink-0">{label}</label>
    <span className="text-sm px-3 py-0.5 text-gray-500">{value || '—'}</span>
  </div>
);

const SelectField = ({ label, name, value, onChange }) => (
  <div className="flex items-center gap-4 py-1">
    <label className="text-sm font-bold text-gray-600 w-28 shrink-0">{label}</label>
    <select
      name={name} value={value} onChange={onChange}
      className="rounded-lg px-2 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-400"
      style={{ border: '2px solid #93c5fd', minWidth: '12rem' }}
    >
      {TOPIC_OPTIONS.map(o => (
        <option key={o.value} value={o.value}>{o.label}</option>
      ))}
    </select>
  </div>
);

const TextField = ({ label, name, value, onChange }) => (
  <div className="flex items-center gap-4 py-1">
    <label className="text-sm font-bold text-gray-600 w-28 shrink-0">{label}</label>
    <input
      type="text" name={name} value={value} onChange={onChange}
      className="flex-1 border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
    />
  </div>
);

const TextAreaField = ({ label, name, value, onChange }) => (
  <div className="flex items-start gap-4 py-1">
    <label className="text-sm font-bold text-gray-600 w-28 shrink-0 pt-2">{label}</label>
    <textarea
      name={name} value={value} onChange={onChange}
      rows={6}
      className="flex-1 border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 resize-y"
    />
  </div>
);

// ── Component ─────────────────────────────────────────────────────────────────
const BackgroundForm = ({ subscriberId }) => {
  const [tabs, setTabs]           = useState([BLANK_TAB()]);
  const [activeTab, setActiveTab] = useState(0);
  const [saving, setSaving]       = useState(false);
  const [message, setMessage]     = useState(null);

  // ── Fetch existing background items ───────────────────────────────────────
  useEffect(() => {
    if (!subscriberId) return;
    const fetch = async () => {
      try {
        const data = await api.post('/api/v1/subscriber/background', { id: subscriberId });
        if (data?.length) {
          setTabs(data.map(d => ({ ...d, _id: d.id ?? crypto.randomUUID() })));
          setActiveTab(0);
        }
      } catch (err) {
        console.error('[BackgroundForm] fetch failed:', err);
      }
    };
    fetch();
  }, [subscriberId]);

  // ── Handlers ──────────────────────────────────────────────────────────────
  const handleChange = (e) => {
    const { name, value } = e.target;
    setTabs(prev => prev.map((t, i) => i === activeTab ? { ...t, [name]: value } : t));
  };

  const addTab = () => {
    const newTab = BLANK_TAB();
    setTabs(prev => [...prev, newTab]);
    setActiveTab(tabs.length);
  };

  const removeTab = (idx) => {
    if (tabs.length === 1) return; // always keep at least one tab
    setTabs(prev => {
      const next = prev.filter((_, i) => i !== idx);
      return next;
    });
    setActiveTab(prev => Math.min(prev, tabs.length - 2));
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage(null);
    try {
      await api.put('/api/v1/subscriber/background', {
        subscriber_id: subscriberId,
        items: tabs.map(({ _id, ...rest }) => rest), // strip client-only _id
      });
      setMessage({ type: 'success', text: 'Background saved.' });
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to save background.' });
    } finally {
      setSaving(false);
    }
  };

  const current = tabs[activeTab] ?? BLANK_TAB();

  const tabLabel = (t, i) => {
    const label = TOPIC_OPTIONS.find(o => o.value === t.topic)?.label ?? t.topic;
    const sameTopicCount = tabs.filter(o => o.topic === t.topic).length;
    if (sameTopicCount < 2) return label;
    const idx = tabs.filter((o, j) => o.topic === t.topic && j <= i).length;
    return `${label} ${idx}`;
  };

  return (
    <div className="w-full">

      {/* ── Tab bar ── */}
      <div className="flex items-end border-b mb-0 rounded-t-xl overflow-hidden"
        style={{ background: 'var(--color-primary, #1e3a5f)' }}>

        {tabs.map((t, i) => (
          <div
            key={t._id}
            className="flex items-center"
            style={{
              borderBottom:  activeTab === i ? '2px solid white' : '2px solid transparent',
              background:    activeTab === i ? 'rgba(255,255,255,0.15)' : 'var(--color-primary, #1e3a5f)',
            }}
          >
            <button
              onClick={() => setActiveTab(i)}
              className="px-4 py-2 text-sm font-medium transition-colors"
              style={{ color: activeTab === i ? 'white' : 'rgba(255,255,255,0.85)', background: 'transparent' }}
            >
              {tabLabel(t, i)}
            </button>
            {tabs.length > 1 && (
              <button
                onClick={(e) => { e.stopPropagation(); removeTab(i); }}
                className="pr-2 text-xs transition-colors"
                style={{ color: activeTab === i ? 'rgba(255,255,255,0.8)' : 'rgba(255,255,255,0.4)', background: 'transparent', border: 'none', padding: '0' }}
                title="Remove tab"
              >
                ✕
              </button>
            )}
          </div>
        ))}

        {/* Add tab button */}
        <button
          onClick={addTab}
          className="px-3 py-2 text-sm font-medium transition-colors"
          style={{ color: 'rgba(255,255,255,0.6)', background: 'transparent', border: 'none' }}
          title="Add background item"
        >
          +
        </button>
      </div>

      {/* ── Card ── */}
      <div className="p-6 rounded-b-xl rounded-tr-xl shadow flex flex-col gap-3"
        style={{ background: 'var(--color-card-bg, white)' }}>

        <SelectField   label="Topic"   name="topic"   value={current.topic}   onChange={handleChange} />
        <TextField     label="Summary" name="summary" value={current.summary} onChange={handleChange} />
        <TextAreaField label="Details" name="details" value={current.details} onChange={handleChange} />

        {/* ── Read-only system fields ── */}
        <div className="mt-4 pt-4 border-t flex flex-col gap-1">
          <DisplayField label="Id"          value={current.id} />
          <DisplayField label="Parent Id"   value={current.parent_id} />
          <DisplayField label="Created At"  value={current.created_at} />
          <DisplayField label="Modified At" value={current.modified_at} />
        </div>

        {message && (
          <p className={`text-sm ${message.type === 'success' ? 'text-green-600' : 'text-red-500'}`}>
            {message.text}
          </p>
        )}

        <button
          onClick={handleSave}
          disabled={saving}
          className="self-start mt-2 px-5 py-2 rounded-lg text-sm font-medium text-white transition-opacity"
          style={{ background: 'var(--color-primary)', opacity: saving ? 0.6 : 1 }}
        >
          {saving ? 'Saving...' : 'Save'}
        </button>
      </div>

    </div>
  );
};

export default BackgroundForm;