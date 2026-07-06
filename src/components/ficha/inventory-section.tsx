"use client";

import { useState } from "react";
import type { InventoryItem, Equipment } from "@/lib/types";
import { INVENTORY_SLOTS } from "@/lib/constants";
import { createClient } from "@/lib/supabase/client";
import { Backpack, Plus, Trash2, Swords, Shield } from "lucide-react";

interface Props {
  characterId: string;
  initialInventory: InventoryItem[];
  initialEquipment: Equipment[];
  onUpdate: (inventory: InventoryItem[], equipment: Equipment[]) => void;
}

export function InventorySection({ characterId, initialInventory, initialEquipment, onUpdate }: Props) {
  const [inventory, setInventory] = useState<InventoryItem[]>(initialInventory);
  const [equipment, setEquipment] = useState<Equipment[]>(initialEquipment);
  const [hasBackpack, setHasBackpack] = useState(false);
  const [showAddItem, setShowAddItem] = useState(false);
  const [newItem, setNewItem] = useState({ name: "", size: "pequeno" as InventoryItem["size"], quantity: 1 });
  const [showAddEquipment, setShowAddEquipment] = useState(false);
  const [newEquipment, setNewEquipment] = useState({ name: "", type: "arma" as Equipment["type"], damage: "" });

  const totalGrande = inventory.filter((i) => i.size === "grande" || i.size === "pesado").reduce((s, i) => s + (i.size === "pesado" ? 2 : 1) * i.quantity, 0);
  const totalMedio = inventory.filter((i) => i.size === "medio").reduce((s, i) => s + i.quantity, 0);
  const totalPequeno = inventory.filter((i) => i.size === "pequeno").reduce((s, i) => s + i.quantity, 0);

  const maxMedio = INVENTORY_SLOTS.medio + (hasBackpack ? 1 : 0);
  const isPesado = totalGrande > INVENTORY_SLOTS.grande || totalMedio > maxMedio || totalPequeno > INVENTORY_SLOTS.pequeno;

  async function persist(inv: InventoryItem[], eq: Equipment[]) {
    const supabase = createClient();
    await supabase.from("personagens").update({ inventory: inv, equipment: eq }).eq("id", characterId);
  }

  function addItem() {
    if (!newItem.name) return;
    const updated = [...inventory, { ...newItem }];
    setInventory(updated);
    setNewItem({ name: "", size: "pequeno", quantity: 1 });
    setShowAddItem(false);
    persist(updated, equipment);
    onUpdate(updated, equipment);
  }

  function removeItem(index: number) {
    const updated = inventory.filter((_, i) => i !== index);
    setInventory(updated);
    persist(updated, equipment);
    onUpdate(updated, equipment);
  }

  function addEquipment() {
    if (!newEquipment.name) return;
    const updated = [...equipment, { ...newEquipment, description: "", equipped: true }];
    setEquipment(updated);
    setNewEquipment({ name: "", type: "arma", damage: "" });
    setShowAddEquipment(false);
    persist(inventory, updated);
    onUpdate(inventory, updated);
  }

  function removeEquipment(index: number) {
    const updated = equipment.filter((_, i) => i !== index);
    setEquipment(updated);
    persist(inventory, updated);
    onUpdate(inventory, updated);
  }

  function toggleEquipped(index: number) {
    const updated = equipment.map((e, i) => (i === index ? { ...e, equipped: !e.equipped } : e));
    setEquipment(updated);
    persist(inventory, updated);
    onUpdate(inventory, updated);
  }

  return (
    <div className="border border-zinc-800 rounded-xl p-5 bg-zinc-950/50 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xs uppercase tracking-[0.2em] text-zinc-400 flex items-center gap-2">
          <Backpack size={12} /> Inventário
        </h2>
        <div className="flex items-center gap-3">
          <span className="text-[10px] font-mono text-zinc-600">
            G:{totalGrande}/{INVENTORY_SLOTS.grande} M:{totalMedio}/{maxMedio} P:{totalPequeno}/{INVENTORY_SLOTS.pequeno}
          </span>
          <button
            type="button"
            onClick={() => setHasBackpack(!hasBackpack)}
            className={`text-[10px] px-2 py-0.5 rounded font-mono border transition-all ${
              hasBackpack
                ? "bg-zinc-800/50 border-zinc-600 text-zinc-300"
                : "border-zinc-800 text-zinc-600 hover:text-zinc-400"
            }`}
          >
            Mochila {hasBackpack ? "✓" : ""}
          </button>
        </div>
      </div>

      {isPesado && (
        <div className="text-[10px] text-yellow-400 font-mono bg-yellow-400/10 border border-yellow-600/30 rounded px-3 py-1.5">
          ⚠ Inventário lotado! Condição Pesado (-5 Mobilidade, 1 ação simples)
        </div>
      )}

      {/* Equipment */}
      {equipment.length > 0 && (
        <div>
          <span className="text-[10px] text-zinc-600 font-mono block mb-2">Equipamentos</span>
          <div className="space-y-1">
            {equipment.map((eq, i) => (
              <div key={i} className="flex items-center justify-between border border-zinc-800 rounded px-3 py-1.5">
                <div className="flex items-center gap-2">
                  {eq.type === "arma" ? <Swords size={10} className="text-zinc-500" /> : <Shield size={10} className="text-zinc-500" />}
                  <span className="text-xs text-zinc-300 font-mono">{eq.name}</span>
                  {eq.damage && <span className="text-[10px] text-zinc-600 font-mono">({eq.damage})</span>}
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => toggleEquipped(i)}
                    className={`text-[9px] px-1.5 py-0.5 rounded font-mono transition-all ${
                      eq.equipped ? "text-green-400 bg-green-400/10" : "text-zinc-700"
                    }`}
                  >
                    {eq.equipped ? "Equipado" : "Guardado"}
                  </button>
                  <button type="button" onClick={() => removeEquipment(i)} className="text-zinc-700 hover:text-red-400 transition-colors">
                    <Trash2 size={10} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Inventory items */}
      {inventory.length > 0 && (
        <div>
          <span className="text-[10px] text-zinc-600 font-mono block mb-2">Itens</span>
          <div className="space-y-1">
            {inventory.map((item, i) => (
              <div key={i} className="flex items-center justify-between border border-zinc-800 rounded px-3 py-1.5">
                <span className="text-xs text-zinc-300 font-mono">
                  {item.name} <span className="text-zinc-600">({item.size})</span>
                  {item.quantity > 1 && <span className="text-zinc-500"> x{item.quantity}</span>}
                </span>
                <button type="button" onClick={() => removeItem(i)} className="text-zinc-700 hover:text-red-400 transition-colors">
                  <Trash2 size={10} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Add buttons */}
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => setShowAddItem(!showAddItem)}
          className="flex items-center gap-1 border border-zinc-800 rounded px-3 py-1.5 text-[10px] font-mono text-zinc-500 hover:border-zinc-600 hover:text-zinc-300 transition-all"
        >
          <Plus size={10} /> Item
        </button>
        <button
          type="button"
          onClick={() => setShowAddEquipment(!showAddEquipment)}
          className="flex items-center gap-1 border border-zinc-800 rounded px-3 py-1.5 text-[10px] font-mono text-zinc-500 hover:border-zinc-600 hover:text-zinc-300 transition-all"
        >
          <Plus size={10} /> Equipamento
        </button>
      </div>

      {showAddItem && (
        <div className="border border-zinc-800 rounded-lg p-3 space-y-2">
          <input
            value={newItem.name}
            onChange={(e) => setNewItem((f) => ({ ...f, name: e.target.value }))}
            className="w-full bg-black border border-zinc-800 rounded px-3 py-1.5 text-xs font-mono text-zinc-100"
            placeholder="Nome do item"
          />
          <div className="flex gap-2">
            <select
              value={newItem.size}
              onChange={(e) => setNewItem((f) => ({ ...f, size: e.target.value as InventoryItem["size"] }))}
              className="flex-1 bg-black border border-zinc-800 rounded px-2 py-1.5 text-[10px] font-mono text-zinc-100"
            >
              <option value="pequeno">Pequeno</option>
              <option value="medio">Médio</option>
              <option value="grande">Grande</option>
              <option value="pesado">Pesado (2 espaços)</option>
            </select>
            <input
              type="number"
              value={newItem.quantity}
              onChange={(e) => setNewItem((f) => ({ ...f, quantity: Math.max(1, Number(e.target.value)) }))}
              className="w-16 bg-black border border-zinc-800 rounded px-2 py-1.5 text-[10px] font-mono text-zinc-100"
              min={1}
            />
          </div>
          <button
            type="button"
            onClick={addItem}
            className="w-full border border-zinc-700 rounded px-3 py-1.5 text-[10px] font-mono text-zinc-400 hover:border-zinc-500 hover:text-white transition-all"
          >
            Adicionar
          </button>
        </div>
      )}

      {showAddEquipment && (
        <div className="border border-zinc-800 rounded-lg p-3 space-y-2">
          <input
            value={newEquipment.name}
            onChange={(e) => setNewEquipment((f) => ({ ...f, name: e.target.value }))}
            className="w-full bg-black border border-zinc-800 rounded px-3 py-1.5 text-xs font-mono text-zinc-100"
            placeholder="Nome do equipamento"
          />
          <div className="flex gap-2">
            <select
              value={newEquipment.type}
              onChange={(e) => setNewEquipment((f) => ({ ...f, type: e.target.value as Equipment["type"] }))}
              className="flex-1 bg-black border border-zinc-800 rounded px-2 py-1.5 text-[10px] font-mono text-zinc-100"
            >
              <option value="arma">Arma</option>
              <option value="protecao">Proteção</option>
              <option value="ferramenta">Ferramenta</option>
              <option value="item">Item</option>
            </select>
            <input
              value={newEquipment.damage}
              onChange={(e) => setNewEquipment((f) => ({ ...f, damage: e.target.value }))}
              className="flex-1 bg-black border border-zinc-800 rounded px-2 py-1.5 text-[10px] font-mono text-zinc-100"
              placeholder="Dano (ex: 1d8+2)"
            />
          </div>
          <button
            type="button"
            onClick={addEquipment}
            className="w-full border border-zinc-700 rounded px-3 py-1.5 text-[10px] font-mono text-zinc-400 hover:border-zinc-500 hover:text-white transition-all"
          >
            Adicionar
          </button>
        </div>
      )}
    </div>
  );
}
