# Test Setup

## ⚠️ IMPORTANT: Tests Use Mocked Supabase

**✅ Tests will NOT write to your real Supabase database!**

The test setup automatically:
1. Sets `NODE_ENV=test` 
2. Uses fake Supabase credentials (`http://localhost:54321` / `test-key`)
3. Replaces the real Supabase client with an in-memory mock

This means:

✅ **Safe**: Tests can run without affecting your production database
✅ **Fast**: No network calls, tests run quickly  
✅ **Isolated**: Each test run starts with clean mock data
✅ **Automatic**: No configuration needed - just run `npm test`

## How It Works

1. `test/setup.ts` - Sets up the test environment and creates a mock Supabase client
2. `test/mocks/supabase.ts` - Provides an in-memory mock that mimics Supabase behavior
3. Test files import the mocked client instead of the real one

## Running Tests

```bash
npm test              # Run all tests
npm run test:watch    # Watch mode
```

## Test Data

The mock database starts with sample test data. You can modify this in `test/setup.ts` if needed.

## Writing New Tests

When writing new tests, the mock Supabase client will:
- Store data in memory (not in your real DB)
- Support all common Supabase operations (select, insert, update, upsert, etc.)
- Reset between test runs

## If You Need Real Database Tests

If you specifically need to test against a real database (not recommended for unit tests), you would need to:
1. Set up a separate test Supabase project
2. Use environment variables to point to it
3. Be very careful about cleanup

For now, all tests use the safe mock approach.

