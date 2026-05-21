import { AddressesManager } from "@/components/account/addresses-manager";
import { getCustomerAccountData } from "@/lib/account";
import { requireUser } from "@/lib/access";

export const dynamic = "force-dynamic";

export default async function AccountAddressesPage() {
  const session = await requireUser();
  const user = await getCustomerAccountData(session.user.id);
  if (!user) return null;

  const addresses =
    user.customerProfile?.addresses.map((address) => ({
      id: address.id,
      label: address.label,
      recipientName: address.recipientName,
      street: address.street,
      number: address.number,
      complement: address.complement,
      district: address.district,
      city: address.city,
      state: address.state,
      zipCode: address.zipCode,
      isDefault: address.isDefault,
    })) ?? [];

  return (
    <div className="space-y-4">
      <header>
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-rose-700">
          conta
        </p>
        <h1 className="mt-3 font-serif text-4xl text-stone-900">Enderecos</h1>
      </header>
      <AddressesManager initialAddresses={addresses} />
    </div>
  );
}
