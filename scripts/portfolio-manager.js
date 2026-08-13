/* eslint-disable no-console */
const http = require('http');
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const { spawn } = require('child_process');

const ROOT = path.resolve(__dirname, '..');
const PROJECTS_FILE = path.join(ROOT, 'src', 'constants', 'projects.js');
const PUBLIC_DIR = path.join(ROOT, 'public');
const PORT = 4173;

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
  const source = `// 此文件由“作品管理器”自动生成，请勿手动修改。\nconst projects = ${JSON.stringify(projects, null, 2)};\nexport default projects;\n`;
  fs.writeFileSync(PROJECTS_FILE, source, 'utf8');
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

const page = `<!doctype html><html lang="zh-CN"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>LYX 作品管理器</title><style>
:root{color-scheme:dark;--bg:#111714;--panel:#19211d;--text:#eef2ed;--muted:#9da9a1;--accent:#d9ff63;--line:#ffffff18}*{box-sizing:border-box}body{margin:0;background:var(--bg);color:var(--text);font:15px/1.55 system-ui,"Microsoft YaHei",sans-serif}.wrap{max-width:1050px;margin:auto;padding:42px 22px 80px}h1{font-size:clamp(34px,6vw,72px);letter-spacing:-.05em;line-height:.9;margin:0 0 18px}p{color:var(--muted)}.notice{border:1px solid var(--line);padding:14px 18px;margin:25px 0 32px}.grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(270px,1fr));gap:12px}.card,.editor{background:var(--panel);border:1px solid var(--line);padding:18px}.card h3{margin:0}.card button{margin-top:14px}.actions{display:flex;gap:8px;flex-wrap:wrap}button{border:0;border-radius:99px;padding:11px 17px;font-weight:700;cursor:pointer;background:var(--accent);color:#172000}.ghost{background:#ffffff0b;color:var(--text);border:1px solid var(--line)}.danger{color:#ffb4aa}.editor{margin-top:28px;display:none}.editor.open{display:block}.fields{display:grid;grid-template-columns:1fr 1fr;gap:14px}label{display:grid;gap:6px;color:var(--muted)}input,textarea,select{width:100%;background:#0d120f;color:var(--text);border:1px solid var(--line);padding:11px;border-radius:6px}textarea{min-height:110px;resize:vertical}.wide{grid-column:1/-1}.media-row{display:grid;grid-template-columns:1fr 130px 90px auto;gap:8px;margin:8px 0;align-items:center}.status{position:fixed;right:18px;bottom:18px;padding:12px 18px;background:var(--accent);color:#172000;border-radius:99px;display:none}@media(max-width:650px){.fields{grid-template-columns:1fr}.wide{grid-column:auto}.media-row{grid-template-columns:1fr 1fr}.media-row input{grid-column:1/-1}}
</style></head><body><main class="wrap"><h1>你的作品<br>你来更新。</h1><p>新增、修改作品，选择图片或 MP4 视频，点击保存即可。保存后双击“一键发布网站.bat”。</p><div class="notice">提示：封面建议横图 WebP/JPG，单个视频尽量小于 20MB。首页最多展示勾选的前 3 个作品。</div><div class="actions"><button onclick="startNew()">＋ 新增作品</button><button class="ghost" onclick="location.reload()">刷新</button></div><div id="list" class="grid" style="margin-top:18px"></div><section id="editor" class="editor"><h2 id="editorTitle">新增作品</h2><div class="fields"><label>作品标题<input id="title" required></label><label>英文网址名（仅字母/数字）<input id="id" placeholder="my-project"></label><label>年份<input id="date" value="2026"></label><label>客户 / 品牌<input id="company"></label><label class="wide">线上链接（可不填）<input id="liveLink" placeholder="https://"></label><label class="wide">作品介绍（每段之间空一行）<textarea id="desc"></textarea></label><label>主背景色<input id="primary" type="color" value="#28282b"></label><label>页面浅色<input id="secondary" type="color" value="#f0f4f1"></label><label><input id="featured" type="checkbox" style="width:auto"> 在首页精选中展示</label><label>封面图<input id="cover" type="file" accept="image/*"></label><div class="wide"><h3>详情图片 / 视频</h3><div id="media"></div><button class="ghost" type="button" onclick="addMedia()">＋ 添加媒体</button></div><div class="wide actions"><button onclick="saveProject()">保存作品</button><button class="ghost" onclick="closeEditor()">取消</button></div></div></section></main><div id="status" class="status"></div><script>
let projects=[],editing=null;const $=id=>document.getElementById(id);async function load(){projects=await fetch('/api/projects').then(r=>r.json());render()}function render(){$('list').innerHTML=projects.map((p,i)=>'<article class="card"><small>'+p.date+(p.featured?' · 首页精选':'')+'</small><h3>'+escapeHtml(p.title)+'</h3><p>'+escapeHtml(p.company||'未填写客户')+'</p><div class="actions"><button onclick="edit('+i+')">编辑</button><button class="ghost danger" onclick="removeProject('+i+')">删除</button></div></article>').join('')}function escapeHtml(s){return String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}function startNew(){editing=null;$('editorTitle').textContent='新增作品';['title','id','company','liveLink','desc'].forEach(x=>$(x).value='');$('date').value=new Date().getFullYear();$('primary').value='#28282b';$('secondary').value='#f0f4f1';$('featured').checked=true;$('cover').value='';$('media').innerHTML='';addMedia();openEditor()}function edit(i){editing=i;const p=projects[i];$('editorTitle').textContent='编辑：'+p.title;['title','id','date','company','liveLink','primary','secondary'].forEach(x=>$(x).value=p[x]||'');$('desc').value=(p.desc||[]).join('\n\n');$('featured').checked=!!p.featured;$('cover').value='';$('media').innerHTML='';(p.images||[]).forEach(m=>addMedia(m));openEditor()}function openEditor(){$('editor').classList.add('open');$('editor').scrollIntoView({behavior:'smooth'})}function closeEditor(){$('editor').classList.remove('open')}function addMedia(m={}){const row=document.createElement('div');row.className='media-row';row.dataset.src=m.src||'';row.innerHTML='<input type="file" accept="image/*,video/mp4"><select><option value="big">大图</option><option value="medium">中图</option><option value="small">小图</option><option value="video">视频</option></select><label><input type="checkbox" style="width:auto"> 靠右</label><button class="ghost danger" type="button">移除</button>';row.querySelector('select').value=m.tag||'big';row.querySelector('input[type=checkbox]').checked=!!m.isRight;row.querySelector('button').onclick=()=>row.remove();if(m.src){const note=document.createElement('small');note.textContent='当前：'+m.src;row.prepend(note)}$('media').appendChild(row)}async function fileData(file){if(!file)return null;return new Promise((ok,no)=>{const r=new FileReader();r.onload=()=>ok({name:file.name,data:r.result,type:file.type});r.onerror=no;r.readAsDataURL(file)})}async function saveProject(){try{show('正在保存…');const cover=await fileData($('cover').files[0]);const media=[];for(const row of $('media').children){const file=row.querySelector('input[type=file]');media.push({existing:row.dataset.src,file:await fileData(file.files[0]),tag:row.querySelector('select').value,isRight:row.querySelector('input[type=checkbox]').checked})}const body={index:editing,project:{id:$('id').value,title:$('title').value,date:$('date').value,company:$('company').value,liveLink:$('liveLink').value,desc:$('desc').value.split(/\n\s*\n/).filter(Boolean),featured:$('featured').checked,primary:$('primary').value,secondary:$('secondary').value},cover,media};const res=await fetch('/api/save',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify(body)});if(!res.ok)throw new Error(await res.text());show('保存成功');closeEditor();await load()}catch(e){alert('保存失败：'+e.message)}}async function removeProject(i){if(!confirm('确定删除“'+projects[i].title+'”吗？作品媒体文件会保留，避免误删。'))return;await fetch('/api/delete',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({index:i})});show('已删除');load()}function show(t){$('status').textContent=t;$('status').style.display='block';setTimeout(()=>$('status').style.display='none',2200)}load();
</script></body></html>`;

function jsonBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', (chunk) => {
      body += chunk;
      if (body.length > 120 * 1024 * 1024) reject(new Error('上传内容过大'));
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

const server = http.createServer(async (req, res) => {
  try {
    if (req.method === 'GET' && req.url === '/') {
      res.setHeader('content-type', 'text/html; charset=utf-8');
      res.end(page);
      return;
    }
    if (req.method === 'GET' && req.url === '/api/projects') {
      res.setHeader('content-type', 'application/json');
      res.end(JSON.stringify(readProjects()));
      return;
    }
    if (req.method === 'POST' && req.url === '/api/delete') {
      const body = await jsonBody(req);
      const projects = readProjects();
      projects.splice(body.index, 1);
      writeProjects(projects);
      res.end('ok');
      return;
    }
    if (req.method === 'POST' && req.url === '/api/save') {
      const body = await jsonBody(req);
      const projects = readProjects();
      const old = Number.isInteger(body.index) ? projects[body.index] : null;
      const id = safeId(body.project.id || body.project.title);
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
          const name = `${String(i + 1).padStart(2, '0')}${ext}`;
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
        primary: body.project.primary,
        accentColor: old?.accentColor || '#f0f4f1',
        secondary: body.project.secondary,
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
