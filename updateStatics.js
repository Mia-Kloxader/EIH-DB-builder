/**
 * Eve Industry Manager 2020
 *
 * Created by Mia Kloxader on 17/06/20
 */

const fs = require('fs')
const fsx = require('fs-extra')
const config = require('config');
const path = require('path');
const download = require('download-file')
// const crypto = require('crypto')
const extract = require('extract-zip');

const staticFilepath = path.join(__dirname, config.get('Files.ResourceDir'), config.get('Files.Static.Name'));
const staticUrl = config.get('Files.Static.Url');

const typeIDsYAMLFilePath = path.join(__dirname, config.get('Files.ResourceDir'), config.get('Files.YAML.TypeIDs'));
const blueprintsYAMLFilePath = path.join(__dirname, config.get('Files.ResourceDir'), config.get('Files.YAML.Blueprints'));

// const checksumFilepath = path.join(__dirname, config.get('Files.ResourceDir'), config.get('Files.Static.Checksum_File'));
// const checksumUrl = config.get('Files.Static.Checksum_Url');

function deleteFile(filepath, callback) {
    console.log("Deleting " + filepath + " ...");
    if (fs.existsSync(filepath)) {
        fs.unlinkSync(filepath);
        return callback();
    }
    console.log("Done.");
    return callback();
}

function deleteDir(filepath, callback) {
    fsx.remove(filepath, callback);
}

function downloadFile(downloadUrl, dirPath, fileName, callback) {
    console.log("Downloading " + fileName + " ...");
    download(downloadUrl, {
        directory: dirPath,
        filename: fileName
    }, err => {
        if (err) throw err;
        callback();
        console.log("Done.");
    })
}

// function checksum(str, algorithm, encoding) {
//     return crypto
//         .createHash(algorithm || 'md5')
//         .update(str, 'utf8')
//         .digest(encoding || 'hex')
// }

deleteFile(staticFilepath, () => {
    downloadFile(staticUrl, path.join(__dirname, config.get('Files.ResourceDir')), config.get('Files.Static.Name'), () => {
        console.log("Deleting old SDE directory ...");
        deleteDir(path.join(__dirname, config.get('Files.ResourceDir'), 'sde'), () => {
            console.log("Extracting " + staticFilepath + " ...");
            extract(staticFilepath, { dir: path.join(__dirname, config.get('Files.ResourceDir')) })
                .then(() => {
                    deleteFile(typeIDsYAMLFilePath, () => {
                        fs.rename(path.join(__dirname, config.get('Files.ResourceDir'), 'sde', 'fsd', config.get('Files.YAML.TypeIDs')),
                            typeIDsYAMLFilePath, err => {
                                if (err) throw err;
                            })
                    });
                    deleteFile(blueprintsYAMLFilePath, () => {
                        fs.rename(path.join(__dirname, config.get('Files.ResourceDir'), 'sde', 'fsd', config.get('Files.YAML.Blueprints')),
                            blueprintsYAMLFilePath, err => {
                                if (err) throw err;
                            })
                    });
                })
                .catch(err => {
                    throw err;
                });
        })
    });
});
