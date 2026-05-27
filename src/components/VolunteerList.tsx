/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { Volunteer } from "../types";
import { 
  Plus, Search, SlidersHorizontal, MapPin, Phone, Mail, 
  Car, Shield, Check, Trash2, Edit3, X, Sparkles, Clock, AlertCircle
} from "lucide-react";

interface VolunteerListProps {
  volunteers: Volunteer[];
  loading: boolean;
  onAddVolunteer: (volData: Omit<Volunteer, "id" | "createdAt">) => Promise<boolean>;
  onEditVolunteer: (id: string, volData: Partial<Volunteer>) => Promise<boolean>;
  onDeleteVolunteer: (id: string) => Promise<boolean>;
}

const AVAILABLE_SKILLS = [
  "Resgate e Barco",
  "Cozinha e Cozinha Comunitária",
  "Distribuição de Donativos",
  "Apoio Médico / Enfermagem",
  "Suporte Psicológico",
  "Limpeza e Reconstrução",
  "Triagem de Roupas",
  "Motorista 4x4"
];

const AVAILABLE_REGIONS = [
  "Porto Alegre - Bairro Humaitá",
  "Porto Alegre - Sarandi",
  "Porto Alegre - Bairro Menino Deus",
  "Canoas - Mathias Velho",
  "Eldorado do Sul - Centro"
];

const AVAILABILITY_OPTIONS = ["Manhã", "Tarde", "Noite", "Fim de semana", "Integral"];

export default function VolunteerList({ 
  volunteers, 
  loading, 
  onAddVolunteer, 
  onEditVolunteer, 
  onDeleteVolunteer 
}: VolunteerListProps) {
  
  // Filtering states
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRegion, setSelectedRegion] = useState("");
  const [selectedSkill, setSelectedSkill] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
  
  // Form toggles and dynamic fields
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formError, setFormError] = useState("");
  const [formSuccess, setFormSuccess] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Form states
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [skillsSelected, setSkillsSelected] = useState<string[]>([]);
  const [availability, setAvailability] = useState("Integral");
  const [region, setRegion] = useState(AVAILABLE_REGIONS[0]);
  const [hasVehicle, setHasVehicle] = useState(false);
  const [vehicleType, setVehicleType] = useState("Nenhum");
  const [notes, setNotes] = useState("");

  const resetForm = () => {
    setName("");
    setEmail("");
    setPhone("");
    setSkillsSelected([]);
    setAvailability("Integral");
    setRegion(AVAILABLE_REGIONS[0]);
    setHasVehicle(false);
    setVehicleType("Nenhum");
    setNotes("");
    setEditingId(null);
    setFormError("");
    setFormSuccess("");
  };

  const handleToggleSkill = (skill: string) => {
    if (skillsSelected.includes(skill)) {
      setSkillsSelected(skillsSelected.filter(s => s !== skill));
    } else {
      setSkillsSelected([...skillsSelected, skill]);
    }
  };

  const startEdit = (vol: Volunteer) => {
    setEditingId(vol.id);
    setName(vol.name);
    setEmail(vol.email);
    setPhone(vol.phone);
    setSkillsSelected(vol.skills);
    setAvailability(vol.availability);
    setRegion(vol.region);
    setHasVehicle(vol.hasVehicle);
    setVehicleType(vol.vehicleType);
    setNotes(vol.notes);
    setIsFormOpen(true);
    setFormError("");
    setFormSuccess("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");
    setFormSuccess("");

    if (!name.trim()) return setFormError("O nome é obrigatório.");
    if (!email.trim() || !email.includes("@")) return setFormError("Insira um endereço de e-mail válido.");
    if (!phone.trim()) return setFormError("Insira um telefone de contato.");
    if (skillsSelected.length === 0) return setFormError("Selecione ao menos 1 habilidade de suporte.");

    setSubmitting(true);
    const data = {
      name: name.trim(),
      email: email.trim(),
      phone: phone.trim(),
      skills: skillsSelected,
      availability,
      region,
      hasVehicle,
      vehicleType: hasVehicle ? vehicleType : "Nenhum",
      notes: notes.trim(),
      status: editingId ? undefined : ("Ativo" as const)
    };

    try {
      if (editingId) {
        const success = await onEditVolunteer(editingId, data);
        if (success) {
          setFormSuccess("Voluntário atualizado com sucesso!");
          setTimeout(() => {
            setIsFormOpen(false);
            resetForm();
          }, 1200);
        } else {
          setFormError("Erro ao editar dados do voluntário. Verifique se o e-mail não é duplicado.");
        }
      } else {
        const success = await onAddVolunteer(data as any);
        if (success) {
          setFormSuccess("Voluntário cadastrado com sucesso!");
          setTimeout(() => {
            setIsFormOpen(false);
            resetForm();
          }, 1200);
        } else {
          setFormError("Erro ao cadastrar voluntário. Já existe voluntário cadastrado com esse e-mail.");
        }
      }
    } catch (err: any) {
      setFormError(err.message || "Erro inesperado.");
    } finally {
      setSubmitting(false);
    }
  };

  // Filter volunteers locally
  const filteredVolunteers = volunteers.filter(v => {
    const matchesSearch = v.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          v.notes.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          v.phone.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRegion = selectedRegion ? v.region === selectedRegion : true;
    const matchesSkill = selectedSkill ? v.skills.includes(selectedSkill) : true;
    const matchesStatus = selectedStatus ? v.status === selectedStatus : true;
    return matchesSearch && matchesRegion && matchesSkill && matchesStatus;
  });

  return (
    <div id="volunteer-manager-root" className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      
      {/* Search and List Column (Spans 2 cols on wide screens) */}
      <div id="volunteers-directory" className="lg:col-span-2 space-y-6">
        
        {/* Filter Toolbar */}
        <div id="volunteer-filter-bar" className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
              <SlidersHorizontal className="w-4 h-4 text-slate-500" />
              Diretório de Busca Operacional
            </h3>
            <button 
              id="btn-trigger-register"
              onClick={() => {
                resetForm();
                setIsFormOpen(!isFormOpen);
              }}
              className="bg-orange-600 text-white text-xs font-semibold px-3 py-1.5 rounded-lg hover:bg-orange-700 transition flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" />
              Cadastrar Novo Voluntário
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 text-xs">
            {/* Plain Search */}
            <div className="relative sm:col-span-1">
              <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-400" />
              <input 
                id="search-input-vol"
                type="text" 
                placeholder="Nome ou contato..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-8 p-2 text-slate-700 focus:outline-none focus:ring-1 focus:ring-orange-500 focus:border-orange-500"
              />
            </div>

            {/* Region Select */}
            <select
              id="select-region-vol"
              value={selectedRegion}
              onChange={e => setSelectedRegion(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-700 focus:outline-none"
            >
              <option value="">Todas as Regiões</option>
              {AVAILABLE_REGIONS.map((r, i) => (
                <option key={i} value={r}>{r}</option>
              ))}
            </select>

            {/* Skill Select */}
            <select
              id="select-skill-vol"
              value={selectedSkill}
              onChange={e => setSelectedSkill(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-700 focus:outline-none"
            >
              <option value="">Todas as Habilidades</option>
              {AVAILABLE_SKILLS.map((s, i) => (
                <option key={i} value={s}>{s}</option>
              ))}
            </select>

            {/* Status Select */}
            <select
              id="select-status-vol"
              value={selectedStatus}
              onChange={e => setSelectedStatus(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-700 focus:outline-none"
            >
              <option value="">Todos os Status</option>
              <option value="Ativo">Disponível (Ativo)</option>
              <option value="Em Ação">Em Campo (Destinado)</option>
              <option value="Inativo">Inativo</option>
            </select>
          </div>
        </div>

        {/* Volunteers Cards List */}
        <div id="volunteers-list" className="space-y-4">
          {loading ? (
            <div className="text-center py-12 bg-white rounded-lg border border-slate-100">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600 mx-auto"></div>
              <p className="text-slate-500 text-xs mt-2">Buscando banco de voluntários...</p>
            </div>
          ) : filteredVolunteers.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-lg border border-slate-100">
              <p className="text-slate-500 text-xs">Nenhum voluntário encontrado com os filtros selecionados.</p>
              <button 
                onClick={() => { setSearchQuery(""); setSelectedRegion(""); setSelectedSkill(""); setSelectedStatus(""); }}
                className="text-xs text-orange-600 font-semibold mt-2 hover:underline"
              >
                Limpar filtros de busca
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredVolunteers.map(vol => (
                <div 
                  key={vol.id} 
                  id={`volunteer-card-${vol.id}`}
                  className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm hover:border-orange-200 transition space-y-4"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-bold text-slate-800 text-sm leading-tight">{vol.name}</h4>
                      <div className="flex items-center gap-1 text-slate-500 text-[10px] mt-0.5">
                        <MapPin className="w-3 h-3 text-slate-400" />
                        <span>{vol.region}</span>
                      </div>
                    </div>
                    <span className={`text-[10px] px-2 py-0.5 font-bold rounded-full ${
                      vol.status === 'Ativo' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                      vol.status === 'Em Ação' ? 'bg-blue-50 text-blue-700 border border-blue-200 animate-pulse' :
                      'bg-slate-50 text-slate-600 border border-slate-200'
                    }`}>
                      {vol.status === "Ativo" ? "Disponível" : vol.status === "Em Ação" ? "Em Campo" : "Inativo"}
                    </span>
                  </div>

                  <div className="text-xs text-slate-600 space-y-1.5 border-t border-b border-slate-50 py-3">
                    <div className="flex items-center gap-2">
                      <Phone className="w-3.5 h-3.5 text-slate-400" />
                      <span>{vol.phone}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Mail className="w-3.5 h-3.5 text-slate-400" />
                      <span className="truncate">{vol.email}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span>Disponibilidade: <strong className="text-slate-700">{vol.availability}</strong></span>
                    </div>
                    {vol.hasVehicle && (
                      <div className="flex items-center gap-2 text-orange-700 font-medium">
                        <Car className="w-3.5 h-3.5" />
                        <span>Veículo: {vol.vehicleType}</span>
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <span className="text-[10px] font-semibold text-slate-400 block">HABILIDADES DECLARADAS</span>
                    <div className="flex flex-wrap gap-1">
                      {vol.skills.map((skill, index) => (
                        <span 
                          key={index} 
                          className="bg-slate-100 text-slate-700 text-[10px] px-2 py-0.5 rounded font-medium"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>

                  {vol.notes && (
                    <div className="text-[11px] text-slate-500 bg-slate-50 p-2.5 rounded-lg line-clamp-2 italic">
                      &ldquo;{vol.notes}&rdquo;
                    </div>
                  )}

                  <div className="flex justify-end gap-1.5 text-xs pt-1">
                    <button 
                      onClick={() => startEdit(vol)}
                      className="text-slate-500 hover:text-orange-600 hover:bg-slate-50 p-1.5 rounded transition flex items-center gap-0.5"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      Editar
                    </button>
                    <button 
                      onClick={() => {
                        if (confirm(`Tem certeza que de remover o voluntário ${vol.name}?`)) {
                          onDeleteVolunteer(vol.id);
                        }
                      }}
                      className="text-slate-400 hover:text-rose-600 hover:bg-slate-50 p-1.5 rounded transition"
                      title="Deletar voluntário"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Form Cadastro/Edição Column (Spans 1 col on wide screens) */}
      <div id="volunteer-form-wrapper" className="space-y-4">
        <div id="volunteer-form" className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm sticky top-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
            <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-orange-600" />
              {editingId ? "Editar Registro" : "Inscrição de Voluntário"}
            </h3>
            {editingId && (
              <button 
                onClick={resetForm}
                className="text-slate-400 hover:text-slate-600 p-0.5"
                title="Cancelar Edição"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            {/* Input Name */}
            <div className="space-y-1">
              <label className="font-semibold text-slate-700 block">Nome Completo</label>
              <input 
                id="input-name"
                type="text" 
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Carlos Silva de Souza"
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-slate-700 focus:outline-none focus:ring-1 focus:ring-orange-500"
                required
              />
            </div>

            {/* Input Email & Phone */}
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <label className="font-semibold text-slate-700 block">E-mail</label>
                <input 
                  id="input-email"
                  type="email" 
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="carlos@exemplo.com"
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-slate-700 focus:outline-none focus:ring-1 focus:ring-orange-500"
                  required
                />
              </div>
              <div className="space-y-1">
                <label className="font-semibold text-slate-700 block">Whatsapp/Fone</label>
                <input 
                  id="input-phone"
                  type="text" 
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  placeholder="(51) 99999-5555"
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-slate-700 focus:outline-none focus:ring-1 focus:ring-orange-500"
                  required
                />
              </div>
            </div>

            {/* Input Region */}
            <div className="space-y-1">
              <label className="font-semibold text-slate-700 block">Região Preferencial de Atuação</label>
              <select 
                id="select-region"
                value={region}
                onChange={e => setRegion(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-slate-700 focus:outline-none"
              >
                {AVAILABLE_REGIONS.map((r, i) => (
                  <option key={i} value={r}>{r}</option>
                ))}
              </select>
            </div>

            {/* Input Availability */}
            <div className="space-y-1">
              <label className="font-semibold text-slate-700 block">Turno Disponível</label>
              <select 
                id="select-availability"
                value={availability}
                onChange={e => setAvailability(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-slate-700 focus:outline-none"
              >
                {AVAILABILITY_OPTIONS.map((o, i) => (
                  <option key={i} value={o}>{o}</option>
                ))}
              </select>
            </div>

            {/* Skills Choice Checklist */}
            <div className="space-y-1.5">
              <label className="font-semibold text-slate-700 block">Suas Habilidades de Apoio</label>
              <div className="grid grid-cols-1 gap-1 bg-slate-50 p-2.5 rounded-lg border border-slate-200 max-h-36 overflow-y-auto">
                {AVAILABLE_SKILLS.map((skill, idx) => {
                  const has = skillsSelected.includes(skill);
                  return (
                    <button 
                      key={idx}
                      id={`skill-toggle-${idx}`}
                      type="button"
                      onClick={() => handleToggleSkill(skill)}
                      className={`flex items-center gap-2 p-1.5 rounded text-left transition ${
                        has ? 'bg-orange-50 text-orange-900 font-medium' : 'hover:bg-slate-100 text-slate-600'
                      }`}
                    >
                      <div className={`w-3.5 h-3.5 rounded border flex items-center justify-center ${
                        has ? 'bg-orange-600 border-orange-600 text-white' : 'border-slate-300'
                      }`}>
                        {has && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                      </div>
                      <span>{skill}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Input Vehicle checkbox */}
            <div className="space-y-2 bg-slate-50 p-2.5 rounded-lg border border-slate-200">
              <div className="flex items-center justify-between">
                <label className="font-semibold text-slate-700 flex items-center gap-1.5 cursor-pointer">
                  <input 
                    id="checkbox-has-vehicle"
                    type="checkbox"
                    checked={hasVehicle}
                    onChange={e => setHasVehicle(e.target.checked)}
                    className="rounded text-orange-600 focus:ring-orange-500 w-3.5 h-3.5"
                  />
                  <span>Possui Veículo Próprio</span>
                </label>
                {hasVehicle && <Car className="w-4 h-4 text-orange-600" />}
              </div>

              {hasVehicle && (
                <div className="space-y-1 pt-2 border-t border-slate-200/50">
                  <label className="text-[10px] text-slate-500">Tipo de Transporte</label>
                  <select 
                    id="select-vehicle-type"
                    value={vehicleType}
                    onChange={e => setVehicleType(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded p-1.5 text-[11px] text-slate-700 focus:outline-none"
                  >
                    <option value="Carro">Carro Comum</option>
                    <option value="Caminhonete 4x4">Caminhonete 4x4 (Alagamentos)</option>
                    <option value="Moto">Motocicleta (Entregas Rápidas)</option>
                    <option value="Barco">Barco a Motor / Bote inflável</option>
                  </select>
                </div>
              )}
            </div>

            {/* Input Notes (Experience/Details) */}
            <div className="space-y-1">
              <label className="font-semibold text-slate-700 block">Observações e Equipamentos</label>
              <textarea 
                id="textarea-notes"
                value={notes}
                onChange={e => setNotes(e.target.value)}
                placeholder="Ex: Tenho rádio amador, trago kit de primeiros socorros próprio..."
                rows={2}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-700 focus:outline-none focus:ring-1 focus:ring-orange-500"
              />
            </div>

            {/* Alerts Feedback */}
            {formError && (
              <div id="error-feedback" className="bg-red-50 text-red-700 border border-red-100 p-2.5 rounded-lg flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            {formSuccess && (
              <div id="success-feedback" className="bg-emerald-50 text-emerald-800 border border-emerald-100 p-2.5 rounded-lg flex items-center gap-1.5">
                <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{formSuccess}</span>
              </div>
            )}

            {/* Buttons Submit */}
            <button 
              id="submit-register"
              type="submit"
              disabled={submitting}
              className="w-full bg-orange-600 text-white font-bold py-2.5 px-4 rounded-lg hover:bg-orange-700 transition flex items-center justify-center gap-1 cursor-pointer"
            >
              {submitting ? "Cadastrando..." : editingId ? "Salvar Alterações" : "Gravar Inscrição de Apoio"}
            </button>
          </form>
        </div>
      </div>

    </div>
  );
}
