/*
 * Oxygen Reporter abstract class 
 */ 
var fs = require('fs');
var path = require('path');
var oxutil = require('./util');
var moment = require('moment');
var _ = require('underscore');

var ReporterBase = require('./reporter-base'); 
var util = require('util');
util.inherits(ReporterFileBase, ReporterBase);


function ReporterFileBase(results, options) {
	ReporterFileBase.super_.call(this, results, options);
}

ReporterFileBase.prototype.createFolderStructureAndFilePath = function(fileExtension) {
	if (!this.options)
		throw new Error('ReporterBase is not properly initialized');
	// there must be either source file or a pair of target folder + target name specified
	// if source file is specified, then target folder + result folder name are gathered from it
	var resultsMainFolderPath = null;
	var testResultFolderPath = null;
	
	if (this.options.srcFile) {
		var baseDir = path.dirname(this.options.srcFile);
		var fileNameNoExt = oxutil.getFileNameWithoutExt(this.options.srcFile);
		resultsMainFolderPath = path.join(baseDir, fileNameNoExt);
	}
	else if (this.options.targetFolder && this.options.targetName) {
		resultsMainFolderPath = path.join(this.options.targetFolder, this.options.targetName);
	}
	else {
		throw new Error('srcFile or targetFolder + targetName options are required');
	}
	// create results main folder (where all the results for the current test case or test suite are stored)
	this.createFolderIfNotExists(resultsMainFolderPath);
	// create sub folder for the current results 
	var fileName = moment().format('YYYY-MM-DD HHmmss');
	var resultFolderPath = path.join(resultsMainFolderPath, fileName);
	this.createFolderIfNotExists(resultFolderPath);
	return path.join(resultFolderPath, fileName + fileExtension);
}

ReporterFileBase.prototype.createFolderIfNotExists = function(folderPath) {   
    try {
        fs.mkdirSync(folderPath);
    } catch(e) {
        if ( e.code != 'EEXIST' ) throw e;
    }
    return folderPath;
}
// save all screenshots to files and replace screenshot content with file path in the result JSON before serialization
ReporterFileBase.prototype.replaceScreenshotsWithFiles = function(folderPath) {
	var stepsWithScreenshot = [];
	// map steps with non empty screenshot attribute
	_.each(this.results, function(resultSet) {
		_.each(resultSet.iterations, function(outerIt) {
			_.each(outerIt.testcases, function(testcase) {
				_.each(testcase.iterations, function(innerIt) {
					_.each(innerIt.steps, function(step) {
						if (step.screenshot) {
							stepsWithScreenshot.push(step);
						}
					});
				});
			});
		});
	});
	const screenshotFilePrefix = "screenshot-";
	const screenshotFileSuffix = ".png";
	for (var i = 0; i<stepsWithScreenshot.length; i++) {
		var filename = screenshotFilePrefix + i + screenshotFileSuffix;
		var filepath = path.join(folderPath, filename);
		var step = stepsWithScreenshot[i];
		fs.writeFileSync(filepath, step.screenshot, 'base64');
		step._screenshotFile = filename;
		step.screenshot = null;	// don't save base64 screenshot date to the file
	}
}

module.exports = ReporterFileBase;