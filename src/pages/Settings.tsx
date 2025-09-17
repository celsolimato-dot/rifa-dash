import React, { useState, useEffect } from "react";
import { useSettings } from "@/contexts/SettingsContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { 
  Settings as SettingsIcon, 
  User, 
  Bell, 
  Shield, 
  CreditCard,
  Mail,
  Smartphone,
  Globe,
  Database,
  Key,
  Upload,
  Download,
  Trash2,
  Save,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  Info,
  Eye,
  EyeOff
} from "lucide-react";

interface SystemSettings {
  general: {
    siteName: string;
    siteDescription: string;
    contactEmail: string;
    contactPhone: string;
    contactCity: string;
    contactCnpj: string;
    timezone: string;
    language: string;
    currency: string;
  };
  notifications: {
    emailNotifications: boolean;
    smsNotifications: boolean;
    pushNotifications: boolean;
    winnerNotification: boolean;
    raffleReminders: boolean;
    systemAlerts: boolean;
  };
  security: {
    twoFactorAuth: boolean;
    sessionTimeout: number;
    passwordPolicy: string;
    loginAttempts: number;
    ipWhitelist: string[];
  };
  payment: {
    pixEnabled: boolean;
    pixKey: string;
    creditCardEnabled: boolean;
    bankTransferEnabled: boolean;
    minimumValue: number;
    maximumValue: number;
    processingFee: number;
  };
  email: {
    smtpHost: string;
    smtpPort: number;
    smtpUser: string;
    smtpPassword: string;
    fromEmail: string;
    fromName: string;
  };
  sms: {
    provider: string;
    apiKey: string;
    sender: string;
    enabled: boolean;
  };
}

// Mock data
const initialSettings: SystemSettings = {
  general: {
    siteName: "RifaSystem Pro",
    siteDescription: "Sistema completo de gerenciamento de rifas online",
    contactEmail: "contato@rifasystem.com",
    contactPhone: "(11) 99999-9999",
    contactCity: "São Paulo, SP",
    contactCnpj: "XX.XXX.XXX/0001-XX",
    timezone: "America/Sao_Paulo",
    language: "pt-BR",
    currency: "BRL"
  },
  notifications: {
    emailNotifications: true,
    smsNotifications: true,
    pushNotifications: false,
    winnerNotification: true,
    raffleReminders: true,
    systemAlerts: true
  },
  security: {
    twoFactorAuth: false,
    sessionTimeout: 30,
    passwordPolicy: "strong",
    loginAttempts: 5,
    ipWhitelist: []
  },
  payment: {
    pixEnabled: true,
    pixKey: "contato@rifasystem.com",
    creditCardEnabled: false,
    bankTransferEnabled: true,
    minimumValue: 5,
    maximumValue: 1000,
    processingFee: 2.5
  },
  email: {
    smtpHost: "smtp.gmail.com",
    smtpPort: 587,
    smtpUser: "",
    smtpPassword: "",
    fromEmail: "noreply@rifasystem.com",
    fromName: "RifaSystem"
  },
  sms: {
    provider: "twilio",
    apiKey: "",
    sender: "RifaSystem",
    enabled: false
  }
};

export default function Settings() {
  const { settings: globalSettings, updateSettings: updateGlobalSettings } = useSettings();
  const [settings, setSettings] = useState<SystemSettings>(initialSettings);
  const [selectedTab, setSelectedTab] = useState("general");
  const [showPassword, setShowPassword] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showBackupDialog, setShowBackupDialog] = useState(false);

  // Sincronizar configurações globais com as configurações locais
  useEffect(() => {
    setSettings(prev => ({
      ...prev,
      general: globalSettings
    }));
  }, [globalSettings]);

  const handleSave = async () => {
    setIsSaving(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsSaving(false);
    // Show success message
  };

  const handleBackup = () => {
    // Logic to create backup
    console.log("Creating backup...");
    setShowBackupDialog(false);
  };

  const handleRestore = () => {
    // Logic to restore from backup
    console.log("Restoring from backup...");
  };

  const updateSettings = (section: keyof SystemSettings, field: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));

    // Se for uma configuração geral, atualizar também o contexto global
    if (section === 'general') {
      updateGlobalSettings({ [field]: value });
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Configurações</h1>
          <p className="text-foreground-muted">Gerencie as configurações do sistema</p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={() => setShowBackupDialog(true)}>
            <Download className="w-4 h-4 mr-2" />
            Backup
          </Button>
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? (
              <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Save className="w-4 h-4 mr-2" />
            )}
            {isSaving ? "Salvando..." : "Salvar"}
          </Button>
        </div>
      </div>

      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="general">Geral</TabsTrigger>
          <TabsTrigger value="notifications">Notificações</TabsTrigger>
          <TabsTrigger value="security">Segurança</TabsTrigger>
          <TabsTrigger value="payment">Pagamentos</TabsTrigger>
          <TabsTrigger value="email">E-mail</TabsTrigger>
          <TabsTrigger value="sms">SMS</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Globe className="w-5 h-5 mr-2" />
                Configurações Gerais
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Nome do Site</label>
                  <Input
                    value={settings.general.siteName}
                    onChange={(e) => updateSettings('general', 'siteName', e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">E-mail de Contato</label>
                  <Input
                    type="email"
                    value={settings.general.contactEmail}
                    onChange={(e) => updateSettings('general', 'contactEmail', e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium">Descrição do Site</label>
                <Textarea
                  value={settings.general.siteDescription}
                  onChange={(e) => updateSettings('general', 'siteDescription', e.target.value)}
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Telefone</label>
                  <Input
                    value={settings.general.contactPhone}
                    onChange={(e) => updateSettings('general', 'contactPhone', e.target.value)}
                    placeholder="(11) 99999-9999"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Cidade</label>
                  <Input
                    value={settings.general.contactCity}
                    onChange={(e) => updateSettings('general', 'contactCity', e.target.value)}
                    placeholder="São Paulo, SP"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-medium">CNPJ</label>
                  <Input
                    value={settings.general.contactCnpj}
                    onChange={(e) => updateSettings('general', 'contactCnpj', e.target.value)}
                    placeholder="XX.XXX.XXX/0001-XX"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Fuso Horário</label>
                  <Select value={settings.general.timezone} onValueChange={(value) => updateSettings('general', 'timezone', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="America/Sao_Paulo">São Paulo (GMT-3)</SelectItem>
                      <SelectItem value="America/Rio_Branco">Rio Branco (GMT-5)</SelectItem>
                      <SelectItem value="America/Manaus">Manaus (GMT-4)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium">Moeda</label>
                  <Select value={settings.general.currency} onValueChange={(value) => updateSettings('general', 'currency', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="BRL">Real (R$)</SelectItem>
                      <SelectItem value="USD">Dólar ($)</SelectItem>
                      <SelectItem value="EUR">Euro (€)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Bell className="w-5 h-5 mr-2" />
                Configurações de Notificações
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">Notificações por E-mail</h3>
                    <p className="text-sm text-foreground-muted">Receber notificações via e-mail</p>
                  </div>
                  <Switch
                    checked={settings.notifications.emailNotifications}
                    onCheckedChange={(checked) => updateSettings('notifications', 'emailNotifications', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">Notificações por SMS</h3>
                    <p className="text-sm text-foreground-muted">Receber notificações via SMS</p>
                  </div>
                  <Switch
                    checked={settings.notifications.smsNotifications}
                    onCheckedChange={(checked) => updateSettings('notifications', 'smsNotifications', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">Notificações Push</h3>
                    <p className="text-sm text-foreground-muted">Receber notificações push no navegador</p>
                  </div>
                  <Switch
                    checked={settings.notifications.pushNotifications}
                    onCheckedChange={(checked) => updateSettings('notifications', 'pushNotifications', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">Notificar Ganhadores</h3>
                    <p className="text-sm text-foreground-muted">Enviar notificação automática aos ganhadores</p>
                  </div>
                  <Switch
                    checked={settings.notifications.winnerNotification}
                    onCheckedChange={(checked) => updateSettings('notifications', 'winnerNotification', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">Lembretes de Rifa</h3>
                    <p className="text-sm text-foreground-muted">Enviar lembretes sobre sorteios próximos</p>
                  </div>
                  <Switch
                    checked={settings.notifications.raffleReminders}
                    onCheckedChange={(checked) => updateSettings('notifications', 'raffleReminders', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">Alertas do Sistema</h3>
                    <p className="text-sm text-foreground-muted">Receber alertas sobre o funcionamento do sistema</p>
                  </div>
                  <Switch
                    checked={settings.notifications.systemAlerts}
                    onCheckedChange={(checked) => updateSettings('notifications', 'systemAlerts', checked)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Shield className="w-5 h-5 mr-2" />
                Configurações de Segurança
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium">Autenticação de Dois Fatores</h3>
                  <p className="text-sm text-foreground-muted">Adicionar uma camada extra de segurança</p>
                </div>
                <Switch
                  checked={settings.security.twoFactorAuth}
                  onCheckedChange={(checked) => updateSettings('security', 'twoFactorAuth', checked)}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Timeout da Sessão (minutos)</label>
                  <Input
                    type="number"
                    value={settings.security.sessionTimeout}
                    onChange={(e) => updateSettings('security', 'sessionTimeout', parseInt(e.target.value))}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Tentativas de Login</label>
                  <Input
                    type="number"
                    value={settings.security.loginAttempts}
                    onChange={(e) => updateSettings('security', 'loginAttempts', parseInt(e.target.value))}
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium">Política de Senha</label>
                <Select value={settings.security.passwordPolicy} onValueChange={(value) => updateSettings('security', 'passwordPolicy', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="weak">Fraca (mínimo 6 caracteres)</SelectItem>
                    <SelectItem value="medium">Média (8 caracteres, letras e números)</SelectItem>
                    <SelectItem value="strong">Forte (8 caracteres, letras, números e símbolos)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payment" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <CreditCard className="w-5 h-5 mr-2" />
                Configurações de Pagamento
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">PIX</h3>
                    <p className="text-sm text-foreground-muted">Aceitar pagamentos via PIX</p>
                  </div>
                  <Switch
                    checked={settings.payment.pixEnabled}
                    onCheckedChange={(checked) => updateSettings('payment', 'pixEnabled', checked)}
                  />
                </div>

                {settings.payment.pixEnabled && (
                  <div>
                    <label className="text-sm font-medium">Chave PIX</label>
                    <Input
                      value={settings.payment.pixKey}
                      onChange={(e) => updateSettings('payment', 'pixKey', e.target.value)}
                      placeholder="Digite sua chave PIX"
                    />
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">Cartão de Crédito</h3>
                    <p className="text-sm text-foreground-muted">Aceitar pagamentos via cartão</p>
                  </div>
                  <Switch
                    checked={settings.payment.creditCardEnabled}
                    onCheckedChange={(checked) => updateSettings('payment', 'creditCardEnabled', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">Transferência Bancária</h3>
                    <p className="text-sm text-foreground-muted">Aceitar transferências bancárias</p>
                  </div>
                  <Switch
                    checked={settings.payment.bankTransferEnabled}
                    onCheckedChange={(checked) => updateSettings('payment', 'bankTransferEnabled', checked)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-medium">Valor Mínimo (R$)</label>
                  <Input
                    type="number"
                    step="0.01"
                    value={settings.payment.minimumValue}
                    onChange={(e) => updateSettings('payment', 'minimumValue', parseFloat(e.target.value))}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Valor Máximo (R$)</label>
                  <Input
                    type="number"
                    step="0.01"
                    value={settings.payment.maximumValue}
                    onChange={(e) => updateSettings('payment', 'maximumValue', parseFloat(e.target.value))}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Taxa de Processamento (%)</label>
                  <Input
                    type="number"
                    step="0.1"
                    value={settings.payment.processingFee}
                    onChange={(e) => updateSettings('payment', 'processingFee', parseFloat(e.target.value))}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="email" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Mail className="w-5 h-5 mr-2" />
                Configurações de E-mail
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Servidor SMTP</label>
                  <Input
                    value={settings.email.smtpHost}
                    onChange={(e) => updateSettings('email', 'smtpHost', e.target.value)}
                    placeholder="smtp.gmail.com"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Porta SMTP</label>
                  <Input
                    type="number"
                    value={settings.email.smtpPort}
                    onChange={(e) => updateSettings('email', 'smtpPort', parseInt(e.target.value))}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Usuário SMTP</label>
                  <Input
                    value={settings.email.smtpUser}
                    onChange={(e) => updateSettings('email', 'smtpUser', e.target.value)}
                    placeholder="seu-email@gmail.com"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Senha SMTP</label>
                  <div className="relative">
                    <Input
                      type={showPassword ? "text" : "password"}
                      value={settings.email.smtpPassword}
                      onChange={(e) => updateSettings('email', 'smtpPassword', e.target.value)}
                      placeholder="Sua senha ou app password"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </Button>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">E-mail Remetente</label>
                  <Input
                    type="email"
                    value={settings.email.fromEmail}
                    onChange={(e) => updateSettings('email', 'fromEmail', e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Nome Remetente</label>
                  <Input
                    value={settings.email.fromName}
                    onChange={(e) => updateSettings('email', 'fromName', e.target.value)}
                  />
                </div>
              </div>

              <div className="flex justify-end">
                <Button variant="outline">
                  <Mail className="w-4 h-4 mr-2" />
                  Testar Configuração
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sms" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Smartphone className="w-5 h-5 mr-2" />
                Configurações de SMS
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium">Habilitar SMS</h3>
                  <p className="text-sm text-foreground-muted">Ativar envio de SMS</p>
                </div>
                <Switch
                  checked={settings.sms.enabled}
                  onCheckedChange={(checked) => updateSettings('sms', 'enabled', checked)}
                />
              </div>

              {settings.sms.enabled && (
                <>
                  <div>
                    <label className="text-sm font-medium">Provedor</label>
                    <Select value={settings.sms.provider} onValueChange={(value) => updateSettings('sms', 'provider', value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="twilio">Twilio</SelectItem>
                        <SelectItem value="nexmo">Nexmo</SelectItem>
                        <SelectItem value="aws">AWS SNS</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium">API Key</label>
                      <Input
                        type="password"
                        value={settings.sms.apiKey}
                        onChange={(e) => updateSettings('sms', 'apiKey', e.target.value)}
                        placeholder="Sua API Key"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Remetente</label>
                      <Input
                        value={settings.sms.sender}
                        onChange={(e) => updateSettings('sms', 'sender', e.target.value)}
                        placeholder="Nome do remetente"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <Button variant="outline">
                      <Smartphone className="w-4 h-4 mr-2" />
                      Testar SMS
                    </Button>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Backup Dialog */}
      <Dialog open={showBackupDialog} onOpenChange={setShowBackupDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Backup do Sistema</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="flex items-center space-x-2 p-4 bg-blue-50 rounded-lg">
              <Info className="w-5 h-5 text-blue-500" />
              <p className="text-sm">O backup incluirá todas as configurações, rifas, participantes e dados do sistema.</p>
            </div>
            
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setShowBackupDialog(false)}>
                Cancelar
              </Button>
              <Button onClick={handleBackup}>
                <Download className="w-4 h-4 mr-2" />
                Criar Backup
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}