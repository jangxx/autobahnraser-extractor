const fs = require('fs');
const path = require("path");

const program = require('commander');
const sanitizeFilename = require("sanitize-filename");

program
    .version('0.0.2')
    .option("-D --input-folder [folder]", "Input folder", "")
    .option('-I --input <input>', 'Input name')
    .option('-O --output [output]', 'Output folder', null)
    .parse(process.argv);

if (!program.input) program.help();

const IND_PATH = path.join(program.inputFolder, program.input + ".ind");
const IMG_PATH = path.join(program.inputFolder, program.input + ".img");

if (!fs.existsSync(IND_PATH)) {
    console.log('Index file could not be found.');
    process.exit(1);
}
if (!fs.existsSync(IMG_PATH)) {
    console.log('Content file could not be found.');
    process.exit(1);
}

if(program.output == null) {
    program.output = program.input;
}

const out = path.normalize(program.output + '/');
if(!fs.existsSync(out)) {
    fs.mkdirSync(out);
}

const indexFile = fs.readFileSync(IND_PATH);
const contentFile = fs.readFileSync(IMG_PATH);

const fileCount = indexFile.readUInt16LE(0);
console.log('Found', fileCount, 'files');

for(let offset = 2; offset < fileCount * 24 + 2; offset += 24) {
    const cur = indexFile.slice(offset, offset + 24);

    let nameLength = 0;
    while (cur[nameLength] !== 0) {
        nameLength += 1;
    }

    const fileName = cur.slice(0, nameLength).toString();
    const start = cur.readInt32LE(20);

    let end;
    if (offset + 24 < indexFile.length) {
        end = indexFile.readInt32LE(offset + 24 + 20);
    } else {
        end = contentFile.length;
    }

    let sanitized_filename = sanitizeFilename(fileName, { replacement: "_" });
    let safe_filename = sanitized_filename;

    // trying to make sure the file doesn't exist already
    let prefix_number = 1;
    while (fs.existsSync(path.join(out, safe_filename))) {
        safe_filename = `${prefix_number}-${sanitized_filename}`;
        prefix_number += 1;
    }

    fs.writeFileSync(path.join(out, safe_filename), contentFile.slice(start, end));

    console.log(`Extracted ${fileName} as ${safe_filename} (size: ${end - start} bytes)`);
}
