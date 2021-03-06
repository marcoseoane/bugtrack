self.addEventListener('error', (event) => {
  try{
    fetch('https://bugtrack.glitch.me/relay_bug', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        stack: event.error.stack,
        bugTrackId: ''
      })
    }).then(async (res) => {
      if (res.ok) {
        console.log('successful request');
      }
    });
  } catch (err) {  
    console.error(err);
  }
});
