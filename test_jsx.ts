import { transformJsxLite } from "./src/jsx.js";

const lines = [
  '1:  ui',
  '2:    <html lang="en">',
  '3:      <body .dark:bg-default .bg-subtle style={',
  '4:        a: 1',
  '5:      }>',
  '6:      </body>',
  '7:    </html>'
];

try {
  console.log(transformJsxLite(lines, { componentAliases: {}, tagAliases: {}, eventAliases: {} } as any, "test.drx"));
} catch (e) {
  console.error(e);
}
