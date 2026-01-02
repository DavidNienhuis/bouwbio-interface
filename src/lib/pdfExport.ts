import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

// PDF export utility for validation results

/**
 * Export element to PDF with smart pagination
 * Splits content into logical sections to avoid breaking mid-element
 */
export const exportToPDF = async (
  element: HTMLElement,
  filename: string
): Promise<void> => {
  // Add print-mode class for optimized styling
  element.classList.add('print-mode');

  try {
    // A4 dimensions in mm
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();

    // Margins
    const margin = 10;
    const contentWidth = pageWidth - (margin * 2);
    const contentHeight = pageHeight - (margin * 2);

    // Get all sections that should be kept together
    const sections = element.querySelectorAll('.section-block, .report-header, .conclusion-box, .report-footer');

    if (sections.length === 0) {
      // Fallback: render entire element as one piece
      await renderFullElement(element, pdf, margin, contentWidth, contentHeight);
    } else {
      // Smart pagination: render section by section
      let currentY = margin;
      let isFirstPage = true;

      for (let i = 0; i < sections.length; i++) {
        const section = sections[i] as HTMLElement;

        // Capture section as canvas
        const canvas = await html2canvas(section, {
          scale: 2.5,
          useCORS: true,
          logging: false,
          backgroundColor: '#ffffff',
          windowWidth: 900,
        });

        const imgData = canvas.toDataURL('image/png', 1.0);
        const imgWidth = contentWidth;
        const imgHeight = (canvas.height * contentWidth) / canvas.width;

        // Check if section fits on current page
        if (!isFirstPage && currentY + imgHeight > pageHeight - margin) {
          // Section doesn't fit, start new page
          pdf.addPage();
          currentY = margin;
        }

        // Add section to PDF
        pdf.addImage(imgData, 'PNG', margin, currentY, imgWidth, imgHeight);
        currentY += imgHeight + 5; // Add small spacing between sections

        // If this was the first section and we're still on first page, mark as not first
        if (isFirstPage && currentY > margin) {
          isFirstPage = false;
        }

        // If current section filled most of the page, start fresh page for next
        if (currentY > pageHeight - 50 && i < sections.length - 1) {
          pdf.addPage();
          currentY = margin;
        }
      }
    }

    pdf.save(filename);
  } finally {
    // Always remove print-mode class
    element.classList.remove('print-mode');
  }
};

/**
 * Fallback: render entire element with basic pagination
 */
async function renderFullElement(
  element: HTMLElement,
  pdf: jsPDF,
  margin: number,
  contentWidth: number,
  contentHeight: number
): Promise<void> {
  const canvas = await html2canvas(element, {
    scale: 2.5,
    useCORS: true,
    logging: false,
    backgroundColor: '#ffffff',
    windowWidth: 900,
  });

  const imgData = canvas.toDataURL('image/png', 1.0);
  const imgWidth = contentWidth;
  const imgHeight = (canvas.height * contentWidth) / canvas.width;
  const pageHeight = pdf.internal.pageSize.getHeight();

  let heightLeft = imgHeight;
  let position = margin;

  // First page
  pdf.addImage(imgData, 'PNG', margin, position, imgWidth, imgHeight);
  heightLeft -= contentHeight;

  // Additional pages if needed
  while (heightLeft > 0) {
    position = margin - (imgHeight - heightLeft);
    pdf.addPage();
    pdf.addImage(imgData, 'PNG', margin, position, imgWidth, imgHeight);
    heightLeft -= contentHeight;
  }
}

export const generateFilename = (productName?: string): string => {
  const date = new Date().toISOString().split('T')[0];
  const safeName = productName?.replace(/[^a-zA-Z0-9]/g, '_') || 'validatie';
  return `${safeName}_${date}.pdf`;
};
