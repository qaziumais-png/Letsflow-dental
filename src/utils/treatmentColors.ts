export interface PastelColorConfig {
  name: string;
  colorName: string;
  bg: string;
  hoverBg: string;
  border: string;
  borderHover: string;
  text: string;
  subtext: string;
  badge: string;
  badgeText: string;
  dot: string;
  hex: string;
  chartFill: string;
}

export const PASTEL_TREATMENT_PALETTES: Record<string, PastelColorConfig> = {
  rct: {
    name: 'Root Canal Treatment (RCT)',
    colorName: 'Pastel Sky Blue',
    bg: 'bg-sky-50/90',
    hoverBg: 'hover:bg-sky-100/80',
    border: 'border-sky-200',
    borderHover: 'hover:border-sky-400',
    text: 'text-sky-950',
    subtext: 'text-sky-800',
    badge: 'bg-sky-100/90 border border-sky-300',
    badgeText: 'text-sky-900',
    dot: 'bg-sky-400',
    hex: '#38bdf8',
    chartFill: '#38bdf8',
  },
  cleaning: {
    name: 'Dental Cleaning',
    colorName: 'Pastel Mint Green',
    bg: 'bg-emerald-50/90',
    hoverBg: 'hover:bg-emerald-100/80',
    border: 'border-emerald-200',
    borderHover: 'hover:border-emerald-400',
    text: 'text-emerald-950',
    subtext: 'text-emerald-800',
    badge: 'bg-emerald-100/90 border border-emerald-300',
    badgeText: 'text-emerald-900',
    dot: 'bg-emerald-400',
    hex: '#34d399',
    chartFill: '#34d399',
  },
  extraction: {
    name: 'Tooth Extraction',
    colorName: 'Pastel Peach Amber',
    bg: 'bg-amber-50/90',
    hoverBg: 'hover:bg-amber-100/80',
    border: 'border-amber-200',
    borderHover: 'hover:border-amber-400',
    text: 'text-amber-950',
    subtext: 'text-amber-800',
    badge: 'bg-amber-100/90 border border-amber-300',
    badgeText: 'text-amber-900',
    dot: 'bg-amber-400',
    hex: '#fbbf24',
    chartFill: '#fbbf24',
  },
  implant: {
    name: 'Dental Implant',
    colorName: 'Pastel Indigo',
    bg: 'bg-indigo-50/90',
    hoverBg: 'hover:bg-indigo-100/80',
    border: 'border-indigo-200',
    borderHover: 'hover:border-indigo-400',
    text: 'text-indigo-950',
    subtext: 'text-indigo-800',
    badge: 'bg-indigo-100/90 border border-indigo-300',
    badgeText: 'text-indigo-900',
    dot: 'bg-indigo-400',
    hex: '#818cf8',
    chartFill: '#818cf8',
  },
  braces: {
    name: 'Braces / Aligners',
    colorName: 'Pastel Lavender Violet',
    bg: 'bg-purple-50/90',
    hoverBg: 'hover:bg-purple-100/80',
    border: 'border-purple-200',
    borderHover: 'hover:border-purple-400',
    text: 'text-purple-950',
    subtext: 'text-purple-800',
    badge: 'bg-purple-100/90 border border-purple-300',
    badgeText: 'text-purple-900',
    dot: 'bg-purple-400',
    hex: '#c084fc',
    chartFill: '#c084fc',
  },
  whitening: {
    name: 'Teeth Whitening',
    colorName: 'Pastel Rose Pink',
    bg: 'bg-rose-50/90',
    hoverBg: 'hover:bg-rose-100/80',
    border: 'border-rose-200',
    borderHover: 'hover:border-rose-400',
    text: 'text-rose-950',
    subtext: 'text-rose-800',
    badge: 'bg-rose-100/90 border border-rose-300',
    badgeText: 'text-rose-900',
    dot: 'bg-rose-400',
    hex: '#fb7185',
    chartFill: '#fb7185',
  },
  other: {
    name: 'Other Treatments',
    colorName: 'Pastel Aqua Teal',
    bg: 'bg-teal-50/90',
    hoverBg: 'hover:bg-teal-100/80',
    border: 'border-teal-200',
    borderHover: 'hover:border-teal-400',
    text: 'text-teal-950',
    subtext: 'text-teal-800',
    badge: 'bg-teal-100/90 border border-teal-300',
    badgeText: 'text-teal-900',
    dot: 'bg-teal-400',
    hex: '#2dd4bf',
    chartFill: '#2dd4bf',
  },
};

/**
 * Returns the pastel color configuration for any treatment string.
 */
export function getPastelTreatmentConfig(treatmentName: string): PastelColorConfig {
  const t = (treatmentName || '').toLowerCase();
  if (t.includes('root canal') || t.includes('rct') || t.includes('pulp')) {
    return PASTEL_TREATMENT_PALETTES.rct;
  }
  if (t.includes('cleaning') || t.includes('scaling') || t.includes('polishing') || t.includes('gum') || t.includes('floss')) {
    return PASTEL_TREATMENT_PALETTES.cleaning;
  }
  if (t.includes('extraction') || t.includes('wisdom') || t.includes('removal')) {
    return PASTEL_TREATMENT_PALETTES.extraction;
  }
  if (t.includes('implant') || t.includes('crown') || t.includes('bridge') || t.includes('denture')) {
    return PASTEL_TREATMENT_PALETTES.implant;
  }
  if (t.includes('brace') || t.includes('aligner') || t.includes('retainer') || t.includes('ortho')) {
    return PASTEL_TREATMENT_PALETTES.braces;
  }
  if (t.includes('whitening') || t.includes('veneer') || t.includes('smile') || t.includes('cosmetic')) {
    return PASTEL_TREATMENT_PALETTES.whitening;
  }
  return PASTEL_TREATMENT_PALETTES.other;
}
