import { Link } from 'react-router-dom'

export default function Footer() {
  return (
    <footer className="border-t mt-10">
      <div className="mx-auto max-w-6xl px-4 py-8 grid gap-6 md:grid-cols-4 text-sm">
        <div>
          <p className="font-bold">Gyoji</p>
          <p className="text-neutral-600 dark:text-neutral-400 mt-2">Your all-in-one fitness companion.</p>
        </div>
        <div>
          <p className="font-semibold mb-2">Product</p>
          <ul className="space-y-1">
            <li><Link to="/workouts">Workouts</Link></li>
            <li><Link to="/nutrition">Nutrition</Link></li>
            <li><Link to="/store">Store</Link></li>
          </ul>
        </div>
        <div>
          <p className="font-semibold mb-2">Resources</p>
          <ul className="space-y-1">
            <li><Link to="/calculator">Calculators</Link></li>
            <li><a href="#trainers">Find Trainers</a></li>
          </ul>
        </div>
        <div>
          <p className="font-semibold mb-2">Company</p>
          <ul className="space-y-1">
            <li><a>About</a></li>
            <li><a>Contact</a></li>
          </ul>
        </div>
      </div>
      <div className="text-xs text-center text-neutral-600 dark:text-neutral-400 pb-6">© {new Date().getFullYear()} Gyoji. All rights reserved.</div>
    </footer>
  )
}
