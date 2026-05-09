import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useUpdateAgent } from "@/hooks/useUpdateAgent";
import { Mail, Phone, MessageCircle } from "lucide-react";

interface EditAgentInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  agentId: string;
  currentEmail: string | null;
  currentPhone: string | null;
  currentWhatsapp: string | null;
}

export const EditAgentInfoModal = ({
  isOpen,
  onClose,
  agentId,
  currentEmail,
  currentPhone,
  currentWhatsapp,
}: EditAgentInfoModalProps) => {
  const [email, setEmail] = useState(currentEmail || "");
  const [phone, setPhone] = useState(currentPhone || "");
  const [whatsapp, setWhatsapp] = useState(currentWhatsapp || "");
  const updateAgent = useUpdateAgent();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    await updateAgent.mutateAsync({
      agentId,
      data: {
        email: email.trim() || null,
        phone: phone.trim() || null,
        whatsapp: whatsapp.trim() || null,
      },
    });

    onClose();
  };

  const handleClose = () => {
    setEmail(currentEmail || "");
    setPhone(currentPhone || "");
    setWhatsapp(currentWhatsapp || "");
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Editar Información de Contacto</DialogTitle>
          <DialogDescription>
            Actualiza tu correo electrónico y número de teléfono
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="flex items-center gap-2">
                <Mail className="w-4 h-4" />
                Correo Electrónico
              </Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="correo@ejemplo.com"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone" className="flex items-center gap-2">
                <Phone className="w-4 h-4" />
                Teléfono
              </Label>
              <Input
                id="phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+51 999 999 999"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="whatsapp" className="flex items-center gap-2">
                <MessageCircle className="w-4 h-4" />
                WhatsApp
              </Label>
              <Input
                id="whatsapp"
                type="url"
                value={whatsapp}
                onChange={(e) => setWhatsapp(e.target.value)}
                placeholder="wa.me/51999999999"
              />
              <p className="text-xs text-muted-foreground">
                Ingresa el enlace de WhatsApp en formato: wa.me/51999999999
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={updateAgent.isPending}>
              {updateAgent.isPending ? "Guardando..." : "Guardar Cambios"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
