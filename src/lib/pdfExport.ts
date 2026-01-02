import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

// PDF export utility for validation results with proper multi-page support

export const exportToPDF = async (
  element: HTMLElement, 
  filename: string
): Promise<void> => {
  // Add print-mode class for optimized styling
  element.classList.add('print-mode');
  
  // Capture element as canvas with high quality (scale 3 for crisp text)
  const canvas = await html2canvas(element, {
    scale: 3,
    useCORS: true,
    logging: false,
    backgroundColor: '#ffffff',
    windowWidth: 900, // Fixed width for consistency
    onclone: (clonedDoc) => {
      // Ensure cloned element has proper styling
      const clonedElement = clonedDoc.body.querySelector('.report-sheet');
      if (clonedElement) {
        (clonedElement as HTMLElement).style.boxShadow = 'none';
      }
    }
  });
  
  // Remove print-mode class
  element.classList.remove('print-mode');
  
  // A4 dimensions in mm with margins
  const pdf = new jsPDF('p', 'mm', 'a4');
  const pdfWidth = pdf.internal.pageSize.getWidth();
  const pdfHeight = pdf.internal.pageSize.getHeight();
  
  // Add margins
  const margin = 10;
  const contentWidth = pdfWidth - (margin * 2);
  const contentHeight = pdfHeight - (margin * 2);
  
  // Calculate scale factor: how many canvas pixels per mm
  const imgWidth = contentWidth;
  const scaleFactor = canvas.width / imgWidth;
  
  // Calculate how many canvas pixels fit on one page
  const pageHeightInPx = contentHeight * scaleFactor;
  
  // Calculate total pages needed
  const totalPages = Math.ceil(canvas.height / pageHeightInPx);
  
  for (let page = 0; page < totalPages; page++) {
    if (page > 0) {
      pdf.addPage();
    }
    
    // Calculate slice boundaries for this page
    const sliceY = page * pageHeightInPx;
    const sliceHeight = Math.min(pageHeightInPx, canvas.height - sliceY);
    
    // Create a temporary canvas for this page slice
    const pageCanvas = document.createElement('canvas');
    pageCanvas.width = canvas.width;
    pageCanvas.height = sliceHeight;
    
    const ctx = pageCanvas.getContext('2d');
    if (ctx) {
      // Draw only the relevant portion from the source canvas
      ctx.drawImage(
        canvas,
        0, sliceY,                    // Source x, y
        canvas.width, sliceHeight,    // Source width, height
        0, 0,                         // Dest x, y
        canvas.width, sliceHeight     // Dest width, height
      );
    }
    
    // Convert this page slice to image data
    const pageImgData = pageCanvas.toDataURL('image/png', 1.0);
    const imgHeight = sliceHeight / scaleFactor;
    
    // Add this slice as an image to the current PDF page
    pdf.addImage(pageImgData, 'PNG', margin, margin, imgWidth, imgHeight);
  }
  
  pdf.save(filename);
};

export const generateFilename = (productName?: string): string => {
  const date = new Date().toISOString().split('T')[0];
  const safeName = productName?.replace(/[^a-zA-Z0-9]/g, '_') || 'validatie';
  return `${safeName}_${date}.pdf`;
};
