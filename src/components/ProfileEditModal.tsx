import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { 
  User, 
  Mail, 
  Phone, 
  CreditCard,
  Eye,
  EyeOff,
  Save,
  X,
  AlertCircle,
  CheckCircle
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

interface ProfileEditModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface ProfileForm {
  name: string;
  email: string;
  phone: string;
  cpf: string;
  currentPassword: string;
  newPassword: string;
  confirmNewPassword: string;
}

export const ProfileEditModal: React.FC<ProfileEditModalProps> = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const [profileForm, setProfileForm] = useState<ProfileForm>({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    cpf: (user as any)?.cpf || '',
    currentPassword: '',
    newPassword: '',
    confirmNewPassword: ''
  });

  const resetForm = () => {
    setProfileForm({
      name: user?.name || '',
      email: user?.email || '',
      phone: user?.phone || '',
      cpf: (user as any)?.cpf || '',
      currentPassword: '',
      newPassword: '',
      confirmNewPassword: ''
    });
    setError('');
    setSuccess('');
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const formatCPF = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    return numbers.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  };

  const formatPhone = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length <= 10) {
      return numbers.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
    }
    return numbers.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
  };

  const handleInputChange = (field: keyof ProfileForm, value: string) => {
    let formattedValue = value;
    
    if (field === 'cpf') {
      formattedValue = formatCPF(value);
    } else if (field === 'phone') {
      formattedValue = formatPhone(value);
    }

    setProfileForm(prev => ({
      ...prev,
      [field]: formattedValue
    }));
  };

  const validateForm = () => {
    if (!profileForm.name.trim()) {
      setError('Nome é obrigatório');
      return false;
    }

    if (!profileForm.email.trim()) {
      setError('Email é obrigatório');
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(profileForm.email)) {
      setError('Email inválido');
      return false;
    }

    if (!profileForm.phone.trim()) {
      setError('Telefone é obrigatório');
      return false;
    }

    if (!profileForm.cpf.trim()) {
      setError('CPF é obrigatório');
      return false;
    }

    // Se está tentando alterar a senha
    if (profileForm.newPassword || profileForm.confirmNewPassword) {
      if (!profileForm.currentPassword) {
        setError('Senha atual é obrigatória para alterar a senha');
        return false;
      }

      if (profileForm.newPassword.length < 6) {
        setError('Nova senha deve ter pelo menos 6 caracteres');
        return false;
      }

      if (profileForm.newPassword !== profileForm.confirmNewPassword) {
        setError('Nova senha e confirmação não coincidem');
        return false;
      }
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      // Simular chamada da API
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Em uma aplicação real, aqui seria feita a chamada para a API
      console.log('Dados do perfil atualizados:', profileForm);
      
      setSuccess('Perfil atualizado com sucesso!');
      
      // Fechar modal após 2 segundos
      setTimeout(() => {
        handleClose();
      }, 2000);
      
    } catch (err) {
      setError('Erro ao atualizar perfil. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-center text-xl font-bold flex items-center justify-center space-x-2">
            <User className="w-5 h-5" />
            <span>Editar Perfil</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Mensagens de erro e sucesso */}
          {error && (
            <Card className="border-destructive bg-destructive/10">
              <CardContent className="p-3">
                <div className="flex items-center text-destructive">
                  <AlertCircle className="w-4 h-4 mr-2" />
                  <span className="text-sm">{error}</span>
                </div>
              </CardContent>
            </Card>
          )}

          {success && (
            <Card className="border-green-500 bg-green-50">
              <CardContent className="p-3">
                <div className="flex items-center text-green-700">
                  <CheckCircle className="w-4 h-4 mr-2" />
                  <span className="text-sm">{success}</span>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Formulário de Edição */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Nome */}
            <div className="space-y-2">
              <Label htmlFor="profile-name">Nome Completo *</Label>
              <div className="relative">
                <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="profile-name"
                  type="text"
                  placeholder="Seu nome completo"
                  value={profileForm.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
            </div>

            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="profile-email">Email *</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="profile-email"
                  type="email"
                  placeholder="seu@email.com"
                  value={profileForm.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
            </div>

            {/* Telefone */}
            <div className="space-y-2">
              <Label htmlFor="profile-phone">Telefone *</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="profile-phone"
                  type="text"
                  placeholder="(11) 99999-9999"
                  value={profileForm.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  className="pl-10"
                  maxLength={15}
                  required
                />
              </div>
            </div>

            {/* CPF */}
            <div className="space-y-2">
              <Label htmlFor="profile-cpf">CPF *</Label>
              <div className="relative">
                <CreditCard className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="profile-cpf"
                  type="text"
                  placeholder="000.000.000-00"
                  value={profileForm.cpf}
                  onChange={(e) => handleInputChange('cpf', e.target.value)}
                  className="pl-10"
                  maxLength={14}
                  required
                />
              </div>
            </div>

            {/* Seção de Alteração de Senha */}
            <div className="pt-4 border-t">
              <h3 className="text-sm font-medium text-foreground mb-3">
                Alterar Senha (opcional)
              </h3>

              {/* Senha Atual */}
              <div className="space-y-2 mb-3">
                <Label htmlFor="current-password">Senha Atual</Label>
                <div className="relative">
                  <Input
                    id="current-password"
                    type={showCurrentPassword ? "text" : "password"}
                    placeholder="Sua senha atual"
                    value={profileForm.currentPassword}
                    onChange={(e) => handleInputChange('currentPassword', e.target.value)}
                    className="pr-10"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  >
                    {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>

              {/* Nova Senha */}
              <div className="space-y-2 mb-3">
                <Label htmlFor="new-password">Nova Senha</Label>
                <div className="relative">
                  <Input
                    id="new-password"
                    type={showNewPassword ? "text" : "password"}
                    placeholder="Mínimo 6 caracteres"
                    value={profileForm.newPassword}
                    onChange={(e) => handleInputChange('newPassword', e.target.value)}
                    className="pr-10"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                  >
                    {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>

              {/* Confirmar Nova Senha */}
              <div className="space-y-2">
                <Label htmlFor="confirm-new-password">Confirmar Nova Senha</Label>
                <div className="relative">
                  <Input
                    id="confirm-new-password"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirme a nova senha"
                    value={profileForm.confirmNewPassword}
                    onChange={(e) => handleInputChange('confirmNewPassword', e.target.value)}
                    className="pr-10"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
            </div>

            {/* Botões */}
            <div className="flex space-x-3 pt-4">
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={handleClose}
                disabled={isLoading}
              >
                <X className="w-4 h-4 mr-2" />
                Cancelar
              </Button>
              <Button
                type="submit"
                className="flex-1"
                disabled={isLoading}
              >
                <Save className="w-4 h-4 mr-2" />
                {isLoading ? 'Salvando...' : 'Salvar'}
              </Button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
};