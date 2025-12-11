import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

// PDF export utility for validation results

export const exportToPDF = async (
  element: HTMLElement, 
  filename: string
): Promise<void> => {
  // Capture element as canvas with high quality
  const canvas = await html2canvas(element, {
    scale: 2,
    useCORS: true,
    logging: false,
    backgroundColor: '#ffffff',
  });
  
  const imgData = canvas.toDataURL('image/png');
  
  // A4 dimensions in mm
  const pdf = new jsPDF('p', 'mm', 'a4');
  const pdfWidth = pdf.internal.pageSize.getWidth();
  const pdfHeight = pdf.internal.pageSize.getHeight();
  
  // Calculate image dimensions to fit A4
  const imgWidth = pdfWidth;
  const imgHeight = (canvas.height * pdfWidth) / canvas.width;
  
  // Handle multi-page PDFs if content is longer than one page
  let heightLeft = imgHeight;
  let position = 0;
  
  pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
  heightLeft -= pdfHeight;
  
  while (heightLeft > 0) {
    position = heightLeft - imgHeight;
    pdf.addPage();
    pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
    heightLeft -= pdfHeight;
  }
  
  pdf.save(filename);
};

export const generateFilename = (productName?: string): string => {
  const date = new Date().toISOString().split('T')[0];
  const safeName = productName?.replace(/[^a-zA-Z0-9]/g, '_') || 'validatie';
  return `${safeName}_${date}.pdf`;
};
