/**
 * Utilitários para o sistema de afiliados
 */

export const getAffiliateCodeFromUrl = (): string | null => {
  if (typeof window === 'undefined') return null;
  
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get('ref');
};

export const saveAffiliateCode = (code: string): void => {
  if (typeof window === 'undefined') return;
  
  // Salvar no localStorage por 30 dias
  const expirationDate = new Date();
  expirationDate.setDate(expirationDate.getDate() + 30);
  
  localStorage.setItem('affiliate_ref', JSON.stringify({
    code,
    expires: expirationDate.toISOString()
  }));
};

export const getStoredAffiliateCode = (): string | null => {
  if (typeof window === 'undefined') return null;
  
  try {
    const stored = localStorage.getItem('affiliate_ref');
    if (!stored) return null;
    
    const { code, expires } = JSON.parse(stored);
    const now = new Date();
    const expirationDate = new Date(expires);
    
    if (now > expirationDate) {
      localStorage.removeItem('affiliate_ref');
      return null;
    }
    
    return code;
  } catch (error) {
    console.error('Error reading stored affiliate code:', error);
    return null;
  }
};

export const clearAffiliateCode = (): void => {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('affiliate_ref');
};

export const processAffiliateRegistration = async (newUserId: string): Promise<void> => {
  const affiliateCode = getStoredAffiliateCode();
  if (!affiliateCode) return;
  
  try {
    // Buscar o afiliado que possui este código
    const { supabase } = await import('@/integrations/supabase/client');
    
    const { data: affiliate, error: affiliateError } = await supabase
      .from('affiliates')
      .select('user_id')
      .eq('affiliate_code', affiliateCode)
      .single();
    
    if (affiliateError || !affiliate) {
      console.error('Affiliate not found:', affiliateError);
      clearAffiliateCode();
      return;
    }
    
    // Não pode se auto-referenciar
    if (affiliate.user_id === newUserId) {
      console.log('User cannot refer themselves');
      clearAffiliateCode();
      return;
    }
    
    // Atualizar campo referrer_id no usuário
    const { error: updateError } = await supabase
      .from('users')
      .update({ referrer_id: affiliate.user_id })
      .eq('id', newUserId);
    
    if (updateError) {
      console.error('Error updating user referrer:', updateError);
    } else {
      console.log('User referrer updated successfully');
    }
    
    // Limpar código armazenado após processar
    clearAffiliateCode();
    
  } catch (error) {
    console.error('Error processing affiliate registration:', error);
    clearAffiliateCode();
  }
};