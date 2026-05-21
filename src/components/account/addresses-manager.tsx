"use client";

import { useState } from "react";

type Address = {
  id: string;
  label: string | null;
  recipientName: string;
  street: string;
  number: string;
  complement: string | null;
  district: string;
  city: string;
  state: string;
  zipCode: string;
  isDefault: boolean;
};

type Props = {
  initialAddresses: Address[];
};

const emptyAddress = {
  id: "",
  label: "",
  recipientName: "",
  street: "",
  number: "",
  complement: "",
  district: "",
  city: "",
  state: "",
  zipCode: "",
  isDefault: false,
};

export function AddressesManager({ initialAddresses }: Props) {
  const [addresses, setAddresses] = useState<Address[]>(initialAddresses);
  const [draft, setDraft] = useState(emptyAddress);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function resetDraft() {
    setDraft(emptyAddress);
    setEditingId(null);
  }

  async function saveAddress() {
    setLoading(true);
    setMessage(null);
    const payload = {
      label: draft.label || undefined,
      recipientName: draft.recipientName,
      street: draft.street,
      number: draft.number,
      complement: draft.complement || undefined,
      district: draft.district,
      city: draft.city,
      state: draft.state,
      zipCode: draft.zipCode,
      isDefault: draft.isDefault,
    };

    const isEdit = Boolean(editingId);
    const endpoint = isEdit
      ? `/api/account/addresses/${editingId}`
      : "/api/account/addresses";
    const method = isEdit ? "PUT" : "POST";

    const response = await fetch(endpoint, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = (await response.json()) as {
      ok: boolean;
      message?: string;
      address?: Address;
    };

    setLoading(false);
    if (!response.ok || !data.ok || !data.address) {
      setMessage(data.message ?? "Nao foi possivel salvar endereco.");
      return;
    }

    if (isEdit) {
      setAddresses((prev) =>
        prev.map((item) => (item.id === data.address!.id ? data.address! : item)),
      );
      setMessage("Endereco atualizado.");
    } else {
      setAddresses((prev) => [data.address!, ...prev]);
      setMessage("Endereco criado.");
    }
    resetDraft();
  }

  async function removeAddress(id: string) {
    setLoading(true);
    setMessage(null);
    const response = await fetch(`/api/account/addresses/${id}`, {
      method: "DELETE",
    });
    const data = (await response.json()) as { ok: boolean; message?: string };
    setLoading(false);
    if (!response.ok || !data.ok) {
      setMessage(data.message ?? "Nao foi possivel remover endereco.");
      return;
    }
    setAddresses((prev) => prev.filter((item) => item.id !== id));
    setMessage("Endereco removido.");
  }

  function startEdit(address: Address) {
    setEditingId(address.id);
    setDraft({
      ...address,
      label: address.label ?? "",
      complement: address.complement ?? "",
    });
  }

  return (
    <div className="space-y-8">
      <div className="space-y-3">
        <h2 className="font-serif text-2xl text-stone-900">
          {editingId ? "Editar endereco" : "Novo endereco"}
        </h2>
        <div className="grid gap-3 sm:grid-cols-2">
          <input className="rounded-xl border border-stone-300 px-4 py-3" placeholder="Apelido (Casa, Trabalho)" value={draft.label} onChange={(e) => setDraft((v) => ({ ...v, label: e.target.value }))} />
          <input className="rounded-xl border border-stone-300 px-4 py-3" placeholder="Nome do recebedor" value={draft.recipientName} onChange={(e) => setDraft((v) => ({ ...v, recipientName: e.target.value }))} />
          <input className="rounded-xl border border-stone-300 px-4 py-3 sm:col-span-2" placeholder="Rua" value={draft.street} onChange={(e) => setDraft((v) => ({ ...v, street: e.target.value }))} />
          <input className="rounded-xl border border-stone-300 px-4 py-3" placeholder="Numero" value={draft.number} onChange={(e) => setDraft((v) => ({ ...v, number: e.target.value }))} />
          <input className="rounded-xl border border-stone-300 px-4 py-3" placeholder="Complemento" value={draft.complement} onChange={(e) => setDraft((v) => ({ ...v, complement: e.target.value }))} />
          <input className="rounded-xl border border-stone-300 px-4 py-3" placeholder="Bairro" value={draft.district} onChange={(e) => setDraft((v) => ({ ...v, district: e.target.value }))} />
          <input className="rounded-xl border border-stone-300 px-4 py-3" placeholder="Cidade" value={draft.city} onChange={(e) => setDraft((v) => ({ ...v, city: e.target.value }))} />
          <input className="rounded-xl border border-stone-300 px-4 py-3" placeholder="UF" value={draft.state} onChange={(e) => setDraft((v) => ({ ...v, state: e.target.value }))} />
          <input className="rounded-xl border border-stone-300 px-4 py-3" placeholder="CEP" value={draft.zipCode} onChange={(e) => setDraft((v) => ({ ...v, zipCode: e.target.value }))} />
          <label className="flex items-center gap-2 text-sm text-stone-700">
            <input
              type="checkbox"
              checked={draft.isDefault}
              onChange={(e) =>
                setDraft((v) => ({ ...v, isDefault: e.target.checked }))
              }
            />
            Definir como endereco padrao
          </label>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={saveAddress}
            disabled={loading}
            className="rounded-xl bg-stone-900 px-4 py-2 text-sm text-white"
          >
            {loading ? "Salvando..." : editingId ? "Atualizar" : "Criar endereco"}
          </button>
          {editingId ? (
            <button
              type="button"
              onClick={resetDraft}
              className="rounded-xl border border-stone-300 px-4 py-2 text-sm"
            >
              Cancelar
            </button>
          ) : null}
        </div>
      </div>

      <div className="space-y-3">
        <h3 className="font-serif text-2xl text-stone-900">Meus enderecos</h3>
        {addresses.length === 0 ? (
          <p className="text-sm text-stone-600">Nenhum endereco cadastrado.</p>
        ) : (
          <div className="space-y-3">
            {addresses.map((address) => (
              <div
                key={address.id}
                className="rounded-2xl border border-stone-200 p-4"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="font-semibold text-stone-900">
                      {address.label || "Endereco"}{" "}
                      {address.isDefault ? (
                        <span className="text-xs text-rose-700">(Padrao)</span>
                      ) : null}
                    </p>
                    <p className="text-sm text-stone-700">
                      {address.recipientName}
                    </p>
                    <p className="text-sm text-stone-600">
                      {address.street}, {address.number}
                      {address.complement ? ` - ${address.complement}` : ""} ·{" "}
                      {address.district} · {address.city}/{address.state} ·{" "}
                      {address.zipCode}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => startEdit(address)}
                      className="rounded-xl border border-stone-300 px-3 py-1.5 text-xs"
                    >
                      Editar
                    </button>
                    <button
                      type="button"
                      onClick={() => removeAddress(address.id)}
                      className="rounded-xl border border-red-300 px-3 py-1.5 text-xs text-red-700"
                    >
                      Remover
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {message ? <p className="text-sm text-stone-700">{message}</p> : null}
    </div>
  );
}
