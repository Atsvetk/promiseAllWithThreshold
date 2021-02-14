'use strict';

const {promiseAllWithThreshold, promiseDelayFulfil, promiseDelayReject} = require('../lib.methods');

// Let's use promises for every test in this suite:

describe("Input data checks", function () {

    it("Empty array check", function() {
        return promiseAllWithThreshold([], 1)
        .then(res => 
            expect(res).toEqual([])
        )
    });

    it("Negative threshold check", function() {
        return promiseAllWithThreshold([], -1)
        .catch(error => 
            expect(error).toEqual('Threshold should be an integer >= 0, got -1')
        )
    });

    it("Float threshold check", function() {
        return promiseAllWithThreshold([], 0.123)
        .catch(error => 
            expect(error).toEqual('Threshold should be an integer >= 0, got 0.123')
        )
    });

    it("NaN threshold check", function() {
        return promiseAllWithThreshold([], 'abc')
        .catch(error => 
            expect(error).toEqual('Threshold should be an integer >= 0, got abc')
        )
    })

});

// Now let's use async/await for those tests where promiseAllWithThreshold is expected to be resolved (otherwise use promises for the test not to fail):

describe("Function behaviour checks", function () {

    it("Threshold is greater than number of rejected promises", async function() {
        const res = await promiseAllWithThreshold([
            promiseDelayFulfil('Value1', 1),
            Promise.reject('RejectReason2'),
            promiseDelayFulfil('Value3', 1)
        ], 2)
        expect(res).toEqual(['Value1', 'ERROR: RejectReason2', 'Value3'])        
    });

    it("Threshold is greater than number of rejected promises (all promises are rejected)", async function() {
        const res = await promiseAllWithThreshold([
            Promise.reject('RejectReason1'),
            Promise.reject('RejectReason2'),
            promiseDelayReject('RejectReason3', 2),
            Promise.reject('RejectReason4'),
        ], 5)
        expect(res).toEqual(['ERROR: RejectReason1', 'ERROR: RejectReason2', 'ERROR: RejectReason3', 'ERROR: RejectReason4'])        
    });

    it("Threshold is equal to number of rejected promises", async function() {
        const res = await promiseAllWithThreshold([
            promiseDelayFulfil('Value1', 1),
            Promise.reject('RejectReason2'),
            promiseDelayFulfil('Value3', 1),
            promiseDelayReject('RejectReason4', 2)
        ], 2)
        expect(res).toEqual(['Value1', 'ERROR: RejectReason2', 'Value3', 'ERROR: RejectReason4'])        
    });

    it("Threshold is less than number of rejected promises", function() {
        return promiseAllWithThreshold([
            promiseDelayFulfil('Value1', 1),
            Promise.reject('RejectReason2'),
            promiseDelayFulfil('Value3', 1)
        ], 0)
        .catch(error => 
            expect(error).toEqual('Threshold has been reached')
        )
    });

})