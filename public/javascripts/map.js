/*============================================	
 	  Tweetmap - map2tweet.js
==============================================*/

var socket = io.connect();
if(!feedHTML)
	var feedHTML = '';

var width = 600,
    height = 400,
    formatNumber = d3.format(".3r");

var projection = d3.geo.azimuthalEqualArea()
    .rotate([100, -45])
    .scale(800)
    .translate([width / 2, height / 2 - 110]);

var extent = te(projection);

var brush = d3.svg.brush()
    .x(d3.scale.linear().domain([extent[0], extent[2]]).range([0, width]))
    .y(d3.scale.linear().domain([extent[1], extent[3]]).range([height, 0]))
    .extent([[-2030000, -1250000], [-1300000, -40400]])
    .on("brushend", brushed);

var path = d3.geo.path()
    .projection(projection);

var graticule = d3.geo.graticule()
    .extent([[-140, 20], [-60, 60]])
    .step([2, 2]);

var info = d3.select("#info");

var svg = d3.select("body").append("svg")
    .attr("width", width)
    .attr("height", height);

svg.append("path")
    .datum(graticule)
    .attr("class", "graticule")
    .attr("d", path);

d3.json("javascripts/us.json", function(error, us) {
  svg.insert("path", ".graticule")
      .datum(topojson.object(us, us.objects.land))
      .attr("class", "land")
      .attr("d", path);

  svg.insert("path", ".graticule")
      .datum(topojson.mesh(us, us.objects.states, function(a, b) { return a !== b; }))
      .attr("class", "state-boundary")
      .attr("d", path);

  svg.append("g")
      .attr("class", "brush")
      .call(brush)
      .call(brushed);
});

function brushed() {
  var e = brush.extent();
  
 var x1 = Math.round(-98.00 + e[0][0] / 80000.00);
 var y1 = Math.round(43.00 + e[0][1] / 80000.00);
 var x2 = Math.round(-98.00 + e[1][0] / 80000.00);
 var y2 = Math.round(43.00 + e[1][1] / 80000.00);
 var loc = [x1, y1, x2, y2];
 info.text("[ '" + formatNumber(x1)
      + "', '" + formatNumber(y1)
      + "', '" + formatNumber(x2)
      + "', '" + formatNumber(y2)
      + "' ]");
 feedHTML = '';
 socket.emit('brushed', loc);
}

function te(projection) {
  var radius = 6370997,
      scale = projection.scale(),
      rotate = projection.rotate(),
      translate = projection.translate(),
      offset = projection.rotate([0, 0]).translate([0, 0])([0, 0]);

  projection.rotate(rotate).translate(translate);

  return [
    Math.round((-offset[0] - translate[0]) / scale * radius),
    Math.round((offset[1] + translate[1] - height) / scale * radius),
    Math.round((-offset[0] - translate[0] + width) / scale * radius),
    Math.round((offset[1] + translate[1]) / scale * radius)
  ];
}



socket.on('renderTweets', function(stream) {
    
	var feeds = strdecode(stream);
	var tweetscreenname = feeds.user.name;
                var tweetusername = feeds.user.screen_name;
                var profileimage = feeds.user.profile_image_url_https;
                var status = feeds.text; 
				var isaretweet = false;
				var isdirect = false;
				var tweetid = feeds.id_str;
				 
				  var showdirecttweets = false;
    var showretweets = true;
    var showtweetlinks = true;
    var showprofilepic = true;
	            
			if (showtweetlinks == true) {
					status = addlinks(status);
									}
					feedHTML += '<div class="twitter-article">';                  
					feedHTML += '<div class="twitter-pic"><a href="https://twitter.com/'+tweetusername+'" ><img src="'+profileimage+'"images/twitter-feed-icon.png" width="42" height="42" alt="twitter icon" /></a></div>';
					feedHTML += '<div class="twitter-text"><p><span class="tweetprofilelink"><strong><a href="https://twitter.com/'+tweetusername+'" >'+tweetscreenname+'</a></strong> <a href="https://twitter.com/'+tweetusername+'" >@'+tweetusername+'</a></span><span class="tweet-time"><a href="https://twitter.com/'+tweetusername+'/status/'+tweetid+'">'+relative_time(feeds.created_at)+'</a></span><br/>'+status+'</p></div>';
					feedHTML += '</div>';
					
	
            $('#twitter-feed').html(feedHTML);
    });
         
    //Function modified from Stack Overflow
    function addlinks(data) {
        //Add link to all http:// links within tweets
        data = data.replace(/((https?|s?ftp|ssh)\:\/\/[^"\s\<\>]*[^.,;'">\:\s\<\>\)\]\!])/g, function(url) {
            return '<a href="'+url+'" >'+url+'</a>';
        });
             
        //Add link to @usernames used within tweets
        data = data.replace(/\B@([_a-z0-9]+)/ig, function(reply) {
            return '<a href="http://twitter.com/'+reply.substring(1)+'" style="font-weight:lighter;" >'+reply.charAt(0)+reply.substring(1)+'</a>';
        });
        return data;
    }
    

     
    function relative_time(time_value) {
      var values = time_value.split(" ");
      time_value = values[1] + " " + values[2] + ", " + values[5] + " " + values[3];
      var parsed_date = Date.parse(time_value);
      var relative_to = (arguments.length > 1) ? arguments[1] : new Date();
      var delta = parseInt((relative_to.getTime() - parsed_date) / 1000);
	  var shortdate = time_value.substr(4,2) + " " + time_value.substr(0,3);
      delta = delta + (relative_to.getTimezoneOffset() * 60);
     
      if (delta < 60) {
        return '1m';
      } else if(delta < 120) {
        return '1m';
      } else if(delta < (60*60)) {
        return (parseInt(delta / 60)).toString() + 'm';
      } else if(delta < (120*60)) {
        return '1h';
      } else if(delta < (24*60*60)) {
        return (parseInt(delta / 3600)).toString() + 'h';
      } else if(delta < (48*60*60)) {
        //return '1 day';
		return shortdate;
      } else {
        return shortdate;
      }
    }

    function strdecode( data ) {
  return JSON.parse( decodeURIComponent( escape ( data ) ) );
}
     
