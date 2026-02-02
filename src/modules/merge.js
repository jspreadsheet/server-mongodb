const setMerge = function(obj) {
    let mergeObject = obj.args[0];

    let changes = { $set: {} };

    Object.keys(mergeObject).forEach((key) => {
        changes.$set[`spreadsheet.worksheets.${obj.worksheetIndex}.mergeCells.${key}`] = mergeObject[key];
    });

    return changes;
}

const removeMerge = function(obj) {
    let mergeObject = obj.args[0];

    const cellNames = Object.keys(mergeObject);
    const cellNamesLength = cellNames.length;

    const unset = {};

    const propertyPath = `spreadsheet.worksheets.${obj.worksheetIndex}.mergeCells`;

    for (let i = 0; i < cellNamesLength; i++) {
        const cellName = cellNames[i];

        unset[`${propertyPath}.${cellName}`] = '';
    }

    return {
        $unset: unset,
    };
}

module.exports = {
    setMerge,
    removeMerge,
}
