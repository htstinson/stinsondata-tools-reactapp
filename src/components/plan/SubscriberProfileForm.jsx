// ── my-login-app/src/components/plan/SubscriberProfileForm.jsx ──

import React, { useState, useEffect } from 'react';
import { api } from '../../api';
import AddressGrid from './AddressGrid.jsx';

// ── Reusable field components ─────────────────────────────────────────────────

const DisplayField = ({ label, value }) => (
  <div className="flex items-center gap-4 py-0">
    <label className="text-sm font-bold text-gray-600 w-32 shrink-0">{label}</label>
    <span className="text-sm px-3 py-0.5 text-gray-800">{value}</span>
  </div>
);

const TextField = ({ label, name, value, onChange }) => (
  <div className="flex items-center gap-4 py-1">
    <label className="text-sm font-bold text-gray-600 w-32 shrink-0">{label}</label>
    <input
      type="text"
      name={name}
      value={value}
      onChange={onChange}
      className="flex-1 border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
    />
  </div>
);

const SelectField = ({ label, name, value, onChange, options, width }) => (
  <div className="flex items-center gap-4 py-1">
    <label className="text-sm font-bold text-gray-600 w-32 shrink-0">{label}</label>
    <select
      name={name}
      value={value}
      onChange={onChange}
      className="rounded-lg px-2 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white"
      style={{ border: '2px solid #93c5fd', width: width || '100%' }}
    >
      {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
    </select>
  </div>
);

const ZipField = ({ value, onChange }) => {
  const valid = value === '' || /^\d{5}(-\d{4})?$/.test(value);
  return (
    <div className="flex flex-col">
      <input
        type="text"
        name="zip"
        value={value}
        onChange={onChange}
        maxLength={10}
        placeholder="12345-6789"
        style={{ width: '8rem' }}
        className={`border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 ${
          valid ? 'focus:ring-blue-400' : 'border-red-400 focus:ring-red-400'
        }`}
      />
      {!valid && <p className="text-xs text-red-500 mt-1">12345 or 12345-6789</p>}
    </div>
  );
};

// ── Address options ───────────────────────────────────────────────────────────
const ADDRESS_TYPES = [
  { value: 'street', label: 'Street' },
  { value: 'po',     label: 'PO Box' },
];
const ADDRESS_USES = [
  { value: 'headquarters', label: 'Headquarters' },
  { value: 'office',       label: 'Office'        },
  { value: 'shipping',     label: 'Shipping'      },
  { value: 'other',        label: 'Other'         },
];
const US_STATES = [
  { value: '',   label: '—' },
  { value: 'AL', label: 'AL' }, { value: 'AK', label: 'AK' },
  { value: 'AZ', label: 'AZ' }, { value: 'AR', label: 'AR' },
  { value: 'CA', label: 'CA' }, { value: 'CO', label: 'CO' },
  { value: 'CT', label: 'CT' }, { value: 'DE', label: 'DE' },
  { value: 'FL', label: 'FL' }, { value: 'GA', label: 'GA' },
  { value: 'HI', label: 'HI' }, { value: 'ID', label: 'ID' },
  { value: 'IL', label: 'IL' }, { value: 'IN', label: 'IN' },
  { value: 'IA', label: 'IA' }, { value: 'KS', label: 'KS' },
  { value: 'KY', label: 'KY' }, { value: 'LA', label: 'LA' },
  { value: 'ME', label: 'ME' }, { value: 'MD', label: 'MD' },
  { value: 'MA', label: 'MA' }, { value: 'MI', label: 'MI' },
  { value: 'MN', label: 'MN' }, { value: 'MS', label: 'MS' },
  { value: 'MO', label: 'MO' }, { value: 'MT', label: 'MT' },
  { value: 'NE', label: 'NE' }, { value: 'NV', label: 'NV' },
  { value: 'NH', label: 'NH' }, { value: 'NJ', label: 'NJ' },
  { value: 'NM', label: 'NM' }, { value: 'NY', label: 'NY' },
  { value: 'NC', label: 'NC' }, { value: 'ND', label: 'ND' },
  { value: 'OH', label: 'OH' }, { value: 'OK', label: 'OK' },
  { value: 'OR', label: 'OR' }, { value: 'PA', label: 'PA' },
  { value: 'RI', label: 'RI' }, { value: 'SC', label: 'SC' },
  { value: 'SD', label: 'SD' }, { value: 'TN', label: 'TN' },
  { value: 'TX', label: 'TX' }, { value: 'UT', label: 'UT' },
  { value: 'VT', label: 'VT' }, { value: 'VA', label: 'VA' },
  { value: 'WA', label: 'WA' }, { value: 'WV', label: 'WV' },
  { value: 'WI', label: 'WI' }, { value: 'WY', label: 'WY' },
  { value: 'DC', label: 'DC' }, { value: 'AS', label: 'AS' },
  { value: 'GU', label: 'GU' }, { value: 'MP', label: 'MP' },
  { value: 'PR', label: 'PR' }, { value: 'VI', label: 'VI' },
];

const BLANK_ADDRESS = {
  address_type: 'street', address_use: 'headquarters',
  street1: '', street2: '', po_box: '', city: '', state: '', zip: '',
};

// ── Address grid + inline form ────────────────────────────────────────────────
const AddressTab = ({ addresses, onChange }) => {
  const [editIndex, setEditIndex] = useState(null); // null = closed, -1 = new
  const [draft, setDraft]         = useState(BLANK_ADDRESS);

  const handleDraftChange = (e) => {
    const { name, value } = e.target;
    setDraft(prev => ({ ...prev, [name]: value }));
  };

  const openAdd  = () => { setDraft(BLANK_ADDRESS); setEditIndex(-1); };
  const openEdit = (i) => { setDraft({ ...addresses[i] }); setEditIndex(i); };
  const cancel   = () => setEditIndex(null);

  const save = () => {
    const next = [...addresses];
    if (editIndex === -1) next.push(draft);
    else next[editIndex] = draft;
    onChange(next);
    setEditIndex(null);
  };

  const remove = (i) => {
    const next = addresses.filter((_, idx) => idx !== i);
    onChange(next);
    if (editIndex === i) setEditIndex(null);
  };

  const lineOne = (a) => a.address_type === 'po'
    ? `PO Box ${a.po_box}`
    : [a.street1, a.street2].filter(Boolean).join(', ');

  return (
    <div className="flex flex-col gap-3">

      {/* Grid */}
      <table className="w-full text-sm border-collapse">
        <thead>
          <tr style={{ background: 'var(--color-primary)' }}>
            {['Type', 'Use', 'Address', 'City', 'St', 'Zip', ''].map(h => (
              <th key={h} className="text-left px-2 py-1.5 text-xs font-semibold text-white">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {addresses.length === 0 && (
            <tr>
              <td colSpan={7} className="text-center text-gray-400 py-4 text-sm">No addresses yet</td>
            </tr>
          )}
          {addresses.map((a, i) => (
            <tr key={i} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
              <td className="px-2 py-1.5 capitalize">{a.address_type}</td>
              <td className="px-2 py-1.5 capitalize">{a.address_use}</td>
              <td className="px-2 py-1.5">{lineOne(a)}</td>
              <td className="px-2 py-1.5">{a.city}</td>
              <td className="px-2 py-1.5">{a.state}</td>
              <td className="px-2 py-1.5">{a.zip}</td>
              <td className="px-2 py-1.5 whitespace-nowrap">
                <button onClick={() => openEdit(i)} className="text-blue-500 hover:text-blue-700 mr-2 text-xs">Edit</button>
                <button onClick={() => remove(i)}   className="text-red-400  hover:text-red-600  text-xs">Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <button
        onClick={openAdd}
        className="self-start px-4 py-1.5 rounded-lg text-sm font-medium text-white"
        style={{ background: 'var(--color-primary)' }}
      >
        + Add Address
      </button>

      {/* Inline add/edit form */}
      {editIndex !== null && (
        <div className="border rounded-xl p-4 flex flex-col gap-2 mt-1" style={{ background: '#f8fafc' }}>
          <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1">
            {editIndex === -1 ? 'New Address' : 'Edit Address'}
          </p>

          {/* Type + Use */}
          <div className="flex items-center gap-4 py-1">
            <label className="text-sm font-bold text-gray-600 w-24 shrink-0">Type</label>
            <select name="address_type" value={draft.address_type} onChange={handleDraftChange}
              className="rounded-lg px-2 py-1.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-400"
              style={{ border: '2px solid #93c5fd', width: '7rem' }}>
              {ADDRESS_TYPES.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
            <label className="text-sm font-bold text-gray-600 shrink-0">Use</label>
            <select name="address_use" value={draft.address_use} onChange={handleDraftChange}
              className="flex-1 rounded-lg px-2 py-1.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-400"
              style={{ border: '2px solid #93c5fd' }}>
              {ADDRESS_USES.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>

          {/* Street or PO */}
          {draft.address_type === 'street' ? (
            <>
              <TextField label="Street 1" name="street1" value={draft.street1} onChange={handleDraftChange} />
              <TextField label="Street 2" name="street2" value={draft.street2} onChange={handleDraftChange} />
            </>
          ) : (
            <TextField label="PO Box" name="po_box" value={draft.po_box} onChange={handleDraftChange} />
          )}

          <TextField label="City" name="city" value={draft.city} onChange={handleDraftChange} />

          {/* State + Zip */}
          <div className="flex items-start gap-4 py-1">
            <label className="text-sm font-bold text-gray-600 w-24 shrink-0 pt-2">State</label>
            <div className="flex gap-4">
              <select name="state" value={draft.state} onChange={handleDraftChange}
                className="rounded-lg px-2 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-400"
                style={{ border: '2px solid #93c5fd', width: '5rem' }}>
                {US_STATES.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
              <div className="flex items-center gap-2">
                <label className="text-sm font-bold text-gray-600 shrink-0">Zip</label>
                <ZipField value={draft.zip} onChange={handleDraftChange} />
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2 mt-2">
            <button onClick={save}
              className="px-4 py-1.5 rounded-lg text-sm font-medium text-white"
              style={{ background: 'var(--color-primary)' }}>
              Save
            </button>
            <button onClick={cancel}
              className="px-4 py-1.5 rounded-lg text-sm font-medium text-gray-600 border">
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

// ── Tabs config ───────────────────────────────────────────────────────────────
const TABS = [
  { id: 'identity',    label: 'Identity'    },
  { id: 'address',     label: 'Addresses'   },
  { id: 'contact',     label: 'Contact'     },
  { id: 'socials',     label: 'Socials'     },
  { id: 'directories', label: 'Directories' },
];

// ── Component ─────────────────────────────────────────────────────────────────
const SubscriberProfileForm = ({ profile }) => {
  const [activeTab, setActiveTab] = useState('identity');
  const [visitedTabs, setVisitedTabs] = useState(new Set(['identity']));
  const [form, setForm] = useState({
    name: '', id: '', parentid: '', created_at: '', modified_at: '', legal_name: '',
    addresses: [],
    phone: '', fax: '', website: '', email: '',
    linkedin: '', facebook: '', instagram: '', x: '',
    youtube: '', tiktok: '', pinterest: '',
    googlebusiness: '', yelp: '', glassdoor: '', github: '', nextdoor: '',
  });
  const [saving, setSaving]   = useState(false);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    if (profile) setForm(prev => ({ ...prev, ...profile }));
  }, [profile]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleAddressChange = (addresses) => {
    setForm(prev => ({ ...prev, addresses }));
  };

  const handleSubmit = async () => {
    setSaving(true);
    setMessage(null);
    try {
      await api.put('/api/v1/subscriber/profile', form);
      setMessage({ type: 'success', text: 'Profile saved.' });
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to save profile.' });
    } finally {
      setSaving(false);
    }
  };

  if (!profile) return null;

  return (
    <div className="w-full">

      {/* ── Tabs ── */}
      <div className="flex border-b mb-0 rounded-t-xl overflow-hidden" style={{ background: 'var(--color-primary)' }}>
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => {
              setActiveTab(tab.id);
              setVisitedTabs(prev => new Set([...prev, tab.id]));
            }}
            className="px-5 py-2 text-sm font-medium transition-colors"
            style={{
              borderBottom: activeTab === tab.id ? '2px solid white' : '2px solid transparent',
              color:        activeTab === tab.id ? 'white' : 'rgba(255,255,255,0.6)',
              background:   activeTab === tab.id ? 'rgba(255,255,255,0.15)' : 'transparent',
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── Card ── */}
      <div className="p-6 rounded-b-xl rounded-tr-xl shadow" style={{ background: 'var(--color-card-bg, white)' }}>

        {/* Identity */}
        {activeTab === 'identity' && (
          <div className="flex flex-col gap-2">
            <DisplayField label="Id"          value={form.id} />
            <DisplayField label="Parent Id"   value={form.parentid} />
            <DisplayField label="Created At"  value={form.created_at} />
            <DisplayField label="Modified At" value={form.modified_at} />
            <TextField    label="Legal Name"  name="legal_name" value={form.legal_name} onChange={handleChange} />
          </div>
        )}

        {/* Address */}
        {visitedTabs.has('address') && (
          <div className={activeTab === 'address' ? 'block' : 'hidden'}>
            <AddressGrid subscriberId={form.id} />
          </div>
        )}

        {/* Contact */}
        {activeTab === 'contact' && (
          <div className="flex flex-col gap-2">
            <TextField label="Phone"   name="phone"   value={form.phone}   onChange={handleChange} />
            <TextField label="Fax"     name="fax"     value={form.fax}     onChange={handleChange} />
            <TextField label="Website" name="website" value={form.website} onChange={handleChange} />
            <TextField label="Email"   name="email"   value={form.email}   onChange={handleChange} />
          </div>
        )}

        {/* Socials */}
        {activeTab === 'socials' && (
          <div className="flex flex-col gap-2">
            <TextField label="LinkedIn"  name="linkedin"  value={form.linkedin}  onChange={handleChange} />
            <TextField label="Facebook"  name="facebook"  value={form.facebook}  onChange={handleChange} />
            <TextField label="Instagram" name="instagram" value={form.instagram} onChange={handleChange} />
            <TextField label="X"         name="x"         value={form.x}         onChange={handleChange} />
            <TextField label="YouTube"   name="youtube"   value={form.youtube}   onChange={handleChange} />
            <TextField label="TikTok"    name="tiktok"    value={form.tiktok}    onChange={handleChange} />
            <TextField label="Pinterest" name="pinterest" value={form.pinterest} onChange={handleChange} />
          </div>
        )}

        {/* Directories */}
        {activeTab === 'directories' && (
          <div className="flex flex-col gap-2">
            <TextField label="Google Business" name="googlebusiness" value={form.googlebusiness} onChange={handleChange} />
            <TextField label="Yelp"            name="yelp"           value={form.yelp}           onChange={handleChange} />
            <TextField label="Glassdoor"       name="glassdoor"      value={form.glassdoor}      onChange={handleChange} />
            <TextField label="GitHub"          name="github"         value={form.github}         onChange={handleChange} />
            <TextField label="Nextdoor"        name="nextdoor"       value={form.nextdoor}       onChange={handleChange} />
          </div>
        )}

        {message && (
          <p className={`mt-4 text-sm ${message.type === 'success' ? 'text-green-600' : 'text-red-500'}`}>
            {message.text}
          </p>
        )}

        {activeTab !== 'address' && (
          <button
            onClick={handleSubmit}
            disabled={saving}
            className="mt-6 px-5 py-2 rounded-lg text-sm font-medium text-white transition-opacity"
            style={{ background: 'var(--color-primary)', opacity: saving ? 0.6 : 1 }}
          >
            {saving ? 'Saving...' : 'Save'}
          </button>
        )}
      </div>

    </div>
  );
};

export default SubscriberProfileForm;