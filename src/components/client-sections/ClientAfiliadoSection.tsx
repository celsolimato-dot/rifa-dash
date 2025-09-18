import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Copy, Share2, Users, DollarSign, TrendingUp, ExternalLink } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface AffiliateData {
  id: string;
  affiliate_code: string;
  total_referrals: number;
  total_commission: number;
  available_balance: number;
  total_withdrawn: number;
  status: string;
}

interface Referral {
  id: string;
  referred_user_id: string;
  commission_earned: number;
  commission_percentage: number;
  status: string;
  created_at: string;
}

const ClientAfiliadoSection = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [affiliateData, setAffiliateData] = useState<AffiliateData | null>(null);
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [loading, setLoading] = useState(true);
  const [commissionRate, setCommissionRate] = useState(10);

  const affiliateLink = affiliateData ? 
    `${window.location.origin}/?ref=${affiliateData.affiliate_code}` : '';

  const fetchAffiliateData = async () => {
    if (!user?.id) return;

    try {
      setLoading(true);

      // Buscar dados do afiliado
      const { data: affiliate, error: affiliateError } = await supabase
        .from('affiliates')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (affiliateError && affiliateError.code !== 'PGRST116') {
        console.error('Error fetching affiliate data:', affiliateError);
        return;
      }

      if (affiliate) {
        setAffiliateData(affiliate);

        // Buscar referências
        const { data: referralsList, error: referralsError } = await supabase
          .from('referrals')
          .select('*')
          .eq('referrer_id', user.id)
          .order('created_at', { ascending: false });

        if (referralsError) {
          console.error('Error fetching referrals:', referralsError);
        } else {
          setReferrals(referralsList || []);
        }
      }

      // Buscar taxa de comissão
      const { data: settings } = await supabase
        .from('affiliate_settings')
        .select('commission_percentage')
        .single();

      if (settings) {
        setCommissionRate(settings.commission_percentage);
      }

    } catch (error) {
      console.error('Error in fetchAffiliateData:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAffiliateData();
  }, [user?.id]);

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({
        title: "Link copiado!",
        description: "O link de afiliado foi copiado para a área de transferência.",
      });
    } catch (error) {
      toast({
        title: "Erro ao copiar",
        description: "Não foi possível copiar o link.",
        variant: "destructive",
      });
    }
  };

  const shareLink = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Participe das melhores rifas!',
          text: `Use meu link de indicação e participe das melhores rifas com desconto especial!`,
          url: affiliateLink,
        });
      } catch (error) {
        console.log('Error sharing:', error);
      }
    } else {
      copyToClipboard(affiliateLink);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-foreground">Programa de Afiliados</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="pb-2">
                <div className="w-24 h-4 bg-muted rounded"></div>
              </CardHeader>
              <CardContent>
                <div className="w-16 h-8 bg-muted rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (!affiliateData) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-foreground">Programa de Afiliados</h2>
        </div>
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">
              Erro ao carregar dados do programa de afiliados.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-foreground">Programa de Afiliados</h2>
        <Badge variant="secondary" className="text-sm">
          Comissão: {commissionRate}%
        </Badge>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-border bg-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Indicações
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {affiliateData.total_referrals}
            </div>
          </CardContent>
        </Card>

        <Card className="border-border bg-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Comissão Total
            </CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              R$ {affiliateData.total_commission.toFixed(2)}
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
              R$ {affiliateData.available_balance.toFixed(2)}
            </div>
          </CardContent>
        </Card>

        <Card className="border-border bg-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Sacado
            </CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              R$ {affiliateData.total_withdrawn.toFixed(2)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Link de Afiliado */}
      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-foreground">
            <Share2 className="h-5 w-5" />
            Seu Link de Afiliado
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              value={affiliateLink}
              readOnly
              className="bg-muted/50 border-border"
            />
            <Button
              onClick={() => copyToClipboard(affiliateLink)}
              variant="outline"
              size="icon"
              className="shrink-0"
            >
              <Copy className="h-4 w-4" />
            </Button>
            <Button
              onClick={shareLink}
              variant="outline"
              size="icon"
              className="shrink-0"
            >
              <ExternalLink className="h-4 w-4" />
            </Button>
          </div>
          <div className="text-sm text-muted-foreground">
            Compartilhe este link e ganhe {commissionRate}% de comissão sobre cada compra de rifas realizada por pessoas que se cadastrarem através dele.
          </div>
        </CardContent>
      </Card>

      {/* Histórico de Indicações */}
      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle className="text-foreground">Histórico de Indicações</CardTitle>
        </CardHeader>
        <CardContent>
          {referrals.length === 0 ? (
            <div className="text-center py-8">
              <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">Ainda não há indicações</p>
              <p className="text-sm text-muted-foreground mt-2">
                Compartilhe seu link de afiliado para começar a ganhar comissões!
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {referrals.map((referral) => (
                <div key={referral.id} className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-foreground">
                      Indicação #{referral.id.slice(0, 8)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(referral.created_at).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                  <div className="text-right space-y-1">
                    <p className="text-sm font-medium text-foreground">
                      R$ {referral.commission_earned.toFixed(2)}
                    </p>
                    <Badge 
                      variant={referral.status === 'confirmed' ? 'default' : 'secondary'}
                      className="text-xs"
                    >
                      {referral.status === 'confirmed' ? 'Confirmado' : 
                       referral.status === 'pending' ? 'Pendente' : 'Cancelado'}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ClientAfiliadoSection;