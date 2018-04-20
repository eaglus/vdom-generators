export class FindStartChunk {
  //находим пачку с _верхней_ границе больше, чем date
  constructor(date, collection, context) {
    this.date = date;
    this.collection = collection;
    this.context = context;
  }
}

export class FindNextChunk {
  constructor(context) {
    this.context = context;
  }
}

export class FindClose {
  constructor(context) {
    this.context = context;
  }
}

export class LoadChunks {
  constructor(dateFrom, dateTo, collection) {
    this.dateFrom = dateFrom;
    this.dateTo = dateTo;
    this.collection = collection;
  }
}
