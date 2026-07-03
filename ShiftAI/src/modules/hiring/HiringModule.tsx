// #Datos estaticos simulando vacantes y datos de personas en proceso de reclutamiento

const vacancies = [
  {
    title: 'Analista de Recursos Humanos',
    area: 'Gestion Humana',
    status: 'Abierta',
    requirements: 'Licenciatura en Psicologia, 2 anos de experiencia, manejo de entrevistas.',
    responsibilities: 'Publicar vacantes, filtrar candidatos y coordinar entrevistas.',
  },
  {
    title: 'Soporte Tecnico Junior',
    area: 'Tecnologia',
    status: 'En evaluacion',
    requirements: 'Conocimientos basicos de redes, soporte a usuarios y documentacion.',
    responsibilities: 'Atender tickets, registrar incidencias y escalar casos tecnicos.',
  },
]

const candidates = [
  {
    name: 'Laura Mendez',
    vacancy: 'Analista de Recursos Humanos',
    experience: '3 anos',
    status: 'En evaluacion',
    result: 'Pendiente',
  },
  {
    name: 'Carlos Rivera',
    vacancy: 'Soporte Tecnico Junior',
    experience: '1 ano',
    status: 'Aprobado',
    result: 'Entrevista tecnica aprobada',
  },
  {
    name: 'Ana Torres',
    vacancy: 'Analista de Recursos Humanos',
    experience: '4 anos',
    status: 'Contratado',
    result: 'Seleccionada para contratacion',
  },
]

const statuses = ['En evaluacion', 'Aprobado', 'Rechazado', 'Contratado']


// #Modulo de contratacion (HiringModule), Tiene Index principal y una vista preliminar de lo que sera el modulo 1 
//funcional, desde el registro de vacantes hasta la seleccion del candidato.

import { useNavigate } from "react-router-dom";

function HiringModule() {
  const navigate = useNavigate();
  return (
    <main className="app-shell">
      <aside className="sidebar" aria-label="Modulos principales">
        <div className="brand">
          <span className="brand-mark">S</span>
          <div>
            <strong>ShiftAI</strong>
          </div>
        </div>

              <nav className="module-nav">
                  <a className="active" href="#reclutamiento">
                      Reclutamiento
                  </a>
              </nav>
      </aside>

      <section className="module-page" id="reclutamiento">
        <header className="module-header">
          <div>
            <p className="eyebrow">Modulo 1</p>
            <h1>Reclutamiento y Seleccion de Personal</h1>
            <p>
              Pantalla principal para registrar vacantes, candidatos, entrevistas
              y el estado de cada candidatura.
            </p>
          </div>
                  <button
                      type="button"
                      className="vacante"
                      onClick={() => navigate("/register-vacancy")}
                  >
                      Nueva vacante
                  </button>
        </header>

        <section className="summary-grid" aria-label="Resumen del modulo">
          <article>
            <span>Vacantes</span>
            <strong>2</strong>
            <p>Registradas para seleccion</p>
          </article>
          <article>
            <span>Candidatos</span>
            <strong>3</strong>
            <p>Con informacion personal y profesional</p>
          </article>
          <article>
            <span>Entrevistas</span>
            <strong>2</strong>
            <p>Con observaciones y resultados</p>
          </article>
          <article>
            <span>Contratados</span>
            <strong>1</strong>
            <p>Listos para pasar a empleados</p>
          </article>
        </section>

        <div className="content-grid">
          <section className="panel">
            <div className="panel-header">
              <div>
                <h2>Vacantes laborales</h2>
                <p>Requisitos y responsabilidades definidos para cada posicion.</p>
              </div>
              <button type="button" className="secondary-button">
                Registrar
              </button>
            </div>

            <div className="vacancy-list">
              {vacancies.map((vacancy) => (
                <article className="vacancy-card" key={vacancy.title}>
                  <div className="row-between">
                    <div>
                      <h3>{vacancy.title}</h3>
                      <span>{vacancy.area}</span>
                    </div>
                    <span className="badge">{vacancy.status}</span>
                  </div>
                  <p>
                    <strong>Requisitos:</strong> {vacancy.requirements}
                  </p>
                  <p>
                    <strong>Responsabilidades:</strong> {vacancy.responsibilities}
                  </p>
                </article>
              ))}
            </div>
          </section>

          <section className="panel">
            <div className="panel-header">
              <div>
                <h2>Registro de candidato</h2>
                <p>Formulario visual preparado para conectar con base de datos.</p>
              </div>
                      </div>



            {/* TODO el modulo reclutamiento:
              Conectar estos campos con el servicio/API de candidatos.
              Validar datos personales, datos profesionales y vacante seleccionada.
            */}
            <form className="candidate-form">
              <label>
                Nombre completo
                <input type="text" placeholder="Ej. Maria Perez" />
              </label>
              <label>
                Vacante
                <select defaultValue="">
                  <option value="" disabled>
                    Seleccionar vacante
                  </option>
                  {vacancies.map((vacancy) => (
                    <option key={vacancy.title}>{vacancy.title}</option>
                  ))}
                </select>
              </label>
              <label>
                Experiencia profesional
                <input type="text" placeholder="Ej. 2 anos en servicio al cliente" />
              </label>
              <label>
                Observaciones de entrevista
                <textarea placeholder="Resultado, comentarios y siguientes pasos" />
              </label>
              <button type="button" className="primary-button full-width">
                Guardar candidato
              </button>
            </form>
          </section>
        </div>

        <section className="panel">
          <div className="panel-header">
            <div>
              <h2>Candidatos registrados</h2>
              <p>Listado para consultar, actualizar y seleccionar candidatos.</p>
            </div>
            <button type="button" className="secondary-button">
              Actualizar datos
            </button>
          </div>

          {/* TODO el modulo de reclutamiento:
            Reemplazar estos datos estaticos por informacion real desde la base de datos.
            Aqui tambien se puede agregar paginacion, filtros y acciones de edicion.
          */}
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Candidato</th>
                  <th>Vacante</th>
                  <th>Experiencia</th>
                  <th>Estado</th>
                  <th>Resultado entrevista</th>
                  <th>Accion</th>
                </tr>
              </thead>
              <tbody>
                {candidates.map((candidate) => (
                  <tr key={candidate.name}>
                    <td>{candidate.name}</td>
                    <td>{candidate.vacancy}</td>
                    <td>{candidate.experience}</td>
                    <td>
                      <select defaultValue={candidate.status} aria-label={`Estado de ${candidate.name}`}>
                        {statuses.map((status) => (
                          <option key={status}>{status}</option>
                        ))}
                      </select>
                    </td>
                    <td>{candidate.result}</td>
                    <td>
                      <button type="button" className="link-button">
                        Seleccionar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="handoff-space" id="proximo-modulo">
          <h2>Espacio para el siguiente modulo</h2>
          <p>
            Esta seccion queda libre para que otro desarrollador agregue el
            proximo modulo sin modificar la estructura actual.
                  </p>


          {/* TODO listo para wl siguiente modulo:
            Crear una carpeta nueva dentro de src/modules.
            Mantener componentes, estilos y datos de prueba separados por modulo.
          */}
        </section>
      </section>
    </main>
  )
}

export default HiringModule
