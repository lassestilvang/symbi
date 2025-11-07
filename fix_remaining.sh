#!/bin/bash

# Fix unused imports by removing or prefixing with underscore
sed -i '' 's/import { Platform } from/\/\/ import { Platform } from/g' src/services/DailyAIAnalysisService.ts
sed -i '' 's/import { Platform } from/\/\/ import { Platform } from/g' src/services/EncryptionService.ts
sed -i '' 's/import { Platform } from/\/\/ import { Platform } from/g' src/services/ErrorReportingService.ts
sed -i '' 's/import { Platform } from/\/\/ import { Platform } from/g' src/services/PerformanceMonitor.ts

# Fix unused variables in function parameters
sed -i '' 's/(password: string)/(\_password: string)/g' src/services/AuthService.ts
sed -i '' 's/(goals: string\[\])/(\_goals: string\[\])/g' src/services/DailyAIAnalysisService.ts
sed -i '' 's/(hint: string)/(\_hint: string)/g' src/services/ErrorReportingService.ts
sed -i '' 's/(url: string)/(\_url: string)/g' src/services/SecureAPIService.ts
sed -i '' 's/(get: () =>/(\_get: () =>/g' src/stores/healthDataStore.ts

# Fix unused imports in tests
sed -i '' 's/import { AuthStatus } from/\/\/ import { AuthStatus } from/g' src/services/__tests__/HealthDataService.test.ts
sed -i '' 's/import { HealthDataType } from/\/\/ import { HealthDataType } from/g' src/services/__tests__/HealthDataService.test.ts
sed -i '' 's/import { AuthStatus } from/\/\/ import { AuthStatus } from/g' src/services/__tests__/HealthKitService.test.ts
sed -i '' 's/import { EncryptionService } from/\/\/ import { EncryptionService } from/g' src/services/__tests__/SecurityAudit.test.ts

echo "Fixed unused variables and imports"
