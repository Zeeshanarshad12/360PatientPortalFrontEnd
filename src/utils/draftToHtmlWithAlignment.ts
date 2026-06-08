import { convertToHTML } from 'draft-convert';
import {
  convertFromRaw,
  RawDraftContentState,
  RawDraftContentBlock
} from 'draft-js';

const ALIGNMENT_CLASS_MAP: Record<string, string> = {
  center: 'center-align',
  right: 'right-align',
  left: 'left-align'
};

const INPUT_TOKEN = 'InputTextField'; // 14 chars
const INPUT_PLACEHOLDER = '##INPUT_FIELD##'; // 15 chars
const DIFF = INPUT_PLACEHOLDER.length - INPUT_TOKEN.length; // +1

const protectInputFields = (
  raw: RawDraftContentState
): RawDraftContentState => {
  const blocks = raw.blocks.map((block: RawDraftContentBlock) => {
    if (!block.text.includes(INPUT_TOKEN)) return block;

    const occurrences: number[] = [];
    let searchFrom = 0;
    while (true) {
      const idx = block.text.indexOf(INPUT_TOKEN, searchFrom);
      if (idx === -1) break;
      occurrences.push(idx);
      searchFrom = idx + INPUT_TOKEN.length;
    }

    const filteredEntityRanges = (block.entityRanges || []).filter((er) => {
      const erStart = er.offset;
      const erEnd = er.offset + er.length;
      return !occurrences.some(
        (start) => erStart <= start && erEnd >= start + INPUT_TOKEN.length
      );
    });

    const adjustOffset = (originalOffset: number): number => {
      const count = occurrences.filter((pos) => pos < originalOffset).length;
      return originalOffset + count * DIFF;
    };

    const adjustedEntityRanges = filteredEntityRanges.map((er) => ({
      ...er,
      offset: adjustOffset(er.offset)
    }));

    const adjustedInlineStyles = (block.inlineStyleRanges || []).map((isr) => {
      const newOffset = adjustOffset(isr.offset);
      const insideCount = occurrences.filter(
        (pos) =>
          pos >= isr.offset &&
          pos + INPUT_TOKEN.length <= isr.offset + isr.length
      ).length;
      return {
        ...isr,
        offset: newOffset,
        length: isr.length + insideCount * DIFF
      };
    });

    return {
      ...block,
      text: block.text.split(INPUT_TOKEN).join(INPUT_PLACEHOLDER),
      entityRanges: adjustedEntityRanges,
      inlineStyleRanges: adjustedInlineStyles
    };
  });

  return { ...raw, blocks };
};

export const convertDraftToHtml = (
  rawContent: RawDraftContentState
): string => {
  try {
    const protectedRaw = protectInputFields(rawContent);
    const contentState = convertFromRaw(protectedRaw);

    const html = convertToHTML({
      blockToHTML: (block) => {
        const data = block.data as Record<string, string>;
        const textAlign = data?.textAlign || data?.['text-align'];
        const alignClass = textAlign
          ? ALIGNMENT_CLASS_MAP[textAlign] ?? ''
          : '';
        const style = textAlign ? ` style="text-align:${textAlign}"` : '';
        const className = alignClass ? ` class="${alignClass}"` : '';

        switch (block.type) {
          case 'header-one':
            return { start: `<h1${className}${style}>`, end: '</h1>' };
          case 'header-two':
            return { start: `<h2${className}${style}>`, end: '</h2>' };
          case 'header-three':
            return { start: `<h3${className}${style}>`, end: '</h3>' };
          case 'header-four':
            return { start: `<h4${className}${style}>`, end: '</h4>' };
          case 'blockquote':
            return {
              start: `<blockquote${className}${style}>`,
              end: '</blockquote>'
            };
          case 'unordered-list-item':
            return {
              start: `<li${className}${style}>`,
              end: '</li>',
              nestStart: '<ul>',
              nestEnd: '</ul>'
            };
          case 'ordered-list-item':
            return {
              start: `<li${className}${style}>`,
              end: '</li>',
              nestStart: '<ol>',
              nestEnd: '</ol>'
            };
          case 'atomic':
            return { start: `<div${className}${style}>`, end: '</div>' };
          default:
            return { start: `<p${className}${style}>`, end: '</p>' };
        }
      },

      entityToHTML: (entity, originalText) => {
        if (originalText === INPUT_PLACEHOLDER) {
          return INPUT_TOKEN;
        }

        if (entity.type === 'LINK') {
          const { url, target } = entity.data;
          return `<a href="${url}" target="${
            target ?? '_self'
          }">${originalText}</a>`;
        }

        if (entity.type === 'IMAGE') {
          const { src, height, width, alt } = entity.data;
          return `<img src="${src}" alt="${alt ?? ''}"
            style="height:${height};width:${width};" />`;
        }

        if (entity.type === '::mention') {
          return entity.data?.mention?.name ?? originalText;
        }

        return originalText;
      }
    })(contentState);

    // Restore any remaining placeholders not under entity ranges
    return html.replace(/##INPUT_FIELD##/g, INPUT_TOKEN);
  } catch (err) {
    console.error('convertDraftToHtml failed:', err);
    return '';
  }
};
