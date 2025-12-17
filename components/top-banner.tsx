'use client'

import { Truck, HeadphonesIcon, Shield } from 'lucide-react'
import Link from 'next/link'

export function TopBanner() {
  const benefits = [
    {
      icon: HeadphonesIcon,
      text: 'Atención 24/7',
      subtext: 'Soporte online',
      link: '/contacto',
    },
    {
      icon: Shield,
      text: 'Compra segura',
      subtext: 'Garantía',
      link: '/garantia',
    },
  ]

  return (
    <div className="bg-gradient-to-r from-primary via-primary/95 to-primary text-primary-foreground border-b border-primary/20">
      <div className="container mx-auto px-4">
        {/* Primera fila: Mensaje principal */}
        <div className="py-2.5 flex items-center justify-center gap-2 text-xs md:text-sm font-medium border-b border-primary-foreground/10">
          <Truck className="h-3.5 w-3.5 md:h-4 md:w-4 flex-shrink-0" />
          <span>
            Envíos gratis a todo el país, aplican{' '}
            <Link href="/terminos" className="underline hover:no-underline font-semibold">
              TyC
            </Link>
          </span>
        </div>

        {/* Segunda fila: Beneficios */}
        <div className="hidden md:grid grid-cols-2 divide-x divide-primary-foreground/10">
          {benefits.map((benefit, index) => {
            const Icon = benefit.icon
            return (
              <Link
                key={index}
                href={benefit.link}
                className="flex items-center justify-center gap-2 py-2.5 hover:bg-primary-foreground/5 transition-colors group"
              >
                <Icon className="h-4 w-4 flex-shrink-0 group-hover:scale-110 transition-transform" />
                <div className="text-center">
                  <div className="text-xs font-semibold leading-tight">{benefit.text}</div>
                  <div className="text-[10px] opacity-90 leading-tight">{benefit.subtext}</div>
                </div>
              </Link>
            )
          })}
        </div>
      </div>
    </div>
  )
}

