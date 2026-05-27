-- PostgreSQL Database Schema for "Coordenação de Voluntários"
-- This schema represents the production PostgreSQL database structure.

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Table for Voluntários (Volunteers)
CREATE TABLE IF NOT EXISTS volunteers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    phone VARCHAR(50) NOT NULL,
    skills TEXT[] NOT NULL DEFAULT '{}', -- Array of skills using PostgreSQL array support
    availability VARCHAR(100) NOT NULL, -- e.g., 'Manhã', 'Tarde', 'Noite', 'Fim de semana', 'Integral'
    status VARCHAR(50) NOT NULL DEFAULT 'Ativo', -- 'Ativo', 'Inativo', 'Em Ação'
    region VARCHAR(255) NOT NULL, -- neighborhood or area of action
    has_vehicle BOOLEAN NOT NULL DEFAULT FALSE,
    vehicle_type VARCHAR(100) NOT NULL DEFAULT 'Nenhum', -- 'Carro', 'Moto', 'Caminhonete 4x4', 'Barco'
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Table for Demandas / Necessidades Urgentess (Needs/Demands)
CREATE TABLE IF NOT EXISTS needs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    location VARCHAR(255) NOT NULL, -- Specific shelter, school, gym, address, etc.
    region VARCHAR(255) NOT NULL, -- Neighborhood or larger district
    required_skills TEXT[] NOT NULL DEFAULT '{}', -- Match with volunteer skills
    urgency VARCHAR(50) NOT NULL DEFAULT 'Média', -- 'Alta', 'Média', 'Baixa'
    contact_person VARCHAR(255) NOT NULL,
    contact_phone VARCHAR(50) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'Pendente', -- 'Pendente', 'Em Andamento', 'Concluido'
    volunteers_needed INT NOT NULL DEFAULT 1,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Table for Desvinculações / Atribuições (Volunteer Assignments to Needs)
CREATE TABLE IF NOT EXISTS assignments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    volunteer_id UUID NOT NULL REFERENCES volunteers(id) ON DELETE CASCADE,
    need_id UUID NOT NULL REFERENCES needs(id) ON DELETE CASCADE,
    assigned_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(50) NOT NULL DEFAULT 'Ativo', -- 'Ativo', 'Concluido', 'Cancelado'
    CONSTRAINT unique_active_assignment UNIQUE (volunteer_id, need_id, status)
);

-- Add indexes for common lookup fields to speed up queries
CREATE INDEX IF NOT EXISTS idx_volunteers_skills ON volunteers USING gin(skills);
CREATE INDEX IF NOT EXISTS idx_volunteers_region ON volunteers(region);
CREATE INDEX IF NOT EXISTS idx_volunteers_status ON volunteers(status);
CREATE INDEX IF NOT EXISTS idx_needs_urgency ON needs(urgency);
CREATE INDEX IF NOT EXISTS idx_needs_status ON needs(status);
CREATE INDEX IF NOT EXISTS idx_assignments_volunteer ON assignments(volunteer_id);
CREATE INDEX IF NOT EXISTS idx_assignments_need ON assignments(need_id);

-- Insert Seed/Sample Data for initial simulation in production
-- (These will match the interactive data we set up for our sandbox!)
