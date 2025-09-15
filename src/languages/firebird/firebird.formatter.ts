import { DialectOptions } from '../../dialect.js';
import { expandPhrases } from '../../expandPhrases.js';
import { functions } from './firebird.functions.js';
import { dataTypes, keywords } from './firebird.keywords.js';

const reservedSelect = expandPhrases(['[FOR] SELECT [FIRST 0 | DISTINCT]']);

const reservedClauses = expandPhrases([  
  'FROM',
  'WHERE',
  'GROUP BY',
  'HAVING',
  'ORDER BY',
  'ROWS',
  'DO',
  'INTO',
]);

const reservedSetOperations = expandPhrases([]);

const reservedJoins = expandPhrases([]);

const reservedPhrases = expandPhrases([]);

export const firebird: DialectOptions = {
  name: 'firebird',
  tokenizerOptions: {
    reservedSelect,
    reservedClauses,
    reservedSetOperations,
    reservedJoins,
    reservedPhrases,
    reservedKeywords: keywords,
    reservedDataTypes: dataTypes,
    reservedFunctionNames: functions,
    stringTypes: ["''-qq"],
    identTypes: [`""-qq`],
    paramTypes: { named: [':'] },
    operators: ['=', '<', '>', '<=', '>=', '<>', '||'],
    lineCommentTypes: ['--'],
    nestedBlockComments: true,
  },
  formatOptions: {
    onelineClauses: [],
  },
};
