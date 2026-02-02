const setName = function(obj) {
    let name = obj.args[0];

    let changes = { $set: {} };

    changes.$set[`spreadsheet.name`] = name;

    return changes;
}

module.exports = {
    setName
}
