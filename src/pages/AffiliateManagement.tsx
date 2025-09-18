import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { 
  Users, 
  DollarSign, 
  TrendingUp, 
  Settings2,
  Search,
  Eye,
  UserCheck,
  Copy,
  ExternalLink,
  X
} from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface AffiliateData {
  id: string;
  user_id: string;
  affiliate_code: string;
  total_referrals: number;
  total_commission: number;
  available_balance: number;
  total_withdrawn: number;
  status: string;
  created_at: string;
  user?: {
    name: string;
    email: string;
  };
}

interface CommissionSettings {
  commission_percentage: number;
  min_payout: number;
}

const AffiliateManagement = () => {
  const { toast } = useToast();
  const [affiliates, setAffiliates] = useState<AffiliateData[]>([]);
  const [settings, setSettings] = useState<CommissionSettings>({
    commission_percentage: 10,
    min_payout: 50
  });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [newCommission, setNewCommission] = useState('10');
  const [newMinPayout, setNewMinPayout] = useState('50');
  const [selectedAffiliate, setSelectedAffiliate] = useState<AffiliateData | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);

  const fetchAffiliates = async () => {
    try {
      setLoading(true);
      
      // Buscar afiliados
      const { data: affiliatesData, error: affiliatesError } = await supabase
        .from('affiliates')
        .select('*')
        .order('created_at', { ascending: false });

      if (affiliatesError) {
        console.error('Error fetching affiliates:', affiliatesError);
        return;
      }

      // Para cada afiliado, buscar dados do usuário da tabela users
      const affiliatesWithUserData = await Promise.all(
        (affiliatesData || []).map(async (affiliate) => {
          const { data: userData } = await supabase
            .from('users')
            .select('name, email')
            .eq('id', affiliate.user_id)
            .single();
          
          return {
            ...affiliate,
            user: userData ? {
              name: userData.name || 'Usuário',
              email: userData.email || ''
            } : null
          };
        })
      );

      setAffiliates(affiliatesWithUserData);
    } catch (error) {
      console.error('Error in fetchAffiliates:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSettings = async () => {
    try {
      // Buscar o registro mais recente
      const { data, error } = await supabase
        .from('affiliate_settings')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (data && !error) {
        setSettings({
          commission_percentage: data.commission_percentage,
          min_payout: data.min_payout
        });
        setNewCommission(data.commission_percentage.toString());
        setNewMinPayout(data.min_payout.toString());
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
    }
  };

  const updateSettings = async () => {
    try {
      const commissionValue = parseFloat(newCommission);
      const minPayoutValue = parseFloat(newMinPayout);

      if (isNaN(commissionValue) || isNaN(minPayoutValue)) {
        toast({
          title: "Erro",
          description: "Por favor, insira valores válidos.",
          variant: "destructive",
        });
        return;
      }

      // Primeiro, limpar todos os registros existentes
      await supabase
        .from('affiliate_settings')
        .delete()
        .gte('id', '00000000-0000-0000-0000-000000000000');

      // Inserir novo registro
      const { error } = await supabase
        .from('affiliate_settings')
        .insert({
          commission_percentage: commissionValue,
          min_payout: minPayoutValue
        });

      if (error) {
        throw error;
      }

      setSettings({
        commission_percentage: commissionValue,
        min_payout: minPayoutValue
      });

      toast({
        title: "Sucesso!",
        description: "Configurações atualizadas com sucesso.",
      });

      // Recarregar configurações para garantir que estão atualizadas
      await fetchSettings();
    } catch (error) {
      console.error('Error updating settings:', error);
      toast({
        title: "Erro",
        description: "Erro ao atualizar configurações.",
        variant: "destructive",
      });
    }
  };

  const openAffiliateLink = (affiliateCode: string) => {
    const link = `${window.location.origin}/?ref=${affiliateCode}`;
    window.open(link, '_blank');
  };

  const openDetails = (affiliate: AffiliateData) => {
    setSelectedAffiliate(affiliate);
    setIsDetailsModalOpen(true);
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({
        title: "Copiado!",
        description: "Código de afiliado copiado para a área de transferência.",
      });
    } catch (error) {
      toast({
        title: "Erro ao copiar",
        description: "Não foi possível copiar o código.",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchAffiliates();
    fetchSettings();
  }, []);

  const filteredAffiliates = affiliates.filter(affiliate =>
    affiliate.user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    affiliate.user?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    affiliate.affiliate_code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalAffiliates = affiliates.length;
  const totalCommissions = affiliates.reduce((sum, affiliate) => sum + affiliate.total_commission, 0);
  const totalBalance = affiliates.reduce((sum, affiliate) => sum + affiliate.available_balance, 0);

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-foreground">Gestão de Afiliados</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="pb-2">
                <div className="w-32 h-4 bg-muted rounded"></div>
              </CardHeader>
              <CardContent>
                <div className="w-20 h-8 bg-muted rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-foreground">Gestão de Afiliados</h1>
        <Badge variant="secondary" className="text-sm">
          Comissão Atual: {settings.commission_percentage}%
        </Badge>
      </div>

      {/* Estatísticas Gerais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="border-border bg-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total de Afiliados
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {totalAffiliates}
            </div>
          </CardContent>
        </Card>

        <Card className="border-border bg-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Comissões Pagas
            </CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              R$ {totalCommissions.toFixed(2)}
            </div>
          </CardContent>
        </Card>

        <Card className="border-border bg-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Saldo Disponível
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">
              R$ {totalBalance.toFixed(2)}
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="affiliates" className="space-y-6">
        <TabsList>
          <TabsTrigger value="affiliates">Afiliados</TabsTrigger>
          <TabsTrigger value="settings">Configurações</TabsTrigger>
        </TabsList>

        <TabsContent value="affiliates" className="space-y-6">
          {/* Busca */}
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nome, email ou código..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Lista de Afiliados */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredAffiliates.map((affiliate) => (
              <Card key={affiliate.id} className="border-border bg-card">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <CardTitle className="text-lg text-foreground">
                        {affiliate.user?.name || 'Usuário'}
                      </CardTitle>
                      <p className="text-sm text-muted-foreground">
                        {affiliate.user?.email}
                      </p>
                    </div>
                    <Badge 
                      variant={affiliate.status === 'active' ? 'default' : 'secondary'}
                      className="text-xs"
                    >
                      {affiliate.status === 'active' ? 'Ativo' : 'Inativo'}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground">Código de Afiliado</p>
                      <p className="font-mono font-semibold text-foreground">
                        {affiliate.affiliate_code}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => copyToClipboard(affiliate.affiliate_code)}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => openAffiliateLink(affiliate.affiliate_code)}
                      >
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <Separator />

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground">Indicações</p>
                      <p className="text-sm font-semibold text-foreground">
                        {affiliate.total_referrals}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground">Comissão Total</p>
                      <p className="text-sm font-semibold text-foreground">
                        R$ {affiliate.total_commission.toFixed(2)}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground">Saldo Disponível</p>
                      <p className="text-sm font-semibold text-primary">
                        R$ {affiliate.available_balance.toFixed(2)}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground">Total Sacado</p>
                      <p className="text-sm font-semibold text-foreground">
                        R$ {affiliate.total_withdrawn.toFixed(2)}
                      </p>
                    </div>
                  </div>

                  <Separator />

                  <div className="flex justify-between items-center">
                    <p className="text-xs text-muted-foreground">
                      Cadastrado em {new Date(affiliate.created_at).toLocaleDateString('pt-BR')}
                    </p>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => openDetails(affiliate)}
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      Ver Detalhes
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredAffiliates.length === 0 && (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center py-8">
                  <UserCheck className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">
                    {searchTerm ? 'Nenhum afiliado encontrado.' : 'Nenhum afiliado cadastrado ainda.'}
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings2 className="h-5 w-5" />
                Configurações do Programa de Afiliados
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">
                    Porcentagem de Comissão (%)
                  </label>
                  <Input
                    type="number"
                    min="0"
                    max="50"
                    step="0.5"
                    value={newCommission}
                    onChange={(e) => setNewCommission(e.target.value)}
                    placeholder="Ex: 10"
                  />
                  <p className="text-xs text-muted-foreground">
                    Porcentagem que será paga aos afiliados por cada venda.
                  </p>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">
                    Valor Mínimo para Saque (R$)
                  </label>
                  <Input
                    type="number"
                    min="1"
                    step="0.01"
                    value={newMinPayout}
                    onChange={(e) => setNewMinPayout(e.target.value)}
                    placeholder="Ex: 50.00"
                  />
                  <p className="text-xs text-muted-foreground">
                    Valor mínimo que o afiliado deve ter para solicitar saque.
                  </p>
                </div>
              </div>

              <Separator />

              <div className="bg-muted/30 p-4 rounded-lg space-y-2">
                <h4 className="font-semibold text-foreground">Regras do Programa:</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• O afiliado ganha comissão apenas quando o indicado se cadastra E efetua uma compra</li>
                  <li>• A compra deve ser de até 5 números de rifas para gerar comissão</li>
                  <li>• As comissões são calculadas automaticamente pelo sistema</li>
                  <li>• Os valores ficam disponíveis no painel do afiliado após a confirmação da compra</li>
                </ul>
              </div>

              <div className="flex justify-end">
                <Button onClick={updateSettings} className="bg-primary hover:bg-primary/90">
                  Salvar Configurações
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Modal de Detalhes do Afiliado */}
      <Dialog open={isDetailsModalOpen} onOpenChange={setIsDetailsModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <UserCheck className="h-5 w-5" />
              Detalhes do Afiliado
            </DialogTitle>
          </DialogHeader>
          
          {selectedAffiliate && (
            <div className="space-y-6">
              {/* Informações do Usuário */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <h4 className="font-semibold text-foreground">Informações Pessoais</h4>
                  <div className="space-y-1">
                    <p className="text-sm">
                      <span className="font-medium">Nome:</span> {selectedAffiliate.user?.name || 'N/A'}
                    </p>
                    <p className="text-sm">
                      <span className="font-medium">Email:</span> {selectedAffiliate.user?.email || 'N/A'}
                    </p>
                    <p className="text-sm">
                      <span className="font-medium">Status:</span> 
                      <Badge className="ml-2" variant={selectedAffiliate.status === 'active' ? 'default' : 'secondary'}>
                        {selectedAffiliate.status === 'active' ? 'Ativo' : 'Inativo'}
                      </Badge>
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="font-semibold text-foreground">Código de Afiliado</h4>
                  <div className="flex items-center gap-2 p-2 bg-muted rounded">
                    <code className="font-mono text-sm">{selectedAffiliate.affiliate_code}</code>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(selectedAffiliate.affiliate_code)}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => openAffiliateLink(selectedAffiliate.affiliate_code)}
                    >
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Estatísticas */}
              <div>
                <h4 className="font-semibold text-foreground mb-4">Estatísticas</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-3 bg-muted/30 rounded-lg">
                    <p className="text-2xl font-bold text-primary">{selectedAffiliate.total_referrals}</p>
                    <p className="text-xs text-muted-foreground">Indicações</p>
                  </div>
                  <div className="text-center p-3 bg-muted/30 rounded-lg">
                    <p className="text-2xl font-bold text-green-600">R$ {selectedAffiliate.total_commission.toFixed(2)}</p>
                    <p className="text-xs text-muted-foreground">Comissão Total</p>
                  </div>
                  <div className="text-center p-3 bg-muted/30 rounded-lg">
                    <p className="text-2xl font-bold text-blue-600">R$ {selectedAffiliate.available_balance.toFixed(2)}</p>
                    <p className="text-xs text-muted-foreground">Saldo Disponível</p>
                  </div>
                  <div className="text-center p-3 bg-muted/30 rounded-lg">
                    <p className="text-2xl font-bold text-orange-600">R$ {selectedAffiliate.total_withdrawn.toFixed(2)}</p>
                    <p className="text-xs text-muted-foreground">Total Sacado</p>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Informações Adicionais */}
              <div className="space-y-2">
                <h4 className="font-semibold text-foreground">Informações Adicionais</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                  <p>
                    <span className="font-medium">Data de Cadastro:</span> 
                    {new Date(selectedAffiliate.created_at).toLocaleDateString('pt-BR', {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                  <p>
                    <span className="font-medium">Link de Afiliado:</span> 
                    <code className="ml-2 text-xs bg-muted px-1 rounded">
                      {window.location.origin}/?ref={selectedAffiliate.affiliate_code}
                    </code>
                  </p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AffiliateManagement;