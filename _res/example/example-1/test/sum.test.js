/* global describe, it, chai */

import sum from './../module/sum.js';

describe('sum', () => {
    it('should return sum of arguments', () => {
        chai.expect(sum(1, 2)).to.equal(3);
    });
});
