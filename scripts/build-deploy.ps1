[CmdletBinding()]
param(
    [string]$ImageName = 'colony-web',
    [string]$ImageTag = 'latest',
    [string]$OutputDir = 'deployment-artifacts',
    [switch]$SkipWar,
    [switch]$SkipDocker,
    [switch]$NoDockerSave
)

$ErrorActionPreference = 'Stop'

$RootDir = Split-Path -Parent $PSScriptRoot
$ApiDir = Join-Path $RootDir 'colony-api'
$WebDir = Join-Path $RootDir 'colony-web'

if ([System.IO.Path]::IsPathRooted($OutputDir)) {
    $OutputPath = $OutputDir
}
else {
    $OutputPath = Join-Path $RootDir $OutputDir
}

function Require-Command {
    param([string]$Name)
    if (-not (Get-Command $Name -ErrorAction SilentlyContinue)) {
        throw "Required command '$Name' was not found on PATH."
    }
}

New-Item -ItemType Directory -Force -Path $OutputPath | Out-Null
$artifacts = New-Object System.Collections.Generic.List[string]

if (-not $SkipWar) {
    Require-Command 'mvn'
    Write-Host 'Building backend WAR...'
    Push-Location $ApiDir
    try {
        & mvn -DskipTests package
        if ($LASTEXITCODE -ne 0) {
            throw "Maven package failed with code $LASTEXITCODE"
        }
    }
    finally {
        Pop-Location
    }

    $warSource = Join-Path $ApiDir 'target/colonyconnectapi.war'
    if (-not (Test-Path $warSource)) {
        throw "Expected WAR was not created: $warSource"
    }

    $warTarget = Join-Path $OutputPath 'colonyconnectapi.war'
    Copy-Item -Path $warSource -Destination $warTarget -Force
    $artifacts.Add($warTarget)
    Write-Host "WAR: $warTarget"
}

if (-not $SkipDocker) {
    Require-Command 'docker'
    $previousErrorActionPreference = $ErrorActionPreference
    $ErrorActionPreference = 'Continue'
    try {
        & docker info *> $null
        $dockerInfoExitCode = $LASTEXITCODE
    }
    finally {
        $ErrorActionPreference = $previousErrorActionPreference
    }

    if ($dockerInfoExitCode -ne 0) {
        throw 'Docker daemon is not available. Start Docker Desktop and retry, or run with -SkipDocker to build only the WAR.'
    }

    $fullImageName = "$ImageName`:$ImageTag"
    Write-Host "Building frontend Docker image $fullImageName..."
    Push-Location $WebDir
    try {
        & docker build -t $fullImageName .
        if ($LASTEXITCODE -ne 0) {
            throw "Docker build failed with code $LASTEXITCODE"
        }
    }
    finally {
        Pop-Location
    }

    if (-not $NoDockerSave) {
        $safeImageName = ($ImageName -replace '[\\/:]', '_')
        $safeImageTag = ($ImageTag -replace '[\\/:]', '_')
        $dockerTar = Join-Path $OutputPath "$safeImageName-$safeImageTag.tar"
        Write-Host "Saving Docker image to $dockerTar..."
        & docker save -o $dockerTar $fullImageName
        if ($LASTEXITCODE -ne 0) {
            throw "Docker save failed with code $LASTEXITCODE"
        }
        $artifacts.Add($dockerTar)
        Write-Host "Docker image tar: $dockerTar"
    }
}

$manifest = Join-Path $OutputPath 'manifest.txt'
$manifestLines = @(
    "Build time: $(Get-Date -Format o)",
    "Backend WAR skipped: $SkipWar",
    "Frontend Docker skipped: $SkipDocker",
    "Docker image: $ImageName`:$ImageTag",
    'Artifacts:'
) + ($artifacts | ForEach-Object { "- $_" })
Set-Content -Path $manifest -Value $manifestLines -Encoding UTF8

Write-Host "Manifest: $manifest"
Write-Host 'Deployment artifact build completed.'
