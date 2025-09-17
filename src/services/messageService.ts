import { supabase } from '../lib/supabase';

export interface Message {
  id: string;
  user_id: string;
  content: string;
  type: 'text' | 'image' | 'file';
  created_at: string;
  user?: {
    name: string;
    avatar?: string;
  };
}

export interface CreateMessageData {
  user_id: string;
  content: string;
  type: 'text' | 'image' | 'file';
}

export class MessageService {
  async getMessages(): Promise<Message[]> {
    const { data, error } = await supabase
      .from('messages')
      .select(`
        *,
        user:users(name, avatar)
      `)
      .order('created_at', { ascending: true });

    if (error) {
      throw new Error(`Erro ao buscar mensagens: ${error.message}`);
    }

    return data || [];
  }

  async createMessage(messageData: CreateMessageData): Promise<Message> {
    const { data, error } = await supabase
      .from('messages')
      .insert(messageData)
      .select(`
        *,
        user:users(name, avatar)
      `)
      .single();

    if (error) {
      throw new Error(`Erro ao criar mensagem: ${error.message}`);
    }

    return data;
  }

  async deleteMessage(id: string): Promise<void> {
    const { error } = await supabase
      .from('messages')
      .delete()
      .eq('id', id);

    if (error) {
      throw new Error(`Erro ao deletar mensagem: ${error.message}`);
    }
  }

  // Subscription para mensagens em tempo real
  subscribeToMessages(callback: (message: Message) => void) {
    return supabase
      .channel('messages')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages'
        },
        async (payload) => {
          // Buscar a mensagem completa com dados do usuário
          const { data } = await supabase
            .from('messages')
            .select(`
              *,
              user:users(name, avatar)
            `)
            .eq('id', payload.new.id)
            .single();

          if (data) {
            callback(data);
          }
        }
      )
      .subscribe();
  }
}