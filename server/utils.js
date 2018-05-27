'use strict'

exports.distribution = function(number) {
    var dists = []
    var remaining = 1
    for(var i = 0; i < number; i++) {
        var rand = Math.random()
        dists.push(rand)
        remaining -= rand
        if(remaining <= 0) {
            remaining = 0



}
