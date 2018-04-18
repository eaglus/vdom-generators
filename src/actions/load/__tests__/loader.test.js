import { dataLoader } from '../dataLoader.js';
import { FindStartChunk, FindNextChunk, LoadChunks } from '../commands';
import { commandsEqual } from '../../../lib/utils.js';


function testCommands(commands, commandsTable, checkResult) {
  let idx = 0;
  let next = commands.next();
  while (!next.done) {
    const command = next.value;
    const [checkCommand, commandResult] = commandsTable[idx];
    expect(command).toEqual(checkCommand);
    expect(command).toBeInstanceOf(checkCommand.constructor);

    next = commands.next(commandResult);
    idx++;
  }
  expect(next.value).toEqual(checkResult);
}

const chunkLength = 50;
function makeChunk(start, count = 1) {
  const result = [];

  for (let i = start; i !== start + chunkLength * count; i++) {
    result.push({ date: i });
  }
  return result;
}

describe('loader commands test', () => {
  const dateFrom = 101;
  const dateTo = 207;
  const dateCnt = dateTo - dateFrom + 1;

  const chunks = makeChunk(100, 3);
  const startIdx = dateFrom - chunks[0].date;
  const expectResult = chunks.slice(startIdx, startIdx + dateCnt);

  it('test for empty', () => {
    const commandTable = [
      [new FindStartChunk(dateFrom, ''), {}], //no chunks at start
      [new LoadChunks(dateFrom, dateTo, ''), {}],
      [new FindStartChunk(dateFrom, ''), { chunk: makeChunk(100) }],
      [new FindNextChunk(), { chunk: makeChunk(100 + chunkLength) }],
      [new FindNextChunk(), { chunk: makeChunk(100 + chunkLength * 2) }],
    ];

    testCommands(dataLoader(dateFrom, dateTo, ''), commandTable, expectResult);
  });

  it('test for load left', () => {
    const commandTable = [
      [new FindStartChunk(dateFrom, ''), { chunk: makeChunk(150) }],
      [new LoadChunks(dateFrom, 149, ''), {}],
      [new FindStartChunk(dateFrom, ''), { chunk: makeChunk(100) }],
      [new FindNextChunk(), { chunk: makeChunk(100 + chunkLength) }],
      [new FindNextChunk(), { chunk: makeChunk(100 + chunkLength * 2) }],
    ];

    testCommands(dataLoader(dateFrom, dateTo, ''), commandTable, expectResult);
  });

  it('test for load right', () => {
    const testFromEmptyState = [
      [new FindStartChunk(dateFrom, ''), { chunk: makeChunk(100) }],
      [new FindNextChunk(), {}],
      [new LoadChunks(150, dateTo, ''), {}],
      [new FindStartChunk(150, ''), { chunk: makeChunk(150) }],
      [new FindNextChunk(), { chunk: makeChunk(200) }],
    ];

    let chunks = makeChunk(100, 3);
    const startIdx = dateFrom - chunks[0].date;
    const expectResult = chunks.slice(startIdx, startIdx + dateCnt);
    testCommands(dataLoader(dateFrom, dateTo, ''), testFromEmptyState, expectResult);
  });

  it('test for all loaded', () => {
    const commandTable = [
      [new FindStartChunk(dateFrom, ''), { chunk: makeChunk(100) }],
      [new FindNextChunk(), { chunk: makeChunk(150) }],
      [new FindNextChunk(), { chunk: makeChunk(200) }],
    ];

    testCommands(dataLoader(dateFrom, dateTo, ''), commandTable, expectResult);
  });
});
