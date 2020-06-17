/**
 * Eve Industry Manager 2020
 *
 * Created by Mia Kloxader on 17/06/20
 */

const path = require('path');
const config = require('config');
const fs   = require('fs');
const yaml = require('js-yaml');
const util = require('util');

// Resources files provided by CCP via https://developers.eveonline.com/resource/resources
const typeIDsYAMLFilePath = path.join(__dirname, config.get('Files.ResourceDir'), config.get('Files.YAML.TypeIDs'));
const blueprintsYAMLFilePath = path.join(__dirname, config.get('Files.ResourceDir'), config.get('Files.YAML.Blueprints'));

// Pre-Processed files used in creating the database for Eve Industry Helper
const blueprintsJSONFilePath = path.join(__dirname, config.get('Files.ResultDir'), config.get('Files.JSON.Blueprints'));
const blueprintsNamesJSONFilePath = path.join(__dirname, config.get('Files.ResultDir'), config.get('Files.JSON.BlueprintsNames'));
const typeIDsJSONFilePath = path.join(__dirname, config.get('Files.ResultDir'), config.get('Files.JSON.TypeIDs'));

// Import YAML content into a JSON object
function YAMLtoJSON(filepath) {
    try {
        return yaml.safeLoad(fs.readFileSync(filepath, 'utf8'));
    } catch (e) {
        console.error(e);
    }
}

// Converting YAML to JSON for ease of use
console.log("Loading " + typeIDsYAMLFilePath + " ...");
const typeIDsContent = YAMLtoJSON(typeIDsYAMLFilePath);
console.log("Done.");
console.log("Loading " + blueprintsYAMLFilePath + " ...");
const blueprintsContent = YAMLtoJSON(blueprintsYAMLFilePath);
console.log("Done.");

// JSON Output
const blueprintsJSONOutput = fs.createWriteStream(blueprintsJSONFilePath, {flags : 'w'});
const blueprintsNamesJSONOutput = fs.createWriteStream(blueprintsNamesJSONFilePath, {flags : 'w'});
const typeIDsJSONOutput = fs.createWriteStream(typeIDsJSONFilePath, {flags : 'w'});

// Creating blueprint file
console.log("Processing Blueprint Data ...");
let blueprintsJSONResult = {};
let blueprintsNamesJSONResult = [];
for (let bp in blueprintsContent) {
    const currentID = blueprintsContent[bp].blueprintTypeID;

    // Copying blueprints data from blueprints.yaml
    blueprintsJSONResult[currentID] = blueprintsContent[bp];

    // Retrieving more data from typeIDs.yaml
    blueprintsJSONResult[currentID].name = typeIDsContent[currentID].name.en;
    blueprintsJSONResult[currentID].volume = typeIDsContent[currentID].volume;
    blueprintsJSONResult[currentID].iconID = typeIDsContent[currentID].iconID;
    blueprintsJSONResult[currentID].groupID = typeIDsContent[currentID].groupID;
    if (typeIDsContent[currentID].basePrice === undefined)
        blueprintsJSONResult[currentID].basePrice = 0;
    else
        blueprintsJSONResult[currentID].basePrice = typeIDsContent[currentID].basePrice;

    // Adding blueprint name to blueprints_names.json
    blueprintsNamesJSONResult.push([currentID, typeIDsContent[currentID].name.en]);
}
console.log("Done.");

// Writing to file
console.log("Writing " + blueprintsJSONFilePath + " ...");
blueprintsJSONOutput.write(util.format('%j', blueprintsJSONResult));
console.log("Done.");

console.log("Writing " + blueprintsNamesJSONFilePath + " ...");
blueprintsNamesJSONOutput.write(util.format('%j', blueprintsNamesJSONResult));
console.log("Done.");

// Creating typeIDs file
console.log("Processing typeID Data ...");
let typeIDsJSONResult = {};
for (let item in typeIDsContent) {
    const currentID = item;

    typeIDsJSONResult[currentID] = {}

    // Copying typeID data from typeIDs.yaml
    typeIDsJSONResult[currentID].typeID = currentID;
    typeIDsJSONResult[currentID].name = typeIDsContent[currentID].name.en;
    typeIDsJSONResult[currentID].volume = typeIDsContent[currentID].volume;
    typeIDsJSONResult[currentID].iconID = typeIDsContent[currentID].iconID;
    typeIDsJSONResult[currentID].groupID = typeIDsContent[currentID].groupID;
}
console.log("Done.");

// Writing to file
console.log("Writing " + typeIDsJSONFilePath + " ...");
typeIDsJSONOutput.write(util.format('%j', typeIDsJSONResult));
console.log("Done.");
