import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Mail } from 'lucide-react';
import { useCreateAgentInvitation } from '@/hooks/useAgentInvitations';

interface InviteAgentModalProps {
  isOpen: boolean;
  onClose: () => void;
  agentId: string;
  agentName: string;
}

export const InviteAgentModal = ({ 
  isOpen, 
  onClose, 
  agentId, 
  agentName 
}: InviteAgentModalProps) => {
  const [email, setEmail] = useState('');
  const createInvitation = useCreateAgentInvitation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email.trim()) {
      return;
    }

    try {
      await createInvitation.mutateAsync({
        email: email.trim(),
        agentId
      });
      setEmail('');
      onClose();
    } catch (error) {
      // Error is handled by the mutation
    }
  };

  const handleClose = () => {
    setEmail('');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Invitar Agente
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Agente a invitar</Label>
            <Input 
              value={agentName} 
              disabled 
              className="bg-muted"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email de invitación</Label>
            <Input
              id="email"
              type="email"
              placeholder="ejemplo@correo.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="flex justify-end gap-3">
            <Button 
              type="button" 
              variant="outline" 
              onClick={handleClose}
              disabled={createInvitation.isPending}
            >
              Cancelar
            </Button>
            <Button 
              type="submit" 
              disabled={createInvitation.isPending || !email.trim()}
            >
              {createInvitation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Enviando...
                </>
              ) : (
                'Enviar Invitación'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};