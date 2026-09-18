'use client';

const GITHUB_URL = 'https://github.com/VVVULTURE/Red-Stealth';

export default function Footer() {
  return (
    <footer className="border-t border-dark-700/50 bg-dark-950/80 backdrop-blur-sm mt-16">
      <div className="container mx-auto px-4 max-w-7xl py-12">
        <div className="grid md:grid-cols-3 gap-10">
          {/* Brand */}
          <div>
            <h3 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
              &#x1f977; StealthHumanizer
            </h3>
            <p className="text-dark-400 text-sm leading-relaxed">
              Free, open-source AI text humanizer. Transform AI-generated content into natural, human-like writing with multiple AI providers.
            </p>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-dark-300 uppercase tracking-wider mb-4">Project</h4>
            <a href={GITHUB_URL} target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-dark-400 hover:text-accent-400 transition-colors">
              <span aria-hidden="true" className="text-base leading-none">↗</span> GitHub
            </a>
          </div>

          <div className="md:text-right">
            <p className="text-dark-500 text-xs">Source code, issues, and releases are maintained in the project repository.</p>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-dark-800/50 flex flex-col md:flex-row items-center justify-between gap-3 text-xs text-dark-500">
          <p>&copy; {new Date().getFullYear()} StealthHumanizer. Open source under MIT License.</p>
          <div className="flex gap-4">
            <span className="flex items-center gap-1">&#x1f512; No data stored</span>
            <span className="flex items-center gap-1">&#x1f310; Privacy first</span>
            <span className="flex items-center gap-1">&#x26a1; Free forever</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
