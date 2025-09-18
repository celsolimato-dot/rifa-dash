import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';

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
  updateSettings: (newSettings: Partial<GeneralSettings>) => Promise<void>;
  isLoading: boolean;
}

const defaultSettings: GeneralSettings = {
  siteName: "RIFOU.NET",
  siteDescription: "A plataforma de rifas mais confiável do Brasil. Sorteios transparentes, prêmios garantidos e a chance de realizar seus sonhos.",
  contactEmail: "contato@rifou.net",
  contactPhone: "(63) 99294-0044",
  contactCity: "Palmas, TO",
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

  // Carregar configurações do banco de dados
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const { data, error } = await supabase
          .from('settings')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle(); // Use maybeSingle() instead of single() to avoid errors when no data

        if (error) {
          console.error('Erro ao carregar configurações:', error);
          setIsLoading(false);
          return;
        }

        if (data) {
          const loadedSettings: GeneralSettings = {
            siteName: data.site_name,
            siteDescription: data.site_description,
            contactEmail: data.contact_email,
            contactPhone: data.contact_phone,
            contactCity: data.contact_city,
            contactCnpj: data.contact_cnpj,
            timezone: data.timezone,
            language: data.language,
            currency: data.currency,
          };
          setSettings(loadedSettings);
        }
      } catch (error) {
        console.error('Erro ao carregar configurações:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadSettings();
  }, []);

  const updateSettings = async (newSettings: Partial<GeneralSettings>) => {
    const updatedSettings = { ...settings, ...newSettings };
    setSettings(updatedSettings);
    
    try {
      // Verificar se existe uma configuração
      const { data: existing } = await supabase
        .from('settings')
        .select('id')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      const settingsData = {
        site_name: updatedSettings.siteName,
        site_description: updatedSettings.siteDescription,
        contact_email: updatedSettings.contactEmail,
        contact_phone: updatedSettings.contactPhone,
        contact_city: updatedSettings.contactCity,
        contact_cnpj: updatedSettings.contactCnpj,
        timezone: updatedSettings.timezone,
        language: updatedSettings.language,
        currency: updatedSettings.currency,
      };

      if (existing) {
        // Atualizar configuração existente
        const { error } = await supabase
          .from('settings')
          .update(settingsData)
          .eq('id', existing.id);

        if (error) {
          console.error('Erro ao atualizar configurações:', error);
          throw error;
        }
      } else {
        // Criar nova configuração
        const { error } = await supabase
          .from('settings')
          .insert([settingsData]);

        if (error) {
          console.error('Erro ao criar configurações:', error);
          throw error;
        }
      }
    } catch (error) {
      console.error('Erro ao salvar configurações:', error);
      throw error;
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