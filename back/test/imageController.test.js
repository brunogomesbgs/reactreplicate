const app = require('../app');
const chai = require('chai');
const request = require('supertest');
const Replicate = require('replicate');
const sinon = require('sinon');

const expect = chai.expect;

describe('Image Controller API', function() {
    let replicateStub;

    beforeEach(function() {
        // We use a stub to avoid making actual calls to the Replicate API
        replicateStub = sinon.stub(Replicate.prototype, 'run');
    });

    afterEach(function() {
        // Restore the original function after each test
        replicateStub.restore();
    });

    it('should generate an image successfully', function(done) {
        const mockOutput = ['http://example.com/image.png'];
        replicateStub.resolves(mockOutput);

        request(app)
            .post('/api/images/generate')
            .send({ prompt: 'a test prompt' })
            .end(function(err, res) {
                expect(res.statusCode).to.equal(200);
                expect(res.body).to.be.an('object');
                expect(res.body).to.have.property('image').that.equals(mockOutput[0]);
                done();
            });
    });

    it('should return 400 for a missing prompt', function(done) {
        request(app)
            .post('/api/images/generate')
            .send({})
            .end(function(err, res) {
                expect(res.statusCode).to.equal(400);
                expect(res.body).to.have.property('message').that.includes('Prompt is required');
                done();
            });
    });

    it('should return 400 for an empty prompt', function(done) {
        request(app)
            .post('/api/images/generate')
            .send({ prompt: '  ' })
            .end(function(err, res) {
                expect(res.statusCode).to.equal(400);
                expect(res.body).to.have.property('message').that.includes('Prompt is required');
                done();
            });
    });

    it('should handle errors from Replicate API', function(done) {
        replicateStub.rejects(new Error('Replicate API Error'));

        request(app)
            .post('/api/images/generate')
            .send({ prompt: 'a prompt that will fail' })
            .end(function(err, res) {
                expect(res.statusCode).to.equal(500);
                expect(res.body).to.have.property('message').that.includes('Replicate API Error');
                done();
            });
    });
});
