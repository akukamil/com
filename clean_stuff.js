let fbs;
game_name='pool';
my_data={uid:'debug100'};
fbs_data={
	corners:{
		apiKey: "AIzaSyAg2CtOlr78RSHpoSJGxPFbGymgjU4yIqY",
		authDomain: "corners-eu.firebaseapp.com",
		databaseURL: "https://corners-eu-default-rtdb.europe-west1.firebasedatabase.app",
		projectId: "corners-eu",
		storageBucket: "corners-eu.firebasestorage.app",
		messagingSenderId: "508429369691",
		appId: "1:508429369691:web:5bcb4d55969c98d5875a7e"	
	},
	chess:{
		apiKey: "AIzaSyDhe74ztt7r4SlTpGsLuPSPvkfzjA4HdEE",
		authDomain: "m-chess.firebaseapp.com",
		databaseURL: "https://m-chess-default-rtdb.europe-west1.firebasedatabase.app",
		projectId: "m-chess",
		storageBucket: "m-chess.appspot.com",
		messagingSenderId: "243163949609",
		appId: "1:243163949609:web:2496059afb5d1da50c4a38",
		measurementId: "G-ETX732G8FJ"
	},
	balda:{
		apiKey: "AIzaSyAFBbluhUs_MMWgz8OevYqAvLWjVe2YL-A",
		authDomain: "balda-810c3.firebaseapp.com",
		databaseURL: "https://balda-810c3-default-rtdb.europe-west1.firebasedatabase.app",
		projectId: "balda-810c3",
		storageBucket: "balda-810c3.appspot.com",
		messagingSenderId: "67392486991",
		appId: "1:67392486991:web:e3b8b40f8c48670c1df43a"
	},
	durak:{
		apiKey: "AIzaSyBQUa5_8Y199x5xT91sZMsPoD59fOmKckU",
		authDomain: "durak-ca1cd.firebaseapp.com",
		databaseURL: "https://durak-ca1cd-default-rtdb.europe-west1.firebasedatabase.app",
		projectId: "durak-ca1cd",
		storageBucket: "durak-ca1cd.appspot.com",
		messagingSenderId: "985954923087",
		appId: "1:985954923087:web:ac332499e962122d28303a"
	},
	snow_words:{
		apiKey: "AIzaSyCDV8ndfTwbMq1jAv2VGxrWHLZ0mtvZJmQ",
		authDomain: "word-battle-7c6b5.firebaseapp.com",
		databaseURL: "https://word-battle-7c6b5-default-rtdb.europe-west1.firebasedatabase.app",
		projectId: "word-battle-7c6b5",
		storageBucket: "word-battle-7c6b5.appspot.com",
		messagingSenderId: "851590264454",
		appId: "1:851590264454:web:e7185c5fa1fa1b32b68307"
	},
	poker:{
		apiKey:"AIzaSyChGIR5Wnw3WMat7MqOD_eHQKkT3AAbUE",
		authDomain: "pkr2-584b2.firebaseapp.com",
		databaseURL: "https://pkr2-584b2-default-rtdb.europe-west1.firebasedatabase.app",
		projectId: "pkr2-584b2",
		storageBucket: "pkr2-584b2.firebasestorage.app",
		messagingSenderId: "1059246829657",
		appId: "1:1059246829657:web:478f1005543df13e3fc148"
	},
	word_game:{
		apiKey: "AIzaSyDs76rLdiq2ouIfQwT_vLff-vYGdyeOLqw",
		authDomain: "word-connect-88656.firebaseapp.com",
		databaseURL: "https://word-connect-88656-default-rtdb.europe-west1.firebasedatabase.app",
		projectId: "word-connect-88656",
		storageBucket: "word-connect-88656.appspot.com",
		messagingSenderId: "783317843458",
		appId: "1:783317843458:web:5d6783ea5cc0a31b9db11b"
	},
	melody:{
		apiKey: "AIzaSyBG9xnBLS3eGtn7gy58hNVJBSBVUymxA0I",
		authDomain: "melody-4ab2b.firebaseapp.com",
		databaseURL: "https://melody-4ab2b-default-rtdb.europe-west1.firebasedatabase.app",
		projectId: "melody-4ab2b",
		storageBucket: "melody-4ab2b.appspot.com",
		messagingSenderId: "950545734258",
		appId: "1:950545734258:web:bddf99bf8907891702c0eb"
	},
	quoridor:{
		apiKey: "AIzaSyDwyhzpCq06nXWtzTfPZ86I0jI_iUedJDg",
		authDomain: "quoridor-e5c40.firebaseapp.com",
		databaseURL: "https://quoridor-e5c40-default-rtdb.europe-west1.firebasedatabase.app",
		projectId: "quoridor-e5c40",
		storageBucket: "quoridor-e5c40.appspot.com",
		messagingSenderId: "114845860106",
		appId: "1:114845860106:web:fa020d476b1f1c28853af3"
	},
	domino:{
		apiKey: "AIzaSyAlebXZrabhIEEK8y0Ro1U0SQyK3ViL0rc",
		authDomain: "domino-ad330.firebaseapp.com",
		databaseURL: "https://domino-ad330-default-rtdb.europe-west1.firebasedatabase.app",
		projectId: "domino-ad330",
		storageBucket: "domino-ad330.appspot.com",
		messagingSenderId: "535720490474",
		appId: "1:535720490474:web:c3bf5579887a3334bfee93"
	},
	pool:{
		apiKey: "AIzaSyDpyFhFCM2Wv7y9e6LycQTIkWl8RreNHI0",
		authDomain: "pool-f7e49.firebaseapp.com",
		databaseURL: "https://pool-f7e49-default-rtdb.europe-west1.firebasedatabase.app",
		projectId: "pool-f7e49",
		storageBucket: "pool-f7e49.appspot.com",
		messagingSenderId: "127048378193",
		appId: "1:127048378193:web:f06d24482d6a32a0d41570"
	},
	monopoly:{
		apiKey: "AIzaSyCXmV64Bydyie1QsViyBPprtfSe1qpljt4",
		authDomain: "monopoly-b6de9.firebaseapp.com",
		databaseURL: "https://monopoly-b6de9-default-rtdb.europe-west1.firebasedatabase.app",
		projectId: "monopoly-b6de9",
		storageBucket: "monopoly-b6de9.firebasestorage.app",
		messagingSenderId: "226062460929",
		appId: "1:226062460929:web:0afbd5f23cd9a76ee7f800"
	}
	
	
}

fbs_once=async (path)=>{
	const info=await fbs.ref(path).get();
	return info.val();	
}

fbs_connect=async (game, no_ws)=>{	


	game_name=game;
	
	if (firebase.apps.length)
		await firebase.app().delete();
	
	firebase.initializeApp(fbs_data[game]);	
	fbs=firebase.database();	
	
	if(no_ws) return
	
	if (my_ws.socket) my_ws.kill()
	my_ws.init()
	
}

tools={
		
	show_avatar(pic_url){
		const svgElement = document.getElementById('mySvg');
		svgElement.innerHTML = multiavatar(pic_url)
		svgElement.style.position='fixed'
		svgElement.style.top='450px'
	},
	
	async get_player_by_name(s_name){
		
		s_name=s_name.toUpperCase()
		if (!fbs_data[game_name].players)		
			fbs_data[game_name].players=await fbs_once('players')		
		const pdata=fbs_data[game_name].players				
				
		for (const uid in pdata){
			
			const player_data=pdata[uid]
			const name=(player_data?.name||'???').toUpperCase()
			if (name.includes(s_name)){
				console.log(uid,player_data)
			}			
		}			
		
	},
	
	async get_player_by_nameSTRICT(s_name){		
		
		s_name=s_name.toUpperCase()
		if (!fbs_data[game_name].players)		
			fbs_data[game_name].players=await fbs_once('players')		
		const pdata=fbs_data[game_name].players				
				
		for (const uid in pdata){
			
			const player_data=pdata[uid]
			const name=(player_data?.name||'???').toUpperCase()
			if (name===s_name){
				console.log(uid,player_data)
			}			
		}			
		
	},
			
	async get_player_by_part_of_uid(part_of_uid){
		
		if (!fbs_data[game_name].players)		
			fbs_data[game_name].players=await fbs_once('players')
		
		const pdata=fbs_data[game_name].players	
		for (const uid in pdata){
			if (uid.includes(part_of_uid))
				console.log(uid,pdata[uid])
		}
	},
		
	async check_crystals(){
		
		//если нету игроков
		if (!fbs_data[game_name].players)
			fbs_data[game_name].players = await fbs_once('players')	
		const players=fbs_data[game_name].players
		
		if (!players){
			addLog('Данные об игроках пустые...')
			return
		} 

		let total_removed=0
		const tm=Date.now()
			
		for (const uid of Object.keys(players)) {	
		
			const player=players[uid]
		
			//проверяем на валидность рейтинга
			if (player&&player.rating>1950) {
				
				const crystals=player.crystals
				const d=tm-player.c_prv_tm
				const days_passed=Math.floor(d/(1000*60*60))
				const cur_crystals=crystals-days_passed
				
				if (cur_crystals<-10) {
					await fbs.ref('players/'+uid+'/rating').set(1950)
					await fbs.ref('players/'+uid+'/crystals').set(0)
					console.log('Закончились кристаллы',player.name,player.rating)
				}	
			}	

		}
		
	},
		
	async remove_old(days_without_allowed=30){
		
		//если нету игроков
		if (!fbs_data[game_name].players)
			fbs_data[game_name].players = await fbs_once('players')	
		const players=fbs_data[game_name].players
		
		if (!players){
			addLog('Данные об игроках пустые...')
			return
		} 

		let total_removed=0
		const tm=Date.now()
			
		for (const uid of Object.keys(players)) {	
		
			const player=players[uid]
			
			//проверяем на валидность рейтинга
			if (player&&player.tm) {
				let days_without_visit=(tm-player.tm)/86400000
				if (days_without_visit>days_without_allowed) {
					await fbs.ref('players/'+uid).remove()
					console.log('Удален '+ uid + ' rating: '+ player.rating)
					total_removed++
				}	
			}	
			
			if (player&&(!player.tm)) {				
				await fbs.ref('players/'+uid).remove()
				player.tm=111
				console.log('INVALID: '+ uid + ' rating: '+ player.rating)
				total_removed++
			}				
		}
				
				
		addLog("Удалено старых игроков: "+total_removed)
		
		if (game_name==='durak'||game_name==='domino')
			await this.check_crystals()
		
	},
	
	async remove_old_poker(days_without_allowed=30){
		
		//если нету игроков		
		if (!fbs_data[game_name].players)
			fbs_data[game_name].players = await fbs_once('players')	
		const players=fbs_data[game_name].players
		
		if (!players){
			addLog('Данные об игроках пустые...')
			return
		} 

		let total_removed=0
		const tm=Date.now()
			
		for (const uid of Object.keys(players)) {	
		
			const player=players[uid]
			
			//проверяем на валидность рейтинга
			if (player&&player.tm) {				
				const days_without_visit=(tm-player.tm)/86400000
				if (days_without_visit>days_without_allowed) {
					await fbs.ref('players/'+uid).remove()
					console.log('Удален '+ uid + ' rating: '+ player?.PUB?.rating)
					total_removed++
				}	
			}	
			
			if (player&&(!player.tm)) {				
				await fbs.ref('players/'+uid).remove()
				console.log('INVALID: '+ uid + ' rating: '+ player?.PUB?.rating)
				total_removed++
			}				
		}
				
		addLog("Удалено старых игроков: "+total_removed)
		
	},
	
	async show_last_players(num=100){
		
		if (!fbs_data[game_name].players)		
			fbs_data[game_name].players=await fbs_once('players')		
		
		const players_array=Object.entries(fbs_data[game_name].players)
		
		players_array2=players_array.map(([uid, data]) => ({
		  uid,name:data.name,rating:data.rating,tm:data.tm
		}));				
		
		players_array2.sort((a,b)=>{return b.tm-a.tm})
		console.table(players_array2)
		
	},
	
	async clean_room(room_name){
		
		const data = await fbs_once(room_name);
		if (!data) {
			addLog('Ошибка получения данных о комнате: '+room_name);
			return;
		}
	
		let total_removed = 0
		
		const players=fbs_data[game_name].players
		if(!players){
			
			addLog('Нет данных о игроках, выходим...')
			return
		}
		
		//создаем массив для последующей работы
		let uids = Object.keys(data);
		const tm = Date.now()
		for (let i = 0 ; i < uids.length ; i++) {
		
			//добавляем инфу о последнем посещении
			const uid=uids[i]
			const player_last_seen=players[uid]?.tm||9999;
			
			//не видно уже 1 час но есть в комнате
			const not_seen = tm - player_last_seen;
			if (player_last_seen>999&&not_seen > 360000) {
				fbs.ref(room_name+ '/' + uid).remove();
				total_removed++;
			}
		}	
		
		addLog(room +" - Удалено зомби игроков: "+total_removed);
		
	},
	
	async block_player(uid){
		
		//записываем в список блокировок
		fbs.ref('blocked/'+uid).set(Date.now())
		
		//сообщаем о блокировке игроку
		fbs.ref('inbox/'+uid).set({message:'CHAT_BLOCK',tm:Date.now()})
		
		//увеличиваем количество блокировок
		fbs.ref('players/'+uid+'/block_num').transaction(val=> {return (val || 0) + 1})
		
		//отправляем сообщение
		const name=await fbs_once(`players/${uid}/name`);
		const msg=`Игрок ${name} занесен в черный список.`;
		console.log(msg);
		my_ws.safe_send({cmd:'push',path:'chat',val:{uid:'admin',name:'Админ',msg,tm:'TMS'}})
		
	},
		
	async clean_all(){
				
		const game_data=[		
			{game:'corners',rooms:['states1','states2','states3','states4','statesNIGHT']},
			{game:'domino',rooms:['states1','states2','states3','states4','states5','states6','states7','states8','states9']},
			{game:'durak',rooms:['states1','states2','states3','states4','states5','statesNIGHT']},
			{game:'chess',rooms:['states1','states2','states3','states4','statesNIGHT']},
			{game:'pool',rooms:['states1']},
			{game:'poker',rooms:[]},
			{game:'balda',rooms:['statesNIGHT']},
			{game:'word_game',rooms:[]},
			{game:'quoridor',rooms:['states']},
			{game:'snow_words',rooms:['states','states2']},			
			{game:'monopoly',rooms:['states2']},			
			{game:'melody',rooms:[]}			
		]
		
		for (data of game_data){
			addLog(`${data.game}`);
			
			await fbs_connect(data.game,1)
			await new Promise(resolve => setTimeout(resolve, 1500))
			
			if (data.game==='poker')
				await this.remove_old_poker()
			else
				await this.remove_old()			
			
			const rooms=data.rooms
			for (room of rooms)
				await this.clean_room(room)			
			
		}
	
		addLog('завершено!');
		
		
	}
	
}