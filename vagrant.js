var pWakanda 		= document.getElementById('wakanda');
var submit			= document.getElementById('submit');
var distro			= document.getElementById('distro');
var ports			= document.getElementById('ports');
var url				= '';
var separator		= '\n***************';
var wakandaLinks	= false;

var branches	= {

	"Production" 	: "http://download.wakanda.org/ProductionChannel/",
	
	"Dev"			: "http://download.wakanda.org/DevChannel/Main/",
	
	"Stabilization"	: "http://download.wakanda.org/StabilizationChannel/"

};

var init		= document.getElementById('init');
var up			= document.getElementById('up');

up.onclick = function(){
	
	studio.sendCommand('vagrant.up');
	
	function check(){
	
		studio.sendCommand( 'vagrant.worker_output' );
		
		var output		= studio.extension.storage.getItem( 'test' );
		var textarea	= document.getElementById('output');
		
		if ( output ) {
		
			textarea.value += output;
		
		}
		
		if ( ! studio.extension.storage.getItem( 'done' ) ) {
		
			setTimeout( check , 500 );
		
		} else if( studio.extension.storage.getItem( 'done' ) == true ) {
		
			textarea.value += separator;
		
		}
		
		textarea.scrollTop = textarea.scrollHeight;
	
	};
	
	check();

};

init.onclick = function(){
	
	studio.extension.storage.setItem( 'vm' , distro.value );
	studio.extension.storage.setItem( 'url' , url );
	studio.extension.storage.setItem( 'ports' , '[' + ports.value + ']' );
	
	studio.sendCommand('vagrant.init');

	document.getElementById('output').value += separator;

};

submit.onclick = function(){

	var next = pWakanda.getElementsByClassName('next')[0];
	
	if ( next ) {
	
		if ( url ) {
		
			url	+= next.value;
		
		} else {
		
			var branche	= document.getElementById('value').value;
		
			url	= branches[ branche ];
		
		}
		
		if ( !wakandaLinks ) {
		
			getLink( url );
			
		} else {
		
			document.getElementById('output').value += '\n' + url;
			document.getElementById('output').value += separator;
		
		}
	
	}

};

function getLink( url ) {
	
	var result	= parse( url );
	
	if ( result.folders.length == 0 ) {
	
		createSelect( result.files );
		
		wakandaLinks	= true;
	
	} else {
	
		createSelect( result.folders );
		
		return false;
	
	}

}

function createSelect( array ){

	var select	= document.getElementById('value');
	
	var html	= '';
	
	for ( var i in array ) {
	
		html += '<option value="%value%">%value%</option>'.replace(/%value%/g,array[i]);
	
	}
	
	html = '<select id="value" class="next">' + html + '</select>';
	
	document.getElementById('wakanda').innerHTML = html;

}

function parse( url ){
	
	var xhr	= new XMLHttpRequest();
	
	xhr.open( 'GET' , url , false );
	
	xhr.send();
	
	var response	= xhr.responseText;
	var occurence	= null;
	var folders		= [];
	var files		= [];
	var re 			= new RegExp('<td><a href="([^"]*)"','g');
	var first 		= true;
	
	while ((occurence = re.exec(response)) !== null)
	{
	  if ( first ) {
		
		first	= false;
		
		continue;
	  
	  };
	  
	  if ( occurence[1].match(/.*\/$/) ) {
	  
		folders.push( occurence[1] );
	  
	  } else {
	  
		files.push( occurence[1] );
	  
	  };
	  
	}

	return {
	
		files	: files,
		
		folders	: folders
	
	};
}