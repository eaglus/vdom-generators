import { IDBFactory, IDBKeyRange, reset } from 'shelving-mock-indexeddb';
import { loadRange, getRange } from './serverApi.js';
import { createCommandHandler } from '../loadHandlers.js';

const handler = createCommandHandler({
  serverApi,
  IndexedDB: new IDBFactory()
});

