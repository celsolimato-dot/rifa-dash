import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";

interface RegulamentModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const RegulamentModal = ({ isOpen, onClose }: RegulamentModalProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-foreground">
            Regulamento da Plataforma
          </DialogTitle>
        </DialogHeader>
        
        <ScrollArea className="h-[60vh] pr-4">
          <div className="space-y-6 text-foreground-muted">
            <div className="text-center mb-6">
              <h2 className="text-lg font-bold text-foreground">
                Regulamento da Plataforma - Rifou.Net
              </h2>
            </div>

            <section className="space-y-3">
              <h3 className="text-base font-semibold text-foreground">
                1. Finalidade da Plataforma
              </h3>
              <p className="leading-relaxed">
                A <strong>Rifou.Net</strong> é uma plataforma digital destinada à realização e 
                participação em rifas online, organizadas exclusivamente pela administração do site.
              </p>
            </section>

            <section className="space-y-3">
              <h3 className="text-base font-semibold text-foreground">
                2. Quem Pode Usar
              </h3>
              <p className="leading-relaxed">
                A participação é permitida apenas a usuários maiores de 18 anos, com CPF válido e 
                dados cadastrais verdadeiros.
              </p>
            </section>

            <section className="space-y-3">
              <h3 className="text-base font-semibold text-foreground">
                3. Criação de Rifas
              </h3>
              <ul className="space-y-2 ml-4">
                <li className="leading-relaxed">
                  • <strong>Somente o administrador da plataforma pode criar e gerenciar rifas.</strong>
                </li>
                <li className="leading-relaxed">
                  • Usuários não têm permissão para criar ou divulgar rifas por meio da plataforma.
                </li>
              </ul>
            </section>

            <section className="space-y-3">
              <h3 className="text-base font-semibold text-foreground">
                4. Participação nas Rifas
              </h3>
              <ul className="space-y-2 ml-4">
                <li className="leading-relaxed">
                  • Os usuários podem participar adquirindo números disponíveis após o pagamento confirmado.
                </li>
                <li className="leading-relaxed">
                  • A participação é voluntária e não garante premiação.
                </li>
              </ul>
            </section>

            <section className="space-y-3">
              <h3 className="text-base font-semibold text-foreground">
                5. Sorteio e Resultado
              </h3>
              <ul className="space-y-2 ml-4">
                <li className="leading-relaxed">
                  • Os sorteios seguem critérios informados em cada rifa, preferencialmente com base na <strong>Loteria Federal</strong>.
                </li>
                <li className="leading-relaxed">
                  • O resultado será divulgado na plataforma e o vencedor será contatado diretamente.
                </li>
              </ul>
            </section>

            <section className="space-y-3">
              <h3 className="text-base font-semibold text-foreground">
                6. Pagamentos
              </h3>
              <ul className="space-y-2 ml-4">
                <li className="leading-relaxed">
                  • Os pagamentos são realizados via meios eletrônicos seguros.
                </li>
                <li className="leading-relaxed">
                  • A confirmação do pagamento garante a reserva dos números escolhidos.
                </li>
              </ul>
            </section>

            <section className="space-y-3">
              <h3 className="text-base font-semibold text-foreground">
                7. Entrega dos Prêmios
              </h3>
              <ul className="space-y-2 ml-4">
                <li className="leading-relaxed">
                  • A administração da plataforma é responsável pela entrega dos prêmios ao(s) vencedor(es), 
                  conforme regras descritas na rifa.
                </li>
              </ul>
            </section>

            <section className="space-y-3">
              <h3 className="text-base font-semibold text-foreground">
                8. Proibições
              </h3>
              <p className="leading-relaxed">É estritamente proibido:</p>
              <ul className="space-y-2 ml-4">
                <li className="leading-relaxed">
                  • Tentar criar rifas ou campanhas não autorizadas.
                </li>
                <li className="leading-relaxed">
                  • Fornecer dados falsos ou de terceiros.
                </li>
                <li className="leading-relaxed">
                  • Praticar qualquer tipo de fraude ou conduta ilícita.
                </li>
              </ul>
            </section>

            <section className="space-y-3">
              <h3 className="text-base font-semibold text-foreground">
                9. Penalidades
              </h3>
              <p className="leading-relaxed">O descumprimento deste regulamento pode resultar em:</p>
              <ul className="space-y-2 ml-4">
                <li className="leading-relaxed">
                  • Suspensão ou exclusão da conta.
                </li>
                <li className="leading-relaxed">
                  • Perda do direito à participação em rifas ativas.
                </li>
              </ul>
            </section>

            <section className="space-y-3">
              <h3 className="text-base font-semibold text-foreground">
                10. Alterações no Regulamento
              </h3>
              <p className="leading-relaxed">
                A <strong>Rifou.Net</strong> pode atualizar este regulamento a qualquer momento. 
                O uso contínuo da plataforma implica concordância com as novas regras.
              </p>
            </section>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default RegulamentModal;