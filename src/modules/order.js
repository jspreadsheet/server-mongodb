const { updateReferences } = require("../utils/utils");

const orderBy = function(obj) {
    const newOrder = obj.args[2];

    const worksheet = obj.document.spreadsheet.worksheets[obj.worksheetIndex];

    const currentData = worksheet.data;
    const currentRows = worksheet.rows;

    const newData = [];
    const newRows = [];

    const newOrderLength = newOrder.length;
    for (let i = 0; i < newOrderLength; i++) {
        const oldIndex = newOrder[i];

        newData.push(currentData[oldIndex]);
        newRows.push(currentRows[oldIndex]);
    }

    const worksheetPath = `spreadsheet.worksheets.${obj.worksheetIndex}`;

    const changes = [{
        $set: {
            [`${worksheetPath}.data`]: newData,
            [`${worksheetPath}.rows`]: newRows,
        }
    }];

    // Update references from other properties
    updateReferences(obj, changes);

    return changes;
}

module.exports = {
    orderBy,
}
