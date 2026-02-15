const updateReferences = function(obj, changes) {
    const set = {};

    // Properties to be updated
    let properties = ['style','meta','comments','cells','mergeCells'];
    properties.forEach((v) => {
        let values = obj.instance.worksheets[obj.worksheetIndex].options[v];
        if (values && Object.keys(values).length > 0) {
            set[`spreadsheet.worksheets.${obj.worksheetIndex}.${v}`] = values;
        }
    });
    changes.push({ $set: set })
}

const moveArrayItems = function(array, from, to, quantity) {
    const movedItems = array.splice(from, quantity);

    while (movedItems.length < quantity) {
        movedItems.push(null);
    }

    const insertAt = from < to ? to - quantity + 1 : to;

    while (array.length < insertAt) {
        array.push(null);
    }

    array.splice(insertAt, 0, ...movedItems);
}

const dataIsMatrix = function(data) {
    let dataLength = data.length;
    for (let i = 0; i < dataLength; i++) {
        if (data[i]) {
            return Array.isArray(data[i]);
        }
    }

    return null;
}

module.exports = {
    updateReferences,
    moveArrayItems,
    dataIsMatrix,
}