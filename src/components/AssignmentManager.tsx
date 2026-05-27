/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { Volunteer, Need, Assignment } from "../types";
import { 
  Users, CheckCircle, HelpCircle, XCircle, Clock, Link, 
  Trash2, AlertCircle, Plus, Sparkles, Check, CheckSquare, Shield, HelpCircle as InfoIcon
} from "lucide-react";

interface AssignmentManagerProps {
  volunteers: Volunteer[];
  needs: Need[];
  assignments: Assignment[];
  loading: boolean;
  onAddAssignment: (volunteerId: string, needId: string) => Promise<boolean>;
  onUpdateAssignmentStatus: (id: string, status: 'Ativo' | 'Concluido' | 'Cancelado') => Promise<boolean>;
  onDeleteAssignment: (id: string) => Promise<boolean>;
}

export default function AssignmentManager({
  volunteers,
  needs,
  assignments,
  loading,
  onAddAssignment,
  onUpdateAssignmentStatus,
  onDeleteAssignment
}: AssignmentManagerProps) {

  const [selectedVolunteerId, setSelectedVolunteerId] = useState("");
  const [selectedNeedId, setSelectedNeedId] = useState("");
  const [formError, setFormError] = useState("");
  const [formSuccess, setFormSuccess] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Available volunteers for assignment are "Ativo" (not currently "Em Ação")
  const assignableVolunteers = volunteers.filter(v => v.status === "Ativo");
  // Open needs are those not "Concluido"
  const openNeeds = needs.filter(n => n.status !== "Concluido");

  // Filter lists for quick insights
  const activeAssignments = assignments.filter(a => a.status === "Ativo");
  const completedAssignments = assignments.filter(a => a.status === "Concluido");

  const handleCreateAssignment = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");
    setFormSuccess("");

    if (!selectedVolunteerId) return setFormError("Por favor, selecione um voluntário.");
    if (!selectedNeedId) return setFormError("Por favor, selecione a demanda emergencial correspondente.");

    setSubmitting(true);
    try {
      const success = await onAddAssignment(selectedVolunteerId, selectedNeedId);
      if (success) {
        setFormSuccess("Voluntário despachado e vinculado com sucesso!");
        setSelectedVolunteerId("");
        setSelectedNeedId("");
        setTimeout(() => setFormSuccess(""), 3000);
      } else {
        setFormError("Erro de vínculo. Verifique se o voluntário já não está alocado nesta demanda.");
      }
    } catch (err: any) {
      setFormError(err.message || "Erro de integridade temporária no sistema.");
    } finally {
      setSubmitting(false);
    }
  };

  const getUrgencyBadge = (urgency: string) => {
    switch (urgency) {
      case "Alta": return "text-red-700 bg-red-50 border-red-100";
      case "Média": return "text-amber-800 bg-amber-50 border-amber-100";
      default: return "text-slate-600 bg-slate-50 border-slate-100";
    }
  };

  // Safe search for finding the underlying objects
  const getVolForAssignment = (a: Assignment) => volunteers.find(v => v.id === a.volunteerId);
  const getNeedForAssignment = (a: Assignment) => needs.find(n => n.id === a.needId);

  return (
    <div id="assignment-manager-parent" className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      
      {/* Forms column for creating a new Assignment */}
      <div id="new-dispatch-form-card" className="space-y-4">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="font-bold text-slate-800 text-sm flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-orange-600" />
              Despachar Apoio / Vincular Voluntário
            </h3>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Defina a alocação de voluntários ativos conforme a necessidade técnica da ação.
            </p>
          </div>

          <form onSubmit={handleCreateAssignment} className="space-y-4 text-xs">
            {/* Choose volunteer */}
            <div className="space-y-1">
              <label className="font-semibold text-slate-700 block">
                1. Selecionar Voluntário Disponível ({assignableVolunteers.length})
              </label>
              <select
                id="dispatch-select-volunteer"
                value={selectedVolunteerId}
                onChange={e => {
                  setSelectedVolunteerId(e.target.value);
                  setFormError("");
                }}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-slate-700 focus:outline-none"
              >
                <option value="">-- Escolher voluntário do banco ativo --</option>
                {assignableVolunteers.map(v => (
                  <option key={v.id} value={v.id}>
                    {v.name} ({v.region}) - Disp: {v.availability} / {v.skills.slice(0, 2).join(", ")}
                  </option>
                ))}
              </select>
              {assignableVolunteers.length === 0 && (
                <span className="text-[10px] text-amber-700 block bg-amber-50 rounded p-1.5">
                  Não existem voluntários ativamente disponíveis nesse momento. Altere o status de algum ou adicione um novo para prosseguir.
                </span>
              )}
            </div>

            {/* Choose need */}
            <div className="space-y-1">
              <label className="font-semibold text-slate-700 block">
                2. Selecionar Demanda Pendente ({openNeeds.length})
              </label>
              <select
                id="dispatch-select-need"
                value={selectedNeedId}
                onChange={e => {
                  setSelectedNeedId(e.target.value);
                  setFormError("");
                }}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-slate-700 focus:outline-none"
              >
                <option value="">-- Escolher demanda para vincular --</option>
                {openNeeds.map(n => (
                  <option key={n.id} value={n.id}>
                    [{n.urgency}] {n.title} ({n.region}) - Necessita de: {n.requiredSkills.join(", ")}
                  </option>
                ))}
              </select>
            </div>

            {selectedVolunteerId && selectedNeedId && (
              <div id="matching-helper-notes" className="bg-emerald-50 p-3 rounded-lg border border-emerald-100 space-y-1.5 text-[11px] text-emerald-800">
                <span className="font-bold flex items-center gap-1">
                  <Check className="w-3.5 h-3.5 stroke-[3] text-emerald-600" />
                  Triagem Inteligente de Competências
                </span>
                <p>
                  O voluntário selecionado será movido de status para <strong className="text-emerald-950">Em Ação</strong> e a demanda começará a contar com cooperação ativa instantaneamente.
                </p>
              </div>
            )}

            {formError && (
              <div id="dispatch-error-alert" className="bg-red-50 text-red-700 border border-red-100 p-2.5 rounded-lg flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            {formSuccess && (
              <div id="dispatch-success-alert" className="bg-emerald-50 text-emerald-800 border border-emerald-100 p-2.5 rounded-lg flex items-center gap-1.5">
                <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{formSuccess}</span>
              </div>
            )}

            <button
              id="submit-dispatch"
              type="submit"
              disabled={submitting || !selectedVolunteerId || !selectedNeedId}
              className={`w-full font-bold py-2.5 px-4 rounded-lg text-white transition flex items-center justify-center gap-1.5 ${
                (!selectedVolunteerId || !selectedNeedId) ? 'bg-slate-300 cursor-not-allowed' : 'bg-slate-900 hover:bg-slate-800 cursor-pointer'
              }`}
            >
              <Link className="w-3.5 h-3.5" />
              {submitting ? "Despachando..." : "Consolidar Vínculo Operacional"}
            </button>
          </form>
        </div>

        {/* Operational tips */}
        <div id="operational-protocol-box" className="bg-slate-100 p-4 rounded-xl border border-slate-200">
          <div className="flex gap-2 items-start">
            <InfoIcon className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
            <div className="space-y-1 text-[11px] text-slate-600">
              <span className="font-semibold text-slate-800 block">Conceitos do Fluxo de Trabalho</span>
              <p>📍 O voluntário se cadastra com suas competências e canais de contato preferenciais.</p>
              <p>📢 A coordenação ou Defesa Civil publica uma demanda contendo as necessidades de apoio.</p>
              <p>🔀 Faça o cruzamento (Match) ligando as capacidades do voluntário à ação local.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Grid of current active allocations (Spans 2 cols) */}
      <div id="allocations-board" className="lg:col-span-2 space-y-4">
        
        {/* Active allocation list */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex justify-between items-center border-b border-slate-100 pb-3">
            <div>
              <h3 className="font-bold text-slate-800 text-sm">Painel de Alocações Ativas ({activeAssignments.length})</h3>
              <p className="text-[11px] text-slate-500">Mapeamento em tempo real do destacamento de força-tarefa humana</p>
            </div>
            <span className="bg-rose-100 text-rose-700 text-[10px] font-bold px-2 py-0.5 rounded-full">Operações Vigentes</span>
          </div>

          <div className="space-y-3">
            {loading ? (
              <div className="text-center py-6 text-slate-500 text-xs">Atualizando controle de equipes...</div>
            ) : activeAssignments.length === 0 ? (
              <div className="text-center py-8 text-slate-400 text-xs bg-slate-50 rounded-xl border border-dashed border-slate-200">
                Ainda não há nenhum voluntário alocado em campo. Utilize o formulário ao lado para fazer o primeiro despacho.
              </div>
            ) : (
              activeAssignments.map(as => {
                const volObj = getVolForAssignment(as);
                const needObj = getNeedForAssignment(as);

                return (
                  <div 
                    key={as.id} 
                    id={`assignment-item-${as.id}`}
                    className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 transition space-y-3"
                  >
                    <div className="flex justify-between items-start">
                      <div className="space-y-1">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="text-slate-800 font-bold text-xs">👥 {as.volunteerName || (volObj && volObj.name)}</span>
                          <span className="text-[10px] text-slate-400">vinculado a</span>
                        </div>
                        <h4 className="font-bold text-slate-900 text-xs">🚨 {as.needTitle || (needObj && needObj.title)}</h4>
                      </div>

                      <span className="text-[10px] font-bold bg-blue-100 text-blue-800 px-2.5 py-0.5 rounded flex items-center gap-1">
                        <Clock className="w-3 h-3 text-blue-600 animate-spin" />
                        Em Campo
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs bg-white p-3 rounded-lg border border-slate-100">
                      <div>
                        <span className="text-[10px] font-bold text-slate-400 block uppercase tracking-wider">Contato do Voluntário</span>
                        <p className="font-medium text-slate-700">{volObj?.phone || "Não informado"}</p>
                        <p className="text-slate-500 text-[11px] truncate">{volObj?.email || "Sem e-mail"}</p>
                      </div>

                      <div>
                        <span className="text-[10px] font-bold text-slate-400 block uppercase tracking-wider">Responsável Demanda</span>
                        <p className="font-medium text-slate-700">{needObj?.contactPerson || "Sem coordenador"}</p>
                        <p className="text-slate-500 text-[11px] font-mono">{needObj?.contactPhone || "(XX) XXXXX-XXXX"}</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-xs pt-1.5">
                      <span className="text-slate-400 text-[10px]">
                        Alocado às: <strong className="font-mono">{new Date(as.assignedAt).toLocaleString('pt-BR')}</strong>
                      </span>

                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            if (confirm("Marcar a contribuição deste voluntário como CONCLUÍDA nesta demanda?")) {
                              onUpdateAssignmentStatus(as.id, "Concluido");
                            }
                          }}
                          className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-3 py-1.5 rounded text-[11px] flex items-center gap-1 transition"
                        >
                          <CheckCircle className="w-3.5 h-3.5" />
                          Finalizar Tarefa
                        </button>
                        
                        <button
                          onClick={() => {
                            if (confirm("Deseja CANCELAR/REMOVER o vínculo deste voluntário com esta demanda? Ele voltará para o banco de espera ativo.")) {
                              onUpdateAssignmentStatus(as.id, "Cancelado");
                            }
                          }}
                          className="text-slate-400 hover:text-red-600 bg-white border border-slate-200 hover:bg-slate-50 px-2.5 py-1.5 rounded transition"
                          title="Remover / Desvincular"
                        >
                          <XCircle className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Historic Log list / Finished */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="font-bold text-slate-800 text-sm">Histórico de Atribuições Resolvidas ({completedAssignments.length})</h3>
            <p className="text-[11px] text-slate-500">Ações concluídas com sucesso que serviram de suporte na emergência.</p>
          </div>

          <div className="space-y-2">
            {completedAssignments.length === 0 ? (
              <p className="text-slate-400 text-[11px] italic text-center py-4">Sem registros resolvidos no histórico.</p>
            ) : (
              completedAssignments.map(c => (
                <div key={c.id} className="flex justify-between items-center p-2.5 bg-slate-50 rounded-lg text-xs hover:bg-slate-100/70 border border-slate-100 text-slate-600">
                  <div className="truncate max-w-[280px] sm:max-w-[400px]">
                    <span className="font-semibold text-emerald-800">✓ {c.volunteerName}</span>
                    <span className="mx-1 text-slate-400">apoio crucial em</span>
                    <span className="font-medium text-slate-800">{c.needTitle}</span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => {
                        if (confirm("Excluir definitivamente este item de histórico operacional?")) {
                          onDeleteAssignment(c.id);
                        }
                      }}
                      className="text-slate-400 hover:text-red-500 p-1"
                      title="Apagar do histórico"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>

    </div>
  );
}
