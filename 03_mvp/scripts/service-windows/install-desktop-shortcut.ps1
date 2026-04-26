# install-desktop-shortcut.ps1
# Issue S4.08 (#155).
# Cree un raccourci Bureau "Cockpit aiCEO" qui ouvre http://localhost:4747/
# dans le navigateur par defaut. Pas d'admin requis.
#
# Usage :
#   pwsh -File install-desktop-shortcut.ps1 install
#   pwsh -File install-desktop-shortcut.ps1 uninstall
#   pwsh -File install-desktop-shortcut.ps1 status

param(
    [Parameter(Position=0)]
    [ValidateSet('install','uninstall','status','help')]
    [string]$Action = 'help',
    [int]$Port = 4747
)

$ErrorActionPreference = "Stop"

$WshShell    = New-Object -ComObject WScript.Shell
$desktop     = [Environment]::GetFolderPath('Desktop')
$shortcutPath = Join-Path $desktop "Cockpit aiCEO.lnk"
$url         = "http://localhost:$Port/"

# Icon : cherche d'abord une icone livree, sinon fallback browser
$iconCandidates = @(
    "C:\_workarea_local\aiCEO\02_design-system\assets\icons\aiceo.ico",
    "C:\_workarea_local\aiCEO\03_mvp\public\assets\icons\aiceo.ico",
    "C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe",
    "C:\Program Files\Google\Chrome\Application\chrome.exe"
)
$iconPath = $null
foreach ($c in $iconCandidates) {
    if (Test-Path $c) { $iconPath = $c; break }
}

switch ($Action) {

    'install' {
        $shortcut = $WshShell.CreateShortcut($shortcutPath)
        $shortcut.TargetPath  = $url
        $shortcut.Description = "Cockpit aiCEO - copilote executif (S4.08)"
        if ($iconPath) {
            $shortcut.IconLocation = "$iconPath, 0"
        }
        $shortcut.Save()
        Write-Host "[OK] Raccourci installe : $shortcutPath" -Fore Green
        Write-Host "     Cible : $url"
        if ($iconPath) {
            Write-Host "     Icone : $iconPath"
        } else {
            Write-Host "     Icone : aucune trouvee, fallback systeme"
        }
        Write-Host ""
        Write-Host "Note : le serveur doit tourner sur le port $Port pour que ca fonctionne."
        Write-Host "       Verifie avec : Get-NetTCPConnection -LocalPort $Port"
    }

    'uninstall' {
        if (Test-Path $shortcutPath) {
            Remove-Item $shortcutPath -Force
            Write-Host "[OK] Raccourci supprime : $shortcutPath" -Fore Green
        } else {
            Write-Host "[INFO] Raccourci absent, rien a faire." -Fore Yellow
        }
    }

    'status' {
        if (Test-Path $shortcutPath) {
            $item = Get-Item $shortcutPath
            $sc   = $WshShell.CreateShortcut($shortcutPath)
            Write-Host "[OK] Raccourci installe" -Fore Green
            Write-Host "     Path     : $shortcutPath"
            Write-Host "     Modifie  : $($item.LastWriteTime)"
            Write-Host "     Target   : $($sc.TargetPath)"
            Write-Host "     Icon     : $($sc.IconLocation)"
        } else {
            Write-Host "[INFO] Raccourci absent" -Fore Yellow
            Write-Host "       Lance : pwsh -File $PSCommandPath install"
        }

        # Bonus : verifie que le serveur ecoute
        $conn = Get-NetTCPConnection -LocalPort $Port -ErrorAction SilentlyContinue
        if ($conn) {
            Write-Host ""
            Write-Host "[OK] Serveur ecoute sur :$Port" -Fore Green
            Write-Host "     Test : curl http://localhost:$Port/api/health"
        } else {
            Write-Host ""
            Write-Host "[WARN] Aucun process n'ecoute sur :$Port" -Fore Yellow
            Write-Host "       Le raccourci ouvrira un navigateur sur une URL morte."
            Write-Host "       Demarre le serveur : cd 03_mvp ; npm start"
            Write-Host "       Ou via wrapper logon : .\start-aiCEO-at-logon.ps1"
        }
    }

    default {
        Write-Host "Usage: install-desktop-shortcut.ps1 {install|uninstall|status} [-Port 4747]"
        Write-Host ""
        Write-Host "  install   Cree 'Cockpit aiCEO.lnk' sur le Bureau."
        Write-Host "  uninstall Supprime le raccourci."
        Write-Host "  status    Affiche etat raccourci + serveur."
        Write-Host ""
        Write-Host "Bureau cible :"
        Write-Host "  $desktop"
    }
}
