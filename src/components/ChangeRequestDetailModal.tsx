import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useApproveChangeRequest, useRejectChangeRequest } from '@/hooks/useChangeRequests';
import type { ChangeRequest } from '@/hooks/useChangeRequests';
import { CheckCircle, XCircle, ArrowRight } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';

interface ChangeRequestDetailModalProps {
  request: ChangeRequest;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const ChangeRequestDetailModal = ({
  request,
  open,
  onOpenChange,
}: ChangeRequestDetailModalProps) => {
  const [adminNotes, setAdminNotes] = useState('');
  const [applyNow, setApplyNow] = useState(true);
  const approveMutation = useApproveChangeRequest();
  const rejectMutation = useRejectChangeRequest();

  const handleApprove = () => {
    approveMutation.mutate(
      { id: request.id, adminNotes, applyNow },
      {
        onSuccess: () => {
          onOpenChange(false);
          setAdminNotes('');
        },
      }
    );
  };

  const handleReject = () => {
    if (!adminNotes.trim()) {
      alert('Por favor ingresa un motivo para el rechazo');
      return;
    }
    rejectMutation.mutate(
      { id: request.id, adminNotes },
      {
        onSuccess: () => {
          onOpenChange(false);
          setAdminNotes('');
        },
      }
    );
  };

  const renderFieldChange = (label: string, originalValue: any, proposedValue: any) => {
    if (proposedValue === null || proposedValue === undefined) return null;

    return (
      <div className="grid grid-cols-[1fr_auto_1fr] gap-4 items-center py-2">
        <div>
          <p className="text-sm font-medium text-muted-foreground mb-1">{label} (Actual)</p>
          <p className="text-sm">{originalValue || <span className="text-muted-foreground italic">Sin valor</span>}</p>
        </div>
        <ArrowRight className="w-4 h-4 text-muted-foreground" />
        <div>
          <p className="text-sm font-medium text-primary mb-1">{label} (Propuesto)</p>
          <p className="text-sm font-semibold">{proposedValue}</p>
        </div>
      </div>
    );
  };

  const isPending = request.status === 'pending';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Detalle de Solicitud de Cambio</span>
            <Badge variant={isPending ? 'outline' : request.status === 'approved' ? 'default' : 'destructive'}>
              {request.status === 'pending' ? 'Pendiente' : request.status === 'approved' ? 'Aprobado' : 'Rechazado'}
            </Badge>
          </DialogTitle>
          <DialogDescription>
            Propiedad: {request.properties?.property_code} - Agente: {request.agents?.name}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Motivo de la solicitud */}
          {request.request_notes && (
            <div>
              <h3 className="font-semibold mb-2">Motivo de la solicitud:</h3>
              <p className="text-sm text-muted-foreground bg-muted p-3 rounded-lg">
                {request.request_notes}
              </p>
            </div>
          )}

          <Separator />

          {/* Cambios propuestos */}
          <div>
            <h3 className="font-semibold mb-4">Cambios Propuestos:</h3>
            <div className="space-y-2">
              {renderFieldChange('Título', request.original_snapshot?.title, request.proposed_title)}
              {renderFieldChange('Descripción', request.original_snapshot?.description, request.proposed_description)}
              {renderFieldChange('Tipo de Propiedad', request.original_snapshot?.property_type, request.proposed_property_type)}
              {renderFieldChange('Tipo de Transacción', request.original_snapshot?.transaction_type, request.proposed_transaction_type)}
              {renderFieldChange('Precio', request.original_snapshot?.price, request.proposed_price)}
              {renderFieldChange('Moneda', request.original_snapshot?.currency, request.proposed_currency)}
              {renderFieldChange('Ciudad', request.original_snapshot?.city, request.proposed_city)}
              {renderFieldChange('Distrito', request.original_snapshot?.district, request.proposed_district)}
              {renderFieldChange('Provincia', request.original_snapshot?.province, request.proposed_province)}
              {renderFieldChange('Área Total', request.original_snapshot?.area, request.proposed_area)}
              {renderFieldChange('Área Construida', request.original_snapshot?.built_area, request.proposed_built_area)}
              {renderFieldChange('Dormitorios', request.original_snapshot?.bedrooms, request.proposed_bedrooms)}
              {renderFieldChange('Baños', request.original_snapshot?.bathrooms, request.proposed_bathrooms)}
              {renderFieldChange('Estacionamientos', request.original_snapshot?.parking, request.proposed_parking)}
              {renderFieldChange('Antigüedad (años)', request.original_snapshot?.age, request.proposed_age)}
            </div>
          </div>

          {/* Notas del admin si ya fue revisado */}
          {!isPending && request.admin_notes && (
            <>
              <Separator />
              <div>
                <h3 className="font-semibold mb-2">Notas del Administrador:</h3>
                <p className="text-sm bg-muted p-3 rounded-lg">{request.admin_notes}</p>
              </div>
            </>
          )}

          {/* Acciones solo si está pendiente */}
          {isPending && (
            <>
              <Separator />
              <div className="space-y-4">
                <div>
                  <Label htmlFor="admin-notes">Notas del Administrador (opcional para aprobar, requerido para rechazar)</Label>
                  <Textarea
                    id="admin-notes"
                    placeholder="Escribe notas o comentarios sobre esta solicitud..."
                    value={adminNotes}
                    onChange={(e) => setAdminNotes(e.target.value)}
                    rows={3}
                    className="mt-2"
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="apply-now"
                    checked={applyNow}
                    onCheckedChange={setApplyNow}
                  />
                  <Label htmlFor="apply-now" className="cursor-pointer">
                    Aplicar cambios inmediatamente después de aprobar
                  </Label>
                </div>

                <div className="flex gap-3">
                  <Button
                    onClick={handleApprove}
                    disabled={approveMutation.isPending}
                    className="flex-1"
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Aprobar Solicitud
                  </Button>
                  <Button
                    onClick={handleReject}
                    disabled={rejectMutation.isPending}
                    variant="destructive"
                    className="flex-1"
                  >
                    <XCircle className="w-4 h-4 mr-2" />
                    Rechazar Solicitud
                  </Button>
                </div>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
