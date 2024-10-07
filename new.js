async function getsongs(){
    try {
        let a = await fetch('http://127.0.0.1:3000/song/');
        let response = await a.text();
        let div = document.createElement("div");
        div.innerHTML = response;
        let as = div.getElementsByTagName("a");
        let songs = [];
        for (let i = 0; i < as.length; i++){
            const element = as[i];
            if (element.href.endsWith(".mp3")) {
                songs.push(element.href);
            }
        }
        return songs;
    } catch (error) {
        console.error('Error fetching songs:', error);
        return [];
    }
} 



async function main(){
    let songs = await getsongs();
    console.log('Fetched songs:', songs);

    if (songs.length > 0) {
        let audio = new Audio(songs[0]);
        audio.play().catch(error => {
            console.error('Error playing the audio:', error);
        });

        audio.addEventListener("loadeddata", () => {
            let duration = audio.duration;
            console.log('Audio duration:', duration);
        });
    } else {
        console.log("No songs found");
    }
}

// Ensure the DOM is fully loaded before attaching the event listener
document.addEventListener('DOMContentLoaded', () => {
    const startButton = document.getElementsByClassName('startbutton')[0];
    if (startButton) {
        startButton.addEventListener('click', main);
    } else {
        console.error('Start button not found');
    }
});