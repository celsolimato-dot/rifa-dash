/**
 * Valida CPF brasileiro seguindo o algoritmo oficial
 * Verifica se o CPF é válido segundo a Receita Federal
 */
export function validateCPF(cpf: string): boolean {
  // Remove caracteres não numéricos
  const numbers = cpf.replace(/\D/g, '');
  
  // Verifica se tem 11 dígitos
  if (numbers.length !== 11) return false;
  
  // Verifica se todos os dígitos são iguais (CPFs inválidos conhecidos)
  if (/^(\d)\1{10}$/.test(numbers)) return false;
  
  // Calcula o primeiro dígito verificador
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += parseInt(numbers[i]) * (10 - i);
  }
  let digit1 = (sum * 10) % 11;
  if (digit1 === 10) digit1 = 0;
  
  // Verifica o primeiro dígito
  if (digit1 !== parseInt(numbers[9])) return false;
  
  // Calcula o segundo dígito verificador
  sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += parseInt(numbers[i]) * (11 - i);
  }
  let digit2 = (sum * 10) % 11;
  if (digit2 === 10) digit2 = 0;
  
  // Verifica o segundo dígito
  if (digit2 !== parseInt(numbers[10])) return false;
  
  return true;
}

/**
 * Formata CPF para exibição (xxx.xxx.xxx-xx)
 */
export function formatCPF(value: string): string {
  const numbers = value.replace(/\D/g, '');
  
  if (numbers.length <= 11) {
    return numbers.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  }
  
  return numbers.slice(0, 11).replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
}

/**
 * Valida telefone brasileiro (10 ou 11 dígitos)
 */
export function validatePhone(phone: string): boolean {
  const numbers = phone.replace(/\D/g, '');
  return numbers.length >= 10 && numbers.length <= 11;
}

/**
 * Formata telefone brasileiro
 */
export function formatPhone(value: string): string {
  const numbers = value.replace(/\D/g, '');
  
  if (numbers.length <= 10) {
    return numbers.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
  }
  
  return numbers.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
}