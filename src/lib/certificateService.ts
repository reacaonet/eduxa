import { Certificate } from "@/types/certificate";
import { generateCertificateHTML } from "./certificateTemplate";

export async function generateCertificatePDF(certificate: Certificate): Promise<Buffer> {
  const html = generateCertificateHTML(certificate);
  
  // @ts-ignore
  const htmlPdf = (await import('html-pdf-node')).default;
  
  const options = {
    format: 'A4',
    landscape: true,
    margin: {
      top: '20px',
      right: '20px',
      bottom: '20px',
      left: '20px'
    },
    printBackground: true,
    preferCSSPageSize: true
  };

  const file = { content: html };
  
  try {
    const pdfBuffer = await htmlPdf.generatePdf(file, options);
    return pdfBuffer;
  } catch (error) {
    console.error('Erro ao gerar PDF:', error);
    throw error;
  }
}
