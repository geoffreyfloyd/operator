// Syntactic Sugar for Array Comparisons

var those = function (array) {
    return new These(array);
}

var Those = function (array) {
    this.array = array;
}

Those.prototype = {
    hasThese: function (matchArray) {
        for (var i = 0; i < matchArray.length; i++) {
            var matched = false;
            for (var j = 0; j < this.array.length; j++) {
                if (matchArray[i] === this.array[j]) {
                    matched = true;
                }     
            }
            if (!matched) {
                return false;
            }
        }
        return true;
    },
    hasAnyOfThese: function (matchArray) {
        for (var i = 0; i < matchArray.length; i++) {
            for (var j = 0; j < this.array.length; j++) {
                if (matchArray[i] === this.array[j]) {
                    return true;
                }     
            } 
        }
        return false;
    }
};

module.exports = exports = those;
