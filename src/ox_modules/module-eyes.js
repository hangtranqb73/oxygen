/*
 * Copyright (C) 2015-present CloudBeat Limited
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 */

/**
 * Provides access to Applitools Eyes service.
 */
import { Eyes, Target } from '@applitools/eyes-webdriverio';

import OxygenModule from '../core/OxygenModule';
import ModuleError from '../errors/ModuleError';
import OxError from '../errors/OxygenError';
import errHelper from '../errors/helper';

const DEFAULT_VIEWPORT = {
    width: 1440,
    height: 900
};

export default class ApplitoolsModule extends OxygenModule {
    constructor(options, context, rs, logger, modules, services) {
        super(options, context, rs, logger, modules, services);
        // this module doesn't require calling init() method
        this.isInitialized = false;
        this._eyes = null;
    }
    /**
     * @summary Initializes Applitools Eyes session.
     * @function init
     * @param {string|object} module - A module name or a reference to the mododule to be associated with Eyes current session.
     * @param {apiKey} [apiKey] - An optional Applitools API Key. 
     * If this parameter is not provided, API Key must be specified in the test configuration file.
     */
    async init(module, apiKey = null) {
        this._eyesConfig = this.options.applitoolsOpts;
        if (!this.options.applitoolsOpts) {
            throw new ModuleError('Applitools settings are missing.');
        }
        this._viewport = Object.assign(DEFAULT_VIEWPORT, this._eyesConfig.viewport || {});
        this._apiKey = apiKey || this.options.applitoolsKey || this._eyesConfig.key || process.env.APPLITOOLS_KEY || null;

        if (!this._apiKey) {
            throw new ModuleError('API key is missing. To use Applitools service, you must specify Applitools API key.');
        }
        if (typeof module === 'string') {
            if (Object.prototype.hasOwnProperty.call(this.modules, module)) {
                module = this.modules[module];
            }
            else {
                throw new ModuleError(`Module not found: ${module}.`);
            }
        }
        if (typeof module.getDriver !== 'function') {
            throw new ModuleError(`The module "${module}" does not have "getDriver" function implemented.`);
        }
        const driver = module.getDriver();
        this._eyes = new Eyes();
        this._eyes.setApiKey(this._apiKey);
        const appName = this.options.appName || this.options.name;
        await driver.call(() => this._eyes.open(driver, this.options.name, appName, this._viewport));
        this.isInitialized = true;
    }
    /**
     * @summary Closes Applitools Eyes session, terminates the sequence of checkpoints, and then waits for and returns the test results.
     * @function dispose
     * @return {TestResult} Eyes test result.
     */
    async dispose() {
        if (!this.isInitialized || !this._eyes) {
            return;
        }
        let results = null;
        try {
            results = await this._eyes.close(false);
        }
        finally {
            this._eyes.abortIfNotClosed(); 
        }
        this._eyes = null;
        this.isInitialized = false;

        return results;
    }
    /**
     * @summary Preform visual validation for a certain target.
     * @function check
     * @param {string} name - A name to be associated with the match.
     * @param {Target} [target] - An optional target instance which describes whether we want a window/region/frame.
     * @return {boolean} A promise which is resolved when the validation is finished.
     */
    async check(name, target = null) {
        if (!this._eyes) {
            return false;
        }
        const result =  await this._eyes.check(name, target || Target.window().fully());
        if (result._asExpected) {
            return true;
        }
        throw new OxError(errHelper.errorCode.ASSERT_ERROR, null);
    }

    /**
     * @summary Takes a snapshot of the application under test and matches it with
     * the expected output.
     * @param {string} [name=] - An optional tag to be associated with the snapshot.
     * @param {number} [matchTimeout=-1] - The amount of time to retry matching (Milliseconds).
     * @return {boolean} A promise which is resolved when the validation is finished.
     */
    async checkWindow(name, matchTimeout) {
        if (!this._eyes) {
            return false;
        }
        const result = await this._eyes.checkWindow(name, matchTimeout);
        if (result._asExpected) {
            return true;
        }
        throw new OxError(errHelper.errorCode.ASSERT_ERROR, null);
    }
}
