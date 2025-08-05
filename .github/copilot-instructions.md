# Silent Forge - AI Coding Assistant Instructions

## Project Overview

**Silent Forge** is a TypeScript automation tool for analyzing gaming opportunities through screen capture, OCR, and automated detection. It's designed to discreetly scan "Grand Monuments" in games to identify profitable investment opportunities (sniping).

## Architecture Pattern: Service-Oriented Modules

### Core Data Flow

```
ScreenCapture → OCRService → OpportunityDetector → Logger/Results
       ↑                                               ↓
AutomationService ←── Config ←── Types ←── Utils
```

### Key Service Boundaries

- **`GameNavigationService`**: Main orchestrator handling player workflows, OCR extraction, and filtering
- **`ScreenCapture`**: Handles @nut-tree-fork/nut-js screen grabbing with configurable regions
- **`OCRService`**: Processes images via Tesseract.js to extract monument and investment data
- **`OpportunityDetector`**: Analyzes monument places for profitable investments using configurable thresholds
- **`AutomationService`**: Provides human-like mouse movements and interactions using Bézier curves
- **`Logger`**: Centralized colored logging with timestamps and severity levels

## Critical Development Workflows

### Testing Commands (Non-obvious from package.json inspection)

```bash
# Main execution with different modes
npm run dev                           # Full pipeline test
npm run dev -- capture              # Screen capture only
npm run dev -- ocr                  # OCR analysis only
npx ts-node src/example.ts           # Detailed usage example
npx ts-node src/test.ts              # Modular testing

# Specialized test files (recent additions)
npx ts-node src/test-implementation.ts     # Test new player filtering & OCR features
npx ts-node src/test-horizontal-names.ts   # Test horizontal name extraction layout
npx ts-node src/test-monument-filtering.ts # Test monument investment filtering
npx ts-node src/test-natural-clicks.ts     # Test human-like click patterns
```

### Configuration Calibration Workflow

1. Modify `src/config/config.ts` → coordinate regions for UI elements
2. Test with `npm run dev -- capture`
3. Check `captures/` directory for debug images
4. Adjust OCR regions in `players.nameExtractionRegion` and `monument.rewardIcons`
5. Use `test-horizontal-names.ts` to validate player name extraction positioning

## Project-Specific Conventions

### Player Processing Pattern (Recently Extended)

The system now supports both sequential and targeted player processing:

```typescript
// Sequential processing with OCR name extraction
await this.processPlayersOnCurrentPage(); // Processes 5 players per page
// Uses extractPlayerNameAtPosition() with horizontal spacing
// Applies excludeList filtering via isPlayerExcluded()
```

### Enhanced Data Model Pattern

Recent updates added rich investment and reward data:

```typescript
// Monument data now includes detailed investment tracking
interface MonumentData {
  investmentData?: MonumentInvestmentData; // Owner + player investments
  places: MonumentPlace[]; // Each place can have rewards: RewardItem[]
}

// Reward extraction via mouse hover workflow
await this.extractRewardsForPlace(position); // Hover → Capture → OCR → Parse
```

### Configuration Coordinate System

Two-tiered coordinate system for UI elements:

```typescript
// Player layout (horizontal card arrangement)
players.cardLayout: { startX, startY, spacing, monumentsButtonOffset }
players.nameExtractionRegion: { x, y, horizontalSpacing } // Note: horizontal, not vertical

// Monument interface (vertical icon alignment)
monument.rewardIcons: { baseX, baseY, verticalSpacing }
monument.tooltipRegion: { x, y, width, height }
```

### Error Handling Pattern

All services use try-catch with Logger.error() and rethrow. Recent additions include graceful degradation:

- OCR extraction failures → skip to next player
- Reward extraction failures → continue with empty rewards array
- Player filtering → log exclusions but continue processing

**CRITICAL OCR FIX**: Always pass file paths (string) to Tesseract.js instead of image objects to avoid "truncated file" errors. Save captures first, then use the file path for OCR processing.

### Logging Convention

Extensive emoji-prefixed logging for user experience:

- 🚀 Process start, 📸 Capture, 🧠 OCR, 💰 Opportunities, ❌ Errors
- 👤 Player processing, 🏛️ Monument analysis, 🎁 Reward extraction

## Integration Points & Dependencies

### External Service Integration

- **@nut-tree-fork/nut-js**: Screen capture and mouse automation (note: fork version, not original)
- **tesseract.js**: OCR processing with French+English language support

### Cross-Component Communication

- **Config loading**: `loadConfig()` function provides centralized configuration
- **Image passing**: Services pass `Image` objects (not Buffers) between screen capture → OCR
- **Error propagation**: All async methods propagate errors to main execution loop
- **Mouse automation**: Extended with `moveMouseToPosition()`, `moveMouseAway()`, `getMousePosition()`

## Recent Implementation Updates (Reference IMPLEMENTATION_GUIDE.md)

- **Player identification**: OCR-based name extraction with horizontal layout support
- **Blacklist filtering**: `players.excludeList` for excluding specific players
- **Investment analysis**: Extract owner + player investment data from monuments
- **Reward extraction**: Automated hover → tooltip capture → OCR parsing workflow
- **Enhanced monument data**: Full investment tracking with `MonumentInvestmentData`

## Development Debugging

- Check `captures/` directory for debug images when `config.debug.saveCaptures = true`
- Use specialized test files: `test-implementation.ts`, `test-horizontal-names.ts` for validation
- Logger debug level for detailed execution flow
- Test components individually before full pipeline

## File Structure Context

- Entry points: `src/index.ts` (main), `src/example.ts` (demo), `src/test*.ts` (specialized testing)
- Business logic concentrated in `src/modules/` with clear single responsibilities
- Shared contracts in `src/types/` avoid circular dependencies
- Configuration centralized in `src/config/config.ts` with typed interfaces
- Implementation guides: `IMPLEMENTATION_GUIDE.md` for recent feature documentation
