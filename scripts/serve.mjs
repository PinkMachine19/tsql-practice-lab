import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../docs');
const types={'.html':'text/html; charset=utf-8','.css':'text/css','.js':'text/javascript','.json':'application/json','.svg':'image/svg+xml','.sql':'text/plain'};
http.createServer((req,res)=>{
 try{
  let target=path.resolve(root,'.'+decodeURIComponent(new URL(req.url,'http://localhost').pathname));
  if(target!==root&&!target.startsWith(root+path.sep)){res.writeHead(403).end();return;}
  if(fs.existsSync(target)&&fs.statSync(target).isDirectory())target=path.join(target,'index.html');
  if(!fs.existsSync(target)){res.writeHead(404).end('Not found');return;}
  res.writeHead(200,{'Content-Type':types[path.extname(target)]||'application/octet-stream','Cache-Control':'no-store'});fs.createReadStream(target).pipe(res);
 }catch{res.writeHead(400).end('Bad request');}
}).listen(4173,'127.0.0.1',()=>console.log('Preview: http://127.0.0.1:4173'));
