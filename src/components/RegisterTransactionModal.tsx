import { RegisterSaleModal } from "./RegisterSaleModal";
import { RegisterRentalModal } from "./RegisterRentalModal";

interface RegisterTransactionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  property: {
    id: string;
    title: string;
    property_code: string;
    transaction_type: "venta" | "alquiler" | "anticresis";
    price_pen?: number;
    price_usd?: number;
  };
  agentId: string;
}

export function RegisterTransactionModal({ 
  open, 
  onOpenChange, 
  property,
  agentId 
}: RegisterTransactionModalProps) {
  // Smart component that renders the appropriate modal based on transaction type
  if (property.transaction_type === "alquiler") {
    return (
      <RegisterRentalModal
        open={open}
        onOpenChange={onOpenChange}
        property={property}
        agentId={agentId}
      />
    );
  }

  // Default to sale modal for "venta" and "anticresis"
  return (
    <RegisterSaleModal
      open={open}
      onOpenChange={onOpenChange}
      property={property}
      agentId={agentId}
    />
  );
}
