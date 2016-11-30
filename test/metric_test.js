'use strict';

const should = require('should');
const Metric = require('../');
const EventsD = require('eventsd');
const dgram = require('dgram');

const testPort = 8150;

describe('Metric', () => {
  it('should export', () => {
    should.exist(Metric);
    should.exist(Metric.AGG_TYPE);

    Metric.AGG_TYPE.should.be.an.Object;
    Metric.AGG_TYPE.should.have.property('SUM');
    Metric.AGG_TYPE.SUM.should.equal('sum');
    Metric.AGG_TYPE.should.have.property('MIN');
    Metric.AGG_TYPE.MIN.should.equal('min');
    Metric.AGG_TYPE.should.have.property('MAX');
    Metric.AGG_TYPE.MAX.should.equal('max');
    Metric.AGG_TYPE.should.have.property('MEAN');
    Metric.AGG_TYPE.MEAN.should.equal('mean');
    Metric.AGG_TYPE.should.have.property('TIMING');
    Metric.AGG_TYPE.TIMING.should.equal('timing');
    Metric.AGG_TYPE.should.have.property('GAUGE');
    Metric.AGG_TYPE.GAUGE.should.equal('gauge');
    Metric.AGG_TYPE.should.have.property('UNIQUE');
    Metric.AGG_TYPE.UNIQUE.should.equal('unique');
  });

  it('should instanciate', () => {
    let metric = new Metric();

    should.exist(metric);

    metric.should.be.instanceOf(Metric);

    metric.should.have.property('events');
    metric.events.should.be.an.Object;
    metric.events.should.be.instanceOf(EventsD);

    metric.should.have.property('increment');
    metric.increment.should.be.a.function;
    metric.should.have.property('decrement');
    metric.decrement.should.be.a.function;
    metric.should.have.property('min');
    metric.min.should.be.a.function;
    metric.should.have.property('max');
    metric.max.should.be.a.function;
    metric.should.have.property('mean');
    metric.mean.should.be.a.function;
    metric.should.have.property('average');
    metric.average.should.be.a.function;
    metric.should.have.property('gauge');
    metric.gauge.should.be.a.function;
    metric.should.have.property('timing');
    metric.timing.should.be.a.function;
    metric.should.have.property('unique');
    metric.unique.should.be.a.function;
  });

  it('should send a metric message', (done) => {
    let metric = new Metric({port: testPort});

    let server = createTestServer(testPort, (data) => {
      let msg = JSON.parse(data);

      should.exist(msg);
      msg.should.be.an.Object;

      msg.should.have.property('msg');
      msg.msg.should.be.an.Object;

      msg.msg.should.have.property('name');
      msg.msg.name.should.equal('test');
      msg.msg.should.have.property('value');
      msg.msg.value.should.equal(1);
      msg.msg.should.have.property('aggType');
      msg.msg.aggType.should.equal(Metric.AGG_TYPE.SUM);
      msg.msg.should.have.property('meta');
      msg.msg.meta.should.eql({});
      msg.msg.should.have.property('time');
      msg.msg.should.have.property('nanoseconds');

      server.close(done);
    });

    metric.send('test', 1, Metric.AGG_TYPE.SUM);
  });

  it('should error without name', () => {
    let metric = new Metric();

    return metric.send().should.be.rejectedWith('name is required');
  });

  it('should error without value', () => {
    let metric = new Metric();

    return metric.send('test').should.be.rejectedWith('value undefined is not a Number');
  });

  it('should error without aggregation type', () => {
    let metric = new Metric();

    return metric.send('test', 1).should.be.rejectedWith('aggregation type undefined is not supported');
  });

  it('should error with invalid aggregation type', () => {
    let metric = new Metric();

    return metric.send('test', 1, 1).should.be.rejectedWith('aggregation type 1 is not supported');
  });
});

function createTestServer(port, onMessage) {
  var server = dgram.createSocket('udp4');

  server.on("error", function (err) {
    console.log("server error:\n" + err.stack);
    server.close();
  });

  server.on("message", onMessage);

  server.on("listening", function () {
    //var address = server.address();
    //console.log("server listening " +
    //  address.address + ":" + address.port);
  });

  server.bind(port);

  return server;
}