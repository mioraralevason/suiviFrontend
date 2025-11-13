export const formatValueForAPI = (type: string, value: any): string => {
  const t = type.toLowerCase().trim();

  // Boolean → JSON
  if (t.includes('boolean')) {
    return JSON.stringify({
      true: value.true ?? false,
      truePoints: value.truePoints ?? 0,
      false: value.false ?? false,
      falsePoints: value.falsePoints ?? 0,
    });
  }

  // Choix multiple / simple → JSON array
  if (t.includes('choix') || t.includes('choice')) {
    const arr = Array.isArray(value) ? value : [];
    return JSON.stringify(
      arr.map((c: any) => ({
        option: String(c.option || '').trim(),
        points: Number(c.points) || 0,
      }))
    );
  }

  // Intervalle / Pourcentage → "min-max"
  if (t.includes('intervalle') || t.includes('range') || t.includes('pourcentage') || t.includes('percentage')) {
    const min = value?.min ?? '';
    const max = value?.max ?? '';
    return min !== '' || max !== '' ? `${min}-${max}` : '';
  }

  // Date / Intervalle de dates → string
  if (t.includes('date')) {
    return String(value ?? '');
  }

  // Nombre → string
  if (t.includes('nombre') || t.includes('integer') || t.includes('decimal')) {
    return String(value ?? '');
  }

  // Texte → string
  return String(value ?? '');
};

/**
 * Parse la valeur de l'API pour le formulaire
 */
export const parseValueFromAPI = (type: string, valeur: string): any => {
  if (!valeur || valeur === 'null') return '';

  const t = type.toLowerCase().trim();

  try {
    // Boolean ou Choix → JSON
    if (t.includes('boolean') || t.includes('choix') || t.includes('choice')) {
      return JSON.parse(valeur);
    }
  } catch (e) {
    console.warn('JSON parse failed:', valeur);
  }

  // Intervalle → { min, max }
  if (t.includes('intervalle') || t.includes('range') || t.includes('pourcentage') || t.includes('percentage')) {
    const [min, max] = valeur.split('-');
    return { min: min || '', max: max || '' };
  }

  return valeur;
};

/**
 * Formatte l'affichage dans la liste
 */
export const formatDisplayValue = (value: any, type: string): string => {
  const t = type.toLowerCase();

  if (t.includes('boolean')) {
    try {
      const v = typeof value === 'string' ? JSON.parse(value) : value;
      return `Oui → ${v.truePoints} pts | Non → ${v.falsePoints} pts`;
    } catch {
      return '—';
    }
  }

  if (t.includes('choix') || t.includes('choice')) {
    try {
      const v = typeof value === 'string' ? JSON.parse(value) : value;
      return Array.isArray(v)
        ? v.map((c: any) => `${c.option}: ${c.points}pts`).join(' | ')
        : '—';
    } catch {
      return '—';
    }
  }

  if (t.includes('intervalle') || t.includes('pourcentage')) {
    return value || '—';
  }

  return String(value || '—');
};