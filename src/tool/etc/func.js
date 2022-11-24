function valueToMoment(value) {
    return moment(value);
}

function valueToBeiJingDateTime(value) {
    var time = valueToMoment(value);
    if (time.isValid()) {
        return time.format();
    } else {
        return "无效的时间";
    }
}

function valueToUtcDateTime(value) {
    var time = valueToMoment(value);
    if (time.isValid()) {
        return time.utc().format();
    } else {
        return "无效的时间";
    }
}

function valueToObjectId(value) {
    if (ObjectID.isValid(value)) {
        var objectId = ObjectID.createFromHexString(value);
        var time = objectId.getTimestamp();
        return "time:" + valueToBeiJingDateTime(time);
    } else {
        return "无效的ObjectID";
    }
}

function valueToMD5(value) {
    return MD5(value + '');
}

var functionList = {
    "北京时间+08:00": valueToBeiJingDateTime,
    "UTC+00:00": valueToUtcDateTime,
    "MD5": valueToMD5,
    "ObjectId": valueToObjectId
};