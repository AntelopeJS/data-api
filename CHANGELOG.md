# Changelog

## v1.0.0

[compare changes](https://github.com/AntelopeJS/data-api/compare/v0.1.0...v1.0.0)

### 🚀 Enhancements

- Use db index in relevant filters ([#14](https://github.com/AntelopeJS/data-api/pull/14))
- Async validators ([7c84de9](https://github.com/AntelopeJS/data-api/commit/7c84de9))
- Add per-action access control overrides ([#19](https://github.com/AntelopeJS/data-api/pull/19))
- Migrate to new database schema API (AQL2) ([#20](https://github.com/AntelopeJS/data-api/pull/20))

### 🩹 Fixes

- Array of foreign keys ([#12](https://github.com/AntelopeJS/data-api/pull/12))
- Dont assign prototype to null foreign objects ([539cf0a](https://github.com/AntelopeJS/data-api/commit/539cf0a))
- Linting ([b6d8928](https://github.com/AntelopeJS/data-api/commit/b6d8928))
- Playground startup errors ([#16](https://github.com/AntelopeJS/data-api/pull/16))
- Remove all non-null assertions to fix noNonNullAssertion lint warnings ([#21](https://github.com/AntelopeJS/data-api/pull/21))

### 💅 Refactors

- Use assert from api-util interface ([6f210ff](https://github.com/AntelopeJS/data-api/commit/6f210ff))
- Rename StaticModel to Model decorator ([aa0bad3](https://github.com/AntelopeJS/data-api/commit/aa0bad3))
- Remove primary index decorator from User, Customer, Product, Order, and OrderItem classes ([d70be0f](https://github.com/AntelopeJS/data-api/commit/d70be0f))
- **test:** Use global database instance in all test files ([45ebe57](https://github.com/AntelopeJS/data-api/commit/45ebe57))

### 📦 Build

- Replace rm -rf with rimraf ([#13](https://github.com/AntelopeJS/data-api/pull/13))

### 🏡 Chore

- Replicate ai agent config files (.agents/.claude) ([#17](https://github.com/AntelopeJS/data-api/pull/17))
- Remove ci publish strict ts interface tests ([#18](https://github.com/AntelopeJS/data-api/pull/18))
- Simplify CI workflow triggers and update AGENTS.md ([8607104](https://github.com/AntelopeJS/data-api/commit/8607104))
- Migrate from local beta interfaces to published @antelopejs packages ([c6d2dbc](https://github.com/AntelopeJS/data-api/commit/c6d2dbc))

### 🤖 CI

- Remove test:coverage step from CI workflow ([2138d35](https://github.com/AntelopeJS/data-api/commit/2138d35))

### ❤️ Contributors

- Antony Rizzitelli <upd4ting@gmail.com>
- MrSociety404 <fabrice@altab.be>
- Glastis ([@Glastis](http://github.com/Glastis))
- Thomasims <thomas@antelopejs.com>
- Thomas ([@Thomasims](http://github.com/Thomasims))

## v0.1.0

[compare changes](https://github.com/AntelopeJS/data-api/compare/v0.0.1...v0.1.0)

### 🚀 Enhancements

- Added tableClass and tableName in data api meta ([cc9faf1](https://github.com/AntelopeJS/data-api/commit/cc9faf1))
- Add assertion for pluckMode in DefaultRoutes ([ddf68ff](https://github.com/AntelopeJS/data-api/commit/ddf68ff))
- Changelog generation is now using changelogen ([#7](https://github.com/AntelopeJS/data-api/pull/7))
- Trigger 'insert' & 'update' table modifier events ([67c4944](https://github.com/AntelopeJS/data-api/commit/67c4944))
- Foreign keys under MongoDB ([#9](https://github.com/AntelopeJS/data-api/pull/9))
- Database-decorators modifiers support ([#10](https://github.com/AntelopeJS/data-api/pull/10))
- Support modifiers on foreign keys ([#11](https://github.com/AntelopeJS/data-api/pull/11))

### 🩹 Fixes

- Prettier inconsistency ([d3c338e](https://github.com/AntelopeJS/data-api/commit/d3c338e))
- Inherit tableClass and tableName ([67b9144](https://github.com/AntelopeJS/data-api/commit/67b9144))
- Unlock correct object in list ([c217f6d](https://github.com/AntelopeJS/data-api/commit/c217f6d))

### 💅 Refactors

- Use correct path mappings for playground interfaces ([#2](https://github.com/AntelopeJS/data-api/pull/2))
- Remove .antelope from git ([#3](https://github.com/AntelopeJS/data-api/pull/3))

### 📖 Documentation

- Update license section in README.md ([46d8e99](https://github.com/AntelopeJS/data-api/commit/46d8e99))
- Enhance README.md with interfaces section ([#1](https://github.com/AntelopeJS/data-api/pull/1))
- Improved shields ([#4](https://github.com/AntelopeJS/data-api/pull/4))

### 📦 Build

- Update prepare command ([51e0b96](https://github.com/AntelopeJS/data-api/commit/51e0b96))
- Command 'build' that remove previous one before building ([#6](https://github.com/AntelopeJS/data-api/pull/6))
- Update changelog config ([bdae09f](https://github.com/AntelopeJS/data-api/commit/bdae09f))

### 🏡 Chore

- Update TableHolder and DataController types ([c7121b5](https://github.com/AntelopeJS/data-api/commit/c7121b5))
- Typing ([121286b](https://github.com/AntelopeJS/data-api/commit/121286b))
- Update tsconfig.json paths ([e1f6eac](https://github.com/AntelopeJS/data-api/commit/e1f6eac))

### ✅ Tests

- Unit testing initial commit ([#5](https://github.com/AntelopeJS/data-api/pull/5))

### 🤖 CI

- Add GitHub Workflow to validate interface export ([#8](https://github.com/AntelopeJS/data-api/pull/8))

### ❤️ Contributors

- Antony Rizzitelli <upd4ting@gmail.com>
- Thomas ([@Thomasims](http://github.com/Thomasims))
- Thomasims <thomas@antelopejs.com>
- Fabrice Cst <fabrice@altab.be>
- Glastis ([@Glastis](http://github.com/Glastis))
- MrSociety404 <fabrice@altab.be>

## 0.0.1 (2025-05-08)
