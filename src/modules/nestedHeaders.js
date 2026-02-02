const setNestedHeaders = function(obj) {
    let matrix = obj.args[0];

    let changes = { $set: {} };

    changes.$set[`spreadsheet.worksheets.${obj.worksheetIndex}.nestedHeaders`] = matrix;

    return changes;
}

const setNestedCell = function(obj) {
    const [cellChanges] = obj.args;

    const set = {};

    const nestedHeadersPath = `spreadsheet.worksheets.${obj.worksheetIndex}.nestedHeaders`;

    const cellChangesLength = cellChanges.length;
    for (let i = 0; i < cellChangesLength; i++) {
        const cellChange = cellChanges[i];

        const entries = Object.entries(cellChange.properties);

        const cellPath = `${nestedHeadersPath}.${cellChange.y}.${cellChange.x}`;

        const entriesLength = entries.length;
        for (let entryIndex = 0; entryIndex < entriesLength; entryIndex++) {
            const [key, value] = entries[entryIndex];

            set[`${cellPath}.${key}`] = value;
        }
    }

    return {
        $set: set,
    };
}

const resetNestedHeaders = function(obj) {
    
    let changes = { $unset: {} };

    changes.$unset[`spreadsheet.worksheets.${obj.worksheetIndex}.nestedHeaders`] = '';

    return changes;
}

module.exports = {
    setNestedHeaders,
    setNestedCell,
    resetNestedHeaders,
}
