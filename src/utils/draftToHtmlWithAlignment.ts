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

const renderBlockText = (
  block: RawDraftBlock,
  entityMap: Record<string, RawDraftEntity>
): string => {
  const { text, inlineStyleRanges, entityRanges } = block;
  const len = text.length;

  if (len === 0) return '';

  // Per-character style maps
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

  entityRanges.forEach(({ offset, length, key }) => {
    const end = Math.min(offset + length, len);
    for (let i = offset; i < end; i++) {
      entityArr[i] = key;
    }
  });

  let html = '';
  let i = 0;

  while (i < len) {
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
        const trimmedMention = mentionName.trim();

        if (rangeText.includes('InputTextField')) {
          html += 'InputTextField';
          i = j;
          continue;
        }

        // ── Normal mention (not InputTextField) — prefix/suffix leak fix ───
        let prefixLeakLen = 0;
        for (let pLen = trimmedMention.length - 1; pLen > 0; pLen--) {
          if (html.endsWith(trimmedMention.slice(0, pLen))) {
            prefixLeakLen = pLen;
            break;
          }
        }
        if (prefixLeakLen > 0) {
          html = html.slice(0, html.length - prefixLeakLen);
        }

        html += escapeHtml(trimmedMention);

        // Suffix leak fix
        const rangeTextTrimmed = rangeText.trim();
        if (
          trimmedMention.length > rangeTextTrimmed.length &&
          trimmedMention.startsWith(rangeTextTrimmed)
        ) {
          const suffix = trimmedMention.slice(rangeTextTrimmed.length);
          const textAfterEntity = text.slice(j, j + suffix.length);
          if (textAfterEntity === suffix) {
            j += suffix.length;
          }
        }

        i = j;
        continue;
      }

      if (entity?.type === 'LINK') {
        const d = entity.data as Record<string, string>;
        const url = d?.url ?? '#';
        const target = d?.target ?? '_self';
        html += `<a href="${url}" target="${target}">${escapeHtml(
          rangeText
        )}</a>`;
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

    let j = i;
    while (
      j < len &&
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
    const { blocks, entityMap } = rawContent;
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
