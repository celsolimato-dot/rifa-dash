import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { RealTestimonialService, Testimonial } from "../services/realTestimonialService";
import { 
  Star, 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  Users, 
  CheckCircle, 
  XCircle, 
  Clock,
  Trophy,
  Search
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const testimonialService = new RealTestimonialService();

export default function TestimonialsManagement() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [editingTestimonial, setEditingTestimonial] = useState<Testimonial | null>(null);
  const [formData, setFormData] = useState<Partial<Testimonial>>({});
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadTestimonials();
  }, []);

  const handleCreate = () => {
    setEditingTestimonial(null);
    setFormData({
      content: "",
      rating: 5,
      type: "general",
      status: "pending",
      winning_number: "",
    });
    setIsDialogOpen(true);
  };

  const loadTestimonials = async () => {
    try {
      setIsLoading(true);
      const data = await testimonialService.getAllTestimonials();
      setTestimonials(data);
    } catch (error) {
      console.error('Erro ao carregar depoimentos:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os depoimentos.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateOrUpdate = async () => {
    try {
      if (editingTestimonial) {
        await testimonialService.updateTestimonial(editingTestimonial.id, formData);
        toast({
          title: "Sucesso",
          description: "Depoimento atualizado com sucesso!",
        });
      } else {
        await testimonialService.createTestimonial(formData as any);
        toast({
          title: "Sucesso", 
          description: "Depoimento criado com sucesso!",
        });
      }
      setIsDialogOpen(false);
      loadTestimonials();
    } catch (error) {
      console.error('Erro ao salvar depoimento:', error);
      toast({
        title: "Erro",
        description: "Não foi possível salvar o depoimento.",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (testimonial: Testimonial) => {
    setEditingTestimonial(testimonial);
    setFormData(testimonial);
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Tem certeza que deseja excluir este depoimento?')) {
      try {
        await testimonialService.deleteTestimonial(id);
        toast({
          title: "Sucesso",
          description: "Depoimento excluído com sucesso!",
        });
        loadTestimonials();
      } catch (error) {
        console.error('Erro ao excluir depoimento:', error);
        toast({
          title: "Erro",
          description: "Não foi possível excluir o depoimento.",
          variant: "destructive",
        });
      }
    }
  };

  const handleApprove = async (id: string) => {
    try {
      await testimonialService.approveTestimonial(id);
      toast({
        title: "Sucesso",
        description: "Depoimento aprovado com sucesso!",
      });
      loadTestimonials();
    } catch (error) {
      console.error('Erro ao aprovar depoimento:', error);
      toast({
        title: "Erro",
        description: "Não foi possível aprovar o depoimento.",
        variant: "destructive",
      });
    }
  };

  const handleReject = async (id: string) => {
    try {
      await testimonialService.rejectTestimonial(id);
      toast({
        title: "Sucesso",
        description: "Depoimento rejeitado com sucesso!",
      });
      loadTestimonials();
    } catch (error) {
      console.error('Erro ao rejeitar depoimento:', error);
      toast({
        title: "Erro",
        description: "Não foi possível rejeitar o depoimento.",
        variant: "destructive",
      });
    }
  };

  const filteredTestimonials = testimonials.filter(testimonial => {
    const matchesSearch = testimonial.content.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || testimonial.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    const variants = {
      pending: "bg-yellow-100 text-yellow-800",
      approved: "bg-green-100 text-green-800", 
      rejected: "bg-red-100 text-red-800"
    };

    const labels = {
      pending: "Pendente",
      approved: "Aprovado",
      rejected: "Rejeitado"
    };

    return (
      <Badge className={variants[status as keyof typeof variants]}>
        {labels[status as keyof typeof labels]}
      </Badge>
    );
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star 
        key={i} 
        className={`w-4 h-4 ${i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
      />
    ));
  };

  const stats = {
    total: testimonials.length,
    pending: testimonials.filter(t => t.status === 'pending').length,
    approved: testimonials.filter(t => t.status === 'approved').length,
    rejected: testimonials.filter(t => t.status === 'rejected').length
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Depoimentos</h1>
          <p className="text-foreground-muted">Gerencie todos os depoimentos dos ganhadores</p>
        </div>
        <Button onClick={handleCreate} className="bg-primary hover:bg-primary/90">
          <Plus className="w-4 h-4 mr-2" />
          Novo Depoimento
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-foreground-muted">Total</p>
                <p className="text-2xl font-bold text-foreground">{stats.total}</p>
              </div>
              <Trophy className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-foreground-muted">Pendentes</p>
                <p className="text-2xl font-bold text-foreground">{stats.pending}</p>
              </div>
              <Clock className="w-8 h-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-foreground-muted">Aprovados</p>
                <p className="text-2xl font-bold text-foreground">{stats.approved}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-foreground-muted">Rejeitados</p>
                <p className="text-2xl font-bold text-foreground">{stats.rejected}</p>
              </div>
              <XCircle className="w-8 h-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-foreground-muted w-4 h-4" />
                <Input
                  placeholder="Buscar por depoimento..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os Status</SelectItem>
                <SelectItem value="pending">Pendente</SelectItem>
                <SelectItem value="approved">Aprovado</SelectItem>
                <SelectItem value="rejected">Rejeitado</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Testimonials List */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Depoimentos ({filteredTestimonials.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">
              <p className="text-foreground-muted">Carregando depoimentos...</p>
            </div>
          ) : filteredTestimonials.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-foreground-muted">Nenhum depoimento encontrado.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredTestimonials.map((testimonial) => (
                <Card key={testimonial.id} className="bg-muted/30">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <div className="flex space-x-1">
                            {renderStars(testimonial.rating || 5)}
                          </div>
                          {getStatusBadge(testimonial.status)}
                        </div>
                        
                        <p className="text-foreground mb-3">{testimonial.content}</p>
                        
                        <div className="grid grid-cols-2 gap-4 text-sm text-foreground-muted">
                          {testimonial.winning_number && (
                            <div>
                              <span className="font-medium">Número Sorteado:</span>
                              <span className="ml-1">{testimonial.winning_number}</span>
                            </div>
                          )}
                          <div>
                            <span className="font-medium">Data:</span>
                            <span className="ml-1">
                              {new Date(testimonial.created_at).toLocaleDateString('pt-BR')}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex space-x-2 ml-4">
                        {testimonial.status === 'pending' && (
                          <>
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => handleApprove(testimonial.id)}
                              className="text-green-600 hover:text-green-700"
                            >
                              <CheckCircle className="w-4 h-4 mr-1" />
                              Aprovar
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => handleReject(testimonial.id)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <XCircle className="w-4 h-4 mr-1" />
                              Rejeitar
                            </Button>
                          </>
                        )}
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleEdit(testimonial)}
                        >
                          <Edit className="w-4 h-4 mr-1" />
                          Editar
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleDelete(testimonial.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4 mr-1" />
                          Excluir
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingTestimonial ? 'Editar Depoimento' : 'Novo Depoimento'}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-foreground-muted">Depoimento</label>
              <Textarea
                placeholder="Digite o conteúdo do depoimento..."
                value={formData.content || ''}
                onChange={(e) => setFormData({...formData, content: e.target.value})}
                rows={4}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-foreground-muted">Avaliação</label>
                <Select value={formData.rating?.toString()} onValueChange={(value) => setFormData({...formData, rating: parseInt(value)})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a avaliação" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1 Estrela</SelectItem>
                    <SelectItem value="2">2 Estrelas</SelectItem>
                    <SelectItem value="3">3 Estrelas</SelectItem>
                    <SelectItem value="4">4 Estrelas</SelectItem>
                    <SelectItem value="5">5 Estrelas</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium text-foreground-muted">Número Sorteado</label>
                <Input
                  placeholder="Número sorteado"
                  value={formData.winning_number || ''}
                  onChange={(e) => setFormData({...formData, winning_number: e.target.value})}
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-foreground-muted">Status</label>
              <Select value={formData.status} onValueChange={(value) => setFormData({...formData, status: value as any})}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pendente</SelectItem>
                  <SelectItem value="approved">Aprovado</SelectItem>
                  <SelectItem value="rejected">Rejeitado</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleCreateOrUpdate}>
                {editingTestimonial ? 'Atualizar' : 'Criar'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}