self.addEventListener('fetch', function(event) {
  console.log('tripped')
  event.respondWith(
    fetch(event.request)
  );
});