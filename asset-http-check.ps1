$base='http://localhost:8000'
$out='asset-http-report.txt'
try {
    $resp = Invoke-WebRequest -Uri $base -UseBasicParsing -TimeoutSec 10 -ErrorAction Stop
    $html = $resp.Content
} catch {
    "$base => ERROR: $($_.Exception.Message)" | Out-File $out
    Write-Output "Wrote $out"
    exit 1
}
$matches1 = [regex]::Matches($html,'(?:src|href)="([^"]+)"')
$matches2 = [regex]::Matches($html,"(?:src|href)='([^']+)'")
$urls = @()
$urls += $matches1 | ForEach-Object { $_.Groups[1].Value }
$urls += $matches2 | ForEach-Object { $_.Groups[1].Value }
$urls = $urls | Sort-Object -Unique
"Found $($urls.Count) referenced URLs from $base" | Out-File $out
foreach ($u in $urls) {
    if ($u -match '^(http|https)') { $full = $u }
    elseif ($u.StartsWith('/')) { $full = $base.TrimEnd('/') + $u }
    else { $full = $base.TrimEnd('/') + '/' + $u.TrimStart('/') }
    try {
        $r = Invoke-WebRequest -Uri $full -Method Head -UseBasicParsing -TimeoutSec 10 -ErrorAction Stop
        $status = $r.StatusCode
    } catch {
        $status = "ERROR: $($_.Exception.Message)"
    }
    "$full => $status" | Out-File $out -Append
}
Write-Output "Wrote $out"