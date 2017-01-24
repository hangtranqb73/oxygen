/**
 * @summary Asserts the page title.
 * @function assertTitle
 * @param {String} pattern - The assertion pattern.
 * @param {String} message - The message to be displayed in case of assert failure.
 */
const chai = require('chai');
const assert = chai.assert;

module.exports = function(pattern, message) {
	var title = this._driver.getTitle();
	if (!pattern || typeof pattern !== 'string')
		return;		// TODO throw InvalidArgumentError
	if (pattern.indexOf('regex:') == 0) {
		var regex = new RegExp(pattern.substring('regex:'.length));
		assert.match(title, regex, message);
	}
	else {
		assert.equal(title, pattern, message);
	}
};
