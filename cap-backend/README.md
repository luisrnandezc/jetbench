# JetBench CAP Backend

This folder contains the SAP CAP backend for JetBench, an Engine Health Monitoring platform for small to medium aviation operators.

The backend provides the service and data foundation for tracking engine status, aircraft assignments, utilization, and organization-scoped fleet records.

## Domain Foundation

The current backend model includes:

- organizations
- users
- aircraft
- engines
- aircraft models
- engine models

These entities provide the structure needed for engine-health workflows such as condition entries, trend data, dashboards, and reports.

## Services

- `AdminService`: platform-wide administration for platform admins.
- `OrganizationService`: organization-scoped administration for organization admins.
- `RegistryService`: organization-scoped read access for aircraft and engine registry data.

## Demo Authentication

The local and hosted portfolio environments use three predefined HTTP Basic
accounts configured in `package.json`. This disables CAP's built-in mock users
and permits only the JetBench demo identities. The accounts and seeded database
records are fictional.

This is not production authentication. A production system would use a
supported identity provider and token-based authentication instead of storing
demo passwords in source control.

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
