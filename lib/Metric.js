'use strict';

const _ = require('lodash');
const EventsD = require('eventsd');
const nano = require('nano-time');

class Metric {
  constructor(options = {}) {
    this.events = new EventsD(options);
  }

  /**
   * Send a metric event to eventsD
   *
   * @param {String} name - name of the event
   * @param {Number} value - value for event
   * @param {Metric.AGG_TYPE.} aggType - the aggregation type for this metric
   * @param {Object|null} [meta={}] Extra meta data to attach to event
   * @param {String} [time=Current Time] the ISO 8601 time of event, defaults to current time
   * @param {Object} [extra] Extra data to append to eventsD message
   * @returns {Promise}
   */
  send(name, value, aggType, meta = {}, time = (new Date()).toISOString(), extra = {}) {
    return new Promise((resolve, reject) => {
      if (!name) {
        reject(new Error('name is required'));
        return;
      }

      if (!_.isNumber(value)) {
        reject(new Error(`value ${value} is not a Number`));
        return;
      }

      if (!_.isString(aggType) || !aggType) {
        reject(new Error(`aggregation type ${aggType} is not supported`));
        return;
      }

      let msg = _.merge({
        name,
        value,
        aggType,
        meta: _.merge({}, meta),
        time,
        nanoseconds: nano()
      }, extra);

      this.events.send('metric', msg, (err) => {
        if (err) {
          reject(err);
          return;
        }

        resolve();
      });
    });
  }

  /**
   * Increment a counter
   *
   * @param {String} name - name of the event
   * @param {Number} value - value for event
   * @param {Object|null} [meta={}] Extra meta data to attach to event
   * @param {String} [time=Current Time] the ISO 8601 time of event, defaults to current time
   * @param {Object} [extra] Extra data to append to eventsD message
   * @returns {Promise}
   */
  increment(name, value = 1, meta = {}, time = (new Date()).toISOString(), extra = {}) {
    return this.send(name, value, Metric.AGG_TYPE.SUM, meta, time, extra);
  }

  /**
   * Decrement a counter
   *
   * @param {String} name - name of the event
   * @param {Number} value - value for event
   * @param {Object|null} [meta={}] Extra meta data to attach to event
   * @param {String} [time=Current Time] the ISO 8601 time of event, defaults to current time
   * @param {Object} [extra] Extra data to append to eventsD message
   * @returns {Promise}
   */
  decrement(name, value = 1, meta = {}, time = (new Date()).toISOString(), extra = {}) {
    return this.increment(name, (value * -1), meta, time, extra);
  }

  /**
   * Track the minimum value
   *
   * @param {String} name - name of the event
   * @param {Number} value - value for event
   * @param {Object|null} [meta={}] Extra meta data to attach to event
   * @param {String} [time=Current Time] the ISO 8601 time of event, defaults to current time
   * @param {Object} [extra] Extra data to append to eventsD message
   * @returns {Promise}
   */
  min(name, value, meta = {}, time = (new Date()).toISOString(), extra = {}) {
    return this.send(name, value, Metric.AGG_TYPE.MIN, meta, time, extra);
  }

  /**
   * Track the maximum value
   *
   * @param {String} name - name of the event
   * @param {Number} value - value for event
   * @param {Object|null} [meta={}] Extra meta data to attach to event
   * @param {String} [time=Current Time] the ISO 8601 time of event, defaults to current time
   * @param {Object} [extra] Extra data to append to eventsD message
   * @returns {Promise}
   */
  max(name, value, meta = {}, time = (new Date()).toISOString(), extra = {}) {
    return this.send(name, value, Metric.AGG_TYPE.MAX, meta, time, extra);
  }

  /**
   * Track the mean/average value
   *
   * @param {String} name - name of the event
   * @param {Number} value - value for event
   * @param {Object|null} [meta={}] Extra meta data to attach to event
   * @param {String} [time=Current Time] the ISO 8601 time of event, defaults to current time
   * @param {Object} [extra] Extra data to append to eventsD message
   * @returns {Promise}
   */
  mean(name, value, meta = {}, time = (new Date()).toISOString(), extra = {}) {
    return this.send(name, value, Metric.AGG_TYPE.MEAN, meta, time, extra);
  }

  average(...args) {
    this.mean(...args);
  }

  /**
   * A gauge stat is always set to the last value that it was set too
   *
   * @param {String} name - name of the event
   * @param {Number} value - value for event
   * @param {Object|null} [meta={}] Extra meta data to attach to event
   * @param {String} [time=Current Time] the ISO 8601 time of event, defaults to current time
   * @param {Object} [extra] Extra data to append to eventsD message
   * @returns {Promise}
   */
  gauge(name, value, meta = {}, time = (new Date()).toISOString(), extra = {}) {
    return this.send(name, value, Metric.AGG_TYPE.GAUGE, meta, time, extra);
  }

  /**
   * Track the mean, standard deviation, min, max, and count of the values
   *
   * @param {String} name - name of the event
   * @param {Number} value - value for event
   * @param {Object|null} [meta={}] Extra meta data to attach to event
   * @param {String} [time=Current Time] the ISO 8601 time of event, defaults to current time
   * @param {Object} [extra] Extra data to append to eventsD message
   * @returns {Promise}
   */
  timing(name, value, meta = {}, time = (new Date()).toISOString(), extra = {}) {
    return this.send(name, value, Metric.AGG_TYPE.TIMING, meta, time, extra);
  }

  /**
   * Track the count of unique values
   *
   * @param {String} name - name of the event
   * @param {Number} value - value for event
   * @param {Object|null} [meta={}] Extra meta data to attach to event
   * @param {String} [time=Current Time] the ISO 8601 time of event, defaults to current time
   * @param {Object} [extra] Extra data to append to eventsD message
   * @returns {Promise}
   */
  unique(name, value, meta = {}, time = (new Date()).toISOString(), extra = {}) {
    return this.send(name, value, Metric.AGG_TYPE.UNIQUE, meta, time, extra);
  }
}

/**
 * Aggregation Types
 * @type {Object}
 */
Metric.AGG_TYPE = Object.freeze({
  SUM: 'sum',
  MIN: 'min',
  MAX: 'max',
  MEAN: 'mean',
  TIMING: 'timing',
  GAUGE: 'gauge',
  UNIQUE: 'unique'
});

module.exports = Metric;