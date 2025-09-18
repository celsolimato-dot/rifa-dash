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
          <div className="space-y-6 text-foreground-muted text-sm leading-relaxed">
            
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-foreground">1. Aceitação dos Termos</h3>
              <p>
                Ao acessar ou utilizar a plataforma <strong>Rifou.Net</strong>, você concorda em cumprir os termos e condições aqui estabelecidos. Caso não concorde com os termos, não utilize nossos serviços.
              </p>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-foreground">2. Objetivo da Plataforma</h3>
              <p>
                A <strong>Rifou.Net</strong> oferece uma plataforma online para a criação e participação em rifas digitais. O usuário pode comprar ingressos para rifas ou criar rifas para arrecadar fundos.
              </p>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-foreground">3. Cadastro de Usuário</h3>
              <p>
                Para participar das rifas, é necessário criar uma conta. O usuário deve fornecer informações verdadeiras e completas. A plataforma se reserva o direito de suspender ou excluir contas em caso de informações falsas ou atividades fraudulentas.
              </p>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-foreground">4. Responsabilidade do Usuário</h3>
              <p>
                O usuário é responsável por todas as atividades realizadas em sua conta. O uso de rifas e ingressos é exclusivo para fins legais, e o usuário se compromete a não utilizar a plataforma para atividades ilícitas.
              </p>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-foreground">5. Condições de Participação nas Rifas</h3>
              <p>
                A participação nas rifas está sujeita às regras específicas de cada campanha. As rifas possuem prazos e valores definidos, que devem ser respeitados. Não há garantia de que o usuário será contemplado com prêmios.
              </p>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-foreground">6. Pagamentos e Taxas</h3>
              <p>
                O pagamento para participação nas rifas será feito exclusivamente por meios eletrônicos disponibilizados pela plataforma. A <strong>Rifou.Net</strong> pode cobrar uma taxa administrativa, conforme especificado na descrição da rifa.
              </p>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-foreground">7. Prêmios e Sorteios</h3>
              <p>
                Os sorteios das rifas serão realizados de forma transparente, de acordo com as regras estabelecidas. O prêmio será entregue ao vencedor conforme as condições previamente informadas na página da rifa. Caso o vencedor não entre em contato em até [X] dias, o prêmio será redistribuído ou cancelado.
              </p>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-foreground">8. Direitos Autorais</h3>
              <p>
                Todo o conteúdo presente na plataforma <strong>Rifou.Net</strong>, incluindo, mas não se limitando a, design, logotipos, textos, imagens e códigos, é protegido por direitos autorais e não pode ser utilizado sem permissão expressa da plataforma.
              </p>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-foreground">9. Limitação de Responsabilidade</h3>
              <p>
                A <strong>Rifou.Net</strong> não se responsabiliza por falhas no sistema ou interrupções no serviço, nem por qualquer dano direto ou indireto resultante da participação nas rifas.
              </p>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-foreground">10. Modificação dos Termos</h3>
              <p>
                A plataforma se reserva o direito de alterar estes Termos de Uso a qualquer momento, com ou sem aviso prévio. As alterações serão publicadas na plataforma, e o uso contínuo do serviço implica na aceitação das novas condições.
              </p>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-foreground">11. Cancelamento e Suspensão de Conta</h3>
              <p>
                A <strong>Rifou.Net</strong> pode, a seu critério, suspender ou encerrar a conta de um usuário que viole estes Termos de Uso ou que esteja envolvido em atividades fraudulentas.
              </p>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-foreground">12. Disposições Finais</h3>
              <p>
                Estes Termos de Uso são regidos pelas leis do Brasil. Em caso de litígios, as partes concordam em buscar a resolução de disputas de forma amigável, ou, se necessário, recorrer ao foro competente.
              </p>
            </div>

          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default TermsOfUseModal;