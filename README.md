In terms of the software stack, the app is run on a heroku-hosted
node.js server using the express framework and the jade template engine.
I use d3.js to project the map of the US and deal with user interaction,
translating user-defined box coordinates from pixel space to WSG84 coordinates
(although the conversion calculation needs work) which is then sent to the server 
via socket.io. The node server then queries a stream from Twitter within the given boundary
coordinates and sends the data back to front-end javascript in order to
render the json stream and dynamically update the page using jQuery.
Currently, I purposely stop the stream at the first 8 tweets so that a site
visitor can actually read them (assuming a high speeding stream from
decently-sized box coordinates).
