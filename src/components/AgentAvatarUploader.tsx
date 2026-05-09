import { useRef, useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Camera, Loader2 } from 'lucide-react';
import { useAgentAvatar } from '@/hooks/useAgentAvatar';

interface AgentAvatarUploaderProps {
  agentId: string;
  userId: string;
  avatarUrl: string | null;
  agentName: string;
}

export const AgentAvatarUploader = ({ 
  agentId, 
  userId, 
  avatarUrl, 
  agentName 
}: AgentAvatarUploaderProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [imageKey, setImageKey] = useState(Date.now());
  const { uploadAvatar, isUploading } = useAgentAvatar(userId);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    uploadAvatar(
      { agentId, file },
      {
        onSuccess: () => {
          // Actualizar key para forzar recarga de imagen
          setImageKey(Date.now());
          // Limpiar input
          if (fileInputRef.current) {
            fileInputRef.current.value = '';
          }
        },
      }
    );
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const avatarUrlWithCache = avatarUrl ? `${avatarUrl}?t=${imageKey}` : undefined;

  return (
    <div className="relative inline-block">
      <Avatar className="w-16 h-16">
        <AvatarImage src={avatarUrlWithCache} alt={agentName} />
        <AvatarFallback>
          {agentName?.split(' ').map(n => n[0]).join('').toUpperCase() || 'AG'}
        </AvatarFallback>
      </Avatar>
      
      <Button
        size="icon"
        variant="secondary"
        className="absolute bottom-0 right-0 h-7 w-7 rounded-full shadow-lg"
        onClick={handleClick}
        disabled={isUploading}
      >
        {isUploading ? (
          <Loader2 className="h-3 w-3 animate-spin" />
        ) : (
          <Camera className="h-3 w-3" />
        )}
      </Button>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={handleFileChange}
        className="hidden"
        disabled={isUploading}
      />
    </div>
  );
};
