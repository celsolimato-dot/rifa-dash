import { useEffect } from 'react';
import { getAffiliateCodeFromUrl, saveAffiliateCode } from '@/utils/affiliateUtils';

/**
 * Hook para rastrear códigos de afiliado na URL
 */
export const useAffiliateTracking = () => {
  useEffect(() => {
    // Capturar código de afiliado da URL
    const affiliateCode = getAffiliateCodeFromUrl();
    
    if (affiliateCode) {
      // Salvar código no localStorage
      saveAffiliateCode(affiliateCode);
      
      // Remover parâmetro da URL sem recarregar a página
      const url = new URL(window.location.href);
      url.searchParams.delete('ref');
      window.history.replaceState({}, document.title, url.toString());
    }
  }, []);
};