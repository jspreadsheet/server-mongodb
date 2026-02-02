const setConfig = function(obj) {
    let config = obj.args[0];
    let scope = obj.args[1];
    config = JSON.parse(config);
    let changes = {$set: {}};

    if (scope) {
        Object.keys(config).forEach((prop) => {
            changes.$set[`spreadsheet.${prop}`] = config[prop];
        });
    } else {
        Object.keys(config).forEach((prop) => {
            changes.$set[`spreadsheet.worksheets.${obj.worksheetIndex}.${prop}`] = config[prop];
        });
    }

    return changes;
}

module.exports = {
    setConfig,
}
