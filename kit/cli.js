'use strict';
// Entry points for `tmt art ...` and `tmt inspire ...`. Each receives the raw argv after
// its command and parses its own flags.

module.exports = {
  art: (argv) => require('./art-cli').main(argv),
  inspire: (argv) => require('./inspire').main(argv),
};
