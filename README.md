# Drones-Lab-Hacking

This project compiles resources for learning drone hacking from scratch through self-study. This project is open source in terms of its knowledge base; feel free to contribute to the project from a learning perspective.

It ships as **DroneSec Lab**, an interactive web platform: a single-route Next.js SPA with a typed content engine (lessons, labs, quizzes) and a fully client-side, simulated lab terminal. Everything runs against a virtual lab network — no real targets, no outbound traffic. Educational and defensive use only.

## Structure

- `web/` — the web application (Next.js 16, React 19, TypeScript, Tailwind 4, shadcn/ui, Zustand). Run it from there:
  ```bash
  cd web
  bun install
  bun run dev   # http://localhost:3000
  ```
- Root — project meta only: this `README.md`, `CLAUDE.md` (guidance for AI agents), `worklog.md`, and `LICENSE`.

## License

[GNU AGPL-3.0](LICENSE). Copyleft: if you deploy a modified version of this platform, you must make your source available. This keeps the knowledge base and its improvements open for everyone learning from it.
