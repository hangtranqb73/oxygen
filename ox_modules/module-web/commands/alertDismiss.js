/*
 * Copyright (C) 2015-present CloudBeat Limited
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 */
 
/**
 * @summary Dismisses an alert or a confirmation dialog.
 * @description In case of an alert box this command is identical to `alertAccept`.
 * @function alertDismiss
 * @example <caption>[javascript] Usage example</caption>
 * web.init();//Opens browser session
 * web.open("www.yourwebsite.com");// Opens a website.
 * web.click("id=SaveButton");//Clicks on save – an alert would pop up
 * web.alertDismiss();//Clicks on Cancel in the alert dialog.
 */
module.exports = function() {
    try {
        this.driver.dismissAlert();
    } catch (e) {
        if (e.name === 'no such alert') {
            throw new this.OxError(this.errHelper.errorCode.NO_ALERT_OPEN_ERROR);
        } else {
            throw e;
        }
    }
};
