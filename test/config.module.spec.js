const assert = require('assert');

describe('Config Module', function () {
  it('should return default port', function () {
    delete require.cache[require.resolve('../app/modules/config')];
    const config = require('../app/modules/config');
    assert.equal(config.port, config.DEFAULT_PORT);
  });

  it('should return port from environment', function () {
    const PORT = 555;
    process.env['PORT'] = PORT;
    delete require.cache[require.resolve('../app/modules/config')];
    const config = require('../app/modules/config');
    assert.equal(config.port, PORT);
  });
});
