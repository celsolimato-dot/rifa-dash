import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useNextDraw } from "@/contexts/NextDrawContext";
import { Calendar, Clock, Trophy, DollarSign, Ticket, Image, Save, RefreshCw } from "lucide-react";

const NextDrawManagement = () => {
  const { nextDraw, updateNextDraw, calculateDaysRemaining } = useNextDraw();
  const [formData, setFormData] = useState(nextDraw);
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = async () => {
    setIsLoading(true);
    try {
      // Simular delay de salvamento
      await new Promise(resolve => setTimeout(resolve, 1000));
      updateNextDraw(formData);
      alert('Próximo sorteio atualizado com sucesso!');
    } catch (error) {
      alert('Erro ao salvar. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setFormData(nextDraw);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'paused': return 'bg-yellow-100 text-yellow-800';
      case 'finished': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active': return 'Ativo';
      case 'paused': return 'Pausado';
      case 'finished': return 'Finalizado';
      default: return 'Desconhecido';
    }
  };

  const progress = (formData.soldTickets / formData.totalTickets) * 100;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Gerenciar Próximo Sorteio</h1>
          <p className="text-foreground-muted">Configure as informações do próximo sorteio em destaque</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleReset}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Resetar
          </Button>
          <Button onClick={handleSave} disabled={isLoading}>
            <Save className="w-4 h-4 mr-2" />
            {isLoading ? 'Salvando...' : 'Salvar'}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Formulário */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Informações Básicas */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Trophy className="w-5 h-5 mr-2 text-yellow-500" />
                Informações Básicas
              </CardTitle>
              <CardDescription>
                Configure os dados principais do próximo sorteio
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Título do Sorteio</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    placeholder="Ex: Carro dos Sonhos"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="prize">Prêmio</Label>
                  <Input
                    id="prize"
                    value={formData.prize}
                    onChange={(e) => handleInputChange('prize', e.target.value)}
                    placeholder="Ex: Honda Civic Sport 2024"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Descrição</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Descreva o prêmio e detalhes do sorteio..."
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="prizeValue">Valor do Prêmio</Label>
                  <Input
                    id="prizeValue"
                    value={formData.prizeValue}
                    onChange={(e) => handleInputChange('prizeValue', e.target.value)}
                    placeholder="Ex: R$ 120.000"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category">Categoria</Label>
                  <Select value={formData.category} onValueChange={(value) => handleInputChange('category', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione a categoria" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Automóvel">Automóvel</SelectItem>
                      <SelectItem value="Motocicleta">Motocicleta</SelectItem>
                      <SelectItem value="Dinheiro">Dinheiro</SelectItem>
                      <SelectItem value="Eletrônicos">Eletrônicos</SelectItem>
                      <SelectItem value="Casa">Casa</SelectItem>
                      <SelectItem value="Outros">Outros</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select value={formData.status} onValueChange={(value) => handleInputChange('status', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Ativo</SelectItem>
                      <SelectItem value="paused">Pausado</SelectItem>
                      <SelectItem value="finished">Finalizado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Configurações de Bilhetes */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Ticket className="w-5 h-5 mr-2 text-blue-500" />
                Configurações de Bilhetes
              </CardTitle>
              <CardDescription>
                Configure os valores e quantidades de bilhetes
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="totalTickets">Total de Bilhetes</Label>
                  <Input
                    id="totalTickets"
                    type="number"
                    value={formData.totalTickets}
                    onChange={(e) => handleInputChange('totalTickets', parseInt(e.target.value) || 0)}
                    placeholder="Ex: 5000"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="soldTickets">Bilhetes Vendidos</Label>
                  <Input
                    id="soldTickets"
                    type="number"
                    value={formData.soldTickets}
                    onChange={(e) => handleInputChange('soldTickets', parseInt(e.target.value) || 0)}
                    placeholder="Ex: 3250"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="ticketPrice">Preço por Bilhete</Label>
                  <Input
                    id="ticketPrice"
                    type="number"
                    step="0.01"
                    value={formData.ticketPrice}
                    onChange={(e) => handleInputChange('ticketPrice', parseFloat(e.target.value) || 0)}
                    placeholder="Ex: 25.00"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Data do Sorteio */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Calendar className="w-5 h-5 mr-2 text-green-500" />
                Data do Sorteio
              </CardTitle>
              <CardDescription>
                Configure quando o sorteio será realizado
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="drawDate">Data do Sorteio</Label>
                <Input
                  id="drawDate"
                  type="date"
                  value={formData.drawDate}
                  onChange={(e) => handleInputChange('drawDate', e.target.value)}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Preview */}
        <div className="space-y-6">
          
          {/* Preview do Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Clock className="w-5 h-5 mr-2 text-purple-500" />
                Preview do Card
              </CardTitle>
              <CardDescription>
                Como aparecerá no dashboard do cliente
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="bg-gradient-card border-border rounded-lg p-4">
                <div className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <div className="text-sm font-medium text-foreground-muted">
                    Próximo Sorteio
                  </div>
                  <Clock className="h-4 w-4 text-accent-success" />
                </div>
                <div className="text-2xl font-bold text-foreground">{calculateDaysRemaining()}</div>
                <p className="text-xs text-foreground-muted">
                  dias restantes
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Estatísticas */}
          <Card>
            <CardHeader>
              <CardTitle>Estatísticas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-foreground-muted">Status</span>
                  <Badge className={getStatusColor(formData.status)}>
                    {getStatusText(formData.status)}
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-foreground-muted">Progresso</span>
                  <span className="text-sm font-medium">{progress.toFixed(1)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-foreground-muted">Bilhetes Restantes</span>
                  <span className="text-sm font-medium">{formData.totalTickets - formData.soldTickets}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-foreground-muted">Receita Estimada</span>
                  <span className="text-sm font-medium">
                    R$ {(formData.soldTickets * formData.ticketPrice).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-foreground-muted">Dias Restantes</span>
                  <span className="text-sm font-medium">{calculateDaysRemaining()} dias</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Imagem */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Image className="w-5 h-5 mr-2 text-indigo-500" />
                Imagem do Prêmio
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="image">URL da Imagem</Label>
                <Input
                  id="image"
                  value={formData.image}
                  onChange={(e) => handleInputChange('image', e.target.value)}
                  placeholder="https://exemplo.com/imagem.jpg"
                />
              </div>
              {formData.image && (
                <div className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center">
                  <img 
                    src={formData.image} 
                    alt="Preview do prêmio"
                    className="max-w-full max-h-full object-contain rounded-lg"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default NextDrawManagement;