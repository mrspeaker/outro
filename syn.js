function get_note_freq(note, octave) {
    const NOTES = [
        "c",
        "c#",
        "d",
        "d#",
        "e",
        "f",
        "f#",
        "g",
        "g#",
        "a",
        "a#",
        "b",
    ];
    return (
        440 *
        Math.pow(
            Math.pow(2, 1 / NOTES.length),
            octave * 12 + NOTES.indexOf(note),
        )
    );
}
const mk_osc = (ctx, freq = 220, type = "square") => {
    const osc = ctx.createOscillator();
    osc.type = type;
    osc.frequency.value = freq;
    return osc;
};

const mk_syn = (ctx, dest) => {
    const o1 = mk_osc(ctx, 220, "square");
    const o2 = mk_osc(ctx, 220, "square");

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
            env.gain.linearRampToValueAtTime(0.3, time + 0.01);
            env.gain.linearRampToValueAtTime(0, time + duration);

            //o1.frequency.cancelScheduledValues(next);
            o1.frequency.setValueAtTime(f * 0.995, time);
            o1.frequency.setValueAtTime(f * 0.995 * 2.0, time + duration * 0.5);
            o1.frequency.setValueAtTime(
                f * 0.995 * 3.0,
                time + duration * 0.75,
            );
            //o1.frequency.exponentialRampToValueAtTime(f - 1, next + duration);
            o2.frequency.setValueAtTime(f * 1.005, time);
            o2.frequency.setValueAtTime(f * 1.005 * 2.0, time + duration * 0.5);
            o2.frequency.setValueAtTime(
                f * 1.005 * 3.0,
                time + duration / 0.75,
            );
        },
        stop: () => {
            o1.stop();
            o2.stop();
        },
    };
};

async function play_tune(tune, onDone) {
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
            const tick = 0.5 + (v.tick / 100) * 0.5;
            const f0 = i * (220 / 5) + 220;
            const f = [
                ["c", -1],
                ["g", -1],
                ["e", -1],
                ["b", 0],
                ["c", 0],
            ][i];
            const ff = get_note_freq(f[0], f[1]);
            const duration = v.duration * 0.01;
            syn.play(t + tick, ff, duration);
        });
    });

    syns.forEach((s) => s.start());

    setTimeout(() => {
        syns.forEach((s) => s.stop());
        setTimeout(() => {
            ctx.close();
            onDone && onDone();
        }, 0);
    }, 8000);
}
