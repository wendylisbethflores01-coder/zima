import { useState } from 'react';
import { useChangeRequests } from '@/hooks/useChangeRequests';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Clock, CheckCircle, XCircle, Eye } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { ChangeRequestDetailModal } from './ChangeRequestDetailModal';
import type { ChangeRequest } from '@/hooks/useChangeRequests';

export const ChangeRequestsInbox = () => {
  const [selectedRequest, setSelectedRequest] = useState<ChangeRequest | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>('pending');

  const { data: requests, isLoading } = useChangeRequests({ status: statusFilter });

  const handleViewDetails = (request: ChangeRequest) => {
    setSelectedRequest(request);
    setIsDetailModalOpen(true);
  };

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

  const countChanges = (request: ChangeRequest) => {
    let count = 0;
    const fields = [
      'proposed_title', 'proposed_description', 'proposed_property_type',
      'proposed_transaction_type', 'proposed_price', 'proposed_currency',
      'proposed_city', 'proposed_district', 'proposed_province', 'proposed_area',
      'proposed_built_area', 'proposed_bedrooms', 'proposed_bathrooms',
      'proposed_parking', 'proposed_age'
    ];
    
    fields.forEach(field => {
      if (request[field as keyof ChangeRequest] !== null) count++;
    });
    
    return count;
  };

  if (isLoading) {
    return <div className="text-center py-8">Cargando solicitudes...</div>;
  }

  return (
    <>
      <Tabs value={statusFilter} onValueChange={setStatusFilter} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="pending">Pendientes</TabsTrigger>
          <TabsTrigger value="approved">Aprobadas</TabsTrigger>
          <TabsTrigger value="rejected">Rechazadas</TabsTrigger>
        </TabsList>

        <TabsContent value={statusFilter} className="space-y-4 mt-4">
          {!requests || requests.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                No hay solicitudes {statusFilter === 'pending' ? 'pendientes' : statusFilter === 'approved' ? 'aprobadas' : 'rechazadas'}
              </CardContent>
            </Card>
          ) : (
            requests.map((request) => (
              <Card key={request.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold">
                          {request.properties?.property_code} - {request.properties?.title}
                        </h3>
                        {getStatusBadge(request.status)}
                      </div>
                      
                      <div className="text-sm text-muted-foreground space-y-1">
                        <p>
                          <span className="font-medium">Agente:</span> {request.agents?.name}
                        </p>
                        <p>
                          <span className="font-medium">Cambios propuestos:</span> {countChanges(request)} campos modificados
                        </p>
                        <p>
                          Enviada {formatDistanceToNow(new Date(request.created_at), { addSuffix: true, locale: es })}
                        </p>
                      </div>
                    </div>
                    
                    <Button onClick={() => handleViewDetails(request)} variant="outline" size="sm">
                      <Eye className="w-4 h-4 mr-2" />
                      Ver Detalles
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>
      </Tabs>

      {selectedRequest && (
        <ChangeRequestDetailModal
          request={selectedRequest}
          open={isDetailModalOpen}
          onOpenChange={setIsDetailModalOpen}
        />
      )}
    </>
  );
};
