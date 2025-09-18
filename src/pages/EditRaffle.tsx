import { useState, useRef, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, Upload, X, ArrowLeft, Save, Building2 } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { RealRaffleService, type Raffle } from "@/services/realRaffleService";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface RaffleFormData {
  title: string;
  description: string;
  prize: string;
  prizeValue: string;
  ticketPrice: string;
  totalTickets: string;
  drawDate: Date | undefined;
  status: string;
  category: string;
  images: string[];
  rules: string;
  autoNumbers: boolean;
  allowMultiplePurchases: boolean;
  maxTicketsPerPerson: string;
  minTicketsToStart: string;
  institution: {
    name: string;
    logo: string;
  };
}

const categories = [
  "Eletrônicos",
  "Veículos", 
  "Casa e Decoração",
  "Viagem",
  "Dinheiro",
  "Outros"
];

const statusOptions = [
  { value: "draft", label: "Rascunho", color: "bg-gray-500" },
  { value: "active", label: "Ativa", color: "bg-green-500" },
  { value: "paused", label: "Pausada", color: "bg-yellow-500" },
  { value: "completed", label: "Finalizada", color: "bg-blue-500" },
];

export default function EditRaffle() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [loading, setLoading] = useState(true);
  
  const [formData, setFormData] = useState<RaffleFormData>({
    title: "",
    description: "",
    prize: "",
    prizeValue: "",
    ticketPrice: "",
    totalTickets: "",
    drawDate: undefined,
    status: "draft",
    category: "",
    images: [],
    rules: "",
    autoNumbers: true,
    allowMultiplePurchases: true,
    maxTicketsPerPerson: "",
    minTicketsToStart: "",
    institution: {
      name: "",
      logo: ""
    }
  });

  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [institutionLogo, setInstitutionLogo] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    async function loadRaffle() {
      if (!id) {
        setLoading(false);
        return;
      }

      try {
        const raffle = await RealRaffleService.getRaffleById(id);
        if (raffle) {
          setFormData({
            title: raffle.title,
            description: raffle.description || "",
            prize: raffle.prize,
            prizeValue: raffle.prize_value.toString(),
            ticketPrice: raffle.ticket_price.toString(),
            totalTickets: raffle.total_tickets.toString(),
            drawDate: new Date(raffle.draw_date),
            status: raffle.status,
            category: raffle.category,
            images: raffle.image_url ? [raffle.image_url] : [],
            rules: "",
            autoNumbers: true,
            allowMultiplePurchases: true,
            maxTicketsPerPerson: "",
            minTicketsToStart: "",
            institution: {
              name: raffle.institution_name || "",
              logo: raffle.institution_logo || ""
            }
          });
          setSelectedImages(raffle.image_url ? [raffle.image_url] : []);
        } else {
          toast.error('Rifa não encontrada');
          navigate('/admin/rifas');
        }
      } catch (error) {
        console.error('Error loading raffle:', error);
        toast.error('Erro ao carregar dados da rifa');
        navigate('/admin/rifas');
      } finally {
        setLoading(false);
      }
    }

    loadRaffle();
  }, [id, navigate]);

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const uploadImageToStorage = async (file: File): Promise<string | null> => {
    const fileExt = file.name.split('.').pop();
    const filePath = `raffle-images/${Date.now()}.${fileExt}`;

    const { data, error } = await supabase.storage
      .from('raffle-images')
      .upload(filePath, file);

    if (error) {
      console.error('Error uploading image:', error);
      return null;
    }

    const { data: { publicUrl } } = supabase.storage
      .from('raffle-images')
      .getPublicUrl(filePath);

    return publicUrl;
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    setUploadingImage(true);
    
    try {
      const uploadPromises = Array.from(files).map(file => uploadImageToStorage(file));
      const uploadedUrls = await Promise.all(uploadPromises);
      const validUrls = uploadedUrls.filter(Boolean) as string[];
      
      if (validUrls.length > 0) {
        setSelectedImages(prev => [...prev, ...validUrls]);
        setFormData(prev => ({
          ...prev,
          images: [...prev.images, ...validUrls]
        }));
        toast.success(`${validUrls.length} imagem(ns) adicionada(s) com sucesso!`);
      }
    } catch (error) {
      console.error('Error uploading images:', error);
      toast.error('Erro ao fazer upload das imagens');
    } finally {
      setUploadingImage(false);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const handleLogoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    
    try {
      const uploadedUrl = await uploadImageToStorage(file);
      if (uploadedUrl) {
        setInstitutionLogo(file);
        setFormData(prev => ({
          ...prev,
          institution: {
            ...prev.institution,
            logo: uploadedUrl
          }
        }));
        toast.success("Logo da instituição adicionado com sucesso!");
      }
    } catch (error) {
      console.error('Error uploading logo:', error);
      toast.error('Erro ao fazer upload do logo');
    } finally {
      setUploadingImage(false);
    }
  };

  const triggerLogoInput = () => {
    logoInputRef.current?.click();
  };

  const removeInstitutionLogo = () => {
    setInstitutionLogo(null);
    setFormData(prev => ({
      ...prev,
      institution: {
        ...prev.institution,
        logo: ""
      }
    }));
  };

  const removeImage = (index: number) => {
    setSelectedImages(prev => prev.filter((_, i) => i !== index));
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validação básica
    if (!formData.title || !formData.prize || !formData.ticketPrice || !formData.totalTickets) {
      toast.error("Por favor, preencha todos os campos obrigatórios.");
      return;
    }

    if (!id) {
      toast.error("ID da rifa não encontrado.");
      return;
    }

    if (!formData.drawDate) {
      toast.error("Por favor, selecione a data do sorteio.");
      return;
    }

    try {
      const raffleData = {
        title: formData.title,
        description: formData.description,
        prize: formData.prize,
        prize_value: parseFloat(formData.prizeValue) || 0,
        ticket_price: parseFloat(formData.ticketPrice),
        total_tickets: parseInt(formData.totalTickets),
        draw_date: formData.drawDate.toISOString(),
        status: formData.status,
        category: formData.category,
        image_url: formData.images[0] || null,
        institution_name: formData.institution.name || null,
        institution_logo: formData.institution.logo || null,
      };

      await RealRaffleService.updateRaffle(id, raffleData);
      toast.success("Rifa atualizada com sucesso!");
      navigate("/admin/rifas");
    } catch (error) {
      console.error('Error updating raffle:', error);
      toast.error('Erro ao atualizar rifa');
    }
  };

  const calculateRevenue = () => {
    const price = parseFloat(formData.ticketPrice) || 0;
    const total = parseInt(formData.totalTickets) || 0;
    return price * total;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-foreground-muted">Carregando dados da rifa...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              onClick={() => navigate("/admin/rifas")}
              className="text-foreground-muted hover:text-foreground"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar para Rifas
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-foreground">Editar Rifa</h1>
              <p className="text-foreground-muted">Modifique os detalhes da sua rifa</p>
            </div>
          </div>
          <Button onClick={handleSubmit} className="bg-primary hover:bg-primary/90">
            <Save className="w-4 h-4 mr-2" />
            Salvar Alterações
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Coluna Principal */}
          <div className="lg:col-span-2 space-y-8">
            {/* Informações Básicas */}
            <Card className="bg-gradient-card border-border">
              <CardHeader>
                <CardTitle className="text-foreground">Informações Básicas</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="title" className="text-foreground">Título da Rifa *</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => handleInputChange("title", e.target.value)}
                      placeholder="Ex: iPhone 15 Pro Max"
                      className="bg-background border-border text-foreground"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="category" className="text-foreground">Categoria *</Label>
                    <Select value={formData.category} onValueChange={(value) => handleInputChange("category", value)}>
                      <SelectTrigger className="bg-background border-border text-foreground">
                        <SelectValue placeholder="Selecione uma categoria" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((category) => (
                          <SelectItem key={category} value={category}>
                            {category}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description" className="text-foreground">Descrição</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => handleInputChange("description", e.target.value)}
                    placeholder="Descreva os detalhes da sua rifa..."
                    rows={3}
                    className="bg-background border-border text-foreground"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="prize" className="text-foreground">Prêmio *</Label>
                    <Input
                      id="prize"
                      value={formData.prize}
                      onChange={(e) => handleInputChange("prize", e.target.value)}
                      placeholder="Ex: iPhone 15 Pro Max 256GB"
                      className="bg-background border-border text-foreground"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="prizeValue" className="text-foreground">Valor do Prêmio (R$)</Label>
                    <Input
                      id="prizeValue"
                      type="number"
                      step="0.01"
                      value={formData.prizeValue}
                      onChange={(e) => handleInputChange("prizeValue", e.target.value)}
                      placeholder="0.00"
                      className="bg-background border-border text-foreground"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Configurações da Rifa */}
            <Card className="bg-gradient-card border-border">
              <CardHeader>
                <CardTitle className="text-foreground">Configurações da Rifa</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="ticketPrice" className="text-foreground">Preço do Bilhete (R$) *</Label>
                    <Input
                      id="ticketPrice"
                      type="number"
                      step="0.01"
                      value={formData.ticketPrice}
                      onChange={(e) => handleInputChange("ticketPrice", e.target.value)}
                      placeholder="0.00"
                      className="bg-background border-border text-foreground"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="totalTickets" className="text-foreground">Total de Números *</Label>
                    <Input
                      id="totalTickets"
                      type="number"
                      value={formData.totalTickets}
                      onChange={(e) => handleInputChange("totalTickets", e.target.value)}
                      placeholder="1000"
                      className="bg-background border-border text-foreground"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="drawDate" className="text-foreground">Data do Sorteio *</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal bg-background border-border text-foreground",
                            !formData.drawDate && "text-foreground-muted"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {formData.drawDate ? format(formData.drawDate, "dd/MM/yyyy") : "Selecionar data"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={formData.drawDate}
                          onSelect={(date) => handleInputChange("drawDate", date)}
                          initialFocus
                          disabled={(date) => date < new Date()}
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Imagens */}
            <Card className="bg-gradient-card border-border">
              <CardHeader>
                <CardTitle className="text-foreground">Imagens da Rifa</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {selectedImages.map((image, index) => (
                    <div key={index} className="relative group">
                      <div className="aspect-square bg-background-secondary rounded-lg overflow-hidden">
                        <img 
                          src={image} 
                          alt={`Imagem ${index + 1}`}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                            e.currentTarget.nextElementSibling?.classList.remove('hidden');
                          }}
                        />
                        <div className="hidden flex items-center justify-center w-full h-full bg-background-secondary">
                          <p className="text-foreground-muted text-sm">Imagem não encontrada</p>
                        </div>
                      </div>
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => removeImage(index)}
                      >
                        <X className="w-3 h-3" />
                      </Button>
                    </div>
                  ))}
                </div>
                
                <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
                  <Upload className="w-8 h-8 text-foreground-muted mx-auto mb-2" />
                  <p className="text-foreground-muted mb-4">Adicione imagens da sua rifa</p>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={triggerFileInput}
                    disabled={uploadingImage}
                    className="w-full"
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    {uploadingImage ? "Enviando..." : "Adicionar Imagens"}
                  </Button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Instituição */}
            <Card className="bg-gradient-card border-border">
              <CardHeader>
                <CardTitle className="text-foreground flex items-center">
                  <Building2 className="w-5 h-5 mr-2" />
                  Informações da Instituição
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="institutionName" className="text-foreground">Nome da Instituição</Label>
                  <Input
                    id="institutionName"
                    value={formData.institution.name}
                    onChange={(e) => handleInputChange("institution", { ...formData.institution, name: e.target.value })}
                    placeholder="Ex: Instituto Beneficente ABC"
                    className="bg-background border-border text-foreground"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-foreground">Logo da Instituição</Label>
                  {formData.institution.logo ? (
                    <div className="relative inline-block">
                      <img 
                        src={formData.institution.logo} 
                        alt="Logo da instituição" 
                        className="w-32 h-32 object-cover rounded-lg"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                          e.currentTarget.nextElementSibling?.classList.remove('hidden');
                        }}
                      />
                      <div className="hidden w-32 h-32 bg-background-secondary rounded-lg flex items-center justify-center">
                        <p className="text-foreground-muted text-sm">Logo não encontrada</p>
                      </div>
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        className="absolute top-2 right-2"
                        onClick={removeInstitutionLogo}
                      >
                        <X className="w-3 h-3" />
                      </Button>
                    </div>
                  ) : (
                    <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
                      <Building2 className="w-8 h-8 text-foreground-muted mx-auto mb-2" />
                      <p className="text-foreground-muted mb-4">Adicione o logo da instituição</p>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={triggerLogoInput}
                        disabled={uploadingImage}
                        className="w-full"
                      >
                        <Upload className="w-4 h-4 mr-2" />
                        {uploadingImage ? "Enviando..." : "Selecionar Logo"}
                      </Button>
                      <input
                        ref={logoInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleLogoUpload}
                        className="hidden"
                      />
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Status */}
            <Card className="bg-gradient-card border-border">
              <CardHeader>
                <CardTitle className="text-foreground">Status da Rifa</CardTitle>
              </CardHeader>
              <CardContent>
                <Select value={formData.status} onValueChange={(value) => handleInputChange("status", value)}>
                  <SelectTrigger className="bg-background border-border text-foreground">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {statusOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        <div className="flex items-center space-x-2">
                          <div className={`w-2 h-2 rounded-full ${option.color}`} />
                          <span>{option.label}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </CardContent>
            </Card>

            {/* Resumo Financeiro */}
            <Card className="bg-gradient-card border-border">
              <CardHeader>
                <CardTitle className="text-foreground">Resumo Financeiro</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-foreground-muted">Receita Potencial:</span>
                  <span className="font-semibold text-foreground">
                    R$ {calculateRevenue().toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-foreground-muted">Preço por Bilhete:</span>
                  <span className="font-semibold text-foreground">
                    R$ {parseFloat(formData.ticketPrice || "0").toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-foreground-muted">Total de Números:</span>
                  <span className="font-semibold text-foreground">
                    {parseInt(formData.totalTickets || "0").toLocaleString('pt-BR')}
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Ações */}
            <Card className="bg-gradient-card border-border">
              <CardHeader>
                <CardTitle className="text-foreground">Ações</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button 
                  type="submit" 
                  className="w-full bg-primary hover:bg-primary/90"
                  disabled={uploadingImage}
                >
                  <Save className="w-4 h-4 mr-2" />
                  {uploadingImage ? "Processando..." : "Salvar Alterações"}
                </Button>
                <Button 
                  type="button"
                  variant="outline" 
                  className="w-full" 
                  onClick={() => navigate("/admin/rifas")}
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Cancelar
                </Button>
              </CardContent>
            </Card>
          </div>
        </form>
      </div>
    </div>
  );
}