eventsd-metric
====================

A library for sending metrics with EventsD

Usage
====================

``` js
    var Metric = require('eventsd-metric');

    var metric = new Metric();

    // Returns a promise
    metric.increment('my.metric', 1);
```

## Methods

All methods of the `Metric` class return a promise.

Several convience methods are available for specifiing the type of aggregation that should be used for a metric.

**Methods:**

* `increment` - simple counter
* `decrement` - simple counter
* `min`
* `max`
* `mean`
* `gauge` - last value wins (and persists)
* `timing` - track mean, standard deviation, min, max, and count
* `unique` - count of unique values

## Options

See [EventsD](https://github.com/sazze/node-eventsd) options

## Environment Variables

See [EventsD](https://github.com/sazze/node-eventsd) environment variables

Run Tests
====================

```
  npm test
```

====================

#### Author: [Craig Thayer](https://github.com/cthayer)

#### License: ISC

See LICENSE for the full license text.
