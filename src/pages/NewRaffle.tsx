import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { 
  CalendarIcon, 
  Upload, 
  Plus, 
  X, 
  Save, 
  ArrowLeft,
  Trophy,
  DollarSign,
  Users,
  Clock,
  Camera,
  Image as ImageIcon,
  Building
} from "lucide-react";
import { cn } from "@/lib/utils";

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
  "Dinheiro",
  "Viagens",
  "Outros"
];

const statusOptions = [
  { value: "draft", label: "Rascunho", color: "bg-gray-500" },
  { value: "active", label: "Ativa", color: "bg-green-500" },
  { value: "paused", label: "Pausada", color: "bg-yellow-500" },
  { value: "finished", label: "Finalizada", color: "bg-blue-500" }
];

export default function NewRaffle() {
  const navigate = useNavigate();
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

  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const maxImages = 4;
  
  const [institutionLogo, setInstitutionLogo] = useState<File | null>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);

  const handleInputChange = (field: keyof RaffleFormData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    const remainingSlots = maxImages - selectedImages.length;
    const filesToAdd = files.slice(0, remainingSlots);
    
    setSelectedImages(prev => [...prev, ...filesToAdd]);
    
    // Convert files to URLs for display
    const newImageUrls = filesToAdd.map(file => URL.createObjectURL(file));
    handleInputChange("images", [...formData.images, ...newImageUrls]);
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setInstitutionLogo(file);
      const logoUrl = URL.createObjectURL(file);
      setFormData(prev => ({
        ...prev,
        institution: {
          ...prev.institution,
          logo: logoUrl
        }
      }));
    }
  };

  const triggerLogoInput = () => {
    logoInputRef.current?.click();
  };

  const removeInstitutionLogo = () => {
    if (formData.institution.logo) {
      URL.revokeObjectURL(formData.institution.logo);
    }
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
    const newImages = formData.images.filter((_, i) => i !== index);
    const newSelectedImages = selectedImages.filter((_, i) => i !== index);
    
    // Revoke object URL to prevent memory leaks
    if (formData.images[index]) {
      URL.revokeObjectURL(formData.images[index]);
    }
    
    handleInputChange("images", newImages);
    setSelectedImages(newSelectedImages);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validações básicas
    if (!formData.title || !formData.prize || !formData.ticketPrice || !formData.totalTickets) {
      alert("Por favor, preencha todos os campos obrigatórios.");
      return;
    }

    // Simular salvamento
    console.log("Dados da rifa:", formData);
    alert("Rifa criada com sucesso!");
    navigate("/admin/rifas");
  };

  const calculateRevenue = () => {
    const price = parseFloat(formData.ticketPrice) || 0;
    const tickets = parseInt(formData.totalTickets) || 0;
    return price * tickets;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/admin/rifas")}
            className="flex items-center space-x-2"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Voltar</span>
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-foreground">Nova Rifa</h1>
            <p className="text-foreground-muted">Crie uma nova rifa com todos os detalhes</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button variant="outline" onClick={() => navigate("/admin/rifas")}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit} className="flex items-center space-x-2">
            <Save className="h-4 w-4" />
            <span>Salvar Rifa</span>
          </Button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Coluna Principal */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Informações Básicas */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Trophy className="h-5 w-5" />
                <span>Informações Básicas</span>
              </CardTitle>
              <CardDescription>
                Defina as informações principais da rifa
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Título da Rifa *</Label>
                  <Input
                    id="title"
                    placeholder="Ex: iPhone 15 Pro Max"
                    value={formData.title}
                    onChange={(e) => handleInputChange("title", e.target.value)}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="category">Categoria</Label>
                  <Select value={formData.category} onValueChange={(value) => handleInputChange("category", value)}>
                    <SelectTrigger>
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
                <Label htmlFor="description">Descrição</Label>
                <Textarea
                  id="description"
                  placeholder="Descreva os detalhes do prêmio..."
                  value={formData.description}
                  onChange={(e) => handleInputChange("description", e.target.value)}
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="prize">Prêmio *</Label>
                  <Input
                    id="prize"
                    placeholder="Ex: iPhone 15 Pro Max 256GB"
                    value={formData.prize}
                    onChange={(e) => handleInputChange("prize", e.target.value)}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="prizeValue">Valor do Prêmio (R$)</Label>
                  <Input
                    id="prizeValue"
                    type="number"
                    step="0.01"
                    placeholder="0,00"
                    value={formData.prizeValue}
                    onChange={(e) => handleInputChange("prizeValue", e.target.value)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Configurações da Rifa */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <DollarSign className="h-5 w-5" />
                <span>Configurações da Rifa</span>
              </CardTitle>
              <CardDescription>
                Configure preços, números e regras
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="ticketPrice">Preço do Bilhete (R$) *</Label>
                  <Input
                    id="ticketPrice"
                    type="number"
                    step="0.01"
                    placeholder="0,00"
                    value={formData.ticketPrice}
                    onChange={(e) => handleInputChange("ticketPrice", e.target.value)}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="totalTickets">Total de Números *</Label>
                  <Input
                    id="totalTickets"
                    type="number"
                    placeholder="Ex: 1000"
                    value={formData.totalTickets}
                    onChange={(e) => handleInputChange("totalTickets", e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="drawDate">Data do Sorteio</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !formData.drawDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {formData.drawDate ? (
                          format(formData.drawDate, "PPP", { locale: ptBR })
                        ) : (
                          <span>Selecione uma data</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={formData.drawDate}
                        onSelect={(date) => handleInputChange("drawDate", date)}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>

              <Separator />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="maxTicketsPerPerson">Máx. Bilhetes por Pessoa</Label>
                  <Input
                    id="maxTicketsPerPerson"
                    type="number"
                    placeholder="Ex: 10 (deixe vazio para ilimitado)"
                    value={formData.maxTicketsPerPerson}
                    onChange={(e) => handleInputChange("maxTicketsPerPerson", e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="minTicketsToStart">Mín. para Iniciar Sorteio</Label>
                  <Input
                    id="minTicketsToStart"
                    type="number"
                    placeholder="Ex: 100"
                    value={formData.minTicketsToStart}
                    onChange={(e) => handleInputChange("minTicketsToStart", e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Numeração Automática</Label>
                    <p className="text-sm text-foreground-muted">
                      Gerar números automaticamente para os participantes
                    </p>
                  </div>
                  <Switch
                    checked={formData.autoNumbers}
                    onCheckedChange={(checked) => handleInputChange("autoNumbers", checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Permitir Múltiplas Compras</Label>
                    <p className="text-sm text-foreground-muted">
                      Permitir que uma pessoa compre vários bilhetes
                    </p>
                  </div>
                  <Switch
                    checked={formData.allowMultiplePurchases}
                    onCheckedChange={(checked) => handleInputChange("allowMultiplePurchases", checked)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Imagens */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <ImageIcon className="h-5 w-5" />
                <span>Imagens do Prêmio</span>
              </CardTitle>
              <CardDescription>
                Adicione até {maxImages} imagens para tornar a rifa mais atrativa
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageUpload}
                className="hidden"
              />
              
              <div className="flex flex-col space-y-4">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={triggerFileInput}
                  disabled={selectedImages.length >= maxImages}
                  className="flex items-center space-x-2 h-20 border-dashed"
                >
                  <div className="flex flex-col items-center space-y-2">
                    <div className="flex items-center space-x-2">
                      <Camera className="h-5 w-5" />
                      <Upload className="h-5 w-5" />
                    </div>
                    <span>
                      {selectedImages.length >= maxImages 
                        ? `Máximo de ${maxImages} imagens atingido`
                        : `Clique para adicionar imagens (${selectedImages.length}/${maxImages})`
                      }
                    </span>
                  </div>
                </Button>

                {formData.images.length > 0 && (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {formData.images.map((image, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={image}
                          alt={`Imagem ${index + 1}`}
                          className="w-full h-24 object-cover rounded-lg border"
                        />
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          className="absolute top-1 right-1 h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => removeImage(index)}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                        <div className="absolute bottom-1 left-1 bg-black bg-opacity-50 text-white text-xs px-1 rounded">
                          {index + 1}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Instituição */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Building className="h-5 w-5" />
                <span>Instituição (Opcional)</span>
              </CardTitle>
              <CardDescription>
                Adicione informações da instituição responsável pela rifa
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="institutionName">Nome da Instituição</Label>
                <Input
                  id="institutionName"
                  placeholder="Ex: Instituto Beneficente ABC"
                  value={formData.institution.name}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    institution: {
                      ...prev.institution,
                      name: e.target.value
                    }
                  }))}
                />
              </div>

              {formData.institution.name && (
                <div className="space-y-4">
                  <Separator />
                  
                  <div className="space-y-2">
                    <Label>Logo da Instituição</Label>
                    <p className="text-sm text-foreground-muted">
                      Adicione o logo da instituição (opcional)
                    </p>
                  </div>

                  <input
                    ref={logoInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleLogoUpload}
                    className="hidden"
                  />

                  <div className="flex flex-col space-y-4">
                    {!formData.institution.logo ? (
                      <Button 
                        type="button" 
                        variant="outline" 
                        onClick={triggerLogoInput}
                        className="flex items-center space-x-2 h-20 border-dashed"
                      >
                        <div className="flex flex-col items-center space-y-2">
                          <div className="flex items-center space-x-2">
                            <Building className="h-5 w-5" />
                            <Upload className="h-5 w-5" />
                          </div>
                          <span>Clique para adicionar logo</span>
                        </div>
                      </Button>
                    ) : (
                      <div className="relative group w-32 h-32">
                        <img
                          src={formData.institution.logo}
                          alt="Logo da instituição"
                          className="w-full h-full object-contain rounded-lg border bg-white"
                        />
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          className="absolute top-1 right-1 h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={removeInstitutionLogo}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Regras */}
          <Card>
            <CardHeader>
              <CardTitle>Regras e Termos</CardTitle>
              <CardDescription>
                Defina as regras específicas desta rifa
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea
                placeholder="Digite as regras da rifa..."
                value={formData.rules}
                onChange={(e) => handleInputChange("rules", e.target.value)}
                rows={4}
              />
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          
          {/* Status */}
          <Card>
            <CardHeader>
              <CardTitle>Status da Rifa</CardTitle>
            </CardHeader>
            <CardContent>
              <Select value={formData.status} onValueChange={(value) => handleInputChange("status", value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {statusOptions.map((status) => (
                    <SelectItem key={status.value} value={status.value}>
                      <div className="flex items-center space-x-2">
                        <div className={`w-2 h-2 rounded-full ${status.color}`} />
                        <span>{status.label}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          {/* Resumo Financeiro */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <DollarSign className="h-5 w-5" />
                <span>Resumo Financeiro</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-foreground-muted">Preço por bilhete:</span>
                  <span className="font-medium">
                    R$ {parseFloat(formData.ticketPrice || "0").toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-foreground-muted">Total de números:</span>
                  <span className="font-medium">{formData.totalTickets || "0"}</span>
                </div>
                <Separator />
                <div className="flex justify-between">
                  <span className="text-sm font-medium">Receita máxima:</span>
                  <span className="font-bold text-green-600">
                    R$ {calculateRevenue().toFixed(2)}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Estatísticas Rápidas */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Users className="h-5 w-5" />
                <span>Previsões</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center space-y-2">
                <div className="text-2xl font-bold text-primary">
                  {formData.totalTickets || "0"}
                </div>
                <p className="text-sm text-foreground-muted">Números disponíveis</p>
              </div>
              
              {formData.drawDate && (
                <div className="text-center space-y-2">
                  <div className="text-lg font-semibold text-foreground">
                    <Clock className="h-4 w-4 inline mr-1" />
                    {format(formData.drawDate, "dd/MM/yyyy", { locale: ptBR })}
                  </div>
                  <p className="text-sm text-foreground-muted">Data do sorteio</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </form>
    </div>
  );
}