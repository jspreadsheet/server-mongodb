const setMedia = function(obj) {
    let mediaChanges = obj.args[0];

    if (!Array.isArray(mediaChanges)) {
        mediaChanges = [mediaChanges];
    }

    const set = {};
    const pull = [];
    const push = [];

    let media = obj.document.spreadsheet.worksheets[obj.worksheetIndex].media;

    const mediaPath = `spreadsheet.worksheets.${obj.worksheetIndex}.media`;

    const mediaChangesLength = mediaChanges.length;
    for (let i = 0; i < mediaChangesLength; i++) {
        const item = mediaChanges[i];

        if (Object.keys(item).length !== 1) {
            const mediaIndex = media.findIndex((mediaItem) => mediaItem.id === item.id);

            if (mediaIndex > -1) {
                const entries = Object.entries(item);

                const mediaIndexPath = `${mediaPath}.${mediaIndex}`;

                const entriesLength = entries.length;
                for (let entryIndex = 0; entryIndex < entriesLength; entryIndex++) {
                    const entry = entries[entryIndex];

                    set[`${mediaIndexPath}.${entry[0]}`] = entry[1];
                }
            } else {
                push.push(item);
            }
        } else {
            pull.push(item.id);
        }
    }

    const result = {};

    if (Object.keys(set).length !== 0) {
        result['$set'] = set;
    }

    if (push.length !== 0) {
        result['$push'] = {
            [mediaPath]: {
                $each: push,
            },
        };
    }

    if (pull.length !== 0) {
        result['$pull'] = {
            [mediaPath]: {
                id: {
                    $in: pull,
                }
            },
        };
    }

    return result;
}

module.exports = {
    setMedia,
}
