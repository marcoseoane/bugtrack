self.addEventListener('error', (event)=>{
  console.log(event.error.stack);
});

