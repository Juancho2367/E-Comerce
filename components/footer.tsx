import Link from "next/link"
import { Facebook, Instagram, Twitter } from "lucide-react"

export function Footer() {
  return (
    <footer className="bg-primary text-white mt-auto">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div>
            <h3 className="text-2xl font-light tracking-widest mb-4">ÉLITE</h3>
            <p className="text-sm text-white/80">
              Elegancia sin límites. Descubre nuestra selección exclusiva de piezas de alta costura.
            </p>
          </div>

          {/* Enlaces */}
          <div>
            <h4 className="font-semibold mb-4">Tienda</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/productos" className="text-white/80 hover:text-white">
                  Mujer
                </Link>
              </li>
              <li>
                <Link href="/productos" className="text-white/80 hover:text-white">
                  Gym
                </Link>
              </li>
              <li>
                <Link href="/mayoristas" className="text-white/80 hover:text-white">
                  Mayoristas
                </Link>
              </li>
            </ul>
          </div>

          {/* Ayuda */}
          <div>
            <h4 className="font-semibold mb-4">Ayuda</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="#" className="text-white/80 hover:text-white">
                  Envíos
                </Link>
              </li>
              <li>
                <Link href="#" className="text-white/80 hover:text-white">
                  Devoluciones
                </Link>
              </li>
              <li>
                <Link href="#" className="text-white/80 hover:text-white">
                  Tallas
                </Link>
              </li>
              <li>
                <Link href="#" className="text-white/80 hover:text-white">
                  Contacto
                </Link>
              </li>
            </ul>
          </div>

          {/* Redes Sociales */}
          <div>
            <h4 className="font-semibold mb-4">Síguenos</h4>
            <div className="flex gap-4">
              <Link href="#" className="text-white/80 hover:text-white transition-colors">
                <Instagram className="h-5 w-5" />
              </Link>
              <Link href="#" className="text-white/80 hover:text-white transition-colors">
                <Facebook className="h-5 w-5" />
              </Link>
              <Link href="#" className="text-white/80 hover:text-white transition-colors">
                <Twitter className="h-5 w-5" />
              </Link>
            </div>
          </div>
        </div>

        <div className="border-t border-white/20 mt-8 pt-8 text-center text-sm text-white/60">
          <p>&copy; 2025 ÉLITE. Todos los derechos reservados.</p>
        </div>
      </div>
    </footer>
  )
}
