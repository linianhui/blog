function valueToNumber(value) {
    return numeral(value);
}

function valueToMoment(value) {
    var number = valueToNumber(value).value();
    var input = number || value;
    var result = moment(input);
    if (result.isValid()) {
        return result;
    }
}

function valueToMomentBeiJing(value) {
    var time = valueToMoment(value);
    if (time) {
        return time.utcOffset("+08:00");
    }
}

function valueToBeiJingDateTime(value) {
    var time = valueToMomentBeiJing(value);
    if (time) {
        return time.format();
    }
}

function valueToLocalDateTime(value) {
    var time = valueToMoment(value);
    if (time) {
        return time.format();
    }
}

function valueToUtcDateTime(value) {
    var time = valueToMoment(value);
    if (time) {
        return time.utc().format();
    }
}

function valueToUnixTimestamp(value) {
    var time = valueToMoment(value);
    if (time) {
        return time.format('X');
    }
}

function valueToUnixTimestampMs(value) {
    var time = valueToMoment(value);
    if (time) {
        return time.format('x');
    }
}

function valueToDayOfYear(value) {
    var time = valueToMomentBeiJing(value);
    if (time) {
        return time.dayOfYear();
    }
}

function valueToWeekOfYear(value) {
    var time = valueToMomentBeiJing(value);
    if (time) {
        return time.weeks();
    }
}

function valueToObjectId(value) {
    if (ObjectID.isValid(value)) {
        var objectId = ObjectID.createFromHexString(value);
        var time = objectId.getTimestamp();
        return "time:" + valueToBeiJingDateTime(time);
    }
}

function valueToMD5(value) {
    return MD5(value + '');
}

function valueToBase64(value) {
    return Base64.encode(value);
}

function valueToBase64Uri(value) {
    return Base64.encodeURI(value);
}

function fromBase64(value) {
    return Base64.decode(value);
}

var functionList = {
    "本地时间": valueToLocalDateTime,
    "北京时间": valueToBeiJingDateTime,
    "UTC+00:00": valueToUtcDateTime,
    "北京时间 一年中的第几天": valueToDayOfYear,
    "北京时间 一年中的第几周": valueToWeekOfYear,
    "MD5": valueToMD5,
    //"ObjectId": valueToObjectId,
    "Unix Timestamp": valueToUnixTimestamp,
    "Unix Timestamp Milliseconds": valueToUnixTimestampMs,
    "Base64": valueToBase64,
    "Base64 Uri": valueToBase64Uri,
    "Base64 解码": fromBase64
};