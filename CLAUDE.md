# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Silent Forge is a TypeScript automation tool that analyzes investment opportunities in game monuments (Forge of Empires "Great Buildings"). It uses screen capture, OCR, and human-like mouse/keyboard automation to identify and execute profitable investments.

## Commands

```bash
bun install          # Install dependencies
bun run dev          # Run main workflow (bun src/main.ts)
bun run build        # Compile TypeScript (tsc → dist/)
bun test             # Run all tests (Bun native test runner)
bun test src/modules/__tests__/opportunity-detector.test.ts  # Run single test file
bun run lint         # ESLint
bun run format       # Prettier
bun run calibrate    # Interactive UI coordinate calibration
```

## Architecture

**Facade pattern**: `GameNavigationService` orchestrates the entire workflow by composing three services:
- `PlayerNavigationService` — player list navigation, pagination, OCR name extraction, exclusion filtering
- `MonumentProcessingService` — opens monuments, identifies investment targets
- `RewardExtractionService` — extracts rewards via tooltip analysis

**Processing pipeline**:
```
ScreenCapture → OCREngine → MonumentOCRParser → OpportunityDetector → AutomationService
                          → PlayerNameExtractor
                          → OCREnhancementService (name correction DB)
```

**Key modules** in `src/modules/`:
- `screen-capture.ts` — @nut-tree-fork/nut-js wrapper for screenshots
- `ocr-engine.ts` — Tesseract.js wrapper (direct + worker modes)
- `automation-service.ts` — human-like mouse control (Bézier curves, random delays, Gaussian click distribution)
- `opportunity-detector.ts` — profitability analysis (minProfit + minProfitability thresholds)

**Configuration**: `src/config/config.ts` — centralized config for UI coordinates, OCR params, investment thresholds, automation delays. Must be calibrated per screen setup.

**Types**: `src/types/index.ts` — all shared interfaces (MonumentPlace, Opportunity, PlayerInvestment, etc.)

## Conventions

- **Runtime**: Bun for development (`bun src/main.ts`), Node.js for production (`node dist/main.js`)
- **Tests**: Bun native test runner (`bun:test`). Tests live in `__tests__/` directories next to source files. Use factory functions for test data.
- **Language**: Code identifiers in English, comments and logs in French
- **Logging**: Use `logger` from `src/utils/logger.ts` (info/success/warn/error/debug with timestamps and colors)
- **Style**: Strict TypeScript, single quotes, 2-space indent, trailing commas (ES5), semicolons, 80 char width

## Coding Guidelines

Detailed instructions are in `docs/agents/`:
- `clean-code.instructions.md` — max 30 lines/function, max 300 lines/file, no comments, no magic numbers, DRY, fail fast
- `typescript.instructions.md` — strict types, no `any`/`unknown`, use `interface` for objects, `type` for unions, catch errors as `unknown | Error`
- `naming-conventions.instructions.md` — descriptive names, verbs for actions, `is`/`has`/`should` for booleans, UPPER_SNAKE_CASE for constants
- `typescript-naming-conventions.instructions.md` — PascalCase for classes/interfaces, camelCase for functions
- `copilot-instructions.md` — project-specific context, OCR tips (always pass file paths to Tesseract.js, not image objects)

## CLI Modes (src/main.ts)

- `sequential` (default) — processes players by position without OCR names
- `scan` — auto-scan with OCR player name extraction
- `players [name1] [name2]...` — process specific players
- `test [playerName]` — single player test
- `calibration` — coordinate calibration mode
