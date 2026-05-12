const str = "foo\n  bar\r\n  baz";
console.log(JSON.stringify(str.replace(/\n\s*/g, " ")));
console.log(JSON.stringify(str.replace(/\r?\n\s*/g, " ")));
