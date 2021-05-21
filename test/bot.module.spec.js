const { once } = require('events');
const assert = require('assert');

const botModule = require('../app/modules/bot');

describe('Bot Module', function () {
  this.timeout(10000);

  const bot = new botModule.TelegramBot('test');

  it('check that on text is emitted', async function () {
    bot.onText('text', () => true);
    const res = once(bot, 'text');
    bot.emit('text', 'test1');
    assert.equal('test1', (await res)[0]);
  });
});
