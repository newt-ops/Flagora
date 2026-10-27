# Contributing to Flagora

Thank you for your interest in contributing to Flagora! We welcome contributions, bug reports, and suggestions.

---

## Code of Conduct

Please help maintain a respectful, inclusive, and professional environment for everyone participating in this project.

---

## Development Setup

1. **Prerequisites**: Ensure you have **Node.js 20+** and **pnpm 10+** installed.
2. **Clone & Install**:
   ```bash
   git clone https://github.com/newt-ops/Flagora.git
   cd flagora
   pnpm install
   ```
3. **Run Locally**:
   ```bash
   pnpm dev
   ```
4. **Browser Testing**: Test the web Mini App in your browser by visiting `http://localhost:5173/?browser=true`.

---

## Coding Guidelines

To maintain architectural integrity and consistent user experience, please follow these conventions:

- **Monorepo Structure**: Keep frontend components in `apps/web`, backend services in `apps/server`, and shared interfaces in `packages/shared`.
- **TypeScript**: Write clean, strongly-typed code without `any`. Ensure `pnpm build` compiles cleanly.
- **Telegram Mini App Guidelines**:
  - Use Telegram CSS theme variables (`bg-tg-bg`, `text-tg-text`, `bg-tg-button`, etc.) for seamless native theming.
  - Sourced icons must come from the `@hugeicons` stroke-rounded library via `src/components/icons.tsx`.
- **Self-Documenting Code**: Keep code clean, readable, modular, and self-documenting.

---

## Pull Request Process

1. Fork the repository and create your branch from `main`:
   ```bash
   git checkout -b feature/your-feature-name
   ```
2. Make your modifications.
3. Verify formatting and linting:
   ```bash
   pnpm format
   pnpm lint
   ```
4. Ensure all automated tests pass:
   ```bash
   pnpm test
   ```
5. Commit your changes using conventional commit messages:
   ```bash
   git commit -m "feat(module): add concise description of feature"
   ```
6. Push to your fork and submit a Pull Request against `main`.

---

## Reporting Issues

If you find a bug or have a feature request:

- Check existing issues to avoid duplicates.
- Provide a clear title, reproduction steps, expected vs. actual behavior, and relevant device or Telegram client details.
