const MIN_GIF_ID_INC=100
const MAX_GIF_ID_INC=414

hf={
	
	randIntInc(min,max){
		min = Math.ceil(min)
		max = Math.floor(max)
		return Math.floor(Math.random() * (max - min + 1) + min)
	},

	hash(s){
		
		let h = 0;
		for (let i = 0; i < s.length; i++) {
			h = (h << 5) - h + s.charCodeAt(i)
			h |= 0
		}
		return h
	}	
	
}

my_ws={

	socket:0,

	child_added:{},
	child_changed:{},
	value_changed:{},
	child_removed:{},

	get_resolvers:{},
	get_req_id:0,
	reconnect_time:0,
	reconnect_timer:0,
	connect_resolver:0,
	sleep:0,
	keep_alive_timer:0,
	keep_alive_time:45000,
	req_id:1,
	close_callback:()=>{},
	connect_callback:()=>{},

	s_url:'',

	init(local){		

		if(local){
			game_name='corners'
			this.s_url=`ws://localhost:8443/corners/uid12432`
		}
		else
			this.s_url=`wss://timewebmtgames.ru:443/${game_name}/`+my_data.uid
		
		if(!game_name){
			alert('No game_name provided!')
			return
		}

		if(this.socket.readyState===1) return
		return new Promise(res=>{
			this.connect_resolver=res
			this.reconnect('init')
		})
	},

	safe_send(data){
		if (this.sleep||this.socket.readyState!==1) return
		this.socket.send(JSON.stringify(data))
		this.reset_keep_alive('safe_send')
	},

	send_to_sleep(){

		//fbs.ref('WSDEBUG/'+my_data.uid).push({tm:Date.now(),event:'send_to_sleep'});

		clearTimeout(this.keep_alive_timer)
		this.sleep=1
		this.socket.close(1000, 'sleep')
	},

	kill(){

		clearTimeout(this.keep_alive_timer)
		this.sleep=1
		this.socket.close(1000, 'kill')

	},

	reconnect(reason){

		if (this.socket) {
			this.socket.onopen = null
			this.socket.onmessage = null
			this.socket.onclose = null
			this.socket.onerror = null
			this.socket.close()
		}

		//this.open_tm=0
		this.sleep=0
		this.socket = new WebSocket(this.s_url)

		this.socket.onopen = () => {
			console.log('Connected to my_ws!')
			
			this.connect_resolver?.()
			this.reconnect_time=0
			//this.open_tm=Date.now()

			//обновляем подписки
			for (const path in this.child_added) this.safe_send({cmd:'ca',path})
			for (const path in this.child_changed) this.safe_send({cmd:'cc',path})
			for (const path in this.child_removed) this.safe_send({cmd:'cr',path})
			for (const path in this.value_changed) this.safe_send({cmd:'vc',path})

			this.reset_keep_alive('onopen');
			this.connect_callback(reason)
		};

		this.socket.onmessage = e => {

			const msg=JSON.parse(e.data);
			//console.log("Получено от сервера:", msg);

			//вызов коллбэк функции для нода если она подписана
			if (msg.event==='ca') this.child_added[msg.node]?.(msg)
			if (msg.event==='cc') this.child_changed[msg.node]?.(msg)
			if (msg.event==='cr') this.child_removed[msg.node]?.(msg)
			if (msg.event==='vc') this.value_changed[msg.node]?.(msg)
			if (msg.event==='get') this.get_resolvers[msg.req_id]?.(msg.data)
			if (msg.event==='get_tms') this.get_resolvers[msg.req_id]?.(msg.data)
			if (msg.event==='top_by_key') this.get_resolvers[msg.req_id]?.(msg.data)
			if (msg.event==='set') this.get_resolvers[msg.req_id]?.(1)
			if (msg.event==='push') this.get_resolvers[msg.req_id]?.(1)

		};

		this.socket.onclose = event => {

			clearTimeout(this.keep_alive_timer)
			
			//не восстанавливаем соединения если закрыто по команде
			if (['not_alive','no_uid','kill','sleep'].includes(event.reason)) return;
	
			if (this.reconnect_time<60_000)
				this.reconnect_time=this.reconnect_time+hf.randIntInc(1000,4000)
			
			console.log(`reconnecting in ${this.reconnect_time*0.001} seconds:`, event)
						
			clearTimeout(this.reconnect_timer)
			this.reconnect_timer=setTimeout(()=>{this.reconnect('re')},this.reconnect_time)
			
			this.close_callback()
		}

		this.socket.onerror = error => {
			
			console.warn('connection error',error)

		}

	},

	reset_keep_alive(reason){
		//console.log('reset_keep_alive',reason)
		clearTimeout(this.keep_alive_timer)
		this.keep_alive_timer=setTimeout(()=>{

			try{
				//fbs.ref('WSDEBUG/'+my_data.uid).push({tm:Date.now(),event:'keep_alive'});
				this.socket.send('1')
			}catch(e){
				//fbs.ref('WSDEBUG/'+my_data.uid).push({tm:Date.now(),event:'keep_alive_error'});
			}

			this.reset_keep_alive('timer')

		},this.keep_alive_time)

	},

	make_req(cmd, params = {}) {
		/*
			my_ws.make_req('get',{path:'players/debug100'})
			my_ws.make_req('set',{path:'players/debug100',val:{rating:100,name:'kamil',tm:'TMS'}})
			my_ws.make_req('remove',{path:'bg'})
			my_ws.make_req('remove_arr_elem',{path:'fb/debug100/2'})
			my_ws.make_req('push',{path:'chat',val:{uid:'admin',name:'Админ',msg,tm:'TMS'}})
			
		*/
		return new Promise(res => {
			
			if (this.sleep) res(null)
			
			this.req_id++
			
			const req_id=this.req_id

			const timeout = setTimeout(() => {
				delete this.get_resolvers[req_id]
				console.warn('Timeout on request: ',req_id)
				res(null);
			}, 5000);

			this.get_resolvers[req_id] = (data) => {
				delete this.get_resolvers[req_id]
				clearTimeout(timeout)
				res(data)
			};

			this.safe_send({cmd,req_id,...params})

		});
	},

	get(path, limit_last) {
		return this.make_req('get', {path, limit_last})
	},
	
	ref(path) {
		return {
			set: (val) => this.safe_send({cmd: 'set', path, val}),
			set_no_event: (val) => this.safe_send({cmd: 'set_no_event', path, val}),
			set_with_promise: (val) => this.make_req('set', {path, val}),
			inc: (val) => this.safe_send({cmd:'inc', path}),
			get: (limit_last = 20) => this.make_req('get', {path, limit_last}),
			push: (val) => this.safe_send({cmd: 'push', path, val}),
			remove: () => this.safe_send({cmd: 'remove', path}),
			ss_child_added:(callback)=>{
				this.safe_send({cmd:'ca',path})
				this.child_added[path]=callback
			},

			ss_child_changed:(callback)=>{
				this.safe_send({cmd:'cc',path})
				this.child_changed[path]=callback
			},

			ss_value_changed:(callback)=>{
				this.safe_send({cmd:'vc',path})
				this.value_changed[path]=callback
			},

			ss_child_removed:(callback)=>{
				this.safe_send({cmd:'cr',path})
				this.child_removed[path]=callback
			},

			value_changed_off:()=>{
				delete this.value_changed[path]
				this.safe_send({cmd:'vc_off',path})
			},

			child_added_off:()=>{
				delete this.child_added[path]
				this.safe_send({cmd:'ca_off',path})
			},

			child_changed_off:()=>{
				delete this.child_changed[path]
				this.safe_send({cmd:'cc_off',path})
			},

			child_removed_off:()=>{
				delete this.child_removed[path]
				this.safe_send({cmd:'cr_off',path})
			}
			
			
		};
	},

	get_tms() {
		return this.make_req('get_tms')
	},

	ss_child_added(path,callback){
		this.safe_send({cmd:'ca',path})
		this.child_added[path]=callback
	},

	ss_child_changed(path,callback){
		this.safe_send({cmd:'cc',path})
		this.child_changed[path]=callback
	},

	ss_value_changed(path,callback){
		this.safe_send({cmd:'vc',path})
		this.value_changed[path]=callback
	},

	ss_child_removed(path,callback){
		this.safe_send({cmd:'cr',path})
		this.child_removed[path]=callback
	},

	value_changed_off(path){
		delete this.value_changed[path]
		this.safe_send({cmd:'vc_off',path})
	},

	child_added_off(path){
		delete this.child_added[path]
		this.safe_send({cmd:'ca_off',path})
	},

	child_changed_off(path){
		delete this.child_changed[path]
		this.safe_send({cmd:'cc_off',path})
	},

	child_removed_off(path){
		delete this.child_removed[path]
		this.safe_send({cmd:'cr_off',path})
	},
}

safe_ls=function(key, val) {
	try {
		if (val === null || val===undefined) {
			const data = localStorage.getItem(key);
			if (!data) return null;
			try {
				return JSON.parse(data);
			} catch {
				return data;
			}
		} else {
			const storageValue = typeof val === 'string' ? val : JSON.stringify(val)
			localStorage.setItem(key, storageValue);
			return true;
		}
	} catch (e) {
		console.error(`Storage error for key "${key}":`, e);
		return null;
	}
}