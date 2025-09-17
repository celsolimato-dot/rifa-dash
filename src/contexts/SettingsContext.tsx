import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface GeneralSettings {
  siteName: string;
  siteDescription: string;
  contactEmail: string;
  contactPhone: string;
  contactCity: string;
  contactCnpj: string;
  timezone: string;
  language: string;
  currency: string;
}

interface SettingsContextType {
  settings: GeneralSettings;
  updateSettings: (newSettings: Partial<GeneralSettings>) => void;
  isLoading: boolean;
}

const defaultSettings: GeneralSettings = {
  siteName: "RifaSystem Pro",
  siteDescription: "Sistema completo de gerenciamento de rifas online",
  contactEmail: "contato@rifasystem.com",
  contactPhone: "(11) 99999-9999",
  contactCity: "São Paulo, SP",
  contactCnpj: "XX.XXX.XXX/0001-XX",
  timezone: "America/Sao_Paulo",
  language: "pt-BR",
  currency: "BRL"
};

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

interface SettingsProviderProps {
  children: ReactNode;
}

export const SettingsProvider: React.FC<SettingsProviderProps> = ({ children }) => {
  const [settings, setSettings] = useState<GeneralSettings>(defaultSettings);
  const [isLoading, setIsLoading] = useState(true);

  // Simular carregamento das configurações (em uma aplicação real, isso viria de uma API)
  useEffect(() => {
    const loadSettings = async () => {
      try {
        // Verificar se há configurações salvas no localStorage
        const savedSettings = localStorage.getItem('app-settings');
        if (savedSettings) {
          const parsedSettings = JSON.parse(savedSettings);
          setSettings({ ...defaultSettings, ...parsedSettings });
        }
      } catch (error) {
        console.error('Erro ao carregar configurações:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadSettings();
  }, []);

  const updateSettings = (newSettings: Partial<GeneralSettings>) => {
    const updatedSettings = { ...settings, ...newSettings };
    setSettings(updatedSettings);
    
    // Salvar no localStorage (em uma aplicação real, isso seria enviado para uma API)
    try {
      localStorage.setItem('app-settings', JSON.stringify(updatedSettings));
    } catch (error) {
      console.error('Erro ao salvar configurações:', error);
    }
  };

  const value: SettingsContextType = {
    settings,
    updateSettings,
    isLoading
  };

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = (): SettingsContextType => {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings deve ser usado dentro de um SettingsProvider');
  }
  return context;
};