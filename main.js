async function main() {
    let done = false;
    document.body.addEventListener("click", () => {
        if (!done) {
            go(() => (done = false));
            done = true;
        }
    });
}
main();

const mk_osc = (ctx, freq = 220, type = "square") => {
    const osc = ctx.createOscillator();
    osc.type = type;
    osc.frequency.value = freq;
    return osc;
};

const mk_tri = (ctx, dest) => {
    const o1 = mk_osc(ctx, 55 + 1);
    const o2 = mk_osc(ctx, 55 - 1);
    const o3 = mk_osc(ctx, 110, "sine");

    o1.connect(dest);
    o2.connect(dest);
    o3.connect(dest);

    return {
        start: () => {
            o1.start();
            o2.start();
            o3.start();
        },
        freq: (time, f) => {
            o1.frequency.setValueAtTime(f / 2, time - 0.3);
            o1.frequency.exponentialRampToValueAtTime(f - 1, time);
            o2.frequency.setValueAtTime(f + 1, time);
            o3.frequency.setValueAtTime(f / 2, time);
        },
        stop: () => {
            o1.stop();
            o2.stop();
            o3.stop();
        },
    };
};

async function go(onDone) {
    if (!window.AudioContext) {
        return;
    }
    const ctx = new window.AudioContext();

    const master = ctx.createGain();
    master.connect(ctx.destination);
    master.gain.volume = 0.1;

    const tr = mk_tri(ctx, master);
    const t = ctx.currentTime;
    tr.freq(t + 0.5, 220);
    tr.freq(t + 1, 100);
    tr.freq(t + 1.5, 180);
    tr.freq(t + 2, 100);
    tr.freq(t + 2.5, 80);

    tr.start();

    setTimeout(() => {
        tr.stop();
        setTimeout(() => {
            ctx.close();
            onDone();
        }, 0);
    }, 3300);
}
