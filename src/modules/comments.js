const setComments = function(obj) {
    let comments = obj.args[0];

    let changes = {
        $set: {}
    };

    Object.keys(comments).forEach(key => {
        changes.$set[`spreadsheet.worksheets.${obj.worksheetIndex}.comments.${key}`] = comments[key];
    });

    return changes;
}

module.exports = {
    setComments,
}
