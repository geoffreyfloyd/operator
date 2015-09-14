// Syntactic Sugar for Array Comparisons without messing up the array prototype

var those = function (array) {
    return extend(array);
}

var extend = function (array) {
    // extend array with collection-based functions
    array.hasAll = hasAll;
    array.hasAny = hasAny;
    array.hasOnly = hasOnly;
    array.like = like;
    
    return array;
}

var hasAll = function (matchArray) {
    for (var i = 0; i < matchArray.length; i++) {
        var matched = false;
        for (var j = 0; j < this.length; j++) {
            if (matchArray[i] === this[j]) {
                matched = true;
            }     
        }
        if (!matched) {
            return false;
        }
    }
    return true;
};

var hasAny = function (matchArray) {
    for (var i = 0; i < matchArray.length; i++) {
        for (var j = 0; j < this.length; j++) {
            if (matchArray[i] === this[j]) {
                return true;
            }     
        } 
    }
    return false;
};

var hasOnly = function (matchArray) {
    // Must be the same length
    if (this.length !== matchArray.length) {
        return false;
    }
    
    for (var i = 0; i < matchArray.length; i++) {
        var matched = false;
        for (var j = 0; j < this.length; j++) {
            if (matchArray[i] === this[j]) {
                matched = true;
            }     
        }
        if (!matched) {
            return false;
        }
    }
    
    // All elements matched
    return true;
};

var isArray = function(arg) {
    return Object.prototype.toString.call(arg) === '[object Array]';
};

var isObject = function(arg) {
    return Object.prototype.toString.call(arg) === '[object Object]';
};

var like = function (matchObj) {
    var matches = [];
    for (var i = 0; i < this.length; i++) {
        // We assume it matches until we prove it doesn't
        var isLike = true;
        for (var matchProp in matchObj) {
            if (matchObj.hasOwnProperty(matchProp)) {
                var t = typeof matchObj[matchProp];
                if (t !== typeof this[i][matchProp]) {
                    isLike = false;
                    break;
                }
                if (isArray(matchObj[matchProp]) && !those(matchObj[matchProp]).hasOnly(this[i][matchProp])) {
                    isLike = false;
                    break;
                }
                else if (String(matchObj[matchProp]) !== String(this[i][matchProp])) {
                    isLike = false;
                    break;
                }
            }
        }
        // If all match props matched, then add to result
        if (isLike) {
            matches.push(this[i]);
        }
    }
    // Return new array of matched items
    return extend(matches);
};

module.exports = exports = those;
