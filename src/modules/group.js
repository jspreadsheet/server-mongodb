const setGroup = function(obj, property) {
    const [index, quantity, state] = obj.args;

    const propertyPath = `spreadsheet.worksheets.${obj.worksheetIndex}.${property}.${index}`;

    if (quantity) {
        let set;

        const savedArray = obj.document.spreadsheet.worksheets[obj.worksheetIndex][property];

        if (savedArray[index]) {
            set = {
                [`${propertyPath}.group`]: quantity,
                [`${propertyPath}.state`]: state,
            }
        } else {
            set = {
                [propertyPath]: {
                    group: quantity,
                    state: state,
                }
            }
        }

        return {
            $set: set,
        };
    }

    return {
        $unset: {
            [`${propertyPath}.group`]: '',
            [`${propertyPath}.state`]: '',
        },
    };
}

const setColumnGroup = function(obj) {
    return setGroup(obj, 'columns');
}

const setRowGroup = function(obj) {
    return setGroup(obj, 'rows');
}

module.exports = {
    setColumnGroup,
    setRowGroup,
};