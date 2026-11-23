'use strict';
// Package-manager commands. Managers that need sudo are never run with a password
// prompt: they run only if sudo works without one, otherwise the user runs them.

const SUDO = new Set(['apt', 'dnf', 'pacman', 'zypper']);

function command(manager, id) {
  switch (manager) {
    case 'winget': return ['winget', ['install', '--id', id, '--exact', '--silent', '--accept-package-agreements', '--accept-source-agreements', '--disable-interactivity']];
    case 'scoop': return ['scoop', ['install', id]];
    case 'brew': return id.startsWith('cask:') ? ['brew', ['install', '--cask', id.slice(5)]] : ['brew', ['install', id]];
    case 'apt': return ['apt-get', ['install', '-y', id]];
    case 'dnf': return ['dnf', ['install', '-y', id]];
    case 'pacman': return ['pacman', ['-S', '--needed', '--noconfirm', id]];
    case 'zypper': return ['zypper', ['--non-interactive', 'install', id]];
    case 'flatpak': return ['flatpak', ['install', '-y', '--user', 'flathub', id]];
    case 'psgallery': return ['powershell', ['-NoProfile', '-Command', `Install-Module ${id} -Scope CurrentUser -Force -AllowClobber`]];
    case 'pwsh-gallery': return ['pwsh', ['-NoProfile', '-Command', `Install-Module ${id} -Scope CurrentUser -Force -AllowClobber`]];
    case 'git': {
      // id: "<repo-url> <~/dest>"
      const [url, dest] = id.split(/\s+/);
      if (!url || !dest) throw new Error('git installs need "<url> <~/dest>"');
      return ['git', ['clone', '--depth', '1', url, dest]];
    }
    default: throw new Error(`unknown package manager "${manager}"`);
  }
}

const needsSudo = (manager) => SUDO.has(manager);

function display(manager, id) {
  const [cmd, args] = command(manager, id);
  return `${needsSudo(manager) ? 'sudo ' : ''}${cmd} ${args.map((a) => (/\s/.test(a) ? `"${a}"` : a)).join(' ')}`;
}

module.exports = { command, needsSudo, display };
