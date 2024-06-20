import * as path from "jsr:@std/path@0.225.2";
const files = [
  "summaryTable.hbs",
  "verificationList.hbs",
  "verificationPage.hbs",
  "verificationTable.hbs",
];

const vars = [];
for (const file of files) {
  const txt = await Deno.readTextFile(file);
  vars.push([file, txt]);
}
let modText = ``;
for (const [file, txt] of vars) {
  modText += `export const ${path.basename(file, ".hbs")}Hbs = \`${txt}\`;\n`;
}
await Deno.writeTextFile("hbs.ts", modText);
