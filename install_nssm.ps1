# PowerShell script to download and extract NSSM, and add it to PATH
# Run as administrator for best results

$nssmUrl = "https://nssm.cc/release/nssm-2.24.zip"
$dest = "$env:TEMP\nssm.zip"
$extractDir = "$env:ProgramFiles\nssm"

Write-Host "Downloading NSSM from $nssmUrl..."
Invoke-WebRequest -Uri $nssmUrl -OutFile $dest

Write-Host "Extracting NSSM to $extractDir..."
Expand-Archive -Path $dest -DestinationPath $extractDir -Force

# Add to PATH (system-wide)
$binPath = "$extractDir\nssm-2.24\win64"
if (-not ($env:Path -split ';' | Where-Object { $_ -eq $binPath })) {
    [Environment]::SetEnvironmentVariable("Path", $env:Path + ";$binPath", [EnvironmentVariableTarget]::Machine)
    Write-Host "Added $binPath to system PATH. You may need to restart your terminal or computer."
} else {
    Write-Host "$binPath already in PATH."
}

Write-Host "NSSM is ready. Installing backend and dashboard services..."

# Run backend and dashboard service installers
Start-Process -FilePath "install_backend_service_windows.bat" -Verb RunAs -Wait
Start-Process -FilePath "install_dashboard_service_windows.bat" -Verb RunAs -Wait

Write-Host "Backend and dashboard services installed and started. Both will now start automatically at boot."
