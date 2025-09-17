import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { ProfileEditModal } from "@/components/ProfileEditModal";
import { ClientProfileService, UserStats, Achievement } from "@/services/clientProfileService";
import { 
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Shield,
  Edit,
  Trophy,
  Target,
  DollarSign,
  Award
} from "lucide-react";

export const ClientPerfilSection: React.FC = () => {
  const { user } = useAuth();
  const [showProfileEditModal, setShowProfileEditModal] = useState(false);
  const [userStats, setUserStats] = useState<UserStats>({
    totalParticipacoes: 0,
    premiosGanhos: 0,
    totalInvestido: 0,
    economiaTotal: 0,
    dataRegistro: '',
    ultimoLogin: ''
  });
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user?.id) {
      loadProfileData();
    }
  }, [user?.id]);

  const loadProfileData = async () => {
    if (!user?.id) return;
    
    setIsLoading(true);
    try {
      const [stats, userAchievements] = await Promise.all([
        ClientProfileService.getUserStats(user.id),
        ClientProfileService.getUserAchievements(user.id)
      ]);
      
      setUserStats(stats);
      setAchievements(userAchievements);
    } catch (error) {
      console.error('Erro ao carregar dados do perfil:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getAchievementIcon = (achievementId: number) => {
    switch (achievementId) {
      case 1: return <Trophy className="w-6 h-6" />;
      case 2: return <Target className="w-6 h-6" />;
      case 3: return <DollarSign className="w-6 h-6" />;
      case 4: return <Award className="w-6 h-6" />;
      default: return <Award className="w-6 h-6" />;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleOpenProfileEditModal = () => {
    setShowProfileEditModal(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Meu Perfil</h1>
          <p className="text-foreground-muted">Gerencie suas informações pessoais</p>
        </div>
        
        <Button onClick={handleOpenProfileEditModal}>
          <Edit className="w-4 h-4 mr-2" />
          Editar Perfil
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Informações Pessoais */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="bg-gradient-card border-border">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <User className="w-5 h-5 text-primary" />
                <span>Informações Pessoais</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-foreground-muted">Nome Completo</label>
                  <p className="text-foreground font-medium">{user?.name || 'Não informado'}</p>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-foreground-muted">Email</label>
                  <div className="flex items-center space-x-2">
                    <Mail className="w-4 h-4 text-muted-foreground" />
                    <p className="text-foreground">{user?.email || 'Não informado'}</p>
                  </div>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-foreground-muted">Telefone</label>
                  <div className="flex items-center space-x-2">
                    <Phone className="w-4 h-4 text-muted-foreground" />
                    <p className="text-foreground">{(user as any)?.phone || 'Não informado'}</p>
                  </div>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-foreground-muted">CPF</label>
                  <p className="text-foreground">{(user as any)?.cpf || 'Não informado'}</p>
                </div>
                
                <div className="md:col-span-2">
                  <label className="text-sm font-medium text-foreground-muted">Endereço</label>
                  <div className="flex items-center space-x-2">
                    <MapPin className="w-4 h-4 text-muted-foreground" />
                    <p className="text-foreground">{(user as any)?.address || 'Não informado'}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Estatísticas */}
          <Card className="bg-gradient-card border-border">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Trophy className="w-5 h-5 text-primary" />
                <span>Estatísticas</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  {isLoading ? (
                    <div className="h-8 bg-gray-200 rounded animate-pulse mb-2"></div>
                  ) : (
                    <div className="text-2xl font-bold text-primary">{userStats.totalParticipacoes}</div>
                  )}
                  <p className="text-sm text-foreground-muted">Participações</p>
                </div>
                
                <div className="text-center">
                  {isLoading ? (
                    <div className="h-8 bg-gray-200 rounded animate-pulse mb-2"></div>
                  ) : (
                    <div className="text-2xl font-bold text-green-600">{userStats.premiosGanhos}</div>
                  )}
                  <p className="text-sm text-foreground-muted">Prêmios Ganhos</p>
                </div>
                
                <div className="text-center">
                  {isLoading ? (
                    <div className="h-8 bg-gray-200 rounded animate-pulse mb-2"></div>
                  ) : (
                     <div className="text-2xl font-bold text-foreground">
                       R$ {userStats.totalInvestido.toFixed(0)}
                     </div>
                   )}
                   <p className="text-sm text-foreground-muted">Investido</p>
                 </div>
                
                <div className="text-center">
                  {isLoading ? (
                    <div className="h-8 bg-gray-200 rounded animate-pulse mb-2"></div>
                  ) : (
                    <div className="text-2xl font-bold text-blue-600">
                      R$ {userStats.economiaTotal.toFixed(0)}
                    </div>
                  )}
                  <p className="text-sm text-foreground-muted">Economia</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Conquistas */}
          <Card className="bg-gradient-card border-border">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Award className="w-5 h-5 text-primary" />
                <span>Conquistas</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {isLoading ? (
                  Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="p-4 rounded-lg border bg-muted">
                      <div className="h-6 bg-gray-200 rounded animate-pulse mb-2"></div>
                      <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4"></div>
                    </div>
                  ))
                ) : (
                  achievements.map((achievement) => (
                  <div 
                    key={achievement.id}
                    className={`p-4 rounded-lg border ${
                      achievement.earned 
                        ? 'bg-primary/10 border-primary/20' 
                        : 'bg-muted border-border'
                    }`}
                  >
                    <div className="flex items-start space-x-3">
                      <div className={`p-2 rounded-lg ${
                        achievement.earned 
                          ? 'bg-primary text-primary-foreground' 
                          : 'bg-muted-foreground/20 text-muted-foreground'
                      }`}>
                        {achievement.icon}
                      </div>
                      
                      <div className="flex-1">
                        <h4 className={`font-medium ${
                          achievement.earned ? 'text-foreground' : 'text-muted-foreground'
                        }`}>
                          {achievement.title}
                        </h4>
                        <p className={`text-sm ${
                          achievement.earned ? 'text-foreground-muted' : 'text-muted-foreground'
                        }`}>
                          {achievement.description}
                        </p>
                        {achievement.earned && achievement.date && (
                          <p className="text-xs text-primary mt-1">
                            Conquistado em {formatDate(achievement.date)}
                          </p>
                        )}
                      </div>
                      
                      {achievement.earned && (
                        <Badge variant="secondary" className="bg-primary/20 text-primary">
                          Conquistado
                        </Badge>
                      )}
                    </div>
                  </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Informações da Conta */}
          <Card className="bg-gradient-card border-border">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Shield className="w-5 h-5 text-primary" />
                <span>Informações da Conta</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-foreground-muted">Data de Registro</label>
                <div className="flex items-center space-x-2">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  <p className="text-foreground">{formatDate(userStats.dataRegistro)}</p>
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium text-foreground-muted">Último Login</label>
                <p className="text-foreground">{formatDateTime(userStats.ultimoLogin)}</p>
              </div>
              
              <div>
                <label className="text-sm font-medium text-foreground-muted">Status da Conta</label>
                <Badge variant="secondary" className="bg-green-100 text-green-800">
                  Ativa
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Ações Rápidas */}
          <Card className="bg-gradient-card border-border">
            <CardHeader>
              <CardTitle>Ações Rápidas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button variant="outline" className="w-full justify-start">
                <Shield className="w-4 h-4 mr-2" />
                Alterar Senha
              </Button>
              
              <Button variant="outline" className="w-full justify-start">
                <Mail className="w-4 h-4 mr-2" />
                Preferências de Email
              </Button>
              
              <Button variant="outline" className="w-full justify-start">
                <User className="w-4 h-4 mr-2" />
                Configurações de Privacidade
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Modal de Edição de Perfil */}
      <ProfileEditModal
        isOpen={showProfileEditModal}
        onClose={() => setShowProfileEditModal(false)}
      />
    </div>
  );
};