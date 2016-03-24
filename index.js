var fs = require('fs');
var csv = require('csv');
var md5 = require('md5');
var path = require('path');
var parse = csv.parse;
var commandLineArgs = require('command-line-args');
var Iconv = require('iconv').Iconv;
var toUtf8 = new Iconv('SHIFT_JIS', 'UTF-8//TRANSLIT//IGNORE');
var toShiftjis = new Iconv('UTF-8', 'SHIFT_JIS//TRANSLIT//IGNORE');
var cli = commandLineArgs([
  { name: 'verbose', alias: 'v', type: Boolean },
  { name: 'file', alias: 'f', type: String, multiple: false, defaultOption: true },
  { name: 'output', alias: 'o', type: String},
  { name: 'column', alias: 'c', type: Number, },
])
var options = cli.parse()
if(!options.file){
  console.log(cli.getUsage());
  return false;
}
var column = 2;
if(options.column != NaN) {
  column = options.column;
}
var output = '/output.csv';
if(options.output){
  output = '/' + options.output;
}
var parser = parse({delimiter: ','}, function(err, data){
  if(options.verbose){
    console.log(data);
  }
});
var transform =csv.transform(function(record){
  record[record.length] = md5(record[column]);
  return record;
});
var writer = fs.createWriteStream(path.normalize(__dirname+ output));
var stringifier = csv.stringify();
fs.createReadStream(path.normalize(__dirname+'/' + options.file))
  .pipe(toUtf8)
  .pipe(parser)
  .pipe(transform)
  .pipe(csv.stringify ())
  .pipe(toShiftjis)
  .pipe(writer)
;
