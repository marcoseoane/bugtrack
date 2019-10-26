if ('serviceWorker' in navigator) {
  window.addEventListener('load', function() {
    fetch('https://time-waterlily.glitch.me/sw').then(response => {
      if(response.ok){
         navigator.serviceWorker.register(response.body.reader).then(function(registration) {
          console.log('Service worker registered with scope: ', registration.scope);
        }, function(err) {
          console.log('ServiceWorker registration failed: ', err);
        });
      }
    })
  });
}
