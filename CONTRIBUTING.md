# Contributing to FuelFlow

Thank you for your interest in contributing to FuelFlow!

We are committed to building the premium, most intuitive remote operations and analytics control plane for fuel station networks.

## Style Guide
- **TypeScript**: Always write structured, typed interfaces. Prefer explicit type annotations for parameters and return types.
- **Tailwind CSS**: Keep all styles inline using responsive prefixes (`sm:`, `md:`, `lg:`). Avoid writing standalone `.css` files.
- **MVC Architecture**: Route server requests clearly through JSON body responses. Log audits for all state transitions.

## Testing Your Changes
Before submitting a pull request, run local validations:
1. Validate syntax and compilation cleanly:
   ```bash
   npm run lint
   ```
2. Build the workspace to verify Vercel and standalone Node compliance:
   ```bash
   npm run build
   ```
