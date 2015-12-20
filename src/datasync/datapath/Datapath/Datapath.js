(function(datapathFactories, fillerFactories, formatterFactories, subsetFactories, transformFactories, config, is, set, info){

	function Datapath(key, routeTemplate, configuration){

		this._key = key;

		//pipeline
		this._pipeline = {
			//unnamed pipeline steps
			formatter:null,
			filler:[],

			//named pipeline steps
			subset:{},
			transform:{}
		};

		this.route = (new datapathFactories.VirtualRoute(routeTemplate));
	}

	//TODO:remove this...
	Datapath.prototype._ = {};

	/*----------  Formatter Operations  ----------*/
	Datapath.prototype.getFormatter = function(){
		return this_pipeline.formatter;
	};

	Datapath.prototype.hasFormatter = function(){
		return (this._pipeline.formatter !== null);
	};

	Datapath.prototype.addFormatter = function(fn){

		//Are there any arguments?
		if(fn === undefined){
			info.warn("Calling [Datapath].addFormatter with no arguments. No action was taken.");

			return this;
		}
		//has the user provided a function as an argument to this function?
		else if(is.Function(fn) === false){
			info.warn("Calling [Datapath].addFormatter an argument other than a function. No action was taken.");

			return this;
		}
		//is the user attempting to overwrite a previously defined formatter on this datapath?
		else if(this.hasFormatter()){
			info.warn("Calling [Datapath].addFormatter caused Datasync to overwrite a formatter. Action was taken.");
		}

		//take the action
		this._pipeline.formatter = (new formatterFactories.Formatter(fn));

		return this;
	};

	/*----------  Filler Operations  ----------*/
	Datapath.prototype.getFiller = function(){
		return this_pipeline.filler;
	};
	
	Datapath.prototype.hasFiller = function(){
		return (this._pipeline.filler.length !== 0);
	};

	Datapath.prototype.addFiller = function(fn){
		//Are there any arguments?
		if(fn === undefined){
			info.warn("Calling [Datapath].addFiller with no arguments. No action was taken.");

			return this;
		}
		//has the user provided a function as an argument to this function?
		else if(is.Function(fn) === false){
			info.warn("Calling [Datapath].addFiller an argument other than a function. No action was taken.");

			return this;
		}

		//2] take the action
		this._pipeline.filler.push((new fillerFactories.Filler(fn)));

		return this;
	};


	/*----------  Subset Operations  ----------*/
	
	//multi level add API

	function addSubset_ml(self, name){
		return function(fn){
			return addSubset(self, name, fn);
		};
	}

	//single level add API (Used by multilevel)
	function addSubset(self, name, fn){
		//defend input
		if(is.String(name) === false){
			info.warn('Attempting to add a subset with an identifier that is not a string. The request was ignored. Operation will not be as expected.');
			return self;
		}
		else if(is.Function(fn) === false){
			info.warn('Attempting to add a subset['+name+'] with an invalid predicate. Expecting a predicate of type [Function]');
			return self;
		}
		//is this overwriting another subset? (non breaking)
		else if(self._pipeline.subset[name] !== undefined){
			info.warn('Providing multiple definitions for subset ['+name+']. Took the action.');
		}

		//take action
		self._pipeline.subset[name] = (new subsetFactories.Subset(name, fn));

		return self;
	}

	//add public facing interface
	Datapath.prototype.getSubset = function(key){
		if(key === undefined) return set.values(this._pipeline.subset);
		else return this._pipeline.subset[key];
	};

	Datapath.prototype.addSubset = function(subsetName, fn){

		//do we have valid input?
		if(subsetName === undefined){
			info.warn("Calling [Datapath].addSubset with no arguments. No action was taken.");
			return this;
		}
		//are we using single level accessor?
		else if(fn !== undefined)
			return addSubset(this, subsetName, fn);
		//they must want a multi-level accessor
		else
			return addSubset_ml(this, subsetName);

	};

	/*----------  Transform Operation  ----------*/

	function addTransform_ml(self, name){
		return function(fn){
			return addTransform(self, name, fn);
		};
	}

	//single level add API (Used by multilevel)
	function addTransform(self, name, fn){
		
		//is name valid?
		if(is.String(name) === false){
			info.warn('Attempting to add a transform with an identifier that is not a string. The request was ignored. Operation will not be as expected.');
			return self;
		}
		//is fn valid?
		else if(is.Function(fn) === false){
			info.warn('Attempting to add a transform['+name+'] with an invalid transform. Expecting a transform of type [Function]. The request was ignored. Operation will not be as expected.');
			return self;
		}
		//is this overwriting another transform? (non breaking)
		else if(self._pipeline.transform[name] !== undefined){
			info.warn('Providing multiple definitions for transform ['+name+']. Took the action.');
		}

		//take action
		self._pipeline.transform[name] = (new transformFactories.Transform(name, fn));

		return self;
	}

	//add public facing interface
	Datapath.prototype.addTransform = function(name, fn){

		//do we have valid input?
		if(name === undefined){
			info.warn("Calling [Datapath].addTransform with no arguments. No action was taken.");
			return this;
		}
		//are we using single level accessor?
		else if(fn !== undefined)
			return addTransform(this, name, fn);
		//they must want a multi-level accessor
		else
			return addTransform_ml(this, name);

	};

	Datapath.prototype.getTransform = function(key){
		if(key === undefined) return set.values(this._pipeline.transform);
		else return this._pipeline.transform[key];
	};


	/*----------  Configure hooks  ----------*/
	Datapath.prototype.setCacheSize = function(size){
		config.cacheSize.set(this._key, size);
		
		return this;
	};

	/*----------  utilities  ----------*/
	
	//alias this class in factories
	datapathFactories.Datapath = Datapath;

})(
	_private('datapath.factory'), 

	_private('datapath.pipeline.filler.factory'), 
	_private('datapath.pipeline.formatter.factory'),
	_private('datapath.pipeline.subset.factory'),
	_private('datapath.pipeline.transform.factory'),  
	
	_private('datapath.config'),

	_private('util.is'),
	_private('util.set'),
	_private('info')
);
