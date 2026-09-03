import { describe, test } from 'node:test';
import assert from 'node:assert/strict';
import cds from '@sap/cds';

const { GET, POST, PATCH, DELETE } = cds.test(import.meta.dirname + '/..');

const OPERATIONS_URL = '/odata/v4/operations';

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

const ORG_ONE = '00000000-0000-0000-0000-000000000001';
const ORG_TWO = '00000000-0000-0000-0000-000000000002';

const ORG_ONE_AIRCRAFT = '20000000-0000-0000-0000-000000000001';
const ORG_TWO_AIRCRAFT = '20000000-0000-0000-0000-000000000002';

const ORG_TWO_USER = '10000000-0000-0000-0000-000000000002';

const requestOptions = (auth = organizationUser) => ({
  auth,
  validateStatus: () => true,
});

async function getAircraft(aircraftId, auth = organizationUser) {
  const response = await GET(
    `${OPERATIONS_URL}/Aircraft(${aircraftId})?$select=ID,totalFlightHours,totalCycles`,
    requestOptions(auth),
  );

  assert.equal(response.status, 200);
  return response.data;
}

async function getEnginesForAircraft(aircraftId, auth = organizationUser) {
  const response = await GET(
    `${OPERATIONS_URL}/Engines?$select=ID,totalFlightHours,totalCycles&$filter=aircraft_ID eq ${aircraftId}`,
    requestOptions(auth),
  );

  assert.equal(response.status, 200);
  return response.data.value;
}

async function createFlightRecord(payload, auth = organizationUser) {
  return POST(`${OPERATIONS_URL}/FlightRecords`, payload, requestOptions(auth));
}

function asNumber(value) {
  return Number(value);
}

describe('OperationsService', () => {
  describe('service access', () => {
    test('allows organization users to use the operational workflow', async () => {
      /** Purpose: ORG_USER is the day-to-day role that records operational activity. */
      const response = await GET(`${OPERATIONS_URL}/Aircraft`, requestOptions());

      assert.equal(response.status, 200);
    });

    test('allows organization administrators to use the operational workflow', async () => {
      /** Purpose: ORG_ADMIN can do everything an ORG_USER can do. */
      const response = await GET(
        `${OPERATIONS_URL}/Aircraft`,
        requestOptions(organizationAdmin),
      );

      assert.equal(response.status, 200);
    });

    test('rejects platform administrators from organization-side operations', async () => {
      /** Purpose: PLATFORM_ADMIN should use AdminService, not OperationsService. */
      const response = await GET(
        `${OPERATIONS_URL}/Aircraft`,
        requestOptions(platformAdmin),
      );

      assert.equal(response.status, 403);
    });
  });

  describe('organization isolation', () => {
    test('returns only the aircraft owned by the current user organization', async () => {
      /** Purpose: ORG_USER should only see operational data for their organization. */
      const response = await GET(
        `${OPERATIONS_URL}/Aircraft?$select=tailNumber`,
        requestOptions(),
      );

      assert.equal(response.status, 200);
      assert.deepEqual(
        response.data.value.map((aircraft) => aircraft.tailNumber),
        ['YV2222'],
      );
    });

    test('returns only flight records owned by the current user organization', async () => {
      /** Purpose: flight history must follow the same organization boundary as aircraft and engines. */
      const response = await GET(
        `${OPERATIONS_URL}/FlightRecords?$select=organization_ID`,
        requestOptions(),
      );

      assert.equal(response.status, 200);
      assert.ok(response.data.value.length > 0);
      assert.ok(
        response.data.value.every(
          (flightRecord) => flightRecord.organization_ID === ORG_TWO,
        ),
      );
    });

    test('rejects creating a flight record for another organization aircraft', async () => {
      /** Purpose: users may record flights only for aircraft owned by their organization. */
      const response = await createFlightRecord({
        flightDate: '2026-09-01',
        flightHours: 1.5,
        aircraft_ID: ORG_ONE_AIRCRAFT,
      });

      assert.equal(response.status, 400);
    });
  });

  describe('flight record creation', () => {
    test('assigns organization and recordedBy from the authenticated user', async () => {
      /** Purpose: ownership and audit fields should be trusted backend decisions, not client input. */
      const response = await createFlightRecord({
        flightDate: '2026-09-02',
        flightHours: 0.75,
        aircraft_ID: ORG_TWO_AIRCRAFT,
        organization_ID: ORG_ONE,
        recordedBy_ID: ORG_TWO_USER,
      });

      assert.equal(response.status, 201);
      assert.equal(response.data.organization_ID, ORG_TWO);
      assert.equal(response.data.recordedBy_ID, ORG_TWO_USER);
      assert.equal(response.data.cycles, 1);
    });

    test('requires an aircraft', async () => {
      /** Purpose: a flight record is not meaningful unless it is tied to one aircraft. */
      const response = await createFlightRecord({
        flightDate: '2026-09-03',
        flightHours: 1.0,
      });

      assert.equal(response.status, 400);
    });

    test('rejects updating flight records through OperationsService', async () => {
      /** Purpose: flight records are append-only until a correction workflow is designed. */
      const response = await PATCH(
        `${OPERATIONS_URL}/FlightRecords(70000000-0000-0000-0000-000000000003)`,
        { notes: 'Changed through forbidden update' },
        requestOptions(),
      );

      assert.equal(response.status, 403);
    });

    test('rejects deleting flight records through OperationsService', async () => {
      /** Purpose: deleting operational history would make engine totals difficult to trust. */
      const response = await DELETE(
        `${OPERATIONS_URL}/FlightRecords(70000000-0000-0000-0000-000000000003)`,
        requestOptions(),
      );

      assert.equal(response.status, 403);
    });
  });

  describe('protected fleet structure', () => {
    test('rejects aircraft creation through OperationsService', async () => {
      /** Purpose: ORG_USER records activity but does not create structural fleet objects. */
      const response = await POST(
        `${OPERATIONS_URL}/Aircraft`,
        {
          tailNumber: 'OPS-NEW',
          serialNumber: 'OPS-AIRCRAFT-001',
          aircraftModel_ID: '30000000-0000-0000-0000-000000000002',
        },
        requestOptions(),
      );

      assert.equal(response.status, 405);
    });

    test('rejects changing engine aircraft assignment through OperationsService', async () => {
      /** Purpose: engine installation changes belong to ORG_ADMIN in OrganizationService. */
      const response = await PATCH(
        `${OPERATIONS_URL}/Engines(40000000-0000-0000-0000-000000000003)`,
        { aircraft_ID: ORG_ONE_AIRCRAFT },
        requestOptions(),
      );

      assert.equal(response.status, 405);
    });
  });

  describe('usage side effects', () => {
    test('adds flight hours and one cycle to the selected aircraft', async () => {
      /** Purpose: creating a flight record should update the aircraft utilization totals. */
      const beforeAircraft = await getAircraft(ORG_TWO_AIRCRAFT);

      const response = await createFlightRecord({
        flightDate: '2026-09-04',
        flightHours: 2.25,
        aircraft_ID: ORG_TWO_AIRCRAFT,
      });

      assert.equal(response.status, 201);

      const afterAircraft = await getAircraft(ORG_TWO_AIRCRAFT);

      assert.equal(
        asNumber(afterAircraft.totalFlightHours),
        asNumber(beforeAircraft.totalFlightHours) + 2.25,
      );
      assert.equal(
        asNumber(afterAircraft.totalCycles),
        asNumber(beforeAircraft.totalCycles) + 1,
      );
    });

    test('adds flight hours and one cycle to engines installed on the selected aircraft', async () => {
      /** Purpose: installed engines should accumulate usage when their aircraft flies. */
      const beforeEngines = await getEnginesForAircraft(ORG_TWO_AIRCRAFT);

      const response = await createFlightRecord({
        flightDate: '2026-09-05',
        flightHours: 1.25,
        aircraft_ID: ORG_TWO_AIRCRAFT,
      });

      assert.equal(response.status, 201);

      const afterEngines = await getEnginesForAircraft(ORG_TWO_AIRCRAFT);

      assert.equal(afterEngines.length, beforeEngines.length);

      for (const beforeEngine of beforeEngines) {
        const afterEngine = afterEngines.find(
          (engine) => engine.ID === beforeEngine.ID,
        );

        assert.ok(afterEngine);
        assert.equal(
          asNumber(afterEngine.totalFlightHours),
          asNumber(beforeEngine.totalFlightHours) + 1.25,
        );
        assert.equal(
          asNumber(afterEngine.totalCycles),
          asNumber(beforeEngine.totalCycles) + 1,
        );
      }
    });
  });
});


