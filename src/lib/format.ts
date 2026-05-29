export function formatOrderNumber(orderNumber: number | null | undefined): string {
  return `#${String(orderNumber ?? 0).padStart(5, "0")}`;
}

export function formatPrice(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

export const orderStatusLabels: Record<string, string> = {
  PENDING: "Pendente",
  PAID: "Pago",
  PREPARING: "Preparando",
  SHIPPED: "Enviado",
  DELIVERED: "Entregue",
  CANCELED: "Cancelado",
};

export const paymentStatusLabels: Record<string, string> = {
  PENDING: "Pendente",
  APPROVED: "Aprovado",
  REJECTED: "Rejeitado",
  REFUNDED: "Reembolsado",
};

export const shipmentStatusLabels: Record<string, string> = {
  PENDING: "Pendente",
  READY_TO_SHIP: "Pronto para envio",
  SHIPPED: "Enviado",
  DELIVERED: "Entregue",
  RETURNED: "Devolvido",
};
