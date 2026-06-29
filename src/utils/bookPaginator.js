import { AVAILABLE_FONTS } from './fontManager';

export function getFontFamily(fontId) {
  const fontObj = AVAILABLE_FONTS.find(f => f.id === fontId);
  return fontObj ? fontObj.family : 'times';
}

const fontToCm = (size) => (size * 2.54) / 72;

/**
 * Parses inline markdown (bold and italic) into structured tokens.
 */
export function parseInlineMarkdown(text) {
  const tokens = [];
  // Regexp matching bold-italic (***), bold (** or __), italic (* or _)
  const regex = /(\*\*\*|__\*|\*__|__|\*\*|\*|_)/g;
  
  let match;
  let currentStyle = { bold: false, italic: false };
  let lastIndex = 0;
  
  while ((match = regex.exec(text)) !== null) {
    const marker = match[0];
    const matchIndex = match.index;
    
    // Add text before the marker
    if (matchIndex > lastIndex) {
      tokens.push({
        text: text.substring(lastIndex, matchIndex),
        bold: currentStyle.bold,
        italic: currentStyle.italic
      });
    }
    
    // Toggle style based on marker
    if (marker === '***') {
      currentStyle.bold = !currentStyle.bold;
      currentStyle.italic = !currentStyle.italic;
    } else if (marker === '**' || marker === '__') {
      currentStyle.bold = !currentStyle.bold;
    } else if (marker === '*' || marker === '_') {
      currentStyle.italic = !currentStyle.italic;
    }
    
    lastIndex = regex.lastIndex;
  }
  
  if (lastIndex < text.length) {
    tokens.push({
      text: text.substring(lastIndex),
      bold: currentStyle.bold,
      italic: currentStyle.italic
    });
  }
  
  return tokens;
}

/**
 * Splits tokens into words and spaces to facilitate precise word-wrapping.
 */
export function tokenizeWords(tokens) {
  const words = [];
  tokens.forEach(token => {
    // Split by whitespace but keep spaces as separators
    const parts = token.text.split(/(\s+)/);
    parts.forEach(part => {
      if (part) {
        words.push({
          text: part,
          bold: token.bold,
          italic: token.italic
        });
      }
    });
  });
  return words;
}

/**
 * Parses raw markdown text into blocks (paragraphs, headings, lists, blockquotes).
 */
export function parseMarkdownBlocks(markdownText) {
  if (!markdownText) return [];
  const lines = markdownText.split(/\r?\n/);
  const blocks = [];
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) {
      continue;
    }
    
    // Check for Headings
    const headingMatch = line.match(/^(#{1,6})\s+(.*)$/);
    if (headingMatch) {
      blocks.push({
        type: 'heading',
        level: headingMatch[1].length,
        text: headingMatch[2]
      });
      continue;
    }
    
    // Check for Blockquote
    if (line.startsWith('>')) {
      blocks.push({
        type: 'blockquote',
        text: line.substring(1).trim()
      });
      continue;
    }
    
    // Check for Bullet List Item
    const bulletMatch = line.match(/^[-*•+]\s+(.*)$/);
    if (bulletMatch) {
      blocks.push({
        type: 'list-item',
        text: bulletMatch[1]
      });
      continue;
    }
    
    // Check for Numbered List Item
    const numberedMatch = line.match(/^(\d+)\.\s+(.*)$/);
    if (numberedMatch) {
      blocks.push({
        type: 'list-item-numbered',
        number: numberedMatch[1],
        text: numberedMatch[2]
      });
      continue;
    }
    
    // Default: Paragraph
    blocks.push({
      type: 'paragraph',
      text: line
    });
  }
  
  return blocks;
}

/**
 * PageBuilder accumulates rendering instructions for pages.
 */
class PageBuilder {
  constructor(pageWidth, pageHeight, margin, font, fontSize, police, doc) {
    this.pageWidth = pageWidth;
    this.pageHeight = pageHeight;
    this.margin = margin;
    this.font = font;
    this.fontSize = fontSize;
    this.police = police;
    this.doc = doc;
    this.printableWidth = pageWidth - (margin * 2);
    this.bottomMargin = margin;
    this.pages = [];
    this.currentPage = null;
    this.currentY = 0;
  }

  startNewPage(isChapterStart = false, chapterTitle = '', chapterNum = 0) {
    if (this.currentPage) {
      this.pages.push(this.currentPage);
    }
    this.currentPage = {
      elements: [],
      isChapterStart,
      chapterTitle,
      chapterNum
    };
    this.currentY = isChapterStart ? (this.margin + 2.0) : (this.margin + 1.0);
  }

  addElement(element) {
    if (!this.currentPage) {
      this.startNewPage();
    }
    this.currentPage.elements.push(element);
  }

  getPages() {
    if (this.currentPage) {
      this.pages.push(this.currentPage);
      this.currentPage = null;
    }
    return this.pages;
  }
}

/**
 * Main pagination algorithm. Determines line breaks and page layout.
 * Runs on a temporary jsPDF instance (or real one) to measure text sizes.
 * 
 * @returns {Array} List of page objects
 */
export function paginateBook({ titre, pitch, contexte, chapitres, settings, doc }) {
  const format = settings.format || 'A4';
  const margin = parseFloat(settings.marges) || 2.5; // in cm
  const fontSize = parseInt(settings.taille) || 11; // in pt
  const police = settings.police || 'serif';
  const font = getFontFamily(police);

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  const builder = new PageBuilder(pageWidth, pageHeight, margin, font, fontSize, police, doc);

  // --- 1. COVER PAGE ---
  builder.pages.push({
    type: 'cover',
    titre,
    pitch,
    contexte
  });

  // --- 2. CHAPTERS ---
  const writtenChapters = (chapitres || []).filter(c => c.contenu && c.contenu.trim() !== '');

  if (writtenChapters.length === 0) {
    // Add empty placeholder page
    builder.pages.push({
      type: 'placeholder',
      text: "Aucun chapitre n'a encore été rédigé."
    });
  } else {
    writtenChapters.forEach((chapter) => {
      builder.startNewPage(true, chapter.titre, chapter.numero);

      const blocks = parseMarkdownBlocks(chapter.contenu);

      blocks.forEach(block => {
        let blockFontSize = fontSize;
        let blockFontWeight = 'normal';
        let isIndent = false;
        let leftIndent = 0;
        
        if (block.type === 'heading') {
          blockFontSize = fontSize * (1.6 - block.level * 0.1);
          blockFontWeight = 'bold';
        } else if (block.type === 'blockquote') {
          blockFontSize = fontSize;
          blockFontWeight = 'italic';
          leftIndent = 0.8;
        } else if (block.type === 'list-item' || block.type === 'list-item-numbered') {
          blockFontSize = fontSize;
          leftIndent = 0.6;
        } else if (block.type === 'paragraph') {
          blockFontSize = fontSize;
          if (police === 'serif') {
            isIndent = true; // Classic first-line indent
          }
        }

        // Parse inline styles
        const tokens = parseInlineMarkdown(block.text);
        const words = tokenizeWords(tokens);
        
        // Wrap words into lines
        const blockPrintableWidth = builder.printableWidth - leftIndent;
        const wrappedLines = [];
        let currentLine = [];
        let currentLineWidth = 0;
        
        let isFirstLineOfBlock = true;
        let currentMax = isIndent ? (blockPrintableWidth - 0.75) : blockPrintableWidth;

        words.forEach(word => {
          let fontStyle = blockFontWeight;
          if (word.bold && word.italic) fontStyle = 'bolditalic';
          else if (word.bold) fontStyle = 'bold';
          else if (word.italic) fontStyle = 'italic';
          
          if (blockFontWeight === 'italic') {
            if (word.bold) fontStyle = 'bolditalic';
            else fontStyle = 'italic';
          } else if (blockFontWeight === 'bold') {
            if (word.italic) fontStyle = 'bolditalic';
            else fontStyle = 'bold';
          }
          
          doc.setFont(font, fontStyle);
          doc.setFontSize(blockFontSize);
          
          const wordWidth = doc.getTextWidth(word.text);
          
          if (currentLineWidth + wordWidth > currentMax) {
            if (word.text.trim() === '') {
              // Ignore leading spaces on wrap
              return;
            }
            wrappedLines.push(currentLine);
            currentLine = [word];
            currentLineWidth = wordWidth;
            isFirstLineOfBlock = false;
            currentMax = blockPrintableWidth;
          } else {
            currentLine.push(word);
            currentLineWidth += wordWidth;
          }
        });
        
        if (currentLine.length > 0) {
          wrappedLines.push(currentLine);
        }

        // Add wrapped lines to pages
        let blockStart = true;
        wrappedLines.forEach((lineWords, lineIdx) => {
          const lineH = fontToCm(blockFontSize) * 1.5;

          // Check page overflow
          if (builder.currentY + lineH > builder.pageHeight - builder.bottomMargin) {
            builder.startNewPage(false, chapter.titre, chapter.numero);
            blockStart = true; // reset block start flag for formatting on new page
          }

          // Left indent offsets
          let xOffset = leftIndent;
          if (blockStart && isIndent) {
            xOffset += 0.75;
          }

          // Bullet or number drawing on the first line
          if (blockStart) {
            if (block.type === 'list-item') {
              builder.addElement({
                type: 'bullet',
                x: builder.margin + 0.15,
                y: builder.currentY,
                fontSize: blockFontSize
              });
            } else if (block.type === 'list-item-numbered') {
              builder.addElement({
                type: 'number',
                text: block.number + '.',
                x: builder.margin + 0.15,
                y: builder.currentY,
                fontSize: blockFontSize
              });
            }
          }

          if (block.type === 'blockquote') {
            builder.addElement({
              type: 'blockquote-line',
              x: builder.margin + 0.3,
              y: builder.currentY,
              h: lineH
            });
          }

          builder.addElement({
            type: 'line',
            words: lineWords,
            x: builder.margin + xOffset,
            y: builder.currentY,
            fontSize: blockFontSize,
            fontWeight: blockFontWeight
          });

          builder.currentY += lineH;
          blockStart = false;
        });

        // Add block spacing
        let blockSpacing = fontToCm(blockFontSize) * 0.3;
        if (block.type === 'heading') {
          blockSpacing = fontToCm(blockFontSize) * 0.8;
        } else if (block.type === 'paragraph' && police !== 'serif') {
          blockSpacing = fontToCm(blockFontSize) * 0.8;
        }
        builder.currentY += blockSpacing;
      });
    });
  }

  const paginatedList = builder.getPages();
  
  // Set 1-based page numbers
  paginatedList.forEach((page, idx) => {
    page.pageNum = idx + 1;
  });

  return paginatedList;
}
