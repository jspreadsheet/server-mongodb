const setValidations = function(obj) {
    let newValue = obj.args[0];
    let changes = { $set: {} };
    newValue.forEach((validation) => {
        changes.$set[`spreadsheet.validations.${validation.index}`] = validation.value;
    })
    return changes;
}

module.exports = {
    setValidations,
}
