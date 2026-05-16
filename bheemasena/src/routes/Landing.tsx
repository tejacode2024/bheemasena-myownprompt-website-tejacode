import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { HeroVideo } from '../components/hero/HeroVideo'
import { About } from '../components/sections/About'
import { Marquee } from '../components/sections/Marquee'
import { Gallery } from '../components/sections/Gallery'
import { MenuSection } from '../components/sections/MenuSection'
import { GiftCard } from '../components/sections/GiftCard'
import { Team } from '../components/sections/Team'
import { Reviews } from '../components/sections/Reviews'
import { BlogStrip } from '../components/sections/BlogStrip'
import { Contacts } from '../components/sections/Contacts'
import { Footer } from '../components/layout/Footer'

export default function Landing() {
  const location = useLocation()

  useEffect(() => {
    if (location.hash) {
      const id = location.hash.slice(1)
      const el = document.getElementById(id)
      if (el) {
        setTimeout(() => el.scrollIntoView({ behavior: 'smooth' }), 60)
      }
    }
  }, [location.hash])

  return (
    <main>
      <HeroVideo />
      <About />
      <Marquee />
      <Gallery />
      <MenuSection variant="preview" />
      <GiftCard />
      <Team />
      <Reviews />
      <BlogStrip />
      <Contacts />
      <Footer />
    </main>
  )
}
