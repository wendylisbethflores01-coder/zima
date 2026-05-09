import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAgentChangeRequests } from '@/hooks/useChangeRequests';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { Clock, CheckCircle, XCircle, FileText } from 'lucide-react';

interface ChangeRequestsListProps {
  agentId: string;
}

export const ChangeRequestsList = ({ agentId }: ChangeRequestsListProps) => {
  const { data: requests, isLoading } = useAgentChangeRequests(agentId);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return (
          <Badge variant="outline" className="bg-yellow-500/10 text-yellow-700 border-yellow-500/20">
            <Clock className="w-3 h-3 mr-1" />
            Pendiente
          </Badge>
        );
      case 'approved':
        return (
          <Badge variant="outline" className="bg-green-500/10 text-green-700 border-green-500/20">
            <CheckCircle className="w-3 h-3 mr-1" />
            Aprobado
          </Badge>
        );
      case 'rejected':
        return (
          <Badge variant="outline" className="bg-red-500/10 text-red-700 border-red-500/20">
            <XCircle className="w-3 h-3 mr-1" />
            Rechazado
          </Badge>
        );
      default:
        return null;
    }
  };

  if (isLoading) {
    return <div className="text-center py-8">Cargando solicitudes...</div>;
  }

  if (!requests || requests.length === 0) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="text-center text-muted-foreground">
            <FileText className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>No tienes solicitudes de cambio enviadas</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {requests.map((request) => (
        <Card key={request.id}>
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <CardTitle className="text-lg">
                  {request.properties?.property_code} - {request.properties?.title}
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  Enviada {formatDistanceToNow(new Date(request.created_at), { addSuffix: true, locale: es })}
                </p>
              </div>
              {getStatusBadge(request.status)}
            </div>
          </CardHeader>
          <CardContent>
            {request.request_notes && (
              <div className="mb-3">
                <p className="text-sm font-medium mb-1">Motivo de la solicitud:</p>
                <p className="text-sm text-muted-foreground">{request.request_notes}</p>
              </div>
            )}
            
            {request.status === 'rejected' && request.admin_notes && (
              <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-3">
                <p className="text-sm font-medium text-destructive mb-1">Motivo del rechazo:</p>
                <p className="text-sm text-destructive/90">{request.admin_notes}</p>
              </div>
            )}
            
            {request.status === 'approved' && request.admin_notes && (
              <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-3">
                <p className="text-sm font-medium text-green-700 mb-1">Nota del administrador:</p>
                <p className="text-sm text-green-700/90">{request.admin_notes}</p>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
