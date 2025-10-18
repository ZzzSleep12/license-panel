export default function Home() {
  return (
    <main style={{ padding: 24 }}>
      <h2>Panel de licencias</h2>
      <p>
        <a href="/login">Entrar</a> para administrar. El endpoint público será <code>/api/validate</code>.
      </p>
      <p>
        Ir al <a href="/admin">dashboard</a>.
      </p>
    </main>
  );
}
