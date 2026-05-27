/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { Need } from "../types";
import { 
  Plus, Search, SlidersHorizontal, MapPin, Contact, Phone, 
  Trash2, Edit3, X, Sparkles, AlertCircle, Check, Send, AlertTriangle, CheckSquare
} from "lucide-react";

interface NeedListProps {
  needs: Need[];
  loading: boolean;
  onAddNeed: (needData: Omit<Need, "id" | "createdAt" | "status">) => Promise<boolean>;
  onEditNeed: (id: string, needData: Partial<Need>) => Promise<boolean>;
  onDeleteNeed: (id: string) => Promise<boolean>;
}

const AVAILABLE_REGIONS = [
  "Porto Alegre - Bairro Humaitá",
  "Porto Alegre - Sarandi",
  "Porto Alegre - Bairro Menino Deus",
  "Canoas - Mathias Velho",
  "Eldorado do Sul - Centro"
];

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

export default function NeedList({ 
  needs, 
  loading, 
  onAddNeed, 
  onEditNeed, 
  onDeleteNeed 
}: NeedListProps) {
  
  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUrgency, setSelectedUrgency] = useState("");
  const [selectedRegion, setSelectedRegion] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");

  // Form
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formError, setFormError] = useState("");
  const [formSuccess, setFormSuccess] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [region, setRegion] = useState(AVAILABLE_REGIONS[0]);
  const [urgency, setUrgency] = useState<'Alta' | 'Média' | 'Baixa'>("Média");
  const [requiredSkills, setRequiredSkills] = useState<string[]>([]);
  const [contactPerson, setContactPerson] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [volunteersNeeded, setVolunteersNeeded] = useState(2);
  const [notes, setNotes] = useState("");

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setLocation("");
    setRegion(AVAILABLE_REGIONS[0]);
    setUrgency("Média");
    setRequiredSkills([]);
    setContactPerson("");
    setContactPhone("");
    setVolunteersNeeded(2);
    setNotes("");
    setEditingId(null);
    setFormError("");
    setFormSuccess("");
  };

  const handleToggleSkill = (skill: string) => {
    if (requiredSkills.includes(skill)) {
      setRequiredSkills(requiredSkills.filter(s => s !== skill));
    } else {
      setRequiredSkills([...requiredSkills, skill]);
    }
  };

  const startEdit = (need: Need) => {
    setEditingId(need.id);
    setTitle(need.title);
    setDescription(need.description);
    setLocation(need.location);
    setRegion(need.region);
    setUrgency(need.urgency);
    setRequiredSkills(need.requiredSkills);
    setContactPerson(need.contactPerson);
    setContactPhone(need.contactPhone);
    setVolunteersNeeded(need.volunteersNeeded);
    setNotes(need.notes);
    setIsFormOpen(true);
    setFormError("");
    setFormSuccess("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");
    setFormSuccess("");

    if (!title.trim()) return setFormError("Insira um título resumido da necessidade.");
    if (!description.trim()) return setFormError("Insira a descrição detalhada do cenário.");
    if (!location.trim()) return setFormError("Insira o local específico.");
    if (!contactPerson.trim() || !contactPhone.trim()) return setFormError("Insira os dados do contato responsável.");

    setSubmitting(true);
    const data = {
      title: title.trim(),
      description: description.trim(),
      location: location.trim(),
      region,
      urgency,
      requiredSkills,
      contactPerson: contactPerson.trim(),
      contactPhone: contactPhone.trim(),
      volunteersNeeded: Number(volunteersNeeded),
      notes: notes.trim()
    };

    try {
      if (editingId) {
        const success = await onEditNeed(editingId, data);
        if (success) {
          setFormSuccess("Demanda urgente atualizada com sucesso!");
          setTimeout(() => {
            setIsFormOpen(false);
            resetForm();
          }, 1200);
        } else {
          setFormError("Não foi possível editar os dados da demanda.");
        }
      } else {
        const success = await onAddNeed(data);
        if (success) {
          setFormSuccess("Nova demanda cadastrada e despachada para a triagem!");
          setTimeout(() => {
            setIsFormOpen(false);
            resetForm();
          }, 1200);
        } else {
          setFormError("Não foi possível registrar a demanda de crise.");
        }
      }
    } catch (err: any) {
      setFormError(err.message || "Erro operacional no cadastro.");
    } finally {
      setSubmitting(false);
    }
  };

  // Local filtering
  const filteredNeeds = needs.filter(n => {
    const matchesSearch = n.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          n.description.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          n.location.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesUrgency = selectedUrgency ? n.urgency === selectedUrgency : true;
    const matchesRegion = selectedRegion ? n.region === selectedRegion : true;
    const matchesStatus = selectedStatus ? n.status === selectedStatus : true;
    return matchesSearch && matchesUrgency && matchesRegion && matchesStatus;
  });

  return (
    <div id="need-manager-root" className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      
      {/* Search and List Column (Spans 2 cols) */}
      <div id="needs-directory" className="lg:col-span-2 space-y-6">
        
        {/* Filter Toolbar */}
        <div id="need-filter-bar" className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
              <SlidersHorizontal className="w-4 h-4 text-slate-500" />
              Filtrar Demandas Ativas em Campo
            </h3>
            <button 
              id="btn-trigger-need"
              onClick={() => {
                resetForm();
                setIsFormOpen(!isFormOpen);
              }}
              className="bg-red-600 text-white text-xs font-semibold px-3 py-1.5 rounded-lg hover:bg-red-700 transition flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" />
              Relatar Nova Demanda
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 text-xs">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-400" />
              <input 
                id="search-input-need"
                type="text" 
                placeholder="Buscar palavra chave..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-8 p-2 text-slate-700 focus:outline-none focus:ring-1 focus:ring-orange-500"
              />
            </div>

            {/* Region Select */}
            <select
              id="select-region-need-filter"
              value={selectedRegion}
              onChange={e => setSelectedRegion(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-700 focus:outline-none"
            >
              <option value="">Todas as Regiões</option>
              {AVAILABLE_REGIONS.map((r, i) => (
                <option key={i} value={r}>{r}</option>
              ))}
            </select>

            {/* Urgency Select */}
            <select
              id="select-urgency-need-filter"
              value={selectedUrgency}
              onChange={e => setSelectedUrgency(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-700 focus:outline-none"
            >
              <option value="">Todas as Urgências</option>
              <option value="Alta">Urgência Alta ⚠️</option>
              <option value="Média">Urgência Média ⏳</option>
              <option value="Baixa">Urgência Baixa ✅</option>
            </select>

            {/* Status Select */}
            <select
              id="select-status-need-filter"
              value={selectedStatus}
              onChange={e => setSelectedStatus(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-700 focus:outline-none"
            >
              <option value="">Todos os Status</option>
              <option value="Pendente">Aberto (Pendente)</option>
              <option value="Em Andamento">Em Atividade</option>
              <option value="Concluido">Concluído / Resolvido</option>
            </select>
          </div>
        </div>

        {/* Needs Cards List */}
        <div id="needs-list-container" className="space-y-4">
          {loading ? (
            <div className="text-center py-12 bg-white rounded-lg border border-slate-200">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600 mx-auto"></div>
              <p className="text-slate-500 text-xs mt-2">Sincronizando com a Defesa Civil e o banco...</p>
            </div>
          ) : filteredNeeds.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-lg border border-slate-200">
              <p className="text-slate-500 text-xs">Sem novas demandas de ajuda registradas com esse filtro.</p>
              <button 
                onClick={() => { setSearchQuery(""); setSelectedRegion(""); setSelectedUrgency(""); setSelectedStatus(""); }}
                className="text-xs text-orange-600 font-semibold mt-2 hover:underline"
              >
                Limpar filtros de busca
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredNeeds.map(need => (
                <div 
                  key={need.id} 
                  id={`need-card-${need.id}`}
                  className={`bg-white p-5 rounded-2xl border shadow-sm hover:shadow transition duration-150 flex flex-col justify-between ${
                    need.urgency === 'Alta' && need.status !== 'Concluido' ? 'border-red-200 bg-red-50/20' : 'border-slate-200'
                  }`}
                >
                  <div className="space-y-3.5">
                    {/* Header */}
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded ${
                            need.urgency === 'Alta' ? 'bg-red-100 text-red-700' :
                            need.urgency === 'Média' ? 'bg-amber-100 text-amber-800' :
                            'bg-slate-100 text-slate-700'
                          }`}>
                            Prioridade {need.urgency}
                          </span>
                          
                          <span className={`text-[9px] font-bold px-2 py-0.5 rounded ${
                            need.status === 'Pendente' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                            need.status === 'Em Andamento' ? 'bg-blue-50 text-blue-700 border border-blue-200' :
                            'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          }`}>
                            {need.status === 'Pendente' ? 'Pendente' : need.status === 'Em Andamento' ? 'Em Andamento' : 'Concluído'}
                          </span>
                        </div>
                        <h4 className="font-bold text-slate-800 text-sm leading-snug mt-1.5">{need.title}</h4>
                      </div>
                    </div>

                    {/* Descript */}
                    <p className="text-xs text-slate-600 leading-relaxed font-normal">{need.description}</p>

                    {/* Location, Contacts */}
                    <div className="space-y-1.5 bg-slate-50 p-3 rounded-lg text-slate-600 text-xs border border-slate-100">
                      <div className="flex items-start gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                        <div>
                          <strong className="text-slate-700">{need.location}</strong>
                          <span className="text-[10px] text-slate-500 block">{need.region}</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-1.5 pt-1.5 border-t border-slate-200/50">
                        <Contact className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="truncate">Resp: <strong className="text-slate-700">{need.contactPerson}</strong></span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>Falar: <strong className="font-mono">{need.contactPhone}</strong></span>
                      </div>
                    </div>

                    {/* Required Skills list */}
                    <div className="space-y-1.5">
                      <span className="text-[9px] font-semibold text-slate-400 block uppercase tracking-wider">Habilidades Demandadas ({need.volunteersNeeded} un)</span>
                      <div className="flex flex-wrap gap-1">
                        {need.requiredSkills.map((sk, idx) => (
                          <span key={idx} className="bg-slate-200 text-slate-800 font-medium px-2 py-0.5 rounded text-[10px]">
                            {sk}
                          </span>
                        ))}
                      </div>
                    </div>

                    {need.notes && (
                      <p className="text-[11px] text-slate-500 italic bg-amber-50/50 p-2 rounded border border-dashed border-amber-200">
                        Nota de campo: {need.notes}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center justify-between border-t border-slate-100 pt-3 mt-4 text-xs">
                    <div className="flex gap-2">
                      {need.status !== "Concluido" ? (
                        <button 
                          onClick={() => {
                            if (confirm("Marcar esta demanda como CONCLUÍDA / RESOLVIDA? Isso liberará esforços de voluntariado.")) {
                              onEditNeed(need.id, { status: "Concluido" });
                            }
                          }}
                          className="bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold px-2 py-1 rounded flex items-center gap-1 transition"
                        >
                          <CheckSquare className="w-3.5 h-3.5" />
                          Resolver
                        </button>
                      ) : (
                        <button 
                          onClick={() => onEditNeed(need.id, { status: "Pendente" })}
                          className="text-amber-700 hover:underline"
                        >
                          Reabrir Demanda
                        </button>
                      )}
                    </div>

                    <div className="flex gap-2">
                      <button 
                        onClick={() => startEdit(need)}
                        className="text-slate-500 hover:text-slate-800 p-1 rounded flex items-center gap-0.5"
                        title="Editar conteúdo"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        Editar
                      </button>
                      <button 
                        onClick={() => {
                          if (confirm("Quer realmente apagar de forma definitiva este registro do mapa de crises?")) {
                            onDeleteNeed(need.id);
                          }
                        }}
                        className="text-slate-400 hover:text-red-600 p-1 rounded"
                        title="Apagar demanda"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Register/Edit form Sidebar info column */}
      <div id="need-form-container" className="space-y-4">
        <div id="need-form-card" className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm sticky top-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
            <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-red-600" />
              {editingId ? "Editar Registro de Crise" : "Relatar Nova Demanda"}
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
            {/* Title need */}
            <div className="space-y-1">
              <label className="font-semibold text-slate-700 block">Título do Alerta / Necessidade</label>
              <input 
                id="need-title-input"
                type="text" 
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="Ex: Reforço na cozinha comunitária, Resgates em barco..."
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-slate-700 focus:outline-none focus:ring-1 focus:ring-red-500"
                required
              />
            </div>

            {/* Description detailed scenario */}
            <div className="space-y-1">
              <label className="font-semibold text-slate-700 block">Cenário e Descrição Detalhada</label>
              <textarea 
                id="need-description-input"
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder="Explicitar o que está ocorrendo, quantidade de pessoas afetadas ou o que falta ser descarregado."
                rows={3}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-700 focus:outline-none focus:ring-1 focus:ring-red-500"
                required
              />
            </div>

            {/* Region select dropdown */}
            <div className="space-y-1">
              <label className="font-semibold text-slate-700 block">Sub-Região Administrativa</label>
              <select 
                id="need-region-select"
                value={region}
                onChange={e => setRegion(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-slate-700 focus:outline-none"
              >
                {AVAILABLE_REGIONS.map((r, i) => (
                  <option key={i} value={r}>{r}</option>
                ))}
              </select>
            </div>

            {/* Specific Address or Location */}
            <div className="space-y-1">
              <label className="font-semibold text-slate-700 block">Localização / Ponto de Referência</label>
              <input 
                id="need-location-input"
                type="text" 
                value={location}
                onChange={e => setLocation(e.target.value)}
                placeholder="Ex: Ginásio Tesourinha ou Rua Bento Gonçalves, 301"
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-slate-700 focus:outline-none focus:ring-1 focus:ring-red-500"
                required
              />
            </div>

            {/* Urgência and Volunteers count side by side */}
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <label className="font-semibold text-slate-700 block">Nível de Urgência</label>
                <select 
                  id="need-urgency-select"
                  value={urgency}
                  onChange={e => setUrgency(e.target.value as any)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-700 focus:outline-none"
                >
                  <option value="Alta">Alta (Imediato) 🚨</option>
                  <option value="Média">Média (Próximas horas)</option>
                  <option value="Baixa">Baixa (Planejável)</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700 block">Nº de Pessoas Necessárias</label>
                <input 
                  id="need-volunteers-count-input"
                  type="number" 
                  min={1}
                  max={50}
                  value={volunteersNeeded}
                  onChange={e => setVolunteersNeeded(Number(e.target.value))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-700 focus:outline-none"
                  required
                />
              </div>
            </div>

            {/* Skills Choice Checklist */}
            <div className="space-y-1.5">
              <label className="font-semibold text-slate-700 block">Habilidades Exigidas no Local</label>
              <div className="grid grid-cols-1 gap-1 bg-slate-50 p-2.5 rounded-lg border border-slate-200 max-h-32 overflow-y-auto">
                {AVAILABLE_SKILLS.map((skill, idx) => {
                  const has = requiredSkills.includes(skill);
                  return (
                    <button 
                      key={idx}
                      id={`need-skill-toggle-${idx}`}
                      type="button"
                      onClick={() => handleToggleSkill(skill)}
                      className={`flex items-center gap-2 p-1.5 rounded text-left transition ${
                        has ? 'bg-red-50 text-red-900 font-medium' : 'hover:bg-slate-100 text-slate-600'
                      }`}
                    >
                      <div className={`w-3.5 h-3.5 rounded border flex items-center justify-center ${
                        has ? 'bg-red-600 border-red-600 text-white' : 'border-slate-300'
                      }`}>
                        {has && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                      </div>
                      <span>{skill}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Contact details */}
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <label className="font-semibold text-slate-700 block">Pessoa Coordenadora</label>
                <input 
                  id="need-coordinator-input"
                  type="text" 
                  value={contactPerson}
                  onChange={e => setContactPerson(e.target.value)}
                  placeholder="Nome do contato"
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-700 focus:outline-none focus:ring-1 focus:ring-red-500"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700 block">Telefone de Contato</label>
                <input 
                  id="need-coordinator-phone"
                  type="text" 
                  value={contactPhone}
                  onChange={e => setContactPhone(e.target.value)}
                  placeholder="DDD + Telefone"
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-700 focus:outline-none focus:ring-1 focus:ring-red-500"
                  required
                />
              </div>
            </div>

            {/* Extra notes */}
            <div className="space-y-1">
              <label className="font-semibold text-slate-700 block">Indicações Extra de Acesso</label>
              <textarea 
                id="need-extra-notes"
                value={notes}
                onChange={e => setNotes(e.target.value)}
                placeholder="Ex: Precisa trazer galochas ou repelente. Local tem rede elétrica ativa."
                rows={2}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-700 focus:outline-none"
              />
            </div>

            {formError && (
              <div id="need-error-feedback" className="bg-red-50 text-red-700 border border-red-100 p-2.5 rounded-lg flex items-center gap-1.5 animate-pulse">
                <AlertTriangle className="w-4 h-4 text-red-500 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            {formSuccess && (
              <div id="need-success-feedback" className="bg-emerald-50 text-emerald-800 border border-emerald-100 p-2.5 rounded-lg flex items-center gap-1.5">
                <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{formSuccess}</span>
              </div>
            )}

            <button 
              id="need-submit-button"
              type="submit"
              disabled={submitting}
              className="w-full bg-red-600 text-white font-bold py-2.5 px-4 rounded-lg hover:bg-red-700 transition flex items-center justify-center gap-1 cursor-pointer"
            >
              {submitting ? "Cadastrando..." : editingId ? "Atualizar Alerta" : "Relatar e Publicar Demanda"}
            </button>
          </form>
        </div>
      </div>

    </div>
  );
}
