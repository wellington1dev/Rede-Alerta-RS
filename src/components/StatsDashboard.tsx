/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { DashboardStats, Need, Volunteer } from "../types";
import { Users, AlertTriangle, CheckCircle, FileText, Landmark, Clock, Activity, ShieldAlert } from "lucide-react";

interface StatsDashboardProps {
  stats: DashboardStats | null;
  needs: Need[];
  volunteers: Volunteer[];
  loading: boolean;
}

export default function StatsDashboard({ stats, needs, volunteers, loading }: StatsDashboardProps) {
  if (loading || !stats) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
        <span className="ml-3 text-slate-600 font-medium">Carregando painel de métricas...</span>
      </div>
    );
  }

  // Get regions list
  const regions = Array.from(new Set([...needs.map(n => n.region), ...volunteers.map(v => v.region)]));

  // Count open high urgency needs
  const altaUrgencyNeeds = needs.filter(n => n.urgency === "Alta" && n.status !== "Concluido");

  return (
    <div id="stats-dashboard-container" className="space-y-6">
      {/* Alert Warning Beacon */}
      {altaUrgencyNeeds.length > 0 && (
        <div id="quick-emergency-banner" className="bg-red-50 border-l-4 border-red-600 p-4 rounded-r-lg shadow-sm flex items-start gap-3">
          <ShieldAlert className="text-red-600 w-5 h-5 shrink-0 mt-0.5 animate-pulse" />
          <div>
            <h4 className="text-red-900 font-bold text-sm">Alerta de Crise: {altaUrgencyNeeds.length} demandas urgentes sem conclusão</h4>
            <p className="text-red-700 text-xs mt-1">
              Locais críticos identificados necessitando de equipes de resgate, médicos ou suporte imediato. Acesse a aba de <strong>Vincular Atividades</strong> para despachar voluntários qualificados.
            </p>
          </div>
        </div>
      )}

      {/* Grid Indicators */}
      <div id="kpi-grid" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1 */}
        <div id="card-total-volunteers" className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-slate-500 text-xs font-semibold uppercase tracking-wider">Voluntários Cadastrados</span>
            <h3 className="text-2xl font-bold text-slate-900 mt-1">{stats.totalVolunteers}</h3>
            <p className="text-slate-500 text-xs mt-1">
              <span className="text-emerald-600 font-medium">{stats.activeVolunteers}</span> em situação de campo
            </p>
          </div>
          <div className="p-3 bg-emerald-50 rounded-xl text-emerald-600">
            <Users className="w-6 h-6" />
          </div>
        </div>

        {/* KPI 2 */}
        <div id="card-pending-needs" className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-slate-500 text-xs font-semibold uppercase tracking-wider">Demandas Pendentes</span>
            <h3 className="text-2xl font-bold text-amber-600 mt-1">{stats.pendingNeeds}</h3>
            <p className="text-slate-500 text-xs mt-1">
              Aguardando triagem de equipe
            </p>
          </div>
          <div className="p-3 bg-amber-50 rounded-xl text-amber-600">
            <Clock className="w-6 h-6 animate-pulse" />
          </div>
        </div>

        {/* KPI 3 */}
        <div id="card-in-progress" className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-slate-500 text-xs font-semibold uppercase tracking-wider">Em Andamento</span>
            <h3 className="text-2xl font-bold text-blue-600 mt-1">{stats.inProgressNeeds}</h3>
            <p className="text-slate-500 text-xs mt-1">
              Equipes ativamente atuando
            </p>
          </div>
          <div className="p-3 bg-blue-50 rounded-xl text-blue-600">
            <Activity className="w-6 h-6" />
          </div>
        </div>

        {/* KPI 4 */}
        <div id="card-completed-needs" className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-slate-500 text-xs font-semibold uppercase tracking-wider">Casos Resolvidos</span>
            <h3 className="text-2xl font-bold text-emerald-700 mt-1">{stats.completedNeeds}</h3>
            <p className="text-slate-500 text-xs mt-1">
              Sucesso nas intervenções
            </p>
          </div>
          <div className="p-3 bg-emerald-50 rounded-xl text-emerald-700">
            <CheckCircle className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Visual Charts Layout - Bento Grid */}
      <div id="dashboard-bento" className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Volunteer Skill Distribution & Region Needs */}
        <div id="volunteers-skill-dist" className="lg:col-span-7 bg-white p-6 rounded-xl border border-slate-100 shadow-sm space-y-6">
          <div>
            <h3 className="text-base font-bold text-slate-900">Distribuição Regional de Atividades</h3>
            <p className="text-xs text-slate-500 mt-0.5">Demanda e disponibilidade de recursos declarados pelas sub-regiões</p>
          </div>

          <div className="space-y-4">
            {regions.map((region, idx) => {
              const regionNeeds = needs.filter(n => n.region === region).length;
              const regionVolunteers = volunteers.filter(v => v.region === region).length;
              const maxVal = Math.max(...regions.map(r => {
                const nC = needs.filter(n => n.region === r).length;
                const vC = volunteers.filter(v => v.region === r).length;
                return Math.max(nC, vC, 1);
              }));

              const needsPct = (regionNeeds / maxVal) * 100;
              const volsPct = (regionVolunteers / maxVal) * 100;

              return (
                <div key={idx} className="p-3 bg-slate-50 rounded-lg space-y-2 border border-slate-100">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-semibold text-slate-700">{region}</span>
                    <span className="text-slate-500 text-[10px]">Max index ref: {maxVal}</span>
                  </div>
                  <div className="space-y-1.5 text-[11px]">
                    <div className="space-y-0.5">
                      <div className="flex justify-between">
                        <span className="text-rose-600">Demandas Críticas ({regionNeeds})</span>
                      </div>
                      <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                        <div className="bg-rose-500 h-full rounded-full transition-all duration-500" style={{ width: `${needsPct}%` }}></div>
                      </div>
                    </div>
                    <div className="space-y-0.5">
                      <div className="flex justify-between">
                        <span className="text-emerald-700">Voluntários Logados ({regionVolunteers})</span>
                      </div>
                      <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                        <div className="bg-emerald-500 h-full rounded-full transition-all duration-500" style={{ width: `${volsPct}%` }}></div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Key Logistics & Urgent Action Log */}
        <div id="urgent-actions-panel" className="lg:col-span-5 bg-white p-6 rounded-xl border border-slate-100 shadow-sm flex flex-col justify-between">
          <div className="space-y-4">
            <div>
              <h3 className="text-base font-bold text-slate-900">Logística de Triagem de Competências</h3>
              <p className="text-xs text-slate-500 mt-0.5">Voluntários disponíveis por categoria de habilitação</p>
            </div>

            <div className="space-y-2.5">
              {[
                { name: "Resgate e Barco", color: "bg-red-500", text: "text-red-700" },
                { name: "Motorista 4x4", color: "bg-orange-500", text: "text-orange-700" },
                { name: "Apoio Médico / Enfermagem", color: "bg-emerald-500", text: "text-emerald-700" },
                { name: "Cozinha e Cozinha Comunitária", color: "bg-amber-500", text: "text-amber-700" },
                { name: "Limpeza e Reconstrução", color: "bg-slate-500", text: "text-slate-700" },
                { name: "Suporte Psicológico", color: "bg-indigo-500", text: "text-indigo-700" },
                { name: "Triagem de Roupas", color: "bg-blue-500", text: "text-blue-700" },
                { name: "Distribuição de Donativos", color: "bg-purple-500", text: "text-purple-700" }
              ].map((skill, index) => {
                const count = stats.volunteersBySkill[skill.name] || 0;
                const totalVol = stats.totalVolunteers || 1;
                const pct = (count / totalVol) * 100;

                return (
                  <div key={index} className="space-y-1">
                    <div className="flex justify-between text-xs text-slate-700">
                      <span className="font-medium truncate max-w-[200px]">{skill.name}</span>
                      <span className="font-mono text-slate-600 font-bold">{count} voluntários</span>
                    </div>
                    <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                      <div className={`${skill.color} h-full rounded-full`} style={{ width: `${pct}%` }}></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 space-y-2 bg-amber-50/50 p-3 rounded-lg border border-dashed border-amber-200">
            <h4 className="text-xs font-bold text-amber-800 flex items-center gap-1">
              <ShieldAlert className="w-3.5 h-3.5 shrink-0 text-amber-600" />
              INFORMAÇÃO OPERACIONAL CRÍTICA
            </h4>
            <p className="text-[11px] text-amber-800 leading-relaxed">
              Priorize enviar voluntários com veículo 4x4 ou embarcações para a região do <strong>Bairro Humaitá</strong> e <strong>Eldorado do Sul</strong>, que apresentam as maiores complicações de transporte e asfalto submerso.
            </p>
          </div>
        </div>

      </div>

      {/* Safety Info Cards */}
      <div id="safety-quick-check" className="bg-gradient-to-br from-slate-900 to-slate-850 text-white p-6 rounded-2xl shadow-md">
        <div className="max-w-3xl">
          <span className="text-orange-400 font-bold text-[10px] tracking-widest uppercase">Protocolo de Operação Humanitária</span>
          <h3 className="text-xl font-bold mt-1 tracking-tight">Regras Básicas de Segurança para os Voluntários em Campo</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
            <div className="space-y-1.5">
              <span className="text-xs font-mono text-orange-400 font-bold">01. Evitar Água Contaminada</span>
              <p className="text-slate-300 text-xs leading-relaxed">
                As águas de enchentes podem transmitir Leptospirose e hepatites. Use botas impermeáveis e evite contato direto.
              </p>
            </div>
            <div className="space-y-1.5">
              <span className="text-xs font-mono text-orange-400 font-bold">02. Registro de Equipes</span>
              <p className="text-slate-300 text-xs leading-relaxed">
                Nenhum civil deve entrar em áreas de risco de desabamento ou resgate extremo sem se registrar nos postos de comando.
              </p>
            </div>
            <div className="space-y-1.5">
              <span className="text-xs font-mono text-orange-400 font-bold">03. Hidratação e Alimentação</span>
              <p className="text-slate-300 text-xs leading-relaxed">
                Leve sempre consigo garrafas de água mineral lacradas e consuma somente alimentos de fontes confiáveis ou enlatados.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
