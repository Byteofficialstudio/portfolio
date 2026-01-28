$base='http://localhost:8000'
$html=(Invoke-WebRequest $base -UseBasicParsing -TimeoutSec 10).Content
$matches1=[regex]::Matches($html,'(?:src|href)="([^"]+)"')
$matches2=[regex]::Matches($html,"(?:src|href)='([^']+)'")
$urls1 = $matches1 | ForEach-Object { $_.Groups[1].Value }
$urls2 = $matches2 | ForEach-Object { $_.Groups[1].Value }
$urls = ($urls1 + $urls2) | Sort-Object -Unique
$out = 'asset-check.txt'
"Found $($urls.Count) referenced URLs:" | Out-File $out
foreach($u in $urls) {
    if($u -match '^(http|https)') { $full=$u }
    elseif($u.StartsWith('/')) { $full=$base.TrimEnd('/')+$u }
    else { $full=$base.TrimEnd('/') + '/' + $u.TrimStart('/') }
    try {
        $r=Invoke-WebRequest -Uri $full -Method Head -UseBasicParsing -TimeoutSec 10 -ErrorAction Stop
        $status=$r.StatusCode
    } catch {
        try {
            $r=Invoke-WebRequest -Uri $full -UseBasicParsing -TimeoutSec 10 -ErrorAction Stop
            $status=$r.StatusCode
        } catch {
            $status = "ERROR: $($_.Exception.Message)"
        }
    }
    "$full => $status" | Out-File $out -Append
}
Write-Output "Wrote $out"
