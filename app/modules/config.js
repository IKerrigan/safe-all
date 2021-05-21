const DEFAULT_PORT = 3000;

module.exports = {
  port: process.env['PORT'] || DEFAULT_PORT,
  DEFAULT_PORT,
};
