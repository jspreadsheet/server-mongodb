const { dataIsMatrix } = require("../utils/utils");

const setValue = function(obj) {
    const valueChanges = obj.args[0];

    const worksheet = obj.document.spreadsheet.worksheets[obj.worksheetIndex];

    const currentData = worksheet.data;
    const columns = worksheet.columns;

    const isMatrix = dataIsMatrix(currentData);

    const dataPath = `spreadsheet.worksheets.${obj.worksheetIndex}.data`;

    const accessedRows = new Set();

    const insertRows = {};
    const setCellValues = {};

    const valueChangesLength = valueChanges.length;
    for (let i = 0; i < valueChangesLength; i++) {
        const { y, x, value } = valueChanges[i];

        const rowPath = `${dataPath}.${y}`;

        if (!accessedRows.has(y)) {
            if (!currentData[y]) {
                insertRows[rowPath] = isMatrix || typeof isMatrix !== 'boolean' ? [] : {};
            }

            accessedRows.add(y);
        }

        const column = isMatrix || typeof isMatrix !== 'boolean' ? x : (columns[x] && columns[x].name || x);

        setCellValues[`${rowPath}.${column}`] = value;
    }

    const changes = [];

    if (Object.keys(insertRows).length !== 0) {
        changes.push({
            $set: insertRows,
        });
    }

    changes.push({
        $set: setCellValues,
    });

    return changes;
}

const setFormula = setValue;

module.exports = {
    setValue,
    setFormula,
}
