# JetBench CAP Backend

This folder contains the SAP CAP backend for JetBench, a focused Engine Health Monitoring learning project.

The backend models the supporting structure needed for engine monitoring:

- organizations
- users
- aircraft
- engines
- aircraft models
- engine models

## Services

- `AdminService`: platform-wide administration for platform admins.
- `OrganizationService`: organization-scoped administration for organization admins.
- `RegistryService`: organization-scoped read access for aircraft and engine registry data.

## Local Development

Start the backend with an in-memory database:

```powershell
npx cds serve --in-memory
```

Validate the CDS model:

```powershell
npx cds compile db srv
```

Run tests:

```powershell
npm test
```

## Scope

This backend currently supports the foundation for Engine Health Monitoring. It is not scoped as a full aircraft maintenance or compliance management backend.
