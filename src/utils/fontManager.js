/**
 * Font Manager for dynamic Google Font loading & jsPDF registration
 */

export const AVAILABLE_FONTS = [
  // Built-in PDF Fallback fonts
  {
    id: 'serif',
    name: 'Times (Par défaut)',
    type: 'serif',
    family: 'times',
    isBuiltIn: true
  },
  {
    id: 'sans-serif',
    name: 'Helvetica (Par défaut)',
    type: 'sans-serif',
    family: 'helvetica',
    isBuiltIn: true
  },
  {
    id: 'monospace',
    name: 'Courier (Par défaut)',
    type: 'monospace',
    family: 'courier',
    isBuiltIn: true
  },
  // Premium Serif Google Fonts
  {
    id: 'eb-garamond',
    name: 'EB Garamond (Classique)',
    type: 'serif',
    family: 'EB Garamond',
    urls: {
      normal: 'https://fonts.gstatic.com/s/ebgaramond/v32/SlGDmQSNjdsmc35JDF1K5E55YMjF_7DPuGi-6_RkBI96.ttf',
      bold: 'https://fonts.gstatic.com/s/ebgaramond/v32/SlGDmQSNjdsmc35JDF1K5E55YMjF_7DPuGi-DPNkBI96.ttf',
      italic: 'https://fonts.gstatic.com/s/ebgaramond/v32/SlGFmQSNjdsmc35JDF1K5GRwUjcdlttVFm-rI7e8QL99U60.ttf',
      bolditalic: 'https://fonts.gstatic.com/s/ebgaramond/v32/SlGFmQSNjdsmc35JDF1K5GRwUjcdlttVFm-rI7dbR799U60.ttf'
    }
  },
  {
    id: 'playfair-display',
    name: 'Playfair Display (Élégant)',
    type: 'serif',
    family: 'Playfair Display',
    urls: {
      normal: 'https://fonts.gstatic.com/s/playfairdisplay/v40/nuFvD-vYSZviVYUb_rj3ij__anPXJzDwcbmjWBN2PKdFvXDXbtY.ttf',
      bold: 'https://fonts.gstatic.com/s/playfairdisplay/v40/nuFvD-vYSZviVYUb_rj3ij__anPXJzDwcbmjWBN2PKeiunDXbtY.ttf',
      italic: 'https://fonts.gstatic.com/s/playfairdisplay/v40/nuFRD-vYSZviVYUb_rj3ij__anPXDTnCjmHKM4nYO7KN_qiTXtHA_A.ttf',
      bolditalic: 'https://fonts.gstatic.com/s/playfairdisplay/v40/nuFRD-vYSZviVYUb_rj3ij__anPXDTnCjmHKM4nYO7KN_k-UXtHA_A.ttf'
    }
  },
  {
    id: 'lora',
    name: 'Lora (Moderne Serif)',
    type: 'serif',
    family: 'Lora',
    urls: {
      normal: 'https://fonts.gstatic.com/s/lora/v37/0QI6MX1D_JOuGQbT0gvTJPa787weuxJBkqg.ttf',
      bold: 'https://fonts.gstatic.com/s/lora/v37/0QI6MX1D_JOuGQbT0gvTJPa787z5vBJBkqg.ttf',
      italic: 'https://fonts.gstatic.com/s/lora/v37/0QI8MX1D_JOuMw_hLdO6T2wV9KnW-MoFoq92mQ.ttf',
      bolditalic: 'https://fonts.gstatic.com/s/lora/v37/0QI8MX1D_JOuMw_hLdO6T2wV9KnW-C0Coq92mQ.ttf'
    }
  },
  {
    id: 'cinzel',
    name: 'Cinzel (Éditorial)',
    type: 'serif',
    family: 'Cinzel',
    urls: {
      normal: 'https://fonts.gstatic.com/s/cinzel/v26/8vIU7ww63mVu7gtR-kwKxNvkNOjw-tbnfY3lCA.ttf',
      bold: 'https://fonts.gstatic.com/s/cinzel/v26/8vIU7ww63mVu7gtR-kwKxNvkNOjw-jHgfY3lCA.ttf'
    }
  },
  // Premium Sans-Serif Google Fonts
  {
    id: 'inter',
    name: 'Inter (Moderne et Épuré)',
    type: 'sans-serif',
    family: 'Inter',
    urls: {
      normal: 'https://fonts.gstatic.com/s/inter/v20/UcCO3FwrK3iLTeHuS_nVMrMxCp50SjIw2boKoduKmMEVuLyfAZ9hjQ.ttf',
      bold: 'https://fonts.gstatic.com/s/inter/v20/UcCO3FwrK3iLTeHuS_nVMrMxCp50SjIw2boKoduKmMEVuFuYAZ9hjQ.ttf',
      italic: 'https://fonts.gstatic.com/s/inter/v20/UcCM3FwrK3iLTcvneQg7Ca725JhhKnNqk4j1ebLhAm8SrXTc2dtRipWA.ttf',
      bolditalic: 'https://fonts.gstatic.com/s/inter/v20/UcCM3FwrK3iLTcvneQg7Ca725JhhKnNqk4j1ebLhAm8SrXTcPtxRipWA.ttf'
    }
  },
  {
    id: 'roboto',
    name: 'Roboto (Neutre)',
    type: 'sans-serif',
    family: 'Roboto',
    urls: {
      normal: 'https://fonts.gstatic.com/s/roboto/v51/KFOMCnqEu92Fr1ME7kSn66aGLdTylUAMQXC89YmC2DPNWubEbVmUiA8.ttf',
      bold: 'https://fonts.gstatic.com/s/roboto/v51/KFOMCnqEu92Fr1ME7kSn66aGLdTylUAMQXC89YmC2DPNWuYjalmUiA8.ttf',
      italic: 'https://fonts.gstatic.com/s/roboto/v51/KFOKCnqEu92Fr1Mu53ZEC9_Vu3r1gIhOszmOClHrs6ljXfMMLoHQuAj-lg.ttf',
      bolditalic: 'https://fonts.gstatic.com/s/roboto/v51/KFOKCnqEu92Fr1Mu53ZEC9_Vu3r1gIhOszmOClHrs6ljXfMMLmbXuAj-lg.ttf'
    }
  },
  {
    id: 'montserrat',
    name: 'Montserrat (Géométrique)',
    type: 'sans-serif',
    family: 'Montserrat',
    urls: {
      normal: 'https://fonts.gstatic.com/s/montserrat/v31/JTUHjIg1_i6t8kCHKm4532VJOt5-QNFgpCtr6Hw5aX8.ttf',
      bold: 'https://fonts.gstatic.com/s/montserrat/v31/JTUHjIg1_i6t8kCHKm4532VJOt5-QNFgpCuM73w5aX8.ttf',
      italic: 'https://fonts.gstatic.com/s/montserrat/v31/JTUFjIg1_i6t8kCHKm459Wx7xQYXK0vOoz6jq6R9WXh0ow.ttf',
      bolditalic: 'https://fonts.gstatic.com/s/montserrat/v31/JTUFjIg1_i6t8kCHKm459Wx7xQYXK0vOoz6jq0N6WXh0ow.ttf'
    }
  },
  // Monospace Google Fonts
  {
    id: 'courier-prime',
    name: 'Courier Prime (Machine à écrire)',
    type: 'monospace',
    family: 'Courier Prime',
    urls: {
      normal: 'https://fonts.gstatic.com/s/courierprime/v11/u-450q2lgwslOqpF_6gQ8kELawFpXw.ttf',
      bold: 'https://fonts.gstatic.com/s/courierprime/v11/u-4k0q2lgwslOqpF_6gQ8kELY7pMT-Dfrg.ttf',
      italic: 'https://fonts.gstatic.com/s/courierprime/v11/u-4n0q2lgwslOqpF_6gQ8kELawRZWMf_.ttf',
      bolditalic: 'https://fonts.gstatic.com/s/courierprime/v11/u-4i0q2lgwslOqpF_6gQ8kELawRR4-Lvqdnp.ttf'
    }
  }
];

// In-memory cache for browser font faces loaded
if (typeof window !== 'undefined') {
  window.__loadedFonts = window.__loadedFonts || {};
}

/**
 * Loads a font into the browser's document.fonts collection on demand for preview
 */
export async function loadFontInBrowser(fontId) {
  const fontObj = AVAILABLE_FONTS.find(f => f.id === fontId);
  if (!fontObj || fontObj.isBuiltIn) return;

  const fontName = fontObj.family;

  for (const [styleName, url] of Object.entries(fontObj.urls || {})) {
    const weight = styleName.includes('bold') ? 'bold' : 'normal';
    const style = styleName.includes('italic') ? 'italic' : 'normal';
    const fontKey = `${fontName}-${weight}-${style}`;

    if (window.__loadedFonts[fontKey]) {
      continue;
    }

    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error(`HTTP status ${response.status}`);
      const buffer = await response.arrayBuffer();
      
      const fontFace = new FontFace(fontName, buffer, { weight, style });
      await fontFace.load();
      document.fonts.add(fontFace);
      
      window.__loadedFonts[fontKey] = true;
      console.log(`Successfully registered browser font: ${fontKey}`);
    } catch (e) {
      console.warn(`Could not load browser font variant: ${fontKey} from ${url}. Error:`, e);
    }
  }
}

/**
 * Loads and registers a font dynamically in a jsPDF instance
 */
export async function loadFontInJsPDF(doc, fontId) {
  const fontObj = AVAILABLE_FONTS.find(f => f.id === fontId);
  if (!fontObj || fontObj.isBuiltIn) return null;

  const fontName = fontObj.family;

  for (const [styleName, url] of Object.entries(fontObj.urls || {})) {
    const fontStyle = styleName === 'normal' ? 'normal' :
                      styleName === 'bold' ? 'bold' :
                      styleName === 'italic' ? 'italic' : 'bolditalic';

    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error(`HTTP status ${response.status}`);
      const buffer = await response.arrayBuffer();

      const base64String = arrayBufferToBase64(buffer);
      const filename = `${fontName.replace(/\s+/g, '')}-${styleName}.ttf`;

      doc.addFileToVFS(filename, base64String);
      doc.addFont(filename, fontName, fontStyle);
      console.log(`Successfully registered jsPDF font: ${fontName} (${fontStyle})`);
    } catch (e) {
      console.warn(`Could not load jsPDF font variant: ${fontName} (${fontStyle}) from ${url}. Error:`, e);
    }
  }
  
  return fontName;
}

/**
 * Converts ArrayBuffer to Base64
 */
function arrayBufferToBase64(buffer) {
  let binary = '';
  const bytes = new Uint8Array(buffer);
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return window.btoa(binary);
}
