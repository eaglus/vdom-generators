import { dataLoader } from '../dataLoader.js';
import { FindStartChunk, FindNextChunk, LoadChunks } from '../commands';
import { commandsEqual } from '../../../lib/utils.js';


function testCommands(commands, commandsTable, checkResult) {
  let idx = 0;
  let next = commands.next();
  while (!next.done) {
    const command = next.value;
    const [checkCommand, commandResult] = commandsTable[idx];
    console.log('!!!', command);
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
  it('test for empty', () => {
    const dateFrom = 101;
    const dateTo = 207;
    const dateCnt = dateTo - dateFrom;
    const testFromEmptyState = [
      [new FindStartChunk(dateFrom, ''), {}], //no chunks at start
      [new LoadChunks(dateFrom, dateTo, ''), {}],
      [new FindStartChunk(dateFrom, ''), { chunk: makeChunk(100) }],
      [new FindNextChunk(), { chunk: makeChunk(100 + chunkLength) }],
      [new FindNextChunk(), { chunk: makeChunk(100 + chunkLength * 2) }],
    ];

    let chunks = makeChunk(100, 3);
    const expectResult = chunks.slice(dateFrom - chunks[0], dateCnt);
    testCommands(dataLoader(dateFrom, dateTo, ''), testFromEmptyState, expectResult);
  })
});
