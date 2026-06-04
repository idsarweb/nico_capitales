export function maskText(text: string, maskWords: string[]): string {
  const allTerms = new Set<string>();

  for (const word of maskWords) {
    if (!word) continue;
    allTerms.add(word);

    // Variantes sin artículo y con artículos en ambos idiomas
    const withoutArticle = word.replace(/^(The|Las|Los|La|El)\s+/i, '');
    if (withoutArticle !== word) {
      ['', 'The ', 'Las ', 'Los ', 'La ', 'El '].forEach((prefix) =>
        allTerms.add(prefix + withoutArticle)
      );
    }

    // Primera palabra (para "Mexico City", buscar solo "Mexico")
    if (word.includes(' ')) {
      const first = word.split(' ')[0];
      if (first.length > 3) allTerms.add(first);
    }

    // Parte antes de coma (para "Washington, D.C.")
    if (word.includes(',')) {
      allTerms.add(word.split(',')[0]);
    }
  }

  // Ordenar de más largo a más corto para evitar reemplazos parciales
  const sorted = Array.from(allTerms)
    .filter((t) => t.length >= 2)
    .sort((a, b) => b.length - a.length);

  let result = text;
  for (const term of sorted) {
    const escaped = term.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&');
    // Normalizar acentos en ambos lados del regex para coincidir con y sin tildes
    const accentMap: Record<string, string> = {
      a: '[aáàäâã]',
      e: '[eéèëê]',
      i: '[iíìïî]',
      o: '[oóòöôõ]',
      u: '[uúùüû]',
      n: '[nñ]',
      c: '[cç]',
      A: '[AÁÀÄÂÃ]',
      E: '[EÉÈËÊ]',
      I: '[IÍÌÏÎ]',
      O: '[OÓÒÖÔÕ]',
      U: '[UÚÙÜÛ]',
      N: '[NÑ]',
      C: '[CÇ]',
    };
    const accented = escaped
      .split('')
      .map((c) => accentMap[c] || c)
      .join('');
    result = result.replace(new RegExp(accented, 'gi'), '*****');
  }

  return result;
}
