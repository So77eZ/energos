import type { Metadata } from 'next'
import './globals.css'
import { Header } from '@widgets/header/ui/Header'
import { Footer } from '@widgets/footer/ui/Footer'
import { ScrollToTop } from '@widgets/scroll-to-top/ui/ScrollToTop'
import { CatalogSearchProvider } from '@shared/lib/catalog-search'

export const metadata: Metadata = {
  title: 'Energos — рейтинг энергетиков',
  description: 'Каталог, сравнение и оценки энергетических напитков',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru">
      <body>
        <CatalogSearchProvider>
          <Header />
          <main className="max-w-[1200px] mx-auto px-[5px] py-[5px] sm:px-4 sm:py-6">{children}</main>
          <Footer />
          <ScrollToTop />
        </CatalogSearchProvider>
      </body>
    </html>
  )
}
