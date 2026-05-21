export type ShippingOption = {
  id: string;
  name: string;
  carrier: string;
  price: number;
  days: number;
  isMock: boolean;
};

export type DeliveryRegion = {
  id: string;
  label: string;
  price: number;
  days: number;
};

export const deliveryRegions: DeliveryRegion[] = [
  {
    id: "sobradinho-2",
    label:
      "Sobradinho 2, Setor de Mansões Sobradinho 2, Contagem, DF 150, DF 425, Grande Colorado e demais localidades de Sobradinho 2",
    price: 10,
    days: 0,
  },
  {
    id: "sobradinho-1",
    label: "Sobradinho 1 e demais localidades de Sobradinho 1",
    price: 15,
    days: 0,
  },
  {
    id: "plano-piloto",
    label: "Plano Piloto",
    price: 25,
    days: 0,
  },
  {
    id: "outra",
    label: "Outra localidade (entrar em contato via WhatsApp para orçamento)",
    price: 0,
    days: 0,
  },
];

export function getShippingOptionByRegion(regionId: string): ShippingOption {
  const region = deliveryRegions.find((r) => r.id === regionId);
  if (!region) {
    throw new Error("Região de entrega inválida.");
  }

  if (region.id === "outra") {
    return {
      id: "outra",
      name: region.label,
      carrier: "Entrega própria",
      price: 0,
      days: 0,
      isMock: false,
    };
  }

  return {
    id: region.id,
    name: `Entrega para ${region.label.split(",")[0]}`,
    carrier: "Entrega própria",
    price: region.price,
    days: region.days,
    isMock: false,
  };
}
