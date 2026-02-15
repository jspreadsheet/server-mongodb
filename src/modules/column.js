const { updateReferences, moveArrayItems, dataIsMatrix } = require("../utils/utils");

const setWidth = function(obj) {
    let [columns, widths] = obj.args;

    if (! Array.isArray(columns)) {
        columns = [columns];
    }

    const columnsPath = `spreadsheet.worksheets.${obj.worksheetIndex}.columns`;

    const savedColumns = obj.document.spreadsheet.worksheets[obj.worksheetIndex].columns;

    const widthsIsAnArray = Array.isArray(widths);

    const set = {};

    const columnsLength = columns.length;
    for (let index = 0; index < columnsLength; index++) {
        const column = columns[index];

        const columnPath = `${columnsPath}.${column}`;

        const width = widthsIsAnArray ? widths[index] : widths;

        if (savedColumns[column]) {
            set[`${columnPath}.width`] = width;
        } else {
            set[columnPath] = {
                width
            };
        }
    }

    return {
        $set: set
    };
}

const visibility = function(obj, state) {
    let columns = obj.args[0];

    if (! Array.isArray(columns)) {
        columns = [columns];
    }

    const columnsPath = `spreadsheet.worksheets.${obj.worksheetIndex}.columns`;

    const savedColumns = obj.document.spreadsheet.worksheets[obj.worksheetIndex].columns;

    const set = {};

    const columnsLength = columns.length;
    for (let i = 0; i < columnsLength; i++) {
        const column = columns[i];

        const columnPath = `${columnsPath}.${column}`;

        if (savedColumns[column]) {
            set[`${columnPath}.visible`] = state;
        } else {
            set[columnPath] = {
                visible: state
            };
        }
    }

    return {
        $set: set
    };
}

const hideColumn = function() {
    return visibility(...arguments, false);
}

const showColumn = function() {
    return visibility(...arguments, true);
}

const insertColumn = function(obj) {
    const [columns] = obj.args;

    columns.sort((a, b) => a.column - b.column);

    const worksheet = obj.document.spreadsheet.worksheets[obj.worksheetIndex];

    const currentData = worksheet.data;

    const isMatrix = dataIsMatrix(currentData);

    const currentColumns = worksheet.columns;

    const columnsLength = columns.length;

    for (let index = 0; index < columnsLength; index++) {
        const column = columns[index];

        const columnIndex = column.column;

        if (columnIndex > currentColumns.length) {
            currentColumns[columnIndex] = column.options || {};
        } else {
            currentColumns.splice(columnIndex, 0, column.options || {});
        }

        const columnData = column.data;

        const columnName = (column.options && column.options.name) || columnIndex;

        const numOfRows = Math.max(currentData.length, worksheet.minDimensions[1]);

        for (let rowIndex = 0; rowIndex < numOfRows; rowIndex++) {
            if (isMatrix === false) {
                if (!columnData || typeof columnData[rowIndex] === 'undefined' || columnData[rowIndex] === '') {
                    continue;
                }

                if (!currentData[rowIndex]) {
                    currentData[rowIndex] = {};
                }

                currentData[rowIndex][columnName] = columnData[rowIndex];
            } else {
                let cellValue = columnData && columnData[rowIndex];

                if (!currentData[rowIndex]) {
                    if (typeof cellValue === 'undefined' || cellValue === '') {
                        continue;
                    }

                    currentData[rowIndex] = [];
                }

                const row = currentData[rowIndex];

                if (columnIndex < row.length) {
                    row.splice(columnIndex, 0, cellValue);
                } else {
                    row[columnIndex] = cellValue;
                }
            }
        }
    }

    const worksheetPath = `spreadsheet.worksheets.${obj.worksheetIndex}`;

    const set = {
        [`${worksheetPath}.minDimensions.0`]: Math.max(worksheet.minDimensions[0] + columnsLength, columns[columnsLength - 1].column + 1),
        [`${worksheetPath}.data`]: currentData,
        [`${worksheetPath}.columns`]: currentColumns,
    };

    const changes = [{
        $set: set
    }];

    // Update references from other properties
    updateReferences(obj, changes);

    return changes;
}

const moveColumn = function (obj) {
    const [from, to, quantity] = obj.args;

    const worksheet = obj.document.spreadsheet.worksheets[obj.worksheetIndex];
    const columns = obj.document.spreadsheet.worksheets[obj.worksheetIndex].columns;

    moveArrayItems(columns, from, to, quantity);

    const worksheetPath = `spreadsheet.worksheets.${obj.worksheetIndex}`;

    const set = {
        [`${worksheetPath}.columns`]: columns,
    };

    if (worksheet.footers) {
        const footers = worksheet.footers;

        const footersLength = footers.length;
        for (let y = 0; y < footersLength; y++) {
            const footerRow = footers[y];

            moveArrayItems(footerRow, from, to, quantity);
        }

        set[`${worksheetPath}.footers`] = footers;
    }

    const data = worksheet.data;
    if (dataIsMatrix(data)) {
        const currentDataLength = data.length;
        for (let y = 0; y < currentDataLength; y++) {
            const row = data[y];

            if (row) {
                moveArrayItems(row, from, to, quantity);
            }
        }

        set[`${worksheetPath}.data`] = data;
    }

    const changes = [{
        $set: set,
    }];

    // Update references from other properties
    updateReferences(obj, changes);

    return changes;
}

const deleteColumn = function (obj) {
    const [columnsToDelete] = obj.args;

    columnsToDelete.sort((a, b) => a - b);

    let lastSimplifieRemoval = [columnsToDelete[0], 1];

    const simplifiedColumnsToDelete = [];

    const length = columnsToDelete.length;
    for (let i = 1; i < length; i++) {
        const columnIndex = columnsToDelete[i];

        if (columnIndex === lastSimplifieRemoval[0] + lastSimplifieRemoval[1]) {
            lastSimplifieRemoval[1]++;
        } else {
            simplifiedColumnsToDelete.push(lastSimplifieRemoval);

            lastSimplifieRemoval = [columnIndex, 1];
        }
    }

    simplifiedColumnsToDelete.push(lastSimplifieRemoval);

    const worksheet = obj.document.spreadsheet.worksheets[obj.worksheetIndex];

    const currentData = worksheet.data;
    const currentDataLength = currentData.length;

    const currentColumns = worksheet.columns;

    const isMatrix = dataIsMatrix(currentData);

    const footers = worksheet.footers;
    const footersLength = footers ? footers.length : 0;

    const worksheetPath = `spreadsheet.worksheets.${obj.worksheetIndex}`;

    const unset = {};

    for (let i = simplifiedColumnsToDelete.length - 1; i > -1; i--) {
        const [removalIndex, numOfRemovedItems] = simplifiedColumnsToDelete[i];

        const removedColumns = currentColumns.splice(removalIndex, numOfRemovedItems);

        if (footers) {
            for (let y = 0; y < footersLength; y++) {
                const footerRow = footers[y];

                footerRow.splice(removalIndex, numOfRemovedItems);
            }
        }

        for (let y = 0; y < currentDataLength; y++) {
            const row = currentData[y];

            if (isMatrix) {
                if (row) {
                    row.splice(removalIndex, numOfRemovedItems);
                }
            } else if (isMatrix === false) {
                const removedColumnsLength = removedColumns.length;
                for (let removedColumnIndex = 0; removedColumnIndex < removedColumnsLength; removedColumnIndex++) {
                    const removedColumn = removedColumns[removedColumnIndex];

                    if (removedColumn && removedColumn.name) {
                        unset[`${worksheetPath}.data.y.${removedColumn}`] = true;
                    }
                }
            }
        }
    }

    const set = {
        [`${worksheetPath}.columns`]: currentColumns,
        [`${worksheetPath}.minDimensions.0`]: worksheet.minDimensions[0] - length,
    };

    if (footers) {
        set[`${worksheetPath}.footers`] = footers;
    }

    let change = {
        $set: set,
    };

    if (isMatrix) {
        set[`${worksheetPath}.data`] = currentData;
    } else if (isMatrix === false) {
        change['$unset'] = unset;
    }

    const changes = [change];

    // Update references from other properties
    updateReferences(obj, changes);

    return changes;
}

module.exports = {
    setWidth,
    hideColumn,
    showColumn,
    insertColumn,
    moveColumn,
    deleteColumn,
}
