const app = {
	init(){
		this.sliderOn();
		this.setupPage();
		setTimeout(()=>{
			this.openLoading();
			this.screenSizeChangedHandler();
			this.setupMusicSystem();
			this.setLongLong();
		},2000);
	},
	setupPage(){
		this.main.findall('.page').forEach(page=>{
			page.style.height = innerHeight+'px';
		})
	},
	setLongLong(){
		let day = getDay('07/08/2023');
		let month = getMonth(day);
		let year = getYears(month);
		month -= year*12;
		day -= (month+year*12)*30;
		this.main.find('#longlong').innerHTML = `${year} Tahun ${month} Bulan ${day} Hari.`;
	},
	setupMusicSystem(){
		const audio = makeElement('audio',{
			src:'https://firebasestorage.googleapis.com/v0/b/suitupchatter.appspot.com/o/Cassandra%20-%20Cinta%20Terbaik%20(Lirik).m4a?alt=media&token=a118cbd1-6939-4120-b01e-749cc32318c6',
			onloadeddata(){
				this.loaded = true;
				console.log('load success!');
			},
			onerror(){
				this.loaded = false;
				console.log('error!');
			}
		})
		const button = this.header.find('#musictogle');
		const img = button.find('img');
		let state = false;

		button.onclick = ()=>{
			
			if(!audio.loaded)return;
			console.log('called');
			state = !state?true:false;
			audio[!state?'pause':'play']();
			img.src = !state?'/file?fn=audioonstop.png':'/file?fn=audioonplay.gif';
		}
	},
	openLoading(){
		let opacity = 1;
		const el = find('#sejoliblockingpage');
		
		const hide = ()=>{
			opacity -= 0.05;
			el.style.opacity = opacity;
			if(opacity <= 0)el.remove();
			else requestAnimationFrame(hide);
		}

		hide();
	},
	screenSizeChangedHandler(){
		onresize = ()=>{ location.reload() }
	},
	main:find('main'),
	header:find('header'),
	sliderOn(){
		let pagelen = 0;
		let page = 0;
		const height = innerHeight;
		let speed = 20;
		let onprocess = false;

		const move = (dir)=>{
			if(onprocess)return;
			if(page + dir < 0 || page + dir > pagelen-1)return;
			page += dir;
			//working on advance.
			buttons.forEach(button=>{
				if(page === 0 && button.id==='top'){
					button.style.opacity = 0;
				}else if(page === pagelen-1 && button.id === 'down'){
					button.style.opacity = 0;
				}else button.style.opacity = 1;
			})
			const target = height * page; 
			let stop = false;
			const domove = ()=>{
				this.main.scrollTop += speed * dir;
				onprocess = true;
				if(dir===1){
					if(this.main.scrollTop >= target)stop=true;
				}else{
					if(this.main.scrollTop <= target)stop=true;
				}
				if(!stop)requestAnimationFrame(domove);
				else{
					onprocess = false;
					this.main.scrollTop = target;
				}
			}
			domove();
			console.log(page,target,this.main.scrollTop);
		}

		const pages = this.main.findall('.page');
		pagelen = pages.length;

		const buttons = findall('#humanslider div');
		buttons.forEach(div=>{
			div.onclick = ()=>{
				move(div.id==='down'?1:-1);
			}
		})
	}
}
app.init();