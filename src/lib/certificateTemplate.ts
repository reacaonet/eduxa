import { Certificate } from "@/types/certificate";

export function generateCertificateHTML(certificate: Certificate): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Certificado de Conclusão</title>
      <style>
        @media print {
          body {
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
        }
        
        body {
          font-family: 'Arial', sans-serif;
          margin: 0;
          padding: 40px;
          background: #fff;
          color: #000;
        }
        .certificate {
          border: 20px solid #1d4ed8;
          padding: 40px;
          text-align: center;
          position: relative;
          background: #fff;
        }
        .header {
          font-size: 48px;
          color: #1d4ed8;
          margin-bottom: 40px;
          font-weight: bold;
        }
        .content {
          font-size: 24px;
          line-height: 1.6;
          margin-bottom: 40px;
          color: #000;
        }
        .student-name {
          font-size: 36px;
          font-weight: bold;
          color: #1d4ed8;
          margin: 20px 0;
        }
        .course-name {
          font-size: 30px;
          font-weight: bold;
          margin: 20px 0;
          color: #000;
        }
        .footer {
          margin-top: 60px;
          font-size: 18px;
          color: #000;
        }
        .signature {
          margin-top: 40px;
          border-top: 2px solid #000;
          display: inline-block;
          padding: 10px 40px;
          color: #000;
        }
        .metadata {
          position: absolute;
          bottom: 20px;
          right: 20px;
          font-size: 14px;
          color: #666;
          text-align: right;
        }
      </style>
    </head>
    <body>
      <div class="certificate">
        <div class="header">Certificado de Conclusão</div>
        
        <div class="content">
          Certificamos que
          
          <div class="student-name">${certificate.studentName}</div>
          
          concluiu com êxito o curso
          
          <div class="course-name">${certificate.courseName}</div>
          
          com carga horária de ${certificate.workload} horas,
          ministrado por ${certificate.instructorName}
        </div>
        
        <div class="footer">
          <div class="signature">
            ${certificate.instructorName}<br>
            Instrutor
          </div>
        </div>
        
        <div class="metadata">
          Data de conclusão: ${new Date(certificate.completionDate).toLocaleDateString()}<br>
          Certificado Nº: ${certificate.certificateNumber}
        </div>
      </div>
    </body>
    </html>
  `;
}
