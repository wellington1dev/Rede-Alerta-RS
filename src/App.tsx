/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { Volunteer, Need, Assignment, DashboardStats } from "./types";
import StatsDashboard from "./components/StatsDashboard";
import VolunteerList from "./components/VolunteerList";
import NeedList from "./components/NeedList";
import AssignmentManager from "./components/AssignmentManager";
import { 
  ShieldAlert, Activity, Users, MapPin, Radio, 
  Map as MapIcon, Database, CheckCircle, Clock, HeartHandshake, FileText, Bell, AlertTriangle
} from "lucide-react";

export default function App() {
  const [activeTab, setActiveTab] = useState<'map' | 'volunteers' | 'needs' | 'assignments'>('map');
  const [volunteers, setVolunteers] = useState<Volunteer[]>([]);
  const [needs, setNeeds] = useState<Need[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  
  const [loading, setLoading] = useState(true);
  const [actionLogs, setActionLogs] = useState<string[]>([
    "[Sistema] Banco operacional sincronizado com sucesso.",
    "[Alerta] Nível do Rio Jacuí em elevação contínua.",
    "[Cadastro] Central de Triagem da Paróquia São Geraldo operando.",
    "[Recurso] Carlos Eduardo Santos entrou em campo com barco inflável de resgate."
  ]);

  // Selected Map Feature
  const [selectedMapPoint, setSelectedMapPoint] = useState({
    title: "Humaitá / Cais Mauá",
    status: "Risco Extremo (Inundado)",
    count: 42,
    urgency: "Crítica"
  });

  // Fetch all database lists on mount
  const syncData = async () => {
    setLoading(true);
    try {
      const [vRes, nRes, aRes, sRes] = await Promise.all([
        fetch("/api/volunteers"),
        fetch("/api/needs"),
        fetch("/api/assignments"),
        fetch("/api/stats")
      ]);

      if (vRes.ok) setVolunteers(await vRes.json());
      if (nRes.ok) setNeeds(await nRes.json());
      if (aRes.ok) setAssignments(await aRes.json());
      if (sRes.ok) setStats(await sRes.json());
    } catch (error) {
      console.error("Erro ao sincronizar dados com o backend Node.js / Express:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    syncData();
  }, []);

  // Log automated action helper
  const addLog = (message: string) => {
    const time = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    setActionLogs(prev => [`[${time}] ${message}`, ...prev.slice(0, 9)]);
  };

  // Volunteer operations
  const handleAddVolunteer = async (volData: Omit<Volunteer, "id" | "createdAt">) => {
    try {
      const res = await fetch("/api/volunteers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(volData)
      });
      if (res.ok) {
        addLog(`Nova inscrição: ${volData.name} cadastrado na região ${volData.region}.`);
        await syncData();
        return true;
      }
    } catch (err) {
      console.error(err);
    }
    return false;
  };

  const handleEditVolunteer = async (id: string, volData: Partial<Volunteer>) => {
    try {
      const res = await fetch(`/api/volunteers/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(volData)
      });
      if (res.ok) {
        addLog(`Atualização: Dados de voluntário #${id.substring(0, 5)} modificados.`);
        await syncData();
        return true;
      }
    } catch (err) {
      console.error(err);
    }
    return false;
  };

  const handleDeleteVolunteer = async (id: string) => {
    try {
      const target = volunteers.find(v => v.id === id);
      const res = await fetch(`/api/volunteers/${id}`, { method: "DELETE" });
      if (res.ok) {
        addLog(`Remoção: Registro de ${target ? target.name : id} excluído permanentemente.`);
        await syncData();
        return true;
      }
    } catch (err) {
      console.error(err);
    }
    return false;
  };

  // Need operations
  const handleAddNeed = async (needData: Omit<Need, "id" | "createdAt" | "status">) => {
    try {
      const res = await fetch("/api/needs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(needData)
      });
      if (res.ok) {
        addLog(`Novo Alerta: "${needData.title}" postado na região ${needData.region}.`);
        await syncData();
        return true;
      }
    } catch (err) {
      console.error(err);
    }
    return false;
  };

  const handleEditNeed = async (id: string, needData: Partial<Need>) => {
    try {
      const res = await fetch(`/api/needs/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(needData)
      });
      if (res.ok) {
        const target = needs.find(n => n.id === id);
        const actionType = needData.status === "Concluido" ? "Conclusão realizada" : "Modificação";
        addLog(`${actionType}: Demanda "${target?.title}" alterada.`);
        await syncData();
        return true;
      }
    } catch (err) {
      console.error(err);
    }
    return false;
  };

  const handleDeleteNeed = async (id: string) => {
    try {
      const target = needs.find(n => n.id === id);
      const res = await fetch(`/api/needs/${id}`, { method: "DELETE" });
      if (res.ok) {
        addLog(`Exclusão: Demanda "${target?.title}" arquivada com sucesso do sistema geral.`);
        await syncData();
        return true;
      }
    } catch (err) {
      console.error(err);
    }
    return false;
  };

  // Assignment operations
  const handleAddAssignment = async (volunteerId: string, needId: string) => {
    try {
      const res = await fetch("/api/assignments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ volunteerId, needId })
      });
      if (res.ok) {
        const vol = volunteers.find(v => v.id === volunteerId);
        const need = needs.find(n => n.id === needId);
        addLog(`Despache Operacional: Voluntário ${vol?.name || volunteerId} destacado para cooperar em "${need?.title || needId}".`);
        await syncData();
        return true;
      }
    } catch (err) {
      console.error(err);
    }
    return false;
  };

  const handleUpdateAssignmentStatus = async (id: string, status: 'Ativo' | 'Concluido' | 'Cancelado') => {
    try {
      const res = await fetch(`/api/assignments/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status })
      });
      if (res.ok) {
        const target = assignments.find(a => a.id === id);
        const actionWord = status === 'Concluido' ? 'concluído com êxito' : 'cancelado pela coordenação';
        addLog(`Vínculo de Atividade: Despache ${target?.id.substring(0, 5)} ${actionWord}.`);
        await syncData();
        return true;
      }
    } catch (err) {
      console.error(err);
    }
    return false;
  };

  const handleDeleteAssignment = async (id: string) => {
    try {
      const res = await fetch(`/api/assignments/${id}`, { method: "DELETE" });
      if (res.ok) {
        addLog(`Vínculo apagado: Identificador #${id.substring(0, 5)} removido do banco Postgres/JSON.`);
        await syncData();
        return true;
      }
    } catch (err) {
      console.error(err);
    }
    return false;
  };

  // High urgency list for the Clean Minimalism Left Sidebar
  const urgentNeedsList = needs.filter(n => n.urgency === "Alta" && n.status !== "Concluido").slice(0, 3);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-900 overflow-x-hidden antialiased">
      
      {/* Header Navigation matching the Clean Minimalism reference design exactly */}
      <nav id="header-navigation" className="h-20 bg-white border-b border-slate-200 px-8 flex items-center justify-between shadow-sm shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 bg-red-600 rounded-xl flex items-center justify-center shadow-md shadow-red-200">
            {/* Elegant lighting thunderbolt icon style */}
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <div>
            <h1 className="text-xl font-black tracking-tight text-slate-900 uppercase">Rede Alerta RS</h1>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest leading-none">Coordenação de Desastres & Apoio Humanitário</p>
          </div>
        </div>

        {/* Navigation tabs styled beautifully with Clean Minimalism */}
        <div id="navigation-tabs" className="hidden md:flex items-center gap-1 bg-slate-100 p-1.5 rounded-xl border border-slate-200">
          <button 
            id="tab-map"
            onClick={() => setActiveTab('map')}
            className={`cursor-pointer text-xs font-bold px-4 py-2 rounded-lg transition-all flex items-center gap-1.5 ${
              activeTab === 'map' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-950'
            }`}
          >
            <MapIcon className="w-3.5 h-3.5" />
            Painel Geral & Mapa
          </button>
          
          <button 
            id="tab-volunteers"
            onClick={() => setActiveTab('volunteers')}
            className={`cursor-pointer text-xs font-bold px-4 py-2 rounded-lg transition-all flex items-center gap-1.5 ${
              activeTab === 'volunteers' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-950'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            Voluntários ({volunteers.length})
          </button>

          <button 
            id="tab-needs"
            onClick={() => setActiveTab('needs')}
            className={`cursor-pointer text-xs font-bold px-4 py-2 rounded-lg transition-all flex items-center gap-1.5 ${
              activeTab === 'needs' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-950'
            }`}
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            Demandas Urgentes ({needs.length})
          </button>

          <button 
            id="tab-assignments"
            onClick={() => setActiveTab('assignments')}
            className={`cursor-pointer text-xs font-bold px-4 py-2 rounded-lg transition-all flex items-center gap-1.5 ${
              activeTab === 'assignments' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-950'
            }`}
          >
            <HeartHandshake className="w-3.5 h-3.5" />
            Vincular Atividade ({assignments.filter(a => a.status === 'Ativo').length})
          </button>
        </div>

        {/* Right Info widgets matching Clean Minimalism reference design */}
        <div className="flex items-center gap-6">
          <div className="hidden sm:flex flex-col items-end leading-none space-y-1">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Localização de Campo</span>
            <span className="text-sm font-extrabold text-red-600">Porto Alegre, RS - Setor 04</span>
          </div>
          
          <div className="hidden sm:block h-10 w-px bg-slate-200"></div>
          
          <div className="flex items-center gap-2 bg-emerald-50 px-4 py-2 rounded-full border border-emerald-100 shadow-sm">
            <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse"></div>
            <span className="text-xs font-black tracking-wider text-emerald-700 uppercase">SISTEMA ONLINE</span>
          </div>
        </div>
      </nav>

      {/* Mobile Navigation Tabs (visible only on small views) */}
      <div className="md:hidden flex flex-wrap gap-1 bg-white border-b border-slate-200 p-2 justify-around">
        <button 
          onClick={() => setActiveTab('map')} 
          className={`flex-1 text-[11px] font-extrabold py-2 text-center rounded transition ${activeTab === 'map' ? 'bg-slate-900 text-white' : 'text-slate-600'}`}
        >
          Painel & Mapa
        </button>
        <button 
          onClick={() => setActiveTab('volunteers')} 
          className={`flex-1 text-[11px] font-extrabold py-2 text-center rounded transition ${activeTab === 'volunteers' ? 'bg-slate-900 text-white' : 'text-slate-600'}`}
        >
          Voluntários
        </button>
        <button 
          onClick={() => setActiveTab('needs')} 
          className={`flex-1 text-[11px] font-extrabold py-2 text-center rounded transition ${activeTab === 'needs' ? 'bg-slate-900 text-white' : 'text-slate-600'}`}
        >
          Demandas
        </button>
        <button 
          onClick={() => setActiveTab('assignments')} 
          className={`flex-1 text-[11px] font-extrabold py-2 text-center rounded transition ${activeTab === 'assignments' ? 'bg-slate-900 text-white' : 'text-slate-600'}`}
        >
          Matchs
        </button>
      </div>

      {/* Active Area Info block for user comfort */}
      <div id="system-alert-ticker" className="bg-slate-900 text-white text-xs py-2 px-8 flex justify-between items-center overflow-x-auto gap-4 shrink-0 font-mono">
        <div className="flex items-center gap-2 shrink-0">
          <Activity className="w-3.5 h-3.5 text-red-500 shrink-0" />
          <span className="font-bold text-red-400">ATIVIDADES CRÍTICAS:</span>
          <span>{needs.filter(n => n.urgency === "Alta" && n.status !== "Concluido").length} pendências de alta gravidade</span>
        </div>
        <div className="hidden md:flex gap-6 items-center">
          <span>👥 {volunteers.length} Voluntários Logados</span>
          <span className="text-emerald-400">● {volunteers.filter(v => v.status === "Em Ação").length} equipes ativas em campo</span>
          <span>🛠️ {assignments.length} Despaches no histórico</span>
        </div>
      </div>

      {/* Main Content Dashboard Area - Custom Multi-column Bento Grid for Minimalist styling */}
      <div className="flex-1 max-w-7xl mx-auto w-full p-4 sm:p-6 grid grid-cols-12 gap-6 overflow-hidden">
        
        {/* TAB 1: Painel Geral com Mapa Interativo (Layout Bento com Sidebars de Referência) */}
        {activeTab === 'map' && (
          <>
            {/* Left Sidebar: Real-time Emergency Needs list */}
            <section id="sidebar-left" className="col-span-12 lg:col-span-3 flex flex-col gap-4">
              <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex-1 flex flex-col justify-between">
                <div>
                  <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-1">
                    <ShieldAlert className="w-4 h-4 text-slate-500" />
                    Necessidades Urgentes
                  </h2>
                  <div className="space-y-3">
                    {urgentNeedsList.length === 0 ? (
                      <p className="text-xs text-slate-500 italic p-3 text-center bg-slate-50 rounded-xl">
                        Nenhuma demanda crítica em andamento. Todas resolvidas ou em triagem secundária.
                      </p>
                    ) : (
                      urgentNeedsList.map(n => (
                        <div 
                          key={n.id} 
                          onClick={() => {
                            setActiveTab('needs');
                          }}
                          className="p-3 bg-red-50 hover:bg-red-100/70 cursor-pointer border border-red-100 rounded-xl transition space-y-1"
                        >
                          <p className="text-[10px] font-bold text-red-700 uppercase tracking-tight">{n.region.toUpperCase()}</p>
                          <p className="text-xs font-extrabold text-red-900 leading-snug">{n.title}</p>
                          <div className="flex justify-between items-center text-[9px] text-red-650 font-medium">
                            <span>Vagas: {n.volunteersNeeded} un</span>
                            <span className="uppercase">Urgência {n.urgency}</span>
                          </div>
                        </div>
                      ))
                    )}

                    {/* Secondary items indicators */}
                    <div className="p-3 bg-blue-50 border border-blue-100 rounded-xl space-y-0.5">
                      <p className="text-[10px] font-bold text-blue-700 mb-0.5">ESTADO GERAL DA OPERAÇÃO</p>
                      <p className="text-xs font-extrabold text-blue-900 leading-none">Cozinha e Coletas de Alimento</p>
                      <p className="text-[9px] text-blue-600 font-medium pt-1 uppercase">Posto Central ativo em Menino Deus</p>
                    </div>
                  </div>
                </div>

                {/* Database State Card from Clean Minimalism design HTML */}
                <div className="bg-slate-900 rounded-2xl p-5 text-white shadow-lg mt-6">
                  <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 flex items-center gap-1 justify-between">
                    <span>Sumário do Banco</span>
                    <Database className="w-3 h-3 text-emerald-400" />
                  </h3>
                  <div className="flex justify-between items-baseline mb-1">
                    <span className="text-3xl font-mono font-black tracking-tight">{volunteers.length}</span>
                    <span className="text-[10px] text-emerald-400 font-bold bg-emerald-950 px-2 py-0.5 rounded-full border border-emerald-900 animate-pulse">+12 min</span>
                  </div>
                  <p className="text-[10px] text-slate-400 leading-snug">
                    Voluntários ativos e cadastrados estruturados via Node.js local storage simulado.
                  </p>
                </div>
              </div>
            </section>

            {/* Middle Module: Map Grid from Clean Minimalism layout */}
            <section id="map-interaction" className="col-span-12 lg:col-span-6 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col min-h-[480px]">
              <div className="p-4 border-b border-slate-200 flex justify-between items-center bg-slate-50/50">
                <div>
                  <h2 className="text-xs font-bold text-slate-700 tracking-wider uppercase">Mapa de Calor Operacional</h2>
                  <p className="text-[10px] text-slate-500 mt-0.5">Pulsos indicam pontos de crises e localização das equipes</p>
                </div>
                <div className="flex gap-1.5 text-[9px] font-bold">
                  <span className="px-2 py-1 bg-white border border-slate-200 text-rose-700 rounded shadow-xs uppercase">🚨 Crises Ativas</span>
                  <span className="px-2 py-1 bg-white border border-slate-200 text-blue-700 rounded shadow-xs uppercase">⚓ Resgates</span>
                  <span className="px-2 py-1 bg-white border border-slate-200 text-emerald-700 rounded shadow-xs uppercase font-extrabold">🏨 Abrigos</span>
                </div>
              </div>

              {/* Map rendering with dot coordinates and triggers */}
              <div className="flex-1 relative bg-slate-100 min-h-[300px]">
                {/* Radial Grid Pattern */}
                <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(#cbd5e1 1.5px, transparent 1.5px)', backgroundSize: '18px 18px' }}></div>
                
                {/* Interactive Map Nodes */}
                {/* Hotspot 1: Cais Mauá / Humaitá - Risco de resgate */}
                <button 
                  onClick={() => setSelectedMapPoint({
                    title: "Porto Alegre - Bairro Humaitá",
                    status: "Nível Crítico de Enchente",
                    count: needs.filter(n => n.region.includes("Humaitá") && n.status !== 'Concluido').length,
                    urgency: "Crítica / Imediata"
                  })}
                  className="absolute top-1/4 left-1/3 w-14 h-14 bg-red-500/20 rounded-full flex items-center justify-center border border-red-500 animate-pulse hover:bg-red-500/30 transition shadow-lg cursor-pointer"
                  title="Clique para inspecionar setor"
                >
                  <div className="w-3.5 h-3.5 bg-red-600 rounded-full border border-white"></div>
                </button>

                {/* Hotspot 2: Canoas - Mathias Velho */}
                <button 
                  onClick={() => setSelectedMapPoint({
                    title: "Canoas - Mathias Velho",
                    status: "Triagem Geral de Roupas e Saúde",
                    count: volunteers.filter(v => v.region.includes("Canoas")).length,
                    urgency: "Média / Apoio Local"
                  })}
                  className="absolute top-1/3 right-1/3 w-20 h-20 bg-amber-500/20 rounded-full flex items-center justify-center border border-amber-500 hover:bg-amber-500/35 transition cursor-pointer"
                  title="Clique para inspecionar setor"
                >
                  <div className="w-3 h-3 bg-amber-600 rounded-full border border-white"></div>
                </button>

                {/* Hotspot 3: Sarandi / Eldorado */}
                <button 
                  onClick={() => setSelectedMapPoint({
                    title: "Eldorado do Sul - Centro",
                    status: "Limpeza de Escola Pública e Logística",
                    count: needs.filter(n => n.region.includes("Eldorado")).length,
                    urgency: "Necessita Força-Tarefa Físico"
                  })}
                  className="absolute top-2/3 left-1/4 w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center border border-blue-500 hover:bg-blue-500/30 transition cursor-pointer"
                >
                  <div className="w-2.5 h-2.5 bg-blue-600 rounded-full border border-white animate-bounce"></div>
                </button>

                {/* Map Selected Feature Panel */}
                <div className="absolute bottom-4 left-4 right-4 sm:left-auto sm:right-4 bg-white p-4 rounded-xl shadow-xl border border-slate-200 max-w-sm space-y-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-[9px] font-black tracking-widest text-slate-400 uppercase">Foco de Análise</span>
                      <h4 className="text-xs font-black text-slate-900 mt-0.5">{selectedMapPoint.title}</h4>
                    </div>
                    <span className="bg-red-50 text-red-700 text-[8px] font-black tracking-widest uppercase px-1.5 py-0.5 rounded border border-red-100">
                      STATUS ATIVO
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-600 leading-snug">
                    <p>🗺️ <strong>Atividade Local:</strong> {selectedMapPoint.status}</p>
                    <p>📊 <strong>Registro Operacional:</strong> {selectedMapPoint.count} ocorrências / voluntários logados</p>
                    <p>⚠️ <strong>Prioridade Técnica:</strong> <span className="text-red-650 font-bold">{selectedMapPoint.urgency}</span></p>
                  </div>
                  <button 
                    onClick={() => setActiveTab('assignments')}
                    className="w-full text-center py-1.5 bg-slate-950 text-white rounded text-[10px] font-extrabold hover:bg-slate-800 uppercase tracking-widest transition"
                  >
                    Vincular Equipes Neste Setor
                  </button>
                </div>
              </div>
            </section>

            {/* Right Sidebar: Controls and Communications from Clean Minimalism */}
            <section id="sidebar-right" className="col-span-12 lg:col-span-3 flex flex-col gap-4">
              {/* Coordination controls card */}
              <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-4">
                <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Coordenadores Ativos</h2>
                
                <div className="space-y-3.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center text-xs font-bold text-slate-800">
                        MT
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-800">Marcos Torres</p>
                        <p className="text-[9px] text-slate-500 font-semibold tracking-wider uppercase">Setor Alpha 01</p>
                      </div>
                    </div>
                    <span className="text-[9px] font-bold uppercase tracking-wider text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">ATIVO</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center text-xs font-bold text-slate-800">
                        AL
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-800">Ana Lima</p>
                        <p className="text-[9px] text-slate-500 font-semibold tracking-wider uppercase">Logística Norte</p>
                      </div>
                    </div>
                    <span className="text-[9px] font-bold uppercase tracking-wider text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">ATIVO</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center text-xs font-bold text-slate-800">
                        RS
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-800">Rita Soares</p>
                        <p className="text-[9px] text-slate-500 font-semibold tracking-wider uppercase">Enfermagem Sarandi</p>
                      </div>
                    </div>
                    <span className="text-[9px] font-bold uppercase tracking-wider text-amber-600 bg-amber-50 px-2 py-0.5 rounded border border-amber-100">AGUARDANDO</span>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100">
                  <button 
                    onClick={() => setActiveTab('assignments')}
                    className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-[10px] font-bold tracking-widest uppercase transition-all flex items-center justify-center gap-1.5"
                  >
                    <HeartHandshake className="w-3.5 h-3.5 text-orange-400" />
                    Destinar Apoio
                  </button>
                </div>
              </div>

              {/* Live Communications Logs from Clean Minimalism reference design */}
              <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex-1 flex flex-col justify-between overflow-hidden">
                <div>
                  <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-1">
                    <Radio className="w-3.5 h-3.5 text-slate-400" />
                    Comunicações Recentes
                  </h2>
                  <div className="space-y-2 max-h-[180px] overflow-y-auto pr-1">
                    {actionLogs.map((log, index) => (
                      <div key={index} className="text-[10px] leading-normal border-b border-slate-50 pb-1.5">
                        <span className="font-extrabold text-navy-800 block md:inline mr-1">{log.substring(0, 9)}</span>
                        <span className="text-slate-600">{log.substring(9)}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <p className="text-[9px] text-slate-400 italic mt-3 pt-2 border-t border-slate-50 text-center">
                  Canais criptografados integrados com Defesa Civil RS.
                </p>
              </div>
            </section>
          </>
        )}

        {/* TAB 2: Directory and Volunteer Management */}
        {activeTab === 'volunteers' && (
          <section id="volunteers-panel" className="col-span-12 space-y-6">
            <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
              <div>
                <h2 className="text-base font-extrabold text-slate-950 flex items-center gap-2">
                  <Users className="text-orange-600 w-5 h-5" />
                  Módulo de Registro e Alocação de Voluntários
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">Cadastre habilidades práticas e regule a atuação de suporte temporário</p>
              </div>
              <span className="text-[10px] font-bold bg-slate-100 text-slate-800 px-3 py-1 rounded">Habilitação via Node.js local storage</span>
            </div>
            
            <VolunteerList 
              volunteers={volunteers}
              loading={loading}
              onAddVolunteer={handleAddVolunteer}
              onEditVolunteer={handleEditVolunteer}
              onDeleteVolunteer={handleDeleteVolunteer}
            />
          </section>
        )}

        {/* TAB 3: Emergencies / Needs management */}
        {activeTab === 'needs' && (
          <section id="needs-panel" className="col-span-12 space-y-6">
            <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
              <div>
                <h2 className="text-base font-extrabold text-slate-950 flex items-center gap-2">
                  <ShieldAlert className="text-red-650 w-5 h-5" />
                  Portal de Demandas Emergenciais & Central de Crise
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">Cadastre e gerencie pedidos de socorro, carência de comida, água, médicos ou suporte</p>
              </div>
              <span className="text-[10px] font-bold bg-slate-100 text-slate-800 px-3 py-1 rounded">Sincronizado</span>
            </div>

            <NeedList
              needs={needs}
              loading={loading}
              onAddNeed={handleAddNeed}
              onEditNeed={handleEditNeed}
              onDeleteNeed={handleDeleteNeed}
            />
          </section>
        )}

        {/* TAB 4: Match connections / Match allocations */}
        {activeTab === 'assignments' && (
          <section id="assignments-panel" className="col-span-12 space-y-6">
            <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
              <div>
                <h2 className="text-base font-extrabold text-slate-950 flex items-center gap-2">
                  <HeartHandshake className="text-slate-900 w-5 h-5" />
                  Cruzamento e Despache Operacional (Match de Capacidades)
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">Atribua voluntários ativamente qualificados para as demandas e coordene a liberação pós-conclusão</p>
              </div>
              <span className="text-[10px] font-bold bg-slate-100 text-slate-800 px-3 py-1 rounded">Ativo</span>
            </div>

            <AssignmentManager
              volunteers={volunteers}
              needs={needs}
              assignments={assignments}
              loading={loading}
              onAddAssignment={handleAddAssignment}
              onUpdateAssignmentStatus={handleUpdateAssignmentStatus}
              onDeleteAssignment={handleDeleteAssignment}
            />
          </section>
        )}

      </div>

      {/* Embedded KPI Stats row on sub-footer for rich visibility */}
      <div className="bg-white border-t border-slate-200 p-6 shadow-inner shrink-0">
        <div className="max-w-7xl mx-auto">
          <h4 className="text-xs font-extrabold text-slate-400 uppercase tracking-widest gap-1 mb-4 flex items-center">
            <Activity className="w-4 h-4 text-slate-500" />
            CONSOLIDAÇÃO EM TEMPO REAL DAS ESTATÍSTICAS OPERACIONAIS
          </h4>
          <StatsDashboard 
            stats={stats}
            needs={needs}
            volunteers={volunteers}
            loading={loading}
          />
        </div>
      </div>

      {/* Footer Bar matching design HTML reference design exactly */}
      <footer id="dashboard-footer" className="h-14 bg-white border-t border-slate-200 px-8 flex items-center justify-between shadow-sm shrink-0">
        <div className="flex gap-6">
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Node.js API: v2.4.2</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 bg-red-500 rounded-full"></div>
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">PostgreSQL Local Instance: Primary-01</span>
          </div>
          <div className="hidden sm:flex items-center gap-2">
            <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></div>
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">State Management: Client Memory Sync</span>
          </div>
        </div>
        
        <div className="text-[10px] font-bold text-slate-400 tracking-wide">
          Plataforma de Auxílio Humanitário © {new Date().getFullYear()} - Desafio Técnico Final
        </div>
      </footer>

    </div>
  );
}
