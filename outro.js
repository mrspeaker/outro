console.log("outro...");
setTimeout(go, 2000);

//test();

// Let's convert cal to midi lol! (ah, nah... doesn't really work)
// SMF = <header_chunk> + <track_chunk> [+ <track_chunk> ...]
// header_chunk = "MThd" + <header_length> + <format> + <n> + <division>
// track_chunk = "MTrk" + <length> + <track_event> [+ <track_event> ...]
// track_event = <v_time> + <midi_event> | <meta_event> | <sysex_event>
// http://www.music.mcgill.ca/~ich/classes/mumt306/StandardMIDIfileformat.html

const mk_song = (track_length) => ({ track_length, tracks: [] });
const mk_track = () => [];
const mk_note = (tick, duration) => ({ tick, duration });

function extract_cal_entries(view) {
    // TOOD: reliable way to get rows
    const rows = [...view.querySelectorAll("div > .L7luy")];
    console.log("num rows", rows.length);

    const song = mk_song(view.offsetHeight);

    // TOOD: reliable way to get cols
    const cols = [...view.querySelectorAll("div > .MFHYk")];
    cols.forEach((r, i) => {
        const track = mk_track();
        song.tracks.push(track);

        // TOOD: reliable way to get entries
        const entries = r.querySelectorAll(":scope > div > div > div");
        entries.forEach((e) => {
            track.push(mk_note(e.offsetTop, e.offsetHeight));
        });
    });

    return song;
}

const get_test = () =>
    fetch("./test.json")
        .then((r) => r.json())
        .catch(console.error);

async function test() {
    const test_json = await get_test();
    console.log(test_json);
}

function go() {
    const view = document.querySelector(
        "[data-app-section='calendar-view-0']", // CalendarModuleSurface
    );

    if (!view) {
        console.log("no cal view... waiting...");
        setTimeout(go, 3000);
        return;
    }

    const song = extract_cal_entries(view);
    console.log("Da song:", JSON.stringify(song));
}
