import { useDeferredValue, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  createMasterData,
  deleteMasterData,
  listMasterData,
  updateMasterData,
  type MasterRecord,
} from '../../lib/api/masterData';
import type { MasterField, MasterPageConfig } from '../../lib/masters/config';

function emptyFormState(config: MasterPageConfig) {
  return config.fields.reduce<Record<string, string>>((accumulator, field) => {
    accumulator[field.key] = config.defaults?.[field.key] ?? '';
    return accumulator;
  }, {});
}

function recordToFormState(config: MasterPageConfig, record: MasterRecord) {
  return config.fields.reduce<Record<string, string>>((accumulator, field) => {
    const value = record[field.key];
    accumulator[field.key] = value === undefined || value === null ? config.defaults?.[field.key] ?? '' : String(value);
    return accumulator;
  }, {});
}

function buildPayload(config: MasterPageConfig, fields: Record<string, string>) {
  const payload: MasterRecord = { ...config.defaults };

  config.fields.forEach((field) => {
    const rawValue = fields[field.key]?.trim() ?? '';
    if (rawValue === '') {
      return;
    }

    payload[field.key] = field.type === 'number' ? Number(rawValue) : rawValue;
  });

  return payload;
}

function valueMatchesSearch(record: MasterRecord, fields: MasterField[], searchTerm: string) {
  if (!searchTerm) {
    return true;
  }

  return fields.some((field) => String(record[field.key] ?? '').toLowerCase().includes(searchTerm));
}

export function MasterDataPage({ config }: { config: MasterPageConfig }) {
  const queryClient = useQueryClient();
  const [selectedId, setSelectedId] = useState<number | string | null>(null);
  const [searchInput, setSearchInput] = useState('');
  const [formState, setFormState] = useState<Record<string, string>>(() => emptyFormState(config));
  const deferredSearch = useDeferredValue(searchInput);

  const queryKey = ['master-data', config.resource] as const;

  const recordsQuery = useQuery({
    queryKey,
    queryFn: () => listMasterData<MasterRecord>(config.resource),
  });

  const saveMutation = useMutation({
    mutationFn: async () => {
      const payload = buildPayload(config, formState);
      return selectedId
        ? updateMasterData(config.resource, selectedId, payload)
        : createMasterData(config.resource, payload);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey });
      setSelectedId(null);
      setFormState(emptyFormState(config));
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number | string) => deleteMasterData(config.resource, id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey });
      setSelectedId(null);
      setFormState(emptyFormState(config));
    },
  });

  const filteredRecords = (recordsQuery.data ?? []).filter((record) =>
    valueMatchesSearch(record, config.fields, deferredSearch.trim().toLowerCase())
  );

  const activeError = saveMutation.error?.message ?? deleteMutation.error?.message ?? recordsQuery.error?.message;

  function handleInputChange(fieldKey: string, value: string) {
    setFormState((current) => ({
      ...current,
      [fieldKey]: value,
    }));
  }

  function handleEdit(record: MasterRecord) {
    setSelectedId((record.id as number | string | undefined) ?? null);
    setFormState(recordToFormState(config, record));
  }

  function handleDelete(record: MasterRecord) {
    const recordId = record.id;
    if (recordId === undefined || recordId === null) {
      return;
    }

    if (window.confirm(`Archive this ${config.title.toLowerCase()} row?`)) {
      deleteMutation.mutate(recordId);
    }
  }

  return (
    <section className="content-stack">
      <div className="section-header">
        <div>
          <p className="section-header__eyebrow">Master data</p>
          <h1>{config.title}</h1>
          <p>{config.description}</p>
        </div>

        <div className="section-header__stats">
          <span>{recordsQuery.data?.length ?? 0} rows</span>
          <span>{selectedId ? 'Editing active row' : 'Create mode'}</span>
        </div>
      </div>

      {activeError ? <p className="error-banner">{activeError}</p> : null}

      <div className="master-grid">
        <form
          className="editor-card"
          onSubmit={(event) => {
            event.preventDefault();
            saveMutation.mutate();
          }}
        >
          <div className="editor-card__header">
            <div>
              <span className="editor-card__eyebrow">{selectedId ? 'Edit row' : 'Create row'}</span>
              <h2>{config.title}</h2>
            </div>

            {selectedId ? (
              <button
                className="ghost-button"
                onClick={() => {
                  setSelectedId(null);
                  setFormState(emptyFormState(config));
                }}
                type="button"
              >
                Reset
              </button>
            ) : null}
          </div>

          <div className="form-grid">
            {config.fields.map((field) => (
              <label className="form-field" key={field.key}>
                <span>
                  {field.label}
                  {field.required ? ' *' : ''}
                </span>
                <input
                  className="text-input"
                  onChange={(event) => handleInputChange(field.key, event.target.value)}
                  placeholder={field.placeholder}
                  required={field.required}
                  type={field.type ?? 'text'}
                  value={formState[field.key] ?? ''}
                />
              </label>
            ))}
          </div>

          <button className="primary-button" disabled={saveMutation.isPending} type="submit">
            {saveMutation.isPending ? 'Saving...' : selectedId ? 'Save changes' : 'Create row'}
          </button>
        </form>

        <div className="table-card">
          <div className="table-card__toolbar">
            <div>
              <span className="editor-card__eyebrow">Live data</span>
              <h2>{config.title} list</h2>
            </div>

            <input
              className="text-input text-input--search"
              onChange={(event) => setSearchInput(event.target.value)}
              placeholder="Search rows"
              type="search"
              value={searchInput}
            />
          </div>

          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  {config.fields.map((field) => (
                    <th key={field.key} scope="col">
                      {field.label}
                    </th>
                  ))}
                  <th scope="col">Actions</th>
                </tr>
              </thead>
              <tbody>
                {recordsQuery.isLoading ? (
                  <tr>
                    <td colSpan={config.fields.length + 1}>Loading rows...</td>
                  </tr>
                ) : filteredRecords.length === 0 ? (
                  <tr>
                    <td colSpan={config.fields.length + 1}>No rows available yet.</td>
                  </tr>
                ) : (
                  filteredRecords.map((record) => (
                    <tr key={String(record.id ?? JSON.stringify(record))}>
                      {config.fields.map((field) => (
                        <td key={field.key}>{String(record[field.key] ?? '—')}</td>
                      ))}
                      <td>
                        <div className="table-actions">
                          <button className="ghost-button" onClick={() => handleEdit(record)} type="button">
                            Edit
                          </button>
                          {record.id !== undefined ? (
                            <button
                              className="ghost-button ghost-button--danger"
                              onClick={() => handleDelete(record)}
                              type="button"
                            >
                              Delete
                            </button>
                          ) : null}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </section>
  );
}
