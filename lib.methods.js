'use strict';

function promiseAllWithThreshold(arrayOfPromises, threshold) {
    
    return new Promise((fulfil, reject) => {   
        
        if( !Number.isInteger(threshold) || threshold < 0 ) reject(`Threshold should be an integer >= 0, got ${threshold}`);
     
        let pendingNum = arrayOfPromises.length;
        let rejectedNum = 0;
        let valuesAndErrors = [];
        if(arrayOfPromises.length == 0) fulfil(valuesAndErrors);
        for (let i = 0; i < arrayOfPromises.length; i++) {
            arrayOfPromises[i]
            .then(value => {
                valuesAndErrors[i] = value;
                pendingNum -= 1;
                if(pendingNum == 0) fulfil(valuesAndErrors)
            })
            .catch(error => {
                pendingNum -= 1;
                rejectedNum += 1;
                valuesAndErrors[i] = `ERROR: ${error}`;
                if(rejectedNum > threshold) reject('Threshold has been reached')
                else if(pendingNum == 0) fulfil(valuesAndErrors)
            })
        }
    })
}

function promiseDelayFulfil(value, seconds) {
    return new Promise(fulfil => setTimeout(() => fulfil(value), seconds * 1000))
}

function promiseDelayReject(error, seconds) {
    return new Promise( (fulfil, reject) => setTimeout(() => reject(error), seconds * 1000))
}

module.exports = {promiseAllWithThreshold, promiseDelayFulfil, promiseDelayReject}