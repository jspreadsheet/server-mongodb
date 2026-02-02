const { updateReferences, dataIsMatrix, moveArrayItems } = require('../utils/utils');

const setHeight = function (obj) {
    let [rows, heights] = obj.args;

    if (!Array.isArray(rows)) {
        rows = [rows];
    }

    const set = {};

    const heightsIsAnArray = Array.isArray(heights);
    const rowsPath = `spreadsheet.worksheets.${obj.worksheetIndex}.rows`;
    const savedRows = obj.document.spreadsheet.worksheets[obj.worksheetIndex].rows || [];

    const rowsLength = rows.length;

    for (let i = 0; i < rowsLength; i++) {
        const rowIndex = rows[i];
        const rowPath = `${rowsPath}.${rowIndex}`;
        const height = heightsIsAnArray ? heights[i] : heights;

        if (savedRows[rowIndex]) {
            set[`${rowPath}.height`] = height;
        } else {
            set[rowPath] = { height: height };
        }
    }

    return {
        $set: set,
    };
}

const visibility = function(obj, state) {
    let rows = obj.args[0];

    if (!Array.isArray(rows)) {
        rows = [rows];
    }

    const set = {};

    const rowsPath = `spreadsheet.worksheets.${obj.worksheetIndex}.rows`;
    const savedRows = obj.document.spreadsheet.worksheets[obj.worksheetIndex].rows || [];

    const rowsLength = rows.length;

    for (let i = 0; i < rowsLength; i++) {
        const rowIndex = rows[i];

        const rowPath = `${rowsPath}.${rowIndex}`;

        if (savedRows[rowIndex]) {
            set[`${rowPath}.visible`] = state;
        } else {
            set[rowPath] = {
                visible: state,
            };
        }
    }

    return {
        $set: set,
    };
}

const turnRowIntoObj = function(row, columns) {
    const result = {};

    const rowLength = row.length;
    for (let columnIndex = 0; columnIndex < rowLength; columnIndex++) {
        const propertyName = (columns[columnIndex] && columns[columnIndex].name) || columnIndex;

        result[propertyName] = row[columnIndex];
    }

    return result;
}

const insertRow = function(obj) {
    const [rows] = obj.args;

    rows.sort((a, b) => a.row - b.row);

    const worksheet = obj.document.spreadsheet.worksheets[obj.worksheetIndex];

    const currentData = worksheet.data;
    let currentDataLength = currentData.length;

    const isMatrix = dataIsMatrix(currentData);

    const worksheetPath = `spreadsheet.worksheets.${obj.worksheetIndex}`;

    const currentColumns = worksheet.columns;

    const currentRows = worksheet.rows;

    const rowsLength = rows.length;
    for (let index = 0; index < rowsLength; index++) {
        const { row: rowIndex, data: rowData, options } = rows[index];

        const data = isMatrix === false && Array.isArray(rowData) ? turnRowIntoObj(rowData, currentColumns) : rowData;

        if (rowIndex > currentDataLength) {
            currentData[rowIndex] = data;

            currentDataLength = rowIndex + 1;
        } else {
            currentData.splice(rowIndex, 0, data);

            currentDataLength++;
        }

        if (rowIndex > currentRows.length) {
            currentRows[rowIndex] = options;
        } else {
            currentRows.splice(rowIndex, 0, options);
        }
    }

    const set = {
        [`${worksheetPath}.data`]: currentData,
        [`${worksheetPath}.rows`]: currentRows,
        [worksheetPath + '.minDimensions.1']: Math.max(worksheet.minDimensions[1] + rowsLength, rows[rowsLength - 1].row + 1),
    };

    const changes = [{
        $set: set
    }];

    // Update references from other properties
    updateReferences(obj, changes);

    return changes;
}

const hideRow = function (obj) {
    return visibility(obj, false)
}

const showRow = function (obj) {
    return visibility(obj, true)
}

const moveRow = function (obj) {
    const [from, to, quantity] = obj.args;

    const worksheet = obj.document.spreadsheet.worksheets[obj.worksheetIndex];

    const rows = worksheet.rows;

    moveArrayItems(rows, from, to, quantity);

    const data = worksheet.data;

    moveArrayItems(data, from, to, quantity);

    const worksheetPath = `spreadsheet.worksheets.${obj.worksheetIndex}`;

    const changes = [{
        $set: {
            [`${worksheetPath}.data`]: data,
            [`${worksheetPath}.rows`]: rows
        }
    }];

    // Update references from other properties
    updateReferences(obj, changes);

    return changes;
}

const deleteRow = function(obj) {
    const [rowsToDelete] = obj.args;

    rowsToDelete.sort((a, b) => a - b);

    let lastSimplifieRemoval = [rowsToDelete[0], 1];

    const simplifiedRowsToDelete = [];

    const length = rowsToDelete.length;
    for (let i = 1; i < length; i++) {
        const rowIndex = rowsToDelete[i];

        if (rowIndex === lastSimplifieRemoval[0] + lastSimplifieRemoval[1]) {
            lastSimplifieRemoval[1]++;
        } else {
            simplifiedRowsToDelete.push(lastSimplifieRemoval);

            lastSimplifieRemoval = [rowIndex, 1];
        }
    }

    simplifiedRowsToDelete.push(lastSimplifieRemoval);

    const worksheet = obj.document.spreadsheet.worksheets[obj.worksheetIndex];

    const currentData = worksheet.data;
    const currentRows = worksheet.rows;

    for (let i = simplifiedRowsToDelete.length - 1; i > -1; i--) {
        const [removalIndex, numOfRemovedItems] = simplifiedRowsToDelete[i];

        currentData.splice(removalIndex, numOfRemovedItems);
        currentRows.splice(removalIndex, numOfRemovedItems);
    }

    const worksheetPath = `spreadsheet.worksheets.${obj.worksheetIndex}`;

    const set = {
        [`${worksheetPath}.data`]: currentData,
        [`${worksheetPath}.rows`]: currentRows,
        [`${worksheetPath}.minDimensions.1`]: worksheet.minDimensions[1] - length
    }

    const changes = [{
        $set: set,
    }];

    // Update references from other properties
    updateReferences(obj, changes);

    return changes;
}

const setRowId = function(obj) {
    const savedRows = obj.document.spreadsheet.worksheets[obj.worksheetIndex].rows;

    const rowsPath = `spreadsheet.worksheets.${obj.worksheetIndex}.rows`;

    const set = {};

    const idChanges = Object.entries(obj.args[0]);

    const idChangesLength = idChanges.length;
    for (let i = 0; i < idChangesLength; i++) {
        const [rowIndex, rowId] = idChanges[i];

        const rowPath = `${rowsPath}.${rowIndex}`;

        if (savedRows[rowIndex]) {
            set[`${rowPath}.id`] = rowId;
        } else {
            set[rowPath] = {
                id: rowId
            };
        }
    }

    return {
        $set: set,
    };
}

module.exports = {
    setHeight,
    insertRow,
    hideRow,
    showRow,
    moveRow,
    deleteRow,
    setRowId,
}
