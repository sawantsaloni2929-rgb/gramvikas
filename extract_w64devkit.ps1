$zip = "$env:TEMP\w64devkit.zip"
$dest = "$env:USERPROFILE\w64devkit"

Write-Host "Extracting w64devkit for C/C++..."
Expand-Archive -Path $zip -DestinationPath "$env:USERPROFILE" -Force

Write-Host "Configuring PATH..."
$gccPath = "$dest\bin"
[Environment]::SetEnvironmentVariable("Path", $env:Path + ";$gccPath", [EnvironmentVariableTarget]::User)
$env:Path = "$gccPath;$env:Path"

Write-Host "Verifying GCC and G++..."
& "$dest\bin\gcc.exe" --version
& "$dest\bin\g++.exe" --version
Write-Host "C and C++ compilers are ready!"
