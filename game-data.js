window.KIWI_FEUD_BANK=[
{c:'Everyday Kiwi',q:'Name something you might find in a Kiwi backyard.',a:[['BBQ',30],['Trampoline',24],['Clothesline',18],['Vege garden',16],['Dog kennel',12]]},
{c:'Everyday Kiwi',q:'Name something people buy from the dairy.',a:[['Milk',28],['Lollies',24],['Ice cream',19],['Bread',16],['Hot pie',13]]},
{c:'Everyday Kiwi',q:'Name something Kiwis keep in the garage.',a:[['Tools',29],['Bicycles',23],['Lawnmower',19],['Camping gear',16],['Freezer',13]]},

{c:'Kai & BBQ',q:'Name something you would cook on a Kiwi BBQ.',a:[['Sausages',31],['Steak or chops',24],['Corn',18],['Kebabs',15],['Garlic bread',12]]},
{c:'Kai & BBQ',q:'Name something people bring to a shared lunch.',a:[['Salad',27],['Savouries',23],['Chips and dip',20],['Cake',17],['Fruit platter',13]]},
{c:'Kai & BBQ',q:'Name something you might order from a fish-and-chip shop.',a:[['Chips',32],['Fish',25],['Hot dog',18],['Potato fritter',14],['Pineapple fritter',11]]},

{c:'Summer',q:'Name something you take to the beach.',a:[['Towel',29],['Sunscreen',26],['Togs',19],['Chilly bin',15],['Beach umbrella',11]]},
{c:'Summer',q:'Name something that can ruin a camping trip.',a:[['Heavy rain',33],['Sandflies',22],['Forgotten gear',18],['Noisy neighbours',15],['Flat airbed',12]]},
{c:'Summer',q:'Name something people do at a lake in summer.',a:[['Swim',30],['Go boating',24],['Fish',18],['Have a picnic',16],['Paddleboard',12]]},

{c:'Sport',q:'Name something you hear at a rugby match.',a:[['Cheering',28],['The referee’s whistle',24],['“Go, go, go!”',20],['The national anthem',16],['A stadium announcement',12]]},
{c:'Sport',q:'Name something found in a sports bag.',a:[['Water bottle',27],['Sports shoes',23],['Towel',20],['Team uniform',17],['Strapping tape',13]]},
{c:'Sport',q:'Name something fans wear to support their team.',a:[['Team jersey',34],['Scarf',23],['Hat',18],['Face paint',14],['Flag or cape',11]]},

{c:'Aotearoa',q:'Name a te reo Māori word many New Zealanders use.',a:[['Kia ora',35],['Whānau',23],['Kai',18],['Mahi',14],['Aroha',10]]},
{c:'Aotearoa',q:'Name something associated with Matariki.',a:[['Stars',34],['Whānau gathering',23],['Shared kai',18],['Remembering loved ones',15],['Planning for the year ahead',10]]},
{c:'Aotearoa',q:'Name something that represents New Zealand overseas.',a:[['Kiwi bird',30],['Silver fern',24],['The haka',19],['All Blacks jersey',16],['New Zealand landscape',11]]},

{c:'Workplace',q:'Name something always found in the staff room.',a:[['Kettle',29],['Mugs',24],['Microwave',19],['Noticeboard',16],['Someone’s forgotten lunch',12]]},
{c:'Workplace',q:'Name something people do instead of working.',a:[['Check their phone',33],['Chat with a co-worker',24],['Make coffee',18],['Browse the internet',15],['Tidy their desk',10]]},
{c:'Workplace',q:'Name an excuse for arriving late to work.',a:[['Traffic',31],['Slept in',24],['Childcare problem',18],['Car trouble',15],['Could not find the keys',12]]},

{c:'Outdoors',q:'Name something you pack for a tramp.',a:[['Water',28],['Raincoat',24],['Food',20],['First-aid kit',16],['Map or GPS',12]]},
{c:'Outdoors',q:'Name something you might find on a DOC track.',a:[['Track marker',29],['Mud',24],['Native birds',19],['Swing bridge',16],['Backcountry hut',12]]},
{c:'Outdoors',q:'Name something that makes a tramp harder.',a:[['Steep climb',28],['Bad weather',24],['Heavy pack',20],['Blisters',16],['Losing the track',12]]},

{c:'Marlborough',q:'Name something Marlborough is famous for.',a:[['Sauvignon Blanc',39],['Marlborough Sounds',22],['Seafood',17],['Sunny weather',13],['Cycling trails',9]]},
{c:'Marlborough',q:'Name something tourists do in Picton.',a:[['Catch the ferry',34],['Walk the waterfront',23],['Take a boat cruise',18],['Visit cafés',15],['Explore local tracks',10]]},
{c:'Marlborough',q:'Name something you might see in a vineyard.',a:[['Rows of grapevines',36],['A tractor',22],['Harvest workers',17],['Bird netting',14],['Posts and wires',11]]},

{c:'Kids & School',q:'Name something children lose at school.',a:[['Jersey',30],['Lunchbox',24],['Sunhat',19],['Drink bottle',15],['Library book',12]]},
{c:'Kids & School',q:'Name something found in a school bag.',a:[['Exercise books',28],['Pencil case',24],['Lunchbox',20],['Chromebook',16],['Crushed fruit',12]]},
{c:'Kids & School',q:'Name something a teacher says every day.',a:[['Listen please',28],['Put your hand up',24],['Quiet down',20],['Pack up',16],['Good morning',12]]}
];
window.KiwiSync=(()=>{const KEY='kiwi-feud-state-v3';const channel=('BroadcastChannel'in window)?new BroadcastChannel('kiwi-feud-live-v3'):null;const base={questionIndex:-1,revealed:[],scores:[0,0],teamNames:['Kea','Tūī'],activeTeam:0,strikes:0,multiplier:1,timer:30,roundAwarded:false,updated:Date.now()};let state={...base,...JSON.parse(localStorage.getItem(KEY)||'{}')};const listeners=new Set();function clone(value){return typeof structuredClone==='function'?structuredClone(value):JSON.parse(JSON.stringify(value))}function emit(){listeners.forEach(fn=>fn(clone(state)))}function save(broadcast=true){state.updated=Date.now();localStorage.setItem(KEY,JSON.stringify(state));if(broadcast&&channel)channel.postMessage(state);emit()}if(channel)channel.onmessage=e=>{if(e.data&&e.data.updated>=state.updated){state=e.data;localStorage.setItem(KEY,JSON.stringify(state));emit()}};addEventListener('storage',e=>{if(e.key===KEY&&e.newValue){state=JSON.parse(e.newValue);emit()}});return{get:()=>clone(state),set:patch=>{state={...state,...patch};save()},reset:()=>{state={...base,updated:Date.now()};save()},subscribe:fn=>{listeners.add(fn);fn(clone(state));return()=>listeners.delete(fn)}}})();