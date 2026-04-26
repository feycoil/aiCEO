# install-startup-shortcut.ps1
# Variante D retenue par ADR S3.10 (cf. ADR-S3-10-template.md).
# Cree un raccourci dans le Startup folder du profil utilisateur
# qui lance start-aiCEO-at-logon.ps1 au logon Windows.
#
# Pas d'admin requis (profil utilisateur uniquement).
#
# Usage :
#   pwsh ou powershell -File scripts\service-windows\install-startup-shortcut.ps1 install
#   pwsh ou powershell -File scripts\service-windows\install-startup-shortcut.ps1 uninstall
#   pwsh ou powershell -File scripts\service-windows\install-startup-shortcut.ps1 status

param(
    [Parameter(Position=0)]
    [ValidateSet('install', 'uninstall', 'status', 'help')]
    [string]$Action = 'help'
)

$ErrorActionPreference = "Stop"

$WshShell      = New-Object -ComObject WScript.Shell
$startupFolder = [Environment]::GetFolderPath('Startup')
$shortcutPath  = Join-Path $startupFolder "aiCEO-Server.lnk"
$wrapperPath   = "C:\_workarea_local\aiCEO\03_mvp\scripts\service-windows\start-aiCEO-at-logon.ps1"

switch ($Action) {

    'install' {
        if (-not (Test-Path $wrapperPath)) {
            Write-Host "[KO] Wrapper introuvable : $wrapperPath" -Fore Red
            exit 1
        }
        $shortcut = $WshShell.CreateShortcut($shortcutPath)
        $shortcut.TargetPath       = "powershell.exe"
        $shortcut.Arguments        = "-ExecutionPolicy Bypass -WindowStyle Hidden -File `"$wrapperPath`""
        $shortcut.WorkingDirectory = "C:\_workarea_local\aiCEO\03_mvp"
        $shortcut.WindowStyle      = 7   # Minimized (.lnk ne supporte pas 0=Hidden)
        $shortcut.Description      = "aiCEO copilote - demarrage serveur au logon"
        $shortcut.Save()
        Write-Host "[OK] Raccourci installe : $shortcutPath" -Fore Green
        Write-Host "     Le serveur demarrera automatiquement au prochain logon Windows."
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
            Write-Host "     Args     : $($sc.Arguments)"
            Write-Host "     Cwd      : $($sc.WorkingDirectory)"
        } else {
            Write-Host "[INFO] Raccourci absent" -Fore Yellow
            Write-Host "       Lance : pwsh -File $PSCommandPath install"
        }
    }

    default {
        Write-Host "Usage: install-startup-shortcut.ps1 {install|uninstall|status}"
        Write-Host ""
        Write-Host "  install   Cree aiCEO-Server.lnk dans le Startup folder."
        Write-Host "  uninstall Supprime le raccourci (le serveur ne demarre plus au logon)."
        Write-Host "  status    Affiche l'etat actuel + chemin + cible du raccourci."
        Write-Host ""
        Write-Host "Repertoire Startup folder de ce profil :"
        Write-Host "  $startupFolder"
    }
}
