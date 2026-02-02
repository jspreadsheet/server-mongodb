const setCache = function(obj) {
    let cacheObject = obj.args[0];
    let changes = { $set: {} };
    Object.keys(cacheObject).forEach((cell) => {
        changes.$set[`spreadsheet.worksheets.${obj.worksheetIndex}.cache.${cell}`] = cacheObject[cell];
    });
    return changes;
}

module.exports = {
    setCache,
}
