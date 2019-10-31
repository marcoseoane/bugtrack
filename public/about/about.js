function copyLink(){
  const codeTag = document.querySelector('#script-link');
  navigator.clipboard.writeText(codeTag.innerText).then(function() {
    const copiedTooltip = createSpan();
    const container = document.querySelector('#copy-script-container');
    container.appendChild(copiedTooltip);
    setTimeout(()=>{
      document.querySelector('#copied-tooltip').setAttribute('class', 'fade-out');
      setTimeout(()=>{
        container.removeChild(copiedTooltip);
      }, 510)
    }, 2000);
  }, function(err) {
    if(err) throw (err);
  });
}
  
function createSpan(){
  const copiedTooltip = document.createElement('span');
  copiedTooltip.setAttribute('id', 'copied-tooltip');
  copiedTooltip.setAttribute('class', 'fade-in');
  copiedTooltip.textContent = 'Copied!';
  return copiedTooltip;
}