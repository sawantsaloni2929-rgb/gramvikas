$zip = "$env:TEMP\jdk17.zip"
$extractTemp = "$env:TEMP\jdk17_extracted"
$dest = "$env:USERPROFILE\jdk17"

Write-Host "Extracting JDK 17 archive..."
Expand-Archive -Path $zip -DestinationPath $extractTemp -Force

$firstFolder = Get-ChildItem -Path $extractTemp -Directory | Select-Object -First 1
Write-Host "Found inner folder: $($firstFolder.FullName)"

New-Item -ItemType Directory -Path $dest -Force | Out-Null
Copy-Item -Path "$($firstFolder.FullName)\*" -Destination $dest -Recurse -Force

Write-Host "Testing Java..."
& "$dest\bin\java.exe" -version
& "$dest\bin\javac.exe" -version

Write-Host "Java 17 is ready at $dest!"
