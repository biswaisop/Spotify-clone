let currfolder;
let songs = [];
let currsong = new Audio();

async function getsongs(folder) {
    try {
        currfolder = folder;
        let a = await fetch(`/song/${folder}`);
        let response = await a.text();
        let div = document.createElement("div");
        div.innerHTML = response;
        let as = div.getElementsByTagName("a");
        songs = [];
        for (let i = 0; i < as.length; i++) {
            const element = as[i];
            if (element.href.endsWith(".mp3")) {
                songs.push(element.href.split(`/song/${folder}/`)[1]);
            }
        }

        // show all the songs in the playlist
        let songUl = document.querySelector(".songlist ul");
        songUl.innerHTML = "";
        for (const song of songs) {
            let s = song.split("-");
            let s1 = s[1].replace(".mp3", "");
            songUl.innerHTML += `
                <li>
                    <img src="./img/music.svg" class="invert" alt="">
                    <div class="info">
                        <div class="songname">${s[0].replaceAll("%20", " ")}</div>
                        <div>${s1.replaceAll("%20", " ")}</div>
                    </div>
                    <img src="./img/play-button.svg" class="playnow" alt="">
                </li>`;
        }

        // Attach an event listener to each song
        Array.from(document.querySelector(".songlist").getElementsByTagName("li")).forEach(e => {
            e.getElementsByTagName("img")[1].addEventListener("click", element => {
                let s = e.getElementsByTagName("div")[0].getElementsByTagName("div")[0].innerHTML;
                let a = e.getElementsByTagName("div")[0].getElementsByTagName("div")[1].innerHTML;
                playmusic(`${s.replaceAll(" ", "%20") + "-" + a.replaceAll(" ", "%20") + ".mp3"}`);
            });
        });

        return songs;
    } catch (error) {
        console.error('Error fetching songs:', error);
        return [];
    }
}

const SecToMin = (seconds) => {
    if (isNaN(seconds) || seconds < 0) {
        return "00:00";
    }

    let min = Math.floor(seconds / 60);
    let remsec = Math.floor(seconds % 60);

    let formin = String(min).padStart(2, '0');
    let forsec = String(remsec).padStart(2, '0');

    return `${formin}:${forsec}`;
};

const playmusic = (track, pause = false) => {
    let p = `/song/${currfolder}/${track}`;
    currsong.src = p;
    let t = track.split("-");
    if (!pause) {
        currsong.play();
        playbtn.src = "./img/pause.svg";
    }
    document.querySelector(".songinfo").innerHTML = t[0].replaceAll("%20", " ");
    document.querySelector(".songtime").innerHTML = "00:00 / 00:00";
};

async function displayAlbums() {
    let a = await fetch(`/song`);
    let response = await a.text();
    let div = document.createElement("div");
    div.innerHTML = response;
    let cc = document.getElementsByClassName("cardcontainer")[0];
    let anchor = div.getElementsByTagName("a");
    let array = Array.from(anchor);
    for (let index = 0; index < array.length; index++) {
        const e = array[index];
        if (e.href.includes("/song")) {
            let folder = e.href.split("/").slice(-2)[0];
            let a = await fetch(`/song/${folder}/info.json`);
            let response = await a.json();
            cc.innerHTML += `
                <div data-folder="${folder}" class="card">
                    <div class="play">
                        <img src="./img/play-button.svg" alt="">
                    </div>
                    <img src="/song/${folder}/cover.jpg" alt="">
                    <h2>${response.title}</h2>
                    <p>${response.description}</p>
                </div>`;
        }
    }
    // Load the Playlist when a card is clicked
    Array.from(document.getElementsByClassName("card")).forEach(e => {
        e.addEventListener("click", async item => {
            let songs = await getsongs(`${item.currentTarget.dataset.folder}`);
            if (songs.length > 0) {
                playmusic(songs[0], false);
            } else {
                console.log('No songs found in this folder.');
            }
        });
    });
}

async function main() {
    await getsongs("cs");
    if (songs.length > 0) {
        playmusic(`${songs[0]}`, true);
    } else {
        console.log('No songs found in the initial folder.');
    }

    // Display all the albums on the page
    displayAlbums();

    // Attach event listeners to the play, pause, and next buttons
    playbtn.addEventListener("click", () => {
        if (currsong.paused) {
            currsong.play();
            playbtn.src = "./img/pause.svg";
        } else {
            currsong.pause();
            playbtn.src = "./img/play.svg";
        }
    });

    // Listen for timeupdate event
    currsong.addEventListener("timeupdate", () => {
        document.querySelector(".songtime").innerHTML = `${SecToMin(currsong.currentTime)}/${SecToMin(currsong.duration)}`;
        document.querySelector(".circle").style.left = (currsong.currentTime / currsong.duration) * 100 + "%";
    });

    // Add an event listener to the seek bar
    document.querySelector(".seekbar").addEventListener("click", e => {
        let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
        document.querySelector(".circle").style.left = percent + "%";
        currsong.currentTime = (currsong.duration * percent) / 100;
    });

    // Add an event listener to the hamburger
    document.querySelector(".hamburger").addEventListener("click", () => {
        document.querySelector(".left").style.left = "0";
    });

    // Add an event listener to the close button
    document.querySelector(".close").addEventListener("click", () => {
        document.querySelector(".left").style.left = "-100%";
    });

    // Add event listeners to the next and previous buttons
    next.addEventListener("click", () => {
        let index = songs.indexOf(currsong.src.split("/").slice(-1)[0]);
        if (index + 1 < songs.length) {
            playmusic(`${songs[index + 1]}`);
        }
    });
    previous.addEventListener("click", () => {
        let index = songs.indexOf(currsong.src.split("/").slice(-1)[0]);
        if (index - 1 >= 0) {
            playmusic(`${songs[index - 1]}`);
        }
    });

    // Add an event listener to the volume control
    document.querySelector(".volume input").addEventListener("change", e => {
        currsong.volume = parseInt(e.target.value) / 100;
    });

    // Mute and unmute the volume
    document.querySelector(".volume img").addEventListener("click", e => {
        if (e.target.src.includes("volume.svg")) {
            e.target.src = e.target.src.replace("volume.svg", "mute.svg");
            currsong.volume = 0;
            document.querySelector(".volume input").value = 0;
        } else {
            e.target.src = e.target.src.replace("mute.svg", "volume.svg");
            currsong.volume = 0.1;
            document.querySelector(".volume input").value = 10;
        }
    });
}

main();
