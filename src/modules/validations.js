const setValidations = function(obj) {
    let newValue = obj.args[0];

    const set = {}

    newValue.forEach((validation) => {
        let key = `spreadsheet.validations.${validation.index}`;
        if (typeof validation.value === 'string') {
            key += '.range';
        }

        set[key] = validation.value;
    })

    const changes = { $set: set };

    return changes;
}

module.exports = {
    setValidations,
}
