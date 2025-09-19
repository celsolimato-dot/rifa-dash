import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Trophy, Crown } from 'lucide-react';

interface WinnerBadgeProps {
  winnerName: string;
  winningNumber: string;
  variant?: 'default' | 'compact' | 'detailed';
  className?: string;
}

export const WinnerBadge: React.FC<WinnerBadgeProps> = ({ 
  winnerName, 
  winningNumber, 
  variant = 'default',
  className = '' 
}) => {
  if (variant === 'compact') {
    return (
      <Badge className={`bg-gradient-to-r from-yellow-500 to-orange-500 text-white shadow-lg animate-pulse ${className}`}>
        <Crown className="w-3 h-3 mr-1" />
        Sorteado
      </Badge>
    );
  }

  if (variant === 'detailed') {
    return (
      <div className={`bg-gradient-to-r from-yellow-50 to-orange-50 border-2 border-yellow-200 rounded-xl p-4 ${className}`}>
        <div className="flex items-center justify-center mb-2">
          <Trophy className="w-6 h-6 text-yellow-600 mr-2" />
          <span className="text-lg font-bold text-yellow-800">Rifa Sorteada!</span>
        </div>
        <div className="text-center space-y-1">
          <p className="text-sm text-gray-700">
            <span className="font-semibold">Vencedor:</span> {winnerName}
          </p>
          <p className="text-sm text-gray-700">
            <span className="font-semibold">Número:</span> {winningNumber}
          </p>
        </div>
      </div>
    );
  }

  return (
    <Badge className={`bg-gradient-to-r from-yellow-500 to-orange-500 text-white shadow-lg ${className}`}>
      <Trophy className="w-3 h-3 mr-1" />
      Finalizada e Sorteada
    </Badge>
  );
};