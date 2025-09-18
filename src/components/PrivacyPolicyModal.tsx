import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";

interface PrivacyPolicyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const PrivacyPolicyModal = ({ isOpen, onClose }: PrivacyPolicyModalProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-foreground">
            Política de Privacidade - Rifou.Net
          </DialogTitle>
          <DialogDescription className="sr-only">
            Política de privacidade da plataforma
          </DialogDescription>
        </DialogHeader>
        
        <ScrollArea className="max-h-[60vh] pr-4">
          <div className="space-y-6 text-foreground-muted text-sm leading-relaxed">
            
            <div className="space-y-4">
              <p>
                A <strong>Rifou.Net</strong> valoriza a sua privacidade e está comprometida em proteger suas informações pessoais. Ao utilizar nossa plataforma, você concorda com a coleta, uso e compartilhamento de dados conforme descrito nesta Política de Privacidade.
              </p>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-foreground">1. Coleta de Dados</h3>
              <p>
                Coletamos informações pessoais quando você cria uma conta, participa de rifas ou realiza pagamentos. Isso pode incluir seu nome, e-mail, CPF, endereço e dados de pagamento.
              </p>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-foreground">2. Uso dos Dados</h3>
              <p>Utilizamos suas informações para:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Processar sua inscrição nas rifas.</li>
                <li>Enviar notificações e atualizações sobre sua conta e rifas.</li>
                <li>Melhorar nossos serviços e a experiência do usuário.</li>
              </ul>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-foreground">3. Compartilhamento de Dados</h3>
              <p>
                Não compartilhamos suas informações pessoais com terceiros, exceto quando necessário para processar pagamentos ou conforme exigido por lei.
              </p>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-foreground">4. Segurança</h3>
              <p>
                Adotamos medidas de segurança adequadas para proteger seus dados, mas não podemos garantir 100% de segurança devido à natureza da internet.
              </p>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-foreground">5. Retenção de Dados</h3>
              <p>
                Retemos seus dados enquanto sua conta estiver ativa ou enquanto for necessário para cumprir nossas obrigações legais.
              </p>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-foreground">6. Seus Direitos</h3>
              <p>
                Você pode acessar, corrigir ou excluir seus dados pessoais a qualquer momento, entrando em contato com nossa equipe de suporte.
              </p>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-foreground">7. Alterações na Política de Privacidade</h3>
              <p>
                Podemos atualizar esta política periodicamente. Quaisquer mudanças serão publicadas na plataforma e entrarão em vigor imediatamente.
              </p>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-foreground">8. Contato</h3>
              <p>
                Caso tenha dúvidas sobre esta Política de Privacidade, entre em contato conosco através do e-mail [inserir e-mail de contato].
              </p>
            </div>

          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default PrivacyPolicyModal;