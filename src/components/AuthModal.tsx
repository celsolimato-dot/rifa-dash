import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent } from "@/components/ui/card";
import { 
  User, 
  Mail, 
  Lock, 
  Phone, 
  CreditCard,
  Eye,
  EyeOff,
  LogIn,
  UserPlus,
  AlertCircle,
  CheckCircle
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

interface LoginForm {
  email: string;
  password: string;
}

interface RegisterForm {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  cpf: string;
  phone: string;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const { login, isLoading } = useAuth();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [loginForm, setLoginForm] = useState<LoginForm>({
    email: '',
    password: ''
  });

  const [registerForm, setRegisterForm] = useState<RegisterForm>({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    cpf: '',
    phone: ''
  });

  const resetForms = () => {
    setLoginForm({ email: '', password: '' });
    setRegisterForm({
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
      cpf: '',
      phone: ''
    });
    setError('');
    setSuccess('');
  };

  const handleClose = () => {
    resetForms();
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

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validateCPF = (cpf: string) => {
    const numbers = cpf.replace(/\D/g, '');
    return numbers.length === 11;
  };

  const validatePhone = (phone: string) => {
    const numbers = phone.replace(/\D/g, '');
    return numbers.length >= 10 && numbers.length <= 11;
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!loginForm.email || !loginForm.password) {
      setError('Todos os campos são obrigatórios');
      return;
    }

    if (!validateEmail(loginForm.email)) {
      setError('Email inválido');
      return;
    }

    try {
      await login(loginForm.email, loginForm.password);
      setSuccess('Login realizado com sucesso!');
      setTimeout(() => {
        handleClose();
        onSuccess();
      }, 1000);
    } catch (error) {
      setError('Email ou senha incorretos');
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validação dos campos obrigatórios
    if (!registerForm.name || !registerForm.email || !registerForm.password || 
        !registerForm.confirmPassword || !registerForm.cpf || !registerForm.phone) {
      setError('Todos os campos são obrigatórios');
      return;
    }

    if (!validateEmail(registerForm.email)) {
      setError('Email inválido');
      return;
    }

    if (registerForm.password.length < 6) {
      setError('A senha deve ter pelo menos 6 caracteres');
      return;
    }

    if (registerForm.password !== registerForm.confirmPassword) {
      setError('As senhas não coincidem');
      return;
    }

    if (!validateCPF(registerForm.cpf)) {
      setError('CPF inválido');
      return;
    }

    if (!validatePhone(registerForm.phone)) {
      setError('Telefone inválido');
      return;
    }

    // Simular cadastro (em um app real, seria uma chamada para API)
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      setSuccess('Cadastro realizado com sucesso! Faça login para continuar.');
      setTimeout(() => {
        setMode('login');
        setSuccess('');
        setLoginForm({ email: registerForm.email, password: '' });
      }, 2000);
    } catch (err) {
      setError('Erro ao criar conta. Tente novamente.');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-center text-xl font-bold">
            {mode === 'login' ? 'Entrar na sua conta' : 'Criar nova conta'}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Toggle entre Login e Cadastro */}
          <div className="flex bg-muted rounded-lg p-1">
            <Button
              variant={mode === 'login' ? 'default' : 'ghost'}
              className="flex-1"
              onClick={() => {
                setMode('login');
                setError('');
                setSuccess('');
              }}
            >
              <LogIn className="w-4 h-4 mr-2" />
              Entrar
            </Button>
            <Button
              variant={mode === 'register' ? 'default' : 'ghost'}
              className="flex-1"
              onClick={() => {
                setMode('register');
                setError('');
                setSuccess('');
              }}
            >
              <UserPlus className="w-4 h-4 mr-2" />
              Cadastrar
            </Button>
          </div>

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

          {/* Formulário de Login */}
          {mode === 'login' && (
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="login-email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="login-email"
                    type="email"
                    placeholder="seu@email.com"
                    value={loginForm.email}
                    onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="login-password">Senha</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="login-password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Sua senha"
                    value={loginForm.password}
                    onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                    className="pl-10 pr-10"
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? 'Entrando...' : 'Entrar'}
              </Button>
            </form>
          )}

          {/* Formulário de Cadastro */}
          {mode === 'register' && (
            <form onSubmit={handleRegister} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="register-name">Nome Completo *</Label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="register-name"
                    type="text"
                    placeholder="Seu nome completo"
                    value={registerForm.name}
                    onChange={(e) => setRegisterForm({ ...registerForm, name: e.target.value })}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="register-email">Email *</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="register-email"
                    type="email"
                    placeholder="seu@email.com"
                    value={registerForm.email}
                    onChange={(e) => setRegisterForm({ ...registerForm, email: e.target.value })}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="register-cpf">CPF *</Label>
                <div className="relative">
                  <CreditCard className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="register-cpf"
                    type="text"
                    placeholder="000.000.000-00"
                    value={registerForm.cpf}
                    onChange={(e) => {
                      const formatted = formatCPF(e.target.value);
                      if (formatted.length <= 14) {
                        setRegisterForm({ ...registerForm, cpf: formatted });
                      }
                    }}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="register-phone">Telefone *</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="register-phone"
                    type="text"
                    placeholder="(11) 99999-9999"
                    value={registerForm.phone}
                    onChange={(e) => {
                      const formatted = formatPhone(e.target.value);
                      if (formatted.length <= 15) {
                        setRegisterForm({ ...registerForm, phone: formatted });
                      }
                    }}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="register-password">Senha *</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="register-password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Mínimo 6 caracteres"
                    value={registerForm.password}
                    onChange={(e) => setRegisterForm({ ...registerForm, password: e.target.value })}
                    className="pl-10 pr-10"
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="register-confirm-password">Confirmar Senha *</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="register-confirm-password"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirme sua senha"
                    value={registerForm.confirmPassword}
                    onChange={(e) => setRegisterForm({ ...registerForm, confirmPassword: e.target.value })}
                    className="pl-10 pr-10"
                    required
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

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? 'Criando conta...' : 'Criar conta'}
              </Button>
            </form>
          )}

          <Separator />

          <div className="text-center text-sm text-muted-foreground">
            {mode === 'login' ? (
              <span>
                Não tem uma conta?{' '}
                <Button
                  variant="link"
                  className="p-0 h-auto font-semibold"
                  onClick={() => setMode('register')}
                >
                  Cadastre-se aqui
                </Button>
              </span>
            ) : (
              <span>
                Já tem uma conta?{' '}
                <Button
                  variant="link"
                  className="p-0 h-auto font-semibold"
                  onClick={() => setMode('login')}
                >
                  Faça login
                </Button>
              </span>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};