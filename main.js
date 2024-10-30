import { play_tune } from "./syn.js";

async function main() {
    const tune = await fetch("./test.json").then((r) => r.json());
    let done = false;
    document.body.addEventListener("click", () => {
        if (!done) {
            play_tune(tune, () => (done = false));
            done = true;
        }
    });
}
main();
