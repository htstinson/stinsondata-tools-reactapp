// ── my-login-app/src/components/plan/AddressGrid.jsx ──

import React, { useState, useEffect, useCallback } from 'react';
import { api } from '../../api';

// ── Options ───────────────────────────────────────────────────────────────────
const ADDRESS_TYPES = [
  { value: 'street', label: 'Street' },
  { value: 'po',     label: 'Post Office' },
];
const ADDRESS_USES = [
  { value: 'mailing',      label: 'Mailing'       },
  { value: 'shipping',     label: 'Shipping'      },
  { value: 'sales',        label: 'Sales'      },
  { value: 'other',        label: 'Other'         },
];
const US_STATES = [
  { value: '',   label: '—'  },
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

const PAGE_SIZES = [10, 20, 50];

const BLANK_ROW = () => ({
  _tempId:      crypto.randomUUID(),
  id:           null,
  parent_id:    '',
  created_at:   '',
  modified_at:  '',
  address_type: 'street',
  address_use:  'headquarters',
  street1:      '',
  street2:      '',
  po_box:       '',
  city:         '',
  state:        '',
  zip:          '',
});

// ── Inline cell components ────────────────────────────────────────────────────
const Cell = ({ children }) => (
  <td className="px-1 py-1 align-top">{children}</td>
);

const InlineText = ({ name, value, onChange, placeholder, width }) => (
  <input
    type="text" name={name} value={value ?? ''} onChange={onChange}
    placeholder={placeholder}
    className="rounded text-xs focus:outline-none focus:ring-1 focus:ring-blue-400 w-full"
    style={{ width, padding: '0.4rem 0.5rem', border: '1px solid #d1d5db', boxSizing: 'border-box' }}
  />
);

const InlineSelect = ({ name, value, onChange, options, width }) => (
  <select
    name={name} value={value ?? ''} onChange={onChange}
    className="rounded text-xs bg-white focus:outline-none focus:ring-1 focus:ring-blue-400"
    style={{ border: '2px solid #93c5fd', width: width || '100%', padding: '0.4rem 0.25rem', boxSizing: 'border-box' }}
  >
    {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
  </select>
);

const ZipInput = ({ value, onChange }) => {
  const valid = !value || /^\d{5}(-\d{4})?$/.test(value);
  return (
    <div>
      <input
        type="text" name="zip" value={value ?? ''} onChange={onChange}
        maxLength={10} placeholder="12345"
        className={`border rounded text-xs focus:outline-none focus:ring-1 w-full ${
          valid ? 'focus:ring-blue-400' : 'border-red-400 focus:ring-red-400'
        }`}
        style={{ padding: '0.4rem 0.5rem' }}
      />
      {!valid && <p className="text-xs text-red-500 mt-0.5">12345 or 12345-6789</p>}
    </div>
  );
};

// ── Row ───────────────────────────────────────────────────────────────────────
const AddressRow = ({ row, isEven, subscriberId, onChange, onSaved, onDelete }) => {
  const [saving, setSaving] = useState(false);
  const [dirty,  setDirty]  = useState(row.id === null);

  const handle = (e) => {
    const { name, value } = e.target;
    onChange({ ...row, [name]: value });
    setDirty(true);
  };


    const save = async () => {
    setSaving(true);
    try {
        const { created_at, modified_at, _tempId, ...rest } = row;
        const payload = { ...rest, subscriber_id: subscriberId };
        if (row.id === null) {
        const created = await api.post('/api/v1/subscriber/address', payload);
        onChange({ ...row, id: created.id });
        onSaved?.();
        } else {
        await api.put('/api/v1/subscriber/address', payload);
        }
        setDirty(false);
    } catch (err) {
        console.error('[AddressRow] save failed:', err);
    } finally {
        setSaving(false);
    }
    };

  const remove = async () => {
    if (row.id !== null) {
      try {
        await api.delete(`/api/v1/subscriber/address/d/${subscriberId}/${row.id}`);
      } catch (err) {
        console.error('[AddressRow] delete failed:', err);
        return;
      }
    }
    onDelete();
  };

  return (
    <tr className={isEven ? 'bg-white' : 'bg-gray-50'}>
      <Cell>
        <InlineSelect name="address_type" value={row.address_type} onChange={handle}
          options={ADDRESS_TYPES} width="6rem" />
      </Cell>
      <Cell>
        <InlineSelect name="address_use" value={row.address_use} onChange={handle}
          options={ADDRESS_USES} width="9rem" />
      </Cell>
      <Cell>
        {row.address_type === 'street'
          ? <InlineText name="street1" value={row.street1} onChange={handle} placeholder="Street 1" width="12rem" />
          : <InlineText name="po_box"  value={row.po_box}  onChange={handle} placeholder="PO Box"   width="12rem" />
        }
      </Cell>
      <Cell>
        {row.address_type === 'street'
          ? <InlineText name="street2" value={row.street2} onChange={handle} placeholder="Street 2" width="12rem" />
          : null
        }
      </Cell>
      <Cell>
        <InlineText name="city" value={row.city} onChange={handle} placeholder="City" width="14rem" />
      </Cell>
      <Cell>
        <InlineSelect name="state" value={row.state} onChange={handle}
          options={US_STATES} width="4.5rem" />
      </Cell>
      <Cell>
        <ZipInput value={row.zip} onChange={handle} />
      </Cell>
      <Cell>
        <div className="flex flex-row gap-2 items-center">
          <button
            onClick={save} disabled={!dirty || saving}
            className="text-xs px-2 py-0.5 rounded text-white transition-opacity"
            style={{ background: 'var(--color-primary)', opacity: (!dirty || saving) ? 0.4 : 1 }}
          >
            {saving ? '...' : row.id === null ? 'Create' : 'Save'}
          </button>
          <button onClick={remove} className="text-xs text-red-400 hover:text-red-600">
            Delete
          </button>
        </div>
      </Cell>
    </tr>
  );
};

// ── Pagination bar ────────────────────────────────────────────────────────────
const Pagination = ({ skip, take, total, onPageChange, onSizeChange }) => {
  const page      = Math.floor(skip / take) + 1;
  const pageCount = Math.max(1, Math.ceil(total / take));

  return (
    <div className="flex items-center justify-between text-xs text-gray-500 pt-2">
      <span>{total} address{total !== 1 ? 'es' : ''}</span>
      <div className="flex items-center gap-2">
        <button
          disabled={page <= 1}
          onClick={() => onPageChange((page - 2) * take)}
          className="px-2 py-0.5 rounded border disabled:opacity-40"
        >‹</button>
        <span>Page {page} / {pageCount}</span>
        <button
          disabled={page >= pageCount}
          onClick={() => onPageChange(page * take)}
          className="px-2 py-0.5 rounded border disabled:opacity-40"
        >›</button>
        <select
          value={take}
          onChange={e => onSizeChange(Number(e.target.value))}
          className="border rounded px-1 py-0.5 text-xs"
        >
          {PAGE_SIZES.map(s => <option key={s} value={s}>{s} / page</option>)}
        </select>
      </div>
    </div>
  );
};

// ── Component ─────────────────────────────────────────────────────────────────
const AddressGrid = ({ subscriberId }) => {
  const [rows,     setRows]     = useState([]);
  const [total,    setTotal]    = useState(0);
  const [skip,     setSkip]     = useState(0);
  const [take,     setTake]     = useState(PAGE_SIZES[0]);
  const [sort,     setSort]     = useState('');
  const [order,    setOrder]    = useState('');
  const [loading,  setLoading]  = useState(true);
  const [fetching, setFetching] = useState(false);
  const [error,    setError]    = useState(null);

  const fetchData = useCallback(async () => {
    if (!subscriberId) return;

    // First load shows spinner; subsequent loads show overlay
    rows.length === 0 ? setLoading(true) : setFetching(true);
    setError(null);

    try {
      const page   = Math.floor(skip / take) + 1;
      const params = new URLSearchParams({ page, limit: take });
      if (sort)  params.append('sort',  sort);
      if (order) params.append('order', order);

      // POST body carries subscriber id; query params carry pagination
      const json = await api.post(
        `/api/v1/subscriber/addresses?${params}`,
        { id: subscriberId },
      );

      const data = json?.data ?? json ?? [];
      setRows(data.length ? data : []);
      setTotal(json?.total ?? data.length);
    } catch (err) {
      console.error('[AddressGrid] fetch failed:', err);
      setError('Failed to load addresses.');
    } finally {
      setLoading(false);
      setFetching(false);
    }
  }, [subscriberId, skip, take, sort, order]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const updateRow = (i, updated) =>
    setRows(prev => prev.map((r, idx) => idx === i ? updated : r));

  const deleteRow = (i) => {
    setRows(prev => prev.filter((_, idx) => idx !== i));
    setTotal(prev => Math.max(0, prev - 1));
  };

  const addRow = () => setRows(prev => [...prev, BLANK_ROW()]);

  const handleSizeChange = (newTake) => {
    setSkip(0);
    setTake(newTake);
  };

  if (loading) return <div className="text-sm text-gray-400 py-4">Loading addresses...</div>;
  if (error)   return <div className="text-sm text-red-500 py-4">{error}</div>;

  return (
    <div className="flex flex-col gap-3">
      <div className="flex justify-end">
        <button
          onClick={addRow}
          className="px-4 py-1.5 rounded-lg text-sm font-medium text-white"
          style={{ background: 'var(--color-primary)' }}
        >
          + Add Address
        </button>
      </div>

      <div className="relative overflow-x-auto">
        {fetching && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/50 rounded">
            <span className="text-gray-500 text-sm">Loading...</span>
          </div>
        )}
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr style={{ background: 'var(--color-primary)' }}>
              {['Type', 'Use', 'Street 1 / PO Box', 'Street 2', 'City', 'St', 'Zip', ''].map(h => (
                <th key={h} className="text-left px-2 py-1.5 text-xs font-semibold text-white whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={8} className="text-center text-gray-400 py-6 text-sm">
                  No addresses yet. Click "+ Add Address" to get started.
                </td>
              </tr>
            ) : rows.map((row, i) => (
              <AddressRow
                key={row.id ?? row._tempId}
                row={row}
                isEven={i % 2 === 0}
                subscriberId={subscriberId}
                onChange={(updated) => updateRow(i, updated)}
                onSaved={fetchData}
                onDelete={() => deleteRow(i)}
              />
            ))}
          </tbody>
        </table>
      </div>

      <Pagination
        skip={skip}
        take={take}
        total={total}
        onPageChange={setSkip}
        onSizeChange={handleSizeChange}
      />
    </div>
  );
};

export default AddressGrid;