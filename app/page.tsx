export default function Home() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-3xl items-center px-6 py-24">
      <section className="space-y-4">
        <p className="text-sm uppercase tracking-[0.2em] text-stone-500">
          Soyang Blog
        </p>
        <h1 className="text-4xl font-semibold tracking-tight text-stone-900 sm:text-5xl">
          Next.js 14 blog scaffold
        </h1>
        <p className="max-w-2xl text-base leading-7 text-stone-600">
          T01 initializes the application shell. Content modules and admin
          features will be added in subsequent tasks.
        </p>
      </section>
    </main>
  );
}
