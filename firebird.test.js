import { format } from 'sql-formatter';

const query =
`

declare variable test varchar(30);
declare variable test2 varchar(50);

`;

try {
  const firstNumber = extractFirstNumber(query); // 1. Sayıyı al
  let modifiedQuery = query;
  if (firstNumber !== null) {
    modifiedQuery = replaceFirstWithPlaceholder(query); // 2. FIRST # ile değiştir
  }
  let formattedQuery;
  if (firstNumber !== null) {
    formattedQuery = format(restoreFirstNumber(modifiedQuery, firstNumber), { language: 'firebird', indent: '  ' });
  } else {
    formattedQuery = format(modifiedQuery, { language: 'firebird', indent: '  ' });
  }
  console.log(`Formatted query:\n ${formattedQuery}\n`);
} catch (error) {
  console.error(`Test failed: ${error.message}`);
};

function extractFirstNumber(query) {
  // SELECT FIRST <sayı> yakalamak için regex
  // Case-insensitive ve boşluklara toleranslı
  const regex = /SELECT\s+FIRST\s+(\d+)/i;
  const match = query.match(regex);
  if (match) {
    return parseInt(match[1], 10); // Sayıyı integer olarak döndür
  }
  return null; // FIRST yoksa null
}

function replaceFirstWithPlaceholder(query) {
  // FIRST <sayı> -> FIRST #
  return query.replace(/(SELECT\s+FIRST\s+)\d+/i, '$10');
}

function restoreFirstNumber(query, number) {
  // FIRST # -> FIRST <sayı>
  return query.replace(/(SELECT\s+FIRST\s+)0/i, `$1${number}`);
}