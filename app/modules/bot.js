const TelegramBot = require('node-telegram-bot-api');
const https = require('https');
const request = require('request');
const storage = require('./storage');

var _ = require('lodash');
var _ = require('lodash/core');
var fp = require('lodash/fp');
var array = require('lodash/array');

const token = process.env.BOT_TOKEN;
const bot = new TelegramBot(token, { polling: true });

bot.onText(/\/start/, (msg, match) => {
  const chatId = msg.chat.id;
  const username = msg.chat.username;

  storage.User.findOne({ tlgUser: msg.chat.username }).then((user) => {
    if (!user) {
      bot.sendMessage(
        chatId,
        'Visit our site and connect your telegram account'
      );
    } else {
      bot.sendMessage(chatId, 'Welcome @' + username);
    }
  });
});

bot.onText(/\/buy (.+)/, (msg, match) => {
  const chatId = msg.chat.id;
  const resp = match[1];

  storage.Account.findOne({ _id: resp }).then((acc) => {
    if (acc) {
      storage.User.findOne({ _id: acc.authorId }).then((user) => {
        if (user) {
          bot.sendMessage(
            chatId,
            'Please contact @' +
              user.tlgUser +
              ' in order to buy requested account'
          );
          //bot.sendMessage(tlgUser.id , msg.chat.username + "interested in your account.Please contact customer.");
        }
      });
    }
  });
});

bot.onText(/\/remind (.+)/, (msg, match) => {
  const chatId = msg.chat.id;
  const page = match[1];

  if (msg.chat.username) {
    storage.User.findOne({ tlgUser: msg.chat.username }).then((user) => {
      if (user) {
        storage.Account.find({ authorId: user._id }, (err, data) => {
          let temp;
          temp = array.chunk(data, 3);

          let prevPage = Number.parseInt(page - 1);
          if (prevPage === -1) {
            prevPage = 0;
          }
          let res;

          if (temp.length >= page) {
            let obj = {
              accounts: temp[page],
              page: page,
              nextPage: '/remind ' + Number.parseInt(page * 1 + 1),
              prevPage: '/remind ' + prevPage,
            };
            bot.sendMessage(chatId, JSON.stringify(obj));
          } else {
            bot.sendMessage(chatId, {
              err: 'No such page',
              help: 'Try link in prevPage',
              prevPage: '/remind ' + prevPage,
            });
          }
        });
      } else {
        bot.sendMessage(chatId, 'Error occured');
      }
    });
  } else {
    bot.sendMessage(chatId, 'Not authorized');
  }
});
