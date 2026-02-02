const setDefinedNames = function(obj) {
    let [definedNameChanges] = obj.args;

    const set = {};
    const unset = {};

    const definedNameChangesLength = definedNameChanges.length;
    for (let i = 0; i < definedNameChangesLength; i++) {
        const definedNameChange = definedNameChanges[i];

        const propertyPath = `spreadsheet.definedNames.${definedNameChange.index}`;

        if (typeof definedNameChange.value !== 'undefined') {
            set[propertyPath] = definedNameChange.value;
        } else {
            unset[propertyPath] = '';
        }
    }

    return {
        $set: set,
        $unset: unset,
    };
}

module.exports = {
    setDefinedNames,
}
