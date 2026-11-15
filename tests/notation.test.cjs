const test=require('node:test'),assert=require('node:assert/strict'),N=require('../src/notation.js');
const osu=`osu file format v14
[General]
AudioFilename: song.mp3
Mode: 3
[Metadata]
Title: Signal
Artist: Example
[Difficulty]
CircleSize:2
[TimingPoints]
0,500,4,0,0,70,1,0
7500,400,4,0,0,70,1,0
[HitObjects]
128,192,3127,1,0,0:0:0:0:
384,192,3519,128,0,4261:0:0:0:0:
128,192,4993,1,0,0:0:0:0:
384,192,4993,1,0,0:0:0:0:
`;
test('Importar .osu conserva milisegundos, simultáneas, sostenidos y cambios de tempo',()=>{const map=N.fromOsu(osu,11.217);assert.equal(map.duration,11.217);assert.deepEqual(map.notes.map(n=>[n.action,n.time,n.end]),[[0,3.127,3.127],[1,3.519,4.261],[0,4.993,4.993],[1,4.993,4.993]]);assert.deepEqual(map.timing,[{time:0,beatLength:.5},{time:7.5,beatLength:.4}]);assert.equal(map.audioFile,'song.mp3');assert.equal(map.boss,null);});
test('Rechaza otros modos, más columnas, notas inválidas y colas fuera del audio',()=>{assert.throws(()=>N.fromOsu(osu.replace('Mode: 3','Mode: 0'),12),/mania/);assert.throws(()=>N.fromOsu(osu.replace('CircleSize:2','CircleSize:4'),12),/2 columnas/);assert.throws(()=>N.fromOsu(osu,4),/fuera/);assert.throws(()=>N.validate({notes:[{action:0,time:1,end:3},{action:0,time:2}]},5),/solapa/);assert.throws(()=>N.validate({notes:[{action:0,time:NaN}]},5),/tiempo/);});
test('Una partitura no puede recortar la canción ni superponer el escudo a las notas',()=>{const raw={duration:10,notes:[{action:0,time:2}],boss:null};assert.equal(N.validate(raw,180.123).duration,180.123);assert.throws(()=>N.validate({...raw,boss:{time:1,end:3}},10),/solaparse/);});
test('Los borradores siguen ataques del archivo, sin inventar notas en silencio',()=>{const rate=8000,duration=24,data=new Float32Array(duration*rate),attacks=[3.17,4.56,6.38,8.24,11.12,13.87,20.53,22.11];for(const t of attacks)for(let j=0;j<rate*.12;j++)data[Math.floor(t*rate)+j]=Math.sin(j*.6)*Math.exp(-j/(rate*.025))*.8;const maps=N.fromAudio({sampleRate:rate,duration,getChannelData:()=>data},{bpm:120});for(const map of Object.values(maps)){assert.ok(map.notes.length>0);for(const note of map.notes)assert.ok(attacks.some(t=>Math.abs(note.time-t)<.05),`${note.time} debe coincidir con un ataque`);}});
