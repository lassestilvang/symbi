#!/bin/bash

# Fix remaining unused variables
sed -i '' 's/const animations = /const _animations = /g' src/components/__tests__/SymbiAnimation.test.tsx
sed -i '' 's/(password: string)/(\_password: string)/g' src/services/AuthService.ts
sed -i '' 's/(goals: string\[\])/(\_goals: string\[\])/g' src/services/DailyAIAnalysisService.ts
sed -i '' 's/(hint: string)/(\_hint: string)/g' src/services/ErrorReportingService.ts
sed -i '' 's/(permissions: HealthPermissions)/(\_permissions: HealthPermissions)/g' src/services/GoogleFitService.ts
sed -i '' 's/(callback: any)/(\_callback: any)/g' src/services/GoogleFitService.ts
sed -i '' 's/import { EmotionalState } from/\/\/ import { EmotionalState } from/g' src/services/HealthDataUpdateService.ts
sed -i '' 's/(error) =>/(\_error) =>/g' src/services/HealthKitService.ts
sed -i '' 's/(permissions: HealthPermissions)/(\_permissions: HealthPermissions)/g' src/services/ManualHealthDataService.ts
sed -i '' 's/import { AuthStatus } from/\/\/ import { AuthStatus } from/g' src/services/__tests__/HealthDataService.test.ts
sed -i '' 's/(get: () =>/(\_get: () =>/g' src/stores/healthDataStore.ts

echo "Fixed remaining unused variables"
