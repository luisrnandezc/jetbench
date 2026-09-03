import cds from '@sap/cds';
import { getCurrentUser } from './utils/auth.js';

const { SELECT, UPDATE } = cds.ql;

export default cds.service.impl(function () {
  this.on('me', async (req) => getCurrentUser(req));

  this.before('CREATE', 'FlightRecords', async (req) => {
    const currentUser = await getCurrentUser(req);
    const organizationId = currentUser.organization_ID;

    if (!organizationId) {
      req.reject(403, 'The authenticated user has no organization assignment');
    }

    req.data.organization_ID = organizationId;
    req.data.recordedBy_ID = currentUser.ID;

    await validateAircraftOwnership(req, organizationId);
  });

  this.after('CREATE', 'FlightRecords', async (flightRecord, req) => {
    await addUsageToAircraft(flightRecord, req);
    await addUsageToInstalledEngines(flightRecord, req);
  });
});

async function validateAircraftOwnership(req, organizationId) {
  const aircraftId = req.data.aircraft_ID ?? req.data.aircraft?.ID;

  if (!aircraftId) {
    req.reject(400, 'Aircraft is required');
  }

  delete req.data.aircraft;
  req.data.aircraft_ID = aircraftId;

  const aircraft = await SELECT.one
    .from('jetbench.Aircraft')
    .columns('ID')
    .where({
      ID: aircraftId,
      organization_ID: organizationId,
    });

  if (!aircraft) {
    req.reject(400, 'The selected aircraft must belong to your organization');
  }
}

async function addUsageToAircraft(flightRecord, req) {
  const aircraftId = flightRecord.aircraft_ID;
  const flightHours = Number(flightRecord.flightHours ?? 0);
  const cycles = Number(flightRecord.cycles ?? 1);

  if (!aircraftId) {
    req.error(500, 'Flight record was created without an aircraft');
    return;
  }

  await UPDATE('jetbench.Aircraft')
    .set({
      totalFlightHours: { '+=': flightHours },
      totalCycles: { '+=': cycles },
    })
    .where({
      ID: aircraftId,
      organization_ID: flightRecord.organization_ID,
    });
}

async function addUsageToInstalledEngines(flightRecord, req) {
  const aircraftId = flightRecord.aircraft_ID;
  const flightHours = Number(flightRecord.flightHours ?? 0);
  const cycles = Number(flightRecord.cycles ?? 1);

  if (!aircraftId) {
    req.error(500, 'Flight record was created without an aircraft');
    return;
  }

  await UPDATE('jetbench.Engine')
    .set({
      totalFlightHours: { '+=': flightHours },
      totalCycles: { '+=': cycles },
    })
    .where({
      aircraft_ID: aircraftId,
      organization_ID: flightRecord.organization_ID,
    });
}
