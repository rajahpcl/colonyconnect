[CmdletBinding()]
param(
    [int]$FrontendPort = 5173,
    [int]$ApiPort = 8082,
    [string]$HostName = '127.0.0.1'
)

$ErrorActionPreference = 'Stop'

$RootDir = Split-Path -Parent $PSScriptRoot
$ApiDir = Join-Path $RootDir 'colony-api'
$WebDir = Join-Path $RootDir 'colony-web'
$ApiTarget = "http://$HostName`:$ApiPort"

function Require-Command {
    param([string]$Name)
    if (-not (Get-Command $Name -ErrorAction SilentlyContinue)) {
        throw "Required command '$Name' was not found on PATH."
    }
}

function Receive-JobOutput {
    param([System.Management.Automation.Job]$Job)

    $jobErrors = @()
    Receive-Job -Job $Job -ErrorAction SilentlyContinue -ErrorVariable jobErrors |
        ForEach-Object { Write-Host "[$($Job.Name)] $_" }

    foreach ($jobError in $jobErrors) {
        Write-Host "[$($Job.Name)] $($jobError.ToString())"
    }
}

Require-Command 'mvn'
Require-Command 'npm'

Write-Host "Starting ColonyConnect API on $ApiTarget"
Write-Host "Starting ColonyConnect web on http://$HostName`:$FrontendPort/colonyconnect/"
Write-Host "Vite will proxy /colonyconnectapi to $ApiTarget"
Write-Host "Press Ctrl+C to stop both processes."

$apiJob = Start-Job -Name 'colony-api' -ScriptBlock {
    param($Directory, $Port)
    Set-Location $Directory
    $env:SERVER_PORT = [string]$Port
    & mvn spring-boot:run
    if ($LASTEXITCODE -ne 0) {
        throw "colony-api exited with code $LASTEXITCODE"
    }
} -ArgumentList $ApiDir, $ApiPort

$webJob = Start-Job -Name 'colony-web' -ScriptBlock {
    param($Directory, $HostName, $Port, $Target)
    Set-Location $Directory
    $env:VITE_API_TARGET = $Target
    & npx --no-install vite --host $HostName --port $Port --strictPort
    if ($LASTEXITCODE -ne 0) {
        throw "colony-web exited with code $LASTEXITCODE"
    }
} -ArgumentList $WebDir, $HostName, $FrontendPort, $ApiTarget

$jobs = @($apiJob, $webJob)

try {
    while ($true) {
        foreach ($job in $jobs) {
            Receive-JobOutput -Job $job

            if ($job.State -in @('Completed', 'Failed', 'Stopped')) {
                Receive-JobOutput -Job $job
                throw "Process '$($job.Name)' stopped with state $($job.State)."
            }
        }
        Start-Sleep -Milliseconds 500
    }
}
finally {
    foreach ($job in $jobs) {
        if ($job.State -eq 'Running') {
            Stop-Job -Job $job -ErrorAction SilentlyContinue
        }
        Remove-Job -Job $job -Force -ErrorAction SilentlyContinue
    }
}
