"use client";
import { useEffect, useRef, useState } from 'react';
import { ScanLine, LockKeyhole, Ruler, Square, RectangleHorizontal, Users, Copy, Check, RotateCcw, ChevronRight, ClipboardList, Shuffle, LayoutGrid, AlertCircle, Plus, Minus, Move, Stamp, Upload, X, Trash2, Scan, AlignCenter, AlignEndVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sidebar, SidebarProvider, SidebarContent, SidebarFooter, SidebarHeader, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarMenuAction, SidebarGroup, SidebarTrigger, useSidebar } from '@/components/ui/sidebar';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '@/components/ui/dropdown-menu';
import { Composition } from '@/components/composition';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction } from '@/components/ui/alert-dialog';
import { Input } from '@/components/ui/input';
import { Toaster } from '@/components/ui/sonner';
import { toast } from 'sonner';
import { initialScenes, createScene, appendScene, sceneLabel, maxProductOccupancy, type Scene, type Person, type Point, type BrandLogo, type Product, type Dimensions, productLabel, addProduct, removeProduct, alignBottom, validateDimensions, isChild, resizeFamily, summary, duplicateScenes, familyFor, interactions, NO_INTERACTION, personFrameHeight, logoFrame, moveItem, normalizeScene, overlapWarnings, PERSON_FRAME_WIDTH } from '@/lib/scene-config';

function Choice({label,value,options,onChange}:{label:string;value:string;options:string[];onChange:(v:string)=>void}) {
  return <Select value={value} onValueChange={onChange}><SelectTrigger aria-label={label} className="choice"><SelectValue/></SelectTrigger><SelectContent position="popper">{options.map(o=><SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent></Select>;
}
function Nav({scenes,active,setActive,onAdd,onDelete,desktop}:{scenes:Scene[];active:string;setActive:(id:string)=>void;onAdd:(group:Scene['group'])=>void;onDelete:(id:string)=>void;desktop:boolean}) {
  const {setOpenMobile}=useSidebar();
  return <Sidebar className="studio-sidebar"><SidebarHeader className="brand"><div className="brand-icon"><ScanLine size={24}/></div><div><b>Composition Dude</b><span>产品构图工作台</span></div></SidebarHeader>
    <div className="nav-tools"><div className="nav-label">画面配置 <span>{scenes.length} 张</span></div><DropdownMenu><DropdownMenuTrigger asChild><Button className="add-scene-button" variant="outline"><Plus size={16}/>添加画面</Button></DropdownMenuTrigger><DropdownMenuContent align="start" className="add-scene-menu"><DropdownMenuItem onSelect={()=>{onAdd('主图');setOpenMobile(false);}}><Square size={16}/><span>新增主图<small>1500 × 1500px</small></span></DropdownMenuItem><DropdownMenuItem onSelect={()=>{onAdd('A+图');setOpenMobile(false);}}><RectangleHorizontal size={16}/><span>新增 A+图<small>970 × 600px</small></span></DropdownMenuItem><DropdownMenuItem onSelect={()=>{onAdd('自定义');setOpenMobile(false);}}><Scan size={16}/><span>新增自定义画面<small>自由设置宽高和比例</small></span></DropdownMenuItem></DropdownMenuContent></DropdownMenu></div>
    <SidebarContent className="scene-list-scroll"><SidebarGroup className="nav-group"><SidebarMenu>{scenes.map(s=>{const Icon=s.group==='主图'?Square:s.group==='A+图'?RectangleHorizontal:Scan;return <SidebarMenuItem key={s.id}><SidebarMenuButton className="nav-item scene-nav" isActive={s.id===active} onClick={()=>{setActive(s.id);setOpenMobile(false)}} aria-label={sceneLabel(s)}><Icon size={20}/><span><b>{sceneLabel(s)}</b><small>{s.width} × {s.height}px</small></span></SidebarMenuButton><SidebarMenuAction className="delete-scene" aria-label={`删除${sceneLabel(s)}`} title={`删除${sceneLabel(s)}`} onClick={()=>onDelete(s.id)}><Trash2 size={15}/></SidebarMenuAction></SidebarMenuItem>})}</SidebarMenu></SidebarGroup><p className="nav-help">每张画面分别编辑<br/>切换时保留本次配置</p></SidebarContent><SidebarFooter className="nav-footer"><div><LockKeyhole size={16}/><b>{desktop?'离线工作空间':'私有工作空间'}</b></div><p>多产品 · 人物 · 品牌位置<br/>把构图想法变成清晰配置</p></SidebarFooter></Sidebar>;
}
function NumberControl({label,id,value,min,max,unit,onChange,slider=true,step=1}:{label:string;id:string;value:number;min:number;max:number;unit:string;onChange:(value:number)=>void;slider?:boolean;step?:number}) {
  const [draft,setDraft]=useState(String(value));
  useEffect(()=>setDraft(String(value)),[value,id]);
  return <div className="number-control"><div className="number-heading"><label htmlFor={id}>{label}</label><div className="number-input"><Input id={id} aria-label={label} type="number" min={min} max={max} step={step} value={draft} onChange={e=>{setDraft(e.target.value);const next=Number(e.target.value);if(e.target.value.trim()&&Number.isFinite(next)&&next>=min&&next<=max)onChange(Number((Math.round(next/step)*step).toFixed(1)));}} onBlur={()=>{const next=draft.trim()?Number(draft):value;const valid=Number((Math.round(Math.min(max,Math.max(min,Number.isFinite(next)?next:value))/step)*step).toFixed(1));setDraft(String(valid));onChange(valid);}}/><span>{unit}</span></div></div>{slider&&<Slider aria-label={`${label}滑块`} min={min} max={max} step={step} value={[value]} onValueChange={v=>onChange(v[0])}/>}</div>;
}
function AxisControl({axis,value,min,max,targetName,onChange}:{axis:'X'|'Y';value:number;min:number;max:number;targetName:string;onChange:(value:number)=>void}) {
  const [draft,setDraft]=useState(String(value));
  useEffect(()=>setDraft(String(value)),[value,targetName]);
  return <div className="axis-control"><div className="axis-heading"><label htmlFor={`coordinate-${axis}`}>{axis} <span>{axis==='X'?'水平':'垂直'}</span></label><div className="coordinate-number"><Input id={`coordinate-${axis}`} aria-label={`${targetName}${axis}坐标`} type="number" step={.1} min={min} max={max} value={draft} disabled={min===max} onChange={e=>{setDraft(e.target.value);const next=Number(e.target.value);if(e.target.value.trim()&&Number.isFinite(next)&&next>=min&&next<=max)onChange(next);}} onBlur={()=>{const next=draft.trim()?Number(draft):value;const valid=Math.min(max,Math.max(min,Number.isFinite(next)?next:value));setDraft(String(valid));onChange(valid);}}/><span>%</span></div></div></div>;
}
export default function Home() {
  const [scenes,setScenes]=useState<Scene[]>(initialScenes);
  const [active,setActive]=useState('main');
  const [selected,setSelected]=useState('product');
  const [copied,setCopied]=useState(false);
  const [variation,setVariation]=useState(0);
  const [desktop,setDesktop]=useState(false);
  useEffect(()=>setDesktop(!!window.compositionDude),[]);
  const logoInput=useRef<HTMLInputElement>(null);
  const controlScroll=useRef<HTMLDivElement>(null);
  const nextSceneId=useRef(1);
  const nextProductId=useRef(2);
  const [deleting,setDeleting]=useState<string|null>(null);
  const [deleteLabel,setDeleteLabel]=useState('画面');
  const requestDelete=(id:string)=>{setDeleteLabel(sceneLabel(scenes.find(x=>x.id===id)!));setDeleting(id);};
  const [customOpen,setCustomOpen]=useState(false);
  const [customWidth,setCustomWidth]=useState('1200');
  const [customHeight,setCustomHeight]=useState('900');
  const [dimensionError,setDimensionError]=useState('');
  const s=scenes.find(x=>x.id===active)??createScene('主图','empty');
  useEffect(()=>{setSelected(s.products[0].id);if(controlScroll.current)controlScroll.current.scrollTop=0;},[active]);
  const liveRef=useRef({scenes,active});liveRef.current={scenes,active};
  const patch=(changes:Partial<Scene>)=>setScenes(prev=>prev.map(x=>x.id===active?normalizeScene({...x,...changes}):x));
  const patchLogo=(changes:Partial<BrandLogo>)=>patch({logo:{...s.logo,...changes}});
  const move=(id:string,point:Point)=>setScenes(prev=>prev.map(x=>x.id===active?moveItem(x,id,point):x));
  const adults=s.people.filter(p=>!isChild(p)).length,children=s.people.length-adults;
  const overlaps=overlapWarnings(s),duplicates=duplicateScenes(scenes,s);
  const selectedPerson=s.people.find(p=>p.id===selected);
  const selectedProduct=s.products.find(p=>p.id===selected);
  const productControl=selectedProduct??s.products[0];
  const logoSelected=selected==='logo'&&s.logo.enabled;
  const targetId=selectedPerson?.id??(logoSelected?'logo':productControl.id);
  const targetName=selectedPerson?`人物${s.people.indexOf(selectedPerson)+1}${selectedPerson.role}`:logoSelected?(s.logo.mode==='blank'?'Logo留白区域':'品牌Logo'):productLabel(productControl);
  const point=selectedPerson??(logoSelected?s.logo:productControl);
  const targetHeight=selectedPerson?personFrameHeight(s,selectedPerson):logoSelected?logoFrame(s).height:productControl.occupancy;
  const targetWidth=selectedPerson?PERSON_FRAME_WIDTH:logoSelected?logoFrame(s).width:productControl.width;
  const targets=[...s.products.map(p=>({id:p.id,label:productLabel(p)})),...s.people.map((p,i)=>({id:p.id,label:`人物${i+1} · ${p.role}`})),...(s.logo.enabled?[{id:'logo',label:s.logo.mode==='blank'?'Logo留白区域':'品牌Logo'}]:[])];
  const patchProduct=(changes:Partial<Product>)=>patch({products:s.products.map(p=>p.id===productControl.id?{...p,...changes}:p)});
  function insertProduct(source?:Product) {
    const id=`product-${nextProductId.current++}`;
    setScenes(prev=>prev.map(x=>x.id===active?addProduct(x,id,source):x));setSelected(id);toast.success(source?'已复制所选产品':'已添加产品');
  }
  const updatePerson=(id:string,changes:Partial<Person>)=>patch({people:s.people.map(p=>p.id===id?{...p,...changes}:p)});
  function addScene(group: Scene['group'],dimensions?:Dimensions) {
    if(group==='自定义'&&!dimensions){setDimensionError('');setCustomOpen(true);return;}
    const id=`scene-${nextSceneId.current++}`;
    setScenes(prev=>appendScene(prev,group,id,dimensions));setActive(id);setSelected('product');
    toast.success(`已添加${group}，可以开始制作`);
  }
  function deleteScene() {
    const index=scenes.findIndex(x=>x.id===deleting);
    if(index<0)return;
    const remaining=scenes.filter(x=>x.id!==deleting);
    setScenes(remaining);
    if(active===deleting)setActive(remaining[Math.min(index,remaining.length-1)]?.id??'');
    setDeleting(null);toast.success('画面已删除');
  }
  async function copy(all=false) {
    const value=all?scenes.map(summary).join('\n\n────────────\n\n'):summary(s);
    try {
      const field=document.createElement('textarea');field.value=value;field.setAttribute('readonly','');field.style.position='fixed';field.style.opacity='0';field.style.pointerEvents='none';document.body.appendChild(field);field.select();const success=document.execCommand('copy');field.remove();
      if(!success){if(!navigator.clipboard)throw new Error('Clipboard unavailable');await navigator.clipboard.writeText(value);}
      setCopied(true);toast.success(all?`已复制全部${scenes.length}张画面摘要`:'已复制当前构图摘要');setTimeout(()=>setCopied(false),2000);
    }catch{toast.error('复制未成功，请选中下方摘要手动复制');}
  }
  function uploadLogo(file?:File) {
    if(!file)return;
    if(!['image/png','image/jpeg','image/webp'].includes(file.type)){toast.error('请使用 PNG、JPG 或 WebP 图片');return;}
    if(file.size>5*1024*1024){toast.error('Logo图片请控制在5MB以内');return;}
    const sceneId=active,reader=new FileReader();
    reader.onerror=()=>toast.error('Logo读取失败，请重新选择图片');
    reader.onload=()=>{if(typeof reader.result!=='string')return;const image=reader.result;setScenes(prev=>prev.map(x=>x.id===sceneId?normalizeScene({...x,logo:{...x.logo,enabled:true,image,filename:file.name}}):x));toast.success('品牌Logo已加入画面');};
    reader.readAsDataURL(file);
  }
  useEffect(()=>{
    const context=(document as Document&{modelContext?:{registerTool:(tool:unknown,options:unknown)=>unknown}}).modelContext;
    if(!context?.registerTool)return;
    const lifecycle=new AbortController();
    const tool={name:'read_scene_configuration',title:'读取画面构图',description:'读取当前或全部画面的实际产品、人物和品牌Logo构图摘要。',inputSchema:{type:'object',properties:{scope:{type:'string',enum:['current','all']}},additionalProperties:false},annotations:{readOnlyHint:true,untrustedContentHint:false},execute:(input:unknown)=>{
      const arg=input as {scope?:string};
      if(!arg||typeof arg!=='object'||Object.keys(arg).some(k=>k!=='scope')||arg.scope&&!['current','all'].includes(arg.scope))throw new Error('scope 必须是 current 或 all');
      const state=liveRef.current;return(arg.scope==='all'?state.scenes:state.scenes.filter(x=>x.id===state.active)).map(x=>({id:x.id,summary:summary(x)}));
    }};
    try{Promise.resolve(context.registerTool(tool,{signal:lifecycle.signal})).catch(()=>{});}catch{}
    return()=>lifecycle.abort();
  },[]);
  const dialogs=<><Dialog open={customOpen} onOpenChange={setCustomOpen}><DialogContent className="custom-scene-dialog"><form onSubmit={e=>{e.preventDefault();const width=Number(customWidth),height=Number(customHeight),error=validateDimensions(width,height);setDimensionError(error);if(!error){addScene('自定义',{width,height});setCustomOpen(false);}}}><DialogHeader><DialogTitle>新增自定义画面</DialogTitle><DialogDescription>宽高 200–4096px；最长边不超过最短边的 4 倍。</DialogDescription></DialogHeader><div className="custom-dimensions"><div><label htmlFor="custom-width">画布宽度（px）</label><Input id="custom-width" type="number" min={200} max={4096} step={1} value={customWidth} onChange={e=>setCustomWidth(e.target.value)} required/></div><div><label htmlFor="custom-height">画布高度（px）</label><Input id="custom-height" type="number" min={200} max={4096} step={1} value={customHeight} onChange={e=>setCustomHeight(e.target.value)} required/></div></div>{dimensionError&&<p className="dimension-error" role="alert">{dimensionError}</p>}<DialogFooter><Button type="button" variant="outline" onClick={()=>setCustomOpen(false)}>取消</Button><Button type="submit">添加并开始制作</Button></DialogFooter></form></DialogContent></Dialog><AlertDialog open={!!deleting} onOpenChange={open=>{if(!open)setDeleting(null);}}><AlertDialogContent><AlertDialogHeader><AlertDialogTitle>删除{deleteLabel}？</AlertDialogTitle><AlertDialogDescription>这张画面的产品、人物和 Logo 配置将一并删除，无法撤销。</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel>取消</AlertDialogCancel><AlertDialogAction onClick={deleteScene} className="confirm-delete">确认删除</AlertDialogAction></AlertDialogFooter></AlertDialogContent></AlertDialog></>;
  if(!scenes.length)return <SidebarProvider style={{'--sidebar-width':'224px'} as React.CSSProperties}><Nav scenes={scenes} active={active} setActive={setActive} onAdd={addScene} onDelete={requestDelete} desktop={desktop}/>{dialogs}<main className="workspace"><header className="topbar"><div className="topbar-left"><SidebarTrigger className="mobile-menu"/><b>画面配置</b></div><span className="private-badge"><LockKeyhole size={13}/>{desktop?'本地离线':'仅自己可见'}</span></header><div className="empty-workspace"><LayoutGrid size={36}/><h1>添加一张画面，开始构图</h1><div><Button onClick={()=>addScene('主图')}><Plus size={16}/>主图</Button><Button variant="outline" onClick={()=>addScene('A+图')}>A+图</Button><Button variant="outline" onClick={()=>addScene('自定义')}>自定义画面</Button></div></div></main><Toaster position="bottom-right" theme="light"/></SidebarProvider>;
  return <SidebarProvider style={{'--sidebar-width':'224px'} as React.CSSProperties}><Nav scenes={scenes} active={active} setActive={setActive} onAdd={addScene} onDelete={requestDelete} desktop={desktop}/>{dialogs}<main className="workspace"><header className="topbar"><div className="topbar-left"><SidebarTrigger className="mobile-menu"/><span>产品构图</span><ChevronRight size={14}/><b>{sceneLabel(s)}</b></div><span className="private-badge"><LockKeyhole size={13}/>{desktop?'本地离线':'仅自己可见'}</span></header><div className="page-content"><div className="page-heading"><div><p className="eyebrow">画面编辑</p><h1>{sceneLabel(s)}<span>{s.width} × {s.height}px</span></h1><p className="description">{s.description}。</p></div><Button variant="outline" className="reset-button" onClick={()=>{patch(createScene(s.group,s.id,s.ordinal,s.presetIndex,{width:s.width,height:s.height}));setSelected('product');toast.success('当前画面已恢复预设');}}><RotateCcw size={15}/>恢复预设</Button></div>
    <div className="work-grid"><div className="control-stack" ref={controlScroll} role="region" aria-label="参数操作区" tabIndex={0}>
      <section className="control-panel"><div className="panel-heading"><Ruler size={18}/><h2>产品尺寸</h2><Button size="sm" variant="ghost" className="add-product" onClick={()=>insertProduct()}><Plus size={14}/>添加产品</Button></div><div className="control-body"><div className="product-picker"><Choice label="编辑产品" value={productLabel(productControl)} options={s.products.map(productLabel)} onChange={label=>setSelected(s.products.find(p=>productLabel(p)===label)!.id)}/><Button size="icon" variant="outline" disabled={s.products.length===1} aria-label={`删除${productLabel(productControl)}`} title="至少保留一个产品" onClick={()=>{const next=removeProduct(s,productControl.id);patch({products:next.products});setSelected(next.products[0].id);}}><Trash2 size={15}/></Button></div><p className="field-note">共 {s.products.length} 个产品，各自调整尺寸与位置。人物比例以{productLabel(s.products[0])}为参考。</p><NumberControl id={`${active}-${productControl.id}-height`} label="产品参考高度" value={productControl.height} min={1} max={10000} unit="cm" onChange={height=>patchProduct({height})}/><p className="field-note">按真实高度设置，参考产品的变化会同步换算人物身高。</p><NumberControl id={`${active}-${productControl.id}-width`} label="产品画面宽度" value={productControl.width} min={5} max={85} unit="%" onChange={width=>patchProduct({width})}/><p className="field-note">当前约 {Math.round(s.width*productControl.width/100)}px 宽。</p><NumberControl id={`${active}-${productControl.id}-occupancy`} label="产品画面高度占比" value={productControl.occupancy} min={.1} step={.1} max={maxProductOccupancy(s,productControl)} unit="%" onChange={occupancy=>patchProduct({occupancy})}/><p className="field-note">当前约 {Math.round(s.height*productControl.occupancy/100)}px 高。{maxProductOccupancy(s,productControl)<95&&`为完整显示当前人物，上限为${maxProductOccupancy(s,productControl)}%。`}</p></div></section>
      <section className="control-panel"><div className="panel-heading"><Users size={18}/><h2>人物配置</h2><span>可设为 0 人</span></div><div className="family-body"><div className="section-title"><h3>人物数量</h3><span className="pill">共 {s.people.length} 人</span></div><div className="family-counts"><div><span>成人</span><div className="stepper"><Button aria-label="减少成人" variant="ghost" size="icon" disabled={adults===0} onClick={()=>patch({people:resizeFamily(s,adults-1,children)})}><Minus size={14}/></Button><b>{adults}</b><Button aria-label="增加成人" variant="ghost" size="icon" disabled={adults===2} onClick={()=>patch({people:resizeFamily(s,adults+1,children)})}><Plus size={14}/></Button></div></div><div><span>儿童</span><div className="stepper"><Button aria-label="减少儿童" variant="ghost" size="icon" disabled={children===0} onClick={()=>patch({people:resizeFamily(s,adults,children-1)})}><Minus size={14}/></Button><b>{children}</b><Button aria-label="增加儿童" variant="ghost" size="icon" disabled={children===3} onClick={()=>patch({people:resizeFamily(s,adults,children+1)})}><Plus size={14}/></Button></div></div></div>
      {s.people.length===0?<div className="empty-people">当前只配置产品和已启用的品牌 Logo。<span>增加人物后，可设置身高、身份与站位。</span></div>:<><div className="person-list">{s.people.map((p,i)=><div className="person-card" key={p.id}><div className="person-row"><span className={`number-chip ${isChild(p)?'child-chip':''}`}>{i+1}</span><Choice label={`人物${i+1}身份`} value={p.role} options={isChild(p)?['男孩','女孩']:['妈妈','爸爸']} onChange={role=>updatePerson(p.id,{role:role as Person['role']})}/><button type="button" className={`person-position ${targetId===p.id?'position-active':''}`} aria-label={`调整人物${i+1}${p.role}位置`} onClick={()=>setSelected(p.id)}><Move size={13}/><span>X {p.x} · Y {p.y}</span></button></div>{!isChild(p)&&<NumberControl id={`${active}-${p.id}-height`} label={`人物${i+1}·${p.role}身高`} value={p.height} min={100} max={220} unit="cm" onChange={height=>updatePerson(p.id,{height})}/>}</div>)}</div><p className="field-note">点击位置或画布选中人物，再拖动或输入 X、Y。</p></>}
      {children>0&&<div className="ratio-setting"><NumberControl id="child-ratio" label={`儿童身高 / ${productLabel(s.products[0])}高度`} value={s.childRatio} min={1} max={Math.max(100,Math.ceil(200/s.products[0].height*100))} unit="%" onChange={childRatio=>patch({childRatio})}/><p className="field-note">儿童参考身高约 {Math.round(s.products[0].height*s.childRatio/100)}cm。</p></div>}
      {adults>0&&children>0&&<div className="field interaction-field"><label>亲子互动 <span>24 种互动</span></label><Choice label="亲子互动" value={s.interaction||NO_INTERACTION} options={[NO_INTERACTION,...interactions]} onChange={interaction=>patch({interaction:interaction===NO_INTERACTION?'':interaction})}/><p className="field-note">动作写入摘要；人物框按站立身高示意。</p></div>}
      {s.people.length>0&&<div className="family-actions"><span>按画面需要安排人物</span><Button variant="ghost" size="sm" onClick={()=>{const next=variation+1;setVariation(next);patch({people:familyFor(s.presetIndex,next)});setSelected(s.products[0].id);toast.success('已更换当前人物组合');}}><Shuffle size={14}/>换一组人物</Button></div>}
      </div></section>
      <section className="control-panel"><div className="panel-heading"><Stamp size={18}/><h2 id="logo-heading">品牌 Logo</h2><Switch aria-labelledby="logo-heading" checked={s.logo.enabled} onCheckedChange={enabled=>patchLogo({enabled})}/></div>{s.logo.enabled?<div className="control-body">
        <div className="logo-mode-field"><label id="logo-mode-label">Logo处理方式</label><ToggleGroup type="single" value={s.logo.mode} onValueChange={mode=>{if(mode)patchLogo({mode:mode as BrandLogo['mode']});}} aria-labelledby="logo-mode-label" className="logo-mode-toggle" variant="outline"><ToggleGroupItem value="design" aria-label="设计">设计</ToggleGroupItem><ToggleGroupItem value="blank" aria-label="留空">留空</ToggleGroupItem></ToggleGroup></div>
        {s.logo.mode==='design'?<><div className="logo-source"><Button variant="outline" className="logo-upload" onClick={()=>logoInput.current?.click()}><Upload size={15}/>{s.logo.image?'替换 Logo 图片':'上传 Logo 图片'}</Button><input ref={logoInput} className="sr-only" type="file" accept="image/png,image/jpeg,image/webp" aria-label="上传品牌Logo图片" onChange={e=>{uploadLogo(e.target.files?.[0]);e.target.value='';}}/>{s.logo.image&&<div className="logo-file"><span>{s.logo.filename}</span><Button variant="ghost" size="icon" aria-label="移除Logo图片" onClick={()=>patchLogo({image:undefined,filename:undefined})}><X size={14}/></Button></div>}</div>{!s.logo.image&&<div className="field brand-text-field"><label htmlFor="brand-text">或输入品牌文字</label><Input id="brand-text" aria-label="品牌文字" placeholder="你的品牌名称" maxLength={40} value={s.logo.text} onChange={e=>patchLogo({text:e.target.value})}/></div>}</>:<p className="logo-blank-note">只预留干净的空白区域，供后期排版。画布中的虚线框仅用于标记位置，不写入最终画面。</p>}
        <div className="logo-dimensions"><NumberControl id="logo-width" label="Logo区域宽度" value={s.logo.width} min={16} max={s.width} unit="px" onChange={width=>patchLogo({width})}/><NumberControl id="logo-height" label="Logo区域高度" value={s.logo.height} min={16} max={s.height} unit="px" onChange={height=>patchLogo({height})}/></div><Button className="logo-position-button" variant="outline" onClick={()=>setSelected('logo')}><Move size={14}/>{s.logo.mode==='blank'?'调整留白位置':'调整 Logo 位置'} <span>X {s.logo.x} · Y {s.logo.y}</span></Button>
        {s.logo.mode==='design'&&<p className="field-note">PNG / JPG / WebP，最大5MB；图片在区域内等比显示。Logo图片仅用于本次编辑，刷新后需重新选择。</p>}
      </div>:<div className="logo-disabled-note">开启后，可选择设计 Logo 或单纯留空，并独立调整区域宽高和位置。</div>}</section>
    </div>
    <section className="result-column"><div className="preview-panel"><div className="panel-heading"><LayoutGrid size={18}/><h2>实时构图</h2><span>{s.width} × {s.height}px</span></div><div className="preview-body"><div className="canvas-instruction"><Move size={15}/><span>拖动元素，或输入坐标精确调整</span></div><Composition scene={s} selected={targetId} onSelect={setSelected} onMove={move}/><div className="preview-legend"><span><i className="legend-product"/>产品主体</span>{adults>0&&<span><i className="legend-adult"/>成人</span>}{children>0&&<span><i className="legend-child"/>儿童</span>}{s.logo.enabled&&<span><i className="legend-logo"/>{s.logo.mode==='blank'?'Logo留白区域':'品牌 Logo'}</span>}</div>
      <div className="coordinates"><div className="coordinate-target"><label>调整对象</label><Choice label="调整对象" value={targets.find(x=>x.id===targetId)!.label} options={targets.map(x=>x.label)} onChange={label=>setSelected(targets.find(x=>x.label===label)!.id)}/></div><div className="composition-shortcuts"><Button variant="outline" size="sm" onClick={()=>move(targetId,{x:50,y:50+targetHeight/2})}><AlignCenter size={15}/>居中</Button><Button variant="outline" size="sm" disabled={logoSelected} onClick={()=>{setScenes(prev=>prev.map(x=>x.id===active?alignBottom(x,targetId):x));toast.success('产品与人物底部已对齐');}}><AlignEndVertical size={15}/>底部对齐</Button><Button variant="outline" size="sm" disabled={!selectedProduct} onClick={()=>insertProduct(selectedProduct)}><Copy size={15}/>复制产品</Button></div><div className="coordinate-axes"><AxisControl axis="X" targetName={targetName} value={point.x} min={Math.ceil(targetWidth/2*10)/10} max={Math.floor((100-targetWidth/2)*10)/10} onChange={x=>move(targetId,{x,y:point.y})}/><AxisControl axis="Y" targetName={targetName} value={point.y} min={Math.ceil(targetHeight*10)/10} max={100} onChange={y=>move(targetId,{x:point.x,y})}/></div><p className="coordinate-note">左上角为原点，X向右、Y向下。定位点为元素底部中心。「底部对齐」让所有产品和人物以所选对象的底边为基准。选中后用方向键移动，Shift + 方向键加快移动。</p></div>
      {overlaps.length>0&&<div className="overlap-note" role="status"><AlertCircle size={14}/><span>{overlaps.slice(0,2).join('；')}{overlaps.length>2?`，共${overlaps.length}处`:''}，请确认遮挡关系。</span></div>}{duplicates.length>0&&<div className="overlap-note"><Users size={14}/><span>与 {duplicates.map(sceneLabel).join('、')} 的人物身份与站位相同，可换一组人物或调整位置。</span></div>}
      <p className="preview-note">构图与比例示意 · 产品造型以实际素材为准</p></div></div>
      <section className="summary-panel"><div className="summary-head"><div><ClipboardList size={18}/><h2>画面摘要</h2></div><Button variant="outline" size="sm" onClick={()=>copy()}>{copied?<Check size={13}/>:<Copy size={13}/>}复制当前摘要</Button></div><div className="summary-content" aria-live="polite" aria-label="实时画面摘要">{summary(s).split('\n\n').map((line,i)=><p className={i===0?'summary-title':''} key={i}>{line}</p>)}</div><div className="summary-footer"><span>仅描述当前启用的元素</span><Button variant="ghost" size="sm" onClick={()=>copy(true)}><Copy size={13}/>复制全部摘要</Button></div></section>
    </section></div><footer className="workspace-footer"><span>产品比例 · 人物配置 · 品牌位置</span><span>切换画面保留本次编辑；刷新恢复预设</span></footer></div></main><Toaster position="bottom-right" theme="light"/></SidebarProvider>;
}
