var rootFolder	= null;
var pattern		= '';
var params		= ['status'];//['clone' ,'http://git.tasks.us.wak-apps.com/'];
var sysW		= null;
var response	= '';
var diff		= '';
var sysWDone	= true;
var arr			= [];

onconnect = function(msg) {
	var port = msg.ports[0];

	port.onmessage = function(evt) {
		var message = evt.data;
		var type 	= message.type;
		var data	= message.data;
		
		switch( type ) {
		
			case 'init':
				
				var vagrant	= loadText( data.extension + 'Vagrantfile' );
				var init	= loadText( data.extension + 'init.sh' );
				var strPort	= '  config.vm.network "forwarded_port", guest: {{PORT}}, host: {{PORT}}';
				var ports	= '';
				
				for ( var i in data.ports ) {
				
					ports	+= strPort.replace( /{{PORT}}/g , data.ports[i]) + '\n';
				
				};
				
				vagrant	= vagrant.replace( '{{PORTS}}' , ports );
				
				vagrant	= vagrant.replace( '{{BOX}}' , data.vm );
				
				saveText( vagrant , data.folder + 'Vagrantfile' );
				saveText( init , data.folder + 'init.sh' );
				saveText( data.url , data.folder + 'url' );
				saveText( data.relSolPath , data.folder + 'path' );
				
				break;
				
			case 'up':
				
				var cmd		= "vagrant up";
				
				run(cmd,data.folder);
				
				break;
				
			case 'output':

				port.postMessage({
				
					type : 'output',
					
					data : arr.slice(data.last).join(''),
					
					last : arr.length,
					
					done : sysWDone
				
				});
				
				diff = '';
				
				if ( sysWDone ) {
					
					this.close();
				
				}
			
				break;
		
		}
	}
	
	
	port.postMessage({type:'connected'});
}

function run( cmd , path ) {

	if ( sysWDone == true ) {
	
		sysWDone	= false;
	
	} else {
	
		return false;
	
	}
	
	sysW		= new SystemWorker ( cmd , path );
	
	sysW.setBinary( true );
	
	response	= '';
	diff		= '';
	
	sysW.onmessage = function ( e )
	{	
		
		var result = e.data.toString();
		
		arr.push( result );
		
		response 	+= result;
		
	}
	
	sysW.onerror = function ( e )
	{	
	
		var result = e.data.toString();	
		
		arr.push( result );
		
		response 	+= result;

	}
	
	sysW.onterminated = function ( e )
	{	
		
		sysWDone	= true;

	}

};