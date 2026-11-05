const PLANS={ess:{n:'Essentials',p:139,visits:[['spring','Spring'],['fall','Fall']]},
plus:{n:'Plus',p:209,visits:[['q1','Q1 Winter (Jan)'],['spring','Q2 Spring (Apr)'],['q3','Q3 Summer (Jul)'],['fall','Q4 Fall (Oct)']]},
comp:{n:'Complete',p:379,visits:['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'].map(m=>[m,m])}};
const SYS=[['irrigation','Irrigation'],['sump','Sump Pump'],['humidifier','Humidifier'],['dehum','Dehumidifier'],['softener','Water Softener (Plus+)'],['fridge','Fridge Water Filter (Plus+)'],['garage','Garage Door (Plus+)'],['crawl','Crawlspace'],['twoFurn','2+ Furnaces / ACs']];
const ADD=[['chimney','Chimney Sweep Quote'],['ducts','Duct Cleaning Quote'],['generator','Generator Service Quote'],['radon','Radon Test'],['guttersExtra','Extra Gutter Cleaning'],['caulk','Caulk Repair Quote'],['leak','Leak Sensors Install'],['sumpBackup','Sump Backup Quote'],['bathFan','Bath Fan Quote']];
const S={plan:'ess',visit:'spring',wh:'tank',sys:new Set(),add:new Set(),scn:new Set()};
const $=id=>document.getElementById(id);
function chips(el,items,isOn,click,dis){$(el).innerHTML='';items.forEach(([k,l])=>{const b=document.createElement('button');b.className='chip'+(isOn(k)?' on':'')+(dis&&dis(k)?' off':'');b.textContent=l;b.onclick=()=>{click(k);render()};$(el).appendChild(b)})}
const plusOnly=k=>['softener','fridge','garage'].includes(k)&&S.plan==='ess';
function render(){
chips('plan',Object.entries(PLANS).map(([k,v])=>[k,`${v.n} $${v.p}`]),k=>S.plan===k,k=>{S.plan=k;S.visit=PLANS[k].visits[k==='comp'?3:0][0]});
chips('visit',PLANS[S.plan].visits,k=>S.visit===k,k=>S.visit=k);
chips('wh',[['tank','Tank'],['tankless','Tankless'],['none','None / Skip']],k=>S.wh===k,k=>S.wh=k);
const tg=set=>k=>set.has(k)?set.delete(k):set.add(k);
chips('sys',SYS,k=>S.sys.has(k),tg(S.sys),plusOnly);
chips('add',ADD,k=>S.add.has(k),tg(S.add));
chips('scn',[['storm','Storm Check (Complete)'],['first','First Visit'],['freeze','Hard Freeze Forecast']],k=>S.scn.has(k),tg(S.scn),k=>k==='storm'&&S.plan!=='comp');
}
// season of the visit
function season(){const v=S.visit,m={Jan:'winter',Feb:'winter',Mar:'spring',Apr:'spring',May:'spring',Jun:'summer',Jul:'summer',Aug:'summer',Sep:'fall',Oct:'fall',Nov:'fall',Dec:'winter',q1:'winter',q3:'summer',spring:'spring',fall:'fall'};return m[v]}
function kind(){if(S.plan!=='comp')return'full';return({Apr:'full',Oct:'full',Jan:'mid',Jul:'mid'})[S.visit]||'light'}
function build(){
const P=S.plan,se=season(),k=kind(),has=x=>S.sys.has(x),plus=P!=='ess',twoX=has('twoFurn')?2:1;
const full=k==='full',fullOrMid=k!=='light';
const steps=[];const add=(t,how,photo,min,tag)=>steps.push({t,how,photo,min,tag});
// spring/fall determination for full visits
const isFall=se==='fall',isSpring=se==='spring';
const whNow=S.wh!=='none'&&((isFall&&full)||(S.scn.has('first')&&full));
// Arrival always first
add('Arrive And Start Visit','Shoe covers and gloves on, greet homeowner, start visit in app, quick walk-through and note any concerns.','Front of house',k==='light'?10:10);
if(whNow){
 if(S.wh==='tank')add('Water Heater Flush (Do First)','Power/gas to pilot or off, cold supply off, hose to drain, open valve and a hot tap; flush until clear, close, refill with hot tap open until steady flow, restore power. Let it reheat while you work.','Data plate, before/after flush water in bucket',25,'First');
 else add('Tankless Descale (Do First)','Isolation valves off, pump + hoses on service ports, vinegar or descaler recirculate 45–60 min while you continue. Come back to flush, clean inlet screen, restore.','Data plate, service ports connected',25,'First');
}
const lightMin=k==='light';
add('Moisture Scan',lightMin?'Quick pinless meter pass: under sinks, around water heater, basement walls.':'Pinless meter + thermal camera: ceilings under baths, windows, basement walls, under sinks. Log readings, flag damp spots.','Any reading over baseline, thermal image of flagged spots',lightMin?10:25);
if(fullOrMid||S.visit==='Mar'||S.visit==='Sep')add('Furnace Filter'+(twoX>1?'s':''),'Note size and MERV, replace, write date on edge, confirm airflow arrow.','Old vs new filter, size label',10*twoX);
if(full||(P!=='ess'&&fullOrMid))add('Smoke And CO Checks',isFall?'Test every unit, swap all batteries, check manufacture dates (replace over 10 yrs).':'Test every unit, check manufacture dates.','Any expired or failed detector',10);
if(full||S.scn.has('storm'))add('Drone Roof And Gutter Check','Pre-flight check, fly roof perimeter + gutters: shingles, flashing, vents, chimney cap and crown, sagging or clogged gutters. Nobody on the roof.','Four elevations of roof, gutter runs, any damage',15);
if(full&&isSpring)add('Dryer Vent Cleaning','Pull dryer, disconnect duct, brush/vacuum duct to exterior hood, check hood flap, reconnect with foil tape.','Lint removed, exterior hood',25);
if(plus&&full&&(isSpring||isFall))add('Gutter And Downspout Cleaning','Clear gutters, flush downspouts, check splash blocks and grading.','Before/after gutter sections',45);
if(plus&&fullOrMid&&has('garage')&&(S.visit==='q3'||S.visit==='Jul'||S.visit==='spring'||S.visit==='Apr'))add('Garage Door Tune-Up','Lubricate rollers/hinges/springs, tighten hardware, test auto-reverse and photo eyes.','Auto-reverse test, spring condition',20);
if(plus&&has('softener'))add('Water Softener Salt Top-Off','Check salt level, break any bridge, top off, confirm regen settings.','Brine tank level',5);
if(plus&&has('fridge')&&fullOrMid)add('Fridge Water Filter','Replace filter, flush 2–3 gallons, reset indicator.','Filter model and date',5);
if(has('sump')&&(isSpring||S.visit==='Mar'||S.visit==='q1'))add('Sump Pump Test','Pour water into pit until float triggers, confirm discharge outside and check valve works.','Pump running, discharge point',10);
if(has('humidifier')&&(isFall||se==='winter'))add('Humidifier Pad Swap And Service','Water off, replace pad, clean tray and distribution, set humidistat for season.','Old vs new pad',15);
if(has('dehum')&&(se==='summer'||isSpring))add('Dehumidifier Check','Clean filter, empty/check drain line, confirm setting 45–50%.','Setting and drain',5);
if(has('irrigation')&&(isSpring||isFall))add(isSpring?'Irrigation Start-Up Check':'Irrigation Winterize Check',isSpring?'Open supply, run each zone, look for broken heads and leaks, set controller.':'Shut supply, drain or confirm blow-out booked, controller to off.','Controller, any broken heads',20);
if(full&&isSpring)add('Season Job: Spring Checks','Grading and downspouts, window wells, washing machine hoses, toilet dye test, caulk at tubs and sinks.','Any failing caulk or hose',15);
if(full&&isFall||S.scn.has('freeze'))add('Winter Freeze Prep','Shut and drain outdoor hose bibs, check exposed pipes'+(has('crawl')?' and close crawlspace vents':'')+', thermostat battery and settings.','Each hose bib shut off',15);
if(se==='summer'&&fullOrMid)add('Season Job: Summer Checks','Range hood filter clean, fridge coils, attic insulation look, dehumidifier settings.','Coils before/after',15);
if(se==='winter'&&fullOrMid)add('Season Job: Winter Checks','Ice dam watch, attic look for frost, thermostat check, main water shut-off located and tagged.','Main shut-off tag',15);
if(k==='light')add('Monthly Check-In','Walk the home with homeowner, look under sinks, water heater base, furnace area, any new concerns. Log for next full visit.','Anything new since last month',15);
if(S.scn.has('storm'))add('Storm Check','Exterior walk for fallen limbs, siding and gutter damage; clear vents and ice dams as safe from the ground. Flag roof findings.','All storm damage, cleared vents',30,'Storm');
if(S.scn.has('first'))add('First Visit Extras','Find, test and tag main water shut-off; pipe insulation check; record all equipment data plates and serials for Home Record and recall monitoring.','Every data plate, main shut-off',20,'First Visit');
if(full&&(isSpring||isFall))add(isSpring?'Partner AC Tune-Up':'Partner Furnace Tune-Up','Confirm partner tech arrival, let them in to equipment, collect their checklist and photos.','Partner checklist',0,'Partner');
const addMap={chimney:['Chimney Sweep Quote','Photo firebox, flue and cap; note fuel type; send quote request to Command Center.','Firebox, cap',5],ducts:['Duct Cleaning Quote','Count supply/return vents, photo a dirty register; send quote request.','Register',5],generator:['Generator Service Quote','Photo data plate, hours, fuel type; send quote request.','Data plate',5],radon:['Radon Test','Place kit in lowest lived-in level, away from drafts, log start time; pick up in 2–4 days or homeowner mails.','Kit placement',10],guttersExtra:['Extra Gutter Cleaning','Clean additional run as booked.','Before/after',30],caulk:['Caulk Repair Quote','Measure failing caulk runs, photo each; send quote request.','Each run',5],leak:['Leak Sensors Install','Place under water heater, sinks, washer; pair in app and test.','Each sensor placed',15],sumpBackup:['Sump Backup Quote','Photo pit, pump and nearest outlet; send quote request.','Pit and outlet',5],bathFan:['Bath Fan Quote','Check airflow with tissue test, photo fan and venting; send quote request.','Fan',5]};
S.add.forEach(a=>{const x=addMap[a];add(x[0],x[1],x[2],x[3],'Add-On')});
if(whNow)add('Water Heater Close-Out','Confirm unit refilled and heating, no leaks at drain valve, temp setting noted.','Drain valve dry',5);
add('Visit Report And Close','Upload photos, complete report, review findings with homeowner, close visit in app, remove shoe covers.','Clean work areas',k==='light'?5:15);
return steps}
$('go').onclick=()=>{const st=build(),P=PLANS[S.plan],v=P.visits.find(x=>x[0]===S.visit)[1],tot=st.reduce((a,s)=>a+s.min,0),ph=st.filter(s=>s.photo).length;
$('out').innerHTML=`<h2>${P.n} · ${v} Visit</h2><div class="sum"><div><b>${st.length}</b>Steps</div><div><b>~${tot} Min</b>Our Tech</div><div><b>${ph}</b>Photo Prompts</div></div><ol>`+st.map(s=>`<li class="step${s.tag==='First'?' first':''}"><span class="tm">${s.min?s.min+' min':''}</span><div class="st">${s.t}${s.tag&&s.tag!=='First'?`<span class="tag">${s.tag}</span>`:''}</div><div class="how">${s.how}</div>${s.photo?`<div class="ph">Photo: ${s.photo}</div>`:''}</li>`).join('')+'</ol>';$('out').scrollIntoView({behavior:'smooth'})};
$('share').onclick=async()=>{const u=location.href;if(navigator.share)try{await navigator.share({title:'Visit Playbook',url:u});return}catch(e){}try{await navigator.clipboard.writeText(u);alert('Link copied')}catch(e){prompt('Copy link',u)}};
render();
