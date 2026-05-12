import fs from "fs";
import { parseDrx } from "./src/parser.js";
import { loadConfig } from "./src/config.js";

async function run() {
  const text = fs.readFileSync("examples/cal.com/src-drx/apps-web/components/booking/CancelBooking.drx", "utf-8");
  const config = await loadConfig(".");
  try {
    parseDrx(text, config, "CancelBooking.drx");
  } catch (e: any) {
    console.error(e.message);
  }
}
run();
