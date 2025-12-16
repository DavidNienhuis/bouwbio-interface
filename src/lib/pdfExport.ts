import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

// PDF export utility for validation results

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
  
  const imgData = canvas.toDataURL('image/png', 1.0);
  
  // A4 dimensions in mm with margins
  const pdf = new jsPDF('p', 'mm', 'a4');
  const pdfWidth = pdf.internal.pageSize.getWidth();
  const pdfHeight = pdf.internal.pageSize.getHeight();
  
  // Add margins
  const margin = 10;
  const contentWidth = pdfWidth - (margin * 2);
  
  // Calculate image dimensions to fit A4 with margins
  const imgWidth = contentWidth;
  const imgHeight = (canvas.height * contentWidth) / canvas.width;
  
  // Handle multi-page PDFs if content is longer than one page
  let heightLeft = imgHeight;
  let position = margin;
  
  // First page
  pdf.addImage(imgData, 'PNG', margin, position, imgWidth, imgHeight);
  heightLeft -= (pdfHeight - margin * 2);
  
  // Additional pages if needed
  while (heightLeft > 0) {
    position = margin - (imgHeight - heightLeft);
    pdf.addPage();
    pdf.addImage(imgData, 'PNG', margin, position, imgWidth, imgHeight);
    heightLeft -= (pdfHeight - margin * 2);
  }
  
  pdf.save(filename);
};

export const generateFilename = (productName?: string): string => {
  const date = new Date().toISOString().split('T')[0];
  const safeName = productName?.replace(/[^a-zA-Z0-9]/g, '_') || 'validatie';
  return `${safeName}_${date}.pdf`;
};
