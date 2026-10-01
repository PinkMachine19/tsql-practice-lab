(() => {
 'use strict';
 const KEY='tsql-practice-lab:v1';
 const empty=()=>({answers:{},scores:{},completed:{},notes:{}});
 let state=empty();
 let storageWarning=false;
 function notify(text){const box=document.querySelector('#notice');if(box)box.textContent=text;}
 try{
  const value=JSON.parse(localStorage.getItem(KEY)||'null');
  if(value&&typeof value==='object')for(const field of Object.keys(state))if(value[field]&&typeof value[field]==='object'&&!Array.isArray(value[field]))state[field]=value[field];
 }catch{storageWarning=true;}
 function save(){try{localStorage.setItem(KEY,JSON.stringify(state));return true;}catch{notify('Browser storage is unavailable. This session still works, but progress will not persist.');return false;}}
 if(storageWarning)notify('Saved progress could not be loaded. You can still use the lab in this session.');
 function updateProgress(){
  const count=Object.keys(state.completed).filter(id=>/^\d{2}$/.test(id)&&Number(id)>=1&&Number(id)<=32&&state.completed[id]===true).length;
  const label=document.querySelector('#progress-count');if(label)label.textContent=count;
  const meter=document.querySelector('#progress-meter');if(meter)meter.value=count;
  document.querySelectorAll('[data-complete-label]').forEach(el=>el.textContent=state.completed[el.dataset.completeLabel]===true?'Completed ✓':'Not completed');
  document.querySelectorAll('[data-score]').forEach(el=>{const score=state.scores[el.dataset.score];el.textContent=Number.isInteger(score)&&score>=0&&score<=2?`${score} / 2`:'Not attempted';});
  const answered=document.querySelector('#answer-progress');if(answered)answered.textContent=`${Object.keys(state.answers).filter(key=>/^\d{2}-[01]$/.test(key)&&Number(key.slice(0,2))>=1&&Number(key.slice(0,2))<=32).length} / 64 questions answered`;
 }
 updateProgress();
 const mapSearch=document.querySelector('#map-search');
 if(mapSearch)mapSearch.addEventListener('input',()=>{
  const query=mapSearch.value.trim().toLowerCase();const number=query.match(/^(?:q|question\s*)?(\d+)$/)?.[1];let count=0;
  const cards=[...document.querySelectorAll('[data-map-question]')];
  cards.forEach((card,index)=>{const match=number?Number(card.dataset.mapQuestion)===Number(number):card.textContent.toLowerCase().includes(query);card.hidden=!match;document.querySelectorAll('#mapping-table tbody tr')[index].hidden=!match;if(match)count++;});
  document.querySelector('#map-search-status').textContent=`${count} ${count===1?'question':'questions'} found`;
 });
 document.querySelectorAll('.copy').forEach(button=>button.addEventListener('click',async()=>{
  const text=button.parentElement.querySelector('code').textContent;
  try{await navigator.clipboard.writeText(text);button.textContent='Copied';setTimeout(()=>button.textContent='Copy SQL',1600);}
  catch{notify('Clipboard access is unavailable. Select the SQL text and copy it manually.');}
 }));
 const search=document.querySelector('#lesson-search');
 if(search)search.addEventListener('input',()=>{
  let count=0;
  document.querySelectorAll('.lesson-card').forEach(card=>{card.hidden=!card.textContent.toLowerCase().includes(search.value.trim().toLowerCase());if(!card.hidden)count++;});
  document.querySelectorAll('.lesson-group').forEach(group=>group.hidden=![...group.querySelectorAll('.lesson-card')].some(card=>!card.hidden));
  document.querySelector('#search-status').textContent=`${count} ${count===1?'lesson':'lessons'} found`;
 });
 const lesson=document.querySelector('[data-lesson]')?.dataset.lesson;
 const note=document.querySelector('#lesson-notes');
 if(note&&lesson){
  note.value=typeof state.notes[lesson]==='string'?state.notes[lesson]:'';
  note.addEventListener('input',()=>{state.notes[lesson]=note.value;document.querySelector('#note-status').textContent=save()?'Saved in this browser':'Not saved: browser storage unavailable';});
  const button=document.querySelector('#complete-lesson');
  const render=()=>{button.textContent=state.completed[lesson]===true?'Completed ✓ · Mark incomplete':'Mark lesson complete';button.setAttribute('aria-pressed',String(state.completed[lesson]===true));};
  render();button.addEventListener('click',()=>{state.completed[lesson]=state.completed[lesson]!==true;save();render();updateProgress();});
 }
 document.querySelector('#reset-progress')?.addEventListener('click',()=>{
  if(!window.confirm('Clear all saved T-SQL Practice Lab answers, scores, notes, and completion marks in this browser?'))return;
  state=empty();save();updateProgress();document.querySelector('#practice-quiz').replaceChildren();notify('Local progress reset. Start a new practice round when ready.');
 });
 function el(tag,text,className){const node=document.createElement(tag);if(text!==undefined)node.textContent=text;if(className)node.className=className;return node;}
 let quizSequence=0;
 function renderQuiz(container,questions,reviewLesson){
  container.replaceChildren();
  const form=el('form');form.noValidate=true;const sequence=++quizSequence;
  const fields=[];
  questions.forEach((question,index)=>{
   const field=el('fieldset',undefined,'question');
   field.append(el('legend',`${index+1} / ${questions.length} · Lesson ${question.lesson}`));
   field.append(el('h3',question.prompt));
   question.options.forEach((option,choice)=>{
    const label=el('label',undefined,'choice');const input=el('input');input.type='radio';input.name=`quiz-${sequence}-${index}`;input.value=choice;input.required=true;
    label.append(input,el('span',option));field.append(label);
   });
   const feedback=el('div',undefined,'feedback');feedback.hidden=true;field.append(feedback);fields.push({field,feedback,question});form.append(field);
  });
  const error=el('p','', 'quiz-error');error.setAttribute('role','alert');
  const result=el('p','', 'quiz-result');result.setAttribute('role','status');result.tabIndex=-1;
  const buttons=el('div',undefined,'quiz-buttons');const submit=el('button','Check answers','button primary');submit.type='submit';
  const retry=el('button','Try again','button');retry.type='button';retry.hidden=true;retry.addEventListener('click',()=>{renderQuiz(container,questions,reviewLesson);container.querySelector('input')?.focus();});
  buttons.append(submit,retry);form.append(error,buttons,result);container.append(form);
  form.addEventListener('submit',event=>{
   event.preventDefault();
   const missing=fields.find(({field})=>!field.querySelector('input:checked'));
   if(missing){error.textContent='Answer every question before checking your results.';missing.field.querySelector('input').focus();return;}
   error.textContent='';let correct=0;
   fields.forEach(({field,feedback,question})=>{
    const chosen=Number(field.querySelector('input:checked').value);const passed=chosen===question.answer;if(passed)correct++;
    feedback.hidden=false;feedback.classList.toggle('incorrect',!passed);feedback.replaceChildren(el('strong',passed?'Correct':`Correct answer: ${question.options[question.answer]}`),el('p',question.explanation));
    field.querySelectorAll('input').forEach(input=>input.disabled=true);
    state.answers[question.key]={chosen,correct:passed};
   });
   if(reviewLesson)state.scores[reviewLesson]=Math.max(Number(state.scores[reviewLesson])||0,correct);
   save();updateProgress();submit.hidden=true;retry.hidden=false;result.textContent=`${correct} / ${questions.length} correct. Review the explanations above.`;result.focus();
  });
 }
 if(document.querySelector('#lesson-quiz')||document.querySelector('#start-quiz')){
  const startButton=document.querySelector('#start-quiz');if(startButton)startButton.disabled=true;
  fetch(`${document.body.dataset.prefix}quiz-data.json`).then(response=>{if(!response.ok)throw Error('Quiz download failed');return response.json();}).then(data=>{
   if(startButton)startButton.disabled=false;
   const questions=data.flatMap(item=>item.questions.map((question,index)=>({...question,key:`${item.id}-${index}`,lesson:item.id,group:item.group})));
   if(lesson)renderQuiz(document.querySelector('#lesson-quiz'),questions.filter(q=>q.lesson===lesson),lesson);
   document.querySelector('#start-quiz')?.addEventListener('click',()=>{
    const topic=document.querySelector('#quiz-topic').value;let selected=questions.filter(q=>topic==='all'||String(q.group)===topic);
    for(let i=selected.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[selected[i],selected[j]]=[selected[j],selected[i]];}
    if(document.querySelector('#quiz-size').value!=='all')selected=selected.slice(0,10);
    renderQuiz(document.querySelector('#practice-quiz'),selected);document.querySelector('#practice-quiz input')?.focus();
   });
  }).catch(()=>{const target=document.querySelector('#lesson-quiz')||document.querySelector('#practice-quiz');target.textContent='Questions could not load. Refresh the page or use the published site. For local use, run npm run preview instead of opening HTML files directly.';});
 }
})();
