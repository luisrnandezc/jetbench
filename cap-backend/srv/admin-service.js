import cds from '@sap/cds';
import { getCurrentUser } from './utils/auth.js';

export default cds.service.impl(async function () {
  this.on('me', async (req) => {
    return await getCurrentUser(req);
  });
});
