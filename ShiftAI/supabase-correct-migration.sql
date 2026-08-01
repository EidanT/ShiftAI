-- Migration: Create all recruitment tables matching ACTUAL Supabase schema
-- Run this in Supabase SQL Editor: https://supabase.com/dashboard/project/sfjoumaomfudqprnnely/sql

-- ===== DEPARTAMENTOS =====
CREATE TABLE IF NOT EXISTS departamentos (
  id SERIAL PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL UNIQUE,
  descripcion TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ===== CARGOS =====
CREATE TABLE IF NOT EXISTS cargos (
  id SERIAL PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL UNIQUE,
  descripcion TEXT,
  id_departamento INTEGER REFERENCES departamentos(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ===== VACANTES (matching actual schema) =====
CREATE TABLE IF NOT EXISTS vacantes (
  id_vacante TEXT PRIMARY KEY,
  titulo VARCHAR(255) NOT NULL,
  descripcion TEXT,
  id_departamento INTEGER REFERENCES departamentos(id),
  fecha_publicacion DATE NOT NULL DEFAULT CURRENT_DATE,
  estado VARCHAR(50) NOT NULL DEFAULT 'Abierta',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ===== REQUISITO_VACANTE =====
CREATE TABLE IF NOT EXISTS requisito_vacante (
  id SERIAL PRIMARY KEY,
  id_vacante TEXT REFERENCES vacantes(id_vacante) ON DELETE CASCADE,
  requisito TEXT NOT NULL,
  es_obligatorio BOOLEAN DEFAULT TRUE,
  orden INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ===== CANDIDATOS (matching actual schema) =====
CREATE TABLE IF NOT EXISTS candidatos (
  id_candidato TEXT PRIMARY KEY,
  nombre VARCHAR(255) NOT NULL,
  correo VARCHAR(255) NOT NULL,
  telefono VARCHAR(50) NOT NULL,
  ubicacion VARCHAR(255),
  profesion VARCHAR(255) NOT NULL,
  educacion TEXT,
  experiencia TEXT NOT NULL,
  resumen_profesional TEXT,
  estado VARCHAR(50) NOT NULL DEFAULT 'En evaluacion',
  fecha_registro DATE NOT NULL DEFAULT CURRENT_DATE,
  puntuacion INTEGER,
  pdf_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ===== POSTULACIONES =====
CREATE TABLE IF NOT EXISTS postulaciones (
  id SERIAL PRIMARY KEY,
  id_candidato TEXT REFERENCES candidatos(id_candidato) ON DELETE CASCADE,
  id_vacante TEXT REFERENCES vacantes(id_vacante) ON DELETE CASCADE,
  fecha_postulacion DATE NOT NULL DEFAULT CURRENT_DATE,
  estado VARCHAR(50) NOT NULL DEFAULT 'Pendiente',
  observaciones TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(id_candidato, id_vacante)
);

-- ===== ENTREVISTAS (matching actual schema) =====
CREATE TABLE IF NOT EXISTS entrevistas (
  id_entrevista TEXT PRIMARY KEY,
  id_candidato TEXT NOT NULL REFERENCES candidatos(id_candidato) ON DELETE CASCADE,
  id_vacante TEXT REFERENCES vacantes(id_vacante),
  fecha DATE NOT NULL,
  entrevistador VARCHAR(255) NOT NULL,
  observaciones TEXT,
  resultado VARCHAR(50) NOT NULL DEFAULT 'Pendiente',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ===== ENABLE RLS =====
ALTER TABLE departamentos ENABLE ROW LEVEL SECURITY;
ALTER TABLE cargos ENABLE ROW LEVEL SECURITY;
ALTER TABLE vacantes ENABLE ROW LEVEL SECURITY;
ALTER TABLE requisito_vacante ENABLE ROW LEVEL SECURITY;
ALTER TABLE candidatos ENABLE ROW LEVEL SECURITY;
ALTER TABLE postulaciones ENABLE ROW LEVEL SECURITY;
ALTER TABLE entrevistas ENABLE ROW LEVEL SECURITY;

-- ===== POLICIES (public access for development) =====
CREATE POLICY IF NOT EXISTS 'Enable all access for departamentos' ON departamentos FOR ALL USING (true);
CREATE POLICY IF NOT EXISTS 'Enable all access for cargos' ON cargos FOR ALL USING (true);
CREATE POLICY IF NOT EXISTS 'Enable all access for vacantes' ON vacantes FOR ALL USING (true);
CREATE POLICY IF NOT EXISTS 'Enable all access for requisito_vacante' ON requisito_vacante FOR ALL USING (true);
CREATE POLICY IF NOT EXISTS 'Enable all access for candidatos' ON candidatos FOR ALL USING (true);
CREATE POLICY IF NOT EXISTS 'Enable all access for postulaciones' ON postulaciones FOR ALL USING (true);
CREATE POLICY IF NOT EXISTS 'Enable all access for entrevistas' ON entrevistas FOR ALL USING (true);

-- ===== SEED DATA =====
INSERT INTO departamentos (nombre, descripcion) VALUES
('Gestion Humana', 'Departamento de Recursos Humanos'),
('Tecnologia', 'Departamento de Tecnologia e Informatica'),
('Ventas', 'Departamento Comercial y Ventas'),
('Marketing', 'Departamento de Marketing y Publicidad'),
('Finanzas', 'Departamento Financiero y Contabilidad')
ON CONFLICT (nombre) DO NOTHING;

INSERT INTO cargos (nombre, descripcion, id_departamento) VALUES
('Analista de Recursos Humanos', 'Analisis y gestion de procesos de RRHH', (SELECT id FROM departamentos WHERE nombre = 'Gestion Humana')),
('Soporte Tecnico Junior', 'Soporte tecnico de primer nivel', (SELECT id FROM departamentos WHERE nombre = 'Tecnologia')),
('Ejecutivo de Ventas', 'Gestion de clientes y cierre de ventas', (SELECT id FROM departamentos WHERE nombre = 'Ventas')),
('Especialista en Marketing Digital', 'Gestion de campanas digitales', (SELECT id FROM departamentos WHERE nombre = 'Marketing')),
('Analista Financiero', 'Analisis financiero y contable', (SELECT id FROM departamentos WHERE nombre = 'Finanzas'))
ON CONFLICT (nombre) DO NOTHING;

INSERT INTO vacantes (id_vacante, titulo, descripcion, id_departamento, fecha_publicacion, estado) VALUES
('VAC-101', 'Analista de Recursos Humanos', 'Publicar vacantes, filtrar candidatos y coordinar entrevistas. Requisitos: Licenciatura en Psicologia, 2 anos de experiencia, manejo de entrevistas.', (SELECT id FROM departamentos WHERE nombre = 'Gestion Humana'), '2026-05-12', 'Abierta'),
('VAC-102', 'Soporte Tecnico Junior', 'Atender tickets, registrar incidencias y escalar casos tecnicos. Requisitos: Conocimientos basicos de redes, soporte a usuarios y documentacion.', (SELECT id FROM departamentos WHERE nombre = 'Tecnologia'), '2026-05-20', 'En evaluacion')
ON CONFLICT (id_vacante) DO NOTHING;

INSERT INTO requisito_vacante (id_vacante, requisito, es_obligatorio, orden) VALUES
('VAC-101', 'Licenciatura en Psicologia', TRUE, 1),
('VAC-101', '2 anos de experiencia en seleccion', TRUE, 2),
('VAC-101', 'Manejo de entrevistas por competencias', TRUE, 3),
('VAC-102', 'Conocimientos basicos de redes', TRUE, 1),
('VAC-102', 'Experiencia en soporte a usuarios', TRUE, 2),
('VAC-102', 'Documentacion tecnica', FALSE, 3)
ON CONFLICT DO NOTHING;

INSERT INTO candidatos (id_candidato, nombre, correo, telefono, ubicacion, profesion, educacion, experiencia, resumen_profesional, estado, fecha_registro, puntuacion, pdf_url) VALUES
('CAN-001', 'Laura Mendez', 'laura.mendez@email.com', '809-555-0101', 'Santo Domingo', 'Psicologa Organizacional', 'Licenciatura en Psicologia', '3 anos en seleccion de personal', 'Especialista en procesos de reclutamiento y entrevistas por competencias.', 'En evaluacion', '2026-06-02', NULL, NULL),
('CAN-002', 'Carlos Rivera', 'carlos.rivera@email.com', '809-555-0102', 'Santiago', 'Tecnico en Soporte', 'Tecnico en Redes y Telecomunicaciones', '1 ano en soporte tecnico a usuarios', 'Buen manejo de tickets y resolucion de incidencias de primer nivel.', 'Aprobado', '2026-06-05', 85, NULL),
('CAN-003', 'Ana Torres', 'ana.torres@email.com', '809-555-0103', 'Santo Domingo', 'Analista de Recursos Humanos', 'Licenciatura en Administracion de Empresas', '4 anos en gestion de talento humano', 'Experiencia liderando procesos de contratacion end-to-end.', 'Contratado', '2026-05-28', 92, NULL)
ON CONFLICT (id_candidato) DO NOTHING;

INSERT INTO postulaciones (id_candidato, id_vacante, fecha_postulacion, estado) VALUES
('CAN-001', 'VAC-101', '2026-06-02', 'En revision'),
('CAN-002', 'VAC-102', '2026-06-05', 'Aprobada'),
('CAN-003', 'VAC-101', '2026-05-28', 'Contratado')
ON CONFLICT (id_candidato, id_vacante) DO NOTHING;

INSERT INTO entrevistas (id_entrevista, id_candidato, id_vacante, fecha, entrevistador, observaciones, resultado) VALUES
('ENT-001', 'CAN-002', 'VAC-102', '2026-06-10', 'Laura Mendoza', 'Buen dominio tecnico, se aprueba para siguiente fase.', 'Aprobado'),
('ENT-002', 'CAN-003', 'VAC-101', '2026-06-08', 'Laura Mendoza', 'Seleccionada para contratacion inmediata.', 'Aprobado')
ON CONFLICT (id_entrevista) DO NOTHING;

-- ===== VERIFY =====
SELECT 'vacantes' as table_name, count(*) as rows FROM vacantes
UNION ALL SELECT 'candidatos', count(*) FROM candidatos
UNION ALL SELECT 'entrevistas', count(*) FROM entrevistas
UNION ALL SELECT 'departamentos', count(*) FROM departamentos
UNION ALL SELECT 'cargos', count(*) FROM cargos
UNION ALL SELECT 'postulaciones', count(*) FROM postulaciones
UNION ALL SELECT 'requisito_vacante', count(*) FROM requisito_vacante;