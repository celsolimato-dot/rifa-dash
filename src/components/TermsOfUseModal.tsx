import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";

interface TermsOfUseModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const TermsOfUseModal = ({ isOpen, onClose }: TermsOfUseModalProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-foreground">
            Termos de Uso
          </DialogTitle>
          <DialogDescription className="sr-only">
            Termos e condições de uso da plataforma
          </DialogDescription>
        </DialogHeader>
        
        <ScrollArea className="max-h-[60vh] pr-4">
          <div className="space-y-6 text-foreground-muted">
            {/* Aqui vai o conteúdo dos termos de uso */}
            <div className="text-center p-8 text-foreground-muted">
              <p>Por favor, forneça o texto dos Termos de Uso para ser exibido aqui.</p>
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default TermsOfUseModal;