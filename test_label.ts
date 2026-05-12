import { transformJsxLite } from "./src/jsx.js";

const lines = [
  '1:  ui',
  '2:    <>',
  '3:      <Select onChange={() => { if (foo) { bar(); } }} />',
  '4:    </>',
  '5:    <Label>{t("foo")}</Label>'
];

try {
  console.log(transformJsxLite(lines, { componentAliases: {}, tagAliases: {}, eventAliases: {} } as any, "test.drx"));
} catch (e) {
  console.error(e);
}
