import cds from '@sap/cds';

export async function getCurrentUser(req) {
  const mockEmail = req.headers['x-mock-user-email'];

  if (!mockEmail) {
    req.reject(400, 'Missing x-mock-user-email header');
  }

  const db = await cds.connect.to('db');

  const user = await db.run(
    SELECT.one
      .from('jetbench.AppUser')
      .columns(
        '*',
        'organization.ID as orgID',
        'organization.name as orgName',
        'organization.code as orgCode',
      )
      .where({ email: mockEmail }),
  );

  if (!user) {
    req.reject(404, `No user found for email ${mockEmail}`);
  }

  return user;
}

export function restrictToOrganization(req, organizationId) {
  if (!organizationId) {
    req.reject(400, 'Organization ID is required');
  }

  req.query.where('organization_ID =', organizationId);
}
