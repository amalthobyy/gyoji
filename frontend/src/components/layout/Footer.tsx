import { Link } from 'react-router-dom'

export default function Footer() {
  const socials = [
    { name: 'Instagram', href: '#', icon: (
      <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
        <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
        <line x1="17.5" y1="6.5" x2="17.5" y2="6.5" />
      </svg>
    ) },
    { name: 'Twitter', href: '#', icon: (
      <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
        <path d="M22 5.92a7.6 7.6 0 0 1-2.18.6 3.82 3.82 0 0 0 1.68-2.11 7.67 7.67 0 0 1-2.42.93A3.8 3.8 0 0 0 16.1 4a3.86 3.86 0 0 0-3.85 3.86c0 .3.03.6.1.89A10.92 10.92 0 0 1 3.26 4.73a3.86 3.86 0 0 0 1.2 5.15 3.75 3.75 0 0 1-1.75-.49v.05c0 1.87 1.32 3.43 3.06 3.79a3.72 3.72 0 0 1-1.74.07 3.86 3.86 0 0 0 3.6 2.68A7.63 7.63 0 0 1 2 18.58 10.78 10.78 0 0 0 8.29 20.5c7.55 0 11.68-6.29 11.68-11.73 0-.18 0-.36-.01-.54A8.4 8.4 0 0 0 22 5.92z" />
      </svg>
    ) },
    { name: 'YouTube', href: '#', icon: (
      <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
        <path d="M21.8 8.2a2.5 2.5 0 0 0-1.77-1.77C18.28 6 12 6 12 6s-6.28 0-8.03.43A2.5 2.5 0 0 0 2.2 8.2 26.2 26.2 0 0 0 1.8 12a26.2 26.2 0 0 0 .4 3.8 2.5 2.5 0 0 0 1.77 1.77C5.72 18 12 18 12 18s6.28 0 8.03-.43a2.5 2.5 0 0 0 1.77-1.77c.27-1.25.4-2.55.4-3.8a26.2 26.2 0 0 0-.4-3.8ZM10 15V9l5 3-5 3Z" />
      </svg>
    ) },
  ]

  const primaryLinks = [
    { label: 'Trainers', to: '/trainers' },
    { label: 'Workouts', to: '/workouts' },
    { label: 'Nutrition', to: '/nutrition' },
    { label: 'Store', to: '/store' },
  ]

  const supportLinks = [
    { label: 'FAQs', to: '#' },
    { label: 'Support', to: '#' },
    { label: 'Community', to: '#' },
    { label: 'Accessibility', to: '#' },
  ]

  const companyLinks = [
    { label: 'About', to: '#' },
    { label: 'Careers', to: '#' },
    { label: 'Press', to: '#' },
    { label: 'Contact', to: '#' },
  ]

  return (
    <footer className="mt-12 bg-white border-t border-gray-200">
      <div className="h-[3px] bg-gradient-to-r from-orange-500 via-orange-400 to-teal-500" />
      <div className="mx-auto w-full max-w-screen-xl px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid gap-8 lg:grid-cols-[1.3fr,1fr,1fr,1fr] items-start">
          <div className="space-y-3">
            <h3 className="text-2xl font-extrabold text-gray-900">Gyoji</h3>
            <p className="text-sm text-gray-600 max-w-xs">
              Train smarter, eat better, and stay motivated with certified experts by your side.
            </p>
            <div className="flex items-center gap-2">
              {socials.map(({ name, href, icon }) => (
                <a
                  key={name}
                  href={href}
                  aria-label={name}
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-gray-200 text-gray-600 transition hover:border-orange-400 hover:text-orange-500"
                >
                  {icon}
                </a>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wide text-gray-500">Platform</h4>
            <ul className="mt-3 space-y-2 text-sm text-gray-600">
              {primaryLinks.map(link => (
                <li key={link.label}>
                  <Link to={link.to} className="transition hover:text-orange-500">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wide text-gray-500">Support</h4>
            <ul className="mt-3 space-y-2 text-sm text-gray-600">
              {supportLinks.map(link => (
                <li key={link.label}>
                  <a href={link.to} className="transition hover:text-orange-500">
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wide text-gray-500">Company</h4>
            <ul className="mt-3 space-y-2 text-sm text-gray-600">
              {companyLinks.map(link => (
                <li key={link.label}>
                  <a href={link.to} className="transition hover:text-orange-500">
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-8 flex flex-col gap-3 border-t border-gray-200 pt-4 text-sm text-gray-500 md:flex-row md:items-center md:justify-between">
          <p>&copy; {new Date().getFullYear()} Gyoji. All rights reserved.</p>
          <div className="flex gap-4">
            <a href="#" className="hover:text-orange-500">Privacy</a>
            <a href="#" className="hover:text-orange-500">Terms</a>
            <a href="#" className="hover:text-orange-500">Cookies</a>
          </div>
        </div>
      </div>
    </footer>
  )
}
