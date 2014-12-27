
exports.handleMessage = function handleMessage(message)
{
    if (message.action == 'openUI') {
        studio.extension.openPageInTab('index.html', 'Vagrant', true);
    }
	
	//studio.alert(message.action);
	
	switch ( message.action ) {
		
		case 'openUI':
			studio.extension.openPageInTab('index.html', 'Vagrant', true);
			break;
		case 'init':
			var sh		= new SharedWorker( studio.extension.getFolder().path + 'worker.js' , 'test' );
			var port	= sh.port;			
			
			port.onmessage = function (evt) {
				var message = evt.data;
				
				if ( message.type == 'connected' ) {
					
					
					var solFile			= studio.currentSolution.getSolutionFile();
					var parentFolder	= solFile.parent.parent;
					var relSolFilePath	= solFile.path.replace( parentFolder.path , '' );

					port.postMessage({
						type: 'init',
						data: {
						
							extension	: studio.extension.getFolder().path,
						
							folder		: studio.currentSolution.getSolutionFile().parent.parent.path,
							
							vm			: studio.extension.storage.getItem( 'vm' ),
							
							url			: studio.extension.storage.getItem( 'url' ),
							
							relSolPath	: relSolFilePath,
							
							ports		: JSON.parse( studio.extension.storage.getItem( 'ports' ) )
						
						}
					});
					
					exitWait();
				
				}
				
			};
			
			wait(5000);
			
			break;
			
		case 'up':
			var sh		= new SharedWorker( studio.extension.getFolder().path + 'worker.js' , 'test' );
			var port	= sh.port;			
			
			port.onmessage = function (evt) {
				var message = evt.data;
				
				if ( message.type == 'connected' ) {
				
					port.postMessage({
						type: 'up',
						data: {
						
							folder	: studio.currentSolution.getSolutionFile().parent.parent.path
						
						}
					});
					
					exitWait();
				
				}
				
			};
			
			wait(5000);		
			
			break;
			
		case 'worker_output':
			
			studio.extension.storage.setItem( 'test' , '' );
		
			var sh		= new SharedWorker( studio.extension.getFolder().path + 'worker.js' , 'test' );
			var port	= sh.port;			
			
			port.onmessage = function (evt) {
				var message = evt.data;
				//studio.alert(JSON.stringify(message));
				switch ( message.type ) {
				
					case 'connected':
						
						port.postMessage({
							type: 'output',
							
							data : {
								last : studio.extension.storage[ 'last' ] || 0
							}
						});
						
						break;
						
					case 'output':
						
						studio.extension.storage.setItem( 'last' , message.last );
						studio.extension.storage.setItem( 'test' , message.data );
						studio.extension.storage.setItem( 'done' , message.done );
						
						exitWait();
						
						break;
				
				}
				
			};
			
			wait(1000);		
			//studio.alert('waited');
			break;
	}
}

