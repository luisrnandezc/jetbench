import cds from '@sap/cds';
import cors from 'cors';
import express from 'express';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const currentFile = fileURLToPath(import.meta.url);
const currentDirectory = path.dirname(currentFile);
const repositoryRoot = path.resolve(currentDirectory, '../..');
const landingPage = path.join(currentDirectory, '../app/index.html');

cds.on('bootstrap', (app) => {
  if (process.env.NODE_ENV !== 'production') {
    app.use(
      cors({
        origin: 'http://localhost:8080',
        credentials: true,
        exposedHeaders: ['OData-Version', 'OData-MaxVersion', 'x-csrf-token'],
      }),
    );
  }

  app.use(
    '/admin',
    express.static(path.join(repositoryRoot, 'fiori-frontend/apps/admin/dist')),
  );

  app.use(
    '/organization',
    express.static(
      path.join(repositoryRoot, 'fiori-frontend/apps/organization/dist'),
    ),
  );

  app.use(
    '/registry',
    express.static(
      path.join(repositoryRoot, 'fiori-frontend/apps/registry/dist'),
    ),
  );

  app.use(
    '/operations',
    express.static(
      path.join(repositoryRoot, 'fiori-frontend/apps/operations/dist'),
    ),
  );

  app.get('/health', (_req, res) => {
    res.status(200).json({ status: 'ok' });
  });

  app.get('/', (_req, res) => {
    res.sendFile(landingPage);
  });

  app.use((_req, res, next) => {
    res.setHeader('OData-Version', '4.0');
    next();
  });
});

export default cds.server;
