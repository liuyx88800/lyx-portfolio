/* eslint-disable no-console */
const http = require('http');
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const { spawn } = require('child_process');

const ROOT = path.resolve(__dirname, '..');
const PROJECTS_FILE = path.join(ROOT, 'src', 'constants', 'projects.js');
const SITE_FILE = path.join(ROOT, 'src', 'constants', 'site.json');
const PUBLIC_DIR = path.join(ROOT, 'public');
const PORT = 4174;

const SERIES = [
  { id: 'series-a', name: 'AIGC 智能创作' },
  { id: 'series-b', name: '染织与图案设计' },
  { id: 'series-c', name: '品牌与视觉设计' },
  { id: 'series-d', name: '数字产品与展览' },
];

function readProjects() {
  const source = fs
    .readFileSync(PROJECTS_FILE, 'utf8')
    .replace(
      /export default projects;?\s*$/,
      'globalThis.__projects = projects;',
    );
  const sandbox = {};
  vm.createContext(sandbox);
  vm.runInContext(source, sandbox);
  return JSON.parse(JSON.stringify(sandbox.__projects));
}
function writeProjects(projects) {
  fs.writeFileSync(
    PROJECTS_FILE,
    `// 由作品管理器自动生成\nconst projects = ${JSON.stringify(projects, null, 2)};\nexport default projects;\n`,
    'utf8',
  );
}
function readSite() {
  return JSON.parse(fs.readFileSync(SITE_FILE, 'utf8'));
}
function writeSite(site) {
  fs.writeFileSync(SITE_FILE, `${JSON.stringify(site, null, 2)}\n`, 'utf8');
}
function safeId(value) {
  return (
    String(value || '')
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9-]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '') || `work-${Date.now()}`
  );
}
function saveDataUrl(dataUrl, target) {
  const match = /^data:([^;]+);base64,(.+)$/.exec(dataUrl || '');
  if (!match) throw new Error('文件格式错误');
  fs.writeFileSync(target, Buffer.from(match[2], 'base64'));
}
function openBrowser(url) {
  const command =
    process.platform === 'win32'
      ? 'cmd'
      : process.platform === 'darwin'
        ? 'open'
        : 'xdg-open';
  const args = process.platform === 'win32' ? ['/c', 'start', '', url] : [url];
  spawn(command, args, { detached: true, stdio: 'ignore' }).unref();
}
function bodyJson(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', (chunk) => {
      body += chunk;
      if (body.length > 350 * 1024 * 1024)
        reject(new Error('本次上传超过 350MB，请分批保存'));
    });
    req.on('end', () => {
      try {
        resolve(JSON.parse(body || '{}'));
      } catch (error) {
        reject(error);
      }
    });
  });
}

const SERIES_OPTIONS = SERIES.map(
  (s) => `<option value="${s.id}">${s.name}</option>`,
).join('');

const page = `<!doctype html><html lang="zh-CN"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>刘耀翔作品集管理器</title><style>
:root{color-scheme:dark;--bg:#101512;--panel:#19211d;--text:#edf1ec;--muted:#9da9a1;--accent:#d9ff63;--line:#ffffff18}*{box-sizing:border-box}body{margin:0;background:var(--bg);color:var(--text);font:15px/1.55 system-ui,"Microsoft YaHei",sans-serif}.wrap{max-width:1100px;margin:auto;padding:38px 22px 90px}h1{font-size:clamp(38px,7vw,78px);letter-spacing:-.06em;line-height:.9;margin:0 0 18px}.lead{color:var(--muted);max-width:700px}.tabs,.actions{display:flex;gap:9px;flex-wrap:wrap}.tabs{margin:30px 0 22px}button{border:0;border-radius:99px;padding:11px 18px;font-weight:700;cursor:pointer;background:var(--accent);color:#172000}.ghost{background:#ffffff0b;color:var(--text);border:1px solid var(--line)}.danger{color:#ffb4aa}.panel{display:none}.panel.active{display:block}.notice,.card,.editor{background:var(--panel);border:1px solid var(--line);padding:18px}.notice{color:var(--muted);margin-bottom:18px}.grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:12px}.card h3{margin:5px 0}.card p{color:var(--muted)}.editor{margin-top:24px;display:none}.editor.open{display:block}.fields{display:grid;grid-template-columns:1fr 1fr;gap:14px}label{display:grid;gap:6px;color:var(--muted)}input,textarea,select{width:100%;background:#0d120f;color:var(--text);border:1px solid var(--line);padding:11px;border-radius:6px}textarea{min-height:110px;resize:vertical}.wide{grid-column:1/-1}.media-row{display:grid;grid-template-columns:1fr 130px 90px auto;gap:8px;margin:8px 0;align-items:center}.status{position:fixed;right:18px;bottom:18px;padding:12px 18px;background:var(--accent);color:#172000;border-radius:99px;display:none}.help{counter-reset:step;display:grid;gap:12px}.help article{padding:18px;border-top:1px solid var(--line)}.help article:before{counter-increment:step;content:counter(step);display:inline-grid;place-items:center;width:28px;height:28px;border-radius:50%;background:var(--accent);color:#172000;font-weight:bold;margin-right:12px}@media(max-width:650px){.fields{grid-template-columns:1fr}.wide{grid-column:auto}.media-row{grid-template-columns:1fr 1fr}.media-row input,.media-row small{grid-column:1/-1}}
</style></head><body><main class="wrap"><h1>作品集管理器</h1><p class="lead">在这里改个人资料、无限新增作品、批量上传图片。所有内容先保存在本地，确认后再发布到网站。</p><nav class="tabs"><button onclick="tab('works')">作品管理</button><button class="ghost" onclick="tab('profile')">个人资料</button><button class="ghost" onclick="tab('help')">更新教程</button></nav>
<section id="works" class="panel active"><div class="notice">首页按系列展示：每个系列需勾选一件“系列封面”作品。详情图片可一次多选，建议每批不超过 30 张。</div><div class="actions"><button onclick="newWork()">＋ 新增作品</button><button class="ghost" onclick="loadWorks()">刷新列表</button></div><div id="list" class="grid" style="margin-top:18px"></div><div id="editor" class="editor"><h2 id="editorTitle">新增作品</h2><div class="fields"><label>作品标题<input id="title"></label><label>英文网址名<input id="id" placeholder="例如 pet-home（保存后不要再改）"></label><label>年份<input id="date"></label><label>项目 / 客户<input id="company"></label><label class="wide">外部链接（可留空）<input id="liveLink" placeholder="https://"></label><label class="wide">作品介绍（段落之间空一行）<textarea id="desc"></textarea></label><label>主背景色<input id="primary" type="color" value="#28282b"></label><label>页面浅色<input id="secondary" type="color" value="#f0f4f1"></label><label><span>首页展示</span><span><input id="featured" type="checkbox" style="width:auto"> 设为精选</span></label><label>所属系列<select id="series">${SERIES_OPTIONS}</select></label><label><span>系列封面</span><span><input id="seriesCover" type="checkbox" style="width:auto"> 设为该系列封面</span></label><label>封面图（必须）<input id="cover" type="file" accept="image/*"></label><div class="wide"><h3>详情图片 / 视频</h3><label>批量选择图片或 MP4<input id="bulk" type="file" accept="image/*,video/mp4" multiple onchange="bulkMedia(this.files)"></label><div id="media"></div><button class="ghost" type="button" onclick="addMedia()">＋ 单独添加一个文件</button></div><div class="wide actions"><button onclick="saveWork()">保存作品</button><button class="ghost" onclick="closeEditor()">取消</button></div></div></div></section>
<section id="profile" class="panel"><div class="notice">这些内容会同步到首页、关于我、页脚和搜索引擎信息。经历和奖项每行一条，格式为：年份 | 标题 | 内容。</div><div class="fields"><label>姓名<input id="p-name"></label><label>身份标题<input id="p-title"></label><label>学校<input id="p-school"></label><label>专业年级<input id="p-major"></label><label>邮箱<input id="p-email"></label><label>所在地<input id="p-location"></label><label class="wide">首页短介绍<textarea id="p-intro"></textarea></label><label class="wide">详细介绍（每段之间空一行）<textarea id="p-bio"></textarea></label><label class="wide">经历（每行：年份 | 标题 | 内容）<textarea id="p-experience"></textarea></label><label class="wide">奖项（每行：年份 | 标题 | 内容）<textarea id="p-awards"></textarea></label><div class="wide"><button onclick="saveProfile()">保存个人资料</button></div></div></section>
<section id="help" class="panel help"><article><b>修改内容</b><p>在“个人资料”或“作品管理”里修改，然后点击保存。此时只改了电脑里的文件。</p></article><article><b>检查网站</b><p>双击“本地预览网站.bat”，浏览器打开后检查首页、关于我和作品页。</p></article><article><b>发布更新</b><p>确认无误后双击“一键发布网站.bat”。脚本会自动提交并上传到 GitHub，Vercel 随后自动更新。</p></article><article><b>大量作品</b><p>每件作品建一条记录；封面只传 1 张，详情图可多选。图片建议转成 WebP/JPG，长边约 2000px，单张尽量小于 2MB。</p></article></section></main><div id="status" class="status"></div><script>
let works=[],editing=null,site={};const $=id=>document.getElementById(id);function tab(id){document.querySelectorAll('.panel').forEach(x=>x.classList.remove('active'));$(id).classList.add('active');if(id==='profile')loadProfile()}function esc(s){return String(s||'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}function show(t){$('status').textContent=t;$('status').style.display='block';setTimeout(()=>$('status').style.display='none',2400)}
async function loadWorks(){works=await fetch('/api/projects').then(r=>r.json());$('list').innerHTML=works.map((p,i)=>{const sName=p.series?(SERIES.find(s=>s.id===p.series)||{}).name||p.series:'';return '<article class="card"><small>'+esc(p.date)+(p.seriesCover?' · 系列封面':'')+(sName?' · '+esc(sName):'')+'</small><h3>'+esc(p.title)+'</h3><p>'+esc(p.company||'未填写项目')+' · '+(p.images||[]).length+' 个详情媒体</p><div class="actions"><button onclick="editWork('+i+')">编辑</button><button class="ghost danger" onclick="deleteWork('+i+')">删除</button></div></article>'}).join('')}
function resetEditor(){editing=null;['title','id','company','liveLink','desc'].forEach(x=>$(x).value='');$('date').value=new Date().getFullYear();$('primary').value='#28282b';$('secondary').value='#f0f4f1';$('featured').checked=true;$('series').value=SERIES[0]?SERIES[0].id:'';$('seriesCover').checked=false;$('cover').value='';$('bulk').value='';$('media').innerHTML=''}function newWork(){resetEditor();$('editorTitle').textContent='新增作品';addMedia();openEditor()}function editWork(i){resetEditor();editing=i;const p=works[i];$('editorTitle').textContent='编辑：'+p.title;['title','id','date','company','liveLink','primary','secondary'].forEach(x=>$(x).value=p[x]||'');$('desc').value=(p.desc||[]).join('\n\n');$('featured').checked=!!p.featured;if($('series'))$('series').value=p.series||'';$('seriesCover').checked=!!p.seriesCover;(p.images||[]).forEach(m=>addMedia(m));openEditor()}function openEditor(){$('editor').classList.add('open');$('editor').scrollIntoView({behavior:'smooth'})}function closeEditor(){$('editor').classList.remove('open')}
function addMedia(m={},file=null){const row=document.createElement('div');row.className='media-row';row.dataset.src=m.src||'';row.innerHTML='<input type="file" accept="image/*,video/mp4"><select><option value="big">大图</option><option value="medium">中图</option><option value="small">小图</option><option value="video">视频</option></select><label><input type="checkbox" style="width:auto"> 靠右</label><button class="ghost danger" type="button">移除</button>';const input=row.querySelector('input[type=file]');if(file){const transfer=new DataTransfer();transfer.items.add(file);input.files=transfer.files}row.querySelector('select').value=m.tag||(file&&file.type==='video/mp4'?'video':'big');row.querySelector('input[type=checkbox]').checked=!!m.isRight;row.querySelector('button').onclick=()=>row.remove();if(m.src){const note=document.createElement('small');note.textContent='当前：'+m.src;row.prepend(note)}$('media').appendChild(row)}function bulkMedia(files){[...files].forEach(f=>addMedia({},f));$('bulk').value=''}async function fileData(file){if(!file)return null;return new Promise((ok,no)=>{const r=new FileReader();r.onload=()=>ok({name:file.name,data:r.result,type:file.type});r.onerror=no;r.readAsDataURL(file)})}
async function saveWork(){try{if(!$('title').value.trim())throw new Error('请填写作品标题');show('正在保存，请不要关闭窗口…');const cover=await fileData($('cover').files[0]);const media=[];for(const row of $('media').children){const file=row.querySelector('input[type=file]').files[0];media.push({existing:row.dataset.src,file:await fileData(file),tag:row.querySelector('select').value,isRight:row.querySelector('input[type=checkbox]').checked})}const project={id:$('id').value,title:$('title').value,date:$('date').value,company:$('company').value,liveLink:$('liveLink').value,desc:$('desc').value.split(/\n\s*\n/).filter(Boolean),featured:$('featured').checked,series:$('series')?$('series').value:'',seriesCover:$('seriesCover').checked,primary:$('primary').value,secondary:$('secondary').value};const res=await fetch('/api/save',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({index:editing,project,cover,media})});if(!res.ok)throw new Error(await res.text());show('作品已保存');closeEditor();loadWorks()}catch(e){alert('保存失败：'+e.message)}}async function deleteWork(i){if(!confirm('确定删除“'+works[i].title+'”吗？媒体文件会保留以防误删。'))return;await fetch('/api/delete',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({index:i})});show('已删除');loadWorks()}
function lines(items){return (items||[]).map(x=>[x.year,x.title,x.text].join(' | ')).join('\n')}function parseLines(text){return text.split('\n').map(x=>x.trim()).filter(Boolean).map(x=>{const p=x.split('|').map(y=>y.trim());return{year:p[0]||'',title:p[1]||'',text:p.slice(2).join(' | ')||''}})}async function loadProfile(){site=await fetch('/api/site').then(r=>r.json());['name','title','school','major','email','location','intro'].forEach(x=>$('p-'+x).value=site[x]||'');$('p-bio').value=(site.bio||[]).join('\n\n');$('p-experience').value=lines(site.experience);$('p-awards').value=lines(site.awards)}async function saveProfile(){const next={...site};['name','title','school','major','email','location','intro'].forEach(x=>next[x]=$('p-'+x).value);next.bio=$('p-bio').value.split(/\n\s*\n/).filter(Boolean);next.experience=parseLines($('p-experience').value);next.awards=parseLines($('p-awards').value);const res=await fetch('/api/site',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify(next)});if(!res.ok)return alert(await res.text());show('个人资料已保存')};loadWorks();
</script></body></html>`;

const server = http.createServer(async (req, res) => {
  try {
    if (req.method === 'GET' && req.url === '/') {
      res.setHeader('content-type', 'text/html; charset=utf-8');
      res.end(page);
      return;
    }
    if (req.method === 'GET' && req.url === '/api/projects') {
      res.setHeader('content-type', 'application/json; charset=utf-8');
      res.end(JSON.stringify(readProjects()));
      return;
    }
    if (req.method === 'GET' && req.url === '/api/site') {
      res.setHeader('content-type', 'application/json; charset=utf-8');
      res.end(JSON.stringify(readSite()));
      return;
    }
    if (req.method === 'POST' && req.url === '/api/site') {
      writeSite(await bodyJson(req));
      res.end('ok');
      return;
    }
    if (req.method === 'POST' && req.url === '/api/delete') {
      const body = await bodyJson(req);
      const projects = readProjects();
      projects.splice(body.index, 1);
      writeProjects(projects);
      res.end('ok');
      return;
    }
    if (req.method === 'POST' && req.url === '/api/save') {
      const body = await bodyJson(req);
      const projects = readProjects();
      const old = Number.isInteger(body.index) ? projects[body.index] : null;
      const id = safeId(body.project.id || old?.id || body.project.title);
      const dir = path.join(PUBLIC_DIR, id);
      fs.mkdirSync(dir, { recursive: true });
      let coverPath = old?.img || '';
      if (body.cover) {
        const ext = path.extname(body.cover.name).toLowerCase() || '.webp';
        const name = `cover${ext}`;
        saveDataUrl(body.cover.data, path.join(dir, name));
        coverPath = `/${id}/${name}`;
      }
      if (!coverPath) throw new Error('请上传封面图');
      const images = [];
      for (let i = 0; i < body.media.length; i += 1) {
        const item = body.media[i];
        let src = item.existing;
        if (item.file) {
          const ext =
            path.extname(item.file.name).toLowerCase() ||
            (item.tag === 'video' ? '.mp4' : '.webp');
          const name = `${String(i + 1).padStart(3, '0')}${ext}`;
          saveDataUrl(item.file.data, path.join(dir, name));
          src = `/${id}/${name}`;
        }
        if (src) images.push({ src, tag: item.tag, isRight: item.isRight });
      }
      const project = {
        ...old,
        ...body.project,
        id,
        title: body.project.title || id,
        img: coverPath,
        link: `/projects/${id}`,
        liveLink: body.project.liveLink || undefined,
        accentColor: old?.accentColor || '#f0f4f1',
        fillColor: old?.fillColor || '#f2f2f2',
        menuColor: old?.menuColor || body.project.primary,
        menuFontColor: old?.menuFontColor || body.project.secondary,
        fluidColor: old?.fluidColor || '#d7d7d4',
        images,
      };
      if (old) projects[body.index] = project;
      else projects.unshift(project);
      writeProjects(projects);
      res.end('ok');
      return;
    }
    res.statusCode = 404;
    res.end('not found');
  } catch (error) {
    res.statusCode = 400;
    res.end(error.message);
  }
});
server.listen(PORT, '127.0.0.1', () => {
  const url = `http://127.0.0.1:${PORT}`;
  console.log(`作品管理器已启动：${url}`);
  if (!process.env.PORTFOLIO_NO_BROWSER) openBrowser(url);
});
