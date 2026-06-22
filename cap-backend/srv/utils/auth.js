import cds from '@sap/cds';

export async function getCurrentUser(req) {
  const authId = req.user.id;

  if (!authId) {
    req.reject(401, 'Authentication is required');
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
      .where({
        authId,
        isActive: true,
      }),
  );

  if (!user) {
    req.reject(403, 'The authenticated user is not active in JetBench');
  }

  return user;
}
