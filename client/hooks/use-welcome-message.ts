import { useState } from 'react';
import { supabase } from '@/lib/supabase';

export const useWelcomeMessage = (groupId: string) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sendWelcomeMessage = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const { data: groupData, error: groupError } = await supabase
        .from('groups')
        .select('welcomed')
        .eq('id', parseInt(groupId))
        .single();

      if (groupError) throw groupError;

      if (groupData?.welcomed) {
        return;
      }

      const { error: txnError } = await supabase.rpc('welcome_group_transaction', {
        p_group_id: parseInt(groupId)
      });

      if (txnError) {
        if (txnError.message.includes('already welcomed')) {
          console.log('Group was already welcomed by another process');
          return;
        }
        throw txnError;
      }

      const response = await fetch('/api/welcome-message', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ groupId }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate welcome message');
      }

      const { message } = await response.json();
      
      const { error: insertError } = await supabase
        .from('messages')
        .insert({
          content: message,
          group_id: parseInt(groupId),
          user_id: '00000000-0000-0000-0000-000000000000', // System bot user
        });

      if (insertError) {
        throw insertError;
      }

    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      console.error('Welcome message error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    sendWelcomeMessage,
    isLoading,
    error,
  };
}; 