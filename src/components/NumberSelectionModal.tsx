import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { 
  ShoppingCart, 
  Clock, 
  CreditCard, 
  Users, 
  Trophy, 
  Search,
  X,
  Plus,
  Minus,
  Timer,
  CheckCircle,
  AlertCircle,
  QrCode,
  Copy
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { RealTicketService } from "@/services/realTicketService";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface NumberSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  raffle: {
    id: string;
    title: string;
    image: string;
    price: number;
    totalTickets: number;
    soldTickets: number;
    drawDate: string;
  };
}

interface SelectedNumber {
  number: string;
  status: 'selected' | 'reserved' | 'purchased';
  reservedAt?: Date;
}

interface ReservationTimer {
  number: string;
  timeLeft: number;
}

export const NumberSelectionModal: React.FC<NumberSelectionModalProps> = ({
  isOpen,
  onClose,
  raffle
}) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [selectedNumbers, setSelectedNumbers] = useState<SelectedNumber[]>([]);
  const [searchNumber, setSearchNumber] = useState('');
  const [currentStep, setCurrentStep] = useState<'selection' | 'checkout' | 'pix'>('selection');
  const [reservationTimers, setReservationTimers] = useState<ReservationTimer[]>([]);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [pixData, setPixData] = useState<any>(null);
  const [isGeneratingPix, setIsGeneratingPix] = useState(false);
  const [isCheckingPayment, setIsCheckingPayment] = useState(false);
  const [paymentPolling, setPaymentPolling] = useState<NodeJS.Timeout | null>(null);

  // Estado para números vendidos e reservados (buscar do banco)
  const [soldNumbers, setSoldNumbers] = useState<string[]>([]);
  const [reservedNumbers, setReservedNumbers] = useState<string[]>([]);

  const ticketService = new RealTicketService();

  // Carregar tickets existentes quando modal abrir e configurar realtime
  useEffect(() => {
    if (isOpen) {
      loadExistingTickets();
      
      // Configurar subscription para updates em tempo real
      const channel = supabase
        .channel('tickets-changes')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'tickets',
            filter: `raffle_id=eq.${raffle.id}`
          },
          (payload) => {
            console.log('Ticket atualizado:', payload);
            
            // Recarregar tickets quando houver mudanças
            loadExistingTickets();
            
            // Verificar se é um pagamento confirmado para o usuário atual
            if (payload.eventType === 'UPDATE' && 
                payload.new.payment_status === 'paid' && 
                payload.new.user_email === user?.email &&
                currentStep === 'pix') {
              
              const updatedNumber = payload.new.number.toString().padStart(3, '0');
              const wasSelected = selectedNumbers.find(sel => sel.number === updatedNumber);
              
              if (wasSelected) {
                console.log('Pagamento confirmado automaticamente via webhook!', updatedNumber);
                
                // Parar polling se existir
                if (paymentPolling) {
                  clearInterval(paymentPolling);
                  setPaymentPolling(null);
                }
                
                toast.success('🎉 Pagamento confirmado automaticamente!', {
                  duration: 5000,
                  description: `Número ${updatedNumber} garantido!`
                });
                
                // Resetar modal após sucesso
                setTimeout(() => {
                  handlePaymentSuccess();
                }, 2000);
              }
            }
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [isOpen, raffle.id, user?.email, selectedNumbers, currentStep, paymentPolling]);

  const loadExistingTickets = async () => {
    try {
      const tickets = await ticketService.getTicketsByRaffle(raffle.id);
      const sold = tickets
        .filter(t => t.status === 'sold' && t.payment_status === 'paid')
        .map(t => t.number.toString().padStart(3, '0'));
      const reserved = tickets
        .filter(t => t.status === 'reserved' && t.payment_status === 'pending')
        .map(t => t.number.toString().padStart(3, '0'));
      setSoldNumbers(sold);
      setReservedNumbers(reserved);
    } catch (error) {
      console.error('Erro ao carregar tickets:', error);
    }
  };

  // Gerar números disponíveis
  const generateNumbers = () => {
    const numbers = [];
    for (let i = 1; i <= raffle.totalTickets; i++) {
      const number = i.toString().padStart(3, '0');
      numbers.push(number);
    }
    return numbers;
  };

  const allNumbers = generateNumbers();
  const availableNumbers = allNumbers.filter(num => 
    !soldNumbers.includes(num) && !reservedNumbers.includes(num)
  );

  // Filtrar números baseado na busca
  const filteredNumbers = searchNumber 
    ? allNumbers.filter(num => num.includes(searchNumber))
    : allNumbers;

  // Timer para reservas (5 minutos)
  useEffect(() => {
    const interval = setInterval(() => {
      setReservationTimers(prev => {
        const updated = prev.map(timer => ({
          ...timer,
          timeLeft: timer.timeLeft - 1
        })).filter(timer => timer.timeLeft > 0);

        // Remover números que expiraram da reserva
        const expiredNumbers = prev
          .filter(timer => timer.timeLeft <= 1)
          .map(timer => timer.number);

        if (expiredNumbers.length > 0) {
          setReservedNumbers(current => 
            current.filter(num => !expiredNumbers.includes(num))
          );
          setSelectedNumbers(current => 
            current.filter(num => !expiredNumbers.includes(num.number))
          );
        }

        return updated;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const getNumberStatus = (number: string) => {
    if (soldNumbers.includes(number)) return 'sold';
    if (reservedNumbers.includes(number)) return 'reserved';
    if (selectedNumbers.some(sel => sel.number === number)) return 'selected';
    return 'available';
  };

  const getNumberColor = (status: string) => {
    switch (status) {
      case 'sold': return 'bg-red-500 text-white cursor-not-allowed';
      case 'reserved': return 'bg-yellow-500 text-white cursor-not-allowed';
      case 'selected': return 'bg-green-500 text-white cursor-pointer';
      default: return 'bg-background border border-border hover:border-primary cursor-pointer';
    }
  };

  const handleNumberClick = (number: string) => {
    if (!user) {
      alert('Você precisa estar logado para participar da rifa!');
      return;
    }

    const status = getNumberStatus(number);
    if (status === 'sold' || status === 'reserved') return;

    if (status === 'selected') {
      // Remover número selecionado
      setSelectedNumbers(prev => prev.filter(sel => sel.number !== number));
    } else {
      // Adicionar número selecionado
      setSelectedNumbers(prev => [...prev, {
        number,
        status: 'selected'
      }]);
    }
  };

  const handleReserveNumbers = () => {
    if (selectedNumbers.length === 0) return;

    const now = new Date();
    const reservationTime = 5 * 60; // 5 minutos em segundos

    // Adicionar aos números reservados
    const numbersToReserve = selectedNumbers.map(sel => sel.number);
    setReservedNumbers(prev => [...prev, ...numbersToReserve]);

    // Criar timers para cada número
    const newTimers = numbersToReserve.map(number => ({
      number,
      timeLeft: reservationTime
    }));
    setReservationTimers(prev => [...prev, ...newTimers]);

    // Atualizar status dos números selecionados
    setSelectedNumbers(prev => prev.map(sel => ({
      ...sel,
      status: 'reserved' as const,
      reservedAt: now
    })));

    setCurrentStep('checkout');
  };

  const generatePixQrCode = async () => {
    setIsGeneratingPix(true);
    
    try {
      const amountInReais = totalAmount;
      
      const { data, error } = await supabase.functions.invoke('generate-pix', {
        body: {
          amount: amountInReais,
          description: `Rifa: ${raffle.title} - Números: ${selectedNumbers.map(sel => sel.number).join(', ')}`,
          customer: {
            name: user?.name || 'Cliente',
            cellphone: user?.phone || '',
            email: user?.email || '',
            taxId: user?.cpf || ''
          },
          metadata: {
            externalId: `rifa_${raffle.id}_${Date.now()}`
          },
          raffleId: raffle.id,
          selectedNumbers: selectedNumbers.map(sel => sel.number),
          userEmail: user?.email || ''
        }
      });

      if (error) {
        throw new Error(error.message);
      }

      if (!data.success) {
        throw new Error(data.error || 'Erro ao gerar PIX');
      }
      
      setPixData(data.pixData);
      setCurrentStep('pix');
      
      // Iniciar polling para verificar pagamento
      startPaymentPolling(data.pixData.id);
      
    } catch (error) {
      console.error('Erro ao gerar PIX:', error);      
      toast.error(getErrorMessage(error));
    } finally {
      setIsGeneratingPix(false);
    }
  };

  const getErrorMessage = (error: any) => {
    if (error.message.includes('Token da API')) {
      return 'Configuração da API não encontrada. Entre em contato com o suporte.';
    } else if (error.message.includes('HTTP: 401')) {
      return 'Token de API inválido. Entre em contato com o suporte.';
    } else if (error.message.includes('HTTP: 400')) {
      return 'Dados inválidos para geração do PIX. Verifique as informações.';
    } else if (error.message.includes('Failed to fetch')) {
      return 'Erro de conexão. Verifique sua internet e tente novamente.';
    }
    return 'Erro ao gerar PIX QR Code. Tente novamente.';
  };

  const startPaymentPolling = (pixId: string) => {
    // Limpar polling anterior se existir
    if (paymentPolling) {
      clearInterval(paymentPolling);
    }

    const interval = setInterval(async () => {
      await checkPaymentStatus(pixId);
    }, 5000); // Verificar a cada 5 segundos

    setPaymentPolling(interval);

    // Parar polling após 5 minutos (tempo de expiração do PIX)
    setTimeout(() => {
      if (interval) {
        clearInterval(interval);
        setPaymentPolling(null);
      }
    }, 300000);
  };

  const checkPaymentStatus = async (pixId: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('check-payment-status', {
        body: { 
          pixId, 
          userEmail: user?.email, 
          raffleId: raffle.id 
        }
      });

      if (error) {
        console.error('Erro ao verificar status:', error);
        return;
      }

      if (data.status === 'paid') {
        // Pagamento confirmado!
        if (paymentPolling) {
          clearInterval(paymentPolling);
          setPaymentPolling(null);
        }
        
        toast.success('🎉 Seu número da sorte está garantido!', {
          duration: 5000,
          description: `Números: ${selectedNumbers.map(sel => sel.number).join(', ')}`
        });
        
        // Atualizar números vendidos
        await loadExistingTickets();
        
        // Resetar e fechar modal
        handlePaymentSuccess();
      }
    } catch (error) {
      console.error('Erro ao verificar pagamento:', error);
    }
  };

  const handlePaymentSuccess = () => {
    setSelectedNumbers([]);
    setCurrentStep('selection');
    setPixData(null);
    setReservedNumbers([]);
    setReservationTimers([]);
    onClose();
  };

  const handleManualPaymentCheck = async () => {
    if (!pixData?.id) return;
    
    setIsCheckingPayment(true);
    await checkPaymentStatus(pixData.id);
    setIsCheckingPayment(false);
  };

  // Cleanup ao fechar modal
  useEffect(() => {
    if (!isOpen) {
      if (paymentPolling) {
        clearInterval(paymentPolling);
        setPaymentPolling(null);
      }
      setSelectedNumbers([]);
      setCurrentStep('selection');
      setPixData(null);
      setReservedNumbers([]);
      setReservationTimers([]);
    }
  }, [isOpen, paymentPolling]);

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const totalAmount = selectedNumbers.length * raffle.price;

  const renderSelectionStep = () => (
    <div className="space-y-6">
      {/* Busca de números */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-foreground-muted h-4 w-4" />
        <Input
          placeholder="Buscar número específico..."
          value={searchNumber}
          onChange={(e) => setSearchNumber(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Legenda */}
      <div className="flex flex-wrap gap-4 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-background border border-border rounded"></div>
          <span>Disponível</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-green-500 rounded"></div>
          <span>Selecionado</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-yellow-500 rounded"></div>
          <span>Reservado</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-red-500 rounded"></div>
          <span>Vendido</span>
        </div>
      </div>

      {/* Grid de números */}
      <div className="max-h-96 overflow-y-auto">
        <div className="grid grid-cols-8 gap-2">
          {filteredNumbers.map((number) => {
            const status = getNumberStatus(number);
            return (
              <Button
                key={number}
                variant="outline"
                size="sm"
                className={`h-10 text-xs font-mono ${getNumberColor(status)}`}
                onClick={() => handleNumberClick(number)}
                disabled={status === 'sold' || status === 'reserved'}
              >
                {number}
              </Button>
            );
          })}
        </div>
      </div>

      {/* Números selecionados */}
      {selectedNumbers.length > 0 && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-semibold">Números Selecionados</h4>
              <Badge variant="secondary">{selectedNumbers.length}</Badge>
            </div>
            <div className="flex flex-wrap gap-2 mb-4">
              {selectedNumbers.map((sel) => (
                <Badge key={sel.number} variant="default" className="bg-green-500">
                  {sel.number}
                  <X 
                    className="w-3 h-3 ml-1 cursor-pointer" 
                    onClick={() => handleNumberClick(sel.number)}
                  />
                </Badge>
              ))}
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-foreground-muted">
                Total: R$ {totalAmount.toFixed(2)}
              </span>
              <div className="flex gap-2">
                <Button onClick={handleReserveNumbers} className="bg-yellow-500 hover:bg-yellow-600">
                  <Clock className="w-4 h-4 mr-2" />
                  Reservar por 5min
                </Button>
                <Button 
                  onClick={generatePixQrCode} 
                  disabled={selectedNumbers.length === 0 || isGeneratingPix}
                  className="bg-green-600 hover:bg-green-700"
                >
                  {isGeneratingPix ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Gerando...
                    </>
                  ) : (
                    <>
                      <CreditCard className="w-4 h-4 mr-2" />
                      Finalizar
                    </>
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );

  const renderCheckoutStep = () => (
    <div className="space-y-6">
      {/* Timer de reserva */}
      <Card className="border-yellow-500">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Timer className="w-5 h-5 text-yellow-500" />
              <span className="font-semibold">Números Reservados</span>
            </div>
            <div className="text-right">
              {reservationTimers.map((timer) => (
                <div key={timer.number} className="text-sm">
                  <span className="font-mono text-yellow-600">
                    {formatTime(timer.timeLeft)}
                  </span>
                </div>
              ))}
            </div>
          </div>
          <p className="text-sm text-foreground-muted mt-2">
            Complete sua compra antes que o tempo expire
          </p>
        </CardContent>
      </Card>

      {/* Resumo da compra */}
      <Card>
        <CardContent className="p-4">
          <h4 className="font-semibold mb-3">Resumo da Compra</h4>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span>Números selecionados:</span>
              <span>{selectedNumbers.map(sel => sel.number).join(', ')}</span>
            </div>
            <div className="flex justify-between">
              <span>Quantidade:</span>
              <span>{selectedNumbers.length}</span>
            </div>
            <div className="flex justify-between">
              <span>Preço unitário:</span>
              <span>R$ {raffle.price.toFixed(2)}</span>
            </div>
            <Separator />
            <div className="flex justify-between font-semibold">
              <span>Total:</span>
              <span>R$ {totalAmount.toFixed(2)}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Botões de ação */}
      <div className="flex gap-3">
        <Button 
          variant="outline" 
          onClick={() => setCurrentStep('selection')}
          className="flex-1"
        >
          Voltar
        </Button>
        <Button 
          onClick={generatePixQrCode}
          disabled={isGeneratingPix}
          className="flex-1 bg-green-600 hover:bg-green-700"
        >
          {isGeneratingPix ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Gerando PIX...
            </>
          ) : (
            <>
              <CreditCard className="w-4 h-4 mr-2" />
              Gerar PIX
            </>
          )}
        </Button>
      </div>
    </div>
  );

  const renderPixStep = () => (
    <div className="space-y-6">
      {/* Informações do PIX */}
      <Card className="border-green-500">
        <CardContent className="p-6 text-center">
          <QrCode className="w-12 h-12 text-green-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">PIX Gerado com Sucesso!</h3>
          <p className="text-foreground-muted mb-4">
            Escaneie o QR Code abaixo ou copie o código PIX para realizar o pagamento
          </p>
          
          {pixData && (
            <div className="space-y-4">
              {/* QR Code */}
              <div className="flex justify-center">
                <img 
                  src={pixData.brCodeBase64} 
                  alt="QR Code PIX" 
                  className="w-48 h-48 border border-border rounded-lg"
                />
              </div>
              
              {/* Código PIX */}
              <div className="bg-muted p-4 rounded-lg">
                <p className="text-sm text-foreground-muted mb-2">Código PIX:</p>
                <div className="flex items-center gap-2">
                  <code className="flex-1 text-xs bg-background p-2 rounded border break-all">
                    {pixData.brCode}
                  </code>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => navigator.clipboard.writeText(pixData.brCode)}
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Informações do pagamento */}
              <div className="bg-background border rounded-lg p-4">
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Valor:</span>
                    <span className="font-semibold">R$ {(pixData.amount / 100).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Expira em:</span>
                    <span className="text-yellow-600">5 minutos</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Status:</span>
                    <span className="text-yellow-600">Aguardando pagamento</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Botões de ação */}
      <div className="flex gap-3">
        <Button 
          variant="outline" 
          onClick={() => {
            setCurrentStep('selection');
            setPixData(null);
          }}
          className="flex-1"
        >
          Cancelar
        </Button>
        <Button 
          onClick={handleManualPaymentCheck}
          disabled={isCheckingPayment}
          className="flex-1 bg-blue-600 hover:bg-blue-700"
        >
          {isCheckingPayment ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Verificando...
            </>
          ) : (
            'Verificar Pagamento'
          )}
        </Button>
      </div>
    </div>
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <Trophy className="w-6 h-6 text-accent-gold" />
            {currentStep === 'selection' ? 'Escolha seus números da sorte' : 
             currentStep === 'checkout' ? 'Finalizar Compra' : 'Pagamento PIX'}
          </DialogTitle>
        </DialogHeader>

        {/* Informações da rifa */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <img 
                src={raffle.image} 
                alt={raffle.title}
                className="w-16 h-16 object-cover rounded-lg"
              />
              <div className="flex-1">
                <h3 className="font-semibold">{raffle.title}</h3>
                <div className="flex items-center gap-4 text-sm text-foreground-muted">
                  <span className="flex items-center gap-1">
                    <Users className="w-4 h-4" />
                    {raffle.soldTickets}/{raffle.totalTickets} vendidos
                  </span>
                  <span>R$ {raffle.price.toFixed(2)} por número</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Verificação de login */}
        {!user ? (
          <Card className="border-red-500">
            <CardContent className="p-4 text-center">
              <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-3" />
              <h3 className="font-semibold mb-2">Login Necessário</h3>
              <p className="text-foreground-muted mb-4">
                Você precisa estar logado para participar da rifa
              </p>
              <Button onClick={() => navigate('/auth')}>
                Fazer Login
              </Button>
            </CardContent>
          </Card>
        ) : (
          <>
            {currentStep === 'selection' ? renderSelectionStep() : 
             currentStep === 'checkout' ? renderCheckoutStep() : renderPixStep()}
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};