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

- **`ScreenCapture`**: Handles @nut-tree-fork/nut-js screen grabbing with configurable regions
- **`OCRService`**: Processes images via Tesseract.js (currently simulated) to extract monument data
- **`OpportunityDetector`**: Analyzes monument places for profitable investments using configurable thresholds
- **`AutomationService`**: Provides human-like mouse movements and interactions using Bézier curves
- **`Logger`**: Centralized colored logging with timestamps and severity levels

## Critical Development Workflows

### Testing Commands (Non-obvious from package.json inspection)

```bash
# Main execution with different modes
npm run dev                    # Full pipeline test
npm run dev -- capture       # Screen capture only
npm run dev -- ocr           # OCR analysis only
npx ts-node src/example.ts    # Detailed usage example
npx ts-node src/test.ts       # Modular testing
```

### Configuration Calibration Workflow

1. Modify `src/config/config.ts` → `capture.monumentRegion` coordinates
2. Test with `npm run dev -- capture`
3. Check `captures/` directory for debug images
4. Adjust OCR regex patterns in `parseMonumentText()` method

## Project-Specific Conventions

### Error Handling Pattern

All services use try-catch with Logger.error() and rethrow. No silent failures.

### Type Safety Approach

- All game data modeled as interfaces in `src/types/`
- `MonumentPlace` → `MonumentData` → `Opportunity` data transformation pipeline
- Configuration objects use merged defaults pattern: `{...defaultConfig, ...userConfig}`

### Human-Like Automation Pattern

```typescript
// All automation uses randomized delays and Bézier curves
await this.randomDelay(min, max);
await this.moveMouseHumanlike(x, y); // Uses easeInOutCubic
```

### Logging Convention

Extensive emoji-prefixed logging for user experience:

- 🚀 Process start, 📸 Capture, 🧠 OCR, 💰 Opportunities, ❌ Errors

## Integration Points & Dependencies

### External Service Integration

- **@nut-tree-fork/nut-js**: Screen capture and mouse automation (note: fork version, not original)
- **tesseract.js**: OCR processing (currently simulated in code)

### Cross-Component Communication

- **Config loading**: `loadConfig()` function provides centralized configuration
- **Image passing**: Services pass `Image` objects (not Buffers) between screen capture → OCR
- **Error propagation**: All async methods propagate errors to main execution loop

## Known Implementation Gaps (Reference TODO.md)

- OCR service currently uses simulated data, not real Tesseract.js processing
- Screen coordinates need manual calibration per game/resolution
- Image saving in `saveCapture()` is stubbed out
- Navigation sequences in `AutomationService` are placeholder implementations

## Development Debugging

- Check `captures/` directory for debug images when `config.debug.saveCaptures = true`
- Use Logger debug level for detailed execution flow
- Test components individually via `src/test.ts` commands before full pipeline

## File Structure Context

- Entry points: `src/index.ts` (main), `src/example.ts` (demo), `src/test.ts` (testing)
- Business logic concentrated in `src/modules/` with clear single responsibilities
- Shared contracts in `src/types/` avoid circular dependencies
- Configuration centralized in `src/config/config.ts` with typed interfaces
