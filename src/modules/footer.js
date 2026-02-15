const setFooter = function(obj) {
    let matrix = obj.args[0];

    let changes = { $set: {} };

    changes.$set[`spreadsheet.worksheets.${obj.worksheetIndex}.footers`] = matrix;

    return changes;
}

const setFooterValue = function(obj) {
    let items = obj.args[0]

    if (!Array.isArray(items)) {
        items = [items]
    }

    const numOfItems = items.length

    const set = {}

    for (let i = 0; i < numOfItems; i++) {
        const { x, y, value } = items[i];
        set[`spreadsheet.worksheets.${obj.worksheetIndex}.footers.${y}.${x}`] = value;
    }

    const changes = { $set: set };

    return changes;
}

const resetFooter = function(obj) {
    let changes = { $unset: {} };

    changes.$unset[`spreadsheet.worksheets.${obj.worksheetIndex}.footers`] = '';

    return changes;
}

module.exports = {
    setFooter,
    setFooterValue,
    resetFooter,
}
