import { transformJsxLite } from "./src/jsx.js";

const lines = [
  '1:  ui',
  '2:    <InternalNotePresetsSelect',
  '3:      onPresetSelect={(option) => {',
  '4:        if (option.value === "other") {',
  '5:          const found = presets.find((p) => p.id === option.value);',
  '6:        }',
  '7:      }}',
  '8:    />',
  '9:    <Label>foo</Label>'
];

try {
  console.log(transformJsxLite(lines, { componentAliases: {}, tagAliases: {}, eventAliases: {} } as any, "test.drx"));
} catch (e) {
  console.error(e);
}
