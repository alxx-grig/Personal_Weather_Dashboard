function updateClock(){
  const now = new Date(); // Creates a Date object called 'now' to access the date and time

  const hours = now.getHours().toString().padStart(2, '0');
  const minutes = now.getMinutes().toString().padStart(2, '0');
  const seconds = now.getSeconds().toString().padStart(2, '0');

  document.getElementById('time').textContent = `${hours}:${minutes}:${seconds}`; // sets the hours, minutes and seconds by updating HTML

  const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }; // specifies the actual format for the date
  document.getElementById('date').textContent = now.toLocaleDateString('en-US', options); // using the 'now' object, it sets the date with the specified format and updtaes HTML
}

updateClock();
setInterval(updateClock, 1000);
