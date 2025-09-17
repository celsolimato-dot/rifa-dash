import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useTestimonials, Testimonial } from "@/contexts/TestimonialsContext";
import { 
  Plus, 
  Edit, 
  Trash2, 
  Star, 
  Trophy, 
  Calendar,
  DollarSign,
  Eye,
  Save,
  X
} from "lucide-react";

const TestimonialsManagement = () => {
  const { testimonials, addTestimonial, updateTestimonial, deleteTestimonial } = useTestimonials();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTestimonial, setEditingTestimonial] = useState<Testimonial | null>(null);
  const [formData, setFormData] = useState<Partial<Testimonial>>({});

  const handleEdit = (testimonial: Testimonial) => {
    setEditingTestimonial(testimonial);
    setFormData(testimonial);
    setIsDialogOpen(true);
  };

  const handleCreate = () => {
    setEditingTestimonial(null);
    setFormData({
      name: "",
      prize: "",
      prizeValue: "",
      date: new Date().toLocaleDateString('pt-BR'),
      image: "/placeholder.svg",
      raffleTitle: "",
      winningNumber: "",
      type: "car",
      testimonial: ""
    });
    setIsDialogOpen(true);
  };

  const handleSave = () => {
    if (editingTestimonial) {
      // Editar depoimento existente
      updateTestimonial(editingTestimonial.id, formData);
    } else {
      // Criar novo depoimento
      addTestimonial(formData as Omit<Testimonial, 'id'>);
    }
    setIsDialogOpen(false);
    setFormData({});
  };

  const handleDelete = (id: number) => {
    if (confirm("Tem certeza que deseja excluir este depoimento?")) {
      deleteTestimonial(id);
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "car":
      case "motorcycle":
        return <Trophy className="w-4 h-4 text-accent-gold" />;
      case "money":
      case "combo":
        return <DollarSign className="w-4 h-4 text-accent-success" />;
      default:
        return <Star className="w-4 h-4 text-primary" />;
    }
  };

  const getTypeBadgeColor = (type: string) => {
    switch (type) {
      case "car":
      case "motorcycle":
        return "gold";
      case "money":
      case "combo":
        return "success";
      default:
        return "default";
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Gerenciar Depoimentos</h1>
          <p className="text-foreground-muted">Gerencie os depoimentos dos ganhadores que aparecem na seção "Ganhadores Recentes"</p>
        </div>
        <Button onClick={handleCreate} className="bg-primary hover:bg-primary/90">
          <Plus className="w-4 h-4 mr-2" />
          Novo Depoimento
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-foreground-muted">Total de Depoimentos</p>
                <p className="text-2xl font-bold text-foreground">{testimonials.length}</p>
              </div>
              <Star className="w-8 h-8 text-accent-gold" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-foreground-muted">Com Depoimento</p>
                <p className="text-2xl font-bold text-foreground">
                  {testimonials.filter(t => t.testimonial).length}
                </p>
              </div>
              <Trophy className="w-8 h-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-foreground-muted">Sem Depoimento</p>
                <p className="text-2xl font-bold text-foreground">
                  {testimonials.filter(t => !t.testimonial).length}
                </p>
              </div>
              <Calendar className="w-8 h-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Testimonials List */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Depoimentos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {testimonials.map((testimonial) => (
              <div key={testimonial.id} className="border border-border rounded-lg p-4 hover:bg-background-secondary/50 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center space-x-3">
                      {getTypeIcon(testimonial.type)}
                      <h3 className="font-semibold text-foreground">{testimonial.name}</h3>
                      <Badge variant={getTypeBadgeColor(testimonial.type) as any}>
                        {testimonial.raffleTitle}
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-foreground-muted">
                      <div>
                        <span className="font-medium">Prêmio:</span> {testimonial.prize}
                      </div>
                      <div>
                        <span className="font-medium">Valor:</span> {testimonial.prizeValue}
                      </div>
                      <div>
                        <span className="font-medium">Data:</span> {testimonial.date}
                      </div>
                    </div>
                    
                    <div className="text-sm text-foreground-muted">
                      <span className="font-medium">Número Sorteado:</span> {testimonial.winningNumber}
                    </div>
                    
                    {testimonial.testimonial && (
                      <div className="bg-background-secondary p-3 rounded-lg mt-3">
                        <p className="text-sm text-foreground italic">"{testimonial.testimonial}"</p>
                      </div>
                    )}
                    
                    {!testimonial.testimonial && (
                      <div className="text-sm text-orange-500 font-medium">
                        Sem depoimento cadastrado
                      </div>
                    )}
                  </div>
                  
                  <div className="flex items-center space-x-2 ml-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(testimonial)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(testimonial.id)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Dialog for Create/Edit */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingTestimonial ? "Editar Depoimento" : "Novo Depoimento"}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nome do Ganhador</Label>
                <Input
                  id="name"
                  value={formData.name || ""}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Ex: Maria Silva"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="raffleTitle">Título da Rifa</Label>
                <Input
                  id="raffleTitle"
                  value={formData.raffleTitle || ""}
                  onChange={(e) => setFormData(prev => ({ ...prev, raffleTitle: e.target.value }))}
                  placeholder="Ex: Carro dos Sonhos"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="prize">Prêmio</Label>
                <Input
                  id="prize"
                  value={formData.prize || ""}
                  onChange={(e) => setFormData(prev => ({ ...prev, prize: e.target.value }))}
                  placeholder="Ex: Civic Sport 2024"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="prizeValue">Valor do Prêmio</Label>
                <Input
                  id="prizeValue"
                  value={formData.prizeValue || ""}
                  onChange={(e) => setFormData(prev => ({ ...prev, prizeValue: e.target.value }))}
                  placeholder="Ex: R$ 120.000"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="winningNumber">Número Sorteado</Label>
                <Input
                  id="winningNumber"
                  value={formData.winningNumber || ""}
                  onChange={(e) => setFormData(prev => ({ ...prev, winningNumber: e.target.value }))}
                  placeholder="Ex: 1234"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="date">Data do Sorteio</Label>
                <Input
                  id="date"
                  value={formData.date || ""}
                  onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                  placeholder="Ex: 15/12/2024"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="type">Tipo do Prêmio</Label>
                <Select
                  value={formData.type || "car"}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, type: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="car">Carro</SelectItem>
                    <SelectItem value="motorcycle">Moto</SelectItem>
                    <SelectItem value="money">Dinheiro</SelectItem>
                    <SelectItem value="combo">Combo</SelectItem>
                    <SelectItem value="tech">Tecnologia</SelectItem>
                    <SelectItem value="entertainment">Entretenimento</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="testimonial">Depoimento (Opcional)</Label>
              <Textarea
                id="testimonial"
                value={formData.testimonial || ""}
                onChange={(e) => setFormData(prev => ({ ...prev, testimonial: e.target.value }))}
                placeholder="Digite o depoimento do ganhador..."
                rows={4}
              />
            </div>
            
            <div className="flex justify-end space-x-2 pt-4">
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                <X className="w-4 h-4 mr-2" />
                Cancelar
              </Button>
              <Button onClick={handleSave}>
                <Save className="w-4 h-4 mr-2" />
                Salvar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TestimonialsManagement;