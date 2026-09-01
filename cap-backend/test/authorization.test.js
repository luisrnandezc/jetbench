import { describe, test } from 'node:test';
import assert from 'node:assert/strict';
import cds from '@sap/cds';

const { GET, POST, PATCH, DELETE } = cds.test(import.meta.dirname + '/..');

const ADMIN_URL = '/odata/v4/admin';
const REGISTRY_URL = '/odata/v4/registry';

const platformAdmin = {
  username: 'platform@example.com',
  password: 'platform',
};

const organizationAdmin = {
  username: 'johndoe@example.com',
  password: 'admin',
};

const organizationUser = {
  username: 'carolsturka@example.com',
  password: 'user',
};

const expectAnyStatus = (auth) => ({
  auth,
  validateStatus: () => true,
});

describe('JetBench authorization', () => {
  describe('authentication', () => {
    test('rejects anonymous AdminService requests', async () => {
      const response = await GET(`${ADMIN_URL}/Organizations`, {
        validateStatus: () => true,
      });

      assert.equal(response.status, 401);
    });

    test('rejects anonymous RegistryService requests', async () => {
      const response = await GET(`${REGISTRY_URL}/AircraftModels`, {
        validateStatus: () => true,
      });

      assert.equal(response.status, 401);
    });

    test('rejects an invalid password', async () => {
      const response = await GET(
        `${REGISTRY_URL}/AircraftModels`,
        expectAnyStatus({
          username: organizationUser.username,
          password: 'incorrect-password',
        }),
      );

      assert.equal(response.status, 401);
    });

    test('rejects CAP built-in mock users', async () => {
      const response = await GET(
        `${REGISTRY_URL}/AircraftModels`,
        expectAnyStatus({
          username: 'alice',
          password: 'alice',
        }),
      );

      assert.equal(response.status, 401);
    });
  });

  describe('service roles', () => {
    test('allows a platform administrator to use AdminService', async () => {
      const response = await GET(
        `${ADMIN_URL}/Organizations`,
        expectAnyStatus(platformAdmin),
      );

      assert.equal(response.status, 200);
      assert.ok(Array.isArray(response.data.value));
    });

    test('rejects an organization administrator from AdminService', async () => {
      const response = await GET(
        `${ADMIN_URL}/Organizations`,
        expectAnyStatus(organizationAdmin),
      );

      assert.equal(response.status, 403);
    });

    test('rejects an organization user from AdminService', async () => {
      const response = await GET(
        `${ADMIN_URL}/Organizations`,
        expectAnyStatus(organizationUser),
      );

      assert.equal(response.status, 403);
    });

    test('allows organization roles to read RegistryService', async () => {
      const adminResponse = await GET(
        `${REGISTRY_URL}/AircraftModels`,
        expectAnyStatus(organizationAdmin),
      );
      const userResponse = await GET(
        `${REGISTRY_URL}/AircraftModels`,
        expectAnyStatus(organizationUser),
      );

      assert.equal(adminResponse.status, 200);
      assert.equal(userResponse.status, 200);
    });

    test('rejects a platform administrator from RegistryService', async () => {
      const response = await GET(
        `${REGISTRY_URL}/AircraftModels`,
        expectAnyStatus(platformAdmin),
      );

      assert.equal(response.status, 403);
    });
  });

  describe('aircraft isolation', () => {
    test('does not expose aircraft through model expansion', async () => {
      const response = await GET(
        `${REGISTRY_URL}/AircraftModels?$expand=aircraft`,
        expectAnyStatus(organizationUser),
      );

      assert.equal(response.status, 400);
    });

    test('returns only the organization administrator aircraft', async () => {
      const response = await GET(
        `${REGISTRY_URL}/Aircraft?$select=tailNumber`,
        expectAnyStatus(organizationAdmin),
      );

      assert.equal(response.status, 200);
      assert.deepEqual(
        response.data.value.map((aircraft) => aircraft.tailNumber),
        ['YV1111'],
      );
    });

    test('returns only the organization user aircraft', async () => {
      const response = await GET(
        `${REGISTRY_URL}/Aircraft?$select=tailNumber`,
        expectAnyStatus(organizationUser),
      );

      assert.equal(response.status, 200);
      assert.deepEqual(
        response.data.value.map((aircraft) => aircraft.tailNumber),
        ['YV2222'],
      );
    });

    test('does not expose another organization aircraft by ID', async () => {
      const response = await GET(
        `${REGISTRY_URL}/Aircraft(20000000-0000-0000-0000-000000000002)`,
        expectAnyStatus(organizationAdmin),
      );

      assert.equal(response.status, 404);
    });
  });

  describe('engine isolation', () => {
    test('returns only the organization administrator engines', async () => {
      const response = await GET(
        `${REGISTRY_URL}/Engines?$select=engineSerialNumber`,
        expectAnyStatus(organizationAdmin),
      );

      assert.equal(response.status, 200);
      assert.deepEqual(
        response.data.value.map((engine) => engine.engineSerialNumber).sort(),
        ['ENG001', 'ENG002'],
      );
    });

    test('returns only the organization user engines', async () => {
      const response = await GET(
        `${REGISTRY_URL}/Engines?$select=engineSerialNumber`,
        expectAnyStatus(organizationUser),
      );

      assert.equal(response.status, 200);
      assert.deepEqual(
        response.data.value.map((engine) => engine.engineSerialNumber),
        ['ENG003'],
      );
    });

    test('does not expose another organization engine by ID', async () => {
      const response = await GET(
        `${REGISTRY_URL}/Engines(40000000-0000-0000-0000-000000000003)`,
        expectAnyStatus(organizationAdmin),
      );

      assert.equal(response.status, 404);
    });
  });

  describe('RegistryService write restrictions', () => {
    test('rejects creating an aircraft model', async () => {
      const response = await POST(
        `${REGISTRY_URL}/AircraftModels`,
        {
          code: 'TEST-MODEL',
          name: 'Unauthorized test model',
          numberOfEngines: 1,
        },
        expectAnyStatus(organizationAdmin),
      );

      assert.equal(response.status, 405);
    });

    test('rejects updating an aircraft', async () => {
      const response = await PATCH(
        `${REGISTRY_URL}/Aircraft(20000000-0000-0000-0000-000000000001)`,
        { tailNumber: 'BLOCKED' },
        expectAnyStatus(organizationAdmin),
      );

      assert.equal(response.status, 405);
    });

    test('rejects deleting an engine', async () => {
      const response = await DELETE(
        `${REGISTRY_URL}/Engines(40000000-0000-0000-0000-000000000003)`,
        expectAnyStatus(organizationUser),
      );

      assert.equal(response.status, 405);
    });
  });
});
