import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Eye, EyeOff, Mail, Lock, User, Phone, Shield, LogIn } from 'lucide-react';

const Auth = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [loginData, setLoginData] = useState({ email: '', password: '' });
  const [registerData, setRegisterData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  });
  
  const { login, isLoading } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const success = await login(loginData.email, loginData.password);
    
    if (success) {
      toast({
        title: "Login realizado com sucesso!",
        description: "Redirecionando para seu painel...",
      });
      
      // Redirecionar baseado no tipo de usuário
      if (loginData.email === 'admin@rifou.net') {
        navigate('/admin');
      } else {
        navigate('/cliente');
      }
    } else {
      toast({
        title: "Erro no login",
        description: "Email ou senha incorretos. Tente novamente.",
        variant: "destructive",
      });
    }
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (registerData.password !== registerData.confirmPassword) {
      toast({
        title: "Erro no cadastro",
        description: "As senhas não coincidem.",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Cadastro em desenvolvimento",
      description: "Em breve você poderá se cadastrar. Use o login de demonstração.",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-dark flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <div className="w-12 h-12 bg-gradient-primary rounded-xl flex items-center justify-center shadow-glow">
              <span className="text-white font-bold text-lg">R</span>
            </div>
          </div>
          <h1 className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
            RIFOU.NET
          </h1>
          <p className="text-foreground-muted">
            Acesse sua conta ou cadastre-se para participar das rifas
          </p>
        </div>

        {/* Auth Forms */}
        <Card className="bg-gradient-card border-border shadow-card-hover">
          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2 bg-background-secondary">
              <TabsTrigger value="login" className="flex items-center space-x-2">
                <LogIn className="w-4 h-4" />
                <span>Entrar</span>
              </TabsTrigger>
              <TabsTrigger value="register" className="flex items-center space-x-2">
                <User className="w-4 h-4" />
                <span>Cadastrar</span>
              </TabsTrigger>
            </TabsList>
            
            {/* Login Form */}
            <TabsContent value="login">
              <form onSubmit={handleLogin}>
                <CardHeader className="space-y-1">
                  <CardTitle className="text-xl text-foreground">Fazer Login</CardTitle>
                  <CardDescription>
                    Entre com suas credenciais para acessar sua conta
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  
                  {/* Demo Credentials */}
                  <div className="p-3 bg-background-secondary rounded-lg border border-border text-xs space-y-1">
                    <p className="text-foreground font-medium">Credenciais de demonstração:</p>
                    <p className="text-primary">Admin: admin@rifou.net / admin123</p>
                    <p className="text-accent-success">Cliente: cliente@teste.com / cliente123</p>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-foreground-muted" />
                      <Input
                        id="email"
                        type="email"
                        placeholder="seu@email.com"
                        className="pl-10"
                        value={loginData.email}
                        onChange={(e) => setLoginData({...loginData, email: e.target.value})}
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="password">Senha</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-foreground-muted" />
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        className="pl-10 pr-10"
                        value={loginData.password}
                        onChange={(e) => setLoginData({...loginData, password: e.target.value})}
                        required
                      />
                      <button
                        type="button"
                        className="absolute right-3 top-3 text-foreground-muted hover:text-foreground"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>
                  
                  <Button 
                    type="submit" 
                    className="w-full" 
                    variant="hero"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Entrando...
                      </>
                    ) : (
                      <>
                        <Shield className="w-4 h-4 mr-2" />
                        Entrar na Conta
                      </>
                    )}
                  </Button>
                  
                  <p className="text-center text-sm text-foreground-muted">
                    Esqueceu sua senha?{' '}
                    <button type="button" className="text-primary hover:underline">
                      Recuperar senha
                    </button>
                  </p>
                </CardContent>
              </form>
            </TabsContent>
            
            {/* Register Form */}
            <TabsContent value="register">
              <form onSubmit={handleRegister}>
                <CardHeader className="space-y-1">
                  <CardTitle className="text-xl text-foreground">Criar Conta</CardTitle>
                  <CardDescription>
                    Cadastre-se para participar das rifas incríveis
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="reg-name">Nome Completo</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-3 h-4 w-4 text-foreground-muted" />
                      <Input
                        id="reg-name"
                        placeholder="Seu nome completo"
                        className="pl-10"
                        value={registerData.name}
                        onChange={(e) => setRegisterData({...registerData, name: e.target.value})}
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="reg-email">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-foreground-muted" />
                      <Input
                        id="reg-email"
                        type="email"
                        placeholder="seu@email.com"
                        className="pl-10"
                        value={registerData.email}
                        onChange={(e) => setRegisterData({...registerData, email: e.target.value})}
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="reg-phone">Telefone</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-3 h-4 w-4 text-foreground-muted" />
                      <Input
                        id="reg-phone"
                        placeholder="(11) 99999-9999"
                        className="pl-10"
                        value={registerData.phone}
                        onChange={(e) => setRegisterData({...registerData, phone: e.target.value})}
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="reg-password">Senha</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-foreground-muted" />
                      <Input
                        id="reg-password"
                        type="password"
                        placeholder="••••••••"
                        className="pl-10"
                        value={registerData.password}
                        onChange={(e) => setRegisterData({...registerData, password: e.target.value})}
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="reg-confirm-password">Confirmar Senha</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-foreground-muted" />
                      <Input
                        id="reg-confirm-password"
                        type="password"
                        placeholder="••••••••"
                        className="pl-10"
                        value={registerData.confirmPassword}
                        onChange={(e) => setRegisterData({...registerData, confirmPassword: e.target.value})}
                        required
                      />
                    </div>
                  </div>
                  
                  <Button type="submit" className="w-full" variant="success">
                    <User className="w-4 h-4 mr-2" />
                    Criar Conta
                  </Button>
                  
                  <p className="text-xs text-foreground-muted text-center">
                    Ao criar uma conta, você concorda com nossos{' '}
                    <button type="button" className="text-primary hover:underline">
                      Termos de Uso
                    </button>{' '}
                    e{' '}
                    <button type="button" className="text-primary hover:underline">
                      Política de Privacidade
                    </button>
                  </p>
                </CardContent>
              </form>
            </TabsContent>
          </Tabs>
        </Card>

        {/* Back to Home */}
        <div className="text-center">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/')}
            className="text-foreground-muted hover:text-primary"
          >
            ← Voltar para o site
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Auth;