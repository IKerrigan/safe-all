const mongoose = require('mongoose');
const assert = require('assert');

const storage = require('../app/modules/storage');

describe('Storage Module', function () {
  it('objId should 0 by default', function () {
    assert.equal(storage.objId, 0);
  });
  it('objId should be more after mutation', function () {
    storage.objId++;
    assert.equal(storage.objId, 1);
    // return to default state
    storage.objId = 0;
  });
  it('user should be created successfully', function () {
    const username = 'test';
    const password = 'pass';
    const tlgUser = 'user';
    const avatar = 'avatar';
    const email = 'test@test.com';
    const role = 'vip';

    const user = new storage.User({
      username,
      password,
      tlgUser,
      avatar,
      email,
      role,
    });

    assert.equal(user.username, username);
    assert.equal(user.password, password);
    assert.equal(user.tlgUser, tlgUser);
    assert.equal(user.avatar, avatar);
    assert.equal(user.email, email);
    assert.equal(user.role, role);
  });

  it('account should be created successfully', function () {
    const description = 'desc';
    const title = 'title';

    const account = new storage.Account({
      description,
      title,
    });

    assert.equal(account.description, description);
    assert.equal(account.title, title);
  });
});
