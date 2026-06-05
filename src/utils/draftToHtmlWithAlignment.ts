import { convertToHTML } from 'draft-convert';
import { convertFromRaw, RawDraftContentState } from 'draft-js';

// Alignment class mapping — scalable, add more as needed
const ALIGNMENT_CLASS_MAP: Record<string, string> = {
  center: 'center-align',
  right: 'right-align',
  left: 'left-align'
};

export const convertDraftToHtml = (
  rawContent: RawDraftContentState
): string => {
  try {
    const contentState = convertFromRaw(rawContent);

    return convertToHTML({
      blockToHTML: (block) => {
        // Read textAlign from block data (set by DraftJS alignment plugin)
        const textAlign: string | undefined = (
          block.data as Record<string, string>
        )?.textAlign;

        const alignClass = textAlign
          ? ALIGNMENT_CLASS_MAP[textAlign] ?? ''
          : '';

        const style = textAlign ? ` style="text-align:${textAlign}"` : '';

        const className = alignClass ? ` class="${alignClass}"` : '';

        // Map DraftJS block types to HTML elements with alignment applied
        switch (block.type) {
          case 'header-one':
            return {
              start: `<h1${className}${style}>`,
              end: '</h1>'
            };
          case 'header-two':
            return {
              start: `<h2${className}${style}>`,
              end: '</h2>'
            };
          case 'header-three':
            return {
              start: `<h3${className}${style}>`,
              end: '</h3>'
            };
          case 'header-four':
            return {
              start: `<h4${className}${style}>`,
              end: '</h4>'
            };
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
            return {
              start: `<div${className}${style}>`,
              end: '</div>'
            };
          // 'unstyled' and default — paragraph
          default:
            return {
              start: `<p${className}${style}>`,
              end: '</p>'
            };
        }
      },

      entityToHTML: (entity, originalText) => {
        if (entity.type === 'LINK') {
          const { url, target } = entity.data;
          return `<a href="${url}" target="${
            target ?? '_self'
          }">${originalText}</a>`;
        }
        if (entity.type === 'IMAGE') {
          const { src, height, width, alt } = entity.data;
          return `<img src="${src}" alt="${
            alt ?? ''
          }" style="height:${height};width:${width};" />`;
        }
        return originalText;
      }
    })(contentState);
  } catch (err) {
    console.error('convertDraftToHtml failed:', err);
    return '';
  }
};
