function RegisterVacancy() {
    return (
        <main className="app-shell">
            <section className="module-page">
                <header className="module-header">
                    <div>
                        <p className="eyebrow">Modulo 1</p>
                        <h1>Registro de Nueva Vacante</h1>
                    </div>
                </header>

                <section className="panel">
                    <h2>Nueva Vacante</h2>

                    <form className="candidate-form">
                        <label>
                            Nombre de la vacante
                            <input type="text" />
                        </label>

                        <label>
                            Area
                            <input type="text" />
                        </label>

                        <label>
                            Requisitos
                            <textarea />
                        </label>

                        <label>
                            Responsabilidades
                            <textarea />
                        </label>

                        <button type="button" className="primary-button">
                            Guardar Vacante
                        </button>
                    </form>
                </section>
            </section>
        </main>
    );
}

export default RegisterVacancy;