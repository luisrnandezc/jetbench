import cds from '@sap/cds';
import { getCurrentUser } from './utils/auth.js';

const { SELECT } = cds.ql;

export default cds.service.impl(function () {
  this.on('me', async (req) => getCurrentUser(req));

  this.before('READ', 'Organizations', restrictToCurrentOrganization);
  this.before('UPDATE', 'Organizations', restrictToCurrentOrganization);

  this.before('CREATE', 'Users', async (req) => {
    const organizationId = await assignCurrentOrganization(req);
    rejectPlatformAdminRole(req);
    req.data.organization_ID = organizationId;
  });

  this.before('UPDATE', 'Users', async (req) => {
    const organizationId = await getCurrentOrganizationId(req);
    rejectOrganizationChange(req, organizationId);
    rejectPlatformAdminRole(req);
  });

  this.before('CREATE', 'Aircraft', async (req) => {
    await assignCurrentOrganization(req);
  });

  this.before('UPDATE', 'Aircraft', async (req) => {
    const organizationId = await getCurrentOrganizationId(req);
    rejectOrganizationChange(req, organizationId);
  });

  this.before('CREATE', 'Engines', async (req) => {
    const organizationId = await assignCurrentOrganization(req);
    await validateAircraftOwnership(req, organizationId);
  });

  this.before('UPDATE', 'Engines', async (req) => {
    const organizationId = await getCurrentOrganizationId(req);
    rejectOrganizationChange(req, organizationId);
    await validateAircraftOwnership(req, organizationId);
  });
});

async function restrictToCurrentOrganization(req) {
  rejectSensitiveOrganizationExpansions(req);

  const organizationId = await getCurrentOrganizationId(req);
  req.query.where({ ID: organizationId });
}

function rejectSensitiveOrganizationExpansions(req) {
  const columns = req.query.SELECT?.columns ?? [];
  const expandsUsers = columns.some(
    (column) => column.ref?.[0] === 'users' && column.expand,
  );

  if (expandsUsers) {
    req.reject(400, 'Expand users through the dedicated Users endpoint');
  }
}

async function getCurrentOrganizationId(req) {
  const currentUser = await getCurrentUser(req);

  if (!currentUser.organization_ID) {
    req.reject(403, 'The authenticated user has no organization assignment');
  }

  return currentUser.organization_ID;
}

async function assignCurrentOrganization(req) {
  const organizationId = await getCurrentOrganizationId(req);

  // Ownership is determined by the authenticated user, never by client input.
  delete req.data.organization;
  req.data.organization_ID = organizationId;

  return organizationId;
}

function rejectOrganizationChange(req, organizationId) {
  const requestedOrganizationId =
    req.data.organization_ID ?? req.data.organization?.ID;

  if (
    requestedOrganizationId !== undefined &&
    requestedOrganizationId !== organizationId
  ) {
    req.reject(403, 'Moving records to another organization is not allowed');
  }

  delete req.data.organization;
  delete req.data.organization_ID;
}

function rejectPlatformAdminRole(req) {
  if (req.data.role === 'PLATFORM_ADMIN') {
    req.reject(403, 'Organization administrators cannot assign PLATFORM_ADMIN');
  }
}

async function validateAircraftOwnership(req, organizationId) {
  const aircraftId = req.data.aircraft_ID ?? req.data.aircraft?.ID;

  if (aircraftId === undefined) {
    return;
  }

  delete req.data.aircraft;
  req.data.aircraft_ID = aircraftId;

  if (aircraftId === null) {
    return;
  }

  const aircraft = await SELECT.one
    .from('jetbench.Aircraft')
    .columns('ID')
    .where({ ID: aircraftId, organization_ID: organizationId });

  if (!aircraft) {
    req.reject(400, 'The selected aircraft must belong to your organization');
  }
}
