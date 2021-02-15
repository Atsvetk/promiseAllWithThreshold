'use strict';

const {promiseAllWithThreshold, promiseDelayFulfil, promiseDelayReject} = require('../lib.methods');

// Let's use promises for every test in this suite:

describe("Input data checks", function () {

    it("Empty array check", function() {
        return promiseAllWithThreshold([], 1)
        .then(res => 
            expect(res).toEqual([])
        )
        .catch(error =>
            fail(`Expected promiseAllWithThreshold to be fulfilled, but it was rejected with the following error: ${JSON.stringify(error)}`)
        )
    });

    it("Negative threshold check", function() {
        return promiseAllWithThreshold([], -1)
        .then(res => 
            fail(`Expected promiseAllWithThreshold to be rejected, but it was fulfilled with the following value: ${JSON.stringify(error)}`)
        )
        .catch(error => 
            expect(error).toEqual('Threshold should be an integer >= 0, got -1')
        )
    });

    it("Float threshold check", function() {
        return promiseAllWithThreshold([], 0.123)
        .then(res => 
            fail(`Expected promiseAllWithThreshold to be rejected, but it was fulfilled with the following value: ${JSON.stringify(error)}`)
        )
        .catch(error => 
            expect(error).toEqual('Threshold should be an integer >= 0, got 0.123')
        )
    });

    it("NaN threshold check", function() {
        return promiseAllWithThreshold([], 'abc')
        .then(res => 
            fail(`Expected promiseAllWithThreshold to be rejected, but it was fulfilled with the following value: ${JSON.stringify(error)}`)
        )
        .catch(error => 
            expect(error).toEqual('Threshold should be an integer >= 0, got abc')
        )
    })

});

// Now let's use async/await:

describe("Function behaviour checks", function () {

    it("Threshold is greater than number of rejected promises", async function() {
        try {
            const res = await promiseAllWithThreshold([
                promiseDelayFulfil('Value1', 1),
                Promise.reject('RejectReason2'),
                promiseDelayFulfil('Value3', 1)
            ], 2)
            expect(res).toEqual(['Value1', 'ERROR: RejectReason2', 'Value3'])    
        } catch (error) {
            fail(`Expected promiseAllWithThreshold to be fulfilled, but it was rejected with the following error: ${JSON.stringify(error)}`)
        }  
    });

    it("Threshold is greater than number of rejected promises (all promises are rejected)", async function() {
        try {
            const res = await promiseAllWithThreshold([
                Promise.reject('RejectReason1'),
                Promise.reject('RejectReason2'),
                promiseDelayReject('RejectReason3', 2),
                Promise.reject('RejectReason4'),
            ], 5)
            expect(res).toEqual(['ERROR: RejectReason1', 'ERROR: RejectReason2', 'ERROR: RejectReason3', 'ERROR: RejectReason4'])  
        } catch (error) {
            fail(`Expected promiseAllWithThreshold to be fulfilled, but it was rejected with the following error: ${JSON.stringify(error)}`)
        }
    });

    it("Threshold is equal to number of rejected promises", async function() {
        try {
            const res = await promiseAllWithThreshold([
                promiseDelayFulfil('Value1', 1),
                Promise.reject('RejectReason2'),
                promiseDelayFulfil('Value3', 1),
                promiseDelayReject('RejectReason4', 2)
            ], 2)
            expect(res).toEqual(['Value1', 'ERROR: RejectReason2', 'Value3', 'ERROR: RejectReason4'])
        } catch (error) {
            fail(`Expected promiseAllWithThreshold to be fulfilled, but it was rejected with the following error: ${JSON.stringify(error)}`)
        } 
    });

    it("Threshold is less than number of rejected promises", async function() {
        try {
            const res = await promiseAllWithThreshold([
                promiseDelayFulfil('Value1', 1),
                Promise.reject('RejectReason2'),
                promiseDelayFulfil('Value3', 1)
            ], 0)
            fail(`Expected promiseAllWithThreshold to be rejected, but it was fulfilled with the following value: ${JSON.stringify(error)}`)
        } catch (error) {
            expect(error).toEqual('Threshold has been reached')
        }
    });
})