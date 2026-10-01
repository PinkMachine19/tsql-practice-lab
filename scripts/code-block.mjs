const esc=value=>String(value).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');
const keywords=new Set('SELECT FROM WHERE JOIN INNER LEFT RIGHT FULL OUTER CROSS APPLY ON AS GROUP BY HAVING ORDER ASC DESC TOP OFFSET FETCH NEXT ROWS ROW ONLY UNION ALL EXCEPT INTERSECT WITH OVER PARTITION CASE WHEN THEN ELSE END AND OR NOT NULL IS EXISTS IN BETWEEN LIKE CREATE ALTER TABLE VIEW PROCEDURE FUNCTION TRIGGER INDEX UNIQUE CLUSTERED INCLUDE RETURNS RETURN BEGIN COMMIT ROLLBACK TRANSACTION TRY CATCH THROW EXEC INSERT INTO VALUES UPDATE SET DELETE OUTPUT DECLARE DEFAULT PRIMARY KEY FOREIGN REFERENCES CHECK CONSTRAINT IF DROP GO NOCOUNT XACT_ABORT ANSI_NULLS QUOTED_IDENTIFIER'.split(' '));
const functions=new Set('SUM COUNT AVG MIN MAX COALESCE CAST CONVERT DATEADD DATEDIFF GETDATE SYSUTCDATETIME ROW_NUMBER RANK DENSE_RANK LAG LEAD DB_NAME DB_ID SCHEMA_ID OBJECT_ID SERVERPROPERTY SUSER_SNAME XACT_STATE ERROR_NUMBER ERROR_MESSAGE'.split(' '));
export function highlight(sql){
 return sql.replace(/--[^\r\n]*|\/\*[\s\S]*?\*\/|N?'(?:''|[^'])*'|\[[^\]]*\]|@@?\w+|\b\d+(?:\.\d+)?\b|\b[A-Za-z_]\w*\b|\s+|./g,token=>{
  const upper=token.toUpperCase();let type='';
  if(token.startsWith('--')||token.startsWith('/*'))type='comment';
  else if(/^N?'/.test(token))type='string';
  else if(token.startsWith('@'))type='variable';
  else if(/^\d/.test(token))type='number';
  else if(keywords.has(upper))type='keyword';
  else if(functions.has(upper))type='function';
  return type?`<span class="sql-${type}">${esc(token)}</span>`:esc(token);
 });
}
let sequence=0;
export function code(sql,{language='SQL'}={}){
 const id=`code-${++sequence}`;
 return `<div class="code-wrap" data-language="${language}"><div class="code-toolbar"><span>${language==='SQL'?'T-SQL':'Azure CLI'}</span><label class="wrap-option"><input type="checkbox" class="wrap-code"> Wrap lines</label><button class="copy" type="button">Copy ${language}</button></div><pre tabindex="0" aria-label="${language} code; scroll horizontally for long lines"><code>${language==='SQL'?highlight(sql):esc(sql)}</code></pre><p class="copy-status" role="status" aria-live="polite"></p><div class="copy-fallback" hidden><label for="${id}-text">Automatic copy was blocked. Tap Select all ${language}, then use your iPad’s Copy command on the selected text.</label><textarea id="${id}-text" class="copy-text" readonly spellcheck="false" autocapitalize="off" autocorrect="off" rows="7" aria-label="${language} to copy manually"></textarea><button type="button" class="select-code button">Select all ${language}</button></div></div>`;
}
export function expandable(title,sql,id,options){return `<details class="solution script-block"${id?` id="${id}"`:''}><summary>${esc(title)}</summary>${code(sql,options)}</details>`;}
