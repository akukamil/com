const WebSocket = require('ws');
const fs = require('fs');
const https = require('https');

//SSL сертификат
const serverConfig= (() => {
	try {
		return {
			cert: fs.readFileSync('/etc/letsencrypt/live/timewebmtgames.ru/fullchain.pem'),
			key: fs.readFileSync('/etc/letsencrypt/live/timewebmtgames.ru/privkey.pem')
		};
	} catch {
		console.error('SSL cert files not found');
	}
})();

const tms=()=>{return new Date().toLocaleString('ru-RU').replace(/[:,. ]/g, '-')};

class batch_logger_class{

	constructor(name){
		console.log(tms(),`${name} logger created!`);
		this.cur_stream=0;
		this.cur_file=0;
		this.logs=[];
		this.name=name;
		this.last_flush_tm=0;
		fs.mkdirSync('my_logs/'+this.name, { recursive: true });
		this.create_new_stream();
	}

	async create_new_stream(){

		if (this.cur_stream){

			this.cur_stream.end();
			await new Promise(res=>{
				this.cur_stream.on('finish', () => {res()});
			})

			const ts = tms();

			await new Promise(res=>{
				fs.rename(`my_logs/${this.name}/cur.log`,`my_logs/${this.name}/${ts}.log`, (err) => {
					if (err)
						console.log('rename error',err);
					res();
				});
			})
		}

		this.cur_file=`my_logs/${this.name}/cur.log`;
		this.cur_stream = fs.createWriteStream(this.cur_file, { flags: 'a' });
	}

	async check_file_size(){
		//должен быстро проверять размер
		try {
			const stats = await fs.promises.stat(this.cur_file);
			const tm=Date.now();
			if (stats.size >= 150000) {
				this.create_new_stream();
			}
		} catch (error) {
			console.error('Error checking file size:', error);
		}
	}

	flush_logs(){

		if (this.logs.length===0) return;

		//не вызывать слишком часто
		this.last_flush_tm=Date.now();
		const joined_logs=this.logs.join('\n')+'\n';
		this.logs = [];
		this.cur_stream.write(joined_logs,err=>{
			if (!err) {
				this.check_file_size();
			} else {
				console.error('cur_stream write error:', err);
			}
		})
	}

	log(...args){

		const message = new Date().toLocaleString('ru-RU')+': '+args.map(arg =>
			typeof arg === 'object'?JSON.stringify(arg) : String(arg)
		).join(' ');
		
		this.logs.push(message);
		const tm_since_last_flush=Date.now()-this.last_flush_tm;

		if ((this.logs.length >=50&&tm_since_last_flush>5000)||tm_since_last_flush>60000)
			this.flush_logs();
	}
	
	log_inst(...args){

		//это для редких сообщений, сразу записываем
		const message = new Date().toLocaleString('ru-RU')+': '+args.map(arg =>
			typeof arg === 'object'?JSON.stringify(arg) : String(arg)
		).join(' ')+'\n';
		
		this.cur_stream.write(message,err=>{
			if (err)
				console.error('cur_stream write error:', err);
		})		
	}	

}

//логгеры
const loggers={};

loggers.chat=new batch_logger_class('chat');
loggers.sys=new batch_logger_class('sys');
loggers.slots=new batch_logger_class('slots');

function str_to_obj(str) {
	try {
		return JSON.parse(str);
	} catch (e) {
		return str;
	}
}

const g={};

class g_class{

	constructor(game){

		this.game=game
		this.clients=[]
		this.db={}
		g[game]=this
		this.load()
	}

	load() {

		try {
			const data = fs.readFileSync('./dbs/'+this.game+'.json', 'utf8')
			this.db = JSON.parse(data)
			//set_def_array_size(this.db)
			loggers.sys.log(this.game+' db loaded!')
		} catch (error) {
			if (error.code === 'ENOENT')
				loggers.sys.log_inst(this.game+' db not found, starting fresh')
			else
				loggers.sys.log_inst(this.game+' error loading database:', error)
		}

	}

	async save() {
		try {

			//сохраняем данные--------
			const tar_file='dbs/'+this.game+'.json'
			await fs.promises.writeFile(tar_file, JSON.stringify(this.db), 'utf8')
			loggers.sys.log(this.game+' db saved!')

			//удаляем мертвых клиентов
			const tm=Date.now()
			const games_stat={}
			
			for (let i = this.clients.length-1; i >= 0; i--){
				
				const c=this.clients[i]
				if(c.last_alive&&tm-c.last_alive>300000){
					loggers.sys.log('closing: ',this.game,c.uid,tm-c.last_alive)
					c.close(1000,'not_alive')
					this.clients.splice(i, 1);
				}
			}			

			loggers.sys.log('con_stat: ',this.game,this.clients.length)

		} catch (error) {
			loggers.sys.log('error saving db:', error)
		}
	}

	get_nested_value(path,limit_last){

		if (path==='')
			return this.db

		let path_split=path.split('/')
		const path_len=path_split.length
		if (path_len===1)
			path_split=[path]

		let ref_node=this.db

		for (let i=0;i<path_len;i++){
			ref_node=ref_node[path_split[i]]
			if (!ref_node) return null
		}

		//если это масссив и задано сколько нужно значений
		if (limit_last&&Array.isArray(ref_node))
			return ref_node.slice(-limit_last)

		return ref_node
	}

	process(path,event,val){

		if (event==='ca'){
			let data=0
			this.clients.forEach(c => {
				if(c.ca_ss[path]){
					if(!data) data=JSON.stringify({...val,event,node:path})
					c.send(data)
				}
			})
			return;
		}

		if (event==='cc'){
			let data=0
			this.clients.forEach(c => {
				if(c.cc_ss[path]){
					if(!data) data=JSON.stringify({...val,event,node:path})
					c.send(data)
				}
			})
			return;
		}

		if (event==='cr'){
			let data=0
			this.clients.forEach(c => {
				if(c.cr_ss[path]){
					if(!data) data=JSON.stringify({k:val,event,node:path})
					c.send(data)
				}
			})
			return;
		}

		if (event==='vc'){
			let data=0
			this.clients.forEach(c => {
				if(c.vc_ss[path]){
					if(!data) data=JSON.stringify({val,event,node:path})
					c.send(data)
				}
			})
			return;
		}

	}

	push(path,val){

		const path_arr=path.split('/')
		const path_len=path_arr.length
		
		//---
		let max_arr_size=30
		if (path_arr[0]==='fb')
			max_arr_size=10


		//получаем или создаем последний нод пути
		let cur_node=this.db
		for (let i=0;i<path_len;i++){
			const key=path_arr[i]
			if (!cur_node[key]){
				if (i===path_len-1){
					cur_node[key]=[]
				}else{
					cur_node[key]={}
				}
			}
			cur_node=cur_node[key]
		}

		//добавляем значение в массив
		cur_node.push(val)

		//удаляем старое
		while(cur_node.length>max_arr_size)
			cur_node.shift()

		//это скорее всего чат поэтому изменение родительских нодов не анонсируем
		this.process(path,'ca',val)

	}

	set(path_url,val){

		const path=path_url.split('/')
		const path_len=path.length
		for (let i=0;i<path_len;i++){
			if(!isNaN(path[i]))
				path[i]=Number(path[i])
		}

		//уровень 0 - не анонсируем, какой бы длинный не был путь
		let node0=this.db[path[0]];
		if (!node0){
			this.set_rec(path,val)
			return
		}else{
			if(path.length===1){
				this.set_rec(path,val)
				return
			}
		}

		//уровень 2 ключа и значение
		let node1=node0[path[1]]
		const path_str0=path[0]
		if (!node1){
			this.set_rec(path,val)
			node1=node0[path[1]]
			this.process(path_str0,'ca',{k:path[1],v:node1})

			this.process(path_str0,'vc',node0)

			return;
		}else{
			if(path.length===2){
				this.set_rec(path,val)
				node1=node0[path[1]]
				this.process(path_str0,'cc',{k:path[1],v:node1})

				this.process(path_str0,'vc',node0)
				this.process(path_str0+'/'+path[1],'vc',node1)
				return;
			}
		}

		//уровень 3 ключа и значение
		let node2=node1[path[2]]
		const path_str1=path_str0+'/'+path[1]
		if (!node2){
			this.set_rec(path,val)
			node2=node1[path[2]]

			this.process(path_str0,'cc',{k:path[1],v:node1})
			this.process(path_str1,'ca',{k:path[2],v:node2})

			this.process(path_str0,'vc',node0)
			this.process(path_str1,'vc',node1)
			return
		}else{
			if(path.length===3){
				this.set_rec(path,val)
				node2=node1[path[2]]

				this.process(path_str0,'cc',{k:path[1],v:node1})
				this.process(path_str1,'cc',{k:path[2],v:node2})

				this.process(path_str0,'vc',node0)
				this.process(path_str1,'vc',node1)
				this.process(path_str1+'/'+path[2],'vc',node2)
				return
			}
		}

		//уровень 4 ключа и значение
		let node3=node2[path[3]]
		const path_str2=path_str1+'/'+path[2]
		if (!node3){
			this.set_rec(path,val)
			node3=node2[path[3]]

			this.process(path_str0,'cc',{k:path[1],v:node1})
			this.process(path_str1,'cc',{k:path[2],v:node2})
			this.process(path_str2,'ca',{k:path[3],v:node3})

		//	this.process(path_str0,'vc',node0)
			this.process(path_str1,'vc',node1)
			this.process(path_str2,'vc',node2)
			return;
		}else{
			if(path.length===4){
				this.set_rec(path,val)
				node3=node2[path[3]]

				this.process(path_str0,'cc',{k:path[1],v:node1})
				this.process(path_str1,'cc',{k:path[2],v:node2})
				this.process(path_str2,'cc',{k:path[3],v:node3})

			//	this.process(path_str0,'vc',node0)
				this.process(path_str1,'vc',node1)
				this.process(path_str2,'vc',node2)
				this.process(path_str2+'/'+path[3],'vc',node3)
				return
			}
		}

	}

	set_no_event(path_url,val){

		//без всяких событий
		const path=path_url.split('/')
		const path_len=path.length
		this.set_rec(path,val)

	}

	top3(path_url,data){

		//без всяких событий
		const cur_top=this.get_nested_value(path_url)
		if(!cur_top) return

		const entries=Object.entries(cur_top);
		if (entries.length<3){
			cur_top[data.uid] = data.val
			return;
		}

		//определяем минимум
		let min_uid = null
		let min_val = 999999
		for (const [uid, val] of entries) {
			if (val < min_val) {
				min_val = val
				min_uid = uid
			}
		}

		// If new level is higher than minimum, replace it
		if (data.val > min_val) {
			//если новый ид то убираем минимальный
			if (!cur_top[data.uid])
				delete cur_top[min_uid]
			cur_top[data.uid] = data.val
		}

	}

	clear_by_tm(path,timeout=100_000_000,notify=0){

		//удаляем по значению tm
		const data_to_clean=this.get_nested_value(path)
		if (data_to_clean === null || typeof data_to_clean !== 'object') return
		
		const tm=Date.now()
		
		for (const key of Object.keys(data_to_clean)){
			
			const data=data_to_clean[key]
			if (data&&data.tm){
				if (tm-data.tm>timeout)
					this.remove(path+'/'+key,notify)
			}
		}
	}

	clear_fb(timeout=1296000_000){
		
		const fb=this.db.fb
		if (!fb) return
		
		const tm=Date.now()
		for (const uid in fb){
			
			const fb_arr=fb[uid]
			
			for (let i=fb_arr.length-1;i>=0;i--){
				if (tm-fb_arr[i].tm>timeout) {
					fb_arr.splice(i, 1);
				}
			}
			
			if (!fb_arr.length)
				delete fb[uid]
		}
	}

	top_by_key(path,tar_key='rating',limit=20){

		const data = this.get_nested_value(path)

		if (!data || typeof data !== 'object') return null
		
		const top = [];

		for (const key in data) {
			const item = data[key];

			if (!item || typeof item !== 'object') continue;

			const value = item[tar_key];

			if (typeof value !== 'number') continue

			if (top.length < limit) {
				top.push({ key, [tar_key]: value });
				top.sort((a, b) => a[tar_key] - b[tar_key]);
				continue;
			}

			if (value > top[0][tar_key]) {
				top[0] = { key, [tar_key]: value };
				top.sort((a, b) => a[tar_key] - b[tar_key]);
			}
		}

		return top.reverse()
		
	}

	remove(path_url,notify){

		const path=path_url.split('/')
		const path_len=path.length

		const path_str0=path[0]
		const node0=this.db[path[0]]		
		if(!node0) return
		if (path_len===1){
			delete this.db[path[0]]
			return;
		}

		const path_str1=path_str0+'/'+path[1]
		const node1=node0[path[1]]	
		if(!node1) return;
		if (path_len===2){
			delete node0[path[1]]
			if(!notify) return
			this.process(path_str0,'vc',node0)
			this.process(path_str0,'cr',path[1])
			return;
		}

		const path_str2=path_str1+'/'+path[2]
		const node2=node1[path[2]];		
		if(!node2) return;
		if (path_len===3){
			delete node1[path[2]]
			if(!notify) return
			this.process(path_str0,'vc',node0)
			this.process(path_str1,'vc',node1)
			this.process(path_str1,'cr',path[2])
			return;
		}

		const path_str3=path_str2+'/'+path[3]
		const node3=node2[path[3]];		
		if(!node3) return;
		if (path_len===4){
			delete node2[path[3]];
			if(!notify) return
			this.process(path_str0,'vc',node0)
			this.process(path_str1,'vc',node1)
			this.process(path_str2,'vc',node2)
			this.process(path_str2,'cr',path[3])
			return;
		}

	}
	
	remove_arr_elem(path_url){

		//удаление элементов, пока не анонсируем
		const path=path_url.split('/')
		const path_len=path.length
		let ref_node=this.db
		
		//получаем нод перед индексом который нужно удалить
		for (let i=0;i<path_len-1;i++){
			ref_node=ref_node[path[i]]
			if (!ref_node) return 0
		}
		
		if(!Array.isArray(ref_node)) return 0
		
		const index_to_remove=+path[path_len-1]
		if (!Number.isFinite(+index_to_remove)) return 0
			
		ref_node.splice(index_to_remove,1)
	}

	set_rec(path_arr,val){

		//рекурсивно устанваливаем значение
		const path_len=path_arr.length;
		let cur_node=this.db;
		for (let i=0;i<path_len;i++){
			const key=path_arr[i];
			if (!cur_node[key]||typeof(cur_node[key])!=='object'){
				if (i===path_len-1){
					cur_node[key]=str_to_obj(val);
					break;
				}
				else
					cur_node[key]={};
			}else{
				if (i===path_len-1){
					cur_node[key]=str_to_obj(val);
					break;
				}
			}
			cur_node=cur_node[key];
		}
	}

	remove_client(client){
		for (let i = this.clients.length-1;i>=0;i--){
			if (this.clients[i]===client){
				this.clients.splice(i, 1);
				return;
			}
		}
	}

	try_add_client(client){

		const tm1=Date.now();

		//ищем дубликаты
		this.clients.forEach(c => {
			if (c.uid === client.uid&&c.last_alive) {
				loggers.sys.log('dub_found: ',this.game,c.uid,tm1-c.last_alive);
				c.close(4001,'dub');
			}
		});

		this.clients.push(client);

		client.last_alive=tm1;

		client.ca_ss={};
		client.cr_ss={};
		client.cc_ss={};
		client.vc_ss={};
		client.on_close={};

		//сообщения от клиентов
		client.on('message', data => {

			const tm=Date.now();

			//для поддержки соединения
			client.last_alive=tm

			const msg_str=data.toString()
			
			if (msg_str==='1') return			
			
			const msg=JSON.parse(msg_str, (k, v) => {
				return v === 'TMS' ? tm : v
			});

			//batch.log(ws.game,ws.uid,msg);

			if (msg.cmd==='new_logger'){
				loggers[msg.game]=new batch_logger_class(msg.game);
				console.log('new logger created',msg.game);
				return
			}

			if (msg.cmd==='log'){
				if (!loggers[msg.logger])
					loggers[msg.logger]=new batch_logger_class(msg.logger);
				loggers[msg.logger].log(msg.data);
				return
			}

			if (msg.cmd==='log_inst'){
				if (!loggers[msg.logger])
					loggers[msg.logger]=new batch_logger_class(msg.logger);
				loggers[msg.logger].log_inst(msg.data);
				return
			}

			if (msg.cmd==='set'){
				//batch.log('set command received...');
				this.set(msg.path,msg.val)
				
				//отправляем подтверждение
				if(msg.req_id)
					client.send(JSON.stringify({event:'set',req_id:msg.req_id}))
				return
			}
			
			if (msg.cmd==='inc'){
				this.inc(msg.path)
				return
			}			
			
			if (msg.cmd==='set_no_event'){
				//console.log('set_no_event command received...');
				this.set_no_event(msg.path,msg.val);
				return
			}

			if (msg.cmd==='top3'){
				//loggers.sys.log('top3_command: ',msg.path,msg.val);
				this.top3(msg.path,msg.val);
				return
			}

			if (msg.cmd==='clear_by_tm'){
				this.clear_by_tm(msg.path,msg.timeout,msg.notify);
				return
			}

			if (msg.cmd==='top_by_key'){
				const data=this.top_by_key(msg.path,msg.key,msg.limit);
				client.send(JSON.stringify({event:'top_by_key',data,req_id:msg.req_id}));
				return
			}

			if (msg.cmd==='clear_fb'){
				this.clear_fb(msg.timeout)
				return
			}

			if (msg.cmd==='push'){
				if (msg.path==='chat')
					loggers.chat.log(this.game,msg.val)
				this.push(msg.path,msg.val)
				return
			}

			if (msg.cmd==='remove'){
				//batch.log('remove command received...');
				this.remove(msg.path);
				return
			}
			
			if (msg.cmd==='remove_arr_elem'){
				//batch.log('remove command received...');
				this.remove_arr_elem(msg.path);
				return
			}

			if (msg.cmd==='get'){
				client.send(JSON.stringify({event:'get',data:this.get_nested_value(msg.path,msg.limit_last),req_id:msg.req_id}));
				return
			}

			if (msg.cmd==='get_tms'){
				const data=Date.now();
				client.send(JSON.stringify({event:'get_tms',data,req_id:msg.req_id}));
				return
			}

			if (msg.cmd==='on_close'){
				
				client.on_close[msg.path]=msg.action||1;
				return
			}

			if (msg.cmd==='vc'){
				client.vc_ss[msg.path]=1;
				return
			}

			if (msg.cmd==='ca'){
				client.ca_ss[msg.path]=1;
				return
			}

			if (msg.cmd==='cc'){
				client.cc_ss[msg.path]=1;
				return
			}

			if (msg.cmd==='cr'){
				client.cr_ss[msg.path]=1;
				return
			}

			if (msg.cmd==='vc_off'){
				client.vc_ss[msg.path]=0;
				return
			}

			if (msg.cmd==='ca_off'){
				client.ca_ss[msg.path]=0;
				return
			}

			if (msg.cmd==='cc_off'){
				client.cc_ss[msg.path]=0;
				return
			}

			if (msg.cmd==='cr_off'){
				client.cr_ss[msg.path]=0;
				return
			}

		});
		
		// Handle client disconnection
		client.on('close', (code,reason) => {
			loggers.sys.log('close_con: ',this.game,client.uid,code||'-',reason||'-');
			
			for (let path in client.on_close) this.remove(path,1)
			client.on_close=null
		
			// Clear all subscriptions
			client.ca_ss = null
			client.cr_ss = null
			client.cc_ss = null
			client.vc_ss = null
		
			// Remove all listeners
			client.removeAllListeners('message');
			client.removeAllListeners('error');
			client.removeAllListeners('close');

			this.remove_client(client);

		});

		// Handle errors
		client.on('error', (error) => {
			loggers.sys.log(this.game,client.uid,'ws_error:', error);
		});

	}

}

//загружаем базы данные с диска
fs.readdir('./dbs', (err, files) => {
	if (err) {
		console.error('Error reading directory:', err);
		return;
	}

	// Process each file one by one
	files.forEach(file=>{
		const [game,ext]=file.split('.');
		if (ext==='json')
			new g_class(game);
	});
});
 
// создаем HTTP сервер
const server = https.createServer(serverConfig);
 
//создаем WSS сервер
wss = new WebSocket.Server({server});

//периодически сохраняем и обновляем данные
setInterval(async () => {
	try {
		for (const db of Object.values(g)) {
			await db.save();
			await new Promise((resolve) => setTimeout(resolve, 10000));
		}
	} catch (error) {
		console.error("Failed to save a database:", error);
	}
}, 360000);

//новые сообщения
wss.on('connection', (ws,req) => {
	loggers.sys.log('new_conn: ',req.url,req.socket.remoteAddress);

	const user_data=req.url.split('/')
	let game='';
	ws.uid='no';
	if (user_data.length===3){
		game=user_data[1];
		const uid=user_data[2];
		ws.uid=uid;
	}

	if(user_data.length<3){
		ws.close(4000, 'no_uid');
		return;
	}

	//отправляем в соответствующую базу для дальнейшей обработки
	if (!g[game])
		new g_class(game);
	
	g[game].try_add_client(ws)

});

// Server-level error handling
wss.on('error', (error) => {
	console.log(tms(),'ws_server_error:', error);
});

const PORT=8443;
server.listen(PORT,'0.0.0.0',()=>{
	loggers.sys.log_inst(tms(),'сервер запущен!');
});