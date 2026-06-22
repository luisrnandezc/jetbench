import { describe, test } from 'node:test';
import assert from 'node:assert/strict';
import cds from '@sap/cds';

const { GET, POST, PATCH, DELETE } = cds.test(import.meta.dirname + '/..');

const ORGANIZATION_URL = '/odata/v4/organization';

const organizationAdmin = {
  username: 'johndoe@example.com',
  password: 'admin',
};

const organizationUser = {
  username: 'carolsturka@example.com',
  password: 'user',
};

const requestOptions = (auth = organizationAdmin) => ({
  auth,
  validateStatus: () => true,
});

describe('OrganizationService', () => {
  describe('service access', () => {
    test('allows organization administrators', async () => {
      const response = await GET(
        `${ORGANIZATION_URL}/Organizations`,
        requestOptions(),
      );

      assert.equal(response.status, 200);
    });

    test('rejects organization users', async () => {
      const response = await GET(
        `${ORGANIZATION_URL}/Organizations`,
        requestOptions(organizationUser),
      );

      assert.equal(response.status, 403);
    });
  });

  describe('organization isolation', () => {
    test('returns only the current organization', async () => {
      const response = await GET(
        `${ORGANIZATION_URL}/Organizations?$select=code`,
        requestOptions(),
      );

      assert.equal(response.status, 200);
      assert.equal(response.data.value.length, 1);
      assert.equal(response.data.value[0].code, 'JBA');
    });

    test('does not expose another organization by ID', async () => {
      const response = await GET(
        `${ORGANIZATION_URL}/Organizations(00000000-0000-0000-0000-000000000002)`,
        requestOptions(),
      );

      assert.equal(response.status, 404);
    });

    test('does not allow deleting an organization', async () => {
      const response = await DELETE(
        `${ORGANIZATION_URL}/Organizations(00000000-0000-0000-0000-000000000001)`,
        requestOptions(),
      );

      assert.equal(response.status, 403);
    });

    test('does not expose organization-owned data through expansion', async () => {
      const response = await GET(
        `${ORGANIZATION_URL}/Organizations?$expand=users`,
        requestOptions(),
      );

      assert.equal(response.status, 400);
    });
  });

  describe('user management', () => {
    test('hides users from other organizations and platform administrators', async () => {
      const response = await GET(
        `${ORGANIZATION_URL}/Users?$select=email`,
        requestOptions(),
      );

      assert.equal(response.status, 200);
      assert.deepEqual(
        response.data.value.map((user) => user.email),
        ['johndoe@example.com'],
      );
    });

    test('assigns a new user to the authenticated administrator organization', async () => {
      const response = await POST(
        `${ORGANIZATION_URL}/Users`,
        {
          firstName: 'Test',
          lastName: 'User',
          email: 'milestone6.user@example.com',
          authId: 'milestone6.user@example.com',
          role: 'ORG_USER',
          isActive: true,
          organization_ID: '00000000-0000-0000-0000-000000000002',
        },
        requestOptions(),
      );

      assert.equal(response.status, 201);
      assert.equal(
        response.data.organization_ID,
        '00000000-0000-0000-0000-000000000001',
      );
    });

    test('rejects assigning the platform administrator role', async () => {
      const response = await POST(
        `${ORGANIZATION_URL}/Users`,
        {
          firstName: 'Forbidden',
          lastName: 'Admin',
          email: 'forbidden.admin@example.com',
          role: 'PLATFORM_ADMIN',
          isActive: true,
        },
        requestOptions(),
      );

      assert.equal(response.status, 403);
    });
  });

  describe('aircraft management', () => {
    test('assigns a new aircraft to the authenticated administrator organization', async () => {
      const response = await POST(
        `${ORGANIZATION_URL}/Aircraft`,
        {
          tailNumber: 'M6TEST',
          serialNumber: 'M6-AIRCRAFT-001',
          aircraftModel_ID: '30000000-0000-0000-0000-000000000001',
          organization_ID: '00000000-0000-0000-0000-000000000002',
        },
        requestOptions(),
      );

      assert.equal(response.status, 201);
      assert.equal(
        response.data.organization_ID,
        '00000000-0000-0000-0000-000000000001',
      );
    });

    test('cannot update another organization aircraft', async () => {
      const response = await PATCH(
        `${ORGANIZATION_URL}/Aircraft(20000000-0000-0000-0000-000000000002)`,
        { tailNumber: 'BLOCKED' },
        requestOptions(),
      );

      assert.equal(response.status, 403);
    });

    test('cannot move an aircraft to another organization', async () => {
      const response = await PATCH(
        `${ORGANIZATION_URL}/Aircraft(20000000-0000-0000-0000-000000000001)`,
        { organization_ID: '00000000-0000-0000-0000-000000000002' },
        requestOptions(),
      );

      assert.equal(response.status, 403);
    });
  });

  describe('engine management', () => {
    test('rejects installing an engine on another organization aircraft', async () => {
      const response = await POST(
        `${ORGANIZATION_URL}/Engines`,
        {
          engineSerialNumber: 'M6-ENGINE-001',
          engineModel_ID: '50000000-0000-0000-0000-000000000001',
          aircraft_ID: '20000000-0000-0000-0000-000000000002',
        },
        requestOptions(),
      );

      assert.equal(response.status, 400);
    });

    test('allows assigning an engine to an aircraft in the same organization', async () => {
      const response = await PATCH(
        `${ORGANIZATION_URL}/Engines(40000000-0000-0000-0000-000000000001)`,
        { aircraft_ID: '20000000-0000-0000-0000-000000000001' },
        requestOptions(),
      );

      assert.equal(response.status, 200);
    });

    test('keeps model master data read-only', async () => {
      const response = await POST(
        `${ORGANIZATION_URL}/EngineModels`,
        {
          code: 'M6-MODEL',
          name: 'Forbidden model',
          tbo: 1000,
        },
        requestOptions(),
      );

      assert.equal(response.status, 405);
    });

    test('does not expose aircraft through model expansion', async () => {
      const response = await GET(
        `${ORGANIZATION_URL}/AircraftModels?$expand=aircraft`,
        requestOptions(),
      );

      assert.equal(response.status, 400);
    });
  });
});
