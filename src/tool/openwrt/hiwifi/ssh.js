var HIWIFI_GET_UUID_PATH = '/cgi-bin/turbo/proxy/router_info';
var HIWIFI_GET_LOCAL_TOKEN_PATH = '/local-ssh/api?method=get';
var HIWIFI_OPEN_SSH_PATH = '/local-ssh/api?method=valid&data=';
var HIWIFI_CLOSE_SSH_PATH = '/local-ssh/api?method=stop';

function buildOpenSshUrl(domain, cloud_token) {
    return 'http://' + domain + HIWIFI_OPEN_SSH_PATH + cloud_token;
}

function buildCloseSshUrl(domain) {
    return 'http://' + domain + HIWIFI_CLOSE_SSH_PATH;
}

function buildGetUuidUrl(domain) {
    return 'http://' + domain + HIWIFI_GET_UUID_PATH;
}

function buildGetLocalTokenUrl(domain) {
    return 'http://' + domain + HIWIFI_GET_LOCAL_TOKEN_PATH;
}

function testCalcColudToken() {
    var cloud_token = "S0TDW5MfrN7arOudcbLFp6TPXFk=";
    var uuid = "f2147486-3a95-11e6-8cf9-d4ee07403486";
    var local_token = "RDRFRTA3NDAzNDg2LHNzaCwxNjAxNjQ0MDUzNTkzLJCOAsHPBEprnOkeq0pArtjukT5r";
    var result = calcCloudToken(uuid, local_token);
    console.log("testCalcColudToken", cloud_token === result);
}

function calcCloudToken(uuid, local_token) {
    if (!uuid || !local_token) {
        return;
    }
    var key = calcCloudTokenKeyHex(uuid);
    var data = calcCloudTokenDataUtf8(local_token);
    var result = calcCloudTokenCore(key, data);
    console.log("input-uuid", uuid, 'input-local_token', local_token, 'output-cloud_token', result);
    return result;
}

function calcCloudTokenKeyHex(uuid) {
    if (!uuid) {
        return;
    }
    var sha1 = CryptoJS.SHA1(uuid);
    var result = CryptoJS.enc.Hex.stringify(sha1);
    console.log('input-uuid', uuid, 'output-hex', result);
    return result;
}

function calcCloudTokenDataUtf8(local_token) {
    if (!local_token) {
        return;
    }
    var usedLocalTokenBase64 = local_token.substring(0, 40);
    var usedLocalTokenArray = CryptoJS.enc.Base64.parse(usedLocalTokenBase64);
    var usedLocalTokenUtf8 = CryptoJS.enc.Utf8.stringify(usedLocalTokenArray);
    var time = usedLocalTokenUtf8.substring(17, 40);
    var timeAdd1 = parseInt(time, 10) + 1;
    var result = usedLocalTokenUtf8.replace(time, timeAdd1);
    console.log("input-local_token", local_token, 'output-data', result);
    return result;
}

function calcCloudTokenCore(keyHex, dataUtf8) {
    if (!keyHex || !dataUtf8) {
        return;
    }
    var key = CryptoJS.enc.Hex.parse(keyHex);
    var data = CryptoJS.enc.Utf8.parse(dataUtf8);
    var hmac = CryptoJS.HmacSHA1(data, key);
    var result = CryptoJS.enc.Base64.stringify(hmac);
    console.log('input-key', keyHex, 'input-data', dataUtf8, 'output-cloud_token', result);
    return result;
}