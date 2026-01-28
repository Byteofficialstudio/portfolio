$html = Get-Content -Raw -Path .\index.html
$matches1=[regex]::Matches($html,'(?:src|href)="([^"]+)"')
$matches2=[regex]::Matches($html,"(?:src|href)='([^']+)'")
$urls = @()
$urls += $matches1 | ForEach-Object { $_.Groups[1].Value }
$urls += $matches2 | ForEach-Object { $_.Groups[1].Value }
$urls = $urls | Sort-Object -Unique
$out = 'asset-fs-check.txt'
"Found $($urls.Count) referenced URLs:" | Out-File $out
foreach($u in $urls) {
    if($u -match '^(http|https)') {
        "$u => EXTERNAL" | Out-File $out -Append
        continue
    }
    $rel = $u.TrimStart('/')
    $full = Join-Path (Get-Location) $rel
    if(Test-Path $full) { "$u => EXISTS: $full" | Out-File $out -Append }
    else { "$u => MISSING: $full" | Out-File $out -Append }
}
Write-Output "Wrote $out"