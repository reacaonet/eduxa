import { useEffect, useState } from 'react';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { useToast } from './ui/use-toast';
import { Certificate as CertificateType } from '@/types/certificate';
import { Download, Loader2, Printer } from 'lucide-react';
import { generateCertificatePDF } from '@/lib/certificateService';

interface CertificateProps {
  certificate: CertificateType;
  onClose: () => void;
  open: boolean;
}

export function Certificate({ certificate, onClose, open }: CertificateProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = async () => {
    if (!certificate) {
      toast({
        title: 'Erro ao baixar certificado',
        description: 'Dados do certificado não encontrados.',
        variant: 'destructive',
      });
      return;
    }

    try {
      setIsGenerating(true);
      
      console.log('Gerando certificado para:', certificate);
      
      const pdfBuffer = await generateCertificatePDF(certificate);
      console.log('PDF gerado com sucesso');
      
      // Criar um blob com o buffer do PDF
      const blob = new Blob([pdfBuffer], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      
      console.log('URL do blob criada:', url);
      
      // Criar um link temporário para download
      const link = document.createElement('a');
      link.href = url;
      link.download = `certificado-${certificate.courseName.toLowerCase().replace(/\s+/g, '-')}.pdf`;
      
      // Adicionar o link ao documento
      document.body.appendChild(link);
      
      // Simular o clique
      link.click();
      
      // Pequeno delay antes de limpar
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Limpar
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      toast({
        title: 'Certificado baixado com sucesso!',
        description: 'O certificado foi salvo na sua pasta de downloads.',
      });
    } catch (error) {
      console.error('Erro ao gerar PDF:', error);
      toast({
        title: 'Erro ao baixar certificado',
        description: 'Ocorreu um erro ao gerar o PDF do certificado. Por favor, tente novamente.',
        variant: 'destructive',
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>Certificado de Conclusão</DialogTitle>
        </DialogHeader>

        <div className="p-6 border rounded-lg bg-white text-black print:shadow-none">
          <div className="text-center space-y-6">
            <div className="border-4 border-primary/20 p-8 rounded-lg">
              <h1 className="text-3xl font-serif mb-8 text-primary">Certificado de Conclusão</h1>
              
              <p className="text-lg mb-6">
                Certificamos que
              </p>
              
              <p className="text-2xl font-bold mb-6 text-primary">
                {certificate.studentName}
              </p>
              
              <p className="text-lg mb-6">
                concluiu com êxito o curso
              </p>
              
              <p className="text-2xl font-bold mb-6">
                {certificate.courseName}
              </p>
              
              <p className="text-lg mb-6">
                com carga horária de {certificate.workload} horas
              </p>
              
              <p className="text-lg mb-8">
                ministrado por {certificate.instructorName}
              </p>
              
              <div className="text-sm text-muted-foreground space-y-2">
                <p>Data de conclusão: {new Date(certificate.completionDate).toLocaleDateString()}</p>
                <p>Certificado Nº: {certificate.certificateNumber}</p>
              </div>
            </div>
          </div>

          <div className="mt-6 flex justify-end gap-2 print:hidden">
            <Button onClick={handlePrint}>
              <Printer className="mr-2 h-4 w-4" />
              Imprimir
            </Button>
            <Button onClick={handleDownload} disabled={isGenerating}>
              {isGenerating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Gerando PDF...
                </>
              ) : (
                <>
                  <Download className="mr-2 h-4 w-4" />
                  Baixar PDF
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
