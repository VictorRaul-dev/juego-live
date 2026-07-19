import es from '../locales/es.json';
import en from '../locales/en.json';

type Dict = Record<string, string>;
const DICTS: Record<string, Dict> = { es, en };

let current: Dict = es;
let lang: 'es' | 'en' = 'es';

export function setLanguage(l: 'es' | 'en'): void {
  lang = l;
  current = DICTS[l] ?? es;
}

export function getLanguage(): 'es' | 'en' {
  return lang;
}

/** Translate a key, falling back to the key itself if missing. */
export function t(key: string): string {
  return current[key] ?? key;
}
