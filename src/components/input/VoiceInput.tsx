'use client';

import { Button } from '@/components/ui/button';
import { Mic, MicOff } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { useVoice } from '@/hooks/useVoice';

interface VoiceInputProps {
  onTranscript: (text: string) => void;
  disabled?: boolean;
}

export function VoiceInput({ onTranscript, disabled }: VoiceInputProps) {
  const { isListening, isSupported, startListening, stopListening } =
    useVoice(onTranscript);

  if (!isSupported) return null;

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          type="button"
          variant={isListening ? 'destructive' : 'ghost'}
          size="icon-sm"
          onClick={isListening ? stopListening : startListening}
          disabled={disabled}
          className="shrink-0"
        >
          {isListening ? (
            <MicOff className="h-4 w-4" />
          ) : (
            <Mic className="h-4 w-4" />
          )}
        </Button>
      </TooltipTrigger>
      <TooltipContent>
        {isListening ? 'Stop recording' : 'Voice input'}
      </TooltipContent>
    </Tooltip>
  );
}
