import './App.css';
import {useEffect, useState} from 'react'
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';

function App() {
  const authEndpoint = "https://accounts.spotify.com/authorize/?"
  

  const clientId = "" // Find ClientID on Spotify Dashboard
  const redirectUri = "http://localhost:3000" // Where to go after sign in
  const scopes = [
    'user-read-currently-playing',
    'user-read-playback-state',
    'user-modify-playback-state',
  ]

  let [token, setToken] = useState() // Authorization Token
  let [currSong, setCurrSong] = useState()


  useEffect(() => {

    const hash = window.location.hash 
    .substring(1)
    .split("&")
    .reduce(function(initial, item) {
      if (item) {
        var parts = item.split("=");
        initial[parts[0]] = decodeURIComponent(parts[1]);
      }
      return initial;
    }, {});
    window.location.hash = "";

    let _token = hash.access_token
    if(_token) {
      setToken(_token)
      getCurrentSong(_token)
      getTopArtists(_token)
      SpeechRecognition.startListening({continuous: true})
    }
  }, [])

  const getCurrentSong = (tok) => {
    console.log("Attempting fetch")
    console.log("Bearer " + tok)
    fetch("https://api.spotify.com/v1/me/player", {
      method: 'GET',
      headers: {
        Authorization: "Bearer " + tok
      }
    })
    .then((response) => response.json()).then(data => {
      console.log("fetch succesful")
      setCurrSong({
        item: data.item,
        is_playing: data.is_playing,
        progress_ms: data.progress_ms,
      });
      console.log(data)
    })
  }
  const getTopArtists = (tok) => {
    console.log("Attempting fetch")
    console.log("Bearer " + tok)
    fetch("https://api.spotify.com/v1/me/top/artists?time_range=long_term", {
      method: 'GET',
      headers: {
        Authorization: "Bearer " + tok
      }
    })
    .then((response) => response.json()).then(data => {
      console.log("fetch succesful")
      setTopArtists(data.items)
      console.log(data)
    })
  }
  const pauseSong = () => {
  
    fetch("https://api.spotify.com/v1/me/player/pause", {
      method: 'PUT',
      headers: {
        Authorization: "Bearer " + token
      }
    })
    
  }
  const playSong = () => {
  
    fetch("https://api.spotify.com/v1/me/player/play", {
      method: 'PUT',
      headers: {
        Authorization: "Bearer " + token
      }
    })
    
  }
  const commands = [
    {
      command: ['play music', 'resume music'],
      callback: () => playSong(),
      isFuzzyMatch: true,
    },
    {
      command: ['pause music', 'stop music'],
      callback: () => pauseSong(),
      isFuzzyMatch: true,
    },
  ]


  const {
    transcript,
    listening,
  } = useSpeechRecognition({commands})


  return (
    <div className="App">
      <header className="App-header">

      {!token && (
        <a
          className="btn btn--loginApp-link"
          href={`${authEndpoint}client_id=${clientId}&redirect_uri=${redirectUri}&scope=${scopes.join("%20")}&response_type=token&show_dialog=true`}
        >
          <button>Login to Spotify</button>
        </a>
      )}
      {token && (<>
      {listening && <p>Listening for Commands</p>}
      <button onClick={() => SpeechRecognition.startListening({continuous: true})}>Enable Voice Commands</button>
      <button onClick={SpeechRecognition.stopListening}>Disable Voice Commands</button>
       <p>{transcript}</p>
        {currSong && <>
          <img src = {currSong.item.album.images[0].url} alt = "Album Cover"/>
          <h2>{currSong.item.name}</h2>
          <p>{currSong.item.artists[0].name}</p>
          <div>
          <button onClick = {playSong}>Play</button>
          <button onClick = {pauseSong}>Pause</button>
          </div>



        </>}
      </>  
      )}
      </header>
    </div>
  );
}




export default App;
