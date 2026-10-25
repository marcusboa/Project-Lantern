import { useRef, useState } from 'react';
import { toPng } from 'html-to-image';
import type { PatentCard } from '../types/patent';
import { diagramRegistry } from '../diagrams';
import { CpcBreakdown } from './CpcBreakdown';
import { mainGroupTitle } from '../cpc/cpcSymbol';
import { countryOf } from '../cards/country';
import { CardFrontDetails, CardTitle } from './CardFrontDetails';
import { formatDate } from '../cards/formatDate';
import { useFitScale } from '../hooks/useFitScale';

/** Slides are laid out at 432 × 540 CSS px and rendered at 2.5× to Instagram's 1080 × 1350 portrait. */
const SLIDE_WIDTH = 432;
const SLIDE_HEIGHT = 540;
const PIXEL_RATIO = 2.5;

interface InstagramExportProps {
  card: PatentCard;
  onClose: () => void;
}

function fileStem(card: PatentCard): string {
  const base = (card.publicationNumber || card.displayTitle).toLowerCase();
  return base.replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'archive-card';
}

function hashtag(tag: string): string {
  return `#${tag.replace(/[^\p{L}\p{N}]+/gu, '')}`;
}

function buildCaption(card: PatentCard, definition: string | undefined): string {
  const lines = [card.displayTitle, '', card.plainLanguageDescription, ''];
  if (card.cpc.code !== '')
    lines.push(`CPC ${card.cpc.code}${definition ? ` — ${definition}` : ''}`);
  if (card.publicationNumber) lines.push(`Patent number: ${card.publicationNumber}`);
  if (countryOf(card)) lines.push(`Country: ${countryOf(card)}`);
  if (card.applicant) lines.push(`Applicant: ${card.applicant}`);
  if (card.inventor) lines.push(`Inventor: ${card.inventor}`);
  if (card.publicationDate) lines.push(`Published: ${formatDate(card.publicationDate)}`);
  if (card.tags.length > 0) lines.push('', card.tags.map(hashtag).join(' '));
  return lines.join('\n').trim();
}

const SVG_STYLE_PROPS = [
  'fill',
  'stroke',
  'stroke-width',
  'stroke-dasharray',
  'opacity',
  'font-family',
  'font-size',
  'letter-spacing',
];

/** The PNG renderer drops stylesheet rules inside inline SVGs, so pin their computed styles. */
function inlineSvgStyles(node: HTMLElement) {
  node.querySelectorAll<SVGElement>('svg *').forEach((element) => {
    const computed = getComputedStyle(element);
    for (const prop of SVG_STYLE_PROPS) {
      element.style.setProperty(prop, computed.getPropertyValue(prop));
    }
  });
}

async function downloadSlide(node: HTMLElement, filename: string) {
  inlineSvgStyles(node);
  const dataUrl = await toPng(node, {
    width: SLIDE_WIDTH,
    height: SLIDE_HEIGHT,
    pixelRatio: PIXEL_RATIO,
    backgroundColor: '#080808',
    style: { border: '0' },
    skipFonts: true,
  });
  const link = document.createElement('a');
  link.href = dataUrl;
  link.download = filename;
  link.click();
}

function FrontSlide({ card, definition }: { card: PatentCard; definition: string | undefined }) {
  const Diagram = diagramRegistry[card.diagramComponent];
  const text = useFitScale<HTMLDivElement>(
    JSON.stringify([card.displayTitle, card.plainLanguageDescription, card.cpc.code, definition]) +
      [
        card.publicationNumber,
        card.country,
        card.applicant,
        card.inventor,
        card.publicationDate,
      ].join('|'),
    0.6,
    1.4,
  );
  return (
    <>
      <CardTitle card={card} as="h2" />
      <figure className="ig-slide__figure">
        {card.diagramImage ? (
          <img
            className="card__diagram card__diagram--bitmap"
            src={card.diagramImage.src}
            alt={card.diagramImage.alt || `Diagram for ${card.displayTitle}`}
          />
        ) : (
          <Diagram className="card__diagram" title={`Diagram for ${card.displayTitle}`} />
        )}
      </figure>
      <div className="ig-slide__text" ref={text}>
        <CardFrontDetails card={card} definition={definition} />
      </div>
    </>
  );
}

function BackSlide({ card }: { card: PatentCard }) {
  const tree = useFitScale<HTMLDivElement>(JSON.stringify([card.displayTitle, card.cpc]), 0.6, 1.5);
  return (
    <div className="ig-slide__back" ref={tree}>
      <CpcBreakdown card={card} />
    </div>
  );
}

/** Card-only 4:5 carousel slides (front, then CPC hierarchy) with PNG download and a caption. */
export function InstagramExport({ card, onClose }: InstagramExportProps) {
  const nodes = useRef<Record<string, HTMLDivElement | null>>({});
  const [status, setStatus] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const hasBack = card.cpc.code !== '' || card.cpc.hierarchy.length > 0;
  const definition = mainGroupTitle(card.cpc);
  const caption = buildCaption(card, definition);
  const stem = fileStem(card);

  const slides = [
    { key: 'front', label: '1 · Front', file: `${stem}-1-front.png` },
    ...(hasBack ? [{ key: 'back', label: '2 · CPC hierarchy', file: `${stem}-2-cpc.png` }] : []),
  ];

  const download = async (targets: typeof slides) => {
    setBusy(true);
    setStatus(null);
    try {
      for (const slide of targets) {
        const node = nodes.current[slide.key];
        if (node) await downloadSlide(node, slide.file);
      }
      setStatus(targets.length > 1 ? 'Both slides downloaded.' : 'Slide downloaded.');
    } catch {
      setStatus('The image could not be created.');
    } finally {
      setBusy(false);
    }
  };

  const copyCaption = async () => {
    try {
      await navigator.clipboard.writeText(caption);
      setStatus('Caption copied.');
    } catch {
      setStatus('Copy failed — select the caption text instead.');
    }
  };

  return (
    <div className="ig-export" role="dialog" aria-modal="true" aria-label="Instagram export">
      <header className="ig-export__header">
        <span className="label">Instagram export — 1080 × 1350 · {card.displayTitle}</span>
        <div className="ig-export__actions">
          <button
            type="button"
            className="chrome-button"
            disabled={busy}
            onClick={() => void download(slides)}
          >
            {busy ? 'Rendering…' : slides.length > 1 ? 'Download both' : 'Download'}
          </button>
          <button type="button" className="chrome-button" onClick={onClose}>
            Close ✕
          </button>
        </div>
      </header>

      <div className="ig-export__slides">
        {slides.map((slide) => (
          <div className="ig-export__slide" key={slide.key}>
            <div
              className={`ig-slide ig-slide--${slide.key}`}
              ref={(node) => {
                nodes.current[slide.key] = node;
              }}
            >
              {slide.key === 'front' ? (
                <FrontSlide card={card} definition={definition} />
              ) : (
                <BackSlide card={card} />
              )}
            </div>
            <div className="ig-export__slide-bar">
              <span className="label">{slide.label}</span>
              <button
                type="button"
                className="chrome-button"
                disabled={busy}
                onClick={() => void download([slide])}
              >
                Download
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="ig-export__caption">
        <div className="ig-export__slide-bar">
          <span className="label">Caption</span>
          <button type="button" className="chrome-button" onClick={() => void copyCaption()}>
            Copy caption
          </button>
          {status !== null ? <span className="studio__message">{status}</span> : null}
        </div>
        <textarea className="studio__input studio__input--area" readOnly value={caption} rows={6} />
      </div>
    </div>
  );
}
