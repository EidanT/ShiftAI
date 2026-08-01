-- Migration: Create all recruitment tables matching Supabase schema
-- Run this in Supabase SQL Editor: https://supabase.com/dashboard/project/sfjoumaomfudqprnnely/sql

-- ===== DEPARTAMENTOS =====
CREATE TABLE IF NOT EXISTS departamentos (
  id SERIAL PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL UNIQUE,
  descripcion TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ===== CARGOS =====
CREATE TABLE IF NOT EXISTS cargos (
  id SERIAL PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL UNIQUE,
  descripcion TEXT,
  departamento_id INTEGER REFERENCES departamentos(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ===== VACANTES =====
CREATE TABLE IF NOT EXISTS vacantes (
  id TEXT PRIMARY KEY,
  titulo VARCHAR(255) NOT NULL,
  departamento VARCHAR(100) NOT NULL,
  cargo_id INTEGER REFERENCES cargos(id),
  requisitos TEXT NOT NULL,
  responsabilidades TEXT NOT NULL,
  estado VARCHAR(50) NOT NULL DEFAULT 'Abierta',
  fecha_creacion DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ===== REQUISITO_VACANTE =====
CREATE TABLE IF NOT EXISTS requisito_vacante (
  id SERIAL PRIMARY KEY,
  vacante_id TEXT REFERENCES vacantes(id) ON DELETE CASCADE,
  requisito TEXT NOT NULL,
  es_obligatorio BOOLEAN DEFAULT TRUE,
  orden INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ===== CANDIDATOS =====
CREATE TABLE IF NOT EXISTS candidatos (
  id TEXT PRIMARY KEY,
  nombre VARCHAR(255) NOT NULL,
  correo VARCHAR(255) NOT NULL,
  telefono VARCHAR(50) NOT NULL,
  ubicacion VARCHAR(255),
  profesion VARCHAR(255) NOT NULL,
  educacion TEXT,
  experiencia TEXT NOT NULL,
  resumen_profesional TEXT,
  vacante_id TEXT REFERENCES vacantes(id),
  estado VARCHAR(50) NOT NULL DEFAULT 'En evaluacion',
  fecha_registro DATE NOT NULL DEFAULT CURRENT_DATE,
  puntuacion INTEGER,
  pdf_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ===== POSTULACIONES =====
CREATE TABLE IF NOT EXISTS postulaciones (
  id SERIAL PRIMARY KEY,
  candidato_id TEXT REFERENCES candidatos(id) ON DELETE CASCADE,
  vacante_id TEXT REFERENCES vacantes(id) ON DELETE CASCADE,
  fecha_postulacion DATE NOT NULL DEFAULT CURRENT_DATE,
  estado VARCHAR(50) NOT NULL DEFAULT 'Pendiente',
  observaciones TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(candidato_id, vacante_id)
);

-- ===== ENTREVISTAS =====
CREATE TABLE IF NOT EXISTS entrevistas (
  id TEXT PRIMARY KEY,
  candidato_id TEXT NOT NULL REFERENCES candidatos(id) ON DELETE CASCADE,
  vacante_id TEXT REFERENCES vacantes(id),
  fecha DATE NOT NULL,
  entrevistador VARCHAR(255) NOT NULL,
  observaciones TEXT,
  resultado VARCHAR(50) NOT NULL DEFAULT 'Pendiente',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
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

INSERT INTO cargos (nombre, descripcion, departamento_id) VALUES
('Analista de Recursos Humanos', 'Analisis y gestion de procesos de RRHH', (SELECT id FROM departamentos WHERE nombre = 'Gestion Humana')),
('Soporte Tecnico Junior', 'Soporte tecnico de primer nivel', (SELECT id FROM departamentos WHERE nombre = 'Tecnologia')),
('Ejecutivo de Ventas', 'Gestion de clientes y cierre de ventas', (SELECT id FROM departamentos WHERE nombre = 'Ventas')),
('Especialista en Marketing Digital', 'Gestion de campanas digitales', (SELECT id FROM departamentos WHERE nombre = 'Marketing')),
('Analista Financiero', 'Analisis financiero y contable', (SELECT id FROM departamentos WHERE nombre = 'Finanzas'))
ON CONFLICT (nombre) DO NOTHING;

INSERT INTO vacantes (id, titulo, departamento, cargo_id, requisitos, responsabilidades, estado, fecha_creacion) VALUES
('VAC-101', 'Analista de Recursos Humanos', 'Gestion Humana', (SELECT id FROM cargos WHERE nombre = 'Analista de Recursos Humanos'), 'Licenciatura en Psicologia, 2 anos de experiencia, manejo de entrevistas.', 'Publicar vacantes, filtrar candidatos y coordinar entrevistas.', 'Abierta', '2026-05-12'),
('VAC-102', 'Soporte Tecnico Junior', 'Tecnologia', (SELECT id FROM cargos WHERE nombre = 'Soporte Tecnico Junior'), 'Conocimientos basicos de redes, soporte a usuarios y documentacion.', 'Atender tickets, registrar incidencias y escalar casos tecnicos.', 'En evaluacion', '2026-05-20')
ON CONFLICT (id) DO NOTHING;

INSERT INTO requisito_vacante (vacante_id, requisito, es_obligatorio, orden) VALUES
('VAC-101', 'Licenciatura en Psicologia', TRUE, 1),
('VAC-101', '2 anos de experiencia en seleccion', TRUE, 2),
('VAC-101', 'Manejo de entrevistas por competencias', TRUE, 3),
('VAC-102', 'Conocimientos basicos de redes', TRUE, 1),
('VAC-102', 'Experiencia en soporte a usuarios', TRUE, 2),
('VAC-102', 'Documentacion tecnica', FALSE, 3)
ON CONFLICT DO NOTHING;

INSERT INTO candidatos (id, nombre, correo, telefono, ubicacion, profesion, educacion, experiencia, resumen_profesional, vacante_id, estado, fecha_registro, puntuacion, pdf_url) VALUES
('CAN-001', 'Laura Mendez', 'laura.mendez@email.com', '809-555-0101', 'Santo Domingo', 'Psicologa Organizacional', 'Licenciatura en Psicologia', '3 anos en seleccion de personal', 'Especialista en procesos de reclutamiento y entrevistas por competencias.', 'VAC-101', 'En evaluacion', '2026-06-02', NULL, NULL),
('CAN-002', 'Carlos Rivera', 'carlos.rivera@email.com', '809-555-0102', 'Santiago', 'Tecnico en Soporte', 'Tecnico en Redes y Telecomunicaciones', '1 ano en soporte tecnico a usuarios', 'Buen manejo de tickets y resolucion de incidencias de primer nivel.', 'VAC-102', 'Aprobado', '2026-06-05', 85, NULL),
('CAN-003', 'Ana Torres', 'ana.torres@email.com', '809-555-0103', 'Santo Domingo', 'Analista de Recursos Humanos', 'Licenciatura en Administracion de Empresas', '4 anos en gestion de talento humano', 'Experiencia liderando procesos de contratacion end-to-end.', 'VAC-101', 'Contratado', '2026-05-28', 92, NULL)
ON CONFLICT (id) DO NOTHING;

INSERT INTO postulaciones (candidato_id, vacante_id, fecha_postulacion, estado) VALUES
('CAN-001', 'VAC-101', '2026-06-02', 'En revision'),
('CAN-002', 'VAC-102', '2026-06-05', 'Aprobada'),
('CAN-003', 'VAC-101', '2026-05-28', 'Contratado')
ON CONFLICT (candidato_id, vacante_id) DO NOTHING;

INSERT INTO entrevistas (id, candidato_id, vacante_id, fecha, entrevistador, observaciones, resultado) VALUES
('ENT-001', 'CAN-002', 'VAC-102', '2026-06-10', 'Laura Mendoza', 'Buen dominio tecnico, se aprueba para siguiente fase.', 'Aprobado'),
('ENT-002', 'CAN-003', 'VAC-101', '2026-06-08', 'Laura Mendoza', 'Seleccionada para contratacion inmediata.', 'Aprobado')
ON CONFLICT (id) DO NOTHING;

-- ===== VERIFY =====
SELECT 'vacantes' as table_name, count(*) as rows FROM vacantes
UNION ALL SELECT 'candidatos', count(*) FROM candidatos
UNION ALL SELECT 'entrevistas', count(*) FROM entrevistas
UNION ALL SELECT 'departamentos', count(*) FROM departamentos
UNION ALL SELECT 'cargos', count(*) FROM cargos
UNION ALL SELECT 'postulaciones', count(*) FROM postulaciones
UNION ALL SELECT 'requisito_vacante', count(*) FROM requisito_vacante;