import { useState, useCallback } from 'react';

export type ClientSection = 
  | 'dashboard' 
  | 'rifas' 
  | 'historico' 
  | 'afiliado'
  | 'perfil' 
  | 'mensagens' 
  | 'suporte';

export interface NavigationState {
  currentSection: ClientSection;
  previousSection: ClientSection | null;
  breadcrumb: string[];
}

export const useClientNavigation = (initialSection: ClientSection = 'dashboard') => {
  const [navigationState, setNavigationState] = useState<NavigationState>({
    currentSection: initialSection,
    previousSection: null,
    breadcrumb: [getSectionTitle(initialSection)]
  });

  const navigateToSection = useCallback((section: ClientSection) => {
    setNavigationState(prev => ({
      currentSection: section,
      previousSection: prev.currentSection,
      breadcrumb: [getSectionTitle(section)]
    }));
  }, []);

  const goBack = useCallback(() => {
    if (navigationState.previousSection) {
      setNavigationState(prev => ({
        currentSection: prev.previousSection!,
        previousSection: null,
        breadcrumb: [getSectionTitle(prev.previousSection!)]
      }));
    }
  }, [navigationState.previousSection]);

  const addToBreadcrumb = useCallback((title: string) => {
    setNavigationState(prev => ({
      ...prev,
      breadcrumb: [...prev.breadcrumb, title]
    }));
  }, []);

  const resetBreadcrumb = useCallback(() => {
    setNavigationState(prev => ({
      ...prev,
      breadcrumb: [getSectionTitle(prev.currentSection)]
    }));
  }, []);

  return {
    currentSection: navigationState.currentSection,
    previousSection: navigationState.previousSection,
    breadcrumb: navigationState.breadcrumb,
    navigateToSection,
    goBack,
    addToBreadcrumb,
    resetBreadcrumb,
    canGoBack: navigationState.previousSection !== null
  };
};

function getSectionTitle(section: ClientSection): string {
  const titles: Record<ClientSection, string> = {
    dashboard: 'Dashboard',
    rifas: 'Minhas Rifas',
    historico: 'Histórico',
    afiliado: 'Afiliado',
    perfil: 'Meu Perfil',
    mensagens: 'Mensagens',
    suporte: 'Suporte'
  };
  
  return titles[section];
}

export { getSectionTitle };