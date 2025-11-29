'use client'

import { cn } from '@/lib/utils'
import { useId } from 'react'

export const Logo = ({ className, uniColor }: { className?: string; uniColor?: boolean }) => {
    const id = useId()
    const gradientId = `gradient-${id.replace(/:/g, '')}`
    const innerGradientId = `innerGradient-${id.replace(/:/g, '')}`
    
    return (
        <svg 
            className={cn('h-7 w-7', className)} 
            viewBox="0 0 32 32" 
            fill="none" 
            xmlns="http://www.w3.org/2000/svg"
        >
            {/* Fondo con gradiente azul-púrpura */}
            <rect width="32" height="32" rx="8" fill={`url(#${gradientId})`}/>
            
            {/* Maleta/Valija estilizada con checkmark */}
            <g transform="translate(4, 5)">
                {/* Sombra sutil */}
                <rect x="6" y="8" width="18" height="18" rx="2.5" fill="black" opacity="0.1"/>
                {/* Cuerpo principal de la maleta */}
                <rect x="5" y="7" width="18" height="18" rx="2.5" fill="white" opacity="0.98"/>
                {/* Tapa superior */}
                <rect x="5" y="7" width="18" height="5" rx="2.5" fill="white" opacity="0.9"/>
                {/* Detalle de la tapa */}
                <line x1="7" y1="9" x2="21" y2="9" stroke={`url(#${innerGradientId})`} strokeWidth="1" opacity="0.3"/>
                {/* Interior con gradiente suave */}
                <rect x="7" y="9" width="14" height="14" rx="1.5" fill={`url(#${innerGradientId})`}/>
                {/* Checkmark elegante y visible */}
                <path d="M10 17l4 4 8-8" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none" opacity="0.95"/>
            </g>
            
            <defs>
                <linearGradient id={gradientId} x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
                    <stop offset="0%" stopColor="#3b82f6"/>
                    <stop offset="50%" stopColor="#6366f1"/>
                    <stop offset="100%" stopColor="#8b5cf6"/>
                </linearGradient>
                <linearGradient id={innerGradientId} x1="7" y1="9" x2="21" y2="23" gradientUnits="userSpaceOnUse">
                    <stop offset="0%" stopColor="#60a5fa" opacity="0.7"/>
                    <stop offset="100%" stopColor="#a78bfa" opacity="0.7"/>
                </linearGradient>
            </defs>
        </svg>
    )
}

export const LogoIcon = ({ className, uniColor }: { className?: string; uniColor?: boolean }) => {
    const id = useId()
    const gradientId = `gradientIcon-${id.replace(/:/g, '')}`
    const innerGradientId = `innerGradientIcon-${id.replace(/:/g, '')}`
    
    return (
        <svg 
            className={cn('h-6 w-6 sm:h-7 sm:w-7', className)} 
            viewBox="0 0 32 32" 
            fill="none" 
            xmlns="http://www.w3.org/2000/svg"
        >
            {/* Fondo con gradiente azul-púrpura */}
            <rect width="32" height="32" rx="8" fill={`url(#${gradientId})`}/>
            
            {/* Maleta/Valija estilizada con checkmark */}
            <g transform="translate(4, 5)">
                {/* Sombra sutil */}
                <rect x="6" y="8" width="18" height="18" rx="2.5" fill="black" opacity="0.1"/>
                {/* Cuerpo principal de la maleta */}
                <rect x="5" y="7" width="18" height="18" rx="2.5" fill="white" opacity="0.98"/>
                {/* Tapa superior */}
                <rect x="5" y="7" width="18" height="5" rx="2.5" fill="white" opacity="0.9"/>
                {/* Detalle de la tapa */}
                <line x1="7" y1="9" x2="21" y2="9" stroke={`url(#${innerGradientId})`} strokeWidth="1" opacity="0.3"/>
                {/* Interior con gradiente suave */}
                <rect x="7" y="9" width="14" height="14" rx="1.5" fill={`url(#${innerGradientId})`}/>
                {/* Checkmark elegante y visible */}
                <path d="M10 17l4 4 8-8" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none" opacity="0.95"/>
            </g>
            
            <defs>
                <linearGradient id={gradientId} x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
                    <stop offset="0%" stopColor="#3b82f6"/>
                    <stop offset="50%" stopColor="#6366f1"/>
                    <stop offset="100%" stopColor="#8b5cf6"/>
                </linearGradient>
                <linearGradient id={innerGradientId} x1="7" y1="9" x2="21" y2="23" gradientUnits="userSpaceOnUse">
                    <stop offset="0%" stopColor="#60a5fa" opacity="0.7"/>
                    <stop offset="100%" stopColor="#a78bfa" opacity="0.7"/>
                </linearGradient>
            </defs>
        </svg>
    )
}

export const LogoStroke = ({ className }: { className?: string }) => {
    return (
        <svg
            className={cn('size-7 w-7', className)}
            viewBox="0 0 71 25"
            fill="none"
            xmlns="http://www.w3.org/2000/svg">
            <path
                d="M61.25 1.625L70.75 1.5625C70.75 4.77083 70.25 7.79167 69.25 10.625C68.2917 13.4583 66.8958 15.9583 65.0625 18.125C63.2708 20.25 61.125 21.9375 58.625 23.1875C56.1667 24.3958 53.4583 25 50.5 25C46.875 25 43.6667 24.2708 40.875 22.8125C38.125 21.3542 35.125 19.2083 31.875 16.375C29.75 14.4167 27.7917 12.8958 26 11.8125C24.2083 10.7292 22.2708 10.1875 20.1875 10.1875C18.0625 10.1875 16.25 10.7083 14.75 11.75C13.25 12.75 12.0833 14.1875 11.25 16.0625C10.4583 17.9375 10.0625 20.1875 10.0625 22.8125L0 22.9375C0 19.6875 0.479167 16.6667 1.4375 13.875C2.4375 11.0833 3.83333 8.64583 5.625 6.5625C7.41667 4.47917 9.54167 2.875 12 1.75C14.5 0.583333 17.2292 0 20.1875 0C23.8542 0 27.1042 0.770833 29.9375 2.3125C32.8125 3.85417 35.7708 5.97917 38.8125 8.6875C41.1042 10.7708 43.1042 12.3333 44.8125 13.375C46.5625 14.375 48.4583 14.875 50.5 14.875C52.6667 14.875 54.5417 14.3125 56.125 13.1875C57.75 12.0625 59 10.5 59.875 8.5C60.7917 6.5 61.25 4.20833 61.25 1.625Z"
                fill="none"
                strokeWidth={0.5}
                stroke="currentColor"
            />
        </svg>
    )
}
