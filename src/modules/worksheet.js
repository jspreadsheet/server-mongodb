const validateWorksheet = function(worksheet) {
    // Media
    if (! worksheet.media) {
        worksheet.media = [];
    }
    // Data
    if (! worksheet.data) {
        worksheet.data = [];
    }
    // Rows
    if (! worksheet.rows) {
        worksheet.rows = [];
    }
    // Columns
    if (! worksheet.columns) {
        worksheet.columns = [];
    }
}

const createWorksheet = function(obj) {
    let config = obj.args[0];
    let position = obj.args[1]

    validateWorksheet(config);

    let changes = {
        $push: {
            'spreadsheet.worksheets': {
                $each: [config],
            }
        }
    };

    if (typeof(position) !== 'undefined') {
        changes.$push['spreadsheet.worksheets'].$position = position;
    }

    return changes;
}

const deleteWorksheet = function(obj) {
    let position = obj.args[0]

    let unset = {}
    unset[`spreadsheet.worksheets.${position}`] = 1;

    let pull = {};
    pull[`spreadsheet.worksheets`] = null;

    return [{ $unset: unset }, { $pull: pull }];
}

const renameWorksheet = function(obj) {
    let worksheetIndex = obj.args[0];
    let newName = obj.args[1]
    let changes = { $set: {} };
    changes.$set[`spreadsheet.worksheets.${worksheetIndex}.worksheetName`] = newName;

    return changes;
}

const moveWorksheet = function(obj) {
    let origin = obj.args[0];
    let destination = obj.args[1];

    let worksheet = obj.document.spreadsheet.worksheets[origin];
    if (! worksheet) {
        throw new Error('Worksheet not found');
    }

    const pull = {};
    pull['spreadsheet.worksheets'] = worksheet;

    let push = {};
    push['spreadsheet.worksheets'] = { $each: [worksheet], $position: destination };

    return [{ $pull: pull },{ $push: push }];
}

const setWorksheetState = function(obj) {
    let [index, state] = obj.args;
    let changes = { $set: {} };

    if (typeof state === 'boolean') {
        state = state ? 'visible' : 'hidden';
    }

    changes.$set[`spreadsheet.worksheets.${index}.worksheetState`] = state;
    return changes;
}

module.exports = {
    validateWorksheet,
    createWorksheet,
    deleteWorksheet,
    renameWorksheet,
    moveWorksheet,
    setWorksheetState,
}
