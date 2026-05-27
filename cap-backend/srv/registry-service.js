import cds from '@sap/cds';
import { getCurrentUser, restrictToOrganization } from './utils/auth.js';

export default cds.service.impl(function () {
  this.before('READ', 'Aircraft', async (req) => {
    const currentUser = await getCurrentUser(req);

    restrictToOrganization(req, currentUser.organization_ID);
  });
});
