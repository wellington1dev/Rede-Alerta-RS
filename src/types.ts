/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Volunteer {
  id: string;
  name: string;
  email: string;
  phone: string;
  skills: string[];
  availability: string;
  status: 'Ativo' | 'Inativo' | 'Em Ação';
  region: string;
  hasVehicle: boolean;
  vehicleType: string;
  notes: string;
  createdAt: string;
}

export interface Need {
  id: string;
  title: string;
  description: string;
  location: string;
  region: string;
  requiredSkills: string[];
  urgency: 'Alta' | 'Média' | 'Baixa';
  contactPerson: string;
  contactPhone: string;
  status: 'Pendente' | 'Em Andamento' | 'Concluido';
  volunteersNeeded: number;
  createdAt: string;
  notes: string;
}

export interface Assignment {
  id: string;
  volunteerId: string;
  needId: string;
  assignedAt: string;
  status: 'Ativo' | 'Concluido' | 'Cancelado';
  volunteerName?: string;
  needTitle?: string;
  needLocation?: string;
}

export interface DashboardStats {
  totalVolunteers: number;
  activeVolunteers: number;
  totalNeeds: number;
  pendingNeeds: number;
  inProgressNeeds: number;
  completedNeeds: number;
  urgentNeedsCount: number;
  volunteersBySkill: Record<string, number>;
  needsByRegion: Record<string, number>;
}
