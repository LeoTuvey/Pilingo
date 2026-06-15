// =====================================
// 🦉 OWL-LINGO A1 FULL DATABASE
// =====================================

const VOCAB_A1 = {
  meta: {
    level: "A1",
    name: "Beginner Core",
    version: "1.1",
    description: "Original beginner vocabulary system for English, Kurdish, and Swedish"
  },

  greetings: [
    { en:"hello", ku:"slav", sv:"hej", emoji:"👋" },
    { en:"good morning", ku:"beyanî baş", sv:"god morgon", emoji:"🌅" },
    { en:"good night", ku:"şev baş", sv:"god natt", emoji:"🌙" },
    { en:"goodbye", ku:"xatirê te", sv:"hej då", emoji:"👋" },
    { en:"please", ku:"ji kerema xwe", sv:"snälla", emoji:"🙏" },
    { en:"thank you", ku:"spas", sv:"tack", emoji:"🙌" },
    { en:"yes", ku:"erê", sv:"ja", emoji:"✅" },
    { en:"no", ku:"na", sv:"nej", emoji:"❌" }
  ],

  people: [
    { en:"I", ku:"ez", sv:"jag", emoji:"👤" },
    { en:"you", ku:"tu", sv:"du", emoji:"👤" },
    { en:"he", ku:"ew (m)", sv:"han", emoji:"👨" },
    { en:"she", ku:"ew (j)", sv:"hon", emoji:"👩" },
    { en:"we", ku:"em", sv:"vi", emoji:"👥" },
    { en:"they", ku:"ewan", sv:"de", emoji:"👥" }
  ],

  family: [
    { en:"man", ku:"mêr", sv:"man", emoji:"🧑" },
    { en:"woman", ku:"jin", sv:"kvinna", emoji:"👩" },
    { en:"boy", ku:"kur", sv:"pojke", emoji:"👦" },
    { en:"girl", ku:"keç", sv:"flicka", emoji:"👧" },
    { en:"mother", ku:"dayik", sv:"mamma", emoji:"👩‍👧" },
    { en:"father", ku:"bav", sv:"pappa", emoji:"👨‍👦" },
    { en:"friend", ku:"heval", sv:"vän", emoji:"🤝" }
  ],

  animals: [
    { en:"dog", ku:"kûçik", sv:"hund", emoji:"🐶" },
    { en:"cat", ku:"pisîk", sv:"katt", emoji:"🐱" },
    { en:"bird", ku:"teyr", sv:"fågel", emoji:"🐦" },
    { en:"fish", ku:"masî", sv:"fisk", emoji:"🐟" },
    { en:"cow", ku:"ga", sv:"ko", emoji:"🐄" },
    { en:"horse", ku:"hesp", sv:"häst", emoji:"🐴" },
    { en:"chicken", ku:"mirîşk", sv:"kyckling", emoji:"🐔" },
    { en:"rabbit", ku:"kûsî", sv:"kanin", emoji:"🐰" }
  ],

  numbers: [
    { en:"one", ku:"yek", sv:"ett", emoji:"1️⃣" },
    { en:"two", ku:"du", sv:"två", emoji:"2️⃣" },
    { en:"three", ku:"sê", sv:"tre", emoji:"3️⃣" },
    { en:"four", ku:"çar", sv:"fyra", emoji:"4️⃣" },
    { en:"five", ku:"pênc", sv:"fem", emoji:"5️⃣" },
    { en:"six", ku:"şeş", sv:"sex", emoji:"6️⃣" },
    { en:"seven", ku:"heft", sv:"sju", emoji:"7️⃣" },
    { en:"eight", ku:"heşt", sv:"åtta", emoji:"8️⃣" },
    { en:"nine", ku:"neh", sv:"nio", emoji:"9️⃣" },
    { en:"ten", ku:"deh", sv:"tio", emoji:"🔟" }
  ],

  food: [
    { en:"apple", ku:"sêv", sv:"äpple", emoji:"🍎" },
    { en:"banana", ku:"mûz", sv:"banan", emoji:"🍌" },
    { en:"bread", ku:"nan", sv:"bröd", emoji:"🍞" },
    { en:"water", ku:"av", sv:"vatten", emoji:"💧" },
    { en:"milk", ku:"şîr", sv:"mjölk", emoji:"🥛" },
    { en:"tea", ku:"çay", sv:"te", emoji:"🍵" },
    { en:"coffee", ku:"qehwe", sv:"kaffe", emoji:"☕" },
    { en:"rice", ku:"birinc", sv:"ris", emoji:"🍚" }
  ],

  verbs: [
    { en:"eat", ku:"xwarin", sv:"äta", emoji:"🍽️" },
    { en:"drink", ku:"vexwarin", sv:"dricka", emoji:"🥤" },
    { en:"go", ku:"çûn", sv:"gå", emoji:"🚶" },
    { en:"come", ku:"hatin", sv:"komma", emoji:"➡️" },
    { en:"see", ku:"dîtin", sv:"se", emoji:"👀" },
    { en:"read", ku:"xwendin", sv:"läsa", emoji:"📖" },
    { en:"write", ku:"nivîsandin", sv:"skriva", emoji:"✍️" },
    { en:"sleep", ku:"razan", sv:"sova", emoji:"🛏️" },
    { en:"run", ku:"revîn", sv:"springa", emoji:"🏃" },
    { en:"walk", ku:"gerîn", sv:"gå", emoji:"🚶" },
    { en:"want", ku:"xwestin", sv:"vilja", emoji:"❤️" },
    { en:"have", ku:"heye", sv:"ha", emoji:"📦" },
    { en:"like", ku:"hezkirin", sv:"gilla", emoji:"👍" }
  ],

  objects: [
    { en:"house", ku:"mal", sv:"hus", emoji:"🏠" },
    { en:"car", ku:"otombêl", sv:"bil", emoji:"🚗" },
    { en:"door", ku:"derî", sv:"dörr", emoji:"🚪" },
    { en:"window", ku:"pace", sv:"fönster", emoji:"🪟" },
    { en:"book", ku:"pirtûk", sv:"bok", emoji:"📘" },
    { en:"pen", ku:"qelem", sv:"penna", emoji:"🖊️" },
    { en:"table", ku:"mêz", sv:"bord", emoji:"🪑" },
    { en:"chair", ku:"kursî", sv:"stol", emoji:"🪑" },
    { en:"phone", ku:"telefon", sv:"telefon", emoji:"📱" },
    { en:"bag", ku:"çant", sv:"väska", emoji:"👜" }
  ],

  places: [
    { en:"school", ku:"dibistan", sv:"skola", emoji:"🏫" },
    { en:"home", ku:"mal", sv:"hem", emoji:"🏠" },
    { en:"city", ku:"bajar", sv:"stad", emoji:"🏙️" },
    { en:"shop", ku:"firotgeh", sv:"affär", emoji:"🛒" },
    { en:"park", ku:"park", sv:"park", emoji:"🌳" },
    { en:"hospital", ku:"nexweşxane", sv:"sjukhus", emoji:"🏥" },
    { en:"restaurant", ku:"restoran", sv:"restaurang", emoji:"🍽️" }
  ],

  adjectives: [
    { en:"big", ku:"mezin", sv:"stor", emoji:"⬆️" },
    { en:"small", ku:"biçûk", sv:"liten", emoji:"⬇️" },
    { en:"good", ku:"baş", sv:"bra", emoji:"👍" },
    { en:"bad", ku:"xarab", sv:"dålig", emoji:"👎" },
    { en:"happy", ku:"kêfxweş", sv:"glad", emoji:"😊" },
    { en:"sad", ku:"dilşikestî", sv:"ledsen", emoji:"😢" },
    { en:"hot", ku:"germ", sv:"varm", emoji:"🔥" },
    { en:"cold", ku:"sar", sv:"kall", emoji:"❄️" }
  ],

  colors: [
    { en:"red", ku:"sor", sv:"röd", emoji:"🔴" },
    { en:"blue", ku:"şîn", sv:"blå", emoji:"🔵" },
    { en:"green", ku:"kesk", sv:"grön", emoji:"🟢" },
    { en:"yellow", ku:"zer", sv:"gul", emoji:"🟡" },
    { en:"black", ku:"reş", sv:"svart", emoji:"⚫" },
    { en:"white", ku:"spî", sv:"vit", emoji:"⚪" }
  ],

  classroom: [
    { en:"teacher", ku:"mamoste", sv:"lärare", emoji:"🧑‍🏫" },
    { en:"student", ku:"xwendekar", sv:"elev", emoji:"🧑‍🎓" },
    { en:"lesson", ku:"ders", sv:"lektion", emoji:"📚" },
    { en:"word", ku:"peyv", sv:"ord", emoji:"🔤" },
    { en:"question", ku:"pirs", sv:"fråga", emoji:"❓" },
    { en:"answer", ku:"bersiv", sv:"svar", emoji:"💬" },
    { en:"paper", ku:"kaxez", sv:"papper", emoji:"📄" },
    { en:"desk", ku:"mase", sv:"skrivbord", emoji:"🪑" }
  ],

  body: [
    { en:"head", ku:"ser", sv:"huvud", emoji:"🙂" },
    { en:"eye", ku:"çav", sv:"öga", emoji:"👁️" },
    { en:"ear", ku:"guh", sv:"öra", emoji:"👂" },
    { en:"hand", ku:"dest", sv:"hand", emoji:"✋" },
    { en:"foot", ku:"ling", sv:"fot", emoji:"🦶" },
    { en:"heart", ku:"dil", sv:"hjärta", emoji:"❤️" }
  ],

  clothes: [
    { en:"shirt", ku:"kiras", sv:"skjorta", emoji:"👕" },
    { en:"dress", ku:"kinc", sv:"klänning", emoji:"👗" },
    { en:"shoes", ku:"sol", sv:"skor", emoji:"👟" },
    { en:"hat", ku:"kulav", sv:"hatt", emoji:"🧢" },
    { en:"coat", ku:"palto", sv:"rock", emoji:"🧥" }
  ],

  weather: [
    { en:"sun", ku:"roj", sv:"sol", emoji:"☀️" },
    { en:"rain", ku:"baran", sv:"regn", emoji:"🌧️" },
    { en:"snow", ku:"berf", sv:"snö", emoji:"❄️" },
    { en:"wind", ku:"ba", sv:"vind", emoji:"💨" },
    { en:"cloud", ku:"ewr", sv:"moln", emoji:"☁️" }
  ],

  time: [
    { en:"today", ku:"îro", sv:"idag", emoji:"📅" },
    { en:"tomorrow", ku:"sibê", sv:"imorgon", emoji:"📅" },
    { en:"yesterday", ku:"duh", sv:"igår", emoji:"📅" },
    { en:"morning", ku:"sibeh", sv:"morgon", emoji:"🌅" },
    { en:"night", ku:"şev", sv:"natt", emoji:"🌙" }
  ],

  phrases: [
    { en:"I am a student", ku:"Ez xwendekar im", sv:"Jag är elev", emoji:"🧑‍🎓" },
    { en:"I like apples", ku:"Ez ji sêvan hez dikim", sv:"Jag gillar äpplen", emoji:"🍎" },
    { en:"The cat is small", ku:"Pisîk biçûk e", sv:"Katten är liten", emoji:"🐱" },
    { en:"The dog runs", ku:"Kûçik direve", sv:"Hunden springer", emoji:"🐶" },
    { en:"I drink water", ku:"Ez avê vedixwim", sv:"Jag dricker vatten", emoji:"💧" },
    { en:"Where is school?", ku:"Dibistan li ku ye?", sv:"Var är skolan?", emoji:"🏫" }
  ]
};

window.VOCAB_A1 = VOCAB_A1;
