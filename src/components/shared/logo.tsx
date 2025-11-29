'use client'

import { cn } from '@/lib/utils'
import { useId } from 'react'
import { useEffect, useState } from 'react'

export const Logo = ({ className, uniColor }: { className?: string; uniColor?: boolean }) => {
    const id = useId()
    const gradientId = `gradient-${id.replace(/:/g, '')}`
    const [primaryColor, setPrimaryColor] = useState('#3b82f6')
    
    useEffect(() => {
        const updateColor = () => {
            const root = document.documentElement
            const computedStyle = getComputedStyle(root)
            const primary = computedStyle.getPropertyValue('--primary').trim()
            
            // Convertir oklch a hex si es necesario, o usar directamente
            // Por ahora, usaremos un enfoque más simple: leer el color primario
            // y crear variaciones para el gradiente
            if (primary) {
                // Intentar convertir oklch a rgb/hex
                try {
                    // Si es oklch, necesitamos convertirlo
                    if (primary.startsWith('oklch')) {
                        // Usar el color directamente con CSS custom properties
                        setPrimaryColor(`hsl(var(--primary))`)
                    } else {
                        setPrimaryColor(primary)
                    }
                } catch {
                    setPrimaryColor(`hsl(var(--primary))`)
                }
            }
        }
        
        updateColor()
        
        // Observar cambios en el tema
        const observer = new MutationObserver(updateColor)
        observer.observe(document.documentElement, {
            attributes: true,
            attributeFilter: ['data-theme', 'class']
        })
        
        return () => observer.disconnect()
    }, [])
    
    return (
        <svg 
            className={cn('h-7 w-7', className)} 
            viewBox="0 -3 40 37" 
            fill="none" 
            xmlns="http://www.w3.org/2000/svg"
        >
            {/* Fondo con gradiente del tema */}
            <rect x="0" y="0" width="32" height="32" rx="8" className="fill-primary"/>
            
            {/* Avión centrado */}
            <g transform="translate(4, 4)">
                <path d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z" fill="white" opacity="0.98"/>
            </g>
            
            {/* Checkmark verde que sobresale del borde superior derecho */}
            {/* Centro del círculo en la esquina (32, 0) */}
            <g transform="translate(32, 0)">
                <circle cx="0" cy="0" r="6" fill="white" opacity="0.98"/>
                <circle cx="0" cy="0" r="5.5" fill="#22c55e" opacity="0.95"/>
                <path d="M-2.5 0 L-0.5 2 L2.5 -2" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
            </g>
        </svg>
    )
}

export const LogoIcon = ({ className, uniColor }: { className?: string; uniColor?: boolean }) => {
    return (
        <img 
            src="/icon.png"
            alt="Shop Trip"
            className={cn('h-6 w-6 sm:h-7 sm:w-7', className)}
        />
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
