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
  'SKIP',
  'PLAN',
  'RETURNS',
  'AS',
  'DO',
  'BEGIN',
  'END',
  'WHEN',
  'EXECUTE STATEMENT',
  'INTO'
]);

const reservedSetOperations = expandPhrases(['UNION [ALL]']);

const reservedJoins = expandPhrases([
  /* 'JOIN',
  '{LEFT | RIGHT | FULL} [OUTER] JOIN',
  '{INNER | CROSS} JOIN',
  '[INNER] JOIN',
  '{LEFT | RIGHT | FULL} [OUTER] JOIN' */
]);

const reservedPhrases = expandPhrases([
  /* 'ON {UPDATE | DELETE} [SET NULL | SET DEFAULT]',
  'RETURNS',
  'AS',
  'BEGIN',
  'END',
  'WHEN ANY DO',
  'EXECUTE STATEMENT',
  'SUSPEND',
  'DECLARE VARIABLE' */
]);

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
    stringTypes: ["''-qq",],
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