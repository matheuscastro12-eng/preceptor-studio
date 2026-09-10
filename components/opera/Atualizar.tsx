'use client';
import {useEffect} from 'react';
import {useRouter} from 'next/navigation';
export default function Atualizar(){const router=useRouter();useEffect(()=>{const atualizar=()=>{if(document.visibilityState==='visible')router.refresh();};const timer=setInterval(atualizar,30000);document.addEventListener('visibilitychange',atualizar);return()=>{clearInterval(timer);document.removeEventListener('visibilitychange',atualizar);};},[router]);return null;}
