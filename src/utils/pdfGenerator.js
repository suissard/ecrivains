import { jsPDF } from 'jspdf';
import { getFontFamily, paginateBook } from './bookPaginator';
import { loadFontInJsPDF } from './fontManager';

/**
 * Draws the elegant cover page
 */
function drawCoverPage(doc, title, pitch, context, settings, xOffset = 0, yOffset = 0) {
  const font = getFontFamily(settings.police);
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = parseFloat(settings.marges) || 2.5;

  const isBooklet = settings.modeLivret;
  const bookPageWidth = isBooklet ? pageWidth / 2 : pageWidth;
  const printableWidth = bookPageWidth - (margin * 2);

  // Elegant double frame border
  doc.setDrawColor(79, 70, 229); // Indigo-600
  doc.setLineWidth(0.05);
  doc.rect(xOffset + 1.2, yOffset + 1.2, bookPageWidth - 2.4, pageHeight - 2.4);

  doc.setDrawColor(226, 232, 240); // Slate-200
  doc.setLineWidth(0.02);
  doc.rect(xOffset + 1.35, yOffset + 1.35, bookPageWidth - 2.7, pageHeight - 2.7);

  // Title
  doc.setFont(font, 'bold');
  const titleSize = 26;
  doc.setFontSize(titleSize);
  doc.setTextColor(30, 41, 59); // Slate-800

  const displayTitle = title || 'Mon Roman';
  const wrappedTitle = doc.splitTextToSize(displayTitle, printableWidth - 1);
  let titleY = pageHeight * 0.25;

  wrappedTitle.forEach(line => {
    const textWidth = doc.getTextWidth(line);
    doc.text(line, xOffset + (bookPageWidth - textWidth) / 2, yOffset + titleY);
    titleY += (titleSize * 2.54 / 72) * 1.3;
  });

  // Divider Line
  doc.setDrawColor(79, 70, 229);
  doc.setLineWidth(0.04);
  doc.line(xOffset + bookPageWidth * 0.4, yOffset + titleY + 0.5, xOffset + bookPageWidth * 0.6, yOffset + titleY + 0.5);

  // Subtitle
  doc.setFont(font, 'italic');
  doc.setFontSize(11);
  doc.setTextColor(100, 116, 139); // Slate-500
  const subtitle = "Un récit co-écrit par l'Homme & l'Intelligence Artificielle";
  const subtitleWidth = doc.getTextWidth(subtitle);
  doc.text(subtitle, xOffset + (bookPageWidth - subtitleWidth) / 2, yOffset + titleY + 1.3);

  // Pitch / Synopsis Block
  if (pitch) {
    let pitchY = pageHeight * 0.55;
    doc.setFont(font, 'normal');
    doc.setFontSize(10);
    doc.setTextColor(71, 85, 105); // Slate-600

    const pitchHeader = "SYNOPSIS";
    const headerWidth = doc.getTextWidth(pitchHeader);
    doc.text(pitchHeader, xOffset + (bookPageWidth - headerWidth) / 2, yOffset + pitchY);

    // Decorative line below header
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.01);
    doc.line(xOffset + bookPageWidth * 0.46, yOffset + pitchY + 0.2, xOffset + bookPageWidth * 0.54, yOffset + pitchY + 0.2);

    pitchY += 0.8;
    const wrappedPitch = doc.splitTextToSize(pitch, printableWidth - 1);
    
    // Render first 8 lines of synopsis
    wrappedPitch.slice(0, 8).forEach(line => {
      const textWidth = doc.getTextWidth(line);
      doc.text(line, xOffset + (bookPageWidth - textWidth) / 2, yOffset + pitchY);
      pitchY += 0.55;
    });
  }

  // Context details footer
  if (context && (context.epoque || context.lieu || context.culture)) {
    const contextY = pageHeight - 2.5;
    doc.setFont(font, 'bold');
    doc.setFontSize(9);
    doc.setTextColor(148, 163, 184); // Slate-400

    const parts = [];
    if (context.epoque) parts.push(`Époque : ${context.epoque}`);
    if (context.lieu) parts.push(`Lieu : ${context.lieu}`);
    if (context.culture) parts.push(`Culture : ${context.culture}`);

    const contextText = parts.join("   |   ");
    const contextWidth = doc.getTextWidth(contextText);
    doc.text(contextText, xOffset + (bookPageWidth - contextWidth) / 2, yOffset + contextY);
  }
}

/**
 * Draws running headers and footers on chapter pages
 */
function drawHeaderFooter(doc, pageNum, totalPages, title, settings, isChapterStart, xOffset = 0, yOffset = 0) {
  const font = getFontFamily(settings.police);
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = parseFloat(settings.marges) || 2.5;
  
  const isBooklet = settings.modeLivret;
  const bookPageWidth = isBooklet ? pageWidth / 2 : pageWidth;

  // Footer: page numbers are displayed on all pages except the cover page (which is pageNum = 1)
  if (pageNum > 1) {
    doc.setFont(font, 'normal');
    doc.setFontSize(9);
    doc.setTextColor(100, 116, 139);
    // Subtracting 1 to omit the cover page in index calculation
    const footerText = `${pageNum - 1}`;
    const textWidth = doc.getTextWidth(footerText);
    doc.text(footerText, xOffset + (bookPageWidth - textWidth) / 2, yOffset + pageHeight - 1.2);
  }

  // Header: skip drawing running header on chapter start pages (traditional publishing standard)
  if (!isChapterStart && pageNum > 1) {
    doc.setFont(font, 'italic');
    doc.setFontSize(8.5);
    doc.setTextColor(148, 163, 184);

    const headerText = title || 'Mon Roman';
    doc.text(headerText, xOffset + margin, yOffset + 1.2);

    // Subtle header line
    doc.setDrawColor(241, 245, 249); // Slate-100
    doc.setLineWidth(0.02);
    doc.line(xOffset + margin, yOffset + 1.4, xOffset + bookPageWidth - margin, yOffset + 1.4);
  }
}

/**
 * Draws a pre-computed page onto the doc at a specific offset.
 */
function drawPage(doc, page, xOffset, yOffset, pageNumForFooter, totalPagesForFooter, settings) {
  const font = getFontFamily(settings.police);
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  
  const isBooklet = settings.modeLivret;
  const bookPageWidth = isBooklet ? pageWidth / 2 : pageWidth;

  if (page.type === 'cover') {
    drawCoverPage(doc, settings.titre, settings.pitch, settings.contexte, settings, xOffset, yOffset);
    return;
  }

  if (page.type === 'placeholder') {
    doc.setFont(font, 'italic');
    doc.setFontSize(settings.taille || 11);
    doc.setTextColor(148, 163, 184);
    const emptyText = page.text || "Aucun contenu.";
    const textWidth = doc.getTextWidth(emptyText);
    doc.text(emptyText, xOffset + (bookPageWidth - textWidth) / 2, yOffset + pageHeight / 2);
    return;
  }

  // Draw header and footer
  drawHeaderFooter(doc, pageNumForFooter, totalPagesForFooter, settings.titre, settings, page.isChapterStart, xOffset, yOffset);

  // Render pre-computed elements
  page.elements.forEach(el => {
    if (el.type === 'chapter-header') {
      doc.setFont(font, 'bold');
      doc.setFontSize(el.fontSize);
      doc.setTextColor(30, 41, 59); // Slate-800
      
      let currentY = el.y + yOffset;
      el.lines.forEach(line => {
        const textWidth = doc.getTextWidth(line);
        doc.text(line, xOffset + (bookPageWidth - textWidth) / 2, currentY);
        currentY += (el.fontSize * 2.54 / 72) * 1.4;
      });
    } else if (el.type === 'line') {
      doc.setTextColor(51, 65, 85); // Slate-700
      let currentX = xOffset + el.x;
      el.words.forEach(word => {
        let fontStyle = el.fontWeight || 'normal';
        if (word.bold && word.italic) fontStyle = 'bolditalic';
        else if (word.bold) fontStyle = 'bold';
        else if (word.italic) fontStyle = 'italic';
        
        doc.setFont(font, fontStyle);
        doc.setFontSize(el.fontSize);
        
        doc.text(word.text, currentX, yOffset + el.y);
        currentX += doc.getTextWidth(word.text);
      });
    } else if (el.type === 'bullet') {
      doc.setFont(font, 'normal');
      doc.setFontSize(el.fontSize);
      doc.setTextColor(79, 70, 229); // Indigo-600
      doc.text('•', xOffset + el.x, yOffset + el.y);
    } else if (el.type === 'number') {
      doc.setFont(font, 'bold');
      doc.setFontSize(el.fontSize);
      doc.setTextColor(79, 70, 229); // Indigo-600
      doc.text(el.text, xOffset + el.x, yOffset + el.y);
    } else if (el.type === 'blockquote-line') {
      doc.setDrawColor(226, 232, 240); // Slate-200
      doc.setLineWidth(0.04);
      doc.line(xOffset + el.x, yOffset + el.y - (el.h * 0.7), xOffset + el.x, yOffset + el.y + (el.h * 0.3));
    }
  });
}

/**
 * Generates and downloads a PDF of the book.
 */
export async function generateBookPDF({ titre, pitch, contexte, chapitres, settings }) {
  const format = settings.format || 'A4';
  
  // 1. First paginate standard pages using a temporary document of the correct format
  const tempDoc = new jsPDF({
    orientation: 'portrait',
    unit: 'cm',
    format: format.toLowerCase()
  });

  // Load custom TTF font files dynamically into measurement instance
  await loadFontInJsPDF(tempDoc, settings.police);

  const pages = paginateBook({ 
    titre, 
    pitch, 
    contexte, 
    chapitres, 
    settings, 
    doc: tempDoc 
  });
  
  const N = pages.length;

  // 2. Prepare the final document
  let doc;
  
  if (settings.modeLivret) {
    // Booklet mode: landscape layout combining two portrait pages side-by-side
    // A4 Portrait -> A3 Landscape
    // A5 Portrait -> A4 Landscape
    const bookletFormat = format === 'A4' ? 'a3' : 'a4';
    
    doc = new jsPDF({
      orientation: 'landscape',
      unit: 'cm',
      format: bookletFormat
    });
    
    // Load custom TTF font files dynamically into output instance
    await loadFontInJsPDF(doc, settings.police);
    
    const pageWidth = doc.internal.pageSize.getWidth();
    const halfWidth = pageWidth / 2;
    
    // Split into signatures
    const sheetsPerSig = parseInt(settings.feuillesParCahier) || 0;
    const pagesPerSig = sheetsPerSig > 0 ? (sheetsPerSig * 4) : Math.ceil(N / 4) * 4;
    
    const signatures = [];
    let currentSig = [];
    for (let i = 0; i < N; i++) {
      currentSig.push(pages[i]);
      if (currentSig.length === pagesPerSig) {
        signatures.push(currentSig);
        currentSig = [];
      }
    }
    if (currentSig.length > 0) {
      const currentLen = currentSig.length;
      // Pad to nearest multiple of 4
      const targetLen = Math.ceil(currentLen / 4) * 4;
      for (let i = currentLen; i < targetLen; i++) {
        currentSig.push({ type: 'empty' });
      }
      signatures.push(currentSig);
    }
    
    // Render signatures onto landscape pages
    let isFirstSheet = true;
    signatures.forEach((sig) => {
      const sigPageCount = sig.length;
      const sigSheetCount = sigPageCount / 4;
      
      for (let s = 1; s <= sigSheetCount; s++) {
        // --- FRONT SHEET ---
        if (!isFirstSheet) {
          doc.addPage();
        }
        isFirstSheet = false;
        
        // Front: Left = end - 2*(s-1), Right = start + 2*(s-1)
        const leftIdx = (sigPageCount - 1) - 2 * (s - 1);
        const rightIdx = 0 + 2 * (s - 1);
        
        const leftPage = sig[leftIdx];
        const rightPage = sig[rightIdx];
        
        if (leftPage && leftPage.type !== 'empty') {
          drawPage(doc, leftPage, 0, 0, leftPage.pageNum, N, { ...settings, titre, pitch, contexte, modeLivret: true });
        }
        if (rightPage && rightPage.type !== 'empty') {
          drawPage(doc, rightPage, halfWidth, 0, rightPage.pageNum, N, { ...settings, titre, pitch, contexte, modeLivret: true });
        }
        
        // --- BACK SHEET ---
        doc.addPage();
        
        // Back: Left = start + 2*(s-1) + 1, Right = end - 2*(s-1) - 1
        const leftBackIdx = 0 + 2 * (s - 1) + 1;
        const rightBackIdx = (sigPageCount - 1) - 2 * (s - 1) - 1;
        
        const leftBackPage = sig[leftBackIdx];
        const rightBackPage = sig[rightBackIdx];
        
        if (leftBackPage && leftBackPage.type !== 'empty') {
          drawPage(doc, leftBackPage, 0, 0, leftBackPage.pageNum, N, { ...settings, titre, pitch, contexte, modeLivret: true });
        }
        if (rightBackPage && rightBackPage.type !== 'empty') {
          doc.setPage(doc.getNumberOfPages()); // ensure drawing context is on current page
          drawPage(doc, rightBackPage, halfWidth, 0, rightBackPage.pageNum, N, { ...settings, titre, pitch, contexte, modeLivret: true });
        }
      }
    });
  } else {
    // Normal mode: sequential portrait layout
    doc = new jsPDF({
      orientation: 'portrait',
      unit: 'cm',
      format: format.toLowerCase()
    });
    
    // Load custom TTF font files dynamically into output instance
    await loadFontInJsPDF(doc, settings.police);
    
    let isFirst = true;
    pages.forEach((page) => {
      if (!isFirst) {
        doc.addPage();
      }
      isFirst = false;
      drawPage(doc, page, 0, 0, page.pageNum, N, { ...settings, titre, pitch, contexte, modeLivret: false });
    });
  }

  // Save document
  const fileName = titre
    ? `${titre.toLowerCase().replace(/[^a-z0-9]+/g, '_')}.pdf`
    : 'mon_livre.pdf';
  doc.save(fileName);
}
