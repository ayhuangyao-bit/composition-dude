"use client";
import { useEffect, useRef, useState, type PointerEvent, type KeyboardEvent } from 'react';
import { Camera } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { isChild, personFrameHeight, logoFrame, productLabel, PERSON_FRAME_WIDTH, type Scene, type Point } from '@/lib/scene-config';

async function renderPng(svg: SVGSVGElement, width: number, height: number): Promise<Blob> {
  const clone = svg.cloneNode(true) as SVGSVGElement;
  clone.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
  clone.setAttribute('width', String(width)); clone.setAttribute('height', String(height));
  const data = new XMLSerializer().serializeToString(clone);
  const url = URL.createObjectURL(new Blob([data], { type: 'image/svg+xml;charset=utf-8' }));
  try {
    const image = new Image();
    await new Promise<void>((resolve, reject) => { image.onload = () => resolve(); image.onerror = () => reject(new Error('画布读取失败')); image.src = url; });
    const canvas = document.createElement('canvas'); canvas.width = width; canvas.height = height;
    const context = canvas.getContext('2d'); if (!context) throw new Error('无法导出画布');
    context.drawImage(image, 0, 0, width, height);
    return await new Promise<Blob>((resolve, reject) => canvas.toBlob(blob => blob ? resolve(blob) : reject(new Error('PNG生成失败')), 'image/png'));
  } finally { URL.revokeObjectURL(url); }
}
export function Composition({ scene: s, selected, onSelect, onMove }: { scene: Scene; selected: string; onSelect: (id: string) => void; onMove: (id: string, point: Point) => void }) {
  const stageRef = useRef<SVGSVGElement>(null);
  const dragRef = useRef<{ id: string; pointer: number; startX: number; startY: number; origin: Point; width: number; height: number } | null>(null);
  const [capturing, setCapturing] = useState(false);
  const [exportResult, setExportResult] = useState<{url:string;name:string;sceneId:string}|null>(null);
  useEffect(()=>()=>{if(exportResult)URL.revokeObjectURL(exportResult.url);},[exportResult]);
  function bindings(id: string, point: Point) {
    return {
      onPointerDown: (e: PointerEvent<SVGGElement>) => {
        if (e.button !== 0) return;
        const rect = stageRef.current!.getBoundingClientRect();
        onSelect(id); e.currentTarget.focus(); e.currentTarget.setPointerCapture(e.pointerId); e.preventDefault();
        dragRef.current = { id, pointer: e.pointerId, startX: e.clientX, startY: e.clientY, origin: { ...point }, width: rect.width, height: rect.height };
      },
      onPointerMove: (e: PointerEvent<SVGGElement>) => {
        const drag = dragRef.current;
        if (!drag || drag.pointer !== e.pointerId || drag.id !== id) return;
        onMove(id, { x: drag.origin.x + (e.clientX - drag.startX) / drag.width * 100, y: drag.origin.y + (e.clientY - drag.startY) / drag.height * 100 });
      },
      onPointerUp: (e: PointerEvent<SVGGElement>) => { dragRef.current = null; if (e.currentTarget.hasPointerCapture(e.pointerId)) e.currentTarget.releasePointerCapture(e.pointerId); },
      onPointerCancel: () => { dragRef.current = null; }, onClick: () => onSelect(id),
      onKeyDown: (e: KeyboardEvent<SVGGElement>) => {
        if (!['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(e.key)) return;
        e.preventDefault(); const step = e.shiftKey ? 5 : 1;
        onMove(id, { x: point.x + (e.key === 'ArrowLeft' ? -step : e.key === 'ArrowRight' ? step : 0), y: point.y + (e.key === 'ArrowUp' ? -step : e.key === 'ArrowDown' ? step : 0) });
      },
    };
  }
  async function capture() {
    if (!stageRef.current || capturing) return;
    setCapturing(true);
    const png = renderPng(stageRef.current, s.width, s.height);
    try {
      if(window.compositionDude?.copyPng){
        await window.compositionDude.copyPng(new Uint8Array(await (await png).arrayBuffer()));
        toast.success('画布 PNG 已复制，可直接粘贴');return;
      }
      if (navigator.clipboard?.write && typeof ClipboardItem !== 'undefined') {
        try {
          await navigator.clipboard.write([new ClipboardItem({ 'image/png': png })]);
          toast.success('画布 PNG 已复制，可直接粘贴'); return;
        } catch { /* The same PNG remains available for downloading. */ }
      }
      const blob = await png, url = URL.createObjectURL(blob), link = document.createElement('a');
      const name = `${s.group}-${s.ordinal}-${s.width}x${s.height}.png`;
      setExportResult({url,name,sceneId:s.id});
      link.href = url; link.download = name; document.body.appendChild(link); link.click(); link.remove();
      toast.info('浏览器未允许复制图片，已生成 PNG 并开始下载');
    } catch { toast.error('截图未成功，请重试'); } finally { setCapturing(false); }
  }
  const frame = logoFrame(s), unit = s.width / 450, font = 13 * unit;
  function box(id: string, label: string, point: Point, width: number, height: number, stroke: string, fill: string, content: React.ReactNode, dashed = false) {
    const x = (point.x - width / 2) * s.width / 100, y = (point.y - height) * s.height / 100;
    const w = width * s.width / 100, h = height * s.height / 100;
    return <g key={id} role="button" tabIndex={0} aria-label={label} aria-pressed={selected === id} className="svg-object" {...bindings(id, point)}>
      {selected === id && <rect x={x - 3 * unit} y={y - 3 * unit} width={w + 6 * unit} height={h + 6 * unit} rx={6 * unit} fill="none" stroke="#d2e3ff" strokeWidth={2 * unit} pointerEvents="none"/>}
      <rect x={x} y={y} width={w} height={h} rx={4 * unit} fill={fill} stroke={stroke} strokeWidth={unit} strokeDasharray={dashed ? `${4 * unit} ${3 * unit}` : undefined}/>
      <svg x={x} y={y} width={w} height={h} viewBox={`0 0 ${w} ${h}`} overflow="hidden" pointerEvents="none">{content}</svg>
      <circle cx={point.x * s.width / 100} cy={point.y * s.height / 100} r={selected === id ? 3.5 * unit : 2.5 * unit} fill={stroke} pointerEvents="none"/>
    </g>;
  }
  return <div className="canvas-wrap"><div className="canvas-toolbar"><Button variant="outline" size="sm" onClick={capture} disabled={capturing}><Camera size={15}/>{capturing ? '正在截图…' : '截图并复制画布'}</Button><span>{s.width} × {s.height}px PNG</span></div>{exportResult?.sceneId===s.id&&<a className="download-canvas" href={exportResult.url} download={exportResult.name}>下载刚才的画布截图</a>}
    <svg ref={stageRef} className={`composition svg-composition ${s.width === s.height ? 'square' : 'wide'}`} style={{ aspectRatio: `${s.width} / ${s.height}`, maxWidth: `${Math.min(s.width===s.height?450:650,450*s.width/s.height)}px` }} viewBox={`0 0 ${s.width} ${s.height}`} role="region" aria-label="可拖动构图画布" fontFamily="Arial, 'Microsoft YaHei', sans-serif">
      <rect width={s.width} height={s.height} fill="#172338"/>
      {Array.from({ length: 9 }, (_, i) => <g key={i} stroke="#b9c7e0" strokeOpacity=".08" strokeWidth={unit}><line x1={(i + 1) * s.width / 10} x2={(i + 1) * s.width / 10} y1={0} y2={s.height}/><line x1={0} x2={s.width} y1={(i + 1) * s.height / 10} y2={(i + 1) * s.height / 10}/></g>)}
      <text x={10 * unit} y={18 * unit} fill="#91a4c0" fontSize={10 * unit}>左上角 0,0</text>
      {s.products.map(p => { const w = p.width * s.width / 100, h = p.occupancy * s.height / 100; const size = Math.min(font, w / 4, h / 4); return box(p.id, `移动${productLabel(p)}`, p, p.width, p.occupancy, '#91b7fa', '#2a3e61', <text x={w / 2} y={h / 2} textAnchor="middle" fill="#dceaff" fontSize={size}><tspan x={w / 2} dy={-size / 2}>{productLabel(p)}</tspan><tspan x={w / 2} dy={size * 1.6}>{p.height}cm</tspan></text>); })}
      {s.people.map((p, i) => { const w = PERSON_FRAME_WIDTH * s.width / 100, h = personFrameHeight(s, p) * s.height / 100, size = Math.min(font, w / 2.4, h / 4); const color = isChild(p) ? '#f1cca5' : '#dbcff3'; return box(p.id, `移动人物${i + 1}${p.role}`, p, PERSON_FRAME_WIDTH, personFrameHeight(s, p), isChild(p) ? '#daa96f' : '#baa7df', isChild(p) ? '#473c34' : '#3c3654', <text x={w / 2} y={h / 2 - size} textAnchor="middle" fill={color} fontSize={size}><tspan x={w / 2}>{p.role[0]}</tspan><tspan x={w / 2} dy={size * 1.3}>{p.role[1]}</tspan><tspan x={w / 2} dy={size * 1.7} fontSize={size * .8}>{i + 1}</tspan></text>); })}
      {s.logo.enabled && box('logo', s.logo.mode === 'blank' ? '移动Logo留白区域' : '移动品牌Logo', s.logo, frame.width, frame.height, '#b4c9ef', s.logo.mode === 'blank' ? 'transparent' : '#344b57', s.logo.mode === 'blank' ? null : s.logo.image ? <image href={s.logo.image} width={s.logo.width} height={s.logo.height} preserveAspectRatio="xMidYMid meet"/> : <text x={s.logo.width / 2} y={s.logo.height / 2} dominantBaseline="middle" textAnchor="middle" fill="#e0e9fa" fontSize={Math.min(font, s.logo.width / Math.max(3, s.logo.text.length), s.logo.height / 2)}>{s.logo.text.trim() || 'Logo'}</text>, true)}
      <text x={10 * unit} y={s.height - 10 * unit} fill="#91a4bf" fontSize={10 * unit}>拖动元素 · 构图与比例示意</text>
    </svg>
  </div>;
}
