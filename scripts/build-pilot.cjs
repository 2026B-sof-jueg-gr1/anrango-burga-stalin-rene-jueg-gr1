const fs=require('node:fs'),path=require('node:path');
const {compose}=require('../src/pilot-score.js');
const source=require('../assets/charts/source/altale-attacks.json');
const charts=Object.fromEntries(['easy','medium','hard'].map(d=>[d,compose(source,d)]));
fs.writeFileSync(path.join(__dirname,'../assets/charts/altale.json'),JSON.stringify(charts,null,2)+'\n');
for(const [name,map]of Object.entries(charts))console.log(name,map.notes.length,'notas',map.phrases.length,'frases');
