var fs = require('fs');
var program = require('commander');

String.prototype.fill = function(len, chr) {
    var ret = "";
    for(var i = 0; i < len - this.length; i++) {
        ret += chr;
    }
    return ret + this
}

program
    .version('0.0.1')
    .option('-I --input <input>', 'Input name')
    .option('-O --output [output]', 'Output folder', null)
    .parse(process.argv);

if(!program.input) program.help();

if(!fs.existsSync(program.input + '.ind')) {
    console.log('Index file could not be found.')
    process.exit(1);
}
if(!fs.existsSync(program.input + '.img')) {
    console.log('Content file could not be found.')
    process.exit(1);
}

if(program.output == null) program.output = program.input;
var out = require('path').normalize(program.output + '/');
if(!fs.existsSync(out)) fs.mkdirSync(out);

var indexFile = fs.readFileSync(program.input + '.ind');
var contentFile = fs.readFileSync(program.input + '.img');

var fileCount = indexFile.readUInt16LE(0);
console.log('Found', fileCount, 'files');

var currentFile = 0;
for(var offset = 2; offset < fileCount * 24 + 2; offset += 24) {
    var cur = indexFile.slice(offset, offset + 24);

    for(var nameLength = 0; cur[nameLength] != 0x0; nameLength++) {}
    var fileName = cur.slice(0, nameLength).toString();
    var start = cur.readInt32LE(20);
    if(offset + 24 < indexFile.length) {
        var end = indexFile.readInt32LE(offset + 24 + 20);
    } else {
        var end = contentFile.length;
    }
    fs.writeFileSync(out + fileName, contentFile.slice(start, end));

    console.log("Extracted", fileName);

    //process.exit();
}
