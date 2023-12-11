/*
 *   Copyright (c) 2023 JRichardsz
 *   All rights reserved.

 *   Permission is hereby granted, free of charge, to any person obtaining a copy
 *   of this software and associated documentation files (the "Software"), to deal
 *   in the Software without restriction, including without limitation the rights
 *   to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 *   copies of the Software, and to permit persons to whom the Software is
 *   furnished to do so, subject to the following conditions:
 
 *   The above copyright notice and this permission notice shall be included in all
 *   copies or substantial portions of the Software.
 
 *   THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 *   IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 *   FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 *   AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 *   LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 *   OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 *   SOFTWARE.
 */

const logger = require('../common/Logger.js');
const ErrorHelper = require('../common/ErrorHelper.js');
const fs = require('fs');
const path = require('path');
const os = require('os');
const { v4: uuidv4 } = require('uuid');

function DevopsTask(shellHelper, pipeline) {

    this.start = async (gitUrl, branchName, yamlFullLocation, disableOnChageValidation) => {

        logger.info("job is starting...")

        if (typeof gitUrl === 'undefined') throw new Error("gitUrl is required");
        if (typeof branchName === 'undefined') throw new Error("branchName is required");

        if(typeof disableOnChageValidation==='undefined' || disableOnChageValidation===false){
            var currentCommitId, previousCommitId;
            try {
                logger.info("diff query: "+`git ls-remote ${gitUrl} ${branchName}`);
                var response = await shellHelper.executeSingleLine(`git ls-remote ${gitUrl} ${branchName}`);
                logger.info("diff result: "+JSON.stringify(response));
                currentCommitId = response.stdout.split(/\s+/)[0].trim();
            } catch (err) {
                throw ErrorHelper.reThrow(`Failed to read git commit`, err);
            }
    
            var repositoryName = gitUrl.split("/").pop().replace(".git", "");
            var fileInfoLocation = path.join(os.tmpdir(), `${repositoryName}-${branchName}`)
            var isFirstTime = false;
            try {
                previousCommitId = await fs.promises.readFile(fileInfoLocation, "utf-8");
            }
            catch (e) {
                logger.debug(e);
                //file does not exist so is the first time
                isFirstTime = true; 
                previousCommitId = currentCommitId;
                await fs.promises.writeFile(fileInfoLocation, currentCommitId);
            }
            logger.info("previousCommitId:"+previousCommitId)
            logger.info("currentCommitId:"+currentCommitId)
            
            if(!isFirstTime && previousCommitId===currentCommitId){
                logger.info("git repository and branch does not have changes")
                return {changed: false}
            }
        }

        var workspaceFullLocation = path.join(os.tmpdir(), uuidv4());
        await fs.promises.mkdir(workspaceFullLocation);
        var variables = {gitUrl, branchName, yamlFullLocation, currentCommitId, workspaceFullLocation};
        logger.info("executing: "+yamlFullLocation)
        var response = await pipeline.executeFile(yamlFullLocation, variables);
        logger.info("completed: "+yamlFullLocation)
        try {
            await fs.promises.writeFile(fileInfoLocation, currentCommitId);
        }
        catch (e) {
            logger.debug(e);
        }
        logger.info("deleting workspace: "+workspaceFullLocation) 
        //await fs.promises.rm(workspaceFullLocation, { recursive: true }, () => logger.info('successfully deleted: ' + workspaceFullLocation));
        return {...response, changed: true}
    }; 

}

module.exports = DevopsTask;
