const child_process = require('child_process');
const fs = require("fs");
const path = require("path");

const exec = (cmd) => {
    child_process.execSync(cmd, { stdio: 'inherit' });
}

fs.rmSync("./dist", { "recursive": true, force: true });

exec("npx vite build");

let con = fs.readFileSync("./src/main.vue", "utf-8");
let nnn = con.replaceAll("<slot", "<slot20250220").replaceAll("slot>", "slot20250220>");
fs.writeFileSync("./src/main.vue", nnn);
exec("npx vue-tsc");

fs.writeFileSync("./src/main.vue", con);
