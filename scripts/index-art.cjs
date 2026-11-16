const fs=require('node:fs'),path=require('node:path'),root=path.join(__dirname,'..'),entries={};
function scan(dir){for(const item of fs.readdirSync(dir,{withFileTypes:true})){const file=path.join(dir,item.name);if(item.isDirectory())scan(file);else if(item.name.endsWith('.png')){const data=fs.readFileSync(file);if(data.toString('ascii',1,4)!=='PNG')throw Error('PNG inválido: '+file);entries[path.relative(root,file).split(path.sep).join('/')]={width:data.readUInt32BE(16),height:data.readUInt32BE(20)};}}}
scan(path.join(root,'assets/expedition'));
fs.writeFileSync(path.join(root,'src/art-sizes.js'),'/* Dimensiones originales: generadas con node scripts/index-art.cjs. */\n(function(root){const sizes='+JSON.stringify(entries)+';if(typeof module!==\'undefined\'&&module.exports)module.exports=sizes;else root.OrbitArtSizes=sizes;})(globalThis);\n');
console.log(Object.keys(entries).length+' imágenes indexadas.');
