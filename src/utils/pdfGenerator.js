import { jsPDF } from 'jspdf';

const FONT_MAP = {
  'serif': 'times',
  'sans-serif': 'helvetica',
  'monospace': 'courier'
};

/**
 * Generates and downloads a PDF of the book.
 * 
 * @param {Object} params
 * @param {string} params.titre - Title of the book
 * @param {string} params.pitch - Pitch / Synopsis of the book
 * @param {Object} params.contexte - Object containing epoque, culture, lieu
 * @param {Array} params.chapitres - Array of chapter objects { numero, titre, contenu }
 * @param {Object} params.settings - Export settings { police, taille, marges, format }
 */
export function generateBookPDF({ titre, pitch, contexte, chapitres, settings }) {
  const format = settings.format || 'A4';
  const margin = parseFloat(settings.marges) || 2.5; // in cm
  const fontSize = parseInt(settings.taille) || 11; // in pt
  const police = settings.police || 'serif';
  const font = FONT_MAP[police] || 'times';

  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'cm',
    format: format.toLowerCase()
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const printableWidth = pageWidth - (margin * 2);
  const bottomMargin = margin;

  const fontToCm = (size) => (size * 2.54) / 72;

  // --- 1. COVER PAGE ---
  drawCoverPage(doc, titre, pitch, contexte, { police, marges: margin });

  // --- 2. CHAPTERS ---
  const chapterStartPages = [];

  const writtenChapters = (chapitres || []).filter(c => c.contenu && c.contenu.trim() !== '');

  if (writtenChapters.length === 0) {
    // If no chapters are written, add a placeholder page so the PDF isn't empty
    doc.addPage();
    doc.setFont(font, 'italic');
    doc.setFontSize(fontSize);
    doc.setTextColor(148, 163, 184);
    const emptyText = "Aucun chapitre n'a encore été rédigé.";
    const textWidth = doc.getTextWidth(emptyText);
    doc.text(emptyText, (pageWidth - textWidth) / 2, pageHeight / 2);
  } else {
    writtenChapters.forEach((chapter, index) => {
      // Add a page for the chapter
      doc.addPage();
      const currentPageIndex = doc.getNumberOfPages();
      chapterStartPages.push(currentPageIndex);

      let currentY = 4.5; // Top vertical position for chapter start

      // Render Chapter Header Title
      doc.setFont(font, 'bold');
      doc.setFontSize(fontSize * 1.5);
      doc.setTextColor(30, 41, 59); // Slate-800

      const chapterTitleText = `Chapitre ${chapter.numero} : ${chapter.titre}`;
      const wrappedTitle = doc.splitTextToSize(chapterTitleText, printableWidth);

      wrappedTitle.forEach(line => {
        const textWidth = doc.getTextWidth(line);
        doc.text(line, (pageWidth - textWidth) / 2, currentY);
        currentY += fontToCm(fontSize * 1.5) * 1.4;
      });

      currentY += 1.2; // Spacing after chapter title

      // Render Chapter Content
      doc.setFont(font, 'normal');
      doc.setFontSize(fontSize);
      doc.setTextColor(51, 65, 85); // Slate-700

      const paragraphs = chapter.contenu.split(/\n+/);

      paragraphs.forEach(paragraph => {
        const trimmed = paragraph.trim();
        if (!trimmed) return;

        const lines = doc.splitTextToSize(trimmed, printableWidth);
        let isFirstLine = true;

        lines.forEach(line => {
          const lineH = fontToCm(fontSize) * 1.5; // Line height spacing

          // Check if line overflows current page
          if (currentY + lineH > pageHeight - bottomMargin) {
            doc.addPage();
            currentY = margin + 1.0; // Reset Y position on new page
            doc.setFont(font, 'normal');
            doc.setFontSize(fontSize);
            doc.setTextColor(51, 65, 85);
          }

          let xPos = margin;
          if (isFirstLine) {
            if (police === 'serif') {
              xPos += 0.75; // Classic paragraph indent
            }
            isFirstLine = false;
          }

          doc.text(line, xPos, currentY);
          currentY += lineH;
        });

        // Add paragraph spacing
        if (police !== 'serif') {
          currentY += fontToCm(fontSize) * 0.8;
        } else {
          currentY += fontToCm(fontSize) * 0.3;
        }
      });
    });
  }

  // --- 3. HEADERS & FOOTERS (RUNNING CORRECTIONS) ---
  const totalPages = doc.getNumberOfPages();
  for (let i = 2; i <= totalPages; i++) {
    doc.setPage(i);
    const isChapterStart = chapterStartPages.includes(i);
    drawHeaderFooter(doc, i, totalPages, titre, { police, marges: margin }, isChapterStart);
  }

  // Save document
  const fileName = titre
    ? `${titre.toLowerCase().replace(/[^a-z0-9]+/g, '_')}.pdf`
    : 'mon_livre.pdf';
  doc.save(fileName);
}

/**
 * Draws the elegant cover page
 */
function drawCoverPage(doc, title, pitch, context, settings) {
  const font = FONT_MAP[settings.police] || 'times';
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = settings.marges;
  const printableWidth = pageWidth - (margin * 2);

  // Elegant double frame border
  doc.setDrawColor(79, 70, 229); // Indigo-600
  doc.setLineWidth(0.05);
  doc.rect(1.2, 1.2, pageWidth - 2.4, pageHeight - 2.4);

  doc.setDrawColor(226, 232, 240); // Slate-200
  doc.setLineWidth(0.02);
  doc.rect(1.35, 1.35, pageWidth - 2.7, pageHeight - 2.7);

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
    doc.text(line, (pageWidth - textWidth) / 2, titleY);
    titleY += (titleSize * 2.54 / 72) * 1.3;
  });

  // Divider Line
  doc.setDrawColor(79, 70, 229);
  doc.setLineWidth(0.04);
  doc.line(pageWidth * 0.4, titleY + 0.5, pageWidth * 0.6, titleY + 0.5);

  // Subtitle
  doc.setFont(font, 'italic');
  doc.setFontSize(11);
  doc.setTextColor(100, 116, 139); // Slate-500
  const subtitle = "Un récit co-écrit par l'Homme & l'Intelligence Artificielle";
  const subtitleWidth = doc.getTextWidth(subtitle);
  doc.text(subtitle, (pageWidth - subtitleWidth) / 2, titleY + 1.3);

  // Pitch / Synopsis Block
  if (pitch) {
    let pitchY = pageHeight * 0.55;
    doc.setFont(font, 'normal');
    doc.setFontSize(10);
    doc.setTextColor(71, 85, 105); // Slate-600

    const pitchHeader = "SYNOPSIS";
    const headerWidth = doc.getTextWidth(pitchHeader);
    doc.text(pitchHeader, (pageWidth - headerWidth) / 2, pitchY);

    // Decorative line below header
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.01);
    doc.line(pageWidth * 0.46, pitchY + 0.2, pageWidth * 0.54, pitchY + 0.2);

    pitchY += 0.8;
    const wrappedPitch = doc.splitTextToSize(pitch, printableWidth - 1);
    
    // Render first 8 lines of synopsis
    wrappedPitch.slice(0, 8).forEach(line => {
      const textWidth = doc.getTextWidth(line);
      doc.text(line, (pageWidth - textWidth) / 2, pitchY);
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
    doc.text(contextText, (pageWidth - contextWidth) / 2, contextY);
  }
}

/**
 * Draws running headers and footers on chapter pages
 */
function drawHeaderFooter(doc, pageNum, totalPages, title, settings, isChapterStart) {
  const font = FONT_MAP[settings.police] || 'times';
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = settings.marges;

  // Footer: page numbers are displayed on all pages except the cover page
  doc.setFont(font, 'normal');
  doc.setFontSize(9);
  doc.setTextColor(100, 116, 139);
  // Subtracting 1 to omit the cover page in index calculation
  const footerText = `${pageNum - 1}`;
  const textWidth = doc.getTextWidth(footerText);
  doc.text(footerText, (pageWidth - textWidth) / 2, pageHeight - 1.2);

  // Header: skip drawing running header on chapter start pages (traditional publishing standard)
  if (!isChapterStart) {
    doc.setFont(font, 'italic');
    doc.setFontSize(8.5);
    doc.setTextColor(148, 163, 184);

    const headerText = title || 'Mon Roman';
    doc.text(headerText, margin, 1.2);

    // Subtle header line
    doc.setDrawColor(241, 245, 249); // Slate-100
    doc.setLineWidth(0.02);
    doc.line(margin, 1.4, pageWidth - margin, 1.4);
  }
}
