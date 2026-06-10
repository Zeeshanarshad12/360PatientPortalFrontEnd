export interface RawDraftContentState {
  blocks: RawDraftBlock[];
  entityMap: Record<string, RawDraftEntity>;
}

interface RawDraftBlock {
  key: string;
  text: string;
  type: string;
  depth: number;
  inlineStyleRanges: { offset: number; length: number; style: string }[];
  entityRanges: { offset: number; length: number; key: number }[];
  data: Record<string, unknown>;
}

interface RawDraftEntity {
  type: string;
  mutability: string;
  data: Record<string, unknown>;
}

const ALIGNMENT_CLASS_MAP: Record<string, string> = {
  center: 'center-align',
  right: 'right-align',
  left: 'left-align'
};

const escapeHtml = (str: string): string =>
  str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

const normalizeBlocks = (
  blocks: RawDraftBlock[],
  entityMap: Record<string, RawDraftEntity>
): RawDraftBlock[] => {
  const result: RawDraftBlock[] = [];

  for (const block of blocks) {
    // No \n — pass through unchanged
    if (!block.text.includes('\n')) {
      result.push(block);
      continue;
    }

    const lines = block.text.split('\n');

    for (let li = 0; li < lines.length; li++) {
      const lineText = lines[li];
      const lineOrigStart = lines
        .slice(0, li)
        .reduce((s, l) => s + l.length + 1, 0);
      const lineOrigEnd = lineOrigStart + lineText.length;

      const lineStyles = (block.inlineStyleRanges ?? [])
        .filter((isr) => {
          const isrEnd = isr.offset + isr.length;
          return isr.offset < lineOrigEnd && isrEnd > lineOrigStart;
        })
        .map((isr) => {
          const adjOffset = Math.max(0, isr.offset - lineOrigStart);
          const adjEnd =
            Math.min(lineOrigEnd, isr.offset + isr.length) - lineOrigStart;

          if (adjOffset > 0 && adjOffset <= 6) {
            const searchArea = lineText.slice(
              0,
              adjOffset + (adjEnd - adjOffset)
            );
            const lastColon = searchArea.lastIndexOf(':');
            const colonEnd =
              lastColon !== -1
                ? lastColon + 1 + (lineText[lastColon + 1] === ' ' ? 1 : 0)
                : adjEnd + adjOffset;
            return {
              style: isr.style,
              offset: 0,
              length: Math.min(colonEnd, lineText.length)
            };
          }

          return {
            style: isr.style,
            offset: adjOffset,
            length: adjEnd - adjOffset
          };
        });

      const lineEntities = (block.entityRanges ?? [])
        .filter((er) => {
          const erStart = er.offset;
          const erEnd = er.offset + er.length;
          return (
            erStart >= lineOrigStart &&
            erStart < lineOrigEnd &&
            erEnd <= lineOrigEnd
          ); // must not cross into next line
        })
        .map((er) => ({
          ...er,
          offset: er.offset - lineOrigStart
        }));

      result.push({
        ...block,
        key: `${block.key}_ln${li}`,
        text: lineText,
        inlineStyleRanges: lineStyles,
        entityRanges: lineEntities
      });
    }
  }

  return result;
};

// ── preprocessBlockText ───────────────────────────────────────────────────
// Fixes all known entity range data quality issues before HTML rendering:
// Case A: Exact match   — entity kept as-is
// Case B: Suffix leak   — entity range too short, extend to cover full mention
// Case C: Prefix leak   — entity offset too late, extend backward
// Case D: Wrong-range   — entity covers placeholder text, replace with separator+mention
const preprocessBlockText = (
  blockText: string,
  blockEntityRanges: { offset: number; length: number; key: number }[],
  entityMap: Record<string, RawDraftEntity>
): {
  text: string;
  entityRanges: { offset: number; length: number; key: number }[];
  plainValueRanges: { offset: number; length: number }[];
} => {
  let result = blockText;
  let offsetDelta = 0;
  const fixedRanges: { offset: number; length: number; key: number }[] = [];
  const plainValueRanges: { offset: number; length: number }[] = [];
  const sorted = [...blockEntityRanges].sort((a, b) => a.offset - b.offset);

  for (const er of sorted) {
    const entity = entityMap[String(er.key)];
    const mentionName = (
      (entity?.data?.mention as Record<string, string>)?.name ?? ''
    ).trim();
    const adjOffset = er.offset + offsetDelta;
    const rawRange = result.slice(adjOffset, adjOffset + er.length);

    if (
      !mentionName ||
      rawRange.includes('InputTextField') ||
      rawRange.includes('\n')
    ) {
      fixedRanges.push({ ...er, offset: adjOffset });
      continue;
    }

    const rangeClean = rawRange.trim();

    // Case A: Exact
    if (rangeClean === mentionName) {
      fixedRanges.push({ ...er, offset: adjOffset });
      continue;
    }

    // Case B: Suffix leak
    if (rangeClean.length > 2 && mentionName.startsWith(rangeClean)) {
      const suffix = mentionName.slice(rangeClean.length);
      const afterIdx = adjOffset + er.length;
      if (result.slice(afterIdx).startsWith(suffix)) {
        fixedRanges.push({
          ...er,
          offset: adjOffset,
          length: er.length + suffix.length
        });
      } else {
        fixedRanges.push({ ...er, offset: adjOffset });
      }
      continue;
    }

    // Case C: Prefix leak
    if (rangeClean.length > 2 && mentionName.endsWith(rangeClean)) {
      const prefix = mentionName.slice(
        0,
        mentionName.length - rangeClean.length
      );
      const beforeIdx = adjOffset - prefix.length;
      if (beforeIdx >= 0 && result.slice(beforeIdx, adjOffset) === prefix) {
        fixedRanges.push({
          ...er,
          offset: beforeIdx,
          length: er.length + prefix.length
        });
      } else {
        fixedRanges.push({ ...er, offset: adjOffset });
      }
      continue;
    }

    // Case D: Wrong-range — replace placeholder with separator + mention value
    let extendBack = 0;
    for (let k = adjOffset - 1; k >= 0; k--) {
      const ch = result[k];
      if (ch === '(' || ch === '[') {
        extendBack++;
      } else if (ch === ' ') {
        extendBack++;
      } else {
        break;
      }
    }

    const fullStart = adjOffset - extendBack;
    const fullRangeText = result.slice(fullStart, adjOffset + er.length);
    const lastColon = fullRangeText.lastIndexOf(':');
    const lastDash = fullRangeText.lastIndexOf('-');
    const lastSep = Math.max(lastColon, lastDash);
    const separator = lastSep !== -1 ? fullRangeText.slice(lastSep) : ': ';

    const afterRange = result.slice(adjOffset + er.length);
    const afterTrimmed = afterRange.trimStart();
    const dupSpaces = afterRange.length - afterTrimmed.length;
    const hasDup = afterTrimmed.startsWith(mentionName);
    const skipAfter = hasDup ? dupSpaces + mentionName.length : 0;

    const totalReplace = extendBack + er.length + skipAfter;
    const replacement = separator + mentionName;

    // ── Track where mention VALUE lands — clear bold for it ───────────
    plainValueRanges.push({
      offset: fullStart + separator.length, // position of mention value in new text
      length: mentionName.length
    });

    result =
      result.slice(0, fullStart) +
      replacement +
      result.slice(fullStart + totalReplace);
    offsetDelta += replacement.length - totalReplace;
  }

  return { text: result, entityRanges: fixedRanges, plainValueRanges };
};

const renderBlockText = (
  block: RawDraftBlock,
  entityMap: Record<string, RawDraftEntity>
): string => {
  const {
    text,
    entityRanges: processedEntityRanges,
    plainValueRanges
  } = preprocessBlockText(block.text, block.entityRanges ?? [], entityMap);

  const { inlineStyleRanges } = block;
  const len = text.length;

  if (len === 0) return '';

  const boldArr = new Array(len).fill(false);
  const italicArr = new Array(len).fill(false);
  const underlineArr = new Array(len).fill(false);
  const entityArr = new Array(len).fill(-1);

  inlineStyleRanges.forEach(({ offset, length, style }) => {
    const end = Math.min(offset + length, len);
    for (let i = offset; i < end; i++) {
      if (style === 'BOLD') boldArr[i] = true;
      if (style === 'ITALIC') italicArr[i] = true;
      if (style === 'UNDERLINE') underlineArr[i] = true;
    }
  });

  plainValueRanges.forEach(({ offset, length }) => {
    const end = Math.min(offset + length, len);
    for (let k = offset; k < end; k++) {
      boldArr[k] = false;
      italicArr[k] = false;
      underlineArr[k] = false;
    }
  });

  processedEntityRanges.forEach(({ offset, length, key }) => {
    const end = Math.min(offset + length, len);
    for (let i = offset; i < end; i++) {
      entityArr[i] = key;
    }
  });

  let html = '';
  let i = 0;

  while (i < len) {
    if (text[i] === '\n') {
      html += '<br/>';
      i++;
      continue;
    }

    const entityKey = entityArr[i];

    if (entityKey !== -1) {
      let j = i;
      while (j < len && entityArr[j] === entityKey) j++;

      const rangeText = text.slice(i, j);
      const entity = entityMap[String(entityKey)];

      if (rangeText === 'InputTextField') {
        html += 'InputTextField';
        i = j;
        continue;
      }

      if (entity?.type === '::mention') {
        const mentionName: string =
          (entity.data?.mention as Record<string, string>)?.name ?? rangeText;

        if (rangeText.includes('InputTextField')) {
          html += 'InputTextField';
          i = j;
          continue;
        }

        // All prefix/suffix/wrong-range cases handled by preprocessBlockText
        // This handler only sees clean exact-match entities
        html += escapeHtml(mentionName.trim());

        // Handle \n inside entity range (multiline block case)
        const newlineIdx = rangeText.indexOf('\n');
        if (newlineIdx !== -1) {
          // Already emitted mention name — add line break and render leaked text
          html += '<br/>';
          let leakPos = i + newlineIdx + 1;
          while (leakPos < j && leakPos < len) {
            if (text[leakPos] === '\n') {
              html += '<br/>';
              leakPos++;
              continue;
            }
            let leakEnd = leakPos + 1;
            while (
              leakEnd < j &&
              text[leakEnd] !== '\n' &&
              boldArr[leakEnd] === boldArr[leakPos] &&
              italicArr[leakEnd] === italicArr[leakPos] &&
              underlineArr[leakEnd] === underlineArr[leakPos]
            )
              leakEnd++;
            const seg = escapeHtml(text.slice(leakPos, leakEnd));
            const isBold = boldArr[leakPos] ?? false;
            const isItalic = italicArr[leakPos] ?? false;
            const isUline = underlineArr[leakPos] ?? false;
            let wrapped = seg;
            if (isUline) wrapped = `<u>${wrapped}</u>`;
            if (isBold && isItalic)
              wrapped = `<em><strong>${wrapped}</strong></em>`;
            else if (isBold) wrapped = `<strong>${wrapped}</strong>`;
            else if (isItalic) wrapped = `<em>${wrapped}</em>`;
            html += wrapped;
            leakPos = leakEnd;
          }
        }

        while (j < len && text[j] === '\n') {
          html += '<br/>';
          j++;
        }
        i = j;
        continue;
      }

      if (entity?.type === 'LINK') {
        const d = entity.data as Record<string, string>;
        html += `<a href="${d?.url ?? '#'}" target="${
          d?.target ?? '_self'
        }">${escapeHtml(rangeText)}</a>`;
        i = j;
        continue;
      }

      if (entity?.type === 'IMAGE') {
        const d = entity.data as Record<string, string>;
        html += `<img src="${d.src ?? ''}" alt="${d.alt ?? ''}"
          style="height:${d.height ?? 'auto'};width:${d.width ?? 'auto'};" />`;
        i = j;
        continue;
      }

      html += escapeHtml(rangeText);
      i = j;
      continue;
    }

    // Plain / styled characters
    let j = i;
    while (
      j < len &&
      text[j] !== '\n' && // ── FIX: stop at \n boundary ──────
      entityArr[j] === -1 &&
      boldArr[j] === boldArr[i] &&
      italicArr[j] === italicArr[i] &&
      underlineArr[j] === underlineArr[i]
    ) {
      j++;
    }

    const segment = escapeHtml(text.slice(i, j));
    let wrapped = segment;

    if (underlineArr[i]) wrapped = `<u>${wrapped}</u>`;
    if (italicArr[i]) wrapped = `<em>${wrapped}</em>`;
    if (boldArr[i]) wrapped = `<strong>${wrapped}</strong>`;

    html += wrapped;
    i = j;
  }

  return html;
};

export const convertDraftToHtml = (
  rawContent: RawDraftContentState
): string => {
  if (!rawContent?.blocks) return '';

  try {
    const { entityMap } = rawContent;
    const blocks = normalizeBlocks(rawContent.blocks, entityMap);
    const htmlParts: string[] = [];
    let currentListType: string | null = null;

    const closeList = () => {
      if (currentListType === 'unordered-list-item') htmlParts.push('</ul>');
      if (currentListType === 'ordered-list-item') htmlParts.push('</ol>');
      currentListType = null;
    };

    blocks.forEach((block) => {
      const data = block.data as Record<string, string>;
      const textAlign = data?.textAlign || data?.['text-align'];
      const alignClass = textAlign ? ALIGNMENT_CLASS_MAP[textAlign] ?? '' : '';
      const styleAttr = textAlign ? ` style="text-align:${textAlign}"` : '';
      const classAttr = alignClass ? ` class="${alignClass}"` : '';

      const inner = renderBlockText(block, entityMap);

      if (
        block.type === 'unordered-list-item' ||
        block.type === 'ordered-list-item'
      ) {
        if (currentListType !== block.type) {
          closeList();
          currentListType = block.type;
          htmlParts.push(
            block.type === 'unordered-list-item' ? '<ul>' : '<ol>'
          );
        }
        htmlParts.push(`<li${classAttr}${styleAttr}>${inner}</li>`);
        return;
      }

      closeList();

      switch (block.type) {
        case 'header-one':
          htmlParts.push(`<h1${classAttr}${styleAttr}>${inner}</h1>`);
          break;
        case 'header-two':
          htmlParts.push(`<h2${classAttr}${styleAttr}>${inner}</h2>`);
          break;
        case 'header-three':
          htmlParts.push(`<h3${classAttr}${styleAttr}>${inner}</h3>`);
          break;
        case 'header-four':
          htmlParts.push(`<h4${classAttr}${styleAttr}>${inner}</h4>`);
          break;
        case 'header-five':
          htmlParts.push(`<h5${classAttr}${styleAttr}>${inner}</h5>`);
          break;
        case 'header-six':
          htmlParts.push(`<h6${classAttr}${styleAttr}>${inner}</h6>`);
          break;
        case 'blockquote':
          htmlParts.push(
            `<blockquote${classAttr}${styleAttr}>${inner}</blockquote>`
          );
          break;
        case 'atomic':
          htmlParts.push(`<div${classAttr}${styleAttr}>${inner}</div>`);
          break;
        case 'unstyled':
        default:
          htmlParts.push(`<p${classAttr}${styleAttr}>${inner || '&nbsp;'}</p>`);
          break;
      }
    });

    closeList();

    return htmlParts.join('\n');
  } catch (err) {
    console.error('convertDraftToHtml failed:', err);
    return '';
  }
};
