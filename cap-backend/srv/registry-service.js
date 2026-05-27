import cds from '@sap/cds';
import { getCurrentUser } from './utils/auth.js';

export default cds.service.impl(function () {
  this.before('READ', 'Aircraft', async (req) => {
    const currentUser = await getCurrentUser(req);

    req.query.where('organization_ID =', currentUser.organization_ID);
  });
});
