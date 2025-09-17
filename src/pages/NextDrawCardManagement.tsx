import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useNextDrawCard } from "@/contexts/NextDrawCardContext";
import { Trophy, Clock, Save, Eye } from "lucide-react";
import { toast } from "sonner";

const NextDrawCardManagement = () => {
  const { cardData, updateCardData } = useNextDrawCard();
  
  const [formData, setFormData] = useState({
    time: cardData.time,
    prize: cardData.prize,
    isActive: cardData.isActive
  });

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = () => {
    updateCardData(formData);
    toast.success("Card atualizado com sucesso!");
  };

  const handleReset = () => {
    setFormData({
      time: cardData.time,
      prize: cardData.prize,
      isActive: cardData.isActive
    });
    toast.info("Formulário resetado");
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Gerenciar Card "Próximo Sorteio"</h1>
          <p className="text-foreground-muted">
            Edite as informações que aparecem no card do frontend
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" onClick={handleReset}>
            Resetar
          </Button>
          <Button onClick={handleSave} className="bg-primary hover:bg-primary/90">
            <Save className="w-4 h-4 mr-2" />
            Salvar Alterações
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Formulário de Edição */}
        <div className="space-y-6">
          
          {/* Configurações Básicas */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Clock className="w-5 h-5 mr-2 text-blue-500" />
                Informações do Sorteio
              </CardTitle>
              <CardDescription>
                Configure o horário e prêmio do próximo sorteio
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="time">Horário do Sorteio</Label>
                <Input
                  id="time"
                  value={formData.time}
                  onChange={(e) => handleInputChange('time', e.target.value)}
                  placeholder="Ex: Hoje às 20h"
                />
                <p className="text-xs text-foreground-muted mt-1">
                  Este texto aparecerá em destaque no card
                </p>
              </div>
              
              <div>
                <Label htmlFor="prize">Nome do Prêmio</Label>
                <Input
                  id="prize"
                  value={formData.prize}
                  onChange={(e) => handleInputChange('prize', e.target.value)}
                  placeholder="Ex: Civic Sport 2024"
                />
                <p className="text-xs text-foreground-muted mt-1">
                  Nome do prêmio que será sorteado
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Configurações de Visibilidade */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Eye className="w-5 h-5 mr-2 text-green-500" />
                Visibilidade
              </CardTitle>
              <CardDescription>
                Controle se o card deve aparecer no frontend
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="isActive">Card Ativo</Label>
                  <p className="text-sm text-foreground-muted">
                    Quando desativado, o card não aparecerá no frontend
                  </p>
                </div>
                <Switch
                  id="isActive"
                  checked={formData.isActive}
                  onCheckedChange={(checked) => handleInputChange('isActive', checked)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Dicas */}
          <Card className="bg-blue-50 border-blue-200">
            <CardHeader>
              <CardTitle className="text-blue-700 text-sm">💡 Dicas de Uso</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-blue-600 space-y-2">
              <p>• Use horários específicos como "Hoje às 20h" ou "Amanhã às 15h"</p>
              <p>• Mantenha o nome do prêmio curto e atrativo</p>
              <p>• Desative o card quando não houver sorteios próximos</p>
              <p>• As alterações são aplicadas imediatamente no frontend</p>
            </CardContent>
          </Card>
        </div>

        {/* Preview */}
        <div className="space-y-6">
          
          {/* Preview do Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Trophy className="w-5 h-5 mr-2 text-purple-500" />
                Preview do Card
              </CardTitle>
              <CardDescription>
                Como aparecerá no frontend
              </CardDescription>
            </CardHeader>
            <CardContent>
              {formData.isActive ? (
                <Card className="p-6 bg-gradient-card border-border text-center">
                  <div className="space-y-4">
                    <Trophy className="w-12 h-12 text-accent-gold mx-auto" />
                    <h4 className="text-xl font-semibold text-foreground">Próximo Sorteio</h4>
                    <div className="space-y-2">
                      <div className="text-3xl font-bold text-primary">{formData.time}</div>
                      <p className="text-foreground-muted">{formData.prize}</p>
                    </div>
                    <Button 
                      variant="gold" 
                      className="w-full cursor-default"
                      disabled
                    >
                      Participar Agora
                    </Button>
                  </div>
                </Card>
              ) : (
                <div className="text-center py-8 text-foreground-muted">
                  <Eye className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Card desativado - não aparecerá no frontend</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Status Atual */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Status Atual</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-foreground-muted">Horário</span>
                <span className="text-sm font-medium">{cardData.time}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-foreground-muted">Prêmio</span>
                <span className="text-sm font-medium">{cardData.prize}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-foreground-muted">Status</span>
                <span className={`text-sm font-medium ${cardData.isActive ? 'text-green-600' : 'text-red-600'}`}>
                  {cardData.isActive ? 'Ativo' : 'Inativo'}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default NextDrawCardManagement;