async function main() {
    const tune = await fetch("./test.json").then((r) => r.json());
    let done = false;
    document.body.addEventListener("click", () => {
        if (!done) {
            go(tune, () => (done = false));
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

const mk_syn = (ctx, dest) => {
    const o1 = mk_osc(ctx, 220, "sine");
    const o2 = mk_osc(ctx, 220);

    const env = ctx.createGain();
    env.connect(dest);
    env.gain.value = 0;

    o1.connect(env);
    o2.connect(env);

    return {
        start: () => {
            o1.start();
            o2.start();
            env.gain.value = 0;
        },
        play: (time, f, duration = 0.5) => {
            env.gain.cancelScheduledValues(time);
            env.gain.setValueAtTime(0, time);
            env.gain.linearRampToValueAtTime(0.3, time + 0.1);
            env.gain.linearRampToValueAtTime(0, time + duration);

            //o1.frequency.cancelScheduledValues(next);
            o1.frequency.setValueAtTime(f * 0.995, time);
            //o1.frequency.exponentialRampToValueAtTime(f - 1, next + duration);
            o2.frequency.setValueAtTime(f * 1.005, time);
            //     o3.frequency.setValueAtTime(f / 2, next + duration);
        },
        stop: () => {
            o1.stop();
            o2.stop();
        },
    };
};

async function go(tune, onDone) {
    if (!window.AudioContext) {
        return;
    }
    const ctx = new window.AudioContext();

    const master = ctx.createGain();
    master.connect(ctx.destination);
    master.gain.volume = 0.1;

    const t = ctx.currentTime;
    const syns = [];
    tune.tracks.forEach((trk, i) => {
        const syn = mk_syn(ctx, master);
        syns.push(syn);
        trk.forEach((v) => {
            const tick = 0.5 + ((v.tick - 400) / 100) * 1;
            console.log(v.tick, tick);
            syn.play(t + tick, i * (220 / 3) + 220, v.duration * 0.01);
        });
    });

    syns.forEach((s) => s.start());

    setTimeout(() => {
        syns.forEach((s) => s.stop());
        setTimeout(() => {
            ctx.close();
            onDone();
        }, 0);
    }, 8000);
}
