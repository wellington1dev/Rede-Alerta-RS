/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from "express";
import fs from "fs";
import path from "path";
import { createServer as createViteServer } from "vite";
import { Volunteer, Need, Assignment, DashboardStats } from "./src/types.js";

const app = express();
const PORT = 3000;

app.use(express.json());

// Ensure data folder exists
const DATA_DIR = path.join(process.cwd(), "data");
const DB_FILE = path.join(DATA_DIR, "database.json");

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Initial seed data representing real-life scenario of flood assistance coordination in Rio Grande do Sul
const SEED_VOLUNTEERS: Volunteer[] = [
  {
    id: "v1",
    name: "Carlos Eduardo Santos",
    email: "carlos.edu@gmail.com",
    phone: "(51) 98122-3344",
    skills: ["Resgate e Barco", "Motorista 4x4"],
    availability: "Integral",
    status: "Em Ação",
    region: "Canoas - Mathias Velho",
    hasVehicle: true,
    vehicleType: "Barco e Caminhonete 4x4",
    notes: "Possuo barco a motor inflável de 5 metros e caminhonete para transporte de insumos.",
    createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: "v2",
    name: "Dra. Mariana Rezende",
    email: "mari.medica@hotmail.com",
    phone: "(51) 99311-5566",
    skills: ["Apoio Médico / Enfermagem"],
    availability: "Tarde",
    status: "Ativo",
    region: "Porto Alegre - Sarandi",
    hasVehicle: true,
    vehicleType: "Carro",
    notes: "Médica intensivista voluntária. Posso atuar em abrigos temporários.",
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: "v3",
    name: "Ana Carla Silveira",
    email: "anac.silva@outlook.com",
    phone: "(51) 98777-6655",
    skills: ["Cozinha e Cozinha Comunitária", "Distribuição de Donativos"],
    availability: "Manhã",
    status: "Ativo",
    region: "Porto Alegre - Bairro Menino Deus",
    hasVehicle: false,
    vehicleType: "Nenhum",
    notes: "Experiência com culinária coletiva e preparação de marmitas em larga escala.",
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: "v4",
    name: "Roberto Lima de Oliveira",
    email: "roberto.lima@uol.com.br",
    phone: "(51) 99111-2233",
    skills: ["Limpeza e Reconstrução", "Distribuição de Donativos"],
    availability: "Fim de semana",
    status: "Ativo",
    region: "Eldorado do Sul - Centro",
    hasVehicle: true,
    vehicleType: "Moto",
    notes: "Disponível para trabalho físico pesado, limpeza de escolas e desobstrução de caminhos.",
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: "v5",
    name: "Felipe Azevedo Netto",
    email: "felipe.psico@gmail.com",
    phone: "(51) 98455-1100",
    skills: ["Suporte Psicológico"],
    availability: "Noite",
    status: "Em Ação",
    region: "Canoas - Mathias Velho",
    hasVehicle: false,
    vehicleType: "Nenhum",
    notes: "Psicólogo especializado em trauma e acolhimento em situações de calamidade pública.",
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: "v6",
    name: "Beatriz Dorneles",
    email: "bia.dorneles@gmail.com",
    phone: "(51) 99555-8899",
    skills: ["Triagem de Roupas", "Distribuição de Donativos"],
    availability: "Tarde",
    status: "Ativo",
    region: "Porto Alegre - Bairro Humaitá",
    hasVehicle: false,
    vehicleType: "Nenhum",
    notes: "Disponível para ajudar no centro de distribuição organizando agasalhos e mantimentos.",
    createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString()
  }
];

const SEED_NEEDS: Need[] = [
  {
    id: "n1",
    title: "Resgatar moradores ilhados no Humaitá",
    description: "Há cerca de 12 famílias ilhadas no segundo piso de casas perto da Rua Ernesto Neugebauer. É necessário barcos de apoio e coletes salva-vidas.",
    location: "Rua Ernesto Neugebauer, próximo ao trilho - Humaitá",
    region: "Porto Alegre - Bairro Humaitá",
    requiredSkills: ["Resgate e Barco", "Motorista 4x4"],
    urgency: "Alta",
    contactPerson: "Tenente Marcos (Corpo de Bombeiros voluntário)",
    contactPhone: "(51) 98100-2020",
    status: "Em Andamento",
    volunteersNeeded: 3,
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    notes: "Coordenação conjunta com a Defesa Civil local. Recomenda-se coletes reservas."
  },
  {
    id: "n2",
    title: "Triagem e organização de donativos no Ginásio Municipal",
    description: "Chegaram 4 caminhões de agasalhos e alimentos. Precisamos de pessoas para descarregar, triar por tamanho e montar cestas básicas de apoio.",
    location: "Ginásio Municipal de Canoas - Bairro Igara",
    region: "Canoas - Mathias Velho",
    requiredSkills: ["Triagem de Roupas", "Distribuição de Donativos"],
    urgency: "Média",
    contactPerson: "Clara Mendes (Ação Solidária)",
    contactPhone: "(51) 99200-3030",
    status: "Pendente",
    volunteersNeeded: 8,
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    notes: "Ginásio limpo e seco. Água e refeições serão fornecidas para os voluntários locais."
  },
  {
    id: "n3",
    title: "Cozinha Comunitária para preparo de marmitas",
    description: "Precisamos de auxiliares de cozinha para ajudar a preparar 300 refeições diárias para os desabrigados acolhidos na Paróquia local.",
    location: "Paróquia São Geraldo - Menino Deus",
    region: "Porto Alegre - Bairro Menino Deus",
    requiredSkills: ["Cozinha e Cozinha Comunitária"],
    urgency: "Alta",
    contactPerson: "Padre Anselmo",
    contactPhone: "(51) 98777-1122",
    status: "Pendente",
    volunteersNeeded: 4,
    createdAt: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
    notes: "Os insumos alimentícios estão estocados, a urgência é por mão de obra para descascar legumes e cozinhar."
  },
  {
    id: "n4",
    title: "Atendimento Psicológico no Abrigo de Idosos",
    description: "Acolhimento emocional para idosos afetados pelas enchentes que perderam suas casas e estão muito ansiosos/desorientados.",
    location: "Abrigo Provisório Escola Estadual Esperança - Mathias Velho",
    region: "Canoas - Mathias Velho",
    requiredSkills: ["Suporte Psicológico"],
    urgency: "Alta",
    contactPerson: "Coordenadora Simone",
    contactPhone: "(51) 99400-5050",
    status: "Em Andamento",
    volunteersNeeded: 2,
    createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
    notes: "Local possui sala reservada para escuta de apoio terapêutico e rodas de conversa."
  },
  {
    id: "n5",
    title: "Limpeza de Escola Municipal após recuo das águas",
    description: "A água baixou na escola e há muito lodo acumulado nas salas e biblioteca. Precisamos de voluntários com botas e rodos para remoção rápida e higienização.",
    location: "Escola Municipal Eldorado Feliz - Centro",
    region: "Eldorado do Sul - Centro",
    requiredSkills: ["Limpeza e Reconstrução"],
    urgency: "Baixa",
    contactPerson: "Diretora Valéria",
    contactPhone: "(51) 98899-7766",
    status: "Pendente",
    volunteersNeeded: 10,
    createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
    notes: "Prefeitura fornecerá cloro, desinfetantes, lavadoras de alta pressão e luvas de proteção."
  }
];

const SEED_ASSIGNMENTS: Assignment[] = [
  {
    id: "a1",
    volunteerId: "v1",
    needId: "n1",
    assignedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    status: "Ativo"
  },
  {
    id: "a2",
    volunteerId: "v5",
    needId: "n4",
    assignedAt: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
    status: "Ativo"
  }
];

interface DBStructure {
  volunteers: Volunteer[];
  needs: Need[];
  assignments: Assignment[];
}

// Read database from JSON file
function readDB(): DBStructure {
  try {
    if (fs.existsSync(DB_FILE)) {
      const data = fs.readFileSync(DB_FILE, "utf-8");
      return JSON.parse(data);
    }
  } catch (error) {
    console.error("Erro ao ler o banco de dados local. Recriando...", error);
  }

  // Write default seed database
  const initialDB: DBStructure = {
    volunteers: SEED_VOLUNTEERS,
    needs: SEED_NEEDS,
    assignments: SEED_ASSIGNMENTS
  };
  writeDB(initialDB);
  return initialDB;
}

// Write database to JSON file
function writeDB(data: DBStructure) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), "utf-8");
  } catch (error) {
    console.error("Erro ao gravar no banco de dados local", error);
  }
}

// Endpoint status checks / health
app.get("/api/health", (req, res) => {
  res.json({ status: "healthy", timestamp: new Date().toISOString() });
});

// VOLUNTEER ENDPOINTS
app.get("/api/volunteers", (req, res) => {
  const db = readDB();
  let result = [...db.volunteers];
  
  // Apply search query
  const query = req.query.q as string;
  if (query) {
    const qLower = query.toLowerCase();
    result = result.filter(v => 
      v.name.toLowerCase().includes(qLower) || 
      v.email.toLowerCase().includes(qLower) ||
      v.notes.toLowerCase().includes(qLower) ||
      v.skills.some(s => s.toLowerCase().includes(qLower))
    );
  }

  // Apply skill filter
  const skill = req.query.skill as string;
  if (skill) {
    result = result.filter(v => v.skills.includes(skill));
  }

  // Apply status filter
  const status = req.query.status as string;
  if (status) {
    result = result.filter(v => v.status === status);
  }

  // Apply region filter
  const region = req.query.region as string;
  if (region) {
    result = result.filter(v => v.region === region);
  }

  // Return sorted descending by creation date
  result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  res.json(result);
});

app.post("/api/volunteers", (req, res) => {
  const db = readDB();
  const { name, email, phone, skills, availability, region, hasVehicle, vehicleType, notes } = req.body;
  
  if (!name || !email || !phone) {
    return res.status(400).json({ error: "Nome, E-mail e Telefone são campos obrigatórios." });
  }

  // Check unique email
  if (db.volunteers.some(v => v.email.toLowerCase() === email.toLowerCase())) {
    return res.status(400).json({ error: "Já existe um voluntário cadastrado com este endereço de e-mail." });
  }

  const newVolunteer: Volunteer = {
    id: "v_" + Date.now() + "_" + Math.random().toString(36).substr(2, 5),
    name,
    email,
    phone,
    skills: Array.isArray(skills) ? skills : [],
    availability: availability || "Fim de semana",
    status: "Ativo",
    region: region || "Geral",
    hasVehicle: !!hasVehicle,
    vehicleType: vehicleType || "Nenhum",
    notes: notes || "",
    createdAt: new Date().toISOString()
  };

  db.volunteers.push(newVolunteer);
  writeDB(db);
  res.status(201).json(newVolunteer);
});

app.put("/api/volunteers/:id", (req, res) => {
  const db = readDB();
  const { id } = req.params;
  const index = db.volunteers.findIndex(v => v.id === id);

  if (index === -1) {
    return res.status(404).json({ error: "Voluntário não encontrado." });
  }

  const volunteer = db.volunteers[index];
  const { name, email, phone, skills, availability, status, region, hasVehicle, vehicleType, notes } = req.body;

  // Validate unique email if edited
  if (email && email.toLowerCase() !== volunteer.email.toLowerCase()) {
    if (db.volunteers.some(v => v.id !== id && v.email.toLowerCase() === email.toLowerCase())) {
      return res.status(400).json({ error: "E-mail já cadastrado por outro voluntário." });
    }
  }

  db.volunteers[index] = {
    ...volunteer,
    name: name !== undefined ? name : volunteer.name,
    email: email !== undefined ? email : volunteer.email,
    phone: phone !== undefined ? phone : volunteer.phone,
    skills: skills !== undefined ? skills : volunteer.skills,
    availability: availability !== undefined ? availability : volunteer.availability,
    status: status !== undefined ? status : volunteer.status,
    region: region !== undefined ? region : volunteer.region,
    hasVehicle: hasVehicle !== undefined ? !!hasVehicle : volunteer.hasVehicle,
    vehicleType: vehicleType !== undefined ? vehicleType : volunteer.vehicleType,
    notes: notes !== undefined ? notes : volunteer.notes
  };

  writeDB(db);
  res.json(db.volunteers[index]);
});

app.delete("/api/volunteers/:id", (req, res) => {
  const db = readDB();
  const { id } = req.params;
  const initialCount = db.volunteers.length;
  
  db.volunteers = db.volunteers.filter(v => v.id !== id);
  
  // Delete assignments of this volunteer
  db.assignments = db.assignments.filter(a => a.volunteerId !== id);

  if (db.volunteers.length === initialCount) {
    return res.status(404).json({ error: "Voluntário não encontrado." });
  }

  writeDB(db);
  res.json({ message: "Voluntário removido com sucesso." });
});


// EMERGENCY NEEDS ENDPOINTS
app.get("/api/needs", (req, res) => {
  const db = readDB();
  let result = [...db.needs];

  // Apply filters
  const urgency = req.query.urgency as string;
  if (urgency) {
    result = result.filter(n => n.urgency === urgency);
  }

  const status = req.query.status as string;
  if (status) {
    result = result.filter(n => n.status === status);
  }

  const region = req.query.region as string;
  if (region) {
    result = result.filter(n => n.region === region);
  }

  const skill = req.query.skill as string;
  if (skill) {
    result = result.filter(n => n.requiredSkills.includes(skill));
  }

  const query = req.query.q as string;
  if (query) {
    const qLower = query.toLowerCase();
    result = result.filter(n =>
      n.title.toLowerCase().includes(qLower) ||
      n.description.toLowerCase().includes(qLower) ||
      n.location.toLowerCase().includes(qLower)
    );
  }

  // Sort descending by priority, then creation date
  const urgencyWeight = { Alta: 3, Média: 2, Baixa: 1 };
  result.sort((a, b) => {
    const uA = urgencyWeight[a.urgency] || 0;
    const uB = urgencyWeight[b.urgency] || 0;
    if (uB !== uA) return uB - uA;
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  res.json(result);
});

app.post("/api/needs", (req, res) => {
  const db = readDB();
  const { title, description, location, region, requiredSkills, urgency, contactPerson, contactPhone, volunteersNeeded, notes } = req.body;

  if (!title || !description || !location || !region || !contactPerson || !contactPhone) {
    return res.status(400).json({ error: "Título, descrição, local, região, pessoa de contato e telefone são obrigatórios." });
  }

  const newNeed: Need = {
    id: "n_" + Date.now() + "_" + Math.random().toString(36).substr(2, 5),
    title,
    description,
    location,
    region,
    requiredSkills: Array.isArray(requiredSkills) ? requiredSkills : [],
    urgency: urgency || "Média",
    contactPerson,
    contactPhone,
    status: "Pendente",
    volunteersNeeded: parseInt(volunteersNeeded, 10) || 1,
    notes: notes || "",
    createdAt: new Date().toISOString()
  };

  db.needs.push(newNeed);
  writeDB(db);
  res.status(201).json(newNeed);
});

app.put("/api/needs/:id", (req, res) => {
  const db = readDB();
  const { id } = req.params;
  const index = db.needs.findIndex(n => n.id === id);

  if (index === -1) {
    return res.status(404).json({ error: "Demanda não encontrada." });
  }

  const need = db.needs[index];
  const { title, description, location, region, requiredSkills, urgency, contactPerson, contactPhone, status, volunteersNeeded, notes } = req.body;

  db.needs[index] = {
    ...need,
    title: title !== undefined ? title : need.title,
    description: description !== undefined ? description : need.description,
    location: location !== undefined ? location : need.location,
    region: region !== undefined ? region : need.region,
    requiredSkills: requiredSkills !== undefined ? requiredSkills : need.requiredSkills,
    urgency: urgency !== undefined ? urgency : need.urgency,
    contactPerson: contactPerson !== undefined ? contactPerson : need.contactPerson,
    contactPhone: contactPhone !== undefined ? contactPhone : need.contactPhone,
    status: status !== undefined ? status : need.status,
    volunteersNeeded: volunteersNeeded !== undefined ? parseInt(volunteersNeeded, 10) : need.volunteersNeeded,
    notes: notes !== undefined ? notes : need.notes
  };

  writeDB(db);
  res.json(db.needs[index]);
});

app.delete("/api/needs/:id", (req, res) => {
  const db = readDB();
  const { id } = req.params;
  const initialCount = db.needs.length;

  db.needs = db.needs.filter(n => n.id !== id);
  
  // Clean up assignments associated
  db.assignments = db.assignments.filter(a => a.needId !== id);

  if (db.needs.length === initialCount) {
    return res.status(404).json({ error: "Demanda não encontrada." });
  }

  writeDB(db);
  res.json({ message: "Demanda removida com sucesso de forma lógica." });
});


// ASSIGNMENT ENDPOINTS (MATCHING LOGIC)
app.get("/api/assignments", (req, res) => {
  const db = readDB();
  
  // Hydrate assignments with volunteer name and need title for robust front-end listings
  const hydrated = db.assignments.map(a => {
    const vol = db.volunteers.find(v => v.id === a.volunteerId);
    const need = db.needs.find(n => n.id === a.needId);
    return {
      ...a,
      volunteerName: vol ? vol.name : "Desconhecido",
      needTitle: need ? need.title : "Demanda de Emergência",
      needLocation: need ? `${need.location} (${need.region})` : "Desconhecido"
    };
  });

  res.json(hydrated);
});

// Link/assign volunteer to need
app.post("/api/assignments", (req, res) => {
  const db = readDB();
  const { volunteerId, needId } = req.body;

  if (!volunteerId || !needId) {
    return res.status(400).json({ error: "ID do voluntário e ID da demanda são necessários." });
  }

  const vol = db.volunteers.find(v => v.id === volunteerId);
  const need = db.needs.find(n => n.id === needId);

  if (!vol) return res.status(404).json({ error: "Voluntário não encontrado." });
  if (!need) return res.status(404).json({ error: "Demanda não encontrada." });

  // Prevent multiple active assignments between same volunteer and need
  const exists = db.assignments.some(
    a => a.volunteerId === volunteerId && a.needId === needId && a.status === "Ativo"
  );
  if (exists) {
    return res.status(400).json({ error: "Este voluntário já está ativamente vinculado a esta demanda." });
  }

  // Create new association/assignment
  const newAssignment: Assignment = {
    id: "a_" + Date.now() + "_" + Math.random().toString(36).substr(2, 5),
    volunteerId,
    needId,
    assignedAt: new Date().toISOString(),
    status: "Ativo"
  };

  db.assignments.push(newAssignment);

  // Automatically update statuses
  vol.status = "Em Ação";
  
  if (need.status === "Pendente") {
    need.status = "Em Andamento";
  }

  writeDB(db);
  res.status(201).json(newAssignment);
});

// Update assignment status (e.g., set to completed or cancel it)
app.put("/api/assignments/:id", (req, res) => {
  const db = readDB();
  const { id } = req.params;
  const { status } = req.body; // 'Concluido' / 'Cancelado' / 'Ativo'

  if (!status || !["Ativo", "Concluido", "Cancelado"].includes(status)) {
    return res.status(400).json({ error: "Status inválido fornecido para o vínculo." });
  }

  const assignmentIndex = db.assignments.findIndex(a => a.id === id);
  if (assignmentIndex === -1) {
    return res.status(404).json({ error: "Vínculo de atividade não encontrado." });
  }

  const assignment = db.assignments[assignmentIndex];
  assignment.status = status;

  // Let's recover the volunteer to update their status back to "Ativo" if they are done
  const vol = db.volunteers.find(v => v.id === assignment.volunteerId);
  if (vol) {
    // Check if the volunteer has other active assignments
    const otherActiveList = db.assignments.filter(
      a => a.id !== id && a.volunteerId === vol.id && a.status === "Ativo"
    );
    if (otherActiveList.length === 0) {
      vol.status = "Ativo"; // Release volunteer back to active duty pool
    }
  }

  // Check if we should update the need status
  const need = db.needs.find(n => n.id === assignment.needId);
  if (need && status === "Concluido") {
    // Let's see if there are other volunteers assigned to the same need
    const activeAssignmentsOnNeed = db.assignments.filter(
      a => a.needId === need.id && a.status === "Ativo"
    );
    // If no active ones and we finished this one, maybe we prompt completion or mark as completed
    // Let's leave it to user, or update status:
    // If the helper marked it completed, they can explicitly modify the need. Let's make it easy.
  }

  writeDB(db);
  res.json(assignment);
});

// DELETE a link/assignment entirely
app.delete("/api/assignments/:id", (req, res) => {
  const db = readDB();
  const { id } = req.params;
  const assignment = db.assignments.find(a => a.id === id);
  
  if (!assignment) {
    return res.status(404).json({ error: "Vínculo de voluntariado não cadastrado." });
  }

  const volId = assignment.volunteerId;
  db.assignments = db.assignments.filter(a => a.id !== id);

  // Free volunteer if no other active ones
  const vol = db.volunteers.find(v => v.id === volId);
  if (vol) {
    const hasOtherActive = db.assignments.some(a => a.volunteerId === volId && a.status === "Ativo");
    if (!hasOtherActive) {
      vol.status = "Ativo";
    }
  }

  writeDB(db);
  res.json({ message: "Vínculo cancelado e removido do sistema." });
});


// SUMMARY ANALYTICS / STATS ENDPOINT
app.get("/api/stats", (req, res) => {
  const db = readDB();
  
  const totalVolunteers = db.volunteers.length;
  const activeVolunteers = db.volunteers.filter(v => v.status === "Em Ação" || v.status === "Ativo").length;
  const totalNeeds = db.needs.length;
  const pendingNeeds = db.needs.filter(n => n.status === "Pendente").length;
  const inProgressNeeds = db.needs.filter(n => n.status === "Em Andamento").length;
  const completedNeeds = db.needs.filter(n => n.status === "Concluido").length;
  const urgentNeedsCount = db.needs.filter(n => n.urgency === "Alta" && n.status !== "Concluido").length;

  const volunteersBySkill: Record<string, number> = {};
  db.volunteers.forEach(v => {
    v.skills.forEach(skill => {
      volunteersBySkill[skill] = (volunteersBySkill[skill] || 0) + 1;
    });
  });

  const needsByRegion: Record<string, number> = {};
  db.needs.forEach(n => {
    needsByRegion[n.region] = (needsByRegion[n.region] || 0) + 1;
  });

  const stats: DashboardStats = {
    totalVolunteers,
    activeVolunteers,
    totalNeeds,
    pendingNeeds,
    inProgressNeeds,
    completedNeeds,
    urgentNeedsCount,
    volunteersBySkill,
    needsByRegion
  };

  res.json(stats);
});


// Vite middleware integration for Single Page App serving
async function startServer() {
  // Mount Vite middleware in development
  if (process.env.NODE_ENV !== "production") {
    console.log("Servidor carregando modo DESENVOLVIMENTO (Vite middleware)...");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
  } else {
    console.log("Servidor carregando modo PRODUÇÃO...");
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Porta de execução: ${PORT}`);
    console.log(`Sistema de Monitoramento e Distribuição ativo em http://localhost:${PORT}`);
  });
}

startServer().catch((error) => {
  console.error("Falha ao iniciar o servidor express do applet:", error);
});
