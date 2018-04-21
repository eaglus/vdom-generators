import { dataLoader } from "../loadGenerator";
import {
  FindStartChunk,
  FindNextChunk,
  LoadChunks,
  FindClose
} from "../commands";

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

describe("loader commands test", () => {
  const dateFrom = 101;
  const dateTo = 207;
  const dateCnt = dateTo - dateFrom + 1;

  const chunks = makeChunk(100, 3);
  const startIdx = dateFrom - chunks[0].date;
  const expectResult = chunks.slice(startIdx, startIdx + dateCnt);

  const openedContext = { db: 1 };
  const loadedContext = { db: 2 };
  it("test for empty", () => {
    const commandTable = [
      [new FindStartChunk(dateFrom, ""), { context: openedContext }], //no chunks at start
      [new FindClose(openedContext)],
      [new LoadChunks(dateFrom, dateTo, ""), loadedContext],
      [
        new FindStartChunk(dateFrom, "", loadedContext),
        { chunk: makeChunk(100), context: loadedContext }
      ],
      [
        new FindNextChunk(loadedContext),
        { chunk: makeChunk(100 + chunkLength), context: loadedContext }
      ],
      [
        new FindNextChunk(loadedContext),
        { chunk: makeChunk(100 + chunkLength * 2), context: loadedContext }
      ],
      [new FindClose(loadedContext)]
    ];

    testCommands(dataLoader(dateFrom, dateTo, ""), commandTable, expectResult);
  });

  it("test for load left", () => {
    const startContext = { db: "nothing" };
    const openedContext = { db: 1 };
    const loadedContext = { db: 2 };
    const commandTable = [
      [
        new FindStartChunk(dateFrom, "", startContext),
        { chunk: makeChunk(150), context: openedContext }
      ],
      [new FindClose(openedContext)],
      [new LoadChunks(dateFrom, 149, ""), loadedContext],
      [
        new FindStartChunk(dateFrom, "", loadedContext),
        { chunk: makeChunk(100), context: loadedContext }
      ],
      [
        new FindNextChunk(loadedContext),
        { chunk: makeChunk(100 + chunkLength), context: loadedContext }
      ],
      [
        new FindNextChunk(loadedContext),
        { chunk: makeChunk(100 + chunkLength * 2), context: loadedContext }
      ],
      [new FindClose(loadedContext)]
    ];

    testCommands(
      dataLoader(dateFrom, dateTo, "", startContext),
      commandTable,
      expectResult
    );
  });

  it("test for load right", () => {
    const startContext = { db: "nothing" };
    const openedContext = { db: 1 };
    const loadedContext = { db: 2 };

    const testFromEmptyState = [
      [
        new FindStartChunk(dateFrom, "", startContext),
        { chunk: makeChunk(100), context: openedContext }
      ],
      [new FindNextChunk(openedContext), { context: openedContext }],
      [new FindClose(openedContext)],
      [new LoadChunks(150, dateTo, ""), loadedContext],
      [
        new FindStartChunk(150, "", loadedContext),
        { chunk: makeChunk(150), context: loadedContext }
      ],
      [
        new FindNextChunk(loadedContext),
        { chunk: makeChunk(200), context: loadedContext }
      ],
      [new FindClose(loadedContext)]
    ];

    let chunks = makeChunk(100, 3);
    const startIdx = dateFrom - chunks[0].date;
    const expectResult = chunks.slice(startIdx, startIdx + dateCnt);
    testCommands(
      dataLoader(dateFrom, dateTo, "", startContext),
      testFromEmptyState,
      expectResult
    );
  });

  it("test for all loaded", () => {
    const startContext = { db: "nothing" };
    const loadedContext = { db: 1 };

    const commandTable = [
      [
        new FindStartChunk(dateFrom, "", startContext),
        { chunk: makeChunk(100), context: openedContext }
      ],
      [
        new FindNextChunk(loadedContext),
        { chunk: makeChunk(150), context: openedContext }
      ],
      [
        new FindNextChunk(loadedContext),
        { chunk: makeChunk(200), context: openedContext }
      ],
      [new FindClose(loadedContext)]
    ];

    testCommands(
      dataLoader(dateFrom, dateTo, "", startContext),
      commandTable,
      expectResult
    );
  });
});
