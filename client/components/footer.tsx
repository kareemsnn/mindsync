import { FacebookIcon, TwitterIcon, InstagramIcon, LinkedinIcon } from "lucide-react"

interface FooterProps {
  gradient?: string;
}

export default function Footer({ gradient = "gradient-purple-indigo" }: FooterProps) {
  return (
    <footer id="join" className={`py-12 px-4 scroll-mt-16 flowing-gradient ${gradient}`}>
      <div className="container mx-auto relative z-10">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-6 md:mb-0">
            <h2 className="text-2xl font-bold text-white">
              mindsync
            </h2>
            <p className="text-white/80 mt-2">San Francisco, CA</p>
          </div>

          <div className="flex space-x-6 mb-6 md:mb-0">
            <a
              href="#"
              className="text-white/80 hover:text-white transition-colors"
            >
              <FacebookIcon className="h-5 w-5" />
              <span className="sr-only">Facebook</span>
            </a>
            <a
              href="#"
              className="text-white/80 hover:text-white transition-colors"
            >
              <TwitterIcon className="h-5 w-5" />
              <span className="sr-only">Twitter</span>
            </a>
            <a
              href="#"
              className="text-white/80 hover:text-white transition-colors"
            >
              <InstagramIcon className="h-5 w-5" />
              <span className="sr-only">Instagram</span>
            </a>
            <a
              href="#"
              className="text-white/80 hover:text-white transition-colors"
            >
              <LinkedinIcon className="h-5 w-5" />
              <span className="sr-only">LinkedIn</span>
            </a>
          </div>
        </div>

        <div className="border-t border-white/10 mt-8 pt-8 text-center text-white/70 text-sm">
          <p>© 2025 mindsync. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}
