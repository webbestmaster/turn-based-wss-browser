/* global describe, it, chai */

const goodApple = {
    skin: 'thin',
    colors: ['red', 'green', 'yellow'],
    taste: 10
};

const badApple = {
    colors: ['brown'],
    taste: 0,
    worms: 2
};

const fruitSchema = {
    title: 'fresh fruit schema v1',
    type: 'object',
    required: ['skin', 'colors', 'taste'],
    properties: {
        colors: {
            type: 'array',
            minItems: 1,
            uniqueItems: true,
            items: {
                type: 'string'
            }
        },
        skin: {
            type: 'string'
        },
        taste: {
            type: 'number',
            minimum: 5
        }
    }
};

describe('json', () => {
    it('should check json', () => {
        chai.expect(goodApple).to.be.jsonSchema(fruitSchema);
        chai.expect(badApple).to.not.be.jsonSchema(fruitSchema);

        chai.assert.jsonSchema(goodApple, fruitSchema);
        chai.assert.notJsonSchema(badApple, fruitSchema);
    });
});


