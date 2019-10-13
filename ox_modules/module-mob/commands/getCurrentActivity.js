/*
 * Copyright (C) 2015-present CloudBeat Limited
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 */

/**
 * @summary Gets current Android app's activity name.
 * @function getCurrentActivity
 * @for android
 * @example <caption>[javascript] Usage example</caption>
 * mob.init(caps); // Starts a mobile session and opens app from desired capabilities
 * let activity = mob.getCurrentActivity(); // Gets current Android activity.
*/
module.exports = function() {
    return this.driver.getCurrentActivity();
};
