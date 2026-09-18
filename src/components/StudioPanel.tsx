import { useState } from 'react';
import {
  CURATION_STATUSES,
  DIAGRAM_KEYS,
  DIAGRAM_TYPES,
  createCardId,
} from '../studio/customCards';
import { readDiagramImage } from '../studio/diagramImage';
import type {
  BitmapDiagram,
  CurationStatus,
  DiagramKey,
  DiagramType,
  PatentCard,
} from '../types/patent';

interface StudioPanelProps {
  /** Studio-authored cards only; the mock collection is not editable here. */
  cards: PatentCard[];
  onSave: (card: PatentCard) => string | null;
  onDelete: (id: string) => void;
  onClose: () => void;
}

interface StudioForm {
  id: string | null;
  publicationNumber: string;
  displayTitle: string;
  publicationDate: string;
  applicant: string;
  inventor: string;
  plainLanguageDescription: string;
  cpcCode: string;
  cpcHierarchy: string;
  diagramType: DiagramType;
  diagramComponent: DiagramKey;
  diagramImage: BitmapDiagram | null;
  sourceReference: string;
  curationStatus: CurationStatus;
  tags: string;
  featured: boolean;
}

const HIERARCHY_PLACEHOLDER = `G | Physics
G06N | Computing arrangements based on specific computational models
G06N 3/00 | Computing arrangements based on biological models
G06N 3/006 | Based on simulated virtual individual or collective life forms, e.g. particle swarm optimisation [PSO]`;

const emptyForm: StudioForm = {
  id: null,
  publicationNumber: '',
  displayTitle: '',
  publicationDate: '',
  applicant: '',
  inventor: '',
  plainLanguageDescription: '',
  cpcCode: '',
  cpcHierarchy: '',
  diagramType: 'schematic',
  diagramComponent: DIAGRAM_KEYS[0],
  diagramImage: null,
  sourceReference: '',
  curationStatus: 'Draft',
  tags: '',
  featured: false,
};

function toForm(card: PatentCard): StudioForm {
  return {
    id: card.id,
    publicationNumber: card.publicationNumber,
    displayTitle: card.displayTitle,
    publicationDate: card.publicationDate,
    applicant: card.applicant,
    inventor: card.inventor,
    plainLanguageDescription: card.plainLanguageDescription,
    cpcCode: card.cpc.code,
    cpcHierarchy: card.cpc.hierarchy
      .map((level) => `${level.symbol} | ${level.title}`)
      .join('\n'),
    diagramType: card.diagramType,
    diagramComponent: card.diagramComponent,
    diagramImage: card.diagramImage ?? null,
    sourceReference: card.sourceReference,
    curationStatus: card.curationStatus,
    tags: card.tags.join(', '),
    featured: card.featured,
  };
}

/** Each line is `SYMBOL | Title`; a line without a pipe is treated as a title only. */
function parseHierarchy(text: string) {
  return text
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line !== '')
    .map((line) => {
      const separator = line.indexOf('|');
      if (separator === -1) return { symbol: '', title: line };
      return {
        symbol: line.slice(0, separator).trim(),
        title: line.slice(separator + 1).trim(),
      };
    });
}

function toCard(form: StudioForm): PatentCard {
  return {
    id: form.id ?? createCardId(),
    publicationNumber: form.publicationNumber.trim(),
    displayTitle: form.displayTitle.trim(),
    publicationDate: form.publicationDate.trim(),
    applicant: form.applicant.trim(),
    inventor: form.inventor.trim(),
    plainLanguageDescription: form.plainLanguageDescription.trim(),
    cpc: { code: form.cpcCode.trim(), hierarchy: parseHierarchy(form.cpcHierarchy) },
    diagramType: form.diagramType,
    diagramComponent: form.diagramComponent,
    ...(form.diagramImage ? { diagramImage: form.diagramImage } : {}),
    sourceReference: form.sourceReference.trim(),
    curationStatus: form.curationStatus,
    tags: form.tags
      .split(',')
      .map((tag) => tag.trim())
      .filter((tag) => tag !== ''),
    featured: form.featured,
  };
}

export function StudioPanel({ cards, onSave, onDelete, onClose }: StudioPanelProps) {
  const [form, setForm] = useState<StudioForm>(emptyForm);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const update = <K extends keyof StudioForm>(key: K, value: StudioForm[K]) => {
    setForm((current) => ({ ...current, [key]: value }));
    setMessage(null);
  };

  const handleImage = async (file: File | undefined) => {
    if (file === undefined) return;
    setError(null);
    try {
      const image = await readDiagramImage(file);
      update('diagramImage', { ...image, alt: form.diagramImage?.alt ?? '' });
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'That image could not be read.');
    }
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (form.displayTitle.trim() === '') {
      setError('A title is required.');
      return;
    }
    const card = toCard(form);
    const failure = onSave(card);
    if (failure !== null) {
      setError(failure);
      return;
    }
    setError(null);
    setMessage(form.id === null ? 'Card added to the collection.' : 'Card updated.');
    setForm(toForm(card));
  };

  return (
    <section className="studio" aria-label="Card studio">
      <header className="studio__header">
        <span className="label">Studio — Custom Cards ({cards.length})</span>
        <div className="studio__header-actions">
          <button
            type="button"
            className="chrome-button"
            onClick={() => {
              setForm(emptyForm);
              setError(null);
              setMessage(null);
            }}
          >
            New card
          </button>
          <button type="button" className="chrome-button" onClick={onClose}>
            Close ✕
          </button>
        </div>
      </header>

      <form className="studio__form" onSubmit={handleSubmit}>
        <div className="studio__grid">
          <label className="studio__field">
            <span className="label">Title</span>
            <input
              className="studio__input"
              name="displayTitle"
              value={form.displayTitle}
              onChange={(event) => update('displayTitle', event.target.value)}
              required
            />
          </label>
          <label className="studio__field">
            <span className="label">Publication number</span>
            <input
              className="studio__input"
              name="publicationNumber"
              value={form.publicationNumber}
              placeholder="US 20XX/0000011 A1"
              onChange={(event) => update('publicationNumber', event.target.value)}
            />
          </label>
          <label className="studio__field">
            <span className="label">Publication date</span>
            <input
              className="studio__input"
              name="publicationDate"
              value={form.publicationDate}
              placeholder="2024-05-09"
              onChange={(event) => update('publicationDate', event.target.value)}
            />
          </label>
          <label className="studio__field">
            <span className="label">Applicant</span>
            <input
              className="studio__input"
              name="applicant"
              value={form.applicant}
              onChange={(event) => update('applicant', event.target.value)}
            />
          </label>
          <label className="studio__field">
            <span className="label">Inventor</span>
            <input
              className="studio__input"
              name="inventor"
              value={form.inventor}
              onChange={(event) => update('inventor', event.target.value)}
            />
          </label>
          <label className="studio__field">
            <span className="label">Tags (comma separated)</span>
            <input
              className="studio__input"
              name="tags"
              value={form.tags}
              placeholder="Mechanical, Consumer"
              onChange={(event) => update('tags', event.target.value)}
            />
          </label>
          <label className="studio__field studio__field--wide">
            <span className="label">Plain-language description</span>
            <textarea
              className="studio__input studio__input--area"
              name="plainLanguageDescription"
              rows={3}
              value={form.plainLanguageDescription}
              onChange={(event) => update('plainLanguageDescription', event.target.value)}
            />
          </label>
          <label className="studio__field">
            <span className="label">CPC code</span>
            <input
              className="studio__input"
              name="cpcCode"
              value={form.cpcCode}
              placeholder="G06N 3/006"
              onChange={(event) => update('cpcCode', event.target.value)}
            />
          </label>
          <label className="studio__field">
            <span className="label">Curation status</span>
            <select
              className="studio__input"
              name="curationStatus"
              value={form.curationStatus}
              onChange={(event) => update('curationStatus', event.target.value as CurationStatus)}
            >
              {CURATION_STATUSES.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </label>
          <label className="studio__field studio__field--wide">
            <span className="label">CPC hierarchy — one “symbol | title” per line, coarsest first</span>
            <textarea
              className="studio__input studio__input--area"
              name="cpcHierarchy"
              rows={4}
              value={form.cpcHierarchy}
              placeholder={HIERARCHY_PLACEHOLDER}
              onChange={(event) => update('cpcHierarchy', event.target.value)}
            />
          </label>
          <label className="studio__field">
            <span className="label">Diagram type</span>
            <select
              className="studio__input"
              name="diagramType"
              value={form.diagramType}
              onChange={(event) => update('diagramType', event.target.value as DiagramType)}
            >
              {DIAGRAM_TYPES.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </label>
          <label className="studio__field">
            <span className="label">Fallback line diagram</span>
            <select
              className="studio__input"
              name="diagramComponent"
              value={form.diagramComponent}
              disabled={form.diagramImage !== null}
              onChange={(event) => update('diagramComponent', event.target.value as DiagramKey)}
            >
              {DIAGRAM_KEYS.map((key) => (
                <option key={key} value={key}>
                  {key}
                </option>
              ))}
            </select>
          </label>
          <label className="studio__field">
            <span className="label">Bitmap diagram</span>
            <input
              className="studio__input studio__input--file"
              name="diagramImage"
              type="file"
              accept="image/*"
              onChange={(event) => {
                void handleImage(event.target.files?.[0]);
                event.target.value = '';
              }}
            />
          </label>
          <label className="studio__field">
            <span className="label">Diagram alt text</span>
            <input
              className="studio__input"
              name="diagramAlt"
              value={form.diagramImage?.alt ?? ''}
              disabled={form.diagramImage === null}
              onChange={(event) =>
                update(
                  'diagramImage',
                  form.diagramImage ? { ...form.diagramImage, alt: event.target.value } : null,
                )
              }
            />
          </label>
          <label className="studio__field">
            <span className="label">Internal source reference</span>
            <input
              className="studio__input"
              name="sourceReference"
              value={form.sourceReference}
              placeholder="internal://archive/…"
              onChange={(event) => update('sourceReference', event.target.value)}
            />
          </label>
          <label className="studio__field studio__field--inline">
            <input
              type="checkbox"
              name="featured"
              checked={form.featured}
              onChange={(event) => update('featured', event.target.checked)}
            />
            <span className="label">Featured</span>
          </label>
          {form.diagramImage ? (
            <div className="studio__field studio__field--inline">
              <img className="studio__thumb" src={form.diagramImage.dataUrl} alt="" />
              <button
                type="button"
                className="chrome-button"
                onClick={() => update('diagramImage', null)}
              >
                Remove image
              </button>
            </div>
          ) : null}
        </div>

        <div className="studio__actions">
          <button type="submit" className="chrome-button">
            {form.id === null ? 'Add card' : 'Save changes'}
          </button>
          {error !== null ? <span className="studio__error">{error}</span> : null}
          {message !== null ? <span className="studio__message">{message}</span> : null}
        </div>
      </form>

      {cards.length > 0 ? (
        <ul className="studio__list">
          {cards.map((card) => (
            <li className="studio__list-item" key={card.id}>
              <span className="studio__list-title">{card.displayTitle}</span>
              <button
                type="button"
                className="chrome-button"
                aria-pressed={form.id === card.id}
                onClick={() => {
                  setForm(toForm(card));
                  setError(null);
                  setMessage(null);
                }}
              >
                Edit
              </button>
              <button
                type="button"
                className="chrome-button"
                onClick={() => {
                  onDelete(card.id);
                  if (form.id === card.id) setForm(emptyForm);
                }}
              >
                Delete
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </section>
  );
}
