import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { TestTube, CheckCircle, XCircle, Loader2 } from 'lucide-react';

export const TestWebhookButton: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [testResult, setTestResult] = useState<{
    success: boolean;
    message: string;
    details?: any;
  } | null>(null);

  const handleTestWebhook = async () => {
    setIsLoading(true);
    setTestResult(null);

    try {
      console.log('🧪 Iniciando teste do webhook...');
      
      const { data, error } = await supabase.functions.invoke('test-webhook', {
        body: {}
      });

      if (error) {
        console.error('❌ Erro na função de teste:', error);
        setTestResult({
          success: false,
          message: `Erro: ${error.message}`,
          details: error
        });
        toast.error('Erro ao testar webhook');
        return;
      }

      console.log('✅ Resultado do teste:', data);
      
      setTestResult({
        success: data.success,
        message: data.message,
        details: data
      });

      if (data.success) {
        toast.success('Webhook testado com sucesso!');
      } else {
        toast.error('Falha no teste do webhook');
      }

    } catch (error) {
      console.error('❌ Erro no teste:', error);
      setTestResult({
        success: false,
        message: `Erro: ${error instanceof Error ? error.message : 'Erro desconhecido'}`,
        details: error
      });
      toast.error('Erro ao testar webhook');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4 p-4 border rounded-lg">
      <div className="flex items-center gap-2">
        <TestTube className="w-5 h-5" />
        <h3 className="font-semibold">Teste do Webhook</h3>
      </div>
      
      <p className="text-sm text-muted-foreground">
        Clique para simular um webhook de pagamento confirmado do AbacatePay
      </p>

      <Button 
        onClick={handleTestWebhook} 
        disabled={isLoading}
        className="w-full"
      >
        {isLoading ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Testando...
          </>
        ) : (
          <>
            <TestTube className="w-4 h-4 mr-2" />
            Testar Webhook
          </>
        )}
      </Button>

      {testResult && (
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            {testResult.success ? (
              <CheckCircle className="w-5 h-5 text-green-500" />
            ) : (
              <XCircle className="w-5 h-5 text-red-500" />
            )}
            <Badge variant={testResult.success ? "default" : "destructive"}>
              {testResult.success ? "Sucesso" : "Falha"}
            </Badge>
          </div>
          
          <p className="text-sm">{testResult.message}</p>
          
          {testResult.details && (
            <details className="text-xs">
              <summary className="cursor-pointer text-muted-foreground">
                Ver detalhes técnicos
              </summary>
              <pre className="mt-2 p-2 bg-muted rounded text-xs overflow-x-auto">
                {JSON.stringify(testResult.details, null, 2)}
              </pre>
            </details>
          )}
        </div>
      )}
    </div>
  );
};