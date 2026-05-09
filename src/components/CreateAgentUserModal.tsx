import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, User, Copy, CheckCircle } from 'lucide-react';
import { useCreateAgentUser } from '@/hooks/useCreateAgentUser';

interface CreateAgentUserModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CreateAgentUserModal = ({ 
  isOpen, 
  onClose
}: CreateAgentUserModalProps) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: ''
  });
  const [credentials, setCredentials] = useState<{email: string; password: string} | null>(null);
  const [copied, setCopied] = useState({ email: false, password: false });
  
  const createAgentUser = useCreateAgentUser();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim() || !formData.email.trim()) {
      return;
    }

    try {
      const response = await createAgentUser.mutateAsync({
        name: formData.name.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim() || undefined
      });
      
      setCredentials(response.credentials);
    } catch (error) {
      // Error is handled by the mutation
    }
  };

  const handleClose = () => {
    setFormData({ name: '', email: '', phone: '' });
    setCredentials(null);
    setCopied({ email: false, password: false });
    onClose();
  };

  const copyToClipboard = async (text: string, type: 'email' | 'password') => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(prev => ({ ...prev, [type]: true }));
      setTimeout(() => {
        setCopied(prev => ({ ...prev, [type]: false }));
      }, 2000);
    } catch (err) {
      console.error('Error copying to clipboard:', err);
    }
  };

  if (credentials) {
    return (
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              Agente Creado Exitosamente
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <Alert>
              <AlertDescription>
                El agente ha sido creado con las siguientes credenciales. 
                Copia y comparte estas credenciales de forma segura:
              </AlertDescription>
            </Alert>

            <div className="space-y-3">
              <div className="space-y-2">
                <Label className="text-sm font-medium">Email de acceso</Label>
                <div className="flex items-center gap-2">
                  <Input 
                    value={credentials.email} 
                    readOnly 
                    className="bg-muted"
                  />
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => copyToClipboard(credentials.email, 'email')}
                  >
                    {copied.email ? (
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium">Contraseña temporal</Label>
                <div className="flex items-center gap-2">
                  <Input 
                    value={credentials.password} 
                    readOnly 
                    className="bg-muted font-mono"
                    type="text"
                  />
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => copyToClipboard(credentials.password, 'password')}
                  >
                    {copied.password ? (
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
            </div>

            <Alert>
              <AlertDescription className="text-sm">
                <strong>Importante:</strong> El agente deberá cambiar su contraseña al iniciar sesión por primera vez.
              </AlertDescription>
            </Alert>

            <div className="flex justify-end">
              <Button onClick={handleClose}>
                Entendido
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Crear Nuevo Agente
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nombre completo *</Label>
            <Input
              id="name"
              placeholder="Ej: María González"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email *</Label>
            <Input
              id="email"
              type="email"
              placeholder="maria@empresa.com"
              value={formData.email}
              onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Teléfono</Label>
            <Input
              id="phone"
              placeholder="+51 987 654 321"
              value={formData.phone}
              onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
            />
          </div>

          <Alert>
            <AlertDescription className="text-sm">
              Se creará una cuenta de usuario con una contraseña temporal que el agente 
              deberá cambiar al iniciar sesión.
            </AlertDescription>
          </Alert>

          <div className="flex justify-end gap-3">
            <Button 
              type="button" 
              variant="outline" 
              onClick={handleClose}
              disabled={createAgentUser.isPending}
            >
              Cancelar
            </Button>
            <Button 
              type="submit" 
              disabled={createAgentUser.isPending || !formData.name.trim() || !formData.email.trim()}
            >
              {createAgentUser.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Creando...
                </>
              ) : (
                'Crear Agente'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};