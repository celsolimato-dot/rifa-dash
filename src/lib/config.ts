// Configuração para detectar modo de desenvolvimento
export const isDevelopmentMode = () => {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
  
  // Se as variáveis não existem ou são placeholders
  if (!supabaseUrl || !supabaseKey || 
      supabaseUrl === 'https://your-project.supabase.co' ||
      supabaseKey === 'your_anon_key_here') {
    return true;
  }
  
  // Verifica se a chave JWT é de demonstração
  if (supabaseKey.startsWith('eyJ')) {
    try {
      const payload = JSON.parse(atob(supabaseKey.split('.')[1]));
      // Se o issuer é supabase-demo, está em modo desenvolvimento
      return payload.iss === 'supabase-demo';
    } catch (error) {
      console.warn('Erro ao decodificar JWT, assumindo modo desenvolvimento');
      return true;
    }
  }
  
  return false;
};

export const config = {
  isDevelopment: true,
  supabase: {
    url: import.meta.env.VITE_SUPABASE_URL || '',
    anonKey: import.meta.env.VITE_SUPABASE_ANON_KEY || '',
  },
};